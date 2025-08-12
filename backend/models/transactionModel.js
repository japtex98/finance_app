const pool = require('../config/db');


const buildTransactionFilterQuery = (filters = {}) => {
    const conditions = [];
    const values = [];
    if (filters.userIds) {
        conditions.push('user_id IN (?)');
        values.push(filters.userIds);
    }
    if (filters.categoryIds) {
        conditions.push('category_id IN (?)');
        values.push(filters.categoryIds);
    }
    if (filters.startDate) {
        conditions.push('date >= ?');
        values.push(filters.startDate);
    }
    if (filters.endDate) {
        conditions.push('date <= ?');
        values.push(filters.endDate);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, values };
};

const getTransactions = async (filters = {}, sort = 'id', order = 'ASC', limit = 10, offset = 0) => {
    const { whereClause, values } = buildTransactionFilterQuery(filters);
    const allowedSort = ['id', 'date', 'amount', 'type'];
    const allowedOrder = ['ASC', 'DESC'];
    const sortBy = allowedSort.includes(sort) ? sort : 'id';
    const sortOrder = allowedOrder.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';
    const query = `SELECT * FROM transactions ${whereClause} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    const params = [...values, limit, offset];
    const [rows] = await pool.query(query, params);
    return rows;
};

const getTransactionsCount = async (filters = {}) => {
    const { whereClause, values } = buildTransactionFilterQuery(filters);
    const query = `SELECT COUNT(*) FROM transactions ${whereClause}`;
    const params = [...values];
    const [rows] = await pool.query(query, params);
    return rows[0]['COUNT(*)'];
};

const getTransactionById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [id]);
    return rows[0];
};

const createTransaction = async (userId, categoryId, amount, type, date, note = '') => {
    const [rows] = await pool.query('INSERT INTO transactions (user_id, category_id, amount, type, date, note) VALUES (?, ?, ?, ?, ?, ?)', [userId, categoryId, amount, type, date, note]);
    return rows[0];
};

const updateTransaction = async (id, userId, categoryId, amount, type, date, note = '') => {
    const [rows] = await pool.query('UPDATE transactions SET user_id = ?, category_id = ?, amount = ?, type = ?, date = ?, note = ? WHERE id = ?', [userId, categoryId, amount, type, date, note, id]);
    return rows[0];
};

const deleteTransaction = async (id) => {
    const [rows] = await pool.query('DELETE FROM transactions WHERE id = ?', [id]);
    return rows[0];
};

const getReport = async (filters = {}) => {
    const { whereClause, values } = buildTransactionFilterQuery(filters);

    try {
        // Total income and expenses
        const [incomeRows] = await pool.query(`SELECT SUM(amount) as totalIncome FROM transactions ${whereClause} AND type = 'income'`, values);
        const [expenseRows] = await pool.query(`SELECT SUM(amount) as totalExpense FROM transactions ${whereClause} AND type = 'expense'`, values);

        // Net balance
        const totalIncome = incomeRows[0].totalIncome || 0;
        const totalExpense = expenseRows[0].totalExpense || 0;
        const netBalance = totalIncome - totalExpense;

        // Transaction counts
        const [incomeCountRows] = await pool.query(`SELECT COUNT(*) as count FROM transactions ${whereClause} AND type = 'income'`, values);
        const [expenseCountRows] = await pool.query(`SELECT COUNT(*) as count FROM transactions ${whereClause} AND type = 'expense'`, values);

        // Group by category with category names
        const [byCategory] = await pool.query(`
            SELECT 
                c.name as category_name,
                t.type,
                SUM(t.amount) as total,
                COUNT(*) as transaction_count
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            ${whereClause.replace('WHERE', 'WHERE t.')}
            GROUP BY t.category_id, t.type
            ORDER BY total DESC
        `, values);

        // Group by month
        const [byMonth] = await pool.query(`
            SELECT 
                DATE_FORMAT(date, '%Y-%m') as month,
                DATE_FORMAT(date, '%M %Y') as month_name,
                type,
                SUM(amount) as total,
                COUNT(*) as transaction_count
            FROM transactions 
            ${whereClause}
            GROUP BY month, type 
            ORDER BY month ASC, type DESC
        `, values);

        // Top categories by amount
        const [topCategories] = await pool.query(`
            SELECT 
                c.name as category_name,
                t.type,
                SUM(t.amount) as total,
                COUNT(*) as transaction_count
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            ${whereClause.replace('WHERE', 'WHERE t.')}
            GROUP BY t.category_id, t.type
            ORDER BY total DESC
            LIMIT 10
        `, values);

        // Average transaction amounts
        const [avgIncomeRows] = await pool.query(`SELECT AVG(amount) as avgIncome FROM transactions ${whereClause} AND type = 'income'`, values);
        const [avgExpenseRows] = await pool.query(`SELECT AVG(amount) as avgExpense FROM transactions ${whereClause} AND type = 'expense'`, values);

        // Largest transactions
        const [largestTransactions] = await pool.query(`
            SELECT 
                t.id,
                t.amount,
                t.type,
                t.date,
                t.note,
                c.name as category_name
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            ${whereClause.replace('WHERE', 'WHERE t.')}
            ORDER BY t.amount DESC
            LIMIT 5
        `, values);

        // Monthly trend (last 12 months)
        const [monthlyTrend] = await pool.query(`
            SELECT 
                DATE_FORMAT(date, '%Y-%m') as month,
                DATE_FORMAT(date, '%M %Y') as month_name,
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
                SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net
            FROM transactions 
            ${whereClause}
            AND date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY month
            ORDER BY month ASC
        `, values);

        return {
            summary: {
                totalIncome,
                totalExpense,
                netBalance,
                incomeCount: incomeCountRows[0].count,
                expenseCount: expenseCountRows[0].count,
                avgIncome: avgIncomeRows[0].avgIncome || 0,
                avgExpense: avgExpenseRows[0].avgExpense || 0
            },
            byCategory,
            byMonth,
            topCategories,
            largestTransactions,
            monthlyTrend,
            filters: {
                startDate: filters.startDate,
                endDate: filters.endDate,
                categoryIds: filters.categoryIds,
                userIds: filters.userIds
            }
        };
    } catch (error) {
        console.error('Error generating report:', error);
        throw error;
    }
};

module.exports = {
    getTransactions,
    getTransactionsCount,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getReport
};