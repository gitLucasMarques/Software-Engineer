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

// Rotas de pagamento PIX
router.post('/pix/create', paymentController.createPixPayment);
router.post('/pix/confirm', paymentController.confirmPixPayment);

// Rotas de pagamento Boleto
router.post('/boleto/create', paymentController.createBoletoPayment);
router.post('/boleto/confirm', paymentController.confirmBoletoPayment);

// Rotas de pagamento com Cartão
router.post('/card/create', paymentController.createCardPayment);

// Comprovante
router.get('/receipt/:orderId', paymentController.getReceipt);

// Rotas de gerenciamento de cartões
router.get('/cards', paymentController.getUserCards);
router.delete('/cards/:cardId', paymentController.deleteCard);

module.exports = router;
