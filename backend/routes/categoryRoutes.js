const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, param, query } = require('express-validator');
const categoryController = require('../controllers/categoryController');
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

// Get all categories with pagination and filtering
router.get('/', [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('sort').optional().isIn(['id', 'name', 'type', 'created_at']),
    query('order').optional().isIn(['ASC', 'DESC']),
    query('name').optional().trim(),
    query('type').optional().isIn(['income', 'expense'])
], validate, categoryController.getCategories);

// Get category by ID
router.get('/:id', [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')
], validate, categoryController.getCategoryById);

// Create new category
router.post('/', [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('type').isIn(['income', 'expense']).withMessage('Type must be either income or expense'),
    body('description').optional().trim().isLength({ max: 200 }).withMessage('Description must be less than 200 characters'),
    body('color').optional().isHexColor().withMessage('Color must be a valid hex color')
], validate, categoryController.createCategory);

// Update category
router.put('/:id', [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
    body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('type').optional().isIn(['income', 'expense']).withMessage('Type must be either income or expense'),
    body('description').optional().trim().isLength({ max: 200 }).withMessage('Description must be less than 200 characters'),
    body('color').optional().isHexColor().withMessage('Color must be a valid hex color')
], validate, categoryController.updateCategory);

// Delete category
router.delete('/:id', [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')
], validate, categoryController.deleteCategory);

module.exports = router;