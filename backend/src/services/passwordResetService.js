const { User, PasswordReset } = require('../models');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const emailService = require('./emailService');

class PasswordResetService {
    async sendResetEmail(email) {
        try {
            const user = await User.findOne({ where: { email } });
            
            if (!user) {
                // Por segurança, não revelamos se o email existe ou não
                return { success: true, message: 'Se o email existir, um link de recuperação será enviado.' };
            }

            // Gera token único
            const token = crypto.randomBytes(32).toString('hex');
            
            // Calcula tempo de expiração (1 hora)
            const expiresAt = new Date(Date.now() + 3600000);
            
            // Salva token no banco
            await PasswordReset.create({ 
                userId: user.id, 
                token, 
                expiresAt,
                used: false
            });
            
            // Envia email
            await emailService.sendPasswordResetEmail(user, token);
            
            return { success: true, message: 'Email de recuperação enviado com sucesso.' };
        } catch (error) {
            console.error('Erro ao enviar email de recuperação:', error);
            throw new Error('Erro ao processar solicitação de recuperação de senha.');
        }
    }

    async resetPassword(token, newPassword) {
        try {
            const reset = await PasswordReset.findOne({ 
                where: { token, used: false },
                include: [{ model: User, as: 'user' }]
            });
            
            if (!reset) {
                throw new Error('Token inválido ou já utilizado.');
            }
            
            if (new Date() > reset.expiresAt) {
                throw new Error('Token expirado. Solicite um novo link de recuperação.');
            }
            
            // Atualiza a senha do usuário
            const user = reset.user;
            user.password = newPassword; // O hook do model vai fazer o hash
            await user.save();
            
            // Marca o token como usado
            reset.used = true;
            await reset.save();
            
            // Envia email de confirmação
            await emailService.sendPasswordChangedEmail(user);
            
            return { success: true, message: 'Senha alterada com sucesso.' };
        } catch (error) {
            console.error('Erro ao resetar senha:', error);
            throw error;
        }
    }

    async validateToken(token) {
        try {
            const reset = await PasswordReset.findOne({ 
                where: { token, used: false }
            });
            
            if (!reset) {
                return { valid: false, message: 'Token inválido ou já utilizado.' };
            }
            
            if (new Date() > reset.expiresAt) {
                return { valid: false, message: 'Token expirado.' };
            }
            
            return { valid: true };
        } catch (error) {
            console.error('Erro ao validar token:', error);
            return { valid: false, message: 'Erro ao validar token.' };
        }
    }
}

module.exports = new PasswordResetService();
