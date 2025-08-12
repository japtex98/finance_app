const jwt = require('jsonwebtoken');
const { AppError } = require('./errorMiddleware');

const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            throw new AppError('Access token required', 401);
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    throw new AppError('Token expired', 401);
                } else if (err.name === 'JsonWebTokenError') {
                    throw new AppError('Invalid token', 401);
                } else {
                    throw new AppError('Token verification failed', 401);
                }
            }

            req.user = decoded;
            next();
        });
    } catch (error) {
        next(error);
    }
};

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
};

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
    authenticateToken,
    generateToken,
    verifyToken
};