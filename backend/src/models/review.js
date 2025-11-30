const mongoose = require('mongoose');

// Schema responsável por armazenar avaliações (reviews)
// feitas por usuários sobre produtos (no caso, jogos).
const reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: true,  // Avaliação obrigatória
        min: 1,          // Nota mínima
        max: 5           // Nota máxima
        // Este campo normalmente é usado em médias de avaliações
    },
    comment: {
        type: String,
        default: ''      // Comentário opcional
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',     // Liga a review ao usuário que fez a avaliação
        required: true
    },
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',  // Relaciona a review com um produto específico
        required: true
    }
}, {
    timestamps: true     // Cria automaticamente createdAt e updatedAt
});

// Model final que representa a coleção "reviews" no MongoDB
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
