/**
 * Middleware global de tratamento de erros.
 * Ele captura qualquer erro lançado na aplicação e retorna respostas padronizadas.
 * Trata especificamente erros do Mongoose (validação, duplicidade, cast, conexão),
 * erros de JWT, erros de JSON malformado e erros operacionais customizados.
 * Para erros desconhecidos, retorna uma resposta genérica de erro interno,
 * exibindo detalhes adicionais apenas em ambiente de desenvolvimento.
 */

const errorMiddleware = (err, req, res, next) => {
    console.error('Error Stack:', err.stack);

    // Erro de validação do Mongoose
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'fail',
            message: 'Erro de validação',
            errors: Object.values(err.errors).map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    // Erro de duplicação de chave única no MongoDB
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(409).json({
            status: 'fail',
            message: `Registro duplicado: ${field} já existe`
        });
    }

    // Erro de Cast (ID inválido) do Mongoose
    if (err.name === 'CastError') {
        return res.status(400).json({
            status: 'fail',
            message: `ID inválido: ${err.value}`
        });
    }

    // Erro de conexão com MongoDB
    if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
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