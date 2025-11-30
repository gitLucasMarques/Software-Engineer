/**
 * Função utilitária para lidar com funções assíncronas em rotas do Express.
 * 
 * Ela evita precisar escrever `try/catch` em cada controller.
 * 
 * Como funciona:
 *  - Recebe uma função async (controller) `fn`.
 *  - Retorna uma nova função que chama `fn(req, res, next)`.
 *  - Se `fn` gerar algum erro, o `.catch(next)` envia o erro para o middleware de tratamento de erros.
 * 
 * Exemplo de uso:
 * router.get('/users', catchAsync(userController.getAllUsers));
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

module.exports = catchAsync;
