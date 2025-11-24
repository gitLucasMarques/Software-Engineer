// Script para adicionar gêneros aos produtos

const mongoose = require('mongoose');
const Product = require('../src/models/product');
const Category = require('../src/models/category');
require('dotenv').config();

// Mapeamento de gêneros por tipo de produto
const genreMapping = {
  // Jogos de Ação
  'Call of Duty': 'FPS',
  'Battlefield': 'FPS',
  'Counter-Strike': 'FPS',
  'Doom': 'FPS',
  'Halo': 'FPS',
  'Gears': 'Ação/TPS',
  'God of War': 'Ação/Aventura',
  'Spider-Man': 'Ação/Aventura',
  'Horizon': 'Ação/RPG',
  'Ghost of Tsushima': 'Ação/Aventura',
  'Uncharted': 'Ação/Aventura',
  'Returnal': 'Roguelike/Ação',
  'Ratchet': 'Ação/Plataforma',
  'Assassins Creed': 'Ação/Aventura',
  'Sekiro': 'Ação/Souls-like',
  'Callisto Protocol': 'Horror/Sobrevivência',
  'Outlast': 'Horror/Sobrevivência',
  'Alan Wake': 'Horror/Psicológico',
  'Dead Cells': 'Roguelike/Ação',
  
  // RPG
  'Witcher': 'RPG',
  'Skyrim': 'RPG',
  'Elden Ring': 'RPG/Souls-like',
  'Dark Souls': 'RPG/Souls-like',
  'Final Fantasy': 'RPG/JRPG',
  'Dragon Age': 'RPG',
  'Mass Effect': 'RPG/Ação',
  'Cyberpunk': 'RPG',
  'Diablo': 'RPG/Hack and Slash',
  'Fallout': 'RPG',
  'Persona': 'RPG/JRPG',
  'Starfield': 'RPG/Espacial',
  
  // Estratégia
  'Civilization': 'Estratégia',
  'Age of Empires': 'RTS',
  'StarCraft': 'RTS',
  'Total War': 'Estratégia',
  'XCOM': 'Estratégia Tática',
  
  // Simulação
  'Sims': 'Simulação',
  'Cities: Skylines': 'Simulação',
  'Euro Truck': 'Simulação',
  'Flight Simulator': 'Simulação',
  'Farming Simulator': 'Simulação',
  'Planet Zoo': 'Simulação/Gestão',
  
  // Esportes
  'FIFA': 'Esporte/Futebol',
  'NBA': 'Esporte/Basquete',
  'Forza': 'Corrida',
  'Gran Turismo': 'Corrida/Simulação',
  'F1': 'Corrida',
  'Madden': 'Esporte/Futebol Americano',
  
  // Aventura
  'Zelda': 'Aventura/Ação',
  'Mario': 'Plataforma/Aventura',
  'Pokémon': 'RPG/Aventura',
  'Animal Crossing': 'Simulação/Social',
  'Minecraft': 'Sandbox/Sobrevivência',
  'Terraria': 'Sandbox/Aventura',
  
  // Multiplayer/Battle Royale
  'Fortnite': 'Battle Royale',
  'Apex Legends': 'Battle Royale',
  'PUBG': 'Battle Royale',
  'Valorant': 'FPS Tático',
  'Rainbow Six': 'FPS Tático',
  'Overwatch': 'FPS/Hero Shooter',
  'World of Warcraft': 'MMORPG',
  
  // MOBA
  'League of Legends': 'MOBA',
  'Dota': 'MOBA',
  
  // Indie
  'Hollow Knight': 'Metroidvania',
  'Celeste': 'Plataforma',
  'Hades': 'Roguelike',
  'Stardew Valley': 'Simulação/Fazenda',
  'Undertale': 'RPG/Indie',
  'Cuphead': 'Plataforma/Run and Gun',
  
  // Horror
  'Resident Evil': 'Horror/Sobrevivência',
  'Silent Hill': 'Horror/Psicológico',
  'Dead Space': 'Horror/Sci-fi',
  
  // Nintendo
  'Splatoon': 'Shooter/Multiplayer',
  'Metroid': 'Metroidvania',
  'Kirby': 'Plataforma',
  'Donkey Kong': 'Plataforma'
};

// Gêneros para hardware/componentes por nome
const hardwareGenres = {
  'Placa de Vídeo': 'Hardware/GPU',
  'GeForce': 'Hardware/GPU',
  'Radeon': 'Hardware/GPU',
  'RTX': 'Hardware/GPU',
  'GTX': 'Hardware/GPU',
  'RX': 'Hardware/GPU',
  
  'Processador': 'Hardware/CPU',
  'Intel Core': 'Hardware/CPU',
  'AMD Ryzen': 'Hardware/CPU',
  'i5': 'Hardware/CPU',
  'i7': 'Hardware/CPU',
  'i9': 'Hardware/CPU',
  
  'Memória RAM': 'Hardware/RAM',
  'DDR4': 'Hardware/RAM',
  'DDR5': 'Hardware/RAM',
  
  'SSD': 'Hardware/Armazenamento',
  'HD': 'Hardware/Armazenamento',
  'NVMe': 'Hardware/Armazenamento',
  
  'Placa-Mãe': 'Hardware/Motherboard',
  'Motherboard': 'Hardware/Motherboard',
  'ASUS': 'Hardware/Motherboard',
  'MSI': 'Hardware/Motherboard',
  
  'Fonte': 'Hardware/PSU',
  'Power Supply': 'Hardware/PSU',
  'Corsair RM': 'Hardware/PSU',
  'Thermaltake': 'Hardware/PSU',
  
  'Gabinete': 'Hardware/Case',
  'Case': 'Hardware/Case',
  'Fractal Design': 'Hardware/Case',
  
  'Cooler': 'Hardware/Cooling',
  'Water Cooler': 'Hardware/Cooling',
  
  'Teclado': 'Periférico/Teclado',
  'Keyboard': 'Periférico/Teclado',
  'Mecânico': 'Periférico/Teclado',
  'Corsair K': 'Periférico/Teclado',
  'Logitech G Pro': 'Periférico/Teclado',
  'HyperX Alloy': 'Periférico/Teclado',
  
  'Mouse': 'Periférico/Mouse',
  'Razer Viper': 'Periférico/Mouse',
  'SteelSeries Rival': 'Periférico/Mouse',
  'Corsair Dark Core': 'Periférico/Mouse',
  
  'Headset': 'Periférico/Áudio',
  'Fone': 'Periférico/Áudio',
  'SteelSeries Arctis': 'Periférico/Áudio',
  'Razer BlackShark': 'Periférico/Áudio',
  'Corsair Void': 'Periférico/Áudio',
  
  'Monitor': 'Periférico/Display',
  'UltraGear': 'Periférico/Display',
  'ROG Swift': 'Periférico/Display',
  'Odyssey': 'Periférico/Display',
  
  'Webcam': 'Periférico/Câmera',
  
  'Cadeira': 'Periférico/Mobília',
  'DXRacer': 'Periférico/Mobília',
  'Secretlab': 'Periférico/Mobília',
  'ThunderX3': 'Periférico/Mobília',
  
  'Controle': 'Acessório/Controle',
  'DualSense': 'Acessório/Controle',
  'Xbox Controller': 'Acessório/Controle',
  'Joy-Con': 'Acessório/Controle',
  'Pro Controller': 'Acessório/Controle',
  
  'PlayStation 5': 'Console/PlayStation',
  'PS5': 'Console/PlayStation',
  'Xbox Series': 'Console/Xbox',
  'Nintendo Switch': 'Console/Nintendo'
};

function determineGenre(productName) {
  // Verificar mapeamento de jogos
  for (const [keyword, genre] of Object.entries(genreMapping)) {
    if (productName.includes(keyword)) {
      return genre;
    }
  }
  
  // Verificar mapeamento de hardware
  for (const [keyword, genre] of Object.entries(hardwareGenres)) {
    if (productName.includes(keyword)) {
      return genre;
    }
  }
  
  // Gêneros padrão por palavras-chave adicionais
  if (productName.match(/FPS|Shooter|Tiro/i)) return 'FPS';
  if (productName.match(/RPG|Role/i)) return 'RPG';
  if (productName.match(/Strategy|Estratégia/i)) return 'Estratégia';
  if (productName.match(/Racing|Corrida/i)) return 'Corrida';
  if (productName.match(/Sports|Esporte/i)) return 'Esporte';
  if (productName.match(/Puzzle|Quebra/i)) return 'Puzzle';
  if (productName.match(/Platform|Plataforma/i)) return 'Plataforma';
  if (productName.match(/Adventure|Aventura/i)) return 'Aventura';
  if (productName.match(/Simulation|Simulação/i)) return 'Simulação';
  if (productName.match(/Horror|Terror/i)) return 'Horror';
  
  return null;
}

async function addGenresToProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sw-ecommerce');
    console.log('✅ Conectado ao MongoDB');

    // Buscar todos os produtos sem gênero
    const productsWithoutGenre = await Product.find({ 
      $or: [
        { genre: { $exists: false } },
        { genre: null },
        { genre: '' }
      ]
    });

    console.log(`\n📦 Encontrados ${productsWithoutGenre.length} produtos sem gênero\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of productsWithoutGenre) {
      const genre = determineGenre(product.name);
      
      if (genre) {
        product.genre = genre;
        await product.save();
        console.log(`✅ ${product.name} → ${genre}`);
        updatedCount++;
      } else {
        console.log(`⏭️  ${product.name} → Gênero não determinado`);
        skippedCount++;
      }
    }

    console.log('\n📊 Resumo:');
    console.log(`✅ Produtos atualizados: ${updatedCount}`);
    console.log(`⏭️  Produtos pulados: ${skippedCount}`);
    console.log(`📦 Total de produtos: ${productsWithoutGenre.length}`);

    // Mostrar estatísticas de gêneros
    const genreStats = await Product.aggregate([
      { $match: { genre: { $exists: true, $ne: null, $ne: '' } } },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n🎮 Estatísticas de Gêneros:');
    genreStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} produto(s)`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Desconectado do MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

addGenresToProducts();
