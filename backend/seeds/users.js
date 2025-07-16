const bcrypt = require('bcrypt');
const pool = require('../config/db');

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
]

const seedUsers = async () => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        for (const user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const [rows] = await connection.query('INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)', [user.name, user.username, user.email, hashedPassword]);
            console.log(`User ${user.name} created with ID ${rows.insertId}`);
        }

        await connection.commit();
        console.log('Users seeded successfully');
    } catch (error) {
        await connection.rollback();
        console.error('Error seeding users:', error);
    } finally {
        connection.release();
    }
};

seedUsers().finally(() => {
    pool.end();
});