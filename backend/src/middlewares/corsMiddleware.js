const cors = require('cors');

const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
};

const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;
/**
 * Middleware de configuração do CORS.
 * Define quais origens podem acessar a API, quais métodos são permitidos
 * e habilita o envio de credenciais (cookies, headers de autenticação, etc.).
 * Usa as opções definidas para criar e exportar o middleware do CORS.
 */
