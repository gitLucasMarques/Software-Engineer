const { validationResult } = require('express-validator');
/**
 * Middleware de validação que utiliza schemas (ex: Joi) para validar
 * o corpo da requisição, parâmetros e query strings.
 * Cada função (validateRequest, validateParams, validateQuery) executa
 * a validação correspondente e retorna erros detalhados caso os dados
 * estejam inválidos.
 * No final, também exporta um middleware que lida com validações
 * vindas do express-validator, retornando erro 400 se houver inconsistências.
 */

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message
            }));

            return res.status(400).json({
                status: 'fail',
                message: 'Dados de validação inválidos.',
                errors
            });
        }

        next();
    };
};

const validateParams = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.params, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message
            }));

            return res.status(400).json({
                status: 'fail',
                message: 'Parâmetros inválidos.',
                errors
            });
        }

        next();
    };
};

const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.query, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message
            }));

            return res.status(400).json({
                status: 'fail',
                message: 'Query strings inválidas.',
                errors
            });
        }

        next();
    };
};

module.exports = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};
