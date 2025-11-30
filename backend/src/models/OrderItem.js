const mongoose = require('mongoose');
/**
 * Modelo OrderItem usando Mongoose.
 * Representa um item individual dentro de um pedido,
 * armazenando o ID do pedido, o produto, a quantidade e o preço no momento da compra.
 * Inclui timestamps para registrar criação e atualização de cada item.
 */

const orderItemSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;
