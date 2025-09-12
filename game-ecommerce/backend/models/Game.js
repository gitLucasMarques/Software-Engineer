const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Game = sequelize.define('Game', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discountPercentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  publisher: {
    type: DataTypes.STRING
  },
  releaseYear: {
    type: DataTypes.INTEGER
  },
  platform: {
    type: DataTypes.ENUM('PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile'),
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isDigital: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  imageUrl: {
    type: DataTypes.STRING
  },
  rating: {
    type: DataTypes.DECIMAL(3, 1),
    defaultValue: 0
  }
}, {
  timestamps: true
});

module.exports = Game;