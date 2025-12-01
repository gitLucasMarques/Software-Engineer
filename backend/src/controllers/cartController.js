/**
 * Este módulo contém todos os controladores relacionados ao carrinho de compras.
 * Ele permite ao usuário buscar seu carrinho, adicionar produtos, atualizar quantidades,
 * remover itens específicos e limpar todo o carrinho. Todas as operações verificam
 * a disponibilidade do produto, garantem que apenas itens ativos sejam retornados
 * e sempre populam os dados dos produtos antes de enviar a resposta. Também aplica
 * validações básicas como quantidade mínima e estoque disponível.
 */

const { Cart, Product } = require('../models');

exports.getCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await Cart.findOne({ userId }).populate({
            path: 'items.productId',
            match: { isActive: true }
        });

        if (!cart) {
            return res.status(200).json({
                status: 'success',
                data: {
                    cart: {
                        items: [],
                        totalAmount: 0
                    }
                }
            });
        }

        // Filtrar itens com produtos null (inativos)
        if (cart.items) {
            cart.items = cart.items.filter(item => item.productId !== null);
        }

        res.status(200).json({
            status: 'success',
            data: { cart }
        });
    } catch (error) {
        console.error('Erro em getCart:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao buscar o carrinho.'
        });
    }
};

exports.addItemToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity } = req.body;

        console.log('🔵 [CART] Adicionando item ao carrinho');
        console.log('👤 User ID:', userId);
        console.log('📦 Product ID:', productId);
        console.log('🔢 Quantity:', quantity);

        if (!productId || !quantity || quantity < 1) {
            console.error('❌ [CART] Dados inválidos');
            return res.status(400).json({ status: 'fail', message: 'Dados inválidos.' });
        }

        const product = await Product.findOne({ _id: productId, isActive: true });

        if (!product) {
            console.error('❌ [CART] Produto não encontrado');
            return res.status(404).json({ status: 'fail', message: 'Jogo não encontrado ou indisponível.' });
        }

        console.log('✅ [CART] Produto encontrado:', product.name);

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            console.log('🔵 [CART] Criando novo carrinho');
            cart = await Cart.create({ userId, items: [] });
        } else {
            console.log('✅ [CART] Carrinho existente encontrado');
        }

        // Verificar se o produto já está no carrinho
        const existingItemIndex = cart.items.findIndex(
            item => item.productId.toString() === productId
        );

        if (existingItemIndex > -1) {
            console.log('🔵 [CART] Produto já existe no carrinho, atualizando quantidade');
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            
            if (product.stock < newQuantity) {
                console.error('❌ [CART] Estoque insuficiente');
                return res.status(400).json({ status: 'fail', message: 'Estoque insuficiente.' });
            }

            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            console.log('🔵 [CART] Adicionando novo produto ao carrinho');
            if (product.stock < quantity) {
                console.error('❌ [CART] Estoque insuficiente');
                return res.status(400).json({ status: 'fail', message: 'Estoque insuficiente.' });
            }

            cart.items.push({ productId, quantity });
        }

        console.log('💾 [CART] Salvando carrinho...');
        await cart.save();
        console.log('✅ [CART] Carrinho salvo');
        
        // Popular o carrinho antes de retornar
        await cart.populate({
            path: 'items.productId',
            match: { isActive: true }
        });

        console.log('📦 [CART] Items no carrinho:', cart.items.length);

        // Filtrar itens com produtos null (inativos)
        if (cart.items) {
            cart.items = cart.items.filter(item => item.productId !== null);
        }

        console.log('✅ [CART] Retornando carrinho com', cart.items.length, 'itens');

        res.status(200).json({
            status: 'success',
            data: { cart }
        });

    } catch (error) {
        console.error('❌ [CART] Erro em addItemToCart:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao adicionar item ao carrinho.'
        });
    }
};

exports.updateItemQuantity = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ status: 'fail', message: 'A quantidade deve ser pelo menos 1.' });
        }

        const cart = await Cart.findOne({ 
            userId: req.user._id,
            'items._id': itemId
        });

        if (!cart) {
            return res.status(404).json({ status: 'fail', message: 'Item do carrinho não encontrado.' });
        }

        const item = cart.items.id(itemId);
        
        const product = await Product.findOne({ _id: item.productId, isActive: true });

        if (!product) {
            return res.status(404).json({ status: 'fail', message: 'Produto não encontrado ou indisponível.' });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ status: 'fail', message: 'Estoque insuficiente.' });
        }

        item.quantity = quantity;
        await cart.save();
        
        // Popular o carrinho antes de retornar
        await cart.populate({
            path: 'items.productId',
            match: { isActive: true }
        });

        // Filtrar itens com produtos null (inativos)
        if (cart.items) {
            cart.items = cart.items.filter(item => item.productId !== null);
        }

        res.status(200).json({
            status: 'success',
            data: cart
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erro ao atualizar a quantidade do item.'
        });
    }
};

exports.removeItemFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;

        const cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            return res.status(404).json({ status: 'fail', message: 'Carrinho não encontrado.' });
        }

        cart.items.pull(itemId);
        await cart.save();
        
        // Popular o carrinho antes de retornar
        await cart.populate({
            path: 'items.productId',
            match: { isActive: true }
        });

        // Filtrar itens com produtos null (inativos)
        if (cart.items) {
            cart.items = cart.items.filter(item => item.productId !== null);
        }

        res.status(200).json({
            status: 'success',
            data: cart
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erro ao remover o item do carrinho.'
        });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const userId = req.user._id;
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        } else {
            cart.items = [];
            await cart.save();
        }

        res.status(200).json({
            status: 'success',
            data: cart
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erro ao limpar o carrinho.'
        });
    }
};
