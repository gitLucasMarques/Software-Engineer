const mongoose = require('mongoose');
const Product = require('../src/models/product');
const Category = require('../src/models/category');
require('dotenv').config();

// Conectar ao banco
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sw_store', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// 30 produtos de hardware/PC para adicionar
const hardware = [
  // Placas de Vídeo
  { name: 'NVIDIA GeForce RTX 4090', description: 'Placa de vídeo top de linha para jogos em 4K e ray tracing.', price: 12999.90, platform: 'PC', stock: 20, image: 'https://via.placeholder.com/300x400?text=RTX+4090', categoryName: 'Hardware - Placas de Vídeo' },
  { name: 'NVIDIA GeForce RTX 4080', description: 'Performance extrema para gamers exigentes.', price: 8999.90, platform: 'PC', stock: 35, image: 'https://via.placeholder.com/300x400?text=RTX+4080', categoryName: 'Hardware - Placas de Vídeo' },
  { name: 'NVIDIA GeForce RTX 4070 Ti', description: 'Equilíbrio perfeito entre preço e performance.', price: 5999.90, platform: 'PC', stock: 50, image: 'https://via.placeholder.com/300x400?text=RTX+4070Ti', categoryName: 'Hardware - Placas de Vídeo' },
  { name: 'AMD Radeon RX 7900 XTX', description: 'Placa AMD de última geração com 24GB VRAM.', price: 7999.90, platform: 'PC', stock: 30, image: 'https://via.placeholder.com/300x400?text=RX+7900XTX', categoryName: 'Hardware - Placas de Vídeo' },
  { name: 'NVIDIA GeForce RTX 3060 Ti', description: 'Excelente custo-benefício para 1080p/1440p.', price: 2999.90, platform: 'PC', stock: 80, image: 'https://via.placeholder.com/300x400?text=RTX+3060Ti', categoryName: 'Hardware - Placas de Vídeo' },
  
  // Processadores
  { name: 'Intel Core i9-13900K', description: 'Processador de 24 núcleos para performance extrema.', price: 3999.90, platform: 'PC', stock: 40, image: 'https://via.placeholder.com/300x400?text=i9-13900K', categoryName: 'Hardware - Processadores' },
  { name: 'AMD Ryzen 9 7950X', description: '16 núcleos e 32 threads para multitarefa pesada.', price: 4299.90, platform: 'PC', stock: 35, image: 'https://via.placeholder.com/300x400?text=Ryzen+9+7950X', categoryName: 'Hardware - Processadores' },
  { name: 'Intel Core i7-13700K', description: 'Processador balanceado para jogos e produtividade.', price: 2799.90, platform: 'PC', stock: 60, image: 'https://via.placeholder.com/300x400?text=i7-13700K', categoryName: 'Hardware - Processadores' },
  { name: 'AMD Ryzen 7 7800X3D', description: 'Melhor processador para jogos com 3D V-Cache.', price: 3199.90, platform: 'PC', stock: 45, image: 'https://via.placeholder.com/300x400?text=Ryzen+7+7800X3D', categoryName: 'Hardware - Processadores' },
  { name: 'Intel Core i5-13600K', description: 'Ótimo custo-benefício com 14 núcleos.', price: 1899.90, platform: 'PC', stock: 80, image: 'https://via.placeholder.com/300x400?text=i5-13600K', categoryName: 'Hardware - Processadores' },
  
  // Memória RAM
  { name: 'Corsair Vengeance RGB 32GB (2x16GB) DDR5-6000', description: 'Memória DDR5 de alta velocidade com RGB.', price: 1299.90, platform: 'PC', stock: 100, image: 'https://via.placeholder.com/300x400?text=Corsair+DDR5', categoryName: 'Hardware - Memória RAM' },
  { name: 'G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5-6400', description: 'Kit de memória premium para workstations.', price: 2499.90, platform: 'PC', stock: 50, image: 'https://via.placeholder.com/300x400?text=GSkill+64GB', categoryName: 'Hardware - Memória RAM' },
  { name: 'Kingston FURY Beast 32GB (2x16GB) DDR4-3600', description: 'Memória DDR4 confiável e rápida.', price: 799.90, platform: 'PC', stock: 120, image: 'https://via.placeholder.com/300x400?text=Kingston+DDR4', categoryName: 'Hardware - Memória RAM' },
  { name: 'Corsair Dominator Platinum RGB 32GB DDR5-5600', description: 'Memória premium com desempenho excepcional.', price: 1599.90, platform: 'PC', stock: 70, image: 'https://via.placeholder.com/300x400?text=Dominator+RGB', categoryName: 'Hardware - Memória RAM' },
  
  // Armazenamento (SSD)
  { name: 'Samsung 990 PRO 2TB NVMe Gen4', description: 'SSD ultra-rápido com 7450 MB/s de leitura.', price: 1299.90, platform: 'PC', stock: 90, image: 'https://via.placeholder.com/300x400?text=990+PRO+2TB', categoryName: 'Hardware - Armazenamento' },
  { name: 'WD Black SN850X 4TB NVMe Gen4', description: 'SSD de alta capacidade para gamers.', price: 2499.90, platform: 'PC', stock: 60, image: 'https://via.placeholder.com/300x400?text=SN850X+4TB', categoryName: 'Hardware - Armazenamento' },
  { name: 'Crucial P5 Plus 1TB NVMe Gen4', description: 'SSD rápido com ótimo custo-benefício.', price: 599.90, platform: 'PC', stock: 150, image: 'https://via.placeholder.com/300x400?text=P5+Plus+1TB', categoryName: 'Hardware - Armazenamento' },
  { name: 'Kingston KC3000 2TB PCIe 4.0', description: 'Performance excepcional para entusiastas.', price: 1199.90, platform: 'PC', stock: 80, image: 'https://via.placeholder.com/300x400?text=KC3000+2TB', categoryName: 'Hardware - Armazenamento' },
  
  // Placas-Mãe
  { name: 'ASUS ROG Maximus Z790 Hero', description: 'Placa-mãe premium para Intel 13ª geração.', price: 3999.90, platform: 'PC', stock: 25, image: 'https://via.placeholder.com/300x400?text=ROG+Z790', categoryName: 'Hardware - Placas-Mãe' },
  { name: 'MSI MPG X670E Carbon WiFi', description: 'Placa-mãe de alta qualidade para AMD Ryzen 7000.', price: 3499.90, platform: 'PC', stock: 30, image: 'https://via.placeholder.com/300x400?text=MPG+X670E', categoryName: 'Hardware - Placas-Mãe' },
  { name: 'Gigabyte B760 AORUS Elite AX', description: 'Placa-mãe intermediária com WiFi 6E.', price: 1799.90, platform: 'PC', stock: 50, image: 'https://via.placeholder.com/300x400?text=B760+AORUS', categoryName: 'Hardware - Placas-Mãe' },
  
  // Fontes de Alimentação
  { name: 'Corsair HX1000 Platinum 1000W', description: 'Fonte modular 80 PLUS Platinum silenciosa.', price: 1499.90, platform: 'PC', stock: 60, image: 'https://via.placeholder.com/300x400?text=HX1000', categoryName: 'Hardware - Fontes' },
  { name: 'EVGA SuperNOVA 850 G6 Gold', description: 'Fonte 850W com certificação Gold.', price: 999.90, platform: 'PC', stock: 80, image: 'https://via.placeholder.com/300x400?text=SuperNOVA+850', categoryName: 'Hardware - Fontes' },
  { name: 'Seasonic Focus GX-750 Gold', description: 'Fonte confiável de 750W totalmente modular.', price: 799.90, platform: 'PC', stock: 100, image: 'https://via.placeholder.com/300x400?text=Focus+750', categoryName: 'Hardware - Fontes' },
  
  // Gabinetes
  { name: 'Corsair 5000D Airflow', description: 'Gabinete mid-tower com excelente fluxo de ar.', price: 899.90, platform: 'PC', stock: 40, image: 'https://via.placeholder.com/300x400?text=5000D', categoryName: 'Hardware - Gabinetes' },
  { name: 'NZXT H7 Flow', description: 'Design moderno com painel de vidro temperado.', price: 799.90, platform: 'PC', stock: 50, image: 'https://via.placeholder.com/300x400?text=H7+Flow', categoryName: 'Hardware - Gabinetes' },
  { name: 'Lian Li O11 Dynamic EVO', description: 'Gabinete premium para builds avançados.', price: 1299.90, platform: 'PC', stock: 30, image: 'https://via.placeholder.com/300x400?text=O11+Dynamic', categoryName: 'Hardware - Gabinetes' },
  
  // Periféricos
  { name: 'Logitech G Pro X Superlight', description: 'Mouse gamer sem fio ultra leve (63g).', price: 899.90, platform: 'PC', stock: 100, image: 'https://via.placeholder.com/300x400?text=G+Pro+X', categoryName: 'Hardware - Periféricos' },
  { name: 'Razer BlackWidow V4 Pro', description: 'Teclado mecânico com switches Green.', price: 1299.90, platform: 'PC', stock: 70, image: 'https://via.placeholder.com/300x400?text=BlackWidow+V4', categoryName: 'Hardware - Periféricos' },
  { name: 'HyperX Cloud Alpha Wireless', description: 'Headset gamer com 300h de bateria.', price: 1099.90, platform: 'PC', stock: 80, image: 'https://via.placeholder.com/300x400?text=Cloud+Alpha', categoryName: 'Hardware - Periféricos' }
];

async function seedHardware() {
  try {
    console.log('🖥️  Iniciando seed de hardware...\n');

    // Buscar ou criar categorias
    const categoryMap = {};
    const uniqueCategories = [...new Set(hardware.map(h => h.categoryName))];
    
    for (const catName of uniqueCategories) {
      let category = await Category.findOne({ name: catName });
      if (!category) {
        category = await Category.create({
          name: catName,
          description: `Categoria ${catName}`,
          slug: catName.toLowerCase().replace(/\s+/g, '-').replace(/[àáâãä]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i').replace(/[^\w-]/g, ''),
          isActive: true
        });
        console.log(`✅ Categoria criada: ${catName}`);
      }
      categoryMap[catName] = category._id;
    }

    console.log('\n📦 Adicionando produtos de hardware...\n');

    let added = 0;
    let skipped = 0;

    for (const item of hardware) {
      const exists = await Product.findOne({ name: item.name });
      
      if (!exists) {
        await Product.create({
          ...item,
          category: categoryMap[item.categoryName],
          slug: item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
          isActive: true,
          featured: Math.random() > 0.8 // 20% chance de ser destaque
        });
        console.log(`✅ Adicionado: ${item.name}`);
        added++;
      } else {
        console.log(`⏭️  Já existe: ${item.name}`);
        skipped++;
      }
    }

    console.log(`\n✨ Seed concluído!`);
    console.log(`   Adicionados: ${added} produtos`);
    console.log(`   Ignorados: ${skipped} produtos (já existiam)`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    process.exit(1);
  }
}

seedHardware();
