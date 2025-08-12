const saveGoalModel = require('../models/saveGoalModel');
const { AppError } = require('../middlewares/errorMiddleware');

// Get comprehensive goal overview
const getGoalOverview = async (req, res) => {
    try {
        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            status: req.query.status,
        };

        const report = await saveGoalModel.getGoalReport(filters);
        res.status(200).json({
            success: true,
            data: report,
            message: 'Goal overview report generated successfully'
        });
    } catch (error) {
        console.error('Error generating goal overview:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate goal overview',
            message: error.message
        });
    }
};

// Get goal transaction analysis
const getGoalTransactionAnalysis = async (req, res) => {
    try {
        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            status: req.query.status,
        };

        const report = await saveGoalModel.getGoalTransactionReport(filters);
        res.status(200).json({
            success: true,
            data: report,
            message: 'Goal transaction analysis generated successfully'
        });
    } catch (error) {
        console.error('Error generating goal transaction analysis:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate goal transaction analysis',
            message: error.message
        });
    }
};

// Get goal progress tracking
const getGoalProgressTracking = async (req, res) => {
    try {
        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            status: req.query.status,
        };

        const report = await saveGoalModel.getGoalProgressReport(filters);
        res.status(200).json({
            success: true,
            data: report,
            message: 'Goal progress tracking generated successfully'
        });
    } catch (error) {
        console.error('Error generating goal progress tracking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate goal progress tracking',
            message: error.message
        });
    }
};

// Get goals at risk
const getGoalsAtRisk = async (req, res) => {
    try {
        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            status: 'active', // Only active goals can be at risk
        };

        const report = await saveGoalModel.getGoalReport(filters);

        const atRiskGoals = report.goalsAtRisk.map(goal => ({
            goalId: goal.id,
            goalName: goal.name,
            goalAmount: goal.goal_amount,
            savedAmount: goal.saved_amount,
            progress: goal.progress,
            daysRemaining: goal.daysRemaining,
            isOverdue: goal.isOverdue,
            requiredDailySavings: goal.goal_amount > 0 ?
                (goal.goal_amount - goal.saved_amount) / Math.max(goal.daysRemaining, 1) : 0,
            riskLevel: goal.daysRemaining <= 7 ? 'critical' :
                goal.daysRemaining <= 30 ? 'high' : 'medium'
        }));

        res.status(200).json({
            success: true,
            data: {
                atRiskGoals,
                totalAtRisk: atRiskGoals.length,
                criticalRisk: atRiskGoals.filter(goal => goal.riskLevel === 'critical').length,
                highRisk: atRiskGoals.filter(goal => goal.riskLevel === 'high').length,
                mediumRisk: atRiskGoals.filter(goal => goal.riskLevel === 'medium').length
            },
            message: 'Goals at risk analysis generated successfully'
        });
    } catch (error) {
        console.error('Error generating goals at risk:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate goals at risk',
            message: error.message
        });
    }
};

// Get top performing goals
const getTopPerformingGoals = async (req, res) => {
    try {
        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            status: req.query.status,
        };

        const report = await saveGoalModel.getGoalReport(filters);

        const topPerformers = report.topPerformingGoals.map(goal => ({
            goalId: goal.id,
            goalName: goal.name,
            goalAmount: goal.goal_amount,
            savedAmount: goal.saved_amount,
            progress: goal.progress,
            daysRemaining: goal.daysRemaining,
            transactionCount: goal.transactionCount,
            averageContribution: goal.transactionCount > 0 ?
                goal.totalContributed / goal.transactionCount : 0,
            completionRate: goal.progress / 100
        }));

        res.status(200).json({
            success: true,
            data: {
                topPerformers,
                totalTopPerformers: topPerformers.length,
                averageProgress: topPerformers.length > 0 ?
                    topPerformers.reduce((sum, goal) => sum + goal.progress, 0) / topPerformers.length : 0
            },
            message: 'Top performing goals analysis generated successfully'
        });
    } catch (error) {
        console.error('Error generating top performing goals:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate top performing goals',
            message: error.message
        });
    }
};

// Get goal contribution trends
const getGoalContributionTrends = async (req, res) => {
    try {
        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            status: req.query.status,
        };

        const report = await saveGoalModel.getGoalTransactionReport(filters);

        const trends = {
            monthlyTrends: report.monthlyTrends,
            contributionFrequency: report.contributionFrequency,
            averageMonthlyContribution: report.monthlyTrends.length > 0 ?
                report.monthlyTrends.reduce((sum, month) => sum + month.total_contributed, 0) / report.monthlyTrends.length : 0,
            totalMonths: report.monthlyTrends.length,
            recentActivity: {
                count: report.summary.recentActivityCount,
                total: report.summary.recentActivityTotal,
                average: report.summary.recentActivityCount > 0 ?
                    report.summary.recentActivityTotal / report.summary.recentActivityCount : 0
            }
        };

        res.status(200).json({
            success: true,
            data: trends,
            message: 'Goal contribution trends generated successfully'
        });
    } catch (error) {
        console.error('Error generating goal contribution trends:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate goal contribution trends',
            message: error.message
        });
    }
};

// Get goal completion forecast
const getGoalCompletionForecast = async (req, res) => {
    try {
        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            status: 'active', // Only active goals for forecasting
        };

        const report = await saveGoalModel.getGoalProgressReport(filters);

        const forecasts = report.progressData.map(goal => {
            const remainingAmount = goal.goalAmount - goal.savedAmount;
            const estimatedCompletionDate = goal.actualDailyAverage > 0 ?
                new Date(Date.now() + (remainingAmount / goal.actualDailyAverage) * 24 * 60 * 60 * 1000) : null;

            const isOnTrack = goal.isOnTrack;
            const estimatedDaysToComplete = goal.actualDailyAverage > 0 ?
                Math.ceil(remainingAmount / goal.actualDailyAverage) : null;

            return {
                goalId: goal.goalId,
                goalName: goal.goalName,
                goalAmount: goal.goalAmount,
                savedAmount: goal.savedAmount,
                remainingAmount,
                progress: goal.progress,
                daysRemaining: goal.remainingDays,
                actualDailyAverage: goal.actualDailyAverage,
                requiredDailySavings: goal.requiredDailySavings,
                estimatedCompletionDate,
                estimatedDaysToComplete,
                isOnTrack,
                completionProbability: isOnTrack ? 'high' :
                    goal.actualDailyAverage > goal.requiredDailySavings * 0.8 ? 'medium' : 'low'
            };
        });

        const summary = {
            totalGoals: forecasts.length,
            onTrackGoals: forecasts.filter(f => f.isOnTrack).length,
            highProbability: forecasts.filter(f => f.completionProbability === 'high').length,
            mediumProbability: forecasts.filter(f => f.completionProbability === 'medium').length,
            lowProbability: forecasts.filter(f => f.completionProbability === 'low').length,
            averageEstimatedDays: forecasts.filter(f => f.estimatedDaysToComplete).length > 0 ?
                forecasts.filter(f => f.estimatedDaysToComplete)
                    .reduce((sum, f) => sum + f.estimatedDaysToComplete, 0) /
                forecasts.filter(f => f.estimatedDaysToComplete).length : 0
        };

        res.status(200).json({
            success: true,
            data: {
                forecasts,
                summary
            },
            message: 'Goal completion forecast generated successfully'
        });
    } catch (error) {
        console.error('Error generating goal completion forecast:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate goal completion forecast',
            message: error.message
        });
    }
};

module.exports = {
    getGoalOverview,
    getGoalTransactionAnalysis,
    getGoalProgressTracking,
    getGoalsAtRisk,
    getTopPerformingGoals,
    getGoalContributionTrends,
    getGoalCompletionForecast
}; 