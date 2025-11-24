const PasswordResetService = require('../services/passwordResetService');

exports.requestReset = async (req, res) => {
    const { email } = req.body;
    await PasswordResetService.sendResetEmail(email);
    res.json({ message: 'Se existir, um email de recuperação foi enviado.' });
};

exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;
    await PasswordResetService.resetPassword(token, password);
    res.json({ message: 'Senha redefinida com sucesso.' });
};
