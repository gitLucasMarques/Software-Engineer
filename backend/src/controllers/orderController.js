const { Order, OrderItem, Cart, Product, User } = require('../models');
const { stockService, emailService } = require('../services');

exports.createOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { shippingAddress } = req.body;

        if (!shippingAddress) {
            return res.status(400).json({ status: 'fail', message: 'O endereço de entrega é obrigatório.' });
        }

        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({ status: 'fail', message: 'Seu carrinho está vazio.' });
        }

        // Preparar itens para reserva de estoque
        const itemsToReserve = cart.items.map(item => ({
            productId: item.productId._id,
            quantity: item.quantity
        }));

        // Reservar estoque para todos os produtos de uma vez
        await stockService.reserveMultipleProducts(itemsToReserve);

        let total = 0;
        const orderItems = [];
        
        for (const item of cart.items) {
            total += item.quantity * item.productId.price;
            orderItems.push({
                productId: item.productId._id,
                quantity: item.quantity,
                price: item.productId.price
            });
        }

        const order = await Order.create({
            userId,
            totalAmount: total,
            shippingAddress,
            status: 'pending',
            paymentStatus: 'pending',
            items: orderItems
        });

        // Limpar carrinho
        cart.items = [];
        await cart.save();

        // Enviar email de confirmação
        await emailService.sendOrderConfirmation(req.user, order);

        res.status(201).json({
            status: 'success',
            data: {
                order
            }
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Erro ao criar o pedido.'
        });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        const orders = await Order.find({ userId })
            .populate('items.productId', 'id name imageUrl price')
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: {
                orders
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erro ao buscar os pedidos.'
        });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const userRole = req.user.role;

        const order = await Order.findById(id)
            .populate('items.productId', 'id name imageUrl price')
            .populate('userId', 'id name email');

        if (!order) {
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado.' });
        }

        if (order.userId._id.toString() !== userId.toString() && userRole !== 'admin') {
            return res.status(403).json({ status: 'fail', message: 'Você não tem permissão para ver este pedido.' });
        }

        res.status(200).json({
            status: 'success',
            data: {
                order
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erro ao buscar o pedido.'
        });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({ status: 'fail', message: 'Status inválido.' });
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('userId', 'id name email');

        if (!order) {
            return res.status(404).json({ status: 'fail', message: 'Pedido não encontrado.' });
        }

        // Enviar email de atualização de status
        await emailService.sendOrderStatusUpdate(order.userId, order);

        res.status(200).json({
            status: 'success',
            data: {
                order
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erro ao atualizar o status do pedido.'
        });
    }
};

exports.cancelOrder = async (req, res) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });
    if (order.status !== 'paid') return res.status(400).json({ error: 'Pedido não pode ser cancelado.' });
    order.status = 'cancelled';
    await order.save();
    await PaymentService.refundPayment(order.paymentId);
    await StockService.releaseStock(order._id);
    res.json({ message: 'Pedido cancelado e reembolso solicitado.' });
};