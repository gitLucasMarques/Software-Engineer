const express = require('express');
const sequelize = require('./config/database');
require('dotenv').config();

// Criar aplicação Express
const app = express();

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota básica para verificar se a API está funcionando
app.get('/', (req, res) => {
  res.send('API do E-commerce de Jogos funcionando!');
});

// Importar e usar rotas

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erro no servidor', error: process.env.NODE_ENV === 'development' ? err.message : {} });
});

// Definir porta
const PORT = process.env.PORT || 5000;

// Função para iniciar o servidor
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    
    await sequelize.sync({ force: false });
    console.log('📊 Modelos sincronizados com o banco de dados');
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
    
    return server;
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Verificar se o arquivo está sendo executado diretamente ou importado
if (require.main === module) {
  startServer();
} else {
  // Exportar para testes
  module.exports = { app, startServer };
}