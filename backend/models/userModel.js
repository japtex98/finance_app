const { database } = require('../config/db');
const bcrypt = require('bcrypt');
const { AppError } = require('../middlewares/errorMiddleware');

const login = async (username, password) => {
    const rows = await database.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
        throw new AppError('Invalid credentials', 401);
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
    }

    return user;
};

const register = async (name, username, email, password) => {
    // Check if user already exists
    const existingUser = await database.query(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [username, email]
    );

    if (existingUser.length > 0) {
        throw new AppError('Username or email already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await database.query(
        'INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)',
        [name, username, email, hashedPassword]
    );

    return { id: result.insertId, name, username, email };
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
    const allowedSort = ['id', 'name', 'username', 'email', 'created_at'];
    const allowedOrder = ['ASC', 'DESC'];
    const sortBy = allowedSort.includes(sort) ? sort : 'id';
    const sortOrder = allowedOrder.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';

    const query = `SELECT id, name, username, email, created_at, updated_at FROM users ${whereClause} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    const params = [...values, limit, offset];

    return await database.query(query, params);
};

const getUsersCount = async (filters = {}) => {
    const { whereClause, values } = buildUserFilterQuery(filters);
    const query = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const rows = await database.query(query, values);
    return rows[0].total;
};

const getUserById = async (id) => {
    const rows = await database.query(
        'SELECT id, name, username, email, created_at, updated_at FROM users WHERE id = ?',
        [id]
    );
    return rows[0] || null;
};

const createUser = async (name, username, email, password) => {
    // Check if user already exists
    const existingUser = await database.query(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [username, email]
    );

    if (existingUser.length > 0) {
        throw new AppError('Username or email already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await database.query(
        'INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)',
        [name, username, email, hashedPassword]
    );

    return { id: result.insertId, name, username, email };
};

const updateUser = async (id, name, username, email, password) => {
    // Check if user exists
    const existingUser = await getUserById(id);
    if (!existingUser) {
        return null;
    }

    // Check if new username/email conflicts with other users
    if (username || email) {
        const conflictQuery = 'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?';
        const conflictParams = [username || existingUser.username, email || existingUser.email, id];
        const conflicts = await database.query(conflictQuery, conflictParams);

        if (conflicts.length > 0) {
            throw new AppError('Username or email already exists', 409);
        }
    }

    let query, params;

    if (password) {
        const hashedPassword = await bcrypt.hash(password, 12);
        query = 'UPDATE users SET name = ?, username = ?, email = ?, password = ?, updated_at = NOW() WHERE id = ?';
        params = [name, username, email, hashedPassword, id];
    } else {
        query = 'UPDATE users SET name = ?, username = ?, email = ?, updated_at = NOW() WHERE id = ?';
        params = [name, username, email, id];
    }

    await database.query(query, params);
    return await getUserById(id);
};

const deleteUser = async (id) => {
    const result = await database.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
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