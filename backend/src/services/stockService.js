const { Product } = require('../models');
/**
 * Serviço de estoque.
 * 
 * Responsável por gerenciar e checar a disponibilidade dos produtos:
 *  - Verifica se um produto está disponível para venda.
 *  - Reserva estoque para pedidos e libera caso haja cancelamento.
 *  - Permite atualização do estoque (para admins).
 *  - Retorna produtos com estoque baixo.
 *  - Permite reservar múltiplos produtos de uma vez.
 *  - Fornece estatísticas gerais do estoque (total, esgotados, baixo estoque, valor total).
 * 
 * Basicamente, garante que o estoque esteja correto, evitando vendas de produtos indisponíveis.
 */

class StockService {
    /**
     * Verifica disponibilidade de estoque para um produto
     */
    async checkAvailability(productId, quantity) {
        const product = await Product.findById(productId);
        
        if (!product) {
            return { available: false, message: 'Produto não encontrado' };
        }

        if (!product.isActive) {
            return { available: false, message: 'Produto inativo' };
        }

        if (product.stock < quantity) {
            return { 
                available: false, 
                message: 'Estoque insuficiente',
                currentStock: product.stock,
                requested: quantity
            };
        }

        return { available: true, product };
    }

    /**
     * Reserva estoque para um pedido
     */
    async reserveStock(productId, quantity) {
        try {
            const product = await Product.findById(productId);

            if (!product) {
                throw new Error('Produto não encontrado');
            }

            if (product.stock < quantity) {
                throw new Error(`Estoque insuficiente. Disponível: ${product.stock}, Solicitado: ${quantity}`);
            }

            product.stock -= quantity;
            await product.save();

            console.log(`Estoque reservado: Produto ${productId}, Quantidade: ${quantity}`);
            
            return { success: true, product, remainingStock: product.stock };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Libera estoque (em caso de cancelamento ou erro)
     */
    async releaseStock(productId, quantity) {
        try {
            const product = await Product.findById(productId);

            if (!product) {
                throw new Error('Produto não encontrado');
            }

            product.stock += quantity;
            await product.save();

            console.log(`Estoque liberado: Produto ${productId}, Quantidade: ${quantity}`);
            
            return { success: true, product, newStock: product.stock };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Atualiza o estoque de um produto (admin)
     */
    async updateStock(productId, newStock) {
        const product = await Product.findById(productId);
        
        if (!product) {
            throw new Error('Produto não encontrado');
        }

        const oldStock = product.stock;
        product.stock = newStock;
        await product.save();

        console.log(`Estoque atualizado: Produto ${productId}, De ${oldStock} para ${newStock}`);

        return { success: true, product, oldStock, newStock };
    }

    /**
     * Retorna produtos com estoque baixo
     */
    async getLowStockProducts(threshold = 10) {
        const products = await Product.find({
            stock: { $lte: threshold },
            isActive: true
        }).sort({ stock: 1 });

        return products;
    }

    /**
     * Verifica e atualiza múltiplos produtos de uma vez
     */
    async reserveMultipleProducts(items) {
        try {
            console.log('🔵 [STOCK] Iniciando reserva de', items.length, 'produtos');
            
            // Buscar todos os produtos de uma vez
            const productIds = items.map(item => item.productId);
            const products = await Product.find({ _id: { $in: productIds } });
            
            console.log('✅ [STOCK] Produtos encontrados:', products.length);

            // Criar mapa de produtos para acesso rápido
            const productMap = {};
            products.forEach(product => {
                productMap[product._id.toString()] = product;
            });

            const results = [];

            // Validar todos primeiro
            for (const item of items) {
                const product = productMap[item.productId.toString()];

                if (!product) {
                    throw new Error(`Produto ${item.productId} não encontrado`);
                }

                if (product.stock < item.quantity) {
                    throw new Error(
                        `Estoque insuficiente para ${product.name}. ` +
                        `Disponível: ${product.stock}, Solicitado: ${item.quantity}`
                    );
                }
            }

            console.log('✅ [STOCK] Validações ok, atualizando estoque...');

            // Atualizar estoque de todos
            for (const item of items) {
                const product = productMap[item.productId.toString()];
                product.stock -= item.quantity;
                await product.save();

                results.push({
                    productId: product._id,
                    name: product.name,
                    reservedQuantity: item.quantity,
                    remainingStock: product.stock
                });
            }

            console.log(`✅ [STOCK] Estoque reservado para ${items.length} produtos`);
            
            return { success: true, results };
        } catch (error) {
            console.error('❌ [STOCK] Erro ao reservar estoque:', error.message);
            throw error;
        }
    }

    /**
     * Retorna estatísticas de estoque
     */
    async getStockStatistics() {
        const totalProducts = await Product.countDocuments({ isActive: true });
        const outOfStock = await Product.countDocuments({ 
            stock: 0,
            isActive: true 
        });
        const lowStock = await Product.countDocuments({ 
            stock: { $gte: 1, $lte: 10 },
            isActive: true 
        });

        const products = await Product.find({ isActive: true });
        const totalStockValue = products.reduce((sum, p) => sum + p.stock, 0);

        return {
            totalProducts,
            outOfStock,
            lowStock,
            totalStockValue,
            healthPercentage: ((totalProducts - outOfStock) / totalProducts * 100).toFixed(2)
        };
    }
}

module.exports = new StockService();