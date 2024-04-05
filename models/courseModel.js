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

createCoursesTable()

export const Course = {
    tableName: 'courses',
    columns: {
      id: 'SERIAL PRIMARY KEY',
      title: 'VARCHAR(255) NOT NULL',
      description: 'TEXT NOT NULL',
      category: 'VARCHAR(255)',
      level: 'VARCHAR(50)',
      popularity: 'INT'
    }
  };