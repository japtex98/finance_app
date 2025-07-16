const pool = require('../config/db');
const bcrypt = require('bcrypt');

const login = async (username, password) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
        throw new Error('User not found');
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }

    return user;
};

const register = async (name, username, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [rows] = await pool.query('INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)', [name, username, email, hashedPassword]);
    return rows[0];
};

const buildUserFilterQuery = (filters = {}) => {
    const conditions = [];
    const values = [];
    if (filters.name) {
        conditions.push('name LIKE ?');
        values.push(`%${filters.name}%`);
    }
    if (filters.username) {
        conditions.push('username LIKE ?');
        values.push(`%${filters.username}%`);
    }
    if (filters.email) {
        conditions.push('email LIKE ?');
        values.push(`%${filters.email}%`);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, values };
};

const getUsers = async (filters = {}, sort = 'id', order = 'ASC', limit = 10, offset = 0) => {
    const { whereClause, values } = buildUserFilterQuery(filters);
    // Validate sort and order to prevent SQL injection
    const allowedSort = ['id', 'name', 'username', 'email'];
    const allowedOrder = ['ASC', 'DESC'];
    const sortBy = allowedSort.includes(sort) ? sort : 'id';
    const sortOrder = allowedOrder.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';
    const query = `SELECT * FROM users ${whereClause} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    const params = [...values, limit, offset];
    const [rows] = await pool.query(query, params);
    return rows;
};

const getUsersCount = async (filters = {}) => {
    const { whereClause, values } = buildUserFilterQuery(filters);
    const query = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const [rows] = await pool.query(query, values);
    return rows[0].total;
};

const getUserById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
};

const createUser = async (name, username, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [rows] = await pool.query('INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)', [name, username, email, hashedPassword]);
    return rows[0];
};

const updateUser = async (id, name, username, email, password) => {
    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [rows] = await pool.query('UPDATE users SET name = ?, username = ?, email = ?, password = ? WHERE id = ?', [name, username, email, hashedPassword, id]);
    } else {
        const [rows] = await pool.query('UPDATE users SET name = ?, username = ?, email = ? WHERE id = ?', [name, username, email, id]);
    }
    return rows[0];
};

const deleteUser = async (id) => {
    const [rows] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return rows[0];
};

module.exports = {
    login,
    register,
    getUsers,
    getUsersCount,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};