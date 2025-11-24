const app = require('./app');
const { connectDB } = require('./src/config/database');
const environment = require('./src/config/environment');
const fs = require('fs');
const path = require('path');

const PORT = environment.PORT || 5000;

async function startServer() {
  try {
    // Garante que o diretório de uploads existe
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    await connectDB();
    
    const server = app.listen(PORT, () => {
      console.log('================================================');
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 Ambiente: ${environment.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log('================================================');
      
      // Verificar configuração do MercadoPago
      if (!environment.MERCADOPAGO_ACCESS_TOKEN || 
          environment.MERCADOPAGO_ACCESS_TOKEN === 'your-mercadopago-access-token') {
        console.log('');
        console.log('⚠️  ATENÇÃO: MercadoPago não configurado!');
        console.log('📝 Para configurar:');
        console.log('   1. Execute: ./configure-mercadopago.sh');
        console.log('   2. Ou leia: FIXING_MERCADOPAGO.md');
        console.log('   3. Obtenha token em: https://www.mercadopago.com.br/developers/panel');
        console.log('================================================');
      } else {
        console.log('✅ MercadoPago: Configurado');
        console.log('================================================');
      }
      console.log('');
    });

    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM recebido. Fechando servidor...');
      server.close(() => {
        console.log('💤 Servidor fechado');
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };