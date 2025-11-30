const mongoose = require('mongoose');
const Category = require('../src/models/category');
const Product = require('../src/models/product');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sw_store', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Estrutura hierárquica de categorias
const categoriesStructure = {
  'Jogos': {
    description: 'Todos os jogos disponíveis',
    subcategories: [
      { name: 'Ação e Aventura', description: 'Jogos de ação e aventura' },
      { name: 'FPS e Shooter', description: 'Jogos de tiro em primeira pessoa' },
      { name: 'RPG', description: 'Jogos de RPG e aventura' },
      { name: 'Estratégia', description: 'Jogos de estratégia' },
      { name: 'Esportes', description: 'Jogos esportivos' },
      { name: 'Terror', description: 'Jogos de terror e suspense' },
      { name: 'Indie', description: 'Jogos independentes' },
      { name: 'Multiplayer', description: 'Jogos online multiplayer' },
      { name: 'Simulação', description: 'Simuladores diversos' }
    ]
  },
  'Componentes': {
    description: 'Componentes e hardware para PC',
    subcategories: [
      { name: 'Placas de Vídeo', description: 'GPUs e placas gráficas' },
      { name: 'Processadores', description: 'CPUs Intel e AMD' },
      { name: 'Memória RAM', description: 'Módulos de memória RAM' },
      { name: 'Armazenamento', description: 'SSDs e HDs' },
      { name: 'Placas-Mãe', description: 'Motherboards' },
      { name: 'Fontes', description: 'Fontes de alimentação' },
      { name: 'Gabinetes', description: 'Cases e gabinetes' }
    ]
  },
  'Consoles': {
    description: 'Consoles de videogame',
    subcategories: [
      { name: 'PlayStation', description: 'Consoles PlayStation' },
      { name: 'Xbox', description: 'Consoles Xbox' },
      { name: 'Nintendo', description: 'Consoles Nintendo' }
    ]
  },
  'Acessórios': {
    description: 'Periféricos e acessórios',
    subcategories: [
      { name: 'Teclados', description: 'Teclados gamers' },
      { name: 'Mouses', description: 'Mouses gamers' },
      { name: 'Headsets', description: 'Fones de ouvido' },
      { name: 'Controles', description: 'Controles e joysticks' },
      { name: 'Monitores', description: 'Monitores gamers' },
      { name: 'Cadeiras', description: 'Cadeiras gamers' }
    ]
  }
};

async function setupCategories() {
  try {
    console.log('🏗️  Configurando estrutura de categorias...\n');

    // Limpar categorias antigas
    await Category.deleteMany({});
    console.log('✅ Categorias antigas removidas\n');

    const categoryMap = {};

    // Criar categorias principais e subcategorias
    for (const [mainCatName, mainCatData] of Object.entries(categoriesStructure)) {
      // Criar categoria principal
      const mainCategory = await Category.create({
        name: mainCatName,
        description: mainCatData.description,
        slug: mainCatName.toLowerCase().replace(/\s+/g, '-'),
        isActive: true,
        isMainCategory: true,
        parentCategory: null
      });
      
      console.log(`✅ Categoria principal criada: ${mainCatName}`);
      categoryMap[mainCatName] = mainCategory._id;

      // Criar subcategorias
      for (const subCat of mainCatData.subcategories) {
        const subCategory = await Category.create({
          name: subCat.name,
          description: subCat.description,
          slug: subCat.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
          isActive: true,
          isMainCategory: false,
          parentCategory: mainCategory._id
        });
        
        console.log(`  ↳ Subcategoria criada: ${subCat.name}`);
        categoryMap[subCat.name] = subCategory._id;
      }
      console.log('');
    }

    console.log('📦 Atualizando produtos existentes...\n');

    // Mapear categorias antigas para novas estruturas
    const categoryMapping = {
      'Ação e Aventura': 'Ação e Aventura',
      'FPS e Shooter': 'FPS e Shooter',
      'RPG': 'RPG',
      'Estratégia': 'Estratégia',
      'Esportes': 'Esportes',
      'Terror': 'Terror',
      'Indie': 'Indie',
      'Multiplayer': 'Multiplayer',
      'Simulação': 'Simulação',
      'Hardware - Placas de Vídeo': 'Placas de Vídeo',
      'Hardware - Processadores': 'Processadores',
      'Hardware - Memória RAM': 'Memória RAM',
      'Hardware - Armazenamento': 'Armazenamento',
      'Hardware - Placas-Mãe': 'Placas-Mãe',
      'Hardware - Fontes': 'Fontes',
      'Hardware - Gabinetes': 'Gabinetes',
      'Hardware - Periféricos': 'Acessórios'
    };

    // Atualizar produtos
    const products = await Product.find();
    let updated = 0;
    
    for (const product of products) {
      // Buscar a categoria antiga do produto
      if (product.categoryId) {
        const oldCategory = await Category.findById(product.categoryId);
        
        if (oldCategory) {
          const oldCategoryName = oldCategory.name;
          const newCategoryName = categoryMapping[oldCategoryName];
          
          if (newCategoryName && categoryMap[newCategoryName]) {
            product.categoryId = categoryMap[newCategoryName];
            await product.save();
            console.log(`  ✓ Produto "${product.name}" → ${newCategoryName}`);
            updated++;
          }
        }
      }
    }

    console.log(`\n✨ Setup concluído!`);
    console.log(`   Categorias principais: 4`);
    console.log(`   Subcategorias: ${Object.keys(categoryMap).length - 4}`);
    console.log(`   Produtos atualizados: ${updated}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

setupCategories();
