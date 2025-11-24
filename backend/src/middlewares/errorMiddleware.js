const errorMiddleware = (err, req, res, next) => {
    console.error('Error Stack:', err.stack);

    // Erro de validação do Sequelize
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            status: 'fail',
            message: 'Erro de validação',
            errors: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    // Erro de constraint único do Sequelize
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
            status: 'fail',
            message: 'Registro duplicado',
            errors: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    // Erro de FK do Sequelize
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
            status: 'fail',
            message: 'Erro de relacionamento entre dados'
        });
    }

    // Erro de Database Connection
    if (err.name === 'SequelizeConnectionError') {
        return res.status(503).json({
            status: 'error',
            message: 'Erro de conexão com o banco de dados'
        });
    }

    // Erro de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'fail',
            message: 'Token inválido'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            status: 'fail',
            message: 'Token expirado'
        });
    }

    // Erro de sintaxe JSON
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            status: 'fail',
            message: 'JSON inválido no corpo da requisição'
        });
    }

    // Erro customizado
    if (err.isOperational) {
        return res.status(err.statusCode || 500).json({
            status: err.status || 'error',
            message: err.message
        });
    }

    // Erro genérico
    res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message || 'Erro interno do servidor',
        ...(process.env.NODE_ENV === 'development' && {
            error: err,
            stack: err.stack
        })
    });
};

module.exports = errorMiddleware;