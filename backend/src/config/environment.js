const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.example') });

function getEnvVar(varName, defaultValue = undefined, required = false) {
  const value = process.env[varName] || defaultValue;
  if (required && !value) {
    throw new Error(`Environment variable ${varName} is required but not defined.`);
  }
  return value;
}

const environment = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  
  // Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_NAME: process.env.DB_NAME || 'game_ecommerce',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASS: process.env.DB_PASS || '',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  
  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3001',
  
  // Payment (future use)
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN,
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET
};

module.exports = environment;
