const mongoose = require('mongoose');
const Product = require('../src/models/product');
const Category = require('../src/models/category');
require('dotenv').config();

// Conectar ao banco
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sw_store', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// 50 jogos para adicionar
const games = [
  // Ação/Aventura
  { name: 'The Witcher 3: Wild Hunt', description: 'RPG de ação em mundo aberto com história épica.', price: 99.90, platform: 'PC', stock: 150, image: 'https://via.placeholder.com/300x400?text=Witcher+3', categoryName: 'Ação e Aventura' },
  { name: 'Red Dead Redemption 2', description: 'Aventura no velho oeste com gráficos impressionantes.', price: 179.90, platform: 'PC', stock: 120, image: 'https://via.placeholder.com/300x400?text=RDR2', categoryName: 'Ação e Aventura' },
  { name: 'God of War', description: 'Aventura épica na mitologia nórdica.', price: 149.90, platform: 'PlayStation 5', stock: 100, image: 'https://via.placeholder.com/300x400?text=God+of+War', categoryName: 'Ação e Aventura' },
  { name: 'Horizon Zero Dawn', description: 'Mundo pós-apocalíptico dominado por máquinas.', price: 119.90, platform: 'PC', stock: 90, image: 'https://via.placeholder.com/300x400?text=Horizon', categoryName: 'Ação e Aventura' },
  { name: 'Assassins Creed Valhalla', description: 'Jornada viking pela Inglaterra medieval.', price: 159.90, platform: 'PC', stock: 80, image: 'https://via.placeholder.com/300x400?text=AC+Valhalla', categoryName: 'Ação e Aventura' },
  { name: 'Spider-Man Miles Morales', description: 'Nova aventura do Homem-Aranha em Nova York.', price: 199.90, platform: 'PlayStation 5', stock: 70, image: 'https://via.placeholder.com/300x400?text=Miles+Morales', categoryName: 'Ação e Aventura' },
  { name: 'Ghost of Tsushima', description: 'Samurai em mundo aberto no Japão feudal.', price: 169.90, platform: 'PlayStation 5', stock: 85, image: 'https://via.placeholder.com/300x400?text=Ghost+Tsushima', categoryName: 'Ação e Aventura' },
  { name: 'Sekiro: Shadows Die Twice', description: 'Ação desafiadora no Japão Sengoku.', price: 129.90, platform: 'PC', stock: 95, image: 'https://via.placeholder.com/300x400?text=Sekiro', categoryName: 'Ação e Aventura' },
  
  // FPS/Shooter
  { name: 'Call of Duty: Modern Warfare II', description: 'FPS com campanha cinematográfica e multiplayer.', price: 249.90, platform: 'PC', stock: 200, image: 'https://via.placeholder.com/300x400?text=COD+MW2', categoryName: 'FPS e Shooter' },
  { name: 'Battlefield 2042', description: 'Guerra futurista em larga escala.', price: 189.90, platform: 'PC', stock: 110, image: 'https://via.placeholder.com/300x400?text=BF2042', categoryName: 'FPS e Shooter' },
  { name: 'Counter-Strike 2', description: 'O clássico FPS competitivo remasterizado.', price: 69.90, platform: 'PC', stock: 300, image: 'https://via.placeholder.com/300x400?text=CS2', categoryName: 'FPS e Shooter' },
  { name: 'Valorant - Pack Inicial', description: 'FPS tático com agentes únicos.', price: 79.90, platform: 'PC', stock: 250, image: 'https://via.placeholder.com/300x400?text=Valorant', categoryName: 'FPS e Shooter' },
  { name: 'Halo Infinite', description: 'O retorno do Master Chief.', price: 159.90, platform: 'Xbox Series X', stock: 90, image: 'https://via.placeholder.com/300x400?text=Halo+Infinite', categoryName: 'FPS e Shooter' },
  { name: 'Doom Eternal', description: 'FPS frenético contra demônios.', price: 99.90, platform: 'PC', stock: 140, image: 'https://via.placeholder.com/300x400?text=Doom+Eternal', categoryName: 'FPS e Shooter' },
  { name: 'Rainbow Six Siege', description: 'FPS tático em ambientes destrutíveis.', price: 69.90, platform: 'PC', stock: 180, image: 'https://via.placeholder.com/300x400?text=R6+Siege', categoryName: 'FPS e Shooter' },
  
  // RPG
  { name: 'Elden Ring', description: 'RPG de ação em mundo aberto dos criadores de Dark Souls.', price: 199.90, platform: 'PC', stock: 150, image: 'https://via.placeholder.com/300x400?text=Elden+Ring', categoryName: 'RPG' },
  { name: 'Cyberpunk 2077', description: 'RPG futurista em Night City.', price: 139.90, platform: 'PC', stock: 130, image: 'https://via.placeholder.com/300x400?text=Cyberpunk', categoryName: 'RPG' },
  { name: 'Final Fantasy XVI', description: 'Novo capítulo da lendária franquia.', price: 249.90, platform: 'PlayStation 5', stock: 80, image: 'https://via.placeholder.com/300x400?text=FF16', categoryName: 'RPG' },
  { name: 'Baldurs Gate 3', description: 'RPG tático baseado em D&D.', price: 179.90, platform: 'PC', stock: 120, image: 'https://via.placeholder.com/300x400?text=BG3', categoryName: 'RPG' },
  { name: 'Starfield', description: 'RPG espacial de mundo aberto.', price: 229.90, platform: 'PC', stock: 110, image: 'https://via.placeholder.com/300x400?text=Starfield', categoryName: 'RPG' },
  { name: 'Dragon Age: Dreadwolf', description: 'Novo RPG da aclamada franquia.', price: 199.90, platform: 'PC', stock: 100, image: 'https://via.placeholder.com/300x400?text=Dragon+Age', categoryName: 'RPG' },
  
  // Esportes
  { name: 'EA Sports FC 24', description: 'O melhor jogo de futebol do ano.', price: 249.90, platform: 'PC', stock: 200, image: 'https://via.placeholder.com/300x400?text=FC24', categoryName: 'Esportes' },
  { name: 'NBA 2K24', description: 'Simulação de basquete ultra realista.', price: 219.90, platform: 'PC', stock: 150, image: 'https://via.placeholder.com/300x400?text=NBA2K24', categoryName: 'Esportes' },
  { name: 'F1 23', description: 'Corridas de Fórmula 1 oficiais.', price: 189.90, platform: 'PC', stock: 100, image: 'https://via.placeholder.com/300x400?text=F1+23', categoryName: 'Esportes' },
  { name: 'Gran Turismo 7', description: 'Simulador de corrida definitivo.', price: 229.90, platform: 'PlayStation 5', stock: 90, image: 'https://via.placeholder.com/300x400?text=GT7', categoryName: 'Esportes' },
  { name: 'Madden NFL 24', description: 'Futebol americano profissional.', price: 209.90, platform: 'Xbox Series X', stock: 80, image: 'https://via.placeholder.com/300x400?text=Madden24', categoryName: 'Esportes' },
  
  // Estratégia
  { name: 'Civilization VI', description: 'Construa um império através dos séculos.', price: 89.90, platform: 'PC', stock: 160, image: 'https://via.placeholder.com/300x400?text=Civ6', categoryName: 'Estratégia' },
  { name: 'Total War: Warhammer III', description: 'Estratégia épica no universo Warhammer.', price: 149.90, platform: 'PC', stock: 110, image: 'https://via.placeholder.com/300x400?text=TW+Warhammer', categoryName: 'Estratégia' },
  { name: 'XCOM 2', description: 'Tática e estratégia contra invasão alienígena.', price: 79.90, platform: 'PC', stock: 130, image: 'https://via.placeholder.com/300x400?text=XCOM2', categoryName: 'Estratégia' },
  { name: 'Age of Empires IV', description: 'Clássico RTS revitalizado.', price: 129.90, platform: 'PC', stock: 140, image: 'https://via.placeholder.com/300x400?text=AOE4', categoryName: 'Estratégia' },
  { name: 'StarCraft II', description: 'RTS competitivo em mundo sci-fi.', price: 69.90, platform: 'PC', stock: 170, image: 'https://via.placeholder.com/300x400?text=SC2', categoryName: 'Estratégia' },
  
  // Terror
  { name: 'Resident Evil 4 Remake', description: 'Remake do clássico survival horror.', price: 189.90, platform: 'PC', stock: 120, image: 'https://via.placeholder.com/300x400?text=RE4', categoryName: 'Terror' },
  { name: 'Dead Space Remake', description: 'Terror espacial remasterizado.', price: 179.90, platform: 'PC', stock: 100, image: 'https://via.placeholder.com/300x400?text=Dead+Space', categoryName: 'Terror' },
  { name: 'The Callisto Protocol', description: 'Horror de sobrevivência em colônia espacial.', price: 159.90, platform: 'PC', stock: 90, image: 'https://via.placeholder.com/300x400?text=Callisto', categoryName: 'Terror' },
  { name: 'Outlast Trials', description: 'Terror cooperativo psicológico.', price: 89.90, platform: 'PC', stock: 140, image: 'https://via.placeholder.com/300x400?text=Outlast', categoryName: 'Terror' },
  { name: 'Alan Wake II', description: 'Thriller psicológico sobrenatural.', price: 169.90, platform: 'PC', stock: 110, image: 'https://via.placeholder.com/300x400?text=Alan+Wake', categoryName: 'Terror' },
  
  // Indie
  { name: 'Hades', description: 'Roguelike de ação na mitologia grega.', price: 49.90, platform: 'PC', stock: 200, image: 'https://via.placeholder.com/300x400?text=Hades', categoryName: 'Indie' },
  { name: 'Hollow Knight', description: 'Metroidvania desafiador e atmosférico.', price: 39.90, platform: 'PC', stock: 220, image: 'https://via.placeholder.com/300x400?text=Hollow+Knight', categoryName: 'Indie' },
  { name: 'Celeste', description: 'Plataforma desafiador com história tocante.', price: 34.90, platform: 'PC', stock: 250, image: 'https://via.placeholder.com/300x400?text=Celeste', categoryName: 'Indie' },
  { name: 'Stardew Valley', description: 'Simulador de fazenda relaxante.', price: 29.90, platform: 'PC', stock: 300, image: 'https://via.placeholder.com/300x400?text=Stardew', categoryName: 'Indie' },
  { name: 'Dead Cells', description: 'Roguelite de ação frenético.', price: 44.90, platform: 'PC', stock: 180, image: 'https://via.placeholder.com/300x400?text=Dead+Cells', categoryName: 'Indie' },
  
  // Multiplayer/Online
  { name: 'Apex Legends - Pack Premium', description: 'Battle royale com heróis únicos.', price: 99.90, platform: 'PC', stock: 250, image: 'https://via.placeholder.com/300x400?text=Apex', categoryName: 'Multiplayer' },
  { name: 'Fortnite - Pack Lendário', description: 'Battle royale com construção.', price: 89.90, platform: 'PC', stock: 280, image: 'https://via.placeholder.com/300x400?text=Fortnite', categoryName: 'Multiplayer' },
  { name: 'Overwatch 2 - Pack Inicial', description: 'FPS de heróis em equipe.', price: 79.90, platform: 'PC', stock: 200, image: 'https://via.placeholder.com/300x400?text=Overwatch', categoryName: 'Multiplayer' },
  { name: 'League of Legends - Pack RP', description: 'MOBA competitivo.', price: 69.90, platform: 'PC', stock: 300, image: 'https://via.placeholder.com/300x400?text=LoL', categoryName: 'Multiplayer' },
  { name: 'World of Warcraft: Dragonflight', description: 'MMORPG épico.', price: 159.90, platform: 'PC', stock: 150, image: 'https://via.placeholder.com/300x400?text=WoW', categoryName: 'Multiplayer' },
  
  // Simulação
  { name: 'Microsoft Flight Simulator', description: 'Simulador de voo ultra realista.', price: 179.90, platform: 'PC', stock: 100, image: 'https://via.placeholder.com/300x400?text=Flight+Sim', categoryName: 'Simulação' },
  { name: 'Euro Truck Simulator 2', description: 'Simulador de caminhão pela Europa.', price: 59.90, platform: 'PC', stock: 180, image: 'https://via.placeholder.com/300x400?text=ETS2', categoryName: 'Simulação' },
  { name: 'The Sims 4', description: 'Simulador de vida definitivo.', price: 99.90, platform: 'PC', stock: 220, image: 'https://via.placeholder.com/300x400?text=Sims4', categoryName: 'Simulação' },
  { name: 'Cities: Skylines', description: 'Construa a cidade dos seus sonhos.', price: 69.90, platform: 'PC', stock: 160, image: 'https://via.placeholder.com/300x400?text=Cities', categoryName: 'Simulação' },
  { name: 'Planet Zoo', description: 'Crie e gerencie seu próprio zoológico.', price: 89.90, platform: 'PC', stock: 130, image: 'https://via.placeholder.com/300x400?text=Planet+Zoo', categoryName: 'Simulação' }
];

async function seedGames() {
  try {
    console.log('🎮 Iniciando seed de jogos...\n');

    // Buscar ou criar categorias
    const categoryMap = {};
    const uniqueCategories = [...new Set(games.map(g => g.categoryName))];
    
    for (const catName of uniqueCategories) {
      let category = await Category.findOne({ name: catName });
      if (!category) {
        category = await Category.create({
          name: catName,
          description: `Categoria ${catName}`,
          slug: catName.toLowerCase().replace(/\s+/g, '-').replace(/[àáâãä]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i'),
          isActive: true
        });
        console.log(`✅ Categoria criada: ${catName}`);
      }
      categoryMap[catName] = category._id;
    }

    console.log('\n📦 Adicionando jogos...\n');

    let added = 0;
    let skipped = 0;

    for (const game of games) {
      const exists = await Product.findOne({ name: game.name });
      
      if (!exists) {
        await Product.create({
          ...game,
          category: categoryMap[game.categoryName],
          slug: game.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
          isActive: true,
          featured: Math.random() > 0.7 // 30% chance de ser destaque
        });
        console.log(`✅ Adicionado: ${game.name}`);
        added++;
      } else {
        console.log(`⏭️  Já existe: ${game.name}`);
        skipped++;
      }
    }

    console.log(`\n✨ Seed concluído!`);
    console.log(`   Adicionados: ${added} jogos`);
    console.log(`   Ignorados: ${skipped} jogos (já existiam)`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    process.exit(1);
  }
}

seedGames();
