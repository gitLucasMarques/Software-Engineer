/**
 * Aqui ficam todas as rotas de pedidos (orders).
 * 
 * Todas as rotas precisam que o usuário esteja logado.
 * Usuários podem criar pedidos, ver seus pedidos, consultar um pedido específico
 * e cancelar pedidos.
 * 
 * Apenas admins conseguem mudar o status de um pedido.
 * 
 * Serve para organizar e proteger quem pode fazer o quê nos pedidos.
 */
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

router.post('/', orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);

// Apenas admin pode atualizar status
router.patch('/:id/status', roleMiddleware('admin'), orderController.updateOrderStatus);

// Rota de cancelamento de pedido (autenticado)
router.patch('/:id/cancel', orderController.cancelOrder);

module.exports = router;
