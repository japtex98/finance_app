const saveGoalModel = require('../models/saveGoalModel');
const saveGoalTransactionModel = require('../models/saveGoalTransaction');

const getSaveGoalList = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'id';
    const order = req.query.order || 'ASC';
    const offset = (page - 1) * limit;

    const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        status: req.query.status,
    };
    const saveGoalList = await saveGoalModel.getSaveGoalList(filters, sort, order, limit, offset);
    res.status(200).json(saveGoalList);
};

const getSaveGoalById = async (req, res) => {
    try {
        const { id } = req.params;
        const saveGoal = await saveGoalModel.getSaveGoalById(id);
        res.status(200).json(saveGoal);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

const createSaveGoal = async (req, res) => {
    try {
        const { goalAmount, savedAmount, name, description, status, startDate, endDate } = req.body;
        const saveGoal = await saveGoalModel.createSaveGoal(goalAmount, savedAmount, name, description, status, startDate, endDate);
        res.status(201).json(saveGoal);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateSaveGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const { goalAmount, savedAmount, name, description, status, startDate, endDate } = req.body;
        const saveGoal = await saveGoalModel.updateSaveGoal(id, goalAmount, savedAmount, name, description, status, startDate, endDate);
        res.status(200).json(saveGoal);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteSaveGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const saveGoal = await saveGoalModel.deleteSaveGoal(id);
        res.status(200).json(saveGoal);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const addSaveGoalTransaction = async (req, res) => {
    try {
        const { saveGoalId, amount, date } = req.body;
        const saveGoalTransaction = await saveGoalTransactionModel.addSaveGoalTransaction(saveGoalId, amount, date);
        res.status(201).json(saveGoalTransaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateSaveGoalTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { saveGoalId, amount, date } = req.body;
        const saveGoalTransaction = await saveGoalTransactionModel.updateSaveGoalTransaction(id, saveGoalId, amount, date);
        res.status(200).json(saveGoalTransaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteSaveGoalTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const saveGoalTransaction = await saveGoalTransactionModel.deleteSaveGoalTransaction(id);
        res.status(200).json(saveGoalTransaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



module.exports = {
    getSaveGoalList,
    getSaveGoalById,
    createSaveGoal,
    updateSaveGoal,
    deleteSaveGoal,
    addSaveGoalTransaction,
    updateSaveGoalTransaction,
    deleteSaveGoalTransaction,
};