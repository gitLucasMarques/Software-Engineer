const { Review, Product, Order, OrderItem } = require('../models');
/**
 * Este controlador gerencia avaliações de jogos feitas pelos usuários.
 * Ele permite:
 * - Criar avaliação somente se o usuário tiver comprado o jogo e ainda não tiver avaliado.
 * - Listar todas as avaliações de um jogo.
 * - Atualizar a própria avaliação (rating/comentário).
 * - Deletar uma avaliação (pelo autor ou por um administrador).
 * Todas as operações usam Mongoose e retornam respostas padronizadas em JSON.
 */

// Cria uma avaliação para um jogo, garantindo que o usuário tenha comprado e ainda não avaliou
exports.createReview = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user._id;
        const { rating, comment } = req.body;

        const product = await Product.findById(gameId);
        if (!product) {
            return res.status(404).json({ status: 'fail', message: 'Jogo não encontrado.' });
        }

        const existingReview = await Review.findOne({ userId, gameId });
        if (existingReview) {
            return res.status(400).json({ status: 'fail', message: 'Você já avaliou este jogo.' });
        }

        const hasPurchased = await Order.findOne({
            userId,
            paymentStatus: 'paid'
        }).populate({
            path: 'items',
            match: { gameId }
        });

        if (!hasPurchased || !hasPurchased.items || hasPurchased.items.length === 0) {
            return res.status(403).json({
                status: 'fail',
                message: 'Você deve comprar o jogo para poder avaliá-lo.'
            });
        }

        const newReview = await Review.create({
            rating,
            comment,
            userId,
            gameId
        });

        res.status(201).json({
            status: 'success',
            data: { review: newReview }
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ status: 'fail', message: messages });
        }
        res.status(500).json({ status: 'error', message: 'Erro ao criar a avaliação.' });
    }
};

// Retorna todas as avaliações de um jogo
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
        res.status(500).json({ status: 'error', message: 'Erro ao buscar as avaliações.' });
    }
};

// Atualiza avaliação feita pelo próprio usuário
exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { rating, comment } = req.body;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({ status: 'fail', message: 'Avaliação não encontrada.' });
        }

        if (review.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                status: 'fail',
                message: 'Você não tem permissão para editar esta avaliação.'
            });
        }

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
        res.status(500).json({ status: 'error', message: 'Erro ao atualizar a avaliação.' });
    }
};

// Exclui avaliação (próprio usuário ou admin)
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ status: 'fail', message: 'Avaliação não encontrada.' });
        }

        if (review.userId.toString() !== user._id.toString() && user.role !== 'admin') {
            return res.status(403).json({
                status: 'fail',
                message: 'Você não tem permissão para deletar esta avaliação.'
            });
        }

        await review.deleteOne();
        res.status(204).send();

    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Erro ao deletar a avaliação.' });
    }
};
