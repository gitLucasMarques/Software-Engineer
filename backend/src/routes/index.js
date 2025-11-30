const express = require('express');
const router = express.Router();
/**
 * Este arquivo configura o roteamento principal da API.
 * 
 * Ele importa todas as rotas específicas de funcionalidades, como:
 * autenticação, usuários, produtos, categorias, carrinho, pedidos, 
 * pagamentos, avaliações, wishlist, cartões e upload de imagens.
 * 
 * A rota raiz ('/') retorna informações básicas sobre a API, incluindo 
 * versão e endpoints disponíveis. Em seguida, cada conjunto de rotas 
 * é associado a um caminho específico ('/auth', '/users', '/products', etc.), 
 * organizando a API de forma modular e fácil de manter.
 * 
 * Em resumo, este arquivo funciona como o ponto central de roteamento,
 * direcionando requisições para os módulos correspondentes e fornecendo 
 * uma visão geral da API.
 */

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const paymentRoutes = require('./paymentRoutes');
const reviewRoutes = require('./reviewRoutes');
const imageUploadRoutes = require('./imageUploadRoutes');
const passwordResetRoutes = require('./passwordResetRoutes');
const wishlistRoutes = require('./wishlistRoutes');
const cardRoutes = require('./cardRoutes');

// Informações da API
router.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Voxel API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            products: '/api/products',
            categories: '/api/categories',
            cart: '/api/cart',
            orders: '/api/orders',
            payments: '/api/payments',
            reviews: '/api/reviews',
            wishlist: '/api/wishlist',
            cards: '/api/cards'
        }
    });
});

// Rotas da API
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/image-upload', imageUploadRoutes);
router.use('/password-reset', passwordResetRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/cards', cardRoutes);

module.exports = router;
