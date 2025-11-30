/**
 * Middleware de controle de acesso baseado em função (RBAC).
 * Permite definir quais roles podem acessar uma rota.
 * Verifica se o usuário está autenticado e se sua role está entre as permitidas.
 * Caso contrário, bloqueia a requisição com os códigos 401 ou 403.
 */

const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'fail',
                message: 'Você não está autenticado.'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'fail',
                message: 'Você não tem permissão para realizar esta ação.'
            });
        }

        next();
    };
};

module.exports = roleMiddleware;
