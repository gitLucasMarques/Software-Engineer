const User = require('../models/user');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erro ao buscar usuários.'
        });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'Usuário não encontrado.'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erro ao buscar o usuário.'
        });
    }
};

exports.updateMe = async (req, res) => {
    try {
        if (req.body.password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Esta rota não é para atualização de senha.'
            });
        }

        const allowedUpdates = {
            name: req.body.name,
            address: req.body.address
        };

        const user = await User.findByIdAndUpdate(
            req.user._id,
            allowedUpdates,
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erro ao atualizar os dados do usuário.'
        });
    }
};

exports.deleteMe = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user._id);

        res.status(204).send();
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erro ao deletar o usuário.'
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'Usuário não encontrado.'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erro ao atualizar o usuário.'
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'Usuário não encontrado.'
            });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erro ao deletar o usuário.'
        });
    }
};