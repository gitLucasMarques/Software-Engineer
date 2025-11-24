const mongoose = require('mongoose');
const Product = require('../src/models/product');
const Category = require('../src/models/category');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/game_ecommerce');

const categoryMapping = {
  // Componentes
  'NVIDIA GeForce RTX 4090': 'Placas de Vídeo',
  'NVIDIA GeForce RTX 4080': 'Placas de Vídeo',
  'NVIDIA GeForce RTX 4070 Ti': 'Placas de Vídeo',
  'AMD Radeon RX 7900 XTX': 'Placas de Vídeo',
  'NVIDIA GeForce RTX 3060 Ti': 'Placas de Vídeo',
  
  'Intel Core i9-13900K': 'Processadores',
  'AMD Ryzen 9 7950X': 'Processadores',
  'Intel Core i7-13700K': 'Processadores',
  'AMD Ryzen 7 7800X3D': 'Processadores',
  'Intel Core i5-13600K': 'Processadores',
  
  'Corsair Vengeance RGB 32GB (2x16GB) DDR5-6000': 'Memória RAM',
  'G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5-6400': 'Memória RAM',
  'Kingston FURY Beast 32GB (2x16GB) DDR4-3600': 'Memória RAM',
  'Corsair Dominator Platinum RGB 32GB DDR5-5600': 'Memória RAM',
  
  'Samsung 990 PRO 2TB NVMe Gen4': 'Armazenamento',
  'WD Black SN850X 4TB NVMe Gen4': 'Armazenamento',
  'Crucial P5 Plus 1TB NVMe Gen4': 'Armazenamento',
  'Kingston KC3000 2TB PCIe 4.0': 'Armazenamento',
  
  'ASUS ROG Maximus Z790 Hero': 'Placas-Mãe',
  'MSI MPG X670E Carbon WiFi': 'Placas-Mãe',
  'Gigabyte B760 AORUS Elite AX': 'Placas-Mãe',
  
  'Corsair HX1000 Platinum 1000W': 'Fontes',
  'EVGA SuperNOVA 850 G6 Gold': 'Fontes',
  'Seasonic Focus GX-750 Gold': 'Fontes',
  
  'Corsair 5000D Airflow': 'Gabinetes',
  'NZXT H7 Flow': 'Gabinetes',
  'Lian Li O11 Dynamic EVO': 'Gabinetes',
  
  // Acessórios
  'Logitech G Pro X Superlight': 'Mouses',
  'Razer BlackWidow V4 Pro': 'Teclados',
  'HyperX Cloud Alpha Wireless': 'Headsets'
};

async function associateCategories() {
  try {
    console.log('🔗 Associando produtos de hardware às categorias...\n');

    let updated = 0;
    let notFound = 0;

    for (const [productName, categoryName] of Object.entries(categoryMapping)) {
      const product = await Product.findOne({ name: productName });
      
      if (!product) {
        console.log(`❌ Produto não encontrado: ${productName}`);
        notFound++;
        continue;
      }

      const category = await Category.findOne({ name: categoryName, isActive: true });
      
      if (!category) {
        console.log(`❌ Categoria não encontrada: ${categoryName}`);
        notFound++;
        continue;
      }

      product.categoryId = category._id;
      product.genre = categoryName; // Para busca/filtro
      await product.save();
      
      console.log(`✅ ${productName} → ${categoryName}`);
      updated++;
    }

    console.log(`\n✨ Associação concluída!`);
    console.log(`   Atualizados: ${updated} produtos`);
    console.log(`   Não encontrados: ${notFound}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

associateCategories();
