const express = require('express');
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/authenticationMiddleware');

const router = express.Router();

router.post('/login', userController.login);
router.post('/register', userController.register);
router.get('/users', authenticateToken, userController.getUsers);
router.get('/users/:id', authenticateToken, userController.getUserById);
router.post('/users', authenticateToken, userController.createUser);
router.put('/users/:id', authenticateToken, userController.updateUser);
router.delete('/users/:id', authenticateToken, userController.deleteUser);

module.exports = router;