const { connectDB } = require('../src/config/database');
const { User, Product, Category } = require('../src/models');

const categories = [
  { name: 'Ação', description: 'Jogos de ação e aventura', slug: 'acao' },
  { name: 'RPG', description: 'Role-playing games', slug: 'rpg' },
  { name: 'Estratégia', description: 'Jogos de estratégia', slug: 'estrategia' },
  { name: 'Esportes', description: 'Jogos esportivos', slug: 'esportes' },
  { name: 'Corrida', description: 'Jogos de corrida', slug: 'corrida' }
];

const products = [
  {
    name: 'Cyberpunk 2077',
    description: 'RPG de ação em mundo aberto ambientado em Night City, uma megalópole obcecada por poder, glamour e modificações corporais. Você joga como V, um mercenário fora da lei em busca de um implante único que é a chave para a imortalidade.',
    price: 199.90,
    stock: 100,
    imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202111/3013/cKZ4tKNFj9C00giTzYtH8PF1.png',
    platform: 'PC, PS5, Xbox',
    genre: 'RPG',
    releaseDate: new Date('2020-12-10'),
    discount: 25
  },
  {
    name: 'The Witcher 3: Wild Hunt',
    description: 'RPG de fantasia épico com história envolvente. Como Geralt de Rívia, caçador de monstros profissional, explore um vasto mundo aberto cheio de cidades mercantes, ilhas vikings, perigosos passes montanhosos e cavernas esquecidas.',
    price: 149.90,
    stock: 150,
    imageUrl: 'https://image.api.playstation.com/vulcan/img/rnd/202011/0714/vuF88yWPSnDfmFJOQ3KkHmF8.png',
    platform: 'PC, PS5, Xbox',
    genre: 'RPG',
    releaseDate: new Date('2015-05-19'),
    discount: 50
  },
  {
    name: 'God of War Ragnarök',
    description: 'Aventura épica de Kratos e Atreus pelos Nove Reinos. Junte-se a Kratos e Atreus em uma jornada mítica em busca de respostas e aliados antes da chegada do Ragnarök.',
    price: 299.90,
    stock: 80,
    imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/4xJ8XB3bi888QTLZYdl7Oi0s.png',
    platform: 'PS5',
    genre: 'Ação',
    releaseDate: new Date('2022-11-09'),
    discount: 10
  },
  {
    name: 'Elden Ring',
    description: 'RPG de ação souls-like em mundo aberto criado por FromSoftware e George R.R. Martin. Levante-se, Maculado, e seja guiado pela graça para portar o poder do Anel Prístino e se tornar um Lorde Prístino nas Terras Intermédias.',
    price: 249.90,
    stock: 120,
    imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202110/2000/aGhopp3MHppi7kooGE2Dtt8C.png',
    platform: 'PC, PS5, Xbox',
    genre: 'RPG',
    releaseDate: new Date('2022-02-25'),
    discount: 15
  },
  {
    name: 'EA SPORTS FC 24',
    description: 'O melhor jogo de futebol do mundo. Experimente a emoção do futebol mundial com mais de 19.000 jogadores autênticos, 700+ equipes e 30+ ligas em EA SPORTS FC 24.',
    price: 299.90,
    stock: 200,
    imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202305/2420/20ab60d76fc22b22dd3d6d3b11d8df45c2398c7b7cc9d17d.png',
    platform: 'PC, PS5, Xbox',
    genre: 'Esportes',
    releaseDate: new Date('2023-09-29'),
    discount: 20
  },
  {
    name: 'Gran Turismo 7',
    description: 'Simulador de corrida realista. Gran Turismo 7 reúne os melhores recursos do simulador de corridas. Seja um colecionador, um piloto competitivo, um ajustador fino, um designer de pinturas ou fotógrafo – liberte sua paixão.',
    price: 279.90,
    stock: 90,
    imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202110/2617/9gUnS02YkGn6w7ewMRc0fLDT.png',
    platform: 'PS5',
    genre: 'Corrida',
    releaseDate: new Date('2022-03-04'),
    discount: 5
  },
  {
    name: 'Baldurs Gate 3',
    description: 'RPG tático baseado em D&D. Reúna seu grupo e retorne aos Reinos Esquecidos em uma história de amizade e traição, sacrifício e sobrevivência, e a atração do poder absoluto.',
    price: 229.90,
    stock: 110,
    imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202302/2321/3098481c9164bb5f33069b37e49fba1a572ea3b89971ee2d.jpg',
    platform: 'PC, PS5',
    genre: 'RPG',
    releaseDate: new Date('2023-08-03'),
    discount: 0
  },
  {
    name: 'Starfield',
    description: 'RPG espacial de mundo aberto da Bethesda. Nesta próxima geração de RPG ambientado entre as estrelas, crie qualquer personagem que desejar e explore com liberdade sem precedentes enquanto embarca em uma jornada épica.',
    price: 279.90,
    stock: 85,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/pt/3/37/Starfield_capa.png',
    platform: 'PC, Xbox',
    genre: 'RPG',
    releaseDate: new Date('2023-09-06'),
    discount: 30
  },
  {
    name: 'Red Dead Redemption 2',
    description: 'Épico western em mundo aberto. América, 1899. O fim da era do velho oeste começou. Depois de um roubo dar errado na cidade de Blackwater, Arthur Morgan e a gangue Van der Linde são forçados a fugir.',
    price: 249.90,
    stock: 95,
    imageUrl: 'https://image.api.playstation.com/cdn/UP1004/CUSA03041_00/Hpl5MtwQgOVF9vJqlfui6SDB5Jl4oBSq.png',
    platform: 'PC, PS5, Xbox',
    genre: 'Ação',
    releaseDate: new Date('2018-10-26'),
    discount: 40
  },
  {
    name: 'Hogwarts Legacy',
    description: 'Viva a experiência mágica de Hogwarts. Hogwarts Legacy é um RPG de ação imersivo e de mundo aberto ambientado no mundo introduzido pela primeira vez nos livros de Harry Potter.',
    price: 299.90,
    stock: 130,
    imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202208/0921/dR9KJAKDW2izPbptHQr6SnAH.png',
    platform: 'PC, PS5, Xbox',
    genre: 'RPG',
    releaseDate: new Date('2023-02-10'),
    discount: 25
  },
  {
    name: 'Spider-Man 2',
    description: 'Os Spider-Men Peter Parker e Miles Morales enfrentam o teste definitivo de força por dentro e por fora enquanto lutam para salvar a cidade, uns aos outros e aqueles que amam.',
    price: 349.90,
    stock: 75,
    imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202306/1219/1c7b75d8ed9271516546560d219ad0b22ee0a263b4537bd8.png',
    platform: 'PS5',
    genre: 'Ação',
    releaseDate: new Date('2023-10-20'),
    discount: 15
  },
  {
    name: 'Assassins Creed Mirage',
    description: 'Experimente a história de Basim, um astuto ladrão de rua com visões assombrosas que busca respostas e justiça. Junte-se a uma antiga organização e venha a se tornar um dos Assassinos mais perigosos da história.',
    price: 249.90,
    stock: 88,
    imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202305/0919/bf155698c9f288a7e5e41f9cbf5be0fb7e9f41d0e2f1e10b.png',
    platform: 'PC, PS5, Xbox',
    genre: 'Ação',
    releaseDate: new Date('2023-10-05'),
    discount: 20
  }
];

const users = [
  {
    name: 'Admin User',
    email: 'admin@gameecommerce.com',
    password: 'admin123',
    role: 'admin',
    phone: '(11) 99999-9999',
    address: 'Rua Admin, 123 - São Paulo, SP'
  },
  {
    name: 'João Silva',
    email: 'joao@example.com',
    password: 'senha123',
    role: 'customer',
    phone: '(11) 98888-8888',
    address: 'Rua das Flores, 456 - São Paulo, SP'
  },
  {
    name: 'Maria Santos',
    email: 'maria@example.com',
    password: 'senha123',
    role: 'customer',
    phone: '(21) 97777-7777',
    address: 'Av. Principal, 789 - Rio de Janeiro, RJ'
  }
];

async function seed() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Conectar ao banco
    await connectDB();

    // Limpar dados existentes
    console.log('🗑️  Limpando dados existentes...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    console.log('✓ Dados limpos');

    // Criar categorias
    console.log('📁 Criando categorias...');
    const createdCategories = await Category.insertMany(categories);
    console.log('✓ Categorias criadas');

    // Criar usuários
    console.log('👥 Criando usuários...');
    await User.insertMany(users);
    console.log('✓ Usuários criados');

    // Associar produtos às categorias
    const categoryMap = {
      'Ação': createdCategories.find(c => c.slug === 'acao')?._id,
      'RPG': createdCategories.find(c => c.slug === 'rpg')?._id,
      'Esportes': createdCategories.find(c => c.slug === 'esportes')?._id,
      'Corrida': createdCategories.find(c => c.slug === 'corrida')?._id
    };

    // Criar produtos com categoryId
    console.log('🎮 Criando produtos...');
    const productsWithCategories = products.map(product => ({
      ...product,
      categoryId: categoryMap[product.genre]
    }));
    
    await Product.insertMany(productsWithCategories);
    console.log('✓ Produtos criados');

    console.log('\n✅ Seed concluído com sucesso!');
    console.log('\n📝 Credenciais de teste:');
    console.log('   Admin: admin@gameecommerce.com / admin123');
    console.log('   Cliente: joao@example.com / senha123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
}

// Executar seed se este arquivo for chamado diretamente
if (require.main === module) {
  seed();
}

module.exports = seed;
