/**
 * Controlador de Pagamentos - Sistema Completo de Checkout
 * 
 * Implementa 4 métodos de pagamento:
 * 1. PIX - Gera QR Code e código para cópia
 * 2. Boleto - Gera código de barras com opção de parcelas
 * 3. Cartão de Crédito - Salva cartão e permite parcelamento
 * 4. Cartão de Débito - Salva cartão (sem parcelamento)
 * 
 * Todos geram comprovante/nota fiscal após pagamento
 */

const { Order, Cart, PaymentCard } = require('../models');
const crypto = require('crypto');

// ==================== PIX ====================
exports.createPixPayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user._id;

        const order = await Order.findById(orderId)
            .populate('userId')
            .populate('items.productId');

        if (!order) {
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado.' });
        }

        if (order.userId._id.toString() !== userId.toString()) {
            return res.status(403).json({ status: 'fail', message: 'Acesso negado a este pedido.' });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ status: 'fail', message: 'Este pedido já foi pago.' });
        }

        // Gerar código PIX simulado
        const pixCode = generatePixCode(order.totalAmount);
        const pixQRCode = generateQRCodeData(pixCode);
        const transactionId = generateTransactionId();
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

        // Atualizar pedido com dados do PIX
        order.paymentMethod = 'pix';
        order.paymentDetails = {
            pixCode,
            pixQRCode,
            pixExpiresAt: expiresAt,
            transactionId
        };
        await order.save();

        res.status(200).json({
            status: 'success',
            data: {
                orderId: order._id,
                pixCode,
                pixQRCode,
                amount: order.totalAmount,
                expiresAt,
                transactionId,
                message: 'Código PIX gerado. Realize o pagamento para confirmar o pedido.'
            }
        });

    } catch (error) {
        console.error('Erro ao criar pagamento PIX:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao gerar pagamento PIX.'
        });
    }
};

exports.confirmPixPayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user._id;

        const order = await Order.findById(orderId)
            .populate('userId')
            .populate('items.productId');

        if (!order) {
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado.' });
        }

        if (order.userId._id.toString() !== userId.toString()) {
            return res.status(403).json({ status: 'fail', message: 'Acesso negado.' });
        }

        // Simular confirmação de pagamento
        order.paymentStatus = 'paid';
        order.status = 'processing';
        order.paymentDetails.paymentDate = new Date();
        await order.save();

        // Limpar carrinho após pagamento confirmado
        await Cart.findOneAndUpdate(
            { userId },
            { $set: { items: [] } }
        );

        res.status(200).json({
            status: 'success',
            data: {
                order,
                message: 'Pagamento confirmado com sucesso!'
            }
        });

    } catch (error) {
        console.error('Erro ao confirmar pagamento PIX:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao confirmar pagamento.'
        });
    }
};

// ==================== BOLETO ====================
exports.createBoletoPayment = async (req, res) => {
    try {
        const { orderId, installments = 1 } = req.body;
        const userId = req.user._id;

        if (installments < 1 || installments > 12) {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'Parcelas inválidas. Escolha entre 1 e 12.' 
            });
        }

        const order = await Order.findById(orderId)
            .populate('userId')
            .populate('items.productId');

        if (!order) {
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado.' });
        }

        if (order.userId._id.toString() !== userId.toString()) {
            return res.status(403).json({ status: 'fail', message: 'Acesso negado.' });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ status: 'fail', message: 'Este pedido já foi pago.' });
        }

        // Gerar boleto simulado
        const boletoCode = generateBoletoCode();
        const boletoBarcode = generateBoletoBarcode();
        const transactionId = generateTransactionId();
        const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 dias
        const installmentAmount = order.totalAmount / installments;

        // Atualizar pedido com dados do boleto
        order.paymentMethod = 'boleto';
        order.paymentDetails = {
            boletoCode,
            boletoBarcode,
            boletoDueDate: dueDate,
            boletoInstallments: installments,
            transactionId
        };
        await order.save();

        res.status(200).json({
            status: 'success',
            data: {
                orderId: order._id,
                boletoCode,
                boletoBarcode,
                amount: order.totalAmount,
                installments,
                installmentAmount: installmentAmount.toFixed(2),
                dueDate,
                transactionId,
                message: 'Boleto gerado. Pague até a data de vencimento.'
            }
        });

    } catch (error) {
        console.error('Erro ao criar boleto:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao gerar boleto.'
        });
    }
};

exports.confirmBoletoPayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user._id;

        const order = await Order.findById(orderId)
            .populate('userId')
            .populate('items.productId');

        if (!order) {
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado.' });
        }

        if (order.userId._id.toString() !== userId.toString()) {
            return res.status(403).json({ status: 'fail', message: 'Acesso negado.' });
        }

        // Simular confirmação de pagamento
        order.paymentStatus = 'paid';
        order.status = 'processing';
        order.paymentDetails.paymentDate = new Date();
        await order.save();

        // Limpar carrinho
        await Cart.findOneAndUpdate(
            { userId },
            { $set: { items: [] } }
        );

        res.status(200).json({
            status: 'success',
            data: {
                order,
                message: 'Pagamento do boleto confirmado!'
            }
        });

    } catch (error) {
        console.error('Erro ao confirmar boleto:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao confirmar pagamento.'
        });
    }
};

// ==================== CARTÃO ====================
exports.createCardPayment = async (req, res) => {
    try {
        const { 
            orderId, 
            cardId, 
            cardType, // 'credit_card' ou 'debit_card'
            installments = 1,
            // Se for cartão novo:
            newCard 
        } = req.body;
        
        const userId = req.user._id;

        // Validações
        if (!['credit_card', 'debit_card'].includes(cardType)) {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'Tipo de cartão inválido.' 
            });
        }

        if (cardType === 'debit_card' && installments > 1) {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'Cartão de débito não permite parcelamento.' 
            });
        }

        if (cardType === 'credit_card' && (installments < 1 || installments > 12)) {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'Parcelas inválidas. Escolha entre 1 e 12.' 
            });
        }

        const order = await Order.findById(orderId)
            .populate('userId')
            .populate('items.productId');

        if (!order) {
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado.' });
        }

        if (order.userId._id.toString() !== userId.toString()) {
            return res.status(403).json({ status: 'fail', message: 'Acesso negado.' });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ status: 'fail', message: 'Este pedido já foi pago.' });
        }

        let card;

        // Se é um cartão novo, salvar
        if (newCard) {
            card = new PaymentCard({
                userId,
                cardNumber: newCard.cardNumber,
                cardHolderName: newCard.cardHolderName,
                expiryMonth: newCard.expiryMonth,
                expiryYear: newCard.expiryYear,
                cvv: newCard.cvv,
                isDefault: newCard.isDefault || false
            });
            await card.save();
        } else if (cardId) {
            // Buscar cartão existente
            card = await PaymentCard.findOne({ _id: cardId, userId });
            if (!card) {
                return res.status(404).json({ 
                    status: 'fail', 
                    message: 'Cartão não encontrado.' 
                });
            }
        } else {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'Forneça um cartão existente ou cadastre um novo.' 
            });
        }

        const transactionId = generateTransactionId();
        const installmentAmount = order.totalAmount / installments;

        // Atualizar pedido com dados do cartão
        order.paymentMethod = cardType;
        order.paymentDetails = {
            cardLast4: card.lastFourDigits,
            cardBrand: card.cardBrand,
            cardType,
            cardInstallments: installments,
            cardHolderName: card.cardHolderName,
            transactionId,
            paymentDate: new Date()
        };
        order.paymentStatus = 'paid';
        order.status = 'processing';
        await order.save();

        // Limpar carrinho
        await Cart.findOneAndUpdate(
            { userId },
            { $set: { items: [] } }
        );

        res.status(200).json({
            status: 'success',
            data: {
                order,
                cardLast4: card.lastFourDigits,
                cardBrand: card.cardBrand,
                installments,
                installmentAmount: installmentAmount.toFixed(2),
                transactionId,
                message: 'Pagamento processado com sucesso!',
                savedCard: !!cardId // Indica se usou cartão salvo
            }
        });

    } catch (error) {
        console.error('Erro ao processar pagamento com cartão:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao processar pagamento.'
        });
    }
};

// ==================== CARTÕES SALVOS ====================
exports.getUserCards = async (req, res) => {
    try {
        const userId = req.user._id;
        const cards = await PaymentCard.find({ userId }).select('-cardNumber -cvv');

        res.status(200).json({
            status: 'success',
            results: cards.length,
            data: { cards }
        });

    } catch (error) {
        console.error('Erro ao buscar cartões:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao buscar cartões salvos.'
        });
    }
};

exports.deleteCard = async (req, res) => {
    try {
        const { cardId } = req.params;
        const userId = req.user._id;

        const card = await PaymentCard.findOneAndDelete({ _id: cardId, userId });

        if (!card) {
            return res.status(404).json({ 
                status: 'fail', 
                message: 'Cartão não encontrado.' 
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Cartão removido com sucesso.'
        });

    } catch (error) {
        console.error('Erro ao remover cartão:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao remover cartão.'
        });
    }
};

// ==================== COMPROVANTE ====================
exports.getReceipt = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findById(orderId)
            .populate('userId')
            .populate('items.productId');

        if (!order) {
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado.' });
        }

        if (order.userId._id.toString() !== userId.toString()) {
            return res.status(403).json({ status: 'fail', message: 'Acesso negado.' });
        }

        // Gerar dados do comprovante
        const receipt = {
            orderId: order._id,
            transactionId: order.paymentDetails?.transactionId,
            date: order.paymentDetails?.paymentDate || order.createdAt,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            orderStatus: order.status,
            customer: {
                name: order.shippingAddress.fullName,
                email: order.shippingAddress.email,
                phone: order.shippingAddress.phone
            },
            items: order.items.map(item => ({
                name: item.productId.name,
                quantity: item.quantity,
                price: item.price,
                total: item.quantity * item.price
            })),
            shippingAddress: order.shippingAddress,
            totalAmount: order.totalAmount,
            paymentDetails: order.paymentDetails
        };

        res.status(200).json({
            status: 'success',
            data: { receipt }
        });

    } catch (error) {
        console.error('Erro ao gerar comprovante:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao gerar comprovante.'
        });
    }
};

// ==================== FUNÇÕES AUXILIARES ====================

function generatePixCode(amount) {
    // Simula código PIX Copia e Cola
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    const amountStr = amount.toFixed(2).replace('.', '');
    return `00020126360014BR.GOV.BCB.PIX0114+5511999999999520400005303986540${amountStr}5802BR5925GAME ECOMMERCE LTDA6009SAO PAULO62070503***6304${random.toUpperCase()}`;
}

function generateQRCodeData(pixCode) {
    // Retorna uma URL base64 simulada de QR Code
    // Em produção, use uma biblioteca como 'qrcode' para gerar o QR real
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
}

function generateBoletoCode() {
    // Gera linha digitável do boleto (47 dígitos)
    const part1 = '23793';
    const part2 = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const part3 = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const part4 = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const part5 = Math.floor(Math.random() * 10).toString();
    const part6 = Math.floor(Math.random() * 10000000000000).toString().padStart(14, '0');
    
    return `${part1}.${part2} ${part3}.${part4} ${part5} ${part6}`;
}

function generateBoletoBarcode() {
    // Gera código de barras (44 dígitos numéricos)
    return Array.from({ length: 44 }, () => Math.floor(Math.random() * 10)).join('');
}

function generateTransactionId() {
    return `TXN${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

module.exports = exports;
