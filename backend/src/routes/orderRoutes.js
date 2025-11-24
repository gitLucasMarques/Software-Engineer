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
