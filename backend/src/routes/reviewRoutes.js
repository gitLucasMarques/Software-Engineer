const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rota pública para visualizar avaliações
router.get('/game/:gameId', reviewController.getReviewsForGame);

// Rotas que requerem autenticação
router.use(authMiddleware);
router.post('/game/:gameId', reviewController.createReview);
router.patch('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
