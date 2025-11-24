const mongoose = require('mongoose');
const Product = require('../src/models/product');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sw_store', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function updateProductsWithSlugAndFeatured() {
  try {
    console.log('🔄 Atualizando produtos com slug e featured...\n');

    const products = await Product.find();
    let updated = 0;
    const slugCounter = {};

    // Lista de produtos que devem ser featured (jogos populares)
    const featuredGames = [
      'Elden Ring',
      'Cyberpunk 2077',
      'The Witcher 3: Wild Hunt',
      'Red Dead Redemption 2',
      'God of War',
      'Baldurs Gate 3',
      'Starfield',
      'Call of Duty: Modern Warfare II'
    ];

    for (const product of products) {
      let needsUpdate = false;

      // Adicionar slug se não existir ou for duplicado
      if (!product.slug) {
        let baseSlug = generateSlug(product.name);
        
        // Verificar se o slug já existe
        if (slugCounter[baseSlug]) {
          slugCounter[baseSlug]++;
          product.slug = `${baseSlug}-${slugCounter[baseSlug]}`;
        } else {
          slugCounter[baseSlug] = 0;
          product.slug = baseSlug;
        }
        needsUpdate = true;
      } else {
        // Contar slugs existentes
        const baseSlug = product.slug.replace(/-\d+$/, '');
        if (!slugCounter[baseSlug]) slugCounter[baseSlug] = 0;
      }

      // Marcar como featured se estiver na lista
      if (featuredGames.includes(product.name) && !product.featured) {
        product.featured = true;
        needsUpdate = true;
      }

      if (needsUpdate) {
        try {
          await product.save();
          console.log(`✓ ${product.name} → slug: ${product.slug}, featured: ${product.featured}`);
          updated++;
        } catch (error) {
          if (error.code === 11000) {
            // Slug duplicado, adicionar sufixo
            product.slug = `${product.slug}-${Date.now()}`;
            await product.save();
            console.log(`✓ ${product.name} → slug: ${product.slug} (duplicado resolvido), featured: ${product.featured}`);
            updated++;
          } else {
            throw error;
          }
        }
      }
    }

    console.log(`\n✨ Atualização concluída!`);
    console.log(`   Produtos atualizados: ${updated}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

updateProductsWithSlugAndFeatured();
