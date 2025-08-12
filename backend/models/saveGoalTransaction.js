const pool = require('../config/db');

const addSaveGoalTransaction = async (saveGoalId, amount, date) => {
    const query = 'INSERT INTO save_goal_transactions (save_goal_id, amount, date) VALUES (?, ?, ?)';
    const params = [saveGoalId, amount, date];
    const [rows] = await pool.query(query, params);
    return rows[0];
};

const updateSaveGoalTransaction = async (id, saveGoalId, amount, date) => {
    const query = 'UPDATE save_goal_transactions SET save_goal_id = ?, amount = ?, date = ? WHERE id = ?';
    const params = [saveGoalId, amount, date, id];
    const [rows] = await pool.query(query, params);
    return rows[0];
};

const deleteSaveGoalTransaction = async (id) => {
    const query = 'DELETE FROM save_goal_transactions WHERE id = ?';
    const params = [id];
    const [rows] = await pool.query(query, params);
    return rows[0];
};

module.exports = {
    addSaveGoalTransaction,
    updateSaveGoalTransaction,
    deleteSaveGoalTransaction,
};