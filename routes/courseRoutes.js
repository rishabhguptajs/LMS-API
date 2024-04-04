import express from "express"
import { Resend } from "resend"
import sql from "../config/config.js" // Import the PostgreSQL client instance
import { verifyToken, verifySuperadmin } from "../middlewares/authMiddleware.js" // Import authentication middleware

const router = express.Router()
const resend = new Resend(process.env.RESEND_API)

// Get Courses with filtering and pagination
router.get("/filter", verifyToken, async (req, res) => {
  try {
    const { category, level, popularity, page, limit } = req.query

    // Construct SQL query based on filtering and pagination parameters
    let query = sql`SELECT * FROM courses`
    let queryParams = []

    // Filter courses by category, level, and/or popularity if provided
    if (category) {
      query.append(sql` WHERE category = ${category}`)
    }
    if (level) {
      query.append(sql` AND level = ${level}`)
    }
    if (popularity) {
      query.append(sql` AND popularity >= ${popularity}`)
    }

    // Paginate results
    if (page && limit) {
      const offset = (parseInt(page) - 1) * parseInt(limit)
      query.append(sql` LIMIT ${limit} OFFSET ${offset}`)
    }

    // Execute the query
    const courses = await query

    res.status(200).json(courses)
  } catch (error) {
    console.error("Error fetching courses:", error)
    res.status(500).json({ message: "Server Error" })
  }
})

// Create a new course (Superadmin only)
router.post("/new", verifyToken, verifySuperadmin, async (req, res) => {
  try {
    const { title, description, category, level, popularity } = req.body

    // Insert new course into the database
    await sql`
      INSERT INTO courses (title, description, category, level, popularity)
      VALUES (${title}, ${description}, ${category}, ${level}, ${popularity})
    `

    res.status(201).json({ message: "Course created successfully" })
  } catch (error) {
    console.error("Error creating course:", error)
    res.status(500).json({ message: "Server Error" })
  }
})

// Update course by ID (Superadmin only)
router.put("/update/:id", verifyToken, verifySuperadmin, async (req, res) => {
  try {
    const courseId = req.params.id
    const { title, description, category, level, popularity } = req.body

    // Update course in the database
    await sql`
      UPDATE courses
      SET title = ${title}, description = ${description}, category = ${category}, level = ${level}, popularity = ${popularity}
      WHERE id = ${courseId}
    `

    res.status(200).json({ message: "Course updated successfully" })
  } catch (error) {
    console.error("Error updating course:", error)
    res.status(500).json({ message: "Server Error" })
  }
})

// Delete course by ID (Superadmin only)
router.delete(
  "/delete/:id",
  verifyToken,
  verifySuperadmin,
  async (req, res) => {
    try {
      const courseId = req.params.id

      // Delete course from the database
      await sql`
      DELETE FROM courses WHERE id = ${courseId}
    `

      res.status(200).json({ message: "Course deleted successfully" })
    } catch (error) {
      console.error("Error deleting course:", error)
      res.status(500).json({ message: "Server Error" })
    }
  }
)

// Course Enrollment
router.post("/enroll", verifyToken, async (req, res) => {
  try {
    const { courseId } = req.body
    const userEmail = req.user.email

    // Check if user is already enrolled in the course
    const existingEnrollment = await sql`
      SELECT * FROM enrollments WHERE user_email = ${userEmail} AND course_id = ${courseId}
    `

    if (existingEnrollment.length > 0) {
      return res
        .status(400)
        .json({ message: "User is already enrolled in the course" })
    }

    // Insert new enrollment record into the database
    await sql`
      INSERT INTO enrollments (user_email, course_id)
      VALUES (${userEmail}, ${courseId})
    `

    res.status(201).json({ message: "Course enrollment successful" })

    resend.emails.send({
      from: "rishabhgupta4523@gmail.com",
      to: userEmail,
      subject: "Course Enrollment",
      html: `You have successfully enrolled in a course with ID: ${courseId}`,
    })
  } catch (error) {
    console.error("Error enrolling in course:", error)
    res.status(500).json({ message: "Server Error" })
  }
})

// View Enrolled Courses
router.get("/enrolled", verifyToken, async (req, res) => {
  try {
    const userEmail = req.user.email

    // Query the database to get courses enrolled by the user
    const enrolledCourses = await sql`
      SELECT c.title, c.description, c.category, c.level, c.popularity
      FROM courses c
      INNER JOIN enrollments e ON c.id = e.course_id
      WHERE e.user_email = ${userEmail}
    `

    res.status(200).json(enrolledCourses)
  } catch (error) {
    console.error("Error fetching enrolled courses:", error)
    res.status(500).json({ message: "Server Error" })
  }
})

export default router
