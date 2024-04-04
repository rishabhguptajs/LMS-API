export const User = {
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