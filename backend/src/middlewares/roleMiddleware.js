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
