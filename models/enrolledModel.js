// first create an enrollments table
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

createEnrollmentsTable()

export const Enrollment = {
  tableName: "enrollments",
  columns: {
    id: "SERIAL PRIMARY KEY",
    user_id: "INT REFERENCES users(id)",
    course_id: "INT REFERENCES courses(id)",
  },
}
