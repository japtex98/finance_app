const pool = require('../config/db');

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
}

const getSaveGoalList = async (filters = {}, sort = 'id', order = 'ASC', limit = 10, offset = 0) => {
    const { whereClause, values } = buildSaveGoalFilterQuery(filters);
    const query = `SELECT * FROM save_goals ${whereClause} ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`;
    const params = [...values, limit, offset];
    const [rows] = await pool.query(query, params);
    return rows;
}

const getSaveGoalCount = async (filters = {}) => {
    const { whereClause, values } = buildSaveGoalFilterQuery(filters);
    const query = `SELECT COUNT(*) FROM save_goals ${whereClause}`;
    const params = [...values];
    const [rows] = await pool.query(query, params);
    return rows[0]['COUNT(*)'];
}

const getSaveGoalById = async (id) => {
    const query = `SELECT * FROM save_goals WHERE id = ?`;
    const params = [id];
    const [rows] = await pool.query(query, params);
    return rows[0];
}


const createSaveGoal = async (goalAmount, savedAmount, name, description, status, startDate, endDate) => {
    const query = `INSERT INTO save_goals (goal_amount, saved_amount, name, description, status, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [goalAmount, savedAmount, name, description, status, startDate, endDate];
    const [rows] = await pool.query(query, params);
    return rows[0];
}

const updateSaveGoal = async (id, goalAmount, savedAmount, name, description, status, startDate, endDate) => {
    const query = `UPDATE save_goals SET goal_amount = ?, saved_amount = ?, name = ?, description = ?, status = ?, start_date = ?, end_date = ? WHERE id = ?`;
    const params = [goalAmount, savedAmount, name, description, status, startDate, endDate, id];
    const [rows] = await pool.query(query, params);
    return rows[0];
}

const deleteSaveGoal = async (id) => {
    const query = `DELETE FROM save_goals WHERE id = ?`;
    const params = [id];
    const [rows] = await pool.query(query, params);
    return rows[0];
}

// const getReport = async (filters = {}) => {
//     const { whereClause, values } = buildSaveGoalFilterQuery(filters);
//     const query = `SELECT * FROM save_goals ${whereClause}`;
//     const params = [...values];
//     const [rows] = await pool.query(query, params);
//     return rows;
// }

module.exports = {
    getSaveGoalList,
    getSaveGoalCount,
    getSaveGoalById,
    createSaveGoal,
    updateSaveGoal,
    deleteSaveGoal,
}
