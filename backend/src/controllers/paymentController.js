/**
 * Este módulo reúne os controladores responsáveis por iniciar e gerenciar pagamentos
 * de diferentes meios — MercadoPago, PayPal, Pix, boleto e cartão.  
 * Ele valida permissões do usuário, garante que o pedido exista, não esteja pago
 * e pertença ao solicitante, e então delega aos serviços específicos a criação das
 * transações.  
 * Também lida com webhooks externos para confirmar pagamentos, registra ou atualiza
 * dados de pagamento no banco, permite regenerar Pix/Boleto quando necessário
 * e atualiza o status do pedido após a confirmação.  
 * Em resumo: centraliza toda a orquestração de fluxo de pagamento e suas integrações.
 */

const { Order, Payment } = require('../models');
const paymentService = require('../services/paymentService');
const pixBoletoService = require('../services/pixBoletoService');

exports.createPaymentIntent = async (req, res) => {
    try {
        const { orderId, paymentMethod } = req.body;
        const userId = req.user._id;

        if (!orderId || !paymentMethod) {
            return res.status(400).json({ status: 'fail', message: 'O ID do pedido e o método de pagamento são obrigatórios.' });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado.' });
        }

        if (order.userId.toString() !== userId.toString()) {
            return res.status(403).json({ status: 'fail', message: 'Acesso negado a este pedido.' });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ status: 'fail', message: 'Este pedido já foi pago.' });
        }

        const paymentData = await paymentService.createPayment(order, paymentMethod);

        res.status(200).json({
            status: 'success',
            data: paymentData
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Erro ao iniciar o processo de pagamento.'
        });
    }
};

exports.createMercadoPagoPayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user._id;

        console.log('🔔 Requisição de pagamento MercadoPago recebida');
        console.log('👤 User ID:', userId);
        console.log('📦 Order ID:', orderId);

        if (!orderId) {
            console.error('❌ Order ID não fornecido');
            return res.status(400).json({ status: 'fail', message: 'O ID do pedido é obrigatório.' });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            console.error('❌ Pedido não encontrado:', orderId);
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado.' });
        }

        console.log('✅ Pedido encontrado:', order._id);
        console.log('👤 Owner do pedido:', order.userId);

        if (order.userId.toString() !== userId.toString()) {
            console.error('❌ Acesso negado - usuário não é dono do pedido');
            return res.status(403).json({ status: 'fail', message: 'Acesso negado a este pedido.' });
        }

        if (order.paymentStatus === 'paid') {
            console.warn('⚠️  Pedido já foi pago');
            return res.status(400).json({ status: 'fail', message: 'Este pedido já foi pago.' });
        }

        console.log('🚀 Criando pagamento MercadoPago...');
        const paymentData = await paymentService.createPayment(order, 'mercadopago');

        console.log('✅ Pagamento criado com sucesso');
        console.log('🔗 Init point:', paymentData.paymentUrl);

        res.status(200).json({
            status: 'success',
            data: {
                init_point: paymentData.paymentUrl,
                preferenceId: paymentData.preferenceId,
                payment: paymentData.payment
            }
        });

    } catch (error) {
        console.error('❌ Erro ao criar pagamento MercadoPago:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Erro ao criar pagamento MercadoPago.'
        });
    }
};

exports.createPayPalPayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user._id;

        if (!orderId) {
            return res.status(400).json({ status: 'fail', message: 'O ID do pedido é obrigatório.' });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado.' });
        }

        if (order.userId.toString() !== userId.toString()) {
            return res.status(403).json({ status: 'fail', message: 'Acesso negado a este pedido.' });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ status: 'fail', message: 'Este pedido já foi pago.' });
        }

        const paymentData = await paymentService.createPayment(order, 'paypal');

        res.status(200).json({
            status: 'success',
            data: {
                approvalUrl: paymentData.approvalUrl,
                orderId: paymentData.orderId,
                payment: paymentData.payment
            }
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Erro ao criar pagamento PayPal.'
        });
    }
};

exports.handleMercadoPagoWebhook = async (req, res) => {
    try {
        const notification = req.body;

        if (notification.type === 'payment') {
            const paymentId = notification.data.id;
            await paymentService.processMercadoPagoWebhook(paymentId);
        }

        res.status(200).send('Webhook recebido com sucesso.');

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Erro ao processar o webhook do MercadoPago.'
        });
    }
};

exports.handlePayPalWebhook = async (req, res) => {
    try {
        await paymentService.processPayPalWebhook(req.body);
        res.status(200).send('Webhook PayPal recebido com sucesso.');
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Erro ao processar o webhook do PayPal.'
        });
    }
};

exports.getPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findOne({
            where: { id: orderId, userId: userId },
            attributes: ['id', 'paymentStatus']
        });

        if (!order) {
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado ou não pertence a este usuário.' });
        }

        res.status(200).json({
            status: 'success',
            data: {
                orderId: order.id,
                paymentStatus: order.paymentStatus
            }
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erro ao verificar o status do pagamento.'
        });
    }
};

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

        const order = await Order.findById(orderId).populate('userId');

        if (!order) {
            console.error('❌ [PIX] Pedido não encontrado:', orderId);
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado.' });
        }

        console.log('✅ [PIX] Pedido encontrado:', order._id);
        console.log('👤 [PIX] Dono do pedido:', order.userId._id);

        if (order.userId._id.toString() !== userId.toString()) {
            console.error('❌ [PIX] Acesso negado - usuário não é dono do pedido');
            return res.status(403).json({ status: 'fail', message: 'Acesso negado a este pedido.' });
        }

        if (order.paymentStatus === 'paid') {
            console.warn('⚠️  [PIX] Pedido já foi pago');
            return res.status(400).json({ status: 'fail', message: 'Este pedido já foi pago.' });
        }

        console.log('🚀 [PIX] Gerando código PIX...');
        const pixData = pixBoletoService.generatePixCode(
            order._id.toString(),
            order.totalAmount,
            order.userId.email
        );

        console.log('✅ [PIX] Código gerado:', pixData.transactionId);

        const payment = await Payment.findOneAndUpdate(
            { orderId: order._id },
            {
                orderId: order._id,
                userId: userId,
                amount: order.totalAmount,
                paymentMethod: 'pix',
                status: 'pending',
                transactionId: pixData.transactionId,
                paymentDetails: {
                    pixCode: pixData.pixCode,
                    expiresAt: pixData.expiresAt
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log('✅ [PIX] Pagamento salvo:', payment._id);

        res.status(200).json({
            status: 'success',
            data: {
                payment,
                pixData
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

        const order = await Order.findById(orderId).populate('userId');

        if (!order) {
            console.error('❌ [BOLETO] Pedido não encontrado:', orderId);
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado.' });
        }

        console.log('✅ [BOLETO] Pedido encontrado:', order._id);
        console.log('👤 [BOLETO] Dono do pedido:', order.userId._id);

        if (order.userId._id.toString() !== userId.toString()) {
            console.error('❌ [BOLETO] Acesso negado - usuário não é dono do pedido');
            return res.status(403).json({ status: 'fail', message: 'Acesso negado a este pedido.' });
        }

        if (order.paymentStatus === 'paid') {
            console.warn('⚠️  [BOLETO] Pedido já foi pago');
            return res.status(400).json({ status: 'fail', message: 'Este pedido já foi pago.' });
        }

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 3);

        const payerAddress = order.shippingAddress 
            ? `${order.shippingAddress.address}, ${order.shippingAddress.city} - ${order.shippingAddress.state}, CEP: ${order.shippingAddress.zipCode}`
            : 'Não informado';

        console.log('🚀 [BOLETO] Gerando boleto...');
        const boletoData = pixBoletoService.generateBoleto(
            order._id.toString(),
            order.totalAmount,
            dueDate,
            {
                name: order.userId.name,
                email: order.userId.email,
                address: payerAddress
            }
        );

        console.log('✅ [BOLETO] Boleto gerado:', boletoData.transactionId);

        const payment = await Payment.findOneAndUpdate(
            { orderId: order._id },
            {
                orderId: order._id,
                userId: userId,
                amount: order.totalAmount,
                paymentMethod: 'boleto',
                status: 'pending',
                transactionId: boletoData.transactionId,
                paymentDetails: {
                    digitableLine: boletoData.digitableLine,
                    barcode: boletoData.barcode,
                    dueDate: boletoData.dueDate,
                    installments: installments
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log('✅ [BOLETO] Pagamento salvo:', payment._id);

        res.status(200).json({
            status: 'success',
            data: {
                payment,
                boletoData
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
        const { orderId, cardId, cardData, installments = 1, paymentType = 'credit' } = req.body;
        const userId = req.user._id;

        console.log('🔵 [CARD] Requisição recebida');
        console.log('👤 User ID:', userId);
        console.log('📦 Order ID:', orderId);
        console.log('💳 Payment Type:', paymentType);
        console.log('💰 Installments:', installments);

        if (!orderId) {
            console.error('❌ [CARD] Order ID não fornecido');
            return res.status(400).json({ status: 'fail', message: 'O ID do pedido é obrigatório.' });
        }

        if (!cardId && !cardData) {
            console.error('❌ [CARD] Dados do cartão não fornecidos');
            return res.status(400).json({ status: 'fail', message: 'Dados do cartão são obrigatórios.' });
        }

        const order = await Order.findById(orderId).populate('userId');

        if (!order) {
            console.error('❌ [CARD] Pedido não encontrado:', orderId);
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado.' });
        }

        console.log('✅ [CARD] Pedido encontrado:', order._id);
        console.log('👤 [CARD] Dono do pedido:', order.userId._id);

        if (order.userId._id.toString() !== userId.toString()) {
            console.error('❌ [CARD] Acesso negado - usuário não é dono do pedido');
            return res.status(403).json({ status: 'fail', message: 'Acesso negado a este pedido.' });
        }

        if (order.paymentStatus === 'paid') {
            console.warn('⚠️  [CARD] Pedido já foi pago');
            return res.status(400).json({ status: 'fail', message: 'Este pedido já foi pago.' });
        }

        let cardInfo = cardData;

        if (cardId) {
            console.log('🔵 [CARD] Usando cartão salvo:', cardId);
            const PaymentCard = require('../models/paymentCard');
            const savedCard = await PaymentCard.findOne({ _id: cardId, userId: userId });
            
            if (!savedCard) {
                console.error('❌ [CARD] Cartão salvo não encontrado');
                return res.status(404).json({ status: 'fail', message: 'Cartão não encontrado.' });
            }

            cardInfo = {
                cardNumber: savedCard.getDecryptedCardNumber(),
                expiryMonth: savedCard.expiryMonth,
                expiryYear: savedCard.expiryYear,
                cvv: req.body.cvv
            };

            if (!cardInfo.cvv) {
                console.error('❌ [CARD] CVV não fornecido');
                return res.status(400).json({ status: 'fail', message: 'CVV é obrigatório.' });
            }
        } else {
            console.log('🔵 [CARD] Usando novo cartão');
        }

        console.log('🚀 [CARD] Processando pagamento...');
        const paymentResult = await pixBoletoService.processCardPayment(
            cardInfo,
            order.totalAmount,
            installments,
            userId,
            order._id.toString()
        );

        if (!paymentResult.success) {
            console.error('❌ [CARD] Pagamento rejeitado:', paymentResult.message);
            return res.status(400).json({
                status: 'fail',
                message: paymentResult.message
            });
        }

        console.log('✅ [CARD] Pagamento aprovado');

        const payment = await Payment.findOneAndUpdate(
            { orderId: order._id },
            {
                orderId: order._id,
                userId: userId,
                amount: order.totalAmount,
                paymentMethod: paymentType === 'credit' ? 'credit_card' : 'debit_card',
                status: 'paid',
                transactionId: paymentResult.transactionId,
                paymentDetails: {
                    authorizationCode: paymentResult.authorizationCode,
                    installments: installments,
                    installmentAmount: paymentResult.installmentAmount,
                    cardBrand: paymentResult.cardBrand,
                    lastFourDigits: paymentResult.lastFourDigits
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log('✅ [CARD] Pagamento salvo:', payment._id);

        console.log('🚀 [CARD] Atualizando pedido...');
        order.paymentStatus = 'paid';
        order.status = 'processing';
        await order.save();

        console.log('🚀 [CARD] Limpando carrinho...');
        // Limpar carrinho após pagamento aprovado
        const Cart = require('../models/cart');
        const cart = await Cart.findOne({ userId });
        if (cart) {
            cart.items = [];
            await cart.save();
            console.log('✅ [CARD] Carrinho limpo');
        } else {
            console.log('⚠️  [CARD] Carrinho não encontrado');
        }

        console.log('✅ [CARD] Pagamento concluído com sucesso');

        res.status(200).json({
            status: 'success',
            data: {
                payment,
                paymentResult
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

        const order = await Order.findById(orderId);

        if (!order) {
            console.error('❌ [SIMULATE] Pedido não encontrado:', orderId);
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado.' });
        }

        console.log('✅ [SIMULATE] Pedido encontrado:', order._id);
        console.log('👤 [SIMULATE] Dono do pedido:', order.userId);

        if (order.userId.toString() !== userId.toString()) {
            console.error('❌ [SIMULATE] Acesso negado - usuário não é dono do pedido');
            return res.status(403).json({ status: 'fail', message: 'Acesso negado a este pedido.' });
        }

        console.log('🚀 [SIMULATE] Atualizando pagamento...');
        await Payment.findOneAndUpdate(
            { orderId: order._id },
            { status: 'paid' }
        );

        console.log('🚀 [SIMULATE] Atualizando pedido...');
        order.paymentStatus = 'paid';
        order.status = 'processing';
        await order.save();

        console.log('🚀 [SIMULATE] Limpando carrinho...');
        // Limpar carrinho após pagamento aprovado
        const Cart = require('../models/cart');
        const cart = await Cart.findOne({ userId });
        if (cart) {
            cart.items = [];
            await cart.save();
            console.log('✅ [SIMULATE] Carrinho limpo');
        } else {
            console.log('⚠️  [SIMULATE] Carrinho não encontrado');
        }

        console.log('✅ [SIMULATE] Simulação concluída com sucesso');

        res.status(200).json({
            status: 'success',
            message: 'Pagamento aprovado com sucesso (simulação)'
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
