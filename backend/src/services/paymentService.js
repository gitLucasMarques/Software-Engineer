const { Payment, Order } = require('../models');
const mercadopago = require('mercadopago');
// const paypal = require('@paypal/checkout-server-sdk'); // TODO: Atualizar para novo SDK
const environment = require('../config/environment');

// Configurar MercadoPago (se disponível)
if (environment.MERCADOPAGO_ACCESS_TOKEN) {
    mercadopago.configure({
        access_token: environment.MERCADOPAGO_ACCESS_TOKEN
    });
}

// TODO: Implementar novo PayPal SDK
let paypalClient = null;
/* 
if (environment.PAYPAL_CLIENT_ID && environment.PAYPAL_CLIENT_SECRET) {
    const paypalEnvironment = environment.NODE_ENV === 'production'
        ? new paypal.core.LiveEnvironment(environment.PAYPAL_CLIENT_ID, environment.PAYPAL_CLIENT_SECRET)
        : new paypal.core.SandboxEnvironment(environment.PAYPAL_CLIENT_ID, environment.PAYPAL_CLIENT_SECRET);
    paypalClient = new paypal.core.PayPalHttpClient(paypalEnvironment);
}
*/

class PaymentService {
    async createPayment(order, paymentMethod) {
        try {
            const payment = await Payment.create({
                orderId: order._id,
                paymentMethod,
                amount: order.totalAmount,
                status: 'pending'
            });

            if (paymentMethod === 'mercadopago') {
                const preference = await this.createMercadoPagoPreference(order);
                return {
                    payment,
                    paymentUrl: preference.init_point,
                    preferenceId: preference.id
                };
            }

            if (paymentMethod === 'paypal') {
                const paypalOrder = await this.createPayPalOrder(order, payment.id);
                return {
                    payment,
                    orderId: paypalOrder.id,
                    approvalUrl: paypalOrder.links.find(link => link.rel === 'approve').href
                };
            }

            if (paymentMethod === 'credit_card') {
                return {
                    payment,
                    message: 'Processamento de cartão de crédito implementar integração'
                };
            }

            return { payment };
        } catch (error) {
            throw new Error(`Erro ao criar pagamento: ${error.message}`);
        }
    }

    async createMercadoPagoPreference(order) {
        if (!environment.MERCADOPAGO_ACCESS_TOKEN) {
            console.error('❌ MercadoPago Access Token não configurado');
            throw new Error('MercadoPago não configurado. Por favor, configure o MERCADOPAGO_ACCESS_TOKEN no arquivo .env');
        }

        console.log('📦 Criando preferência MercadoPago para pedido:', order._id);
        console.log('💰 Valor do pedido:', order.totalAmount);

        const preference = {
            items: [{
                title: `Pedido #${order._id}`,
                unit_price: parseFloat(order.totalAmount),
                quantity: 1
            }],
            back_urls: {
                success: `${environment.FRONTEND_URL}/payment/success?orderId=${order._id}`,
                failure: `${environment.FRONTEND_URL}/payment/failure?orderId=${order._id}`,
                pending: `${environment.FRONTEND_URL}/payment/pending?orderId=${order._id}`
            },
            auto_return: 'approved',
            external_reference: order._id.toString(),
            notification_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/webhook/mercadopago`
        };

        console.log('🔧 Preferência criada:', JSON.stringify(preference, null, 2));

        try {
            const response = await mercadopago.preferences.create(preference);
            console.log('✅ Preferência criada com sucesso:', response.body.id);
            console.log('🔗 Init point:', response.body.init_point);
            return response.body;
        } catch (error) {
            console.error('❌ Erro ao criar preferência MercadoPago:', error);
            console.error('Detalhes do erro:', error.message);
            throw new Error(`Erro ao criar preferência no MercadoPago: ${error.message}`);
        }
    }

    async createPayPalOrder(order, paymentId) {
        throw new Error('PayPal temporariamente desabilitado - SDK em atualização');
        /* TODO: Implementar com novo SDK
        if (!paypalClient) {
            throw new Error('PayPal não configurado');
        }

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                reference_id: order._id.toString(),
                custom_id: paymentId.toString(),
                amount: {
                    currency_code: 'BRL',
                    value: parseFloat(order.totalAmount).toFixed(2)
                }
            }],
            application_context: {
                brand_name: 'Voxel',
                return_url: `${environment.FRONTEND_URL}/payment/success`,
                cancel_url: `${environment.FRONTEND_URL}/payment/failure`,
                user_action: 'PAY_NOW'
            }
        });

        const response = await paypalClient.execute(request);
        return response.result;
        */
    }

    async capturePayPalOrder(orderId, paymentId) {
        throw new Error('PayPal temporariamente desabilitado - SDK em atualização');
        /* TODO: Implementar com novo SDK
        if (!paypalClient) {
            throw new Error('PayPal não configurado');
        }

        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});

        try {
            const capture = await paypalClient.execute(request);
            
            const payment = await Payment.findById(paymentId);
            if (!payment) {
                throw new Error('Pagamento não encontrado');
            }

            payment.transactionId = capture.result.id;

            if (capture.result.status === 'COMPLETED') {
                payment.status = 'completed';
                const order = await Order.findById(payment.orderId);
                order.paymentStatus = 'paid';
                order.status = 'processing';
                await order.save();
            } else {
                payment.status = 'failed';
            }

            await payment.save();
            return { success: true, payment, capture: capture.result };
        } catch (error) {
            throw new Error(`Erro ao capturar pagamento PayPal: ${error.message}`);
        }
        */
    }

    async processMercadoPagoWebhook(paymentId) {
        try {
            const paymentInfo = await mercadopago.payment.findById(paymentId);
            const orderId = parseInt(paymentInfo.body.external_reference);

            const payment = await Payment.findOne({ orderId });
            if (!payment) {
                throw new Error('Pagamento não encontrado');
            }

            payment.transactionId = paymentId.toString();

            if (paymentInfo.body.status === 'approved') {
                payment.status = 'completed';
                const order = await Order.findById(orderId);
                order.paymentStatus = 'paid';
                order.status = 'processing';
                await order.save();
            } else if (paymentInfo.body.status === 'rejected') {
                payment.status = 'failed';
            } else if (paymentInfo.body.status === 'refunded') {
                payment.status = 'refunded';
            }

            await payment.save();
            return payment;
        } catch (error) {
            throw new Error(`Erro ao processar webhook: ${error.message}`);
        }
    }

    async processPayPalWebhook(webhookData) {
        try {
            const eventType = webhookData.event_type;
            const resource = webhookData.resource;

            if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
                const paymentId = resource.custom_id;
                const payment = await Payment.findById(paymentId);

                if (!payment) {
                    throw new Error('Pagamento não encontrado');
                }

                payment.transactionId = resource.id;
                payment.status = 'completed';
                await payment.save();

                const order = await Order.findById(payment.orderId);
                order.paymentStatus = 'paid';
                order.status = 'processing';
                await order.save();

                return { success: true, payment };
            }

            if (eventType === 'PAYMENT.CAPTURE.REFUNDED') {
                const transactionId = resource.id;
                const payment = await Payment.findOne({ transactionId });

                if (payment) {
                    payment.status = 'refunded';
                    await payment.save();

                    const order = await Order.findById(payment.orderId);
                    order.paymentStatus = 'refunded';
                    order.status = 'cancelled';
                    await order.save();
                }

                return { success: true, payment };
            }

            return { success: true, message: 'Evento não processado' };
        } catch (error) {
            throw new Error(`Erro ao processar webhook PayPal: ${error.message}`);
        }
    }

    async getPaymentStatus(orderId) {
        const payment = await Payment.findOne({ orderId }).populate('orderId');
        return payment;
    }

    async refundPayment(orderId) {
        try {
            const payment = await Payment.findOne({ orderId });
            
            if (!payment) {
                throw new Error('Pagamento não encontrado');
            }

            if (payment.status !== 'completed') {
                throw new Error('Apenas pagamentos concluídos podem ser reembolsados');
            }

            // Se for MercadoPago
            if (payment.paymentMethod === 'mercadopago' && payment.transactionId) {
                const refund = await mercadopago.refund.create({
                    payment_id: payment.transactionId
                });

                if (refund.status === 200) {
                    payment.status = 'refunded';
                    await payment.save();

                    const order = await Order.findById(orderId);
                    order.paymentStatus = 'refunded';
                    order.status = 'cancelled';
                    await order.save();

                    return { success: true, payment };
                }
            }

            // Se for PayPal
            if (payment.paymentMethod === 'paypal' && payment.transactionId) {
                throw new Error('Reembolso PayPal temporariamente desabilitado - SDK em atualização');
                /* TODO: Implementar com novo SDK
                const request = new paypal.payments.CapturesRefundRequest(payment.transactionId);
                request.requestBody({
                    amount: {
                        currency_code: 'BRL',
                        value: parseFloat(payment.amount).toFixed(2)
                    }
                });

                const refund = await paypalClient.execute(request);

                if (refund.result.status === 'COMPLETED') {
                    payment.status = 'refunded';
                    await payment.save();

                    const order = await Order.findById(orderId);
                    order.paymentStatus = 'refunded';
                    order.status = 'cancelled';
                    await order.save();

                    return { success: true, payment };
                }
                */
            }

            // Para outros métodos de pagamento
            payment.status = 'refunded';
            await payment.save();

            const order = await Order.findById(orderId);
            order.paymentStatus = 'refunded';
            order.status = 'cancelled';
            await order.save();

            return { success: true, payment };
        } catch (error) {
            throw new Error(`Erro ao processar reembolso: ${error.message}`);
        }
    }
}

module.exports = new PaymentService();
