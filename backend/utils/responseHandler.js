class ResponseHandler {
    static success(res, data = null, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    }

    static error(res, error, statusCode = 500) {
        return res.status(statusCode).json({
            success: false,
            error: {
                message: error.message || 'Internal Server Error',
                ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
            },
            timestamp: new Date().toISOString()
        });
    }

    static paginated(res, data, pagination) {
        return res.status(200).json({
            success: true,
            data,
            pagination: {
                currentPage: pagination.currentPage,
                totalPages: pagination.totalPages,
                totalItems: pagination.totalItems,
                limit: pagination.limit,
                hasNextPage: pagination.hasNextPage,
                hasPreviousPage: pagination.hasPreviousPage
            },
            timestamp: new Date().toISOString()
        });
    }

    static created(res, data, message = 'Resource created successfully') {
        return this.success(res, data, message, 201);
    }

    static noContent(res) {
        return res.status(204).send();
    }
}

module.exports = ResponseHandler; 