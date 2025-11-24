const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Rotas públicas
router.get('/', categoryController.getAllCategories);
router.get('/:id/subcategories', categoryController.getSubcategories);
router.get('/:id', categoryController.getCategoryById);

// Rotas de admin
router.use(authMiddleware, roleMiddleware('admin'));
router.post('/', categoryController.createCategory);
router.patch('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
