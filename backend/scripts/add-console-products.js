// Script para adicionar produtos de consoles ao banco de dados
// Este script funciona como um "seed", populando o banco de dados com produtos pré-definidos.
// Ele conecta ao MongoDB, verifica categorias existentes, evita duplicações e insere novos produtos.

const mongoose = require('mongoose');
const Product = require('../src/models/product');
const Category = require('../src/models/category');
require('dotenv').config();

// Lista de produtos que serão inseridos no banco.
// Cada item inclui informações como nome, descrição, preço, imagem, categoria, estoque e status.
const consoleProducts = [
  // Controles
  {
    name: 'Controle DualSense PlayStation 5',
    description: 'Controle sem fio DualSense para PlayStation 5. Recursos haptic feedback, gatilhos adaptativos e microfone integrado.',
    price: 449.90,
    imageUrl: 'https://gmedia.playstation.com/is/image/SIEPDC/dualsense-controller-white-accessory-front',
    category: 'Controles',
    stock: 50,
    isActive: true
  },
  {
    name: 'Controle DualSense Edge',
    description: 'Controle premium DualSense Edge com botões traseiros configuráveis, sticks intercambiáveis e perfis personalizáveis.',
    price: 1299.90,
    imageUrl: 'https://gmedia.playstation.com/is/image/SIEPDC/dualsense-edge-controller',
    category: 'Controles',
    stock: 25,
    isActive: true
  },
  {
    name: 'Controle Xbox Wireless',
    description: 'Controle sem fio para Xbox Series X|S e PC. Design ergonômico com botão Share e conexão Bluetooth.',
    price: 499.90,
    imageUrl: 'https://assets.xboxservices.com/assets/4c/8a/4c8a4f4a-9d68-4c8c-8f8f-8f8f8f8f8f8f.png',
    category: 'Controles',
    stock: 45,
    isActive: true
  },
  {
    name: 'Controle Xbox Elite Series 2',
    description: 'Controle premium Xbox Elite Series 2 com componentes intercambiáveis, paddles traseiros e bateria recarregável.',
    price: 1199.90,
    imageUrl: 'https://assets.xboxservices.com/assets/elite-controller-series-2',
    category: 'Controles',
    stock: 20,
    isActive: true
  },
  {
    name: 'Nintendo Switch Pro Controller',
    description: 'Controle Pro sem fio para Nintendo Switch. Design tradicional com HD rumble e bateria de longa duração.',
    price: 429.90,
    imageUrl: 'https://assets.nintendo.com/image/upload/pro-controller',
    category: 'Controles',
    stock: 40,
    isActive: true
  },
  {
    name: 'Joy-Con Par - Neon Red/Neon Blue',
    description: 'Par de controles Joy-Con para Nintendo Switch. Vermelho e azul neon com sensores de movimento.',
    price: 529.90,
    imageUrl: 'https://assets.nintendo.com/image/upload/joy-con-neon',
    category: 'Controles',
    stock: 35,
    isActive: true
  },

  // PlayStation
  {
    name: 'PlayStation 5 Standard',
    description: 'Console PlayStation 5 com leitor de disco. GPU Ray-tracing, SSD ultra-rápido, 825GB de armazenamento.',
    price: 4299.90,
    imageUrl: 'https://gmedia.playstation.com/is/image/SIEPDC/ps5-console-front',
    category: 'PlayStation',
    stock: 15,
    isActive: true
  },
  {
    name: 'PlayStation 5 Digital Edition',
    description: 'Console PlayStation 5 Digital Edition sem leitor de disco. Totalmente digital, mesmo desempenho do PS5 Standard.',
    price: 3799.90,
    imageUrl: 'https://gmedia.playstation.com/is/image/SIEPDC/ps5-digital-console',
    category: 'PlayStation',
    stock: 12,
    isActive: true
  },

  // Xbox
  {
    name: 'Xbox Series X',
    description: 'Console Xbox Series X. 12 Teraflops, ray-tracing, 4K nativo, 1TB SSD, retrocompatibilidade com 4 gerações.',
    price: 4499.90,
    imageUrl: 'https://assets.xboxservices.com/assets/xbox-series-x-console',
    category: 'Xbox',
    stock: 18,
    isActive: true
  },
  {
    name: 'Xbox Series S',
    description: 'Console Xbox Series S. Console digital compacto, 1440p, 512GB SSD, Game Pass, ótimo custo-benefício.',
    price: 2299.90,
    imageUrl: 'https://assets.xboxservices.com/assets/xbox-series-s-console',
    category: 'Xbox',
    stock: 25,
    isActive: true
  },

  // Nintendo
  {
    name: 'Nintendo Switch OLED',
    description: 'Nintendo Switch OLED. Tela OLED de 7 polegadas, 64GB, dock com LAN, áudio aprimorado.',
    price: 2499.90,
    imageUrl: 'https://assets.nintendo.com/image/upload/switch-oled-console',
    category: 'Nintendo',
    stock: 30,
    isActive: true
  },
  {
    name: 'Nintendo Switch Standard',
    description: 'Nintendo Switch Standard. Console híbrido, modo portátil e TV, 32GB, Joy-Con inclusos.',
    price: 1999.90,
    imageUrl: 'https://assets.nintendo.com/image/upload/switch-console-standard',
    category: 'Nintendo',
    stock: 35,
    isActive: true
  },
  {
    name: 'Nintendo Switch Lite',
    description: 'Nintendo Switch Lite. Versão portátil compacta, tela integrada de 5.5 polegadas, diversos controles.',
    price: 1499.90,
    imageUrl: 'https://assets.nintendo.com/image/upload/switch-lite-console',
    category: 'Nintendo',
    stock: 40,
    isActive: true
  },
];

async function addConsoleProducts() {
  try {
    // Conecta ao banco de dados MongoDB usando a URI definida no ambiente.
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sw-ecommerce');
    console.log('✅ Conectado ao MongoDB');

    // Busca no banco as categorias usadas pelos produtos.
    // Isso permite relacionar cada produto ao ID correto da sua categoria.
    const categories = await Category.find({
      name: { $in: ['Controles', 'PlayStation', 'Xbox', 'Nintendo'] }
    });

    // Cria um mapa que relaciona nomes de categorias aos seus respectivos IDs no banco.
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    console.log('\n📦 Categorias encontradas:', Object.keys(categoryMap));

    // Contadores para produtos adicionados e ignorados.
    let addedCount = 0;
    let skippedCount = 0;

    // Para cada produto da lista, verifica categoria, evita duplicatas e insere no banco.
    for (const productData of consoleProducts) {
      const categoryId = categoryMap[productData.category];
      
      // Se a categoria não existir no banco, o produto é ignorado.
      console.log(`❌ Categoria não encontrada: ${productData.category}`);
      if (!categoryId) {
        skippedCount++;
        continue;
      }

      // Verifica se já existe um produto com o mesmo nome (evita duplicação).
      const exists = await Product.findOne({ name: productData.name });
      
      if (exists) {
        console.log(`⏭️  Produto já existe: ${productData.name}`);
        skippedCount++;
        continue;
      }

      // Insere o produto no banco, vinculando ao ID da categoria.
      await Product.create({
        ...productData,
        categoryId: categoryId
      });

      console.log(`✅ Produto adicionado: ${productData.name}`);
      addedCount++;
    }

    // Exibe um resumo final da operação.
    console.log('\n📊 Resumo:');
    console.log(`✅ Produtos adicionados: ${addedCount}`);
    console.log(`⏭️  Produtos pulados: ${skippedCount}`);
    console.log(`📦 Total de produtos tentados: ${consoleProducts.length}`);

    // Mostra quantos produtos existem no banco após a operação.
    const totalProducts = await Product.countDocuments();
    console.log(`\n🎮 Total de produtos no banco de dados: ${totalProducts}`);

    // Finaliza a conexão com o banco.
    await mongoose.disconnect();
    console.log('\n✅ Desconectado do MongoDB');
    process.exit(0);

  } catch (error) {
    // Caso ocorra algum erro, ele é exibido e o processo termina com falha.
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

// Executa o script ao ser chamado.
addConsoleProducts();
