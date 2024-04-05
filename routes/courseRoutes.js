import express from "express"
import { Resend } from "resend"
import sql from "../config/config.js"
import { verifyToken, verifySuperadmin } from "../middlewares/authMiddleware.js"

const router = express.Router()
const resend = new Resend(process.env.RESEND_API)

// first create a course table
async function createCoursesTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        level TEXT NOT NULL,
        popularity INT NOT NULL
      )`
    console.log("Courses table created or already exists")
  } catch (error) {
    console.error("Error creating courses table:", error)
  }
}

async function createEnrollmentsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        user_email TEXT NOT NULL,
        course_id INT NOT NULL,
        FOREIGN KEY (user_email) REFERENCES users(email),
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )`
    console.log("Enrollments table created or already exists")
  } catch (error) {
    console.error("Error creating enrollments table:", error)
  }
}

createCoursesTable()
createEnrollmentsTable()

// get Courses with filtering and pagination
router.get("/filter", verifyToken, async (req, res) => {
  try {
    const { category, level, popularity, page, limit } = req.query

    let query = []

    let conditions = []

    if (category) {
      conditions.push(sql`category = ${category}`)
    }
    if (level) {
      conditions.push(sql`level = ${level}`)
    }
    if (popularity) {
      conditions.push(sql`popularity >= ${popularity}`)
    }

    if (conditions.length > 0) {
      query.append(sql` WHERE ${sql.join(conditions, sql` AND `)}`)
    }

    if (page && limit) {
      const offset = (parseInt(page) - 1) * parseInt(limit)
      query.append(sql` LIMIT ${limit} OFFSET ${offset}`)
    }

    res.status(200).json(courses)
  } catch (error) {
    console.error("Error fetching courses:", error)
    res
      .status(500)
      .json({ message: "Server Error while filtering the courses!" })
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
    res.status(500).json({ message: "Server Error while creating the course!" })
  }
})

// get all the courses from db

router.get('/all', verifyToken, async (req, res) => {
  try {
    const courses = await sql`
      SELECT * FROM courses
    `
    res.status(200).json(courses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    res.status(500).json({ message: 'Server Error while fetching courses!' })
  }
});

router.get(
  "/course/details/:id",
  verifyToken,
  async (req, res) => {
    try {
      const courseID = req.params.id

      const course = await sql`
      SELECT * FROM courses WHERE id = ${courseID}
    `

      if (course.length === 0) {
        return res.status(404).json({ message: "Course not found" })
      }

      res.status(200).json(course[0])
    } catch (error) {
      console.error("Error fetching course details:", error)
      res
        .status(500)
        .json({
          message:
            "Server Error while fetching single course details using id!",
        })
    }
  }
)

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
    res.status(500).json({ message: "Server Error while updating the course!" })
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
      res
        .status(500)
        .json({
          message: "Server Error while deleting the course using its id!",
        })
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
        .json({ message: "You are already enrolled in the course" })
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
    res
      .status(500)
      .json({ message: "Server Error while enrolling in a course!" })
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
    res
      .status(500)
      .json({ message: "Server Error while fetching enrolled courses!" })
  }
})

export default router
