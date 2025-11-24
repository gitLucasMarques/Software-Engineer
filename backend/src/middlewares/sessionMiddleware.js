const session = require('express-session');
const environment = require('../config/environment');

const sessionConfig = {
    secret: environment.SESSION_SECRET || environment.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: environment.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        sameSite: 'strict'
    },
    name: 'sessionId'
};

// Se estiver em produção, pode configurar store para Redis ou outro
if (environment.NODE_ENV === 'production') {
    // Exemplo com Redis (requer configuração adicional):
    // const RedisStore = require('connect-redis')(session);
    // const redis = require('redis');
    // const redisClient = redis.createClient();
    // sessionConfig.store = new RedisStore({ client: redisClient });
}

const sessionMiddleware = session(sessionConfig);

module.exports = sessionMiddleware;
