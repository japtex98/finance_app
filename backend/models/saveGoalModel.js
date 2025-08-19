const { database } = require('../config/db');

const buildSaveGoalFilterQuery = (filters = {}) => {
    const conditions = [];
    const values = [];
    if (filters.startDate) {
        conditions.push('start_date >= ?');
        values.push(filters.startDate);
    }
    if (filters.endDate) {
        conditions.push('end_date <= ?');
        values.push(filters.endDate);
    }
    if (filters.status) {
        conditions.push('status = ?');
        values.push(filters.status);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, values };
};

const getSaveGoalList = async (filters = {}, sort = 'id', order = 'ASC', limit = 10, offset = 0) => {
    const { whereClause, values } = buildSaveGoalFilterQuery(filters);
    const query = `SELECT * FROM save_goals ${whereClause} ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`;
    const params = [...values, limit, offset];
    const rows = await database.query(query, params);
    return rows;
};

const getSaveGoalCount = async (filters = {}) => {
    const { whereClause, values } = buildSaveGoalFilterQuery(filters);
    const query = `SELECT COUNT(*) FROM save_goals ${whereClause}`;
    const rows = await database.query(query, values);
    return rows[0]['COUNT(*)'];
};

const getSaveGoalById = async (id) => {
    const query = 'SELECT * FROM save_goals WHERE id = ?';
    const params = [id];
    const rows = await database.query(query, params);
    return rows[0];
};


const createSaveGoal = async (goalAmount, savedAmount, name, description, status, startDate, endDate) => {
    const query = 'INSERT INTO save_goals (goal_amount, saved_amount, name, description, status, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const params = [goalAmount, savedAmount, name, description, status, startDate, endDate];
    const result = await database.query(query, params);
    return result;
};

const updateSaveGoal = async (id, goalAmount, savedAmount, name, description, status, startDate, endDate) => {
    const query = 'UPDATE save_goals SET goal_amount = ?, saved_amount = ?, name = ?, description = ?, status = ?, start_date = ?, end_date = ? WHERE id = ?';
    const params = [goalAmount, savedAmount, name, description, status, startDate, endDate, id];
    const result = await database.query(query, params);
    return result;
};

const deleteSaveGoal = async (id) => {
    const query = 'DELETE FROM save_goals WHERE id = ?';
    const params = [id];
    const result = await database.query(query, params);
    return result;
};

// Comprehensive goal reports
const getGoalReport = async (filters = {}) => {
    const { whereClause, values } = buildSaveGoalFilterQuery(filters);

    try {
        // Get all goals with their details
        const goals = await database.query(`SELECT * FROM save_goals ${whereClause}`, values);

        // Calculate summary statistics
        const totalGoals = goals.length;
        const activeGoals = goals.filter(goal => goal.status === 'active').length;
        const completedGoals = goals.filter(goal => goal.status === 'completed').length;
        const cancelledGoals = goals.filter(goal => goal.status === 'cancelled').length;

        const totalGoalAmount = goals.reduce((sum, goal) => sum + parseFloat(goal.goal_amount), 0);
        const totalSavedAmount = goals.reduce((sum, goal) => sum + parseFloat(goal.saved_amount), 0);
        const overallProgress = totalGoalAmount > 0 ? (totalSavedAmount / totalGoalAmount * 100).toFixed(2) : 0;

        // Get goal transactions for each goal
        const goalsWithTransactions = await Promise.all(goals.map(async (goal) => {
            const transactions = await database.query(
                'SELECT * FROM save_goal_transactions WHERE save_goal_id = ? ORDER BY date ASC',
                [goal.id]
            );

            const totalContributed = transactions.reduce((sum, trans) => sum + parseFloat(trans.amount), 0);
            const transactionCount = transactions.length;
            const progress = parseFloat(goal.goal_amount) > 0 ? (parseFloat(goal.saved_amount) / parseFloat(goal.goal_amount) * 100).toFixed(2) : 0;

            // Calculate time remaining
            const endDate = new Date(goal.end_date);
            const today = new Date();
            const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
            const isOverdue = daysRemaining < 0;

            return {
                ...goal,
                transactions,
                totalContributed,
                transactionCount,
                progress: parseFloat(progress),
                daysRemaining: isOverdue ? 0 : daysRemaining,
                isOverdue,
                isOnTrack: daysRemaining >= 0 && parseFloat(progress) >= (1 - daysRemaining / 365) * 100
            };
        }));

        // Group by status
        const goalsByStatus = {
            active: goalsWithTransactions.filter(goal => goal.status === 'active'),
            completed: goalsWithTransactions.filter(goal => goal.status === 'completed'),
            cancelled: goalsWithTransactions.filter(goal => goal.status === 'cancelled')
        };

        // Top performing goals (by progress percentage)
        const topPerformingGoals = goalsWithTransactions
            .filter(goal => goal.status === 'active')
            .sort((a, b) => b.progress - a.progress)
            .slice(0, 5);

        // Goals at risk (low progress, approaching deadline)
        const goalsAtRisk = goalsWithTransactions
            .filter(goal => goal.status === 'active' && goal.daysRemaining <= 30 && goal.progress < 50)
            .sort((a, b) => a.daysRemaining - b.daysRemaining);

        // Monthly contribution trends
        const monthlyContributions = await database.query(`
            SELECT 
                DATE_FORMAT(sgt.date, '%Y-%m') as month,
                DATE_FORMAT(sgt.date, '%M %Y') as month_name,
                SUM(sgt.amount) as total_contributed,
                COUNT(*) as transaction_count
            FROM save_goal_transactions sgt
            JOIN save_goals sg ON sgt.save_goal_id = sg.id
            ${whereClause.replace('WHERE', 'WHERE sg.')}
            GROUP BY month
            ORDER BY month ASC
        `, values);

        return {
            summary: {
                totalGoals,
                activeGoals,
                completedGoals,
                cancelledGoals,
                totalGoalAmount,
                totalSavedAmount,
                overallProgress: parseFloat(overallProgress),
                averageProgress: totalGoals > 0 ? (goalsWithTransactions.reduce((sum, goal) => sum + goal.progress, 0) / totalGoals).toFixed(2) : 0
            },
            goals: goalsWithTransactions,
            goalsByStatus,
            topPerformingGoals,
            goalsAtRisk,
            monthlyContributions,
            filters: {
                startDate: filters.startDate,
                endDate: filters.endDate,
                status: filters.status
            }
        };
    } catch (error) {
        console.error('Error generating goal report:', error);
        throw error;
    }
};

// Goal transaction analysis
const getGoalTransactionReport = async (filters = {}) => {
    try {
        const { whereClause, values } = buildSaveGoalFilterQuery(filters);

        // Get all goal transactions with goal details
        const transactions = await database.query(`
            SELECT 
                sgt.*,
                sg.name as goal_name,
                sg.goal_amount,
                sg.saved_amount,
                sg.status as goal_status
            FROM save_goal_transactions sgt
            JOIN save_goals sg ON sgt.save_goal_id = sg.id
            ${whereClause.replace('WHERE', 'WHERE sg.')}
            ORDER BY sgt.date DESC
        `, values);

        // Calculate transaction statistics
        const totalTransactions = transactions.length;
        const totalContributed = transactions.reduce((sum, trans) => sum + parseFloat(trans.amount), 0);
        const averageContribution = totalTransactions > 0 ? totalContributed / totalTransactions : 0;

        // Largest contributions
        const largestContributions = transactions
            .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
            .slice(0, 10);

        // Recent activity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentActivity = transactions.filter(trans => new Date(trans.date) >= thirtyDaysAgo);

        // Group by goal
        const contributionsByGoal = transactions.reduce((acc, trans) => {
            const goalId = trans.save_goal_id;
            if (!acc[goalId]) {
                acc[goalId] = {
                    goalId,
                    goalName: trans.goal_name,
                    goalAmount: parseFloat(trans.goal_amount),
                    savedAmount: parseFloat(trans.saved_amount),
                    goalStatus: trans.goal_status,
                    transactions: [],
                    totalContributed: 0,
                    transactionCount: 0
                };
            }
            acc[goalId].transactions.push(trans);
            acc[goalId].totalContributed += parseFloat(trans.amount);
            acc[goalId].transactionCount += 1;
            return acc;
        }, {});

        // Monthly contribution trends
        const monthlyTrends = await database.query(`
            SELECT 
                DATE_FORMAT(sgt.date, '%Y-%m') as month,
                DATE_FORMAT(sgt.date, '%M %Y') as month_name,
                SUM(sgt.amount) as total_contributed,
                COUNT(*) as transaction_count,
                AVG(sgt.amount) as avg_contribution
            FROM save_goal_transactions sgt
            JOIN save_goals sg ON sgt.save_goal_id = sg.id
            ${whereClause.replace('WHERE', 'WHERE sg.')}
            GROUP BY month
            ORDER BY month ASC
        `, values);

        // Contribution frequency analysis
        const contributionFrequency = await database.query(`
            SELECT 
                DATE_FORMAT(sgt.date, '%Y-%m-%d') as contribution_date,
                COUNT(*) as daily_contributions,
                SUM(sgt.amount) as daily_total
            FROM save_goal_transactions sgt
            JOIN save_goals sg ON sgt.save_goal_id = sg.id
            ${whereClause.replace('WHERE', 'WHERE sg.')}
            GROUP BY contribution_date
            ORDER BY contribution_date DESC
            LIMIT 30
        `, values);

        return {
            summary: {
                totalTransactions,
                totalContributed,
                averageContribution,
                recentActivityCount: recentActivity.length,
                recentActivityTotal: recentActivity.reduce((sum, trans) => sum + parseFloat(trans.amount), 0)
            },
            transactions,
            largestContributions,
            recentActivity,
            contributionsByGoal: Object.values(contributionsByGoal),
            monthlyTrends,
            contributionFrequency,
            filters: {
                startDate: filters.startDate,
                endDate: filters.endDate,
                status: filters.status
            }
        };
    } catch (error) {
        console.error('Error generating goal transaction report:', error);
        throw error;
    }
};

// Goal progress tracking
const getGoalProgressReport = async (filters = {}) => {
    try {
        const { whereClause, values } = buildSaveGoalFilterQuery(filters);

        // Get goals with progress calculations
        const goals = await database.query(`SELECT * FROM save_goals ${whereClause}`, values);

        const progressData = await Promise.all(goals.map(async (goal) => {
            const transactions = await database.query(
                'SELECT * FROM save_goal_transactions WHERE save_goal_id = ? ORDER BY date ASC',
                [goal.id]
            );

            const goalAmount = parseFloat(goal.goal_amount);
            const savedAmount = parseFloat(goal.saved_amount);
            const progress = goalAmount > 0 ? (savedAmount / goalAmount * 100) : 0;

            // Calculate time progress
            const startDate = new Date(goal.start_date);
            const endDate = new Date(goal.end_date);
            const today = new Date();
            const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            const elapsedDays = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
            const timeProgress = totalDays > 0 ? Math.min((elapsedDays / totalDays) * 100, 100) : 0;

            // Calculate required daily savings
            const remainingAmount = goalAmount - savedAmount;
            const remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
            const requiredDailySavings = remainingDays > 0 ? remainingAmount / remainingDays : 0;

            // Calculate actual daily average
            const totalContributed = transactions.reduce((sum, trans) => sum + parseFloat(trans.amount), 0);
            const actualDailyAverage = elapsedDays > 0 ? totalContributed / elapsedDays : 0;

            return {
                goalId: goal.id,
                goalName: goal.name,
                goalAmount,
                savedAmount,
                progress: parseFloat(progress.toFixed(2)),
                timeProgress: parseFloat(timeProgress.toFixed(2)),
                status: goal.status,
                startDate: goal.start_date,
                endDate: goal.end_date,
                totalDays,
                elapsedDays,
                remainingDays: Math.max(0, remainingDays),
                requiredDailySavings: parseFloat(requiredDailySavings.toFixed(2)),
                actualDailyAverage: parseFloat(actualDailyAverage.toFixed(2)),
                isOnTrack: actualDailyAverage >= requiredDailySavings,
                transactions: transactions.length,
                totalContributed
            };
        }));

        // Group by progress status
        const onTrackGoals = progressData.filter(goal => goal.isOnTrack && goal.status === 'active');
        const behindGoals = progressData.filter(goal => !goal.isOnTrack && goal.status === 'active');
        const completedGoals = progressData.filter(goal => goal.status === 'completed');

        // Calculate overall statistics
        const activeGoals = progressData.filter(goal => goal.status === 'active');
        const averageProgress = activeGoals.length > 0 ?
            activeGoals.reduce((sum, goal) => sum + goal.progress, 0) / activeGoals.length : 0;

        const averageTimeProgress = activeGoals.length > 0 ?
            activeGoals.reduce((sum, goal) => sum + goal.timeProgress, 0) / activeGoals.length : 0;

        return {
            summary: {
                totalGoals: progressData.length,
                activeGoals: activeGoals.length,
                onTrackGoals: onTrackGoals.length,
                behindGoals: behindGoals.length,
                completedGoals: completedGoals.length,
                averageProgress: parseFloat(averageProgress.toFixed(2)),
                averageTimeProgress: parseFloat(averageTimeProgress.toFixed(2))
            },
            progressData,
            onTrackGoals,
            behindGoals,
            completedGoals,
            filters: {
                startDate: filters.startDate,
                endDate: filters.endDate,
                status: filters.status
            }
        };
    } catch (error) {
        console.error('Error generating goal progress report:', error);
        throw error;
    }
};

module.exports = {
    getSaveGoalList,
    getSaveGoalCount,
    getSaveGoalById,
    createSaveGoal,
    updateSaveGoal,
    deleteSaveGoal,
    getGoalReport,
    getGoalTransactionReport,
    getGoalProgressReport
};
