const pool = require('../config/db');

const listCategories = async (sort = 'id', order = 'ASC', limit = 10, offset = 0) => {
    try {
        const query = 'SELECT * FROM categories ORDER BY ? ? LIMIT ? OFFSET ?';
        const [rows] = await pool.query(query, [sort, order, limit, offset]);
        return rows;
    } catch (error) {
        console.error('Error listing categories:', error);
        throw error;
    }
};

const getCategoriesCount = async () => {
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM categories');
    return rows[0].total;
};

const getCategoryById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0];
};

const createCategory = async (name) => {
    const [rows] = await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
    return rows[0];
};

const updateCategory = async (id, name) => {
    const [rows] = await pool.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
    return rows[0];
};

const deleteCategory = async (id) => {
    const [rows] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    return rows[0];
};

module.exports = { listCategories, getCategoriesCount, getCategoryById, createCategory, updateCategory, deleteCategory };