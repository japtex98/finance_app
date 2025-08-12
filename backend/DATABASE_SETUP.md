# Database Setup Guide

This guide explains how to set up the database for the Finance App backend, including programmatic database and table creation.

## Prerequisites

1. MySQL server running (version 5.7 or higher)
2. Node.js and npm installed
3. Environment variables configured

## Environment Configuration

Copy the example environment file and configure your database settings:

```bash
cp env.example .env
```

Edit `.env` file with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=finance_app
DB_CONNECTION_LIMIT=10
DB_PORT=3306
```

## Database Initialization

### Manual Database Initialization Script

Run the database initialization script manually:

```bash
npm run init:db
```

This will:
- Connect to MySQL server
- Check if database exists (create if missing)
- Check existing tables (create missing ones)
- Verify all required tables are present
- Display detailed progress with emojis
- Provide helpful next steps

### Programmatic Initialization

You can also initialize the database programmatically in your code:

```javascript
const { initializeDatabaseAndTables } = require('./config/db');

// Initialize database and tables
await initializeDatabaseAndTables();
```

## Database Schema

The initialization script creates the following tables:

### 1. users
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `name` (VARCHAR(255), NOT NULL)
- `username` (VARCHAR(100), UNIQUE, NOT NULL)
- `email` (VARCHAR(255), UNIQUE, NOT NULL)
- `password` (VARCHAR(255), NOT NULL)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

### 2. categories
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `name` (VARCHAR(255), NOT NULL)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

### 3. save_goals
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `goal_amount` (DECIMAL(15,2), NOT NULL)
- `saved_amount` (DECIMAL(15,2), DEFAULT 0.00)
- `name` (VARCHAR(255), NOT NULL)
- `description` (TEXT)
- `status` (ENUM('active', 'completed', 'cancelled'), DEFAULT 'active')
- `start_date` (DATE, NOT NULL)
- `end_date` (DATE, NOT NULL)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

### 4. transactions
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `user_id` (INT, NOT NULL, FOREIGN KEY)
- `category_id` (INT, NOT NULL, FOREIGN KEY)
- `amount` (DECIMAL(15,2), NOT NULL)
- `type` (ENUM('income', 'expense'), NOT NULL)
- `date` (DATE, NOT NULL)
- `note` (TEXT)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

### 5. save_goal_transactions
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `save_goal_id` (INT, NOT NULL, FOREIGN KEY)
- `amount` (DECIMAL(15,2), NOT NULL)
- `date` (DATE, NOT NULL)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)



## Error Handling

The initialization script includes comprehensive error handling:

- Connection failures are caught and reported
- Database creation errors are handled gracefully
- Table creation errors are logged with details
- Foreign key constraints are properly set up
- Rollback mechanisms for failed operations

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure MySQL server is running
   - Check host and port configuration
   - Verify user credentials

2. **Access Denied**
   - Ensure the MySQL user has CREATE DATABASE privileges
   - Check user permissions for the specified database

3. **Database Already Exists**
   - The script will detect existing databases and skip creation
   - Existing data will be preserved
   - Only missing tables will be created

4. **Tables Already Exist**
   - The script will detect existing tables and skip creation
   - Existing table data will be preserved
   - Only missing tables will be created

5. **Foreign Key Constraints**
   - Tables are created in the correct order to satisfy foreign key dependencies
   - If you encounter constraint errors, drop all tables and re-run initialization

### Manual Database Reset

If you need to completely reset the database:

```sql
-- Connect to MySQL and run:
DROP DATABASE IF EXISTS finance_app;
```

Then re-run the initialization script.



## Security Considerations

- Never commit `.env` files to version control
- Use strong passwords for database users
- Consider using environment-specific database configurations
- Regularly backup your database
- Use connection pooling for production environments

## Production Deployment

For production environments:

1. Use a dedicated database user with minimal required privileges
2. Configure proper connection pooling
3. Set up database backups
4. Monitor database performance and connections 