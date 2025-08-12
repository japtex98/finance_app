const database = require('../utils/database');
const DatabaseInitializer = require('../utils/databaseInitializer');

// Initialize database connection
const initDatabase = async () => {
    await database.connect();
};

// Initialize database and tables programmatically
const initializeDatabaseAndTables = async () => {
    const initializer = new DatabaseInitializer();
    await initializer.initialize();
};

// Export the database instance and initialization functions
module.exports = {
    database,
    initDatabase,
    initializeDatabaseAndTables
};