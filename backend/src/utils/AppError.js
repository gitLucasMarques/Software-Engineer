/**
 * Classe de erro personalizada.
 * 
 * Serve para padronizar erros na aplicação, permitindo diferenciar:
 *  - Erros de cliente (status 4xx) → "fail"
 *  - Erros de servidor (status 5xx) → "error"
 * 
 * A propriedade `isOperational` ajuda a identificar erros previstos e tratados,
 * evitando que erros inesperados quebrem a aplicação.
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
