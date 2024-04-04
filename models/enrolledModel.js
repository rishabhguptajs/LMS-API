export const Enrollment = {
  tableName: "enrollments",
  columns: {
    id: "SERIAL PRIMARY KEY",
    user_id: "INT REFERENCES users(id)",
    course_id: "INT REFERENCES courses(id)",
  },
}
