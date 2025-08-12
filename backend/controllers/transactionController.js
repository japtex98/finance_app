const transactionModel = require('../models/transactionModel');

const getTransactions = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'id';
    const order = req.query.order || 'ASC';
    const offset = (page - 1) * limit;

    const filters = {
        userIds: req.query.userIds,
        categoryIds: req.query.categoryIds,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
    };
    const transactions = await transactionModel.getTransactions(filters, sort, order, limit, offset);
    res.status(200).json(transactions);
}

const getTransactionById = async (req, res) => {
    const { id } = req.params;
    try {
        const transaction = await transactionModel.getTransactionById(id);
        res.status(200).json(transaction);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}

const createTransaction = async (req, res) => {
    const { userId, categoryId, amount, type, date, note } = req.body;
    try {
        const transaction = await transactionModel.createTransaction(userId, categoryId, amount, type, date, note);
        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const updateTransaction = async (req, res) => {
    const { id } = req.params;
    const { userId, categoryId, amount, type, date, note } = req.body;
    try {
        const transaction = await transactionModel.updateTransaction(id, userId, categoryId, amount, type, date, note);
        res.status(200).json(transaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const deleteTransaction = async (req, res) => {
    const { id } = req.params;
    try {
        await transactionModel.deleteTransaction(id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const getReport = async (req, res) => {
    try {
        const filters = {
            userIds: req.query.userIds,
            categoryIds: req.query.categoryIds,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
        };
        const report = await transactionModel.getReport(filters);
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getReport,
}