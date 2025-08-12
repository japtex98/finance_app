#!/usr/bin/env node

require('dotenv').config();
const DatabaseInitializer = require('../utils/databaseInitializer');

async function main() {
    console.log('🎯 Finance App Database Initializer');
    console.log('=====================================');
    console.log('');

    const initializer = new DatabaseInitializer();

    try {
        await initializer.initialize();
        console.log('');
        console.log('🎉 SUCCESS: Database initialization completed!');
        console.log('🚀 Your finance app is ready to run.');
        console.log('');
        console.log('Next steps:');
        console.log('1. Start the server: npm start');
        console.log('2. Access the API at: http://localhost:3000');
        console.log('3. Check health endpoint: http://localhost:3000/health');
        process.exit(0);
    } catch (error) {
        console.error('');
        console.error('❌ ERROR: Database initialization failed!');
        console.error('💡 Troubleshooting tips:');
        console.error('   - Check your MySQL server is running');
        console.error('   - Verify database credentials in .env file');
        console.error('   - Ensure MySQL user has CREATE privileges');
        console.error('   - Check network connectivity to database');
        console.error('');
        console.error('Error details:', error.message);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

main(); 