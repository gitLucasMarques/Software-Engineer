const mongoose = require('mongoose');
const Product = require('../src/models/product');
const Category = require('../src/models/category');
require('dotenv').config();

// Conectar ao banco
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sw_store', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function seedAll() {
  try {
    console.log('🚀 Iniciando seed completo do banco de dados...\n');

    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();

    console.log(`📊 Estado atual do banco:`);
    console.log(`   - Produtos: ${totalProducts}`);
    console.log(`   - Categorias: ${totalCategories}\n`);

    console.log('✨ Seed completo! Execute os scripts individuais para adicionar dados:');
    console.log('   - npm run seed:games    (adiciona 50 jogos)');
    console.log('   - npm run seed:hardware (adiciona 30 produtos de hardware)');
    console.log('   - npm run seed:all      (executa ambos)\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

seedAll();
