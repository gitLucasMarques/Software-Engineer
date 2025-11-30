const mongoose = require('mongoose');
const Product = require('../src/models/product');
const Category = require('../src/models/category');
require('dotenv').config(); // Carrega variáveis do arquivo .env

// Conectar ao banco
// Usa a variável MONGODB_URI definida no ambiente.
// Caso ela não exista, conecta ao MongoDB local no banco "sw_store".
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sw_store', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function seedAll() {
  try {
    console.log('🚀 Iniciando seed completo do banco de dados...\n');

    // Conta quantos documentos existem nas coleções Product e Category
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();

    // Exibe o estado atual do banco antes da inserção
    console.log(`📊 Estado atual do banco:`);
    console.log(`   - Produtos: ${totalProducts}`);
    console.log(`   - Categorias: ${totalCategories}\n`);

    // Esse script serve apenas como "sumário",
    // indicando ao usuário quais scripts ele deve rodar para adicionar dados
    console.log('✨ Seed completo! Execute os scripts individuais para adicionar dados:');
    console.log('   - npm run seed:games    (adiciona 50 jogos)');
    console.log('   - npm run seed:hardware (adiciona 30 produtos de hardware)');
    console.log('   - npm run seed:all      (executa ambos)\n');

    // Finaliza o processo sem erros
    process.exit(0);
  } catch (error) {
    // Captura e exibe qualquer erro que ocorra
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

seedAll(); // Executa a função principal
