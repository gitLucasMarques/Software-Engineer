const jwt = require('jsonwebtoken'); 
// Importa a biblioteca jsonwebtoken para gerar, verificar e decodificar tokens JWT

const environment = require('./environment'); 
// Importa as variáveis de ambiente configuradas no arquivo environment.js

// Verifica se a chave secreta do JWT está definida
if (!environment.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables.');
}

// Verifica se o tempo de expiração do JWT está definido
if (!environment.JWT_EXPIRES_IN) {
  throw new Error('JWT_EXPIRES_IN is not defined in the environment variables.');
}

// Objeto de configuração do JWT contendo funções utilitárias
const jwtConfig = {
  secret: environment.JWT_SECRET, // Chave secreta usada para assinar os tokens
  expiresIn: environment.JWT_EXPIRES_IN, // Tempo de expiração dos tokens

  // Função para gerar um token com base em um payload
  generateToken: (payload) => {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn // Define o tempo de expiração
    });
  },
  
  // Função para verificar e validar um token JWT
  verifyToken: (token) => {
    try {
      return jwt.verify(token, jwtConfig.secret); // Verifica a assinatura e validade do token
    } catch (error) {
      // Tratamento de erros específicos
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired.'); // Token expirou
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token.'); // Token malformado ou inválido
      } else {
        throw new Error('Failed to verify token.'); // Outro tipo de erro
      }
    }
  },
  
  // Função para decodificar o token sem verificar sua assinatura
  decodeToken: (token) => {
    return jwt.decode(token);
  }
};

// Exporta a configuração e funções relacionadas ao JWT
module.exports = jwtConfig;
