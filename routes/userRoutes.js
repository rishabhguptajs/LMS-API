import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import sql from "../config/config.js" // Import the PostgreSQL client instance
import { verifyToken } from "../middlewares/authMiddleware.js"

const router = express.Router()

// Get user profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    // Get user details from JWT token
    const email = req.user.email

    // Query the database to get user profile details
    const userProfile = await sql`
      SELECT name, email, profile_picture, other_details FROM users WHERE email = ${email}
    `

    if (userProfile.length === 0) {
      return res.status(404).json({ message: "User profile not found" })
    }

    res.status(200).json(userProfile[0])
  } catch (error) {
    console.error("Error fetching user profile:", error)
    res
      .status(500)
      .json({ message: "Server Error while fetching the user profile!" })
  }
})

// Update user profile
router.put("/update", verifyToken, async (req, res) => {
  try {
    const email = req.user.email
    const { name, profile_picture, other_details } = req.body

    await sql`
      UPDATE users
      SET name = ${name}, profile_picture = ${profile_picture}, other_details = ${other_details}
      WHERE email = ${email}
    `

    res.status(200).json({
      message: "User profile updated successfully",
      name,
      profile_picture,
      other_details,
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    res
      .status(500)
      .json({ message: "Server Error while updating the user profile!" })
  }
})

export default router
