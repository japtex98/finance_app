const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, param, query } = require('express-validator');
const transactionController = require('../controllers/transactionController');
const { authenticateToken } = require('../middlewares/authenticationMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

const router = express.Router();

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// All routes require authentication
router.use(authenticateToken);
router.use(apiLimiter);

// Get all transactions with pagination and filtering
router.get('/', [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('sort').optional().isIn(['id', 'date', 'amount', 'type', 'created_at']),
    query('order').optional().isIn(['ASC', 'DESC']),
    query('type').optional().isIn(['income', 'expense']),
    query('categoryId').optional().isInt({ min: 1 }).toInt(),
    query('startDate').optional().isISO8601().toDate(),
    query('endDate').optional().isISO8601().toDate(),
    query('minAmount').optional().isFloat({ min: 0 }).toFloat(),
    query('maxAmount').optional().isFloat({ min: 0 }).toFloat()
], validate, transactionController.getTransactions);

// Get transaction by ID
router.get('/:id', [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')
], validate, transactionController.getTransactionById);

// Create new transaction
router.post('/', [
    body('categoryId').isInt({ min: 1 }).withMessage('Category ID must be a positive integer'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('type').isIn(['income', 'expense']).withMessage('Type must be either income or expense'),
    body('date').isISO8601().toDate().withMessage('Date must be a valid ISO date'),
    body('note').optional().trim().isLength({ max: 500 }).withMessage('Note must be less than 500 characters')
], validate, transactionController.createTransaction);

// Update transaction
router.put('/:id', [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
    body('categoryId').optional().isInt({ min: 1 }).withMessage('Category ID must be a positive integer'),
    body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('type').optional().isIn(['income', 'expense']).withMessage('Type must be either income or expense'),
    body('date').optional().isISO8601().toDate().withMessage('Date must be a valid ISO date'),
    body('note').optional().trim().isLength({ max: 500 }).withMessage('Note must be less than 500 characters')
], validate, transactionController.updateTransaction);

// Delete transaction
router.delete('/:id', [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')
], validate, transactionController.deleteTransaction);

// Get transaction reports
router.get('/reports/summary', [
    query('startDate').optional().isISO8601().toDate(),
    query('endDate').optional().isISO8601().toDate(),
    query('categoryIds').optional().isArray().toArray(),
    query('userIds').optional().isArray().toArray()
], validate, transactionController.getReport);

module.exports = router;