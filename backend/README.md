# Finance App Backend

A robust, secure, and scalable backend API for the Finance Application built with Node.js, Express, and MySQL.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with secure token handling
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Protection against abuse with configurable rate limits
- **Error Handling**: Centralized error handling with consistent response formats
- **Security**: Helmet.js for security headers, CORS protection
- **Logging**: Request logging with Morgan
- **Database**: MySQL with connection pooling and transaction support
- **API Documentation**: RESTful API design with consistent endpoints

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                 # Database configuration
├── controllers/
│   ├── userController.js     # User management
│   ├── categoryController.js # Category management
│   ├── transactionController.js # Transaction management
│   └── goalController.js     # Goal management
├── middlewares/
│   ├── authenticationMiddleware.js # JWT authentication
│   ├── validationMiddleware.js     # Input validation
│   └── errorMiddleware.js          # Error handling
├── models/
│   ├── userModel.js          # User data operations
│   ├── categoryModel.js      # Category data operations
│   ├── transactionModel.js   # Transaction data operations
│   └── goalModel.js          # Goal data operations
├── routes/
│   ├── userRoutes.js         # User endpoints
│   ├── categoryRoutes.js     # Category endpoints
│   ├── transactionRoutes.js  # Transaction endpoints
│   └── goalRoutes.js         # Goal endpoints
├── utils/
│   ├── database.js           # Database utility
│   └── responseHandler.js    # Response formatting
├── index.js                  # Main application file
├── package.json              # Dependencies
└── env.example               # Environment variables template
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finance_app/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   - Create a MySQL database
   - Update the database credentials in `.env`
   - Run the database migrations (if available)

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=finance_app
DB_CONNECTION_LIMIT=10

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Security
BCRYPT_ROUNDS=12

# Logging
LOG_LEVEL=info
```

## 📚 API Endpoints

### Authentication
- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration

### Users (Protected)
- `GET /api/users` - Get all users (with pagination/filtering)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Categories (Protected)
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Transactions (Protected)
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/reports/summary` - Get transaction reports

### Goals (Protected)
- `GET /api/goals` - Get all goals
- `GET /api/goals/:id` - Get goal by ID
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `POST /api/goals/:id/contribute` - Add contribution to goal
- `GET /api/goals/:id/progress` - Get goal progress

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with configurable rounds
- **Input Validation**: Comprehensive validation for all inputs
- **Rate Limiting**: Protection against brute force attacks
- **Security Headers**: Helmet.js for security headers
- **CORS Protection**: Configurable CORS settings
- **SQL Injection Prevention**: Parameterized queries

## 📊 Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "stack": "Error stack trace (development only)"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "limit": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 🔄 Database

The application uses MySQL with connection pooling for optimal performance. The database utility provides:

- Connection pooling
- Transaction support
- Query execution with error handling
- Automatic reconnection

## 🚀 Deployment

1. Set `NODE_ENV=production`
2. Configure production database credentials
3. Set a strong `JWT_SECRET`
4. Use a process manager like PM2
5. Set up reverse proxy (nginx)
6. Configure SSL certificates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License. 