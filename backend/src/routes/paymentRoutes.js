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
