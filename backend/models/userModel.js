const pool = require('../config/db');
const bcrypt = require('bcrypt');

const login = async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, hashedPassword]);
    if (rows.length === 0) {
        throw new Error('Invalid email or password');
    }
    return rows[0];
};

const register = async (name, username, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [rows] = await pool.query('INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)', [name, username, email, hashedPassword]);
    return rows[0];
};

const getUsers = async () => {
    const [rows] = await pool.query('SELECT * FROM users');
    return rows;
};


module.exports = {
    login,
    register,
    getUsers
};