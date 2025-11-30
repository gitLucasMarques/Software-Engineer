const mongoose = require('mongoose');
/**
 * Modelo de Pagamento (Payment) usando Mongoose.
 * Armazena informações sobre o pagamento de um pedido,
 * incluindo método utilizado, valor, status, usuário responsável
 * e detalhes adicionais da transação. Cada pedido possui apenas
 * um registro de pagamento. Utiliza timestamps automáticos.
 */

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    transactionId: {
        type: String
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentDetails: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;