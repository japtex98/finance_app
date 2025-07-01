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
        const users = await userModel.getUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    login,
    register
};