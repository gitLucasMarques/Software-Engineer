const { connectDB, mongoose } = require('./database');

// Import all models to ensure they are registered
require('../models');

/**
 * Script de migração/setup para MongoDB.
 * MongoDB não precisa de migrações como SQL, mas este script pode ser usado
 * para limpar o banco e criar collections iniciais se necessário.
 */
const migrate = async () => {
  try {
    console.log('🔄 Starting database setup...');
    console.log('⚠️  WARNING: This will drop all collections and recreate them!');
    
    await connectDB();
    console.log('✓ Database connection established');
    
    // Drop all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    if (collections.length > 0) {
      console.log('\n🗑️  Dropping existing collections...');
      for (const collection of collections) {
        await mongoose.connection.db.dropCollection(collection.name);
        console.log(`  - Dropped: ${collection.name}`);
      }
    }
    
    console.log('\n📋 Database is ready for seeding');
    console.log('✓ Setup completed successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Setup failed:', error);
    process.exit(1);
  }
};

migrate();
