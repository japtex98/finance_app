const mysql = require('mysql2/promise');
const { AppError } = require('../middlewares/errorMiddleware');

class DatabaseInitializer {
    constructor() {
        this.connection = null;
    }

    async connectWithoutDatabase() {
        try {
            this.connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                port: process.env.DB_PORT || 3306
            });
            console.log('🔗 Connected to MySQL server successfully');
        } catch (error) {
            console.error('❌ Failed to connect to MySQL server:', error);
            throw new AppError('Failed to connect to MySQL server', 500);
        }
    }

    async createDatabase() {
        try {
            const dbName = process.env.DB_NAME || 'finance_app';

            // Check if database exists
            const [databases] = await this.connection.execute('SHOW DATABASES LIKE ?', [dbName]);

            if (databases.length === 0) {
                // Database doesn't exist, create it
                await this.connection.execute(`CREATE DATABASE \`${dbName}\``);
                console.log(`✅ Database '${dbName}' created successfully`);
            } else {
                console.log(`ℹ️  Database '${dbName}' already exists`);
            }

            // Use the database
            await this.connection.execute(`USE \`${dbName}\``);
            console.log(`📁 Using database '${dbName}'`);
        } catch (error) {
            console.error('❌ Failed to create/access database:', error);
            throw new AppError('Failed to create/access database', 500);
        }
    }

    async createTables() {
        try {
            console.log('🔍 Checking existing tables...');

            // Get list of existing tables
            const [existingTables] = await this.connection.execute('SHOW TABLES');
            const tableNames = existingTables.map(row => Object.values(row)[0]);

            console.log(`📋 Found ${tableNames.length} existing tables: ${tableNames.join(', ')}`);

            // Create users table
            if (!tableNames.includes('users')) {
                await this.connection.execute(`
                    CREATE TABLE users (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        username VARCHAR(100) UNIQUE NOT NULL,
                        email VARCHAR(255) UNIQUE NOT NULL,
                        password VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                `);
                console.log('✅ Users table created');
            } else {
                console.log('ℹ️  Users table already exists');
            }

            // Create categories table
            if (!tableNames.includes('categories')) {
                await this.connection.execute(`
                    CREATE TABLE categories (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                `);
                console.log('✅ Categories table created');
            } else {
                console.log('ℹ️  Categories table already exists');
            }

            // Create save_goals table
            if (!tableNames.includes('save_goals')) {
                await this.connection.execute(`
                    CREATE TABLE save_goals (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        goal_amount DECIMAL(15,2) NOT NULL,
                        saved_amount DECIMAL(15,2) DEFAULT 0.00,
                        name VARCHAR(255) NOT NULL,
                        description TEXT,
                        status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
                        start_date DATE NOT NULL,
                        end_date DATE NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                `);
                console.log('✅ Save goals table created');
            } else {
                console.log('ℹ️  Save goals table already exists');
            }

            // Create transactions table
            if (!tableNames.includes('transactions')) {
                await this.connection.execute(`
                    CREATE TABLE transactions (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT NOT NULL,
                        category_id INT NOT NULL,
                        amount DECIMAL(15,2) NOT NULL,
                        type ENUM('income', 'expense') NOT NULL,
                        date DATE NOT NULL,
                        note TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
                    )
                `);
                console.log('✅ Transactions table created');
            } else {
                console.log('ℹ️  Transactions table already exists');
            }

            // Create save_goal_transactions table
            if (!tableNames.includes('save_goal_transactions')) {
                await this.connection.execute(`
                    CREATE TABLE save_goal_transactions (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        save_goal_id INT NOT NULL,
                        amount DECIMAL(15,2) NOT NULL,
                        date DATE NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (save_goal_id) REFERENCES save_goals(id) ON DELETE CASCADE
                    )
                `);
                console.log('✅ Save goal transactions table created');
            } else {
                console.log('ℹ️  Save goal transactions table already exists');
            }

            // Verify all required tables exist
            const [finalTables] = await this.connection.execute('SHOW TABLES');
            const finalTableNames = finalTables.map(row => Object.values(row)[0]);
            const requiredTables = ['users', 'categories', 'save_goals', 'transactions', 'save_goal_transactions'];
            const missingTables = requiredTables.filter(table => !finalTableNames.includes(table));

            if (missingTables.length > 0) {
                throw new AppError(`Missing required tables: ${missingTables.join(', ')}`, 500);
            }

            console.log(`✅ All required tables verified: ${requiredTables.join(', ')}`);

        } catch (error) {
            console.error('❌ Failed to create/verify tables:', error);
            throw new AppError('Failed to create/verify tables', 500);
        }
    }



    async initialize() {
        try {
            console.log('🚀 Starting database initialization...');
            console.log('📊 Database configuration:');
            console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
            console.log(`   User: ${process.env.DB_USER || 'root'}`);
            console.log(`   Database: ${process.env.DB_NAME || 'finance_app'}`);
            console.log(`   Port: ${process.env.DB_PORT || 3306}`);
            console.log('');

            await this.connectWithoutDatabase();
            await this.createDatabase();
            await this.createTables();

            console.log('');
            console.log('🎉 Database initialization completed successfully!');
            console.log('✨ Your finance app database is ready to use.');
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            throw error;
        } finally {
            if (this.connection) {
                await this.connection.end();
                console.log('🔌 Database connection closed');
            }
        }
    }

    async close() {
        if (this.connection) {
            await this.connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

module.exports = DatabaseInitializer; 