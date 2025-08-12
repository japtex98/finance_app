const express = require('express');
const rateLimit = require('express-rate-limit');
const { query } = require('express-validator');
const goalReportController = require('../controllers/goalReportController');
const { authenticateToken } = require('../middlewares/authenticationMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

const router = express.Router();

// Rate limiting for goal reports
const goalReportLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50 // limit each IP to 50 goal report requests per windowMs
});

// All routes require authentication
router.use(authenticateToken);
router.use(goalReportLimiter);

// Get comprehensive goal overview
router.get('/overview', [
    query('startDate').optional().isISO8601().toDate(),
    query('endDate').optional().isISO8601().toDate(),
    query('status').optional().isIn(['active', 'completed', 'cancelled'])
], validate, goalReportController.getGoalOverview);

// Get goal transaction analysis
router.get('/transactions', [
    query('startDate').optional().isISO8601().toDate(),
    query('endDate').optional().isISO8601().toDate(),
    query('status').optional().isIn(['active', 'completed', 'cancelled'])
], validate, goalReportController.getGoalTransactionAnalysis);

// Get goal progress tracking
router.get('/progress', [
    query('startDate').optional().isISO8601().toDate(),
    query('endDate').optional().isISO8601().toDate(),
    query('status').optional().isIn(['active', 'completed', 'cancelled'])
], validate, goalReportController.getGoalProgressTracking);

// Get goals at risk
router.get('/at-risk', [
    query('startDate').optional().isISO8601().toDate(),
    query('endDate').optional().isISO8601().toDate()
], validate, goalReportController.getGoalsAtRisk);

// Get top performing goals
router.get('/top-performers', [
    query('startDate').optional().isISO8601().toDate(),
    query('endDate').optional().isISO8601().toDate(),
    query('status').optional().isIn(['active', 'completed', 'cancelled'])
], validate, goalReportController.getTopPerformingGoals);

// Get goal contribution trends
router.get('/contribution-trends', [
    query('startDate').optional().isISO8601().toDate(),
    query('endDate').optional().isISO8601().toDate(),
    query('status').optional().isIn(['active', 'completed', 'cancelled'])
], validate, goalReportController.getGoalContributionTrends);

// Get goal completion forecast
router.get('/completion-forecast', [
    query('startDate').optional().isISO8601().toDate(),
    query('endDate').optional().isISO8601().toDate()
], validate, goalReportController.getGoalCompletionForecast);

module.exports = router; 