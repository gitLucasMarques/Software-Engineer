const notFoundMiddleware = (req, res, next) => {
    res.status(404).json({
        status: 'fail',
        message: `Rota ${req.method} ${req.originalUrl} não encontrada`
    });
};

module.exports = notFoundMiddleware;
