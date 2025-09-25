const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.protect = async (req, res, next) => {
  let token;

  // Verificar se o token está no header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extrair o token do header
      token = req.headers.authorization.split(' ')[1];

      // Verificar o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar o usuário pelo ID do token e excluir a senha dos dados retornados
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({
        success: false,
        error: 'Não autorizado, token inválido'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Não autorizado, sem token'
    });
  }
};

// Middleware para verificar permissões de admin
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado. Apenas administradores podem acessar este recurso'
    });
  }
};