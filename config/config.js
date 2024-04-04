import postgres from "postgres";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Extract PostgreSQL connection details from environment variables
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

// Create a PostgreSQL client instance
const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: 'require', // This ensures SSL is required for the connection
});

// Function to retrieve PostgreSQL version
async function getPgVersion() {
  try {
    // Execute SQL query to get PostgreSQL version
    const result = await sql`SELECT version()`;
    console.log(result[0].version); // Log the version to the console
  } catch (error) {
    // Handle any errors that occur during query execution
    console.error('Error:', error);
  }
}

// Call the getPgVersion function to retrieve and log PostgreSQL version
getPgVersion();

// Export the PostgreSQL client instance for use in other parts of the application
export default sql;
