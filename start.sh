#!/bin/bash

echo "🚀 Iniciando E-commerce de Jogos e Hardware..."
echo ""

# Função para matar processos ao sair
cleanup() {
  echo ""
  echo "🛑 Encerrando servidores..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  exit
}

trap cleanup EXIT INT TERM

# Iniciar backend
echo "📦 Iniciando Backend (porta 5000)..."
cd backend
npm start &
BACKEND_PID=$!

# Aguardar backend iniciar
sleep 3

# Iniciar frontend
echo "🎨 Iniciando Frontend (porta 3001)..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  ✅ Servidores iniciados com sucesso!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "  📦 Backend:  http://localhost:5000"
echo "  🎨 Frontend: http://localhost:3001"
echo ""
echo "  📊 Banco de Dados: MongoDB (game_ecommerce)"
echo "  📦 Produtos: 118 (81 jogos + 37 hardware)"
echo ""
echo "  Pressione Ctrl+C para encerrar ambos os servidores"
echo ""
echo "════════════════════════════════════════════════════════════════"

# Manter o script rodando
wait
