const { Cart, CartItem, Game } = require('../models');

// @desc    Obter carrinho do usuário ou criar um novo
// @route   GET /api/cart
// @access  Privado
exports.getCart = async (req, res) => {
  try {
    // Buscar ou criar carrinho para o usuário
    let [cart] = await Cart.findOrCreate({
      where: { userId: req.user.id },
      defaults: { userId: req.user.id }
    });
    
    // Buscar itens do carrinho com informações do jogo
    const cartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [Game]
    });
    
    res.json({
      success: true,
      data: {
        id: cart.id,
        items: cartItems
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro no servidor'
    });
  }
};

// @desc    Adicionar item ao carrinho
// @route   POST /api/cart
// @access  Privado
exports.addToCart = async (req, res) => {
  try {
    const { gameId, quantity = 1 } = req.body;
    
    // Verificar se o jogo existe
    const game = await Game.findByPk(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Jogo não encontrado'
      });
    }
    
    // Verificar estoque para jogos físicos
    if (!game.isDigital && game.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Quantidade indisponível em estoque'
      });
    }
    
    // Buscar ou criar carrinho para o usuário
    let [cart] = await Cart.findOrCreate({
      where: { userId: req.user.id },
      defaults: { userId: req.user.id }
    });
    
    // Verificar se o item já existe no carrinho
    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, gameId }
    });
    
    if (cartItem) {
      // Atualizar quantidade
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Criar novo item
      cartItem = await CartItem.create({
        cartId: cart.id,
        gameId,
        quantity
      });
    }
    
    // Buscar carrinho atualizado
    const updatedCartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [Game]
    });
    
    res.status(201).json({
      success: true,
      data: {
        id: cart.id,
        items: updatedCartItems
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro no servidor'
    });
  }
};

// @desc    Atualizar quantidade de um item no carrinho
// @route   PUT /api/cart/:itemId
// @access  Privado
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    
    // Buscar carrinho do usuário
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Carrinho não encontrado'
      });
    }
    
    // Buscar item no carrinho
    const cartItem = await CartItem.findOne({
      where: { id: req.params.itemId, cartId: cart.id },
      include: [Game]
    });
    
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Item não encontrado no carrinho'
      });
    }
    
    // Verificar estoque para jogos físicos
    if (!cartItem.Game.isDigital && cartItem.Game.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Quantidade indisponível em estoque'
      });
    }
    
    // Atualizar quantidade
    cartItem.quantity = quantity;
    await cartItem.save();
    
    // Buscar carrinho atualizado
    const updatedCartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [Game]
    });
    
    res.json({
      success: true,
      data: {
        id: cart.id,
        items: updatedCartItems
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro no servidor'
    });
  }
};

// @desc    Remover item do carrinho
// @route   DELETE /api/cart/:itemId
// @access  Privado
exports.removeFromCart = async (req, res) => {
  try {
    // Buscar carrinho do usuário
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Carrinho não encontrado'
      });
    }
    
    // Buscar item no carrinho
    const cartItem = await CartItem.findOne({
      where: { id: req.params.itemId, cartId: cart.id }
    });
    
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Item não encontrado no carrinho'
      });
    }
    
    // Remover item
    await cartItem.destroy();
    
    // Buscar carrinho atualizado
    const updatedCartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [Game]
    });
    
    res.json({
      success: true,
      data: {
        id: cart.id,
        items: updatedCartItems
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro no servidor'
    });
  }
};

// @desc    Limpar o carrinho
// @route   DELETE /api/cart
// @access  Privado
exports.clearCart = async (req, res) => {
  try {
    // Buscar carrinho do usuário
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Carrinho não encontrado'
      });
    }
    
    // Remover todos os itens
    await CartItem.destroy({ where: { cartId: cart.id } });
    
    res.json({
      success: true,
      data: {
        id: cart.id,
        items: []
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro no servidor'
    });
  }
};
