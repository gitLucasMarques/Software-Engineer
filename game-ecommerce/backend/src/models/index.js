const sequelize = require('../config/database');
const User = require('./User');
const Game = require('./Game');
const Category = require('./Category');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Cart = require('./Cart');
const CartItem = require('./CartItem');

// Definir associações entre os modelos
User.hasMany(Order);
Order.belongsTo(User);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);
OrderItem.belongsTo(Game);

User.hasOne(Cart);
Cart.belongsTo(User);

Cart.hasMany(CartItem);
CartItem.belongsTo(Cart);
CartItem.belongsTo(Game);

Game.belongsToMany(Category, { through: 'GameCategories' });
Category.belongsToMany(Game, { through: 'GameCategories' });

module.exports = {
  sequelize,
  User,
  Game,
  Category,
  Order,
  OrderItem,
  Cart,
  CartItem
};