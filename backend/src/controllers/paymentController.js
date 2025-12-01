/**
 * Controlador de Pagamentos Simulados
 * 
 * Gerencia todas as formas de pagamento:
 * - PIX: Gera QR Code e simula pagamento
 * - Boleto: Gera linha digitável e simula pagamento
 * - Cartão de Crédito: Processa e salva cartão
 * - Cartão de Débito: Processa e salva cartão
 * 
 * Todos os pagamentos geram pedidos e comprovantes completos
 */

const { Order, Payment, Cart } = require('../models');
const paymentService = require('../services/paymentService');
const pixBoletoService = require('../services/pixBoletoService');
const PaymentCard = require('../models/paymentCard');

exports.createPixPayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user._id;

        console.log('🔵 [PIX] Requisição recebida');
        console.log('👤 User ID:', userId);
        console.log('📦 Order ID:', orderId);

        if (!orderId) {
            console.error('❌ [PIX] Order ID não fornecido');
            return res.status(400).json({ status: 'fail', message: 'O ID do pedido é obrigatório.' });
        }

        const order = await Order.findById(orderId).populate('userId').populate('items.productId');

        if (!order) {
            console.error('❌ [PIX] Pedido não encontrado:', orderId);
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado.' });
        }

        console.log('✅ [PIX] Pedido encontrado:', order._id);

        if (order.userId._id.toString() !== userId.toString()) {
            console.error('❌ [PIX] Acesso negado - usuário não é dono do pedido');
            return res.status(403).json({ status: 'fail', message: 'Acesso negado a este pedido.' });
        }

        if (order.paymentStatus === 'paid') {
            console.warn('⚠️  [PIX] Pedido já foi pago');
            return res.status(400).json({ status: 'fail', message: 'Este pedido já foi pago.' });
        }

        console.log('🚀 [PIX] Gerando código PIX...');
        const result = await paymentService.processPixPayment(order);

        console.log('✅ [PIX] Código gerado com sucesso');

        res.status(200).json({
            status: 'success',
            data: {
                payment: result.payment,
                pixData: result.pixData,
                message: 'Código PIX gerado com sucesso. Escaneie o QR Code para pagar.'
            }
        });

    } catch (error) {
        console.error('❌ [PIX] Erro ao criar pagamento PIX:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Erro ao criar pagamento PIX.'
        });
    }
};

exports.createBoletoPayment = async (req, res) => {
    try {
        const { orderId, installments = 1 } = req.body;
        const userId = req.user._id;

        console.log('🔵 [BOLETO] Requisição recebida');
        console.log('👤 User ID:', userId);
        console.log('📦 Order ID:', orderId);
        console.log('💳 Installments:', installments);

        if (!orderId) {
            console.error('❌ [BOLETO] Order ID não fornecido');
            return res.status(400).json({ status: 'fail', message: 'O ID do pedido é obrigatório.' });
        }

        const order = await Order.findById(orderId).populate('userId').populate('items.productId');

        if (!order) {
            console.error('❌ [BOLETO] Pedido não encontrado:', orderId);
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado.' });
        }

        console.log('✅ [BOLETO] Pedido encontrado:', order._id);

        if (order.userId._id.toString() !== userId.toString()) {
            console.error('❌ [BOLETO] Acesso negado - usuário não é dono do pedido');
            return res.status(403).json({ status: 'fail', message: 'Acesso negado a este pedido.' });
        }

        if (order.paymentStatus === 'paid') {
            console.warn('⚠️  [BOLETO] Pedido já foi pago');
            return res.status(400).json({ status: 'fail', message: 'Este pedido já foi pago.' });
        }

        console.log('🚀 [BOLETO] Gerando boleto...');
        const result = await paymentService.processBoletoPayment(order, installments);

        console.log('✅ [BOLETO] Boleto gerado com sucesso');

        res.status(200).json({
            status: 'success',
            data: {
                payment: result.payment,
                boletoData: result.boletoData,
                message: 'Boleto gerado com sucesso. Pague até a data de vencimento.'
            }
        });

    } catch (error) {
        console.error('❌ [BOLETO] Erro ao criar boleto:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Erro ao criar boleto.'
        });
    }
};

exports.createCardPayment = async (req, res) => {
    try {
        const { orderId, cardId, cardData, installments = 1, paymentType = 'credit', saveCard = false } = req.body;
        const userId = req.user._id;

        console.log('🔵 [CARD] Requisição recebida');
        console.log('👤 User ID:', userId);
        console.log('📦 Order ID:', orderId);
        console.log('💳 Payment Type:', paymentType);
        console.log('💰 Installments:', installments);
        console.log('💾 Save Card:', saveCard);

        if (!orderId) {
            console.error('❌ [CARD] Order ID não fornecido');
            return res.status(400).json({ status: 'fail', message: 'O ID do pedido é obrigatório.' });
        }

        if (!cardId && !cardData) {
            console.error('❌ [CARD] Dados do cartão não fornecidos');
            return res.status(400).json({ status: 'fail', message: 'Dados do cartão são obrigatórios.' });
        }

        const order = await Order.findById(orderId).populate('userId').populate('items.productId');

        if (!order) {
            console.error('❌ [CARD] Pedido não encontrado:', orderId);
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado.' });
        }

        console.log('✅ [CARD] Pedido encontrado:', order._id);

        if (order.userId._id.toString() !== userId.toString()) {
            console.error('❌ [CARD] Acesso negado - usuário não é dono do pedido');
            return res.status(403).json({ status: 'fail', message: 'Acesso negado a este pedido.' });
        }

        if (order.paymentStatus === 'paid') {
            console.warn('⚠️  [CARD] Pedido já foi pago');
            return res.status(400).json({ status: 'fail', message: 'Este pedido já foi pago.' });
        }

        let cardInfo = cardData;
        let savedCard = null;

        // Se usar cartão salvo
        if (cardId) {
            console.log('🔵 [CARD] Usando cartão salvo:', cardId);
            const card = await PaymentCard.findOne({ _id: cardId, userId: userId });
            
            if (!card) {
                console.error('❌ [CARD] Cartão salvo não encontrado');
                return res.status(404).json({ status: 'fail', message: 'Cartão não encontrado.' });
            }

            cardInfo = {
                cardNumber: card.getDecryptedCardNumber(),
                cardHolderName: card.cardHolderName,
                expiryMonth: card.expiryMonth,
                expiryYear: card.expiryYear,
                cvv: req.body.cvv
            };

            if (!cardInfo.cvv) {
                console.error('❌ [CARD] CVV não fornecido');
                return res.status(400).json({ status: 'fail', message: 'CVV é obrigatório ao usar cartão salvo.' });
            }
        } else {
            console.log('🔵 [CARD] Usando novo cartão');
            
            // Salvar cartão se solicitado
            if (saveCard) {
                console.log('💾 [CARD] Salvando cartão no perfil...');
                savedCard = await paymentService.saveUserCard(userId, cardInfo, false);
                console.log('✅ [CARD] Cartão salvo:', savedCard._id);
            }
        }

        console.log('🚀 [CARD] Processando pagamento...');
        const result = await paymentService.processCardPayment(order, cardInfo, installments, paymentType);

        console.log('✅ [CARD] Pagamento aprovado');

        // Gerar comprovante
        const receipt = await paymentService.generateReceipt(order, result.payment);

        res.status(200).json({
            status: 'success',
            data: {
                payment: result.payment,
                paymentResult: result.paymentResult,
                receipt: receipt,
                savedCard: savedCard ? {
                    id: savedCard._id,
                    maskedNumber: savedCard.getMaskedCardNumber(),
                    brand: savedCard.cardBrand
                } : null,
                message: 'Pagamento aprovado com sucesso!'
            }
        });

    } catch (error) {
        console.error('❌ [CARD] Erro ao processar pagamento com cartão:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Erro ao processar pagamento com cartão.'
        });
    }
};

exports.simulatePaymentApproval = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        console.log('🔵 [SIMULATE] Requisição recebida');
        console.log('👤 User ID:', userId);
        console.log('📦 Order ID:', orderId);

        const result = await paymentService.simulatePaymentApproval(orderId, userId);

        console.log('✅ [SIMULATE] Simulação concluída com sucesso');

        res.status(200).json({
            status: 'success',
            data: {
                payment: result.payment,
                order: result.order,
                receipt: result.receipt,
                message: 'Pagamento aprovado com sucesso! Pedido em processamento.'
            }
        });

    } catch (error) {
        console.error('❌ [SIMULATE] Erro ao simular aprovação:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Erro ao simular aprovação.'
        });
    }
};

exports.getPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findOne({ _id: orderId, userId: userId });

        if (!order) {
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado ou não pertence a este usuário.' });
        }

        const payment = await Payment.findOne({ orderId: order._id });

        res.status(200).json({
            status: 'success',
            data: {
                orderId: order._id,
                orderStatus: order.status,
                paymentStatus: order.paymentStatus,
                payment: payment
            }
        });

    } catch (error) {
        console.error('❌ Erro ao verificar status:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao verificar o status do pagamento.'
        });
    }
};

exports.getReceipt = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        console.log('🔵 [RECEIPT] Requisição recebida');
        console.log('👤 User ID:', userId);
        console.log('📦 Order ID:', orderId);

        const order = await Order.findOne({ _id: orderId, userId: userId }).populate('items.productId');

        if (!order) {
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado.' });
        }

        const payment = await Payment.findOne({ orderId: order._id });

        if (!payment) {
            return res.status(404).json({ status: 'fail', message: 'Pagamento não encontrado.' });
        }

        const receipt = await paymentService.generateReceipt(order, payment);

        console.log('✅ [RECEIPT] Comprovante gerado');

        res.status(200).json({
            status: 'success',
            data: {
                receipt: receipt
            }
        });

    } catch (error) {
        console.error('❌ [RECEIPT] Erro ao gerar comprovante:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao gerar comprovante.'
        });
    }
};

// ===== GERENCIAMENTO DE CARTÕES =====

exports.getUserCards = async (req, res) => {
    try {
        const userId = req.user._id;

        console.log('🔵 [CARDS] Buscando cartões do usuário:', userId);

        const cards = await paymentService.getUserCards(userId);

        // Retornar apenas dados seguros
        const safeCards = cards.map(card => ({
            id: card._id,
            maskedNumber: card.getMaskedCardNumber(),
            cardHolderName: card.cardHolderName,
            expiryMonth: card.expiryMonth,
            expiryYear: card.expiryYear,
            cardBrand: card.cardBrand,
            isDefault: card.isDefault,
            createdAt: card.createdAt
        }));

        console.log('✅ [CARDS] Encontrados', safeCards.length, 'cartões');

        res.status(200).json({
            status: 'success',
            results: safeCards.length,
            data: {
                cards: safeCards
            }
        });

    } catch (error) {
        console.error('❌ [CARDS] Erro ao buscar cartões:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao buscar cartões.'
        });
    }
};

exports.saveCard = async (req, res) => {
    try {
        const userId = req.user._id;
        const { cardData, isDefault = false } = req.body;

        console.log('🔵 [CARDS] Salvando cartão para usuário:', userId);

        if (!cardData || !cardData.cardNumber || !cardData.cardHolderName || !cardData.expiryMonth || !cardData.expiryYear) {
            return res.status(400).json({ status: 'fail', message: 'Dados do cartão incompletos.' });
        }

        const card = await paymentService.saveUserCard(userId, cardData, isDefault);

        console.log('✅ [CARDS] Cartão salvo:', card._id);

        res.status(201).json({
            status: 'success',
            data: {
                card: {
                    id: card._id,
                    maskedNumber: card.getMaskedCardNumber(),
                    cardHolderName: card.cardHolderName,
                    expiryMonth: card.expiryMonth,
                    expiryYear: card.expiryYear,
                    cardBrand: card.cardBrand,
                    isDefault: card.isDefault
                },
                message: 'Cartão salvo com sucesso!'
            }
        });

    } catch (error) {
        console.error('❌ [CARDS] Erro ao salvar cartão:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Erro ao salvar cartão.'
        });
    }
};

exports.deleteCard = async (req, res) => {
    try {
        const userId = req.user._id;
        const { cardId } = req.params;

        console.log('🔵 [CARDS] Removendo cartão:', cardId);

        await paymentService.deleteUserCard(userId, cardId);

        console.log('✅ [CARDS] Cartão removido');

        res.status(200).json({
            status: 'success',
            message: 'Cartão removido com sucesso!'
        });

    } catch (error) {
        console.error('❌ [CARDS] Erro ao remover cartão:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Erro ao remover cartão.'
        });
    }
};

// ===== MÉTODOS DESCONTINUADOS =====

exports.createPaymentIntent = async (req, res) => {
    res.status(501).json({
        status: 'error',
        message: 'Método não implementado. Use os endpoints específicos: /pix/create, /boleto/create ou /card/create'
    });
};

exports.createMercadoPagoPayment = async (req, res) => {
    res.status(501).json({
        status: 'error',
        message: 'MercadoPago não está mais implementado. Use os métodos de pagamento disponíveis: PIX, Boleto ou Cartão.'
    });
};

exports.createPayPalPayment = async (req, res) => {
    res.status(501).json({
        status: 'error',
        message: 'PayPal não está mais implementado. Use os métodos de pagamento disponíveis: PIX, Boleto ou Cartão.'
    });
};

exports.handleMercadoPagoWebhook = async (req, res) => {
    res.status(501).send('Webhook não implementado');
};

exports.handlePayPalWebhook = async (req, res) => {
    res.status(501).send('Webhook não implementado');
};
