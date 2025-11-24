const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Rotas públicas
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Rotas de admin
router.use(authMiddleware, roleMiddleware('admin'));
router.post('/', productController.createProduct);
router.patch('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
