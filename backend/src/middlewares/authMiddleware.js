const jwt = require('jsonwebtoken');
const { User } = require('../models');
const environment = require('../config/environment');

const authMiddleware = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                status: 'fail',
                message: 'Você não está autenticado. Por favor, faça login.'
            });
        }

        const decoded = jwt.verify(token, environment.JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                status: 'fail',
                message: 'O usuário pertencente a este token não existe mais.'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                status: 'fail',
                message: 'Esta conta foi desativada.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 'fail',
                message: 'Token inválido. Por favor, faça login novamente.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'fail',
                message: 'Seu token expirou. Por favor, faça login novamente.'
            });
        }
        return res.status(500).json({
            status: 'error',
            message: 'Erro ao verificar autenticação.'
        });
    }
};

module.exports = authMiddleware;