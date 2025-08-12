const express = require('express');
const rateLimit = require('express-rate-limit');
const { query } = require('express-validator');
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middlewares/authenticationMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

const router = express.Router();

// Rate limiting for reports (more restrictive since reports are resource-intensive)
const reportLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50 // limit each IP to 50 report requests per windowMs
});

// All routes require authentication
router.use(authenticateToken);
router.use(reportLimiter);

// Get comprehensive financial report
router.get('/financial', [
    query('startDate').optional().isISO8601().toDate(),
    query('endDate').optional().isISO8601().toDate(),
    query('categoryIds').optional().isArray().toArray(),
    query('userIds').optional().isArray().toArray()
], validate, reportController.getFinancialReport);

// Get income vs expense comparison
router.get('/income-expense', [
    query('startDate').optional().isISO8601().toDate(),
    query('endDate').optional().isISO8601().toDate(),
    query('categoryIds').optional().isArray().toArray(),
    query('userIds').optional().isArray().toArray()
], validate, reportController.getIncomeExpenseComparison);

// Get category analysis
router.get('/categories', [
    query('startDate').optional().isISO8601().toDate(),
    query('endDate').optional().isISO8601().toDate(),
    query('categoryIds').optional().isArray().toArray(),
    query('userIds').optional().isArray().toArray()
], validate, reportController.getCategoryAnalysis);

// Get monthly trends
router.get('/monthly-trends', [
    query('startDate').optional().isISO8601().toDate(),
    query('endDate').optional().isISO8601().toDate(),
    query('categoryIds').optional().isArray().toArray(),
    query('userIds').optional().isArray().toArray()
], validate, reportController.getMonthlyTrends);

// Get spending insights
router.get('/spending-insights', [
    query('startDate').optional().isISO8601().toDate(),
    query('endDate').optional().isISO8601().toDate(),
    query('categoryIds').optional().isArray().toArray(),
    query('userIds').optional().isArray().toArray()
], validate, reportController.getSpendingInsights);

module.exports = router; 