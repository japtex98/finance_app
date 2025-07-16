const categoryModel = require('../models/categoryModel');

const listCategories = async (req, res) => {
    const { sort, order, limit, offset } = req.query;
    const categories = await categoryModel.listCategories(sort, order, limit, offset);
    res.status(200).json(categories);
}

const getCategoryById = async (req, res) => {
    const { id } = req.params;
    const category = await categoryModel.getCategoryById(id);
    res.status(200).json(category);
}

const createCategory = async (req, res) => {
    const { name } = req.body;
    try {
        const category = await categoryModel.createCategory(name);
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const category = await categoryModel.updateCategory(id, name);
        res.status(200).json(category);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await categoryModel.deleteCategory(id);
        res.status(204).send();
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}
module.exports = { listCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
