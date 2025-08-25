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

    const mapped = saveGoalList.map((g) => ({
        id: g.id,
        name: g.name,
        targetAmount: g.goal_amount !== undefined && g.goal_amount !== null ? Number(g.goal_amount) : 0,
        currentAmount: g.saved_amount !== undefined && g.saved_amount !== null ? Number(g.saved_amount) : 0,
        deadline: g.end_date,
        startDate: g.start_date,
        status: g.status,
        description: g.description,
        type: g.type || 'savings'
    }));

    res.status(200).json(mapped);
};

const toDateOnly = (value) => {
    if (!value) return null;
    const d = (value instanceof Date) ? value : new Date(value);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString().slice(0, 10);
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
        const now = new Date();
        const defaultStartDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        const goalAmount = req.body.goalAmount ?? req.body.targetAmount;
        const savedAmount = (req.body.savedAmount ?? req.body.currentAmount ?? 0);
        const endDateRaw = req.body.endDate ?? req.body.deadline;
        const startDateRaw = req.body.startDate ?? defaultStartDate;
        const name = req.body.name;
        const description = (req.body.description ?? null);
        const status = (req.body.status ?? 'active');

        const endDate = toDateOnly(endDateRaw);
        const startDate = toDateOnly(startDateRaw);

        const saveGoal = await saveGoalModel.createSaveGoal(goalAmount, savedAmount, name, description, status, startDate, endDate);
        res.status(201).json(saveGoal);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateSaveGoal = async (req, res) => {
    try {
        const { id } = req.params;

        const updates = {
            goalAmount: (req.body.goalAmount ?? req.body.targetAmount),
            savedAmount: (req.body.savedAmount ?? req.body.currentAmount),
            name: req.body.name,
            description: (req.body.description ?? null),
            status: (req.body.status ?? undefined),
            startDate: req.body.startDate ? toDateOnly(req.body.startDate) : undefined,
            endDate: (req.body.endDate ?? req.body.deadline) ? toDateOnly(req.body.endDate ?? req.body.deadline) : undefined
        };

        const saveGoal = await saveGoalModel.updateSaveGoal(id, updates);
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
        const { contributionId } = req.params;
        const { goalId } = req.params;
        const { amount, date } = req.body;
        const saveGoalTransaction = await saveGoalTransactionModel.updateSaveGoalTransaction(contributionId, goalId, amount, date);
        res.status(200).json(saveGoalTransaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteSaveGoalTransaction = async (req, res) => {
    try {
        const { contributionId } = req.params;
        const saveGoalTransaction = await saveGoalTransactionModel.deleteSaveGoalTransaction(contributionId);
        res.status(200).json(saveGoalTransaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// New: list contributions history for a goal
const getSaveGoalTransactions = async (req, res) => {
    try {
        const { id } = req.params;
        const rows = await saveGoalTransactionModel.listSaveGoalTransactions(id);
        const mapped = rows.map((t) => ({
            id: t.id,
            amount: Number(t.amount),
            date: t.date,
            saveGoalId: t.save_goal_id
        }));
        res.status(200).json(mapped);
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
    getSaveGoalTransactions,
};