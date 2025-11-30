/**
 * Rotas relacionadas a usuários.
 * 
 * Usuários logados podem atualizar ou deletar a própria conta.
 * 
 * Admins têm acesso a rotas extras para listar todos os usuários,
 * ver detalhes, atualizar ou deletar qualquer conta.
 * 
 * Organiza quem pode fazer o quê com os dados dos usuários.
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

// Rotas do próprio usuário
router.patch('/me', userController.updateMe);
router.delete('/me', userController.deleteMe);

// Rotas de admin
router.use(roleMiddleware('admin'));
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
