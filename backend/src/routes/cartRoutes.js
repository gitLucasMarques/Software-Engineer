const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItemToCart);
router.put('/items/:itemId', cartController.updateItemQuantity);
router.delete('/items/:itemId', cartController.removeItemFromCart);
router.delete('/', cartController.clearCart);

module.exports = router;
