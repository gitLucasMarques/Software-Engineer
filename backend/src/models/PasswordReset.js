const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    used: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
/**
 * Modelo de Redefinição de Senha (PasswordReset) usando Mongoose.
 * Armazena tokens temporários para recuperação de senha,
 * vinculados a um usuário e com data de expiração.
 * Também registra se o token já foi utilizado. Utiliza timestamps automáticos.
 */

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = PasswordReset;
