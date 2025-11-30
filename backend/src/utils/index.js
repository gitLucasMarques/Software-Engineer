const AppError = require('./AppError');
const catchAsync = require('./catchAsync');
const ResponseHandler = require('./responseHandler');
const validators = require('./validators');

module.exports = {
    AppError,
    catchAsync,
    ResponseHandler,
    ...validators
};




/**
 * Este arquivo funciona como um "hub" para utilitários e helpers do projeto.
 * Ele importa:
 *  - AppError: classe para criar erros customizados
 *  - catchAsync: helper para lidar com funções async nas rotas
 *  - ResponseHandler: helper para padronizar respostas da API
 *  - validators: conjunto de funções de validação
 * 
 * Depois, ele exporta tudo junto para facilitar a importação em outros arquivos.
 * Exemplo:
 * const { AppError, catchAsync, someValidator } = require('./utils');
 */
