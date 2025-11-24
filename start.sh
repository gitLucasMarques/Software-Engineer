#!/bin/bash

echo "════════════════════════════════════════════════════════════════"
echo "   🚀 VOXEL - Iniciando Servidores"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função para matar processos ao sair
cleanup() {
  echo ""
  echo "🛑 Encerrando servidores..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  exit
}

trap cleanup EXIT INT TERM

# Verificar se MongoDB está rodando
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB não está rodando. Tentando iniciar..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo systemctl start mongod
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start mongodb-community
    fi
    sleep 2
fi

# Iniciar backend
echo "📦 Iniciando Backend (porta 5000)..."
cd backend
npm start &
BACKEND_PID=$!

# Aguardar backend iniciar
sleep 5

# Iniciar frontend  
echo "🎨 Iniciando Frontend (porta 3001)..."
cd ../frontend
PORT=3001 npm start &
FRONTEND_PID=$!

echo ""
echo "════════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}✅ Servidores iniciados com sucesso!${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo -e "  ${BLUE}Backend:${NC}  http://localhost:5000"
echo -e "  ${BLUE}Frontend:${NC} http://localhost:3001"
echo ""
echo "  Aguarde alguns segundos para o frontend compilar..."
echo "  Pressione Ctrl+C para encerrar ambos os servidores"
echo ""
echo "════════════════════════════════════════════════════════════════"

# Manter o script rodando
wait
