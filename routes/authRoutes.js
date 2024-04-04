import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import sql from "../config/config.js"
import cloudinary from '../config/cloudinaryConfig.js'
import { Resend } from "resend"
import { User } from "../models/userModel.js"

const router = express.Router()
const resend = new Resend(process.env.RESEND_API)

async function createUsersTable() {
  try {
    const { tableName, columns } = User;
    const columnDefinitions = Object.entries(columns).map(([columnName, columnDefinition]) => `${columnName} ${columnDefinition}`).join(', ');
    await sql.unsafe(`CREATE TABLE IF NOT EXISTS "${tableName}" (${columnDefinitions})`);
    console.log("Users table created or already exists");
  } catch (error) {
    console.error("Error creating users table:", error);
  }
}

createUsersTable();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already registered" })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Insert new user
    await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
    `

    res.status(201).json({
      message: "User registered successfully",
      email,
      name,
    })

    // Send welcome email
    await resend.emails.send({
      to: email,
      subject: "Welcome to our platform!",
      text: `Hi ${name},\n\nWelcome to our platform! We're excited to have you on board.`,
    })
  } catch (error) {
    console.error("Error registering user:", error)
    res.status(500).json({ message: "Server Error" })
  }
})

router.post('/upload', async (req, res) => {
  try {
    const { file } = JSON.parse(req.body); // Assuming the file is sent as a base64 string in the request body

    // Upload the image to Cloudinary
    const result = await cloudinary.uploader.upload(file, { upload_preset: 'your_upload_preset' });

    res.status(200).json({ url: result.secure_url }); // Return the secure URL of the uploaded image
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// User login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user with provided email exists
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email}
    `

    if (existingUser.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser[0].password
    )
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    })

    res.status(200).json({ token })
  } catch (error) {
    console.error("Error logging in:", error)
    res.status(500).json({ message: "Server Error" })
  }
})

export default router
