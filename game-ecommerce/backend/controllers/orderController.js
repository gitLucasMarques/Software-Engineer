const { Order, OrderItem, Game, User } = require('../models');
const { v4: uuidv4 } = require('uuid');

// @desc    Criar novo pedido
// @route   POST /api/orders
// @access  Privado
exports.createOrder = async (req, res) => {
  try {
    const { 
      orderItems, 
      shippingAddress, 
      paymentMethod, 
      shippingCost = 0
    } = req.body;
    
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Não há itens no pedido'
      });
    }
    
    // Calcular total
    let totalAmount = 0;
    
    // Verificar disponibilidade dos jogos e calcular total
    for (const item of orderItems) {
      const game = await Game.findByPk(item.gameId);
      
      if (!game) {
        return res.status(404).json({
          success: false,
          error: `Jogo com ID ${item.gameId} não encontrado`
        });
      }
      
      if (!game.isDigital && game.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Jogo ${game.title} não tem estoque suficiente`
        });
      }
      
      totalAmount += game.price * item.quantity;
    }
    
    // Adicionar custo de envio
    totalAmount += Number(shippingCost);
    
    // Criar pedido
    const order = await Order.create({
      orderNumber: `ORD-${uuidv4().substring(0, 8)}`,
      userId: req.user.id,
      totalAmount,
      status: 'pending',
      paymentMethod,
      paymentStatus: 'pending',
      shippingAddress,
      shippingCost
    });
    
    // Criar itens do pedido
    for (const item of orderItems) {
      const game = await Game.findByPk(item.gameId);
      
      await OrderItem.create({
        orderId: order.id,
        gameId: item.gameId,
        quantity: item.quantity,
        price: game.price,
        subtotal: game.price * item.quantity
      });
      
      // Atualizar estoque se for um jogo físico
      if (!game.isDigital) {
        await game.update({
          stock: game.stock - item.quantity
        });
      }
    }
    
    // Buscar o pedido completo com itens
    const createdOrder = await Order.findByPk(order.id, {
      include: [{
        model: OrderItem,
        include: [Game]
      }]
    });
    
    res.status(201).json({
      success: true,
      data: createdOrder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro no servidor'
    });
  }
};

// @desc    Obter todos os pedidos do usuário logado
// @route   GET /api/orders
// @access  Privado
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{
        model: OrderItem,
        include: [Game]
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro no servidor'
    });
  }
};

// @desc    Obter detalhes de um pedido pelo ID
// @route   GET /api/orders/:id
// @access  Privado
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{
        model: OrderItem,
        include: [Game]
      }]
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado'
      });
    }
    
    // Verificar se o pedido pertence ao usuário ou se é admin
    if (order.userId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Não autorizado'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro no servidor'
    });
  }
};

// @desc    Atualizar status do pedido (apenas admin)
// @route   PUT /api/orders/:id/status
// @access  Privado/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado'
      });
    }
    
    // Atualizar campos
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    
    await order.save();
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro no servidor'
    });
  }
};

// @desc    Obter todos os pedidos (admin)
// @route   GET /api/orders/admin
// @access  Privado/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          include: [Game]
        },
        {
          model: User,
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro no servidor'
    });
  }
};
