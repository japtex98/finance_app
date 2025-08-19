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
], validate, goalController.getSaveGoalList);

// Get goal by ID
router.get('/:id', [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')
], validate, goalController.getSaveGoalById);

// Create new goal
router.post('/', [
    body('goalAmount').isFloat({ min: 0.01 }).withMessage('Goal amount must be a positive number'),
    body('savedAmount').optional().isFloat({ min: 0 }).toFloat().withMessage('Saved amount must be a non-negative number'),
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
    body('status').optional().isIn(['active', 'completed', 'cancelled']).withMessage('Status must be active, completed, or cancelled'),
    body('startDate').isISO8601().toDate().withMessage('Start date must be a valid ISO date'),
    body('endDate').isISO8601().toDate().withMessage('End date must be a valid ISO date')
], validate, goalController.createSaveGoal);

// Update goal
router.put('/:id', [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
    body('goalAmount').optional().isFloat({ min: 0.01 }).withMessage('Goal amount must be a positive number'),
    body('savedAmount').optional().isFloat({ min: 0 }).toFloat().withMessage('Saved amount must be a non-negative number'),
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
    body('status').optional().isIn(['active', 'completed', 'cancelled']).withMessage('Status must be active, completed, or cancelled'),
    body('startDate').optional().isISO8601().toDate().withMessage('Start date must be a valid ISO date'),
    body('endDate').optional().isISO8601().toDate().withMessage('End date must be a valid ISO date')
], validate, goalController.updateSaveGoal);

// Delete goal
router.delete('/:id', [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')
], validate, goalController.deleteSaveGoal);

// Add contribution to goal (save goal transaction)
router.post('/:id/contribute', [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('date').optional().isISO8601().toDate().withMessage('Date must be a valid ISO date')
], validate, (req, res, next) => {
    // Map to controller expecting saveGoalId in body
    req.body.saveGoalId = parseInt(req.params.id, 10)
    return goalController.addSaveGoalTransaction(req, res, next)
});

module.exports = router;