// Importa o Mongoose para manipular o MongoDB
const mongoose = require('mongoose');

// Importa o modelo de Produto
const Product = require('../src/models/product');

// Carrega variáveis de ambiente (como MONGODB_URI)
require('dotenv').config();

// Conecta ao banco de dados (usa variável do .env ou fallback local)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sw_store', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Função que gera um slug limpo a partir do nome do produto
function generateSlug(name) {
  return name
    .toLowerCase()                         // deixa tudo minúsculo
    .normalize('NFD')                      // remove acentos
    .replace(/[\u0300-\u036f]/g, '')       // regex que remove acentos restantes
    .replace(/[^\w\s-]/g, '')              // remove caracteres especiais
    .replace(/\s+/g, '-')                  // troca espaços por hífen
    .replace(/-+/g, '-')                   // remove múltiplos hífens
    .trim();                               // remove espaços no início/fim
}

async function updateProductsWithSlugAndFeatured() {
  try {
    console.log('🔄 Atualizando produtos com slug e featured...\n');

    // Busca todos os produtos no banco
    const products = await Product.find();

    let updated = 0;       // contador de produtos atualizados
    const slugCounter = {}; // usado para evitar duplicações de slug

    // Lista de jogos que devem receber o campo featured = true
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

    // Percorre todos os produtos
    for (const product of products) {
      let needsUpdate = false; // marca se o produto precisa ser salvo

      // Criar slug caso não exista
      if (!product.slug) {
        let baseSlug = generateSlug(product.name);

        // Verifica se já existe slug igual e incrementa o contador
        if (slugCounter[baseSlug]) {
          slugCounter[baseSlug]++;
          product.slug = `${baseSlug}-${slugCounter[baseSlug]}`;
        } else {
          slugCounter[baseSlug] = 0;
          product.slug = baseSlug;
        }

        needsUpdate = true;
      } else {
        // Caso o slug já exista, extrai o "baseSlug" (sem número final)
        const baseSlug = product.slug.replace(/-\d+$/, '');

        // Inicializa contador se ainda não existir
        if (!slugCounter[baseSlug]) slugCounter[baseSlug] = 0;
      }

      // Adiciona "featured = true" se o produto estiver na lista
      if (featuredGames.includes(product.name) && !product.featured) {
        product.featured = true;
        needsUpdate = true;
      }

      // Se algo mudou, faz o salvamento
      if (needsUpdate) {
        try {
          await product.save();
          console.log(`✓ ${product.name} → slug: ${product.slug}, featured: ${product.featured}`);
          updated++;
        } catch (error) {
          // Trata erro de duplicidade de slug
          if (error.code === 11000) {
            product.slug = `${product.slug}-${Date.now()}`;
            await product.save();
            console.log(`✓ ${product.name} → slug: ${product.slug} (duplicado resolvido), featured: ${product.featured}`);
            updated++;
          } else {
            throw error; // Se for outro erro, lança normalmente
          }
        }
      }
    }

    // Finalização
    console.log(`\n✨ Atualização concluída!`);
    console.log(`   Produtos atualizados: ${updated}`);
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

// Executa o script
updateProductsWithSlugAndFeatured();
