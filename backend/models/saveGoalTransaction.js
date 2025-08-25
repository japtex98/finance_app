const { database } = require('../config/db');

const toDateOnly = (value) => {
    if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
    }
    if (typeof value === 'string' && value.trim() !== '') {
        // assume already a valid date string (ISO or YYYY-MM-DD)
        return value;
    }
    // default: today in UTC date-only
    return new Date().toISOString().slice(0, 10);
};

const addSaveGoalTransaction = async (saveGoalId, amount, date) => {
    const insertSql = 'INSERT INTO save_goal_transactions (save_goal_id, amount, date) VALUES (?, ?, ?)';
    const updateSql = 'UPDATE save_goals SET saved_amount = COALESCE(saved_amount, 0) + ? WHERE id = ?';
    const normalizedDate = toDateOnly(date ?? undefined);

    // Run atomically so both insert and aggregate update succeed/fail together
    const result = await database.transaction(async (conn) => {
        const [insertRes] = await conn.execute(insertSql, [saveGoalId ?? null, amount ?? null, normalizedDate]);
        const [updateRes] = await conn.execute(updateSql, [amount ?? 0, saveGoalId ?? null]);
        return { insert: insertRes, update: updateRes };
    });

    return result;
};

const updateSaveGoalTransaction = async (id, saveGoalId, amount, date) => {
    // Update transaction and reconcile goal saved_amount atomically
    const result = await database.transaction(async (conn) => {
        // Fetch current transaction
        const [rows] = await conn.execute('SELECT save_goal_id, amount, date FROM save_goal_transactions WHERE id = ?', [id]);
        if (!rows || rows.length === 0) {
            return { affectedRows: 0, message: 'Transaction not found' };
        }
        const current = rows[0];

        const newGoalId = saveGoalId ?? current.save_goal_id;
        const newAmount = amount ?? current.amount;
        const newDate = date ? toDateOnly(date) : current.date;

        // Apply row update
        const [updateRowRes] = await conn.execute(
            'UPDATE save_goal_transactions SET save_goal_id = ?, amount = ?, date = ? WHERE id = ?',
            [newGoalId, newAmount, newDate, id]
        );

        // Reconcile aggregates
        if (current.save_goal_id === newGoalId) {
            const delta = (Number(newAmount) || 0) - (Number(current.amount) || 0);
            if (delta !== 0) {
                await conn.execute('UPDATE save_goals SET saved_amount = COALESCE(saved_amount, 0) + ? WHERE id = ?', [delta, newGoalId]);
            }
        } else {
            // moved to different goal: decrement old, increment new
            if (current.save_goal_id != null) {
                await conn.execute('UPDATE save_goals SET saved_amount = COALESCE(saved_amount, 0) - ? WHERE id = ?', [current.amount || 0, current.save_goal_id]);
            }
            if (newGoalId != null) {
                await conn.execute('UPDATE save_goals SET saved_amount = COALESCE(saved_amount, 0) + ? WHERE id = ?', [newAmount || 0, newGoalId]);
            }
        }

        return { update: updateRowRes };
    });

    return result;
};

const deleteSaveGoalTransaction = async (id) => {
    // Delete transaction and decrement goal saved_amount atomically
    const result = await database.transaction(async (conn) => {
        // Fetch transaction to know which goal and amount to adjust
        const [rows] = await conn.execute('SELECT save_goal_id, amount FROM save_goal_transactions WHERE id = ?', [id]);
        if (!rows || rows.length === 0) {
            return { affectedRows: 0, message: 'Transaction not found' };
        }
        const current = rows[0];

        // Decrement the goal's saved amount
        await conn.execute('UPDATE save_goals SET saved_amount = COALESCE(saved_amount, 0) - ? WHERE id = ?', [current.amount || 0, current.save_goal_id]);

        // Delete the transaction
        const [deleteRes] = await conn.execute('DELETE FROM save_goal_transactions WHERE id = ?', [id]);
        return { delete: deleteRes };
    });

    return result;
};

// New: list transactions for a goal
const listSaveGoalTransactions = async (saveGoalId) => {
    const query = 'SELECT * FROM save_goal_transactions WHERE save_goal_id = ? ORDER BY date DESC, id DESC';
    const params = [saveGoalId];
    const rows = await database.query(query, params);
    return rows;
};

module.exports = {
    addSaveGoalTransaction,
    updateSaveGoalTransaction,
    deleteSaveGoalTransaction,
    listSaveGoalTransactions,
};