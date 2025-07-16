const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await userModel.login(username, password);
        const token = jwt.sign({ id: user.email }, process.env.JWT_SECRET);
        res.status(200).json({ token });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

const register = async (req, res) => {
    const { name, username, email, password } = req.body;
    try {
        const user = await userModel.register(name, username, email, password);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        // Get pagination and filter parameters from query string
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || 'id';
        const order = req.query.order || 'ASC';
        const offset = (page - 1) * limit;

        // Extract filters
        const filters = {
            name: req.query.name,
            username: req.query.username,
            email: req.query.email
        };

        // Get users with pagination, sorting, and filtering, and total count
        const [users, totalUsers] = await Promise.all([
            userModel.getUsers(filters, sort, order, limit, offset),
            userModel.getUsersCount(filters)
        ]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalUsers / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        // Return paginated response
        res.status(200).json({
            data: users,
            pagination: {
                currentPage: page,
                totalPages,
                totalUsers,
                limit,
                hasNextPage,
                hasPreviousPage
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await userModel.getUserById(id);
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

const createUser = async (req, res) => {
    const { name, username, email, password } = req.body;
    try {
        const user = await userModel.createUser(name, username, email, password);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, username, email, password } = req.body;
    try {
        const user = await userModel.updateUser(id, name, username, email, password);
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await userModel.deleteUser(id);
        res.status(204).send();
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

module.exports = {
    login,
    register,
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};