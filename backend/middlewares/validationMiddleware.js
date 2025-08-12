const { validationResult } = require('express-validator');
const { AppError } = require('./errorMiddleware');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        throw new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400);
    }
    next();
};

// Common validation rules
const commonValidations = {
    id: {
        in: ['params'],
        isInt: { options: { min: 1 } },
        errorMessage: 'ID must be a positive integer'
    },
    pagination: {
        page: {
            in: ['query'],
            optional: true,
            isInt: { options: { min: 1 } },
            toInt: true,
            errorMessage: 'Page must be a positive integer'
        },
        limit: {
            in: ['query'],
            optional: true,
            isInt: { options: { min: 1, max: 100 } },
            toInt: true,
            errorMessage: 'Limit must be between 1 and 100'
        }
    },
    user: {
        name: {
            in: ['body'],
            trim: true,
            isLength: { options: { min: 2, max: 50 } },
            errorMessage: 'Name must be between 2 and 50 characters'
        },
        username: {
            in: ['body'],
            trim: true,
            isLength: { options: { min: 3, max: 30 } },
            matches: { options: /^[a-zA-Z0-9_]+$/ },
            errorMessage: 'Username must be 3-30 characters, alphanumeric and underscore only'
        },
        email: {
            in: ['body'],
            isEmail: true,
            normalizeEmail: true,
            errorMessage: 'Must be a valid email address'
        },
        password: {
            in: ['body'],
            isLength: { options: { min: 6 } },
            errorMessage: 'Password must be at least 6 characters long'
        }
    },
    transaction: {
        amount: {
            in: ['body'],
            isFloat: { options: { min: 0.01 } },
            toFloat: true,
            errorMessage: 'Amount must be a positive number'
        },
        type: {
            in: ['body'],
            isIn: { options: [['income', 'expense']] },
            errorMessage: 'Type must be either income or expense'
        },
        date: {
            in: ['body'],
            isISO8601: true,
            toDate: true,
            errorMessage: 'Date must be a valid ISO date'
        }
    }
};

module.exports = {
    validate,
    commonValidations
}; 