import express from "express"
import { Resend } from "resend"
import sql from "../config/config.js"
import { verifyToken, verifySuperadmin } from "../middlewares/authMiddleware.js"

const router = express.Router()
const resend = new Resend(process.env.RESEND_API)

// get Courses with filtering and pagination
router.get("/filter", verifyToken, async (req, res) => {
  try {
    const { category, level, popularity } = req.body

    // query the database to get courses based on filters
    if(category && level && popularity){
      const courses = await sql`
        SELECT * FROM courses WHERE category = ${category} AND level = ${level} AND popularity = ${popularity}
      `
      if(courses.length === 0){
        return res.status(404).json({ message: "No courses found with these filters!" })
      } else {
        return res.status(200).json(courses)
      }
    }

    if(category && level){
      const courses = await sql`
        SELECT * FROM courses WHERE category = ${category} AND level = ${level}
      `
      if(courses.length === 0){
        return res.status(404).json({ message: "No courses found with these filters!" })
      } else {
        return res.status(200).json(courses)
      }
    }

    if(category && popularity){
      const courses = await sql`
        SELECT * FROM courses WHERE category = ${category} AND popularity = ${popularity}
      `
      if(courses.length === 0){
        return res.status(404).json({ message: "No courses found with these filters!" })
      } else {
        return res.status(200).json(courses)
      }
    }

    if(level && popularity){
      const courses = await sql`
        SELECT * FROM courses WHERE level = ${level} AND popularity = ${popularity}
      `
      if(courses.length === 0){
        return res.status(404).json({ message: "No courses found with these filters!" })
      } else {
        return res.status(200).json(courses)
      }
    }

    if(category){
      const courses = await sql`
        SELECT * FROM courses WHERE category = ${category}
      `
      if(courses.length === 0){
        return res.status(404).json({ message: "No courses found with these filters!" })
      } else {
        return res.status(200).json(courses)
      }
    }

    if(level){
      const courses = await sql`
        SELECT * FROM courses WHERE level = ${level}
      `
      if(courses.length === 0){
        return res.status(404).json({ message: "No courses found with these filters!" })
      } else {
        return res.status(200).json(courses)
      }
    }

    if(popularity){
      const courses = await sql`
        SELECT * FROM courses WHERE popularity = ${popularity}
      `
      if(courses.length === 0){
        return res.status(404).json({ message: "No courses found with these filters!" })
      } else {
        return res.status(200).json(courses)
      }
    }

    res.status(400).json({ message: "Please provide at least one filter!" })
  } catch (error) {
    console.error("Error fetching courses while filtering:", error)
    res.status(500).json({ message: "Server Error while filtering the courses!" })
  }
})

// create a new course (Superadmin only)
router.post("/new", verifyToken, verifySuperadmin, async (req, res) => {
  try {
    const { title, description, category, level, popularity } = req.body

    // insert a new course into the database
    await sql`
      INSERT INTO courses (title, description, category, level, popularity)
      VALUES (${title}, ${description}, ${category}, ${level}, ${popularity})
    `

    res.status(201).json({ 
      message: "Course created successfully",
      courseDetails:{
        title,
        description,
        category,
        level,
        popularity
      }
    })
  } catch (error) {
    console.error("Error creating course:", error)
    res.status(500).json({ message: "Server Error while creating the course!" })
  }
})

// get all the courses from db with pagination where only 2 courses are shown on each page
router.get('/all', verifyToken, async (req, res) => {
  try {
    const limit = 2;
    const page = req.query.page || 1;
    // we can send a query for page like this: http://localhost:5000/api/courses/all?page=2

    // limiting the number of courses to be shown on each page for better performance
    const courses = await sql`SELECT * FROM courses LIMIT ${limit} OFFSET ${(page - 1) * limit}`

    res.status(200).json(courses)
  } catch (error) {
    console.error("Error fetching courses:", error)
    res.status(500).json({ message: "Server Error while fetching the courses!" })
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
      res.status(500).json({
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

    // query the database to get courses enrolled by the user
    const enrolledCourses = await sql`
      SELECT c.title, c.description, c.category, c.level, c.popularity
      FROM courses c
      INNER JOIN enrollments e ON c.id = e.course_id
      WHERE e.user_email = ${userEmail}
    `

    if(enrolledCourses.length === 0){
      return res.status(404).json({ message: "No courses enrolled as of now!" })
    }

    res.status(200).json(enrolledCourses)
  } catch (error) {
    console.error("Error fetching enrolled courses:", error)
    res
      .status(500)
      .json({ message: "Server Error while fetching enrolled courses!" })
  }
})

export default router
