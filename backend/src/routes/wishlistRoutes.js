const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const authMiddleware = require('../middlewares/authMiddleware');
/**
 * Rotas da wishlist (lista de desejos).
 * 
 * Todas exigem que o usuário esteja logado.
 * Usuário pode:
 *  - Ver a lista de desejos
 *  - Adicionar um produto
 *  - Remover um produto específico
 *  - Limpar toda a lista
 * 
 * Organiza e protege o que cada usuário pode fazer na wishlist.
 */

router.use(authMiddleware);

router.get('/', wishlistController.getWishlist);
router.post('/', wishlistController.addToWishlist);
router.delete('/clear', wishlistController.clearWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);

module.exports = router;
