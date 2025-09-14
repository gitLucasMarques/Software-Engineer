const express = require('express');
const router = express.Router();
const { 
  getGames, 
  getGameById, 
  createGame, 
  updateGame, 
  deleteGame 
} = require('../controllers/gameController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Rotas públicas
router.get('/', getGames);
router.get('/:id', getGameById);

// Rotas protegidas para admin
router.post('/', protect, admin, createGame);
router.put('/:id', protect, admin, updateGame);
router.delete('/:id', protect, admin, deleteGame);

module.exports = router;
