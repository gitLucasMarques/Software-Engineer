const loggerMiddleware = (req, res, next) => {
    const start = Date.now();

    // Log da requisição
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

    // Capturar o fim da resposta
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(
            `[${new Date().toISOString()}] ${req.method} ${req.url} - ` +
            `Status: ${res.statusCode} - ${duration}ms`
        );
    });

    next();
};

module.exports = loggerMiddleware;
