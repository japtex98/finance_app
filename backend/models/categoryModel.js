const { database } = require('../config/db');

const listCategories = async (sort = 'id', order = 'ASC', limit = 10, offset = 0) => {
    try {
        const allowedSort = ['id', 'name', 'type', 'created_at'];
        const allowedOrder = ['ASC', 'DESC'];
        const sortBy = allowedSort.includes(sort) ? sort : 'id';
        const sortOrder = allowedOrder.includes(String(order).toUpperCase()) ? String(order).toUpperCase() : 'ASC';
        const safeLimit = Math.max(0, parseInt(limit, 10) || 10);
        const safeOffset = Math.max(0, parseInt(offset, 10) || 0);
        const query = `SELECT * FROM categories ORDER BY ${sortBy} ${sortOrder} LIMIT ${safeLimit} OFFSET ${safeOffset}`;
        const rows = await database.query(query);
        return rows;
    } catch (error) {
        console.error('Error listing categories:', error);
        throw error;
    }
};

const getCategoriesCount = async () => {
    const rows = await database.query('SELECT COUNT(*) as total FROM categories');
    return rows[0].total;
};

const getCategoryById = async (id) => {
    const rows = await database.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0];
};

const createCategory = async (name) => {
    const result = await database.query('INSERT INTO categories (name) VALUES (?)', [name]);
    return result;
};

const updateCategory = async (id, name) => {
    const result = await database.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
    return result;
};

const deleteCategory = async (id) => {
    const result = await database.query('DELETE FROM categories WHERE id = ?', [id]);
    return result;
};

module.exports = { listCategories, getCategoriesCount, getCategoryById, createCategory, updateCategory, deleteCategory };