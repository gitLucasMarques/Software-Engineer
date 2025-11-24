const authMiddleware = require('./authMiddleware');
const roleMiddleware = require('./roleMiddleware');
const errorMiddleware = require('./errorMiddleware');
const notFoundMiddleware = require('./notFoundMiddleware');
const loggerMiddleware = require('./loggerMiddleware');
const rateLimitMiddleware = require('./rateLimitMiddleware');
const sessionMiddleware = require('./sessionMiddleware');
const { validateRequest, validateParams, validateQuery } = require('./validateMiddleware');

module.exports = {
    authMiddleware,
    roleMiddleware,
    errorMiddleware,
    notFoundMiddleware,
    loggerMiddleware,
    rateLimitMiddleware,
    sessionMiddleware,
    validateRequest,
    validateParams,
    validateQuery
};
