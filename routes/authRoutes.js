import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import sql from "../config/config.js"
import cloudinary from '../config/cloudinaryConfig.js'
import { Resend } from "resend"
import{ passwordStrength } from "check-password-strength"
import { verifyToken } from "../middlewares/authMiddleware.js"


const router = express.Router()
const resend = new Resend(`${process.env.RESEND_API}`)


router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already registered" })
    }

    // check password strength
    const passwordStrengthResult = passwordStrength(password).value
    if(passwordStrengthResult == 'Too weak') {
      return res.status(400).json({ message: "Password is too weak, try again!" })
    }
    if(passwordStrengthResult == 'Weak') {
      return res.status(400).json({ message: "Password is weak, try again!" })
    }

    // hash the password for security
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // insert a new user into db
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
   try {
    const res = await resend.emails.send({
      from: process.env.EMAIL_ADDRESS,
      to: [`${email}`],
      subject: "Welcome to our platform!",
      html: `Hi <strong>${name}!</strong>,\n\nWelcome to our platform! We're excited to have you on board.`,
    })

    console.log("Email sent successfully:", res)
   } catch (error) {
    console.error("Error sending welcome email:", error)
   }
  } catch (error) {
    console.error("Error registering user:", error)
    res.status(500).json({ message: "Server Error while registering the user!" })
  }
})

router.post('/upload', verifyToken, async (req, res) => {
  try {
    const { file_url } = req.body ;
    const result = await cloudinary.uploader.upload(file_url);

    await sql`
      UPDATE users SET profile_picture = ${result.secure_url} WHERE email = ${req.user.email}
    `

    res.status(200).json({ 
      image_url: result.secure_url,
      message: 'Image uploaded successfully!'
     }); // return the secure URL of the uploaded image
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Server Error while uploading image!' });
  }
});

// User login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // check if user with provided email exists
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email}
    `
    if (existingUser.length === 0) {
      return res.status(400).json({ message: "User not found!" })
    }

    // validate and compare the password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser[0].password
    )
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Wrong password!" })
    }

    const token = jwt.sign({ 
      email: existingUser[0].email,
      isSuperadmin: existingUser[0].issuperadmin,
    }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    })

    res.status(200).json({ token })
  } catch (error) {
    console.error("Error logging in:", error)
    res.status(500).json({ message: "Server Error while logging in!" })
  }
})

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user with provided email exists
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email}
    `

    if (existingUser.length === 0) {
      return res.status(400).json({ message: "User not found!" })
    }

    // generate password reset token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // send a password reset email to the user
    await resend.emails.send({
      to: email,
      subject: "Password Reset",
      text: `Hi ${existingUser[0].name},\n\nPlease click the link below to reset your password:\n\nCLIENT_URL/reset-password/${token}`,
    });

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ message: "Server Error while resetting password!" });
  }
});

export default router
