const transactionModel = require('../models/transactionModel');
const { AppError } = require('../middlewares/errorMiddleware');

// Get comprehensive financial report
const getFinancialReport = async (req, res) => {
    try {
        const filters = {
            userIds: req.query.userIds,
            categoryIds: req.query.categoryIds,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
        };

        const report = await transactionModel.getReport(filters);
        res.status(200).json({
            success: true,
            data: report,
            message: 'Financial report generated successfully'
        });
    } catch (error) {
        console.error('Error generating financial report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate financial report',
            message: error.message
        });
    }
};

// Get income vs expense comparison
const getIncomeExpenseComparison = async (req, res) => {
    try {
        const filters = {
            userIds: req.query.userIds,
            categoryIds: req.query.categoryIds,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
        };

        const report = await transactionModel.getReport(filters);

        const comparison = {
            income: {
                total: report.summary.totalIncome,
                count: report.summary.incomeCount,
                average: report.summary.avgIncome
            },
            expense: {
                total: report.summary.totalExpense,
                count: report.summary.expenseCount,
                average: report.summary.avgExpense
            },
            netBalance: report.summary.netBalance,
            ratio: report.summary.totalExpense > 0 ?
                (report.summary.totalIncome / report.summary.totalExpense).toFixed(2) : 0
        };

        res.status(200).json({
            success: true,
            data: comparison,
            message: 'Income vs expense comparison generated successfully'
        });
    } catch (error) {
        console.error('Error generating comparison:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate comparison',
            message: error.message
        });
    }
};

// Get category analysis
const getCategoryAnalysis = async (req, res) => {
    try {
        const filters = {
            userIds: req.query.userIds,
            categoryIds: req.query.categoryIds,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
        };

        const report = await transactionModel.getReport(filters);

        // Group categories by type
        const incomeCategories = report.byCategory.filter(cat => cat.type === 'income');
        const expenseCategories = report.byCategory.filter(cat => cat.type === 'expense');

        const analysis = {
            incomeCategories,
            expenseCategories,
            topIncomeCategories: incomeCategories.slice(0, 5),
            topExpenseCategories: expenseCategories.slice(0, 5),
            totalCategories: report.byCategory.length
        };

        res.status(200).json({
            success: true,
            data: analysis,
            message: 'Category analysis generated successfully'
        });
    } catch (error) {
        console.error('Error generating category analysis:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate category analysis',
            message: error.message
        });
    }
};

// Get monthly trends
const getMonthlyTrends = async (req, res) => {
    try {
        const filters = {
            userIds: req.query.userIds,
            categoryIds: req.query.categoryIds,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
        };

        const report = await transactionModel.getReport(filters);

        const trends = {
            monthlyData: report.monthlyTrend,
            totalMonths: report.monthlyTrend.length,
            averageMonthlyIncome: report.monthlyTrend.length > 0 ?
                report.monthlyTrend.reduce((sum, month) => sum + month.income, 0) / report.monthlyTrend.length : 0,
            averageMonthlyExpense: report.monthlyTrend.length > 0 ?
                report.monthlyTrend.reduce((sum, month) => sum + month.expense, 0) / report.monthlyTrend.length : 0
        };

        res.status(200).json({
            success: true,
            data: trends,
            message: 'Monthly trends generated successfully'
        });
    } catch (error) {
        console.error('Error generating monthly trends:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate monthly trends',
            message: error.message
        });
    }
};

// Get spending insights
const getSpendingInsights = async (req, res) => {
    try {
        const filters = {
            userIds: req.query.userIds,
            categoryIds: req.query.categoryIds,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
        };

        const report = await transactionModel.getReport(filters);

        const insights = {
            largestTransactions: report.largestTransactions,
            topCategories: report.topCategories,
            averageTransactionSize: {
                income: report.summary.avgIncome,
                expense: report.summary.avgExpense
            },
            transactionFrequency: {
                income: report.summary.incomeCount,
                expense: report.summary.expenseCount
            },
            spendingPatterns: {
                totalSpent: report.summary.totalExpense,
                totalEarned: report.summary.totalIncome,
                savingsRate: report.summary.totalIncome > 0 ?
                    ((report.summary.totalIncome - report.summary.totalExpense) / report.summary.totalIncome * 100).toFixed(2) : 0
            }
        };

        res.status(200).json({
            success: true,
            data: insights,
            message: 'Spending insights generated successfully'
        });
    } catch (error) {
        console.error('Error generating spending insights:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate spending insights',
            message: error.message
        });
    }
};

module.exports = {
    getFinancialReport,
    getIncomeExpenseComparison,
    getCategoryAnalysis,
    getMonthlyTrends,
    getSpendingInsights
}; 