// first create a users table
async function createUsersTable() {
  try {
    const { tableName, columns } = User;
    const columnDefinitions = Object.entries(columns).map(([columnName, columnDefinition]) => `${columnName} ${columnDefinition}`).join(', ');
    await sql.unsafe(`CREATE TABLE IF NOT EXISTS "${tableName}" (${columnDefinitions})`);
    console.log("Users table created or already exists");
  } catch (error) {
    console.error("Error creating users table:", error);
  }
}

createUsersTable();

const User = {
    tableName: 'users',
    columns: {
      id: 'SERIAL PRIMARY KEY',
      name: 'VARCHAR(255) NOT NULL',
      email: 'VARCHAR(255) UNIQUE NOT NULL',
      password: 'VARCHAR(255) NOT NULL',
      profile_picture: 'TEXT',
      other_details: 'TEXT',
      isSuperadmin: 'BOOLEAN DEFAULT FALSE' 
    }
  };

export default User;