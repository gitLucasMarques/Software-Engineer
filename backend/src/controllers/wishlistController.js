const { User, Product } = require('../models');
/**
 * Este controlador gerencia a wishlist (lista de desejos) de produtos dos usuários.
 * Ele permite:
 * - Obter a lista de desejos do usuário autenticado
 * - Adicionar um produto à wishlist
 * - Remover um produto específico da wishlist
 * - Limpar toda a wishlist
 * Todas as operações usam Mongoose e retornam respostas padronizadas em JSON.
 */

// Obtém a wishlist do usuário autenticado
exports.getWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const user = await User.findById(userId).populate('wishlist');
        
        if (!user) {
            return res.status(404).json({ 
                status: 'fail', 
                message: 'Usuário não encontrado.' 
            });
        }

        res.status(200).json({
            status: 'success',
            results: user.wishlist.length,
            data: { wishlist: user.wishlist }
        });

    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: 'Erro ao buscar a wishlist.' 
        });
    }
};

// Adiciona um produto à wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'O ID do produto é obrigatório.' 
            });
        }

        // Verifica se o produto existe
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ 
                status: 'fail', 
                message: 'Produto não encontrado.' 
            });
        }

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ 
                status: 'fail', 
                message: 'Usuário não encontrado.' 
            });
        }

        // Verifica se o produto já está na wishlist
        if (user.wishlist.includes(productId)) {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'Este produto já está na sua wishlist.' 
            });
        }

        user.wishlist.push(productId);
        await user.save();

        await user.populate('wishlist');

        res.status(200).json({
            status: 'success',
            message: 'Produto adicionado à wishlist.',
            data: { wishlist: user.wishlist }
        });

    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: 'Erro ao adicionar produto à wishlist.' 
        });
    }
};

// Remove um produto específico da wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ 
                status: 'fail', 
                message: 'Usuário não encontrado.' 
            });
        }

        const index = user.wishlist.indexOf(productId);
        if (index === -1) {
            return res.status(404).json({ 
                status: 'fail', 
                message: 'Produto não encontrado na wishlist.' 
            });
        }

        user.wishlist.splice(index, 1);
        await user.save();

        await user.populate('wishlist');

        res.status(200).json({
            status: 'success',
            message: 'Produto removido da wishlist.',
            data: { wishlist: user.wishlist }
        });

    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: 'Erro ao remover produto da wishlist.' 
        });
    }
};

// Limpa toda a wishlist
exports.clearWishlist = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ 
                status: 'fail', 
                message: 'Usuário não encontrado.' 
            });
        }

        user.wishlist = [];
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Wishlist limpa com sucesso.',
            data: { wishlist: [] }
        });

    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: 'Erro ao limpar a wishlist.' 
        });
    }
};
