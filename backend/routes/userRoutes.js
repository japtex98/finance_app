const express = require('express');
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/authenticationMiddleware');

const router = express.Router();

router.post('/login', userController.login);
router.post('/register', userController.register);
router.get('/users', authenticateToken, userController.getUsers);

module.exports = router;