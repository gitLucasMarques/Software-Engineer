const rateLimit = require('express-rate-limit');
const environment = require('../config/environment');

const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: environment.NODE_ENV === 'development' ? 1000 : 100, // 1000 em dev, 100 em prod
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Pular rate limit para rotas de health check
    return req.path === '/health' || req.path === '/api/health';
  }
});

module.exports = rateLimitMiddleware;