class ResponseHandler {
    static success(res, data, message = 'Operação realizada com sucesso', statusCode = 200) {
        return res.status(statusCode).json({
            status: 'success',
            message,
            data
        });
    }

    static created(res, data, message = 'Recurso criado com sucesso') {
        return res.status(201).json({
            status: 'success',
            message,
            data
        });
    }

    static noContent(res) {
        return res.status(204).send();
    }

    static error(res, message = 'Erro na operação', statusCode = 500) {
        return res.status(statusCode).json({
            status: 'error',
            message
        });
    }

    static fail(res, message, statusCode = 400) {
        return res.status(statusCode).json({
            status: 'fail',
            message
        });
    }

    static paginated(res, data, pagination) {
        return res.status(200).json({
            status: 'success',
            results: data.length,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                totalPages: Math.ceil(pagination.total / pagination.limit),
                total: pagination.total
            },
            data
        });
    }
}

module.exports = ResponseHandler;
