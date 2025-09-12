const { User } = require('../models');
const generateToken = require('../utils/generateToken');

// @desc    Registrar um novo usuário
// @route   POST /api/users/register
// @access  Público
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar se o usuário já existe
    const userExists = await User.findOne({ where: { email } });
    
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'Usuário já existe'
      });
    }

    // Criar o usuário
    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user.id)
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Dados de usuário inválidos'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro no servidor'
    });
  }
};

// @desc    Autenticar usuário & obter token
// @route   POST /api/users/login
// @access  Público
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar se o usuário existe
    const user = await User.findOne({ where: { email } });
    
    // Verificar se o usuário existe e a senha está correta
    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user.id)
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Email ou senha inválidos'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro no servidor'
    });
  }
};

// @desc    Obter perfil do usuário
// @route   GET /api/users/profile
// @access  Privado
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (user) {
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro no servidor'
    });
  }
};