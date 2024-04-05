import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

// create a new PostgreSQL connection with neon.tech database
const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: 'require',
});

// function to retrieve PostgreSQL version
async function getPgVersion() {
  try {
    const result = await sql`SELECT version()`;
    console.log(result[0].version);
  } catch (error) {
    console.error('Error:', error);
  }
}

getPgVersion();

export default sql;
