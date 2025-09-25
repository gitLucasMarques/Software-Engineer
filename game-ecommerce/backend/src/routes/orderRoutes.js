const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  updateOrderStatus, 
  getAllOrders 
} = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Rotas para usuários
router.route('/')
  .post(protect, createOrder)
  .get(protect, getMyOrders);

router.get('/:id', protect, getOrderById);

// Rotas para administradores
router.get('/admin/all', protect, admin, getAllOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
