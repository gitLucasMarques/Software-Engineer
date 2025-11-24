const { User, Product } = require('../models');

exports.getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'wishlist',
            match: { isActive: true }
        });
        
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'Usuário não encontrado.'
            });
        }

        // Filtrar produtos null (quando match não encontra)
        const activeWishlist = user.wishlist ? user.wishlist.filter(item => item !== null) : [];

        res.status(200).json({
            status: 'success',
            data: {
                wishlist: activeWishlist
            }
        });
    } catch (error) {
        console.error('Erro em getWishlist:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao buscar lista de desejos.'
        });
    }
};

exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user._id;

        if (!productId) {
            return res.status(400).json({
                status: 'fail',
                message: 'ID do produto é obrigatório.'
            });
        }

        const product = await Product.findOne({ _id: productId, isActive: true });
        if (!product) {
            return res.status(404).json({
                status: 'fail',
                message: 'Produto não encontrado ou indisponível.'
            });
        }

        const user = await User.findById(userId);
        
        if (user.wishlist.includes(productId)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Produto já está na lista de desejos.'
            });
        }

        user.wishlist.push(productId);
        await user.save();

        await user.populate({
            path: 'wishlist',
            match: { isActive: true }
        });

        // Filtrar produtos null (quando match não encontra)
        const activeWishlist = user.wishlist ? user.wishlist.filter(item => item !== null) : [];

        res.status(200).json({
            status: 'success',
            data: {
                wishlist: activeWishlist
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erro ao adicionar produto à lista de desejos.'
        });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        const user = await User.findById(userId);
        
        if (!user.wishlist.includes(productId)) {
            return res.status(404).json({
                status: 'fail',
                message: 'Produto não está na lista de desejos.'
            });
        }

        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();

        await user.populate({
            path: 'wishlist',
            match: { isActive: true }
        });

        // Filtrar produtos null (quando match não encontra)
        const activeWishlist = user.wishlist ? user.wishlist.filter(item => item !== null) : [];

        res.status(200).json({
            status: 'success',
            data: {
                wishlist: activeWishlist
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erro ao remover produto da lista de desejos.'
        });
    }
};

exports.clearWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        
        user.wishlist = [];
        await user.save();

        res.status(200).json({
            status: 'success',
            data: {
                wishlist: []
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erro ao limpar lista de desejos.'
        });
    }
};
