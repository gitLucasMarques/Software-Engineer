const mongoose = require('mongoose');
const Product = require('../src/models/product');
const Category = require('../src/models/category');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sw_store', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function updateProductCategories() {
  try {
    console.log('🔄 Atualizando categorias dos produtos...\n');

    // Buscar todas as categorias (subcategorias apenas)
    const categories = await Category.find({ isMainCategory: false });
    const categoryMap = {};
    
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Mapear produtos por nome para suas categorias
    const productCategoryMapping = {
      // Ação e Aventura
      'The Witcher 3: Wild Hunt': 'Ação e Aventura',
      'Red Dead Redemption 2': 'Ação e Aventura',
      'God of War': 'Ação e Aventura',
      'Horizon Zero Dawn': 'Ação e Aventura',
      'Assassins Creed Valhalla': 'Ação e Aventura',
      'Spider-Man Miles Morales': 'Ação e Aventura',
      'Ghost of Tsushima': 'Ação e Aventura',
      'Sekiro: Shadows Die Twice': 'Ação e Aventura',
      
      // FPS e Shooter
      'Call of Duty: Modern Warfare II': 'FPS e Shooter',
      'Battlefield 2042': 'FPS e Shooter',
      'Counter-Strike 2': 'FPS e Shooter',
      'Valorant - Pack Inicial': 'FPS e Shooter',
      'Halo Infinite': 'FPS e Shooter',
      'Doom Eternal': 'FPS e Shooter',
      'Rainbow Six Siege': 'FPS e Shooter',
      
      // RPG
      'Elden Ring': 'RPG',
      'Cyberpunk 2077': 'RPG',
      'Final Fantasy XVI': 'RPG',
      'Baldurs Gate 3': 'RPG',
      'Starfield': 'RPG',
      'Dragon Age: Dreadwolf': 'RPG',
      
      // Esportes
      'EA Sports FC 24': 'Esportes',
      'NBA 2K24': 'Esportes',
      'F1 23': 'Esportes',
      'Gran Turismo 7': 'Esportes',
      'Madden NFL 24': 'Esportes',
      
      // Estratégia
      'Civilization VI': 'Estratégia',
      'Total War: Warhammer III': 'Estratégia',
      'XCOM 2': 'Estratégia',
      'Age of Empires IV': 'Estratégia',
      'StarCraft II': 'Estratégia',
      
      // Terror
      'Resident Evil 4 Remake': 'Terror',
      'Dead Space Remake': 'Terror',
      'The Callisto Protocol': 'Terror',
      'Outlast Trials': 'Terror',
      'Alan Wake II': 'Terror',
      
      // Indie
      'Hades': 'Indie',
      'Hollow Knight': 'Indie',
      'Celeste': 'Indie',
      'Stardew Valley': 'Indie',
      'Dead Cells': 'Indie',
      
      // Multiplayer
      'Apex Legends - Pack Premium': 'Multiplayer',
      'Fortnite - Pack Lendário': 'Multiplayer',
      'Overwatch 2 - Pack Inicial': 'Multiplayer',
      'League of Legends - Pack RP': 'Multiplayer',
      'World of Warcraft: Dragonflight': 'Multiplayer',
      
      // Simulação
      'Microsoft Flight Simulator': 'Simulação',
      'Euro Truck Simulator 2': 'Simulação',
      'The Sims 4': 'Simulação',
      'Cities: Skylines': 'Simulação',
      'Planet Zoo': 'Simulação',
      
      // Hardware - Placas de Vídeo
      'NVIDIA GeForce RTX 4090': 'Placas de Vídeo',
      'NVIDIA GeForce RTX 4080': 'Placas de Vídeo',
      'NVIDIA GeForce RTX 4070 Ti': 'Placas de Vídeo',
      'AMD Radeon RX 7900 XTX': 'Placas de Vídeo',
      'NVIDIA GeForce RTX 3060 Ti': 'Placas de Vídeo',
      
      // Processadores
      'Intel Core i9-13900K': 'Processadores',
      'AMD Ryzen 9 7950X': 'Processadores',
      'Intel Core i7-13700K': 'Processadores',
      'AMD Ryzen 7 7800X3D': 'Processadores',
      'Intel Core i5-13600K': 'Processadores',
      
      // Memória RAM
      'Corsair Vengeance RGB 32GB (2x16GB) DDR5-6000': 'Memória RAM',
      'G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5-6400': 'Memória RAM',
      'Kingston FURY Beast 32GB (2x16GB) DDR4-3600': 'Memória RAM',
      'Corsair Dominator Platinum RGB 32GB DDR5-5600': 'Memória RAM',
      
      // Armazenamento
      'Samsung 990 PRO 2TB NVMe Gen4': 'Armazenamento',
      'WD Black SN850X 4TB NVMe Gen4': 'Armazenamento',
      'Crucial P5 Plus 1TB NVMe Gen4': 'Armazenamento',
      'Kingston KC3000 2TB PCIe 4.0': 'Armazenamento',
      
      // Placas-Mãe
      'ASUS ROG Maximus Z790 Hero': 'Placas-Mãe',
      'MSI MPG X670E Carbon WiFi': 'Placas-Mãe',
      'Gigabyte B760 AORUS Elite AX': 'Placas-Mãe',
      
      // Fontes
      'Corsair HX1000 Platinum 1000W': 'Fontes',
      'EVGA SuperNOVA 850 G6 Gold': 'Fontes',
      'Seasonic Focus GX-750 Gold': 'Fontes',
      
      // Gabinetes
      'Corsair 5000D Airflow': 'Gabinetes',
      'NZXT H7 Flow': 'Gabinetes',
      'Lian Li O11 Dynamic EVO': 'Gabinetes',
      
      // Periféricos (Acessórios)
      'Logitech G Pro X Superlight': 'Mouses',
      'Razer BlackWidow V4 Pro': 'Teclados',
      'HyperX Cloud Alpha Wireless': 'Headsets'
    };

    let updated = 0;
    let notFound = 0;

    for (const [productName, categoryName] of Object.entries(productCategoryMapping)) {
      const product = await Product.findOne({ name: productName });
      
      if (product) {
        const categoryId = categoryMap[categoryName];
        
        if (categoryId) {
          product.categoryId = categoryId;
          await product.save();
          console.log(`✓ ${productName} → ${categoryName}`);
          updated++;
        } else {
          console.log(`⚠ Categoria não encontrada: ${categoryName}`);
        }
      } else {
        console.log(`⚠ Produto não encontrado: ${productName}`);
        notFound++;
      }
    }

    console.log(`\n✨ Atualização concluída!`);
    console.log(`   Produtos atualizados: ${updated}`);
    console.log(`   Produtos não encontrados: ${notFound}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

updateProductCategories();
