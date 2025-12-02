const User = require('./user');
const Product = require('./product');
const Category = require('./category');
const Order = require('./order');
const OrderItem = require('./OrderItem');
const { Cart } = require('./cart');
const Review = require('./review');
const Payment = require('./payment');
const PaymentCard = require('./paymentCard');
const PasswordReset = require('./PasswordReset');
/**
 * Arquivo responsável por centralizar e exportar todos os modelos Mongoose da aplicação.
 * Facilita a importação dos modelos em outros módulos, agrupando:
 * User, Product, Category, Order, OrderItem, Cart, Review, Payment e PasswordReset.
 */

module.exports = {
  User,
  Product,
  Category,
  Order,
  OrderItem,
  Cart,
  Review,
  Payment,
  PaymentCard,
  PasswordReset
};
