/**
 * Rotas relacionadas a produtos.
 * 
 * Todo mundo pode ver a lista de produtos e detalhes de um produto específico.
 * 
 * As rotas de criar, atualizar ou deletar produtos são só para admins,
 * e exigem que o usuário esteja logado.
 * 
 * Organiza tudo que envolve produtos e controla quem pode mexer em cada coisa.
 */

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
