const { Review, Product, Order, OrderItem } = require('../models');

// Criar avaliação
exports.createReview = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user._id;
        const { rating, comment } = req.body;

        // Verifica se o jogo existe
        const product = await Product.findById(gameId);
        if (!product) {
            return res.status(404).json({ status: 'fail', message: 'Jogo não encontrado.' });
        }

        // Impede avaliações duplicadas
        const existingReview = await Review.findOne({ userId, gameId });
        if (existingReview) {
            return res.status(400).json({ status: 'fail', message: 'Você já avaliou este jogo.' });
        }

        // Verifica se o usuário comprou o jogo
        const hasPurchased = await Order.findOne({
            userId,
            paymentStatus: 'paid',
            'items.productId': gameId
        });

        if (!hasPurchased) {
            return res.status(403).json({ status: 'fail', message: 'Você deve comprar o jogo para poder avaliá-lo.' });
        }

        // Cria a avaliação
        const newReview = await Review.create({
            rating,
            comment,
            userId,
            gameId
        });

        res.status(201).json({
            status: 'success',
            data: {
                review: newReview
            }
        });
    } catch (error) {
        // Captura erros de validação
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ status: 'fail', message: messages });
        }
        res.status(500).json({
            status: 'error',
            message: 'Erro ao criar a avaliação.'
        });
    }
};

// Buscar avaliações de um jogo
exports.getReviewsForGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        const reviews = await Review.find({ gameId });

        res.status(200).json({
            status: 'success',
            results: reviews.length,
            data: { reviews }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erro ao buscar as avaliações.'
        });
    }
};

// Atualizar uma avaliação existente
exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { rating, comment } = req.body;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({ status: 'fail', message: 'Avaliação não encontrada.' });
        }

        // Permite editar apenas o dono da avaliação
        if (review.userId.toString() !== userId.toString()) {
            return res.status(403).json({ status: 'fail', message: 'Você não tem permissão para editar esta avaliação.' });
        }

        // Atualiza apenas campos enviados
        review.rating = rating ?? review.rating;
        review.comment = comment ?? review.comment;

        await review.save();

        res.status(200).json({
            status: 'success',
            data: { review }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ status: 'fail', message: messages });
        }
        res.status(500).json({
            status: 'error',
            message: 'Erro ao atualizar a avaliação.'
        });
    }
};

// Deletar avaliação
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({ status: 'fail', message: 'Avaliação não encontrada.' });
        }

        // Apenas autor ou admin pode deletar
        if (review.userId.toString() !== user._id.toString() && user.role !== 'admin') {
            return res.status(403).json({ status: 'fail', message: 'Você não tem permissão para deletar esta avaliação.' });
        }

        await review.deleteOne();

        res.status(204).send();
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erro ao deletar a avaliação.'
        });
    }
};
