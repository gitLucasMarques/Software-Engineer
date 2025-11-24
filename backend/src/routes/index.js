const express = require('express');
const router = express.Router();

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
