const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/game_ecommerce';
    
    await mongoose.connect(mongoUri);
    
    console.log('✓ MongoDB connected successfully');
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
  } catch (error) {
    console.error('✗ Unable to connect to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = { mongoose, connectDB };