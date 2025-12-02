const mongoose = require('mongoose');
/**
 * Modelo de Pedido (Order) usando Mongoose.
 * Representa um pedido feito por um usuário, contendo itens comprados,
 * valor total, status do pedido, status do pagamento e informações completas
 * de envio. Também armazena método de pagamento e observações.
 * Utiliza timestamps para registrar criação e atualização automaticamente.
 */

const orderItemSchema = new mongoose.Schema({
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
}, { _id: false });

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    shippingAddress: {
        fullName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            default: 'Brasil'
        }
    },
    paymentMethod: {
        type: String,
        enum: ['pix', 'boleto', 'credit_card', 'debit_card'],
        required: false // Não obrigatório na criação, será definido no pagamento
    },
    paymentDetails: {
        // Para PIX
        pixCode: String,
        pixQRCode: String,
        pixExpiresAt: Date,
        
        // Para Boleto
        boletoCode: String,
        boletoBarcode: String,
        boletoDueDate: Date,
        boletoInstallments: Number,
        
        // Para Cartão
        cardLast4: String,
        cardBrand: String,
        cardType: String, // 'credit' ou 'debit'
        cardInstallments: Number,
        cardHolderName: String,
        
        // Comum
        transactionId: String,
        paymentDate: Date,
        receiptUrl: String
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;