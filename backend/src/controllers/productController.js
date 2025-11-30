/**
 * Este controlador gerencia todas as operações relacionadas aos jogos/produtos.
 * Ele fornece rotas para listagem com filtros e paginação, consulta detalhada
 * com avaliações, criação, edição e exclusão de produtos.
 *
 * A listagem permite filtrar por categoria, plataforma e busca textual, além
 * de suportar paginação e ordenação dinâmica. A consulta por ID retorna o jogo
 * completo junto com suas reviews. As operações de criação e atualização
 * validam os dados conforme o schema Mongoose. A exclusão remove o jogo
 * permanentemente do banco.
 */

const { Product, Review, User } = require('../models');

exports.getAllProducts = async (req, res) => {
    try {
        const { category, categoryId, platform, sort, search } = req.query;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 100;
        const skip = (page - 1) * limit;

        let query = { isActive: true };
        if (search) query.name = { $regex: search, $options: 'i' };
        if (category) query.genre = category;
        if (categoryId) query.categoryId = categoryId;
        if (platform) query.platform = { $regex: platform, $options: 'i' };

        let sortOrder = { createdAt: -1 };
        if (sort) {
            const direction = sort.startsWith('-') ? -1 : 1;
            const field = sort.startsWith('-') ? sort.substring(1) : sort;
            sortOrder = { [field]: direction };
        }

        const count = await Product.countDocuments(query);
        const products = await Product.find(query)
            .populate('categoryId', 'name slug')
            .sort(sortOrder)
            .limit(limit)
            .skip(skip);

        res.status(200).json({
            status: 'success',
            results: products.length,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: { products }
        });

    } catch (error) {
        console.error('Erro em getAllProducts:', error);
        res.status(500).json({ status: 'error', message: 'Erro ao buscar os jogos.' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findOne({ _id: id, isActive: true })
            .populate('categoryId', 'name slug description');

        if (!product) {
            return res.status(404).json({
                status: 'fail',
                message: 'Jogo não encontrado.'
            });
        }

        const reviews = await Review.find({ gameId: id }).populate('userId', 'name');

        res.status(200).json({
            status: 'success',
            data: {
                product: {
                    ...product.toObject(),
                    reviews
                }
            }
        });
    } catch (error) {
        console.error('Erro em getProductById:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao buscar o jogo.'
        });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const newProduct = await Product.create(req.body);
        res.status(201).json({
            status: 'success',
            data: { product: newProduct }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ status: 'fail', message: messages });
        }
        res.status(500).json({
            status: 'error',
            message: 'Erro ao criar o jogo.'
        });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        if (!product) {
            return res.status(404).json({
                status: 'fail',
                message: 'Jogo não encontrado.'
            });
        }

        res.status(200).json({
            status: 'success',
            data: { product }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ status: 'fail', message: messages });
        }
        res.status(500).json({
            status: 'error',
            message: 'Erro ao atualizar o jogo.'
        });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                status: 'fail',
                message: 'Jogo não encontrado.'
            });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erro ao deletar o jogo.'
        });
    }
};
