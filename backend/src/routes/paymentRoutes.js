/**
 * Rotas relacionadas a pagamentos.
 * 
 * Alguns webhooks de pagamento (MercadoPago e PayPal) não precisam de login,
 * porque vêm direto do gateway.
 * 
 * Todas as outras rotas exigem que o usuário esteja logado e permitem:
 *  - Criar pagamentos (cartão, PIX, boleto, PayPal, MercadoPago)
 *  - Simular aprovação de pagamento
 *  - Consultar status de um pagamento
 * 
 * Basicamente, organiza tudo que envolve processar e acompanhar pagamentos.
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Webhook não requer autenticação (vem do gateway)
router.post('/webhook/mercadopago', paymentController.handleMercadoPagoWebhook);
router.post('/webhook/paypal', paymentController.handlePayPalWebhook);

// Rotas que requerem autenticação
router.use(authMiddleware);
router.post('/create', paymentController.createPaymentIntent);
router.post('/mercadopago/create', paymentController.createMercadoPagoPayment);
router.post('/paypal/create', paymentController.createPayPalPayment);
router.post('/pix/create', paymentController.createPixPayment);
router.post('/boleto/create', paymentController.createBoletoPayment);
router.post('/card/create', paymentController.createCardPayment);
router.post('/simulate-approval/:orderId', paymentController.simulatePaymentApproval);
router.get('/status/:orderId', paymentController.getPaymentStatus);

module.exports = router;
