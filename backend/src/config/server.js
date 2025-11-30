const environment = require('./environment');
// Importa as variáveis de ambiente já tratadas no arquivo environment.js

// Verifica se a variável PORT está definida
if (!environment.PORT) {
  throw new Error('PORT is not defined in the environment variables.');
}

// Verifica se a variável JWT_SECRET está definida (usada também na sessão)
if (!environment.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables.');
}

const serverConfig = {
  // Porta onde o servidor irá rodar
  port: environment.PORT,

  // Host padrão para permitir conexões externas
  host: '0.0.0.0',
  
  express: {
    // Limite do tamanho do corpo das requisições
    bodyLimit: '10mb',
    
    // Configurações de segurança fornecidas pelo Helmet
    helmet: {
      contentSecurityPolicy: false,        // Desabilita CSP para evitar conflitos em dev
      crossOriginEmbedderPolicy: false,    // Desabilita COEP para compatibilidade
      xssFilter: true,                     // Adiciona filtro contra XSS
      hidePowereredBy: true,               // Remove cabeçalho "X-Powered-By"
    },

    // Configurações de rate limit para evitar abuso do servidor
    rateLimit: {
      windowMs: 15 * 60 * 1000,            // Janela de 15 minutos
      max: 100,                            // Máximo de 100 requisições por IP
      message: 'Too many requests from this IP, please try again later.',
    },
 
    // Configuração de sessão (caso seja usada com express-session)
    session: {
      secret: environment.JWT_SECRET,      // Chave secreta usada para assinar a sessão
      resave: false,                       // Não regrava sessão sem necessidade
      saveUninitialized: false,            // Só salva se houver dados
      cookie: {
        secure: environment.NODE_ENV === 'production', // Apenas HTTPS em produção
        maxAge: 24 * 60 * 60 * 1000        // Duração do cookie: 24 horas
      }
    }
  },
  
  logging: {
    // Define o nível de logs (menos verboso em produção)
    level: environment.NODE_ENV === 'production' ? 'error' : 'debug',

    // Define formato dos logs
    format: environment.NODE_ENV === 'production' ? 'combined' : 'dev'
  }
};

// Exporta todas as configurações do servidor
module.exports = serverConfig;
