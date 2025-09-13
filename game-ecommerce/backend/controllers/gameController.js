const { Game, Category, Review } = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Buscar todos os jogos com paginação e filtros
 * @route   GET /api/games
 * @access  Público
 */
exports.getGames = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.page) || 1;
    
    // Opções de filtro
    const { 
      keyword, 
      category, 
      platform, 
      minPrice, 
      maxPrice, 
      sortBy 
    } = req.query;
    
    // Construir condições de busca
    const whereConditions = {};
    
    // Busca por palavra-chave no título ou descrição
    if (keyword) {
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ];
    }
    
    // Filtro por plataforma
    if (platform) {
      whereConditions.platform = platform;
    }
    
    // Filtro por preço
    if (minPrice && maxPrice) {
      whereConditions.price = {
        [Op.between]: [minPrice, maxPrice]
      };
    } else if (minPrice) {
      whereConditions.price = {
        [Op.gte]: minPrice
      };
    } else if (maxPrice) {
      whereConditions.price = {
        [Op.lte]: maxPrice
      };
    }
    
    // Configurar ordem
    let order = [['createdAt', 'DESC']];
    if (sortBy === 'price-asc') {
      order = [['price', 'ASC']];
    } else if (sortBy === 'price-desc') {
      order = [['price', 'DESC']];
    } else if (sortBy === 'rating') {
      order = [['rating', 'DESC']];
    } else if (sortBy === 'newest') {
      order = [['releaseYear', 'DESC']];
    }
    
    // Configurar associações para incluir categorias
    const includeOptions = [
      { model: Category, through: { attributes: [] } }
    ];
    
    // Adicionar filtro por categoria, se necessário
    const categoryFilter = category ? {
      include: [{
        model: Category,
        through: { attributes: [] },
        where: { name: category }
      }]
    } : {};
    
    // Contar total de jogos para paginação
    const count = await Game.count({
      where: whereConditions,
      distinct: true,
      ...categoryFilter
    });
    
    // Buscar jogos com paginação
    const games = await Game.findAll({
      where: whereConditions,
      limit: pageSize,
      offset: pageSize * (page - 1),
      order,
      include: includeOptions,
      ...categoryFilter
    });
    
    res.json({
      success: true,
      count,
      pages: Math.ceil(count / pageSize),
      currentPage: page,
      data: games
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar jogos'
    });
  }
};

/**
 * @desc    Buscar um jogo pelo ID
 * @route   GET /api/games/:id
 * @access  Público
 */
exports.getGameById = async (req, res) => {
  try {
    const game = await Game.findByPk(req.params.id, {
      include: [
        { model: Category, through: { attributes: [] } },
        { model: Review, include: [{ model: User, attributes: ['id', 'name'] }] }
      ]
    });
    
    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Jogo não encontrado'
      });
    }
    
    // Buscar jogos relacionados (mesmas categorias)
    let relatedGames = [];
    if (game.Categories && game.Categories.length > 0) {
      const categoryIds = game.Categories.map(cat => cat.id);
      
      relatedGames = await Game.findAll({
        include: [
          { 
            model: Category,
            through: { attributes: [] },
            where: { id: categoryIds }
          }
        ],
        where: {
          id: { [Op.ne]: game.id } // excluir o jogo atual
        },
        limit: 6
      });
    }
    
    res.json({
      success: true,
      data: {
        game,
        relatedGames
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar detalhes do jogo'
    });
  }
};

/**
 * @desc    Criar um novo jogo
 * @route   POST /api/games
 * @access  Privado/Admin
 */
exports.createGame = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      price, 
      discountPercentage, 
      publisher,
      releaseYear,
      platform,
      stock,
      isDigital,
      imageUrl,
      categories
    } = req.body;
    
    // Validações básicas
    if (!title || !price || !platform) {
      return res.status(400).json({
        success: false,
        error: 'Por favor, preencha todos os campos obrigatórios'
      });
    }
    
    // Verificar se o jogo já existe (pelo título e plataforma)
    const gameExists = await Game.findOne({
      where: {
        title,
        platform
      }
    });
    
    if (gameExists) {
      return res.status(400).json({
        success: false,
        error: 'Um jogo com este título e plataforma já existe'
      });
    }
    
    // Criar o jogo
    const game = await Game.create({
      title,
      description,
      price,
      discountPercentage,
      publisher,
      releaseYear,
      platform,
      stock,
      isDigital,
      imageUrl
    });
    
    // Adicionar categorias se informadas
    if (categories && categories.length > 0) {
      // Verificar se as categorias existem
      const existingCategories = await Category.findAll({
        where: { id: categories }
      });
      
      if (existingCategories.length !== categories.length) {
        return res.status(400).json({
          success: false,
          error: 'Uma ou mais categorias informadas não existem'
        });
      }
      
      await game.setCategories(categories);
    }
    
    // Buscar o jogo com suas categorias
    const gameWithCategories = await Game.findByPk(game.id, {
      include: [{ model: Category, through: { attributes: [] } }]
    });
    
    res.status(201).json({
      success: true,
      data: gameWithCategories
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar jogo'
    });
  }
};

/**
 * @desc    Atualizar um jogo
 * @route   PUT /api/games/:id
 * @access  Privado/Admin
 */
exports.updateGame = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      discountPercentage,
      publisher,
      releaseYear,
      platform,
      stock,
      isDigital,
      imageUrl,
      categories
    } = req.body;
    
    // Buscar o jogo
    let game = await Game.findByPk(req.params.id);
    
    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Jogo não encontrado'
      });
    }
    
    // Atualizar campos
    await game.update({
      title: title || game.title,
      description: description || game.description,
      price: price || game.price,
      discountPercentage: discountPercentage !== undefined ? discountPercentage : game.discountPercentage,
      publisher: publisher || game.publisher,
      releaseYear: releaseYear || game.releaseYear,
      platform: platform || game.platform,
      stock: stock !== undefined ? stock : game.stock,
      isDigital: isDigital !== undefined ? isDigital : game.isDigital,
      imageUrl: imageUrl || game.imageUrl
    });
    
    // Atualizar categorias se informadas
    if (categories && Array.isArray(categories)) {
      await game.setCategories(categories);
    }
    
    // Buscar o jogo atualizado com suas categorias
    const updatedGame = await Game.findByPk(game.id, {
      include: [{ model: Category, through: { attributes: [] } }]
    });
    
    res.json({
      success: true,
      data: updatedGame
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar jogo'
    });
  }
};

/**
 * @desc    Excluir um jogo
 * @route   DELETE /api/games/:id
 * @access  Privado/Admin
 */
exports.deleteGame = async (req, res) => {
  try {
    const game = await Game.findByPk(req.params.id);
    
    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Jogo não encontrado'
      });
    }
    
    // Verificar se o jogo está em algum pedido ou carrinho
    // Esta verificação pode exigir consultas adicionais
    
    await game.destroy();
    
    res.json({
      success: true,
      message: 'Jogo removido com sucesso'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao excluir jogo'
    });
  }
};

/**
 * @desc    Obter todas as categorias
 * @route   GET /api/games/categories
 * @access  Público
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar categorias'
    });
  }
};

/**
 * @desc    Criar uma nova categoria
 * @route   POST /api/games/categories
 * @access  Privado/Admin
 */
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Nome da categoria é obrigatório'
      });
    }
    
    // Verificar se a categoria já existe
    const categoryExists = await Category.findOne({
      where: { name }
    });
    
    if (categoryExists) {
      return res.status(400).json({
        success: false,
        error: 'Esta categoria já existe'
      });
    }
    
    const category = await Category.create({
      name,
      description
    });
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar categoria'
    });
  }
};

/**
 * @desc    Buscar jogos em destaque/promoção
 * @route   GET /api/games/featured
 * @access  Público
 */
exports.getFeaturedGames = async (req, res) => {
  try {
    // Jogos com desconto
    const discountedGames = await Game.findAll({
      where: {
        discountPercentage: {
          [Op.gt]: 0
        }
      },
      limit: 8,
      include: [{ model: Category, through: { attributes: [] } }]
    });
    
    // Jogos mais bem avaliados
    const topRatedGames = await Game.findAll({
      order: [['rating', 'DESC']],
      limit: 8,
      include: [{ model: Category, through: { attributes: [] } }]
    });
    
    // Lançamentos (jogos do ano atual)
    const currentYear = new Date().getFullYear();
    const newReleases = await Game.findAll({
      where: {
        releaseYear: currentYear
      },
      limit: 8,
      include: [{ model: Category, through: { attributes: [] } }]
    });
    
    res.json({
      success: true,
      data: {
        discountedGames,
        topRatedGames,
        newReleases
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar jogos em destaque'
    });
  }
};

/**
 * @desc    Adicionar avaliação a um jogo
 * @route   POST /api/games/:id/reviews
 * @access  Privado
 */
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const gameId = req.params.id;
    const userId = req.user.id;
    
    // Validar rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Avaliação deve ser um número entre 1 e 5'
      });
    }
    
    // Verificar se o jogo existe
    const game = await Game.findByPk(gameId);
    
    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Jogo não encontrado'
      });
    }
    
    // Verificar se o usuário já avaliou este jogo
    const existingReview = await Review.findOne({
      where: {
        gameId,
        userId
      }
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'Você já avaliou este jogo'
      });
    }
    
    // Criar avaliação
    const review = await Review.create({
      gameId,
      userId,
      rating,
      comment
    });
    
    // Atualizar rating médio do jogo
    const allReviews = await Review.findAll({
      where: { gameId }
    });
    
    const averageRating = 
      allReviews.reduce((sum, item) => sum + item.rating, 0) / allReviews.length;
    
    await game.update({
      rating: parseFloat(averageRating.toFixed(1))
    });
    
    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao adicionar avaliação'
    });
  }
};
