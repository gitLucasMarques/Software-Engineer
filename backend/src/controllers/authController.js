const jwt = require('jsonwebtoken');
const User = require('../models/user');
const environment = require('../config/environment');
const emailService = require('../services/emailService');

const signToken = (id) => {
    return jwt.sign({ id }, environment.JWT_SECRET, {
        expiresIn: environment.JWT_EXPIRES_IN || '7d'
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 'fail',
                message: 'Este e-mail já está em uso.'
            });
        }

        const newUser = await User.create({
            name,
            email,
            password,
            phone,
            address
        });

        // Envia email de boas-vindas (não aguarda para não bloquear a resposta)
        emailService.sendWelcomeEmail(newUser).catch(err => 
            console.error('Erro ao enviar email de boas-vindas:', err)
        );

        createSendToken(newUser, 201, res);

    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ status: 'fail', message: messages });
        }
        res.status(500).json({
            status: 'error',
            message: 'Ocorreu um erro ao registrar o usuário.'
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Por favor, forneça e-mail e senha.'
            });
        }

        const user = await User.findOne({ email });

        if (!user || !(await user.isValidPassword(password))) {
            return res.status(401).json({
                status: 'fail',
                message: 'E-mail ou senha incorretos.'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                status: 'fail',
                message: 'Sua conta está inativa. Entre em contato com o suporte.'
            });
        }

        createSendToken(user, 200, res);

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Ocorreu um erro ao tentar fazer login.'
        });
    }
};

exports.getMe = async (req, res) => {
    if (!req.user) {
        return res.status(404).json({
            status: 'fail',
            message: 'Usuário não encontrado.'
        });
    }

    req.user.password = undefined;

    res.status(200).json({
        status: 'success',
        data: {
            user: req.user
        }
    });
};

exports.updateMe = async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        const userId = req.user._id;

        // Não permitir atualização de email e password por esta rota
        if (req.body.email || req.body.password || req.body.role) {
            return res.status(400).json({
                status: 'fail',
                message: 'Esta rota não é para atualização de senha, email ou role.'
            });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (address) updateData.address = address;

        const user = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true
        });

        user.password = undefined;

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erro ao atualizar perfil.'
        });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                status: 'fail',
                message: 'Por favor, forneça a senha atual e a nova senha.'
            });
        }

        const user = await User.findById(userId);

        if (!(await user.isValidPassword(currentPassword))) {
            return res.status(401).json({
                status: 'fail',
                message: 'Senha atual incorreta.'
            });
        }

        user.password = newPassword;
        await user.save();

        createSendToken(user, 200, res);

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erro ao atualizar senha.'
        });
    }
};
