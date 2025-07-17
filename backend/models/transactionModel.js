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
}

const getTransactionsCount = async (filters = {}) => {
    const { whereClause, values } = buildTransactionFilterQuery(filters);
    const query = `SELECT COUNT(*) FROM transactions ${whereClause}`;
    const params = [...values];
    const [rows] = await pool.query(query, params);
    return rows[0]['COUNT(*)'];
}

const getTransactionById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [id]);
    return rows[0];
}

const createTransaction = async (userId, categoryId, amount, type, date, note = '') => {
    const [rows] = await pool.query('INSERT INTO transactions (user_id, category_id, amount, type, date, note) VALUES (?, ?, ?, ?, ?, ?)', [userId, categoryId, amount, type, date, note]);
    return rows[0];
}

const updateTransaction = async (id, userId, categoryId, amount, type, date, note = '') => {
    const [rows] = await pool.query('UPDATE transactions SET user_id = ?, category_id = ?, amount = ?, type = ?, date = ?, note = ? WHERE id = ?', [userId, categoryId, amount, type, date, note, id]);
    return rows[0];
}

const deleteTransaction = async (id) => {
    const [rows] = await pool.query('DELETE FROM transactions WHERE id = ?', [id]);
    return rows[0];
}