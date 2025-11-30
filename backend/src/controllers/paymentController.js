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

// ===== NOVOS MÉTODOS DE PAGAMENTO =====

exports.createPixPayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user._id;

        if (!orderId) {
            return res.status(400).json({ status: 'fail', message: 'O ID do pedido é obrigatório.' });
        }

        const order = await Order.findById(orderId).populate('userId');

        if (!order) {
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado.' });
        }

        if (order.userId._id.toString() !== userId.toString()) {
            return res.status(403).json({ status: 'fail', message: 'Acesso negado a este pedido.' });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ status: 'fail', message: 'Este pedido já foi pago.' });
        }

        // Gerar código PIX
        const pixData = pixBoletoService.generatePixCode(
            order._id.toString(),
            order.totalAmount,
            order.userId.email
        );

        // Buscar ou criar registro de pagamento (permite regenerar PIX)
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

        res.status(200).json({
            status: 'success',
            data: {
                payment,
                pixData
            }
        });

    } catch (error) {
        console.error('Erro ao criar pagamento PIX:', error);
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

        if (!orderId) {
            return res.status(400).json({ status: 'fail', message: 'O ID do pedido é obrigatório.' });
        }

        const order = await Order.findById(orderId).populate('userId');

        if (!order) {
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado.' });
        }

        if (order.userId._id.toString() !== userId.toString()) {
            return res.status(403).json({ status: 'fail', message: 'Acesso negado a este pedido.' });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ status: 'fail', message: 'Este pedido já foi pago.' });
        }

        // Calcular data de vencimento (3 dias úteis)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 3);

        // Formatar endereço do pagador como string
        const payerAddress = order.shippingAddress 
            ? `${order.shippingAddress.address}, ${order.shippingAddress.city} - ${order.shippingAddress.state}, CEP: ${order.shippingAddress.zipCode}`
            : 'Não informado';

        // Gerar boleto
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

        // Buscar ou criar registro de pagamento (permite regenerar boleto)
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

        res.status(200).json({
            status: 'success',
            data: {
                payment,
                boletoData
            }
        });

    } catch (error) {
        console.error('Erro ao criar boleto:', error);
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

        if (!orderId) {
            return res.status(400).json({ status: 'fail', message: 'O ID do pedido é obrigatório.' });
        }

        if (!cardId && !cardData) {
            return res.status(400).json({ status: 'fail', message: 'Dados do cartão são obrigatórios.' });
        }

        const order = await Order.findById(orderId).populate('userId');

        if (!order) {
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado.' });
        }

        if (order.userId._id.toString() !== userId.toString()) {
            return res.status(403).json({ status: 'fail', message: 'Acesso negado a este pedido.' });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ status: 'fail', message: 'Este pedido já foi pago.' });
        }

        let cardInfo = cardData;

        // Se usar cartão salvo, buscar do banco
        if (cardId) {
            const PaymentCard = require('../models/paymentCard');
            const savedCard = await PaymentCard.findOne({ _id: cardId, userId: userId });
            
            if (!savedCard) {
                return res.status(404).json({ status: 'fail', message: 'Cartão não encontrado.' });
            }

            // Descriptografar dados do cartão
            cardInfo = {
                cardNumber: savedCard.getDecryptedCardNumber(),
                expiryMonth: savedCard.expiryMonth,
                expiryYear: savedCard.expiryYear,
                cvv: req.body.cvv // CVV sempre precisa ser fornecido
            };

            if (!cardInfo.cvv) {
                return res.status(400).json({ status: 'fail', message: 'CVV é obrigatório.' });
            }
        }

        // Processar pagamento
        const paymentResult = await pixBoletoService.processCardPayment(
            cardInfo,
            order.totalAmount,
            installments,
            userId,
            order._id.toString()
        );

        if (!paymentResult.success) {
            return res.status(400).json({
                status: 'fail',
                message: paymentResult.message
            });
        }

        // Buscar ou criar registro de pagamento
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

        // Atualizar status do pedido
        order.paymentStatus = 'paid';
        order.status = 'processing';
        await order.save();

        res.status(200).json({
            status: 'success',
            data: {
                payment,
                paymentResult
            }
        });

    } catch (error) {
        console.error('Erro ao processar pagamento com cartão:', error);
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

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado.' });
        }

        if (order.userId.toString() !== userId.toString()) {
            return res.status(403).json({ status: 'fail', message: 'Acesso negado a este pedido.' });
        }

        // Atualizar payment para paid
        await Payment.findOneAndUpdate(
            { orderId: order._id },
            { status: 'paid' }
        );

        // Atualizar order
        order.paymentStatus = 'paid';
        order.status = 'processing';
        await order.save();

        res.status(200).json({
            status: 'success',
            message: 'Pagamento aprovado com sucesso (simulação)'
        });

    } catch (error) {
        console.error('Erro ao simular aprovação:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Erro ao simular aprovação.'
        });
    }
};
