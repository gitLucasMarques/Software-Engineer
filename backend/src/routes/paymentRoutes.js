/**
 * Rotas de Pagamento Simulado
 * 
 * Endpoints para processar pagamentos via:
 * - PIX: Gera QR Code e simula pagamento
 * - Boleto: Gera linha digitável e simula pagamento
 * - Cartão de Crédito/Débito: Processa e salva cartão
 * 
 * Também gerencia cartões salvos do usuário
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas de pagamento
router.post('/pix/create', paymentController.createPixPayment);
router.post('/boleto/create', paymentController.createBoletoPayment);
router.post('/card/create', paymentController.createCardPayment);
router.post('/simulate-approval/:orderId', paymentController.simulatePaymentApproval);
router.get('/status/:orderId', paymentController.getPaymentStatus);
router.get('/receipt/:orderId', paymentController.getReceipt);

// Rotas de gerenciamento de cartões
router.get('/cards', paymentController.getUserCards);
router.post('/cards', paymentController.saveCard);
router.delete('/cards/:cardId', paymentController.deleteCard);

// Rotas descontinuadas (retornam 501)
router.post('/create', paymentController.createPaymentIntent);
router.post('/mercadopago/create', paymentController.createMercadoPagoPayment);
router.post('/paypal/create', paymentController.createPayPalPayment);
router.post('/webhook/mercadopago', paymentController.handleMercadoPagoWebhook);
router.post('/webhook/paypal', paymentController.handlePayPalWebhook);

module.exports = router;
