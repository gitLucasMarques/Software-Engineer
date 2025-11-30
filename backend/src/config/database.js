const mongoose = require('mongoose'); // Importa o Mongoose para lidar com o MongoDB
require('dotenv').config(); // Carrega variáveis de ambiente do arquivo .env

const connectDB = async () => {
  try {
    // Obtém a URI do MongoDB a partir das variáveis de ambiente.
    // Caso não exista, usa um banco local como fallback.
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/game_ecommerce';
    
    // Tenta conectar ao MongoDB
    await mongoose.connect(mongoUri);
    
    console.log('✓ MongoDB connected successfully'); // Loga sucesso na conexão
    
    // Listener para erros na conexão existente
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    // Listener para quando a conexão for desconectada
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
  } catch (error) {
    // Caso a conexão falhe, exibe o erro e encerra o processo
    console.error('✗ Unable to connect to MongoDB:', error);
    process.exit(1);
  }
};

// Exporta o mongoose e a função de conexão
module.exports = { mongoose, connectDB };
