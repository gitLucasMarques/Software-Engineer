const path = require('path'); // Importa módulo nativo para manipular caminhos
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); 
// Carrega variáveis do arquivo .env, resolvendo o caminho corretamente

// Função auxiliar para buscar variáveis de ambiente com suporte a:
// valor padrão, obrigatoriedade e validação
function getEnvVar(varName, defaultValue = undefined, required = false) {
  const value = process.env[varName] || defaultValue;
  if (required && !value) {
    throw new Error(`Environment variable ${varName} is required but not defined.`);
  }
  return value;
}

// Objeto com todas as variáveis de ambiente centralizadas
const environment = {
  // Ambiente e porta
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  
  // Database MongoDB
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/game_ecommerce',
  
  // JWT (Autenticação)
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  
  // CORS (para permitir requisições do frontend)
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3001',
  
  // Integrações de pagamento (futuro uso)
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN,
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET
};

// Exporta o objeto configurado
module.exports = environment;
