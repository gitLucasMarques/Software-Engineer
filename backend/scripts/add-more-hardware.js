const mongoose = require('mongoose');
const Product = require('../src/models/product');
const Category = require('../src/models/category');

mongoose.connect('mongodb://localhost:27017/game_ecommerce')
  .then(async () => {
    console.log('Conectado ao MongoDB');

    // Buscar categorias
    const categories = await Category.find({
      name: { $in: ['Placas de Vídeo', 'Processadores', 'Memória RAM', 'Armazenamento', 'Placas-Mãe', 'Fontes', 'Gabinetes', 'Mouses', 'Teclados', 'Headsets', 'Monitores', 'Cadeiras'] }
    });

    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    const newProducts = [
      // Mais Placas de Vídeo
      {
        name: 'NVIDIA GeForce RTX 4060 Ti',
        description: 'Placa de vídeo RTX 4060 Ti 8GB GDDR6, perfeita para jogos em 1080p e 1440p com Ray Tracing.',
        price: 2899.99,
        imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500',
        categoryId: categoryMap['Placas de Vídeo'],
        stock: 20,
        isActive: true
      },
      {
        name: 'AMD Radeon RX 7800 XT',
        description: 'Placa de vídeo AMD Radeon RX 7800 XT 16GB GDDR6, excelente custo-benefício.',
        price: 3499.99,
        imageUrl: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500',
        categoryId: categoryMap['Placas de Vídeo'],
        stock: 12,
        isActive: true
      },
      {
        name: 'NVIDIA GeForce RTX 4070',
        description: 'RTX 4070 12GB GDDR6X, desempenho excepcional em 1440p e 4K.',
        price: 4299.99,
        imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500',
        categoryId: categoryMap['Placas de Vídeo'],
        stock: 15,
        isActive: true
      },

      // Mais Processadores
      {
        name: 'Intel Core i5-14600K',
        description: 'Processador Intel Core i5 14ª geração, 14 núcleos, excelente para jogos.',
        price: 1899.99,
        imageUrl: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=500',
        categoryId: categoryMap['Processadores'],
        stock: 25,
        isActive: true
      },
      {
        name: 'AMD Ryzen 5 7600X',
        description: 'Processador AMD Ryzen 5 7600X, 6 núcleos, ótimo custo-benefício.',
        price: 1599.99,
        imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500',
        categoryId: categoryMap['Processadores'],
        stock: 30,
        isActive: true
      },
      {
        name: 'Intel Core i7-14700K',
        description: 'Processador Intel i7 14ª geração, 20 núcleos, alto desempenho.',
        price: 2899.99,
        imageUrl: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=500',
        categoryId: categoryMap['Processadores'],
        stock: 18,
        isActive: true
      },

      // Mais Memória RAM
      {
        name: 'G.Skill Trident Z5 RGB 32GB DDR5-6400',
        description: 'Memória RAM DDR5 32GB (2x16GB) 6400MHz com RGB, alto desempenho.',
        price: 1299.99,
        imageUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=500',
        categoryId: categoryMap['Memória RAM'],
        stock: 40,
        isActive: true
      },
      {
        name: 'Corsair Vengeance 16GB DDR4-3200',
        description: 'Memória RAM DDR4 16GB (2x8GB) 3200MHz, ótimo custo-benefício.',
        price: 449.99,
        imageUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=500',
        categoryId: categoryMap['Memória RAM'],
        stock: 50,
        isActive: true
      },
      {
        name: 'Kingston FURY Beast RGB 64GB DDR5-5600',
        description: 'Memória RAM DDR5 64GB (2x32GB) 5600MHz com RGB.',
        price: 2199.99,
        imageUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=500',
        categoryId: categoryMap['Memória RAM'],
        stock: 15,
        isActive: true
      },

      // Mais Armazenamento
      {
        name: 'Samsung 980 PRO 1TB NVMe',
        description: 'SSD NVMe Samsung 980 PRO 1TB, velocidades até 7000MB/s.',
        price: 699.99,
        imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500',
        categoryId: categoryMap['Armazenamento'],
        stock: 35,
        isActive: true
      },
      {
        name: 'Crucial P3 Plus 2TB NVMe',
        description: 'SSD NVMe Crucial P3 Plus 2TB, ótimo custo-benefício.',
        price: 899.99,
        imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500',
        categoryId: categoryMap['Armazenamento'],
        stock: 28,
        isActive: true
      },
      {
        name: 'Seagate FireCuda 530 4TB NVMe',
        description: 'SSD NVMe Seagate FireCuda 530 4TB, máximo desempenho.',
        price: 2499.99,
        imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500',
        categoryId: categoryMap['Armazenamento'],
        stock: 10,
        isActive: true
      },

      // Mais Placas-Mãe
      {
        name: 'ASUS TUF Gaming B760-PLUS',
        description: 'Placa-mãe ASUS TUF B760, suporte Intel 13ª/14ª geração.',
        price: 1299.99,
        imageUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500',
        categoryId: categoryMap['Placas-Mãe'],
        stock: 22,
        isActive: true
      },
      {
        name: 'MSI B650 TOMAHAWK WIFI',
        description: 'Placa-mãe MSI B650, suporte AMD Ryzen 7000.',
        price: 1499.99,
        imageUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500',
        categoryId: categoryMap['Placas-Mãe'],
        stock: 18,
        isActive: true
      },

      // Mais Fontes
      {
        name: 'Corsair RM850x 850W Gold',
        description: 'Fonte Corsair RM850x 850W 80 Plus Gold, totalmente modular.',
        price: 899.99,
        imageUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500',
        categoryId: categoryMap['Fontes'],
        stock: 30,
        isActive: true
      },
      {
        name: 'Thermaltake Toughpower GF3 750W',
        description: 'Fonte Thermaltake 750W 80 Plus Gold, eficiência e estabilidade.',
        price: 749.99,
        imageUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500',
        categoryId: categoryMap['Fontes'],
        stock: 25,
        isActive: true
      },

      // Mais Gabinetes
      {
        name: 'Cooler Master H500',
        description: 'Gabinete Cooler Master H500, excelente fluxo de ar.',
        price: 699.99,
        imageUrl: 'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=500',
        categoryId: categoryMap['Gabinetes'],
        stock: 15,
        isActive: true
      },
      {
        name: 'Fractal Design Meshify 2',
        description: 'Gabinete Fractal Design Meshify 2, design moderno e minimalista.',
        price: 899.99,
        imageUrl: 'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=500',
        categoryId: categoryMap['Gabinetes'],
        stock: 12,
        isActive: true
      },

      // Mais Mouses
      {
        name: 'Razer Viper V2 Pro',
        description: 'Mouse gamer Razer Viper V2 Pro, wireless, 59g, sensor 30K.',
        price: 899.99,
        imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
        categoryId: categoryMap['Mouses'],
        stock: 40,
        isActive: true
      },
      {
        name: 'SteelSeries Rival 3',
        description: 'Mouse gamer SteelSeries Rival 3, leve e preciso.',
        price: 249.99,
        imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
        categoryId: categoryMap['Mouses'],
        stock: 50,
        isActive: true
      },
      {
        name: 'Corsair Dark Core RGB Pro',
        description: 'Mouse gamer Corsair wireless com RGB personalizável.',
        price: 549.99,
        imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
        categoryId: categoryMap['Mouses'],
        stock: 35,
        isActive: true
      },

      // Mais Teclados
      {
        name: 'Corsair K70 RGB Pro',
        description: 'Teclado mecânico Corsair K70, switches Cherry MX, RGB.',
        price: 899.99,
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
        categoryId: categoryMap['Teclados'],
        stock: 25,
        isActive: true
      },
      {
        name: 'Logitech G Pro X',
        description: 'Teclado mecânico Logitech G Pro X, switches intercambiáveis.',
        price: 799.99,
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
        categoryId: categoryMap['Teclados'],
        stock: 30,
        isActive: true
      },
      {
        name: 'HyperX Alloy Origins Core',
        description: 'Teclado mecânico HyperX TKL, switches HyperX Red.',
        price: 549.99,
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
        categoryId: categoryMap['Teclados'],
        stock: 35,
        isActive: true
      },

      // Mais Headsets
      {
        name: 'SteelSeries Arctis 7',
        description: 'Headset gamer SteelSeries Arctis 7, wireless, som surround.',
        price: 899.99,
        imageUrl: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=500',
        categoryId: categoryMap['Headsets'],
        stock: 28,
        isActive: true
      },
      {
        name: 'Razer BlackShark V2',
        description: 'Headset gamer Razer BlackShark V2, THX Spatial Audio.',
        price: 549.99,
        imageUrl: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=500',
        categoryId: categoryMap['Headsets'],
        stock: 40,
        isActive: true
      },
      {
        name: 'Corsair Void RGB Elite',
        description: 'Headset wireless Corsair com som 7.1 surround e RGB.',
        price: 649.99,
        imageUrl: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=500',
        categoryId: categoryMap['Headsets'],
        stock: 32,
        isActive: true
      },

      // Monitores
      {
        name: 'LG UltraGear 27GL850',
        description: 'Monitor LG 27" IPS 144Hz 1ms, ideal para jogos competitivos.',
        price: 2299.99,
        imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500',
        categoryId: categoryMap['Monitores'],
        stock: 15,
        isActive: true
      },
      {
        name: 'ASUS ROG Swift PG279Q',
        description: 'Monitor ASUS 27" IPS 165Hz G-Sync, perfeito para gamers.',
        price: 2899.99,
        imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500',
        categoryId: categoryMap['Monitores'],
        stock: 12,
        isActive: true
      },
      {
        name: 'Samsung Odyssey G7',
        description: 'Monitor Samsung 32" curvo 240Hz, experiência imersiva.',
        price: 3499.99,
        imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500',
        categoryId: categoryMap['Monitores'],
        stock: 10,
        isActive: true
      },

      // Cadeiras
      {
        name: 'DXRacer Formula Series',
        description: 'Cadeira gamer DXRacer, ergonômica, suporte lombar.',
        price: 1799.99,
        imageUrl: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=500',
        categoryId: categoryMap['Cadeiras'],
        stock: 20,
        isActive: true
      },
      {
        name: 'Secretlab Titan Evo',
        description: 'Cadeira Secretlab Titan Evo 2024, máximo conforto.',
        price: 2999.99,
        imageUrl: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=500',
        categoryId: categoryMap['Cadeiras'],
        stock: 15,
        isActive: true
      },
      {
        name: 'ThunderX3 TC3',
        description: 'Cadeira gamer ThunderX3 TC3, ótimo custo-benefício.',
        price: 1199.99,
        imageUrl: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=500',
        categoryId: categoryMap['Cadeiras'],
        stock: 25,
        isActive: true
      }
    ];

    // Inserir produtos
    let added = 0;
    for (const productData of newProducts) {
      if (!productData.categoryId) {
        console.log(`⚠️  Categoria não encontrada para: ${productData.name}`);
        continue;
      }

      const existing = await Product.findOne({ name: productData.name });
      if (existing) {
        console.log(`Produto já existe: ${productData.name}`);
        continue;
      }

      await Product.create(productData);
      console.log(`✅ Adicionado: ${productData.name}`);
      added++;
    }

    console.log(`\n✅ Processo concluído! ${added} produtos adicionados.`);
    
    // Resumo por categoria
    console.log('\n📊 Resumo de produtos por categoria:');
    for (const [catName, catId] of Object.entries(categoryMap)) {
      const count = await Product.countDocuments({ categoryId: catId });
      console.log(`  ${catName}: ${count} produtos`);
    }

    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Erro:', err);
    process.exit(1);
  });
