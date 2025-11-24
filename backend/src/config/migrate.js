const { sequelize } = require('./database');

// Import all models to ensure relationships are established
require('../models');

const migrate = async () => {
  try {
    console.log('🔄 Starting database migration...');
    console.log('⚠️  WARNING: This will drop all existing tables and recreate them!');
    
    await sequelize.authenticate();
    console.log('✓ Database connection established');
    
    await sequelize.sync({ force: true });
    console.log('✓ All tables created successfully');
    
    console.log('\n📋 Tables created:');
    const tables = await sequelize.getQueryInterface().showAllTables();
    tables.forEach(table => console.log(`  - ${table}`));
    
    console.log('\n✓ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
};

migrate();
