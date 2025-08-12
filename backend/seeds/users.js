require('dotenv').config();
const bcrypt = require('bcrypt');
const { database } = require('../config/db');
const { AppError } = require('../middlewares/errorMiddleware');

const users = [
    {
        name: 'Hoang Giap',
        username: 'japtex',
        email: 'giaphn1608@gmail.com',
        password: 'giap1998'
    },
    {
        name: 'Mai Anh',
        username: 'maianh',
        email: 'maianh@gmail.com',
        password: 'maianh'
    }
];

const seedUsers = async () => {
    try {
        // Debug: Log environment variables
        console.log('Environment variables:');
        console.log('DB_HOST:', process.env.DB_HOST);
        console.log('DB_USER:', process.env.DB_USER);
        console.log('DB_NAME:', process.env.DB_NAME);
        console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'undefined');

        // Initialize database connection
        await database.connect();

        console.log('Starting user seeding...');

        for (const user of users) {
            // Check if user already exists
            const existingUser = await database.query(
                'SELECT id FROM users WHERE username = ? OR email = ?',
                [user.username, user.email]
            );

            if (existingUser.length > 0) {
                console.log(`User ${user.name} already exists, skipping...`);
                continue;
            }

            // Hash password with higher rounds for security
            const hashedPassword = await bcrypt.hash(user.password, 12);

            const result = await database.query(
                'INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)',
                [user.name, user.username, user.email, hashedPassword]
            );

            console.log(`✅ User ${user.name} created with ID ${result.insertId}`);
        }

        console.log('🎉 Users seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding users:', error.message);
        throw new AppError(`Seeding failed: ${error.message}`, 500);
    } finally {
        // Close database connection
        await database.close();
    }
};

// Run the seed function
if (require.main === module) {
    seedUsers()
        .then(() => {
            console.log('Seeding completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Seeding failed:', error.message);
            process.exit(1);
        });
}

module.exports = { seedUsers };