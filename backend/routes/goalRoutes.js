const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, param, query } = require('express-validator');
const goalController = require('../controllers/goalController');
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

// Get all goals with pagination and filtering
router.get('/', [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('sort').optional().isIn(['id', 'name', 'targetAmount', 'deadline', 'created_at']),
    query('order').optional().isIn(['ASC', 'DESC']),
    query('status').optional().isIn(['active', 'completed', 'cancelled']),
    query('type').optional().isIn(['savings', 'debt', 'investment'])
], validate, goalController.getGoals);

// Get goal by ID
router.get('/:id', [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')
], validate, goalController.getGoalById);

// Create new goal
router.post('/', [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('targetAmount').isFloat({ min: 0.01 }).withMessage('Target amount must be a positive number'),
    body('currentAmount').optional().isFloat({ min: 0 }).toFloat().withMessage('Current amount must be a non-negative number'),
    body('deadline').isISO8601().toDate().withMessage('Deadline must be a valid ISO date'),
    body('type').isIn(['savings', 'debt', 'investment']).withMessage('Type must be savings, debt, or investment'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters')
], validate, goalController.createGoal);

// Update goal
router.put('/:id', [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('targetAmount').optional().isFloat({ min: 0.01 }).withMessage('Target amount must be a positive number'),
    body('currentAmount').optional().isFloat({ min: 0 }).toFloat().withMessage('Current amount must be a non-negative number'),
    body('deadline').optional().isISO8601().toDate().withMessage('Deadline must be a valid ISO date'),
    body('type').optional().isIn(['savings', 'debt', 'investment']).withMessage('Type must be savings, debt, or investment'),
    body('status').optional().isIn(['active', 'completed', 'cancelled']).withMessage('Status must be active, completed, or cancelled'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters')
], validate, goalController.updateGoal);

// Delete goal
router.delete('/:id', [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')
], validate, goalController.deleteGoal);

// Add contribution to goal
router.post('/:id/contribute', [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('note').optional().trim().isLength({ max: 200 }).withMessage('Note must be less than 200 characters')
], validate, goalController.addContribution);

// Get goal progress
router.get('/:id/progress', [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')
], validate, goalController.getGoalProgress);

module.exports = router;