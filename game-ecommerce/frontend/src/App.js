// Importa o módulo Express
const express = require('express');

// Cria uma instância do aplicativo
const app = express();

// Define a porta (Railway usa process.env.PORT)
const PORT = process.env.PORT || 3000;

// Middleware opcional para lidar com JSON
app.use(express.json());

// Rota principal
app.get('/', (req, res) => {
  res.send('🚀 Hello World com Express!');
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});