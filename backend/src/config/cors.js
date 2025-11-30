// Importa as variáveis de ambiente definidas no arquivo environment.js
const environment = require('./environment');

// Configurações de CORS que serão exportadas para uso no Express
const corsOptions = {
  // Função que valida a origem da requisição
  origin: function (origin, callback) {
    // Permite requisições sem header "Origin"
    // (caso de apps mobile, Postman, Insomnia, cURL)
    if (!origin) return callback(null, true);
    
    // Lista de domínios autorizados
    const allowedOrigins = [
      environment.FRONTEND_URL, // origem definida no .env
      'http://localhost:3000',   // dev frontend comum
      'http://localhost:3001',   // alternativa
      'http://127.0.0.1:3000',   // localhost em IPv4 direto
      'http://127.0.0.1:3001'
    ];
    
    // Verifica se a origem está na lista
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Permite acessar
    } else {
      // Log para debug quando uma origem é bloqueada
      console.warn(`CORS blocked origin: ${origin}`);
      
      // IMPORTANTE:
      // Mesmo origem não permitida, você está deixando passar.
      // Isso é útil para desenvolvimento, mas não ideal para produção.
      callback(null, true);
    }
  },

  // Permite enviar cookies, headers de autenticação e sessões
  credentials: true,

  // Métodos HTTP permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  // Headers permitidos na requisição
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control'
  ],

  // Headers que o cliente poderá enxergar na resposta
  exposedHeaders: ['Authorization'],

  // Tempo (em segundos) que o navegador pode cachear o preflight OPTIONS
  maxAge: 86400, // 24 horas

  // Força o status 200 no preflight OPTIONS (compatibilidade com navegadores)
  optionsSuccessStatus: 200
};

// Exporta o objeto para uso no servidor Express
module.exports = corsOptions;
