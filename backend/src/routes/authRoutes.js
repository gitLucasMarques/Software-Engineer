const express = require('express');
const router = express.Router();

// Controller responsável por toda a lógica de autenticação:
// registro, login, atualização de dados e senha.
const authController = require('../controllers/authController');

// Middleware que valida o token JWT e injeta o usuário em req.user.
const authMiddleware = require('../middlewares/authMiddleware');


// ---- ROTAS DE AUTENTICAÇÃO ----

// Registro de novo usuário
router.post('/register', authController.register);

// Login do usuário → retorna token JWT
router.post('/login', authController.login);

// Retorna os dados do usuário autenticado
router.get('/me', authMiddleware, authController.getMe);

// Atualiza dados do usuário logado
router.put('/update-me', authMiddleware, authController.updateMe);

// Atualiza a senha do usuário logado
router.put('/update-password', authMiddleware, authController.updatePassword);

module.exports = router;
