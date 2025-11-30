const mongoose = require('mongoose');
/**
 * Modelo de Carrinho de Compras usando Mongoose.
 * Cada carrinho pertence a um único usuário (userId) e contém uma lista de itens.
 * Cada item possui um productId referenciando um produto e uma quantidade mínima de 1.
 * O schema também utiliza timestamps para registrar criação e atualização.
 */

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    }
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema]
}, {
    timestamps: true
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = { Cart };