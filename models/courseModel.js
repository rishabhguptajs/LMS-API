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