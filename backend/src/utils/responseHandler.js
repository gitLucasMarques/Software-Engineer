/**
 * ResponseHandler é um helper para padronizar as respostas da API.
 * Ele oferece métodos para diferentes tipos de respostas:
 * 
 * - success: resposta de sucesso genérica (200)
 * - created: quando um recurso é criado (201)
 * - noContent: sem conteúdo (204)
 * - error: erro inesperado do servidor (500 por padrão)
 * - fail: erro de cliente (400 por padrão)
 * - paginated: resposta com paginação, incluindo total de páginas e total de itens
 * 
 * Exemplo de uso:
 * ResponseHandler.success(res, { user: userData }, 'Usuário encontrado');
 */

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
