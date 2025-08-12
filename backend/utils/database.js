const mysql = require('mysql2/promise');
const { AppError } = require('../middlewares/errorMiddleware');

class Database {
    constructor() {
        this.pool = null;
    }

    async connect() {
        try {
            this.pool = mysql.createPool({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'finance_app',
                waitForConnections: true,
                connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
                queueLimit: 0
            });

            // Test the connection
            await this.pool.getConnection();
            console.log('Database connected successfully');
        } catch (error) {
            console.error('Database connection failed:', error);
            throw new AppError('Database connection failed', 500);
        }
    }

    async query(sql, params = []) {
        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('Database query error:', error);
            throw new AppError(`Database error: ${error.message}`, 500);
        }
    }

    async transaction(callback) {
        const connection = await this.pool.getConnection();
        try {
            await connection.beginTransaction();
            const result = await callback(connection);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            console.log('Database connection closed');
        }
    }
}

// Create singleton instance
const database = new Database();

module.exports = database; 