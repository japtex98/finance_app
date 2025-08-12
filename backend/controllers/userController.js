const userModel = require('../models/userModel');
const { generateToken } = require('../middlewares/authenticationMiddleware');
const ResponseHandler = require('../utils/responseHandler');
const { AppError } = require('../middlewares/errorMiddleware');

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await userModel.login(username, password);

        // Remove password from response
        const { password: _unused, ...userWithoutPassword } = user;

        const token = generateToken({
            id: user.id,
            email: user.email,
            username: user.username
        });

        ResponseHandler.success(res, {
            user: userWithoutPassword,
            token
        }, 'Login successful');
    } catch (error) {
        next(error);
    }
};

const register = async (req, res, next) => {
    try {
        const { name, username, email, password } = req.body;
        const user = await userModel.register(name, username, email, password);

        // Remove password from response
        const { password: _unused, ...userWithoutPassword } = user;

        ResponseHandler.created(res, userWithoutPassword, 'User registered successfully');
    } catch (error) {
        next(error);
    }
};

const getUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || 'id';
        const order = req.query.order || 'ASC';
        const offset = (page - 1) * limit;

        const filters = {
            name: req.query.name,
            username: req.query.username,
            email: req.query.email
        };

        const [users, totalUsers] = await Promise.all([
            userModel.getUsers(filters, sort, order, limit, offset),
            userModel.getUsersCount(filters)
        ]);

        // Remove passwords from response
        const usersWithoutPasswords = users.map(user => {
            const { password: _unused, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        const totalPages = Math.ceil(totalUsers / limit);
        const pagination = {
            currentPage: page,
            totalPages,
            totalItems: totalUsers,
            limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        };

        ResponseHandler.paginated(res, usersWithoutPasswords, pagination);
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await userModel.getUserById(id);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Remove password from response
        const { password: _unused, ...userWithoutPassword } = user;

        ResponseHandler.success(res, userWithoutPassword);
    } catch (error) {
        next(error);
    }
};

const createUser = async (req, res, next) => {
    try {
        const { name, username, email, password } = req.body;
        const user = await userModel.createUser(name, username, email, password);

        // Remove password from response
        const { password: _unused, ...userWithoutPassword } = user;

        ResponseHandler.created(res, userWithoutPassword);
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, username, email, password } = req.body;

        const user = await userModel.updateUser(id, name, username, email, password);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Remove password from response
        const { password: _unused, ...userWithoutPassword } = user;

        ResponseHandler.success(res, userWithoutPassword, 'User updated successfully');
    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await userModel.deleteUser(id);

        if (!result) {
            throw new AppError('User not found', 404);
        }

        ResponseHandler.noContent(res);
    } catch (error) {
        next(error);
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