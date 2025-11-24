#!/bin/bash

# 🎮 Script de Instalação Completa - Voxel E-commerce
# Execute este script para configurar tudo automaticamente em uma nova máquina

set -e  # Para em caso de erro

echo "════════════════════════════════════════════════════════════════"
echo "   🚀 VOXEL - INSTALAÇÃO AUTOMÁTICA"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens
print_step() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Verificar se está no diretório correto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Execute este script na raiz do projeto (pasta SW)"
    exit 1
fi

# 1. Verificar Node.js
echo "1️⃣  Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js não está instalado!"
    echo ""
    echo "   Instalando Node.js..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        if ! command -v brew &> /dev/null; then
            print_error "Homebrew não instalado. Instale em: https://brew.sh/"
            exit 1
        fi
        brew install node
    else
        print_error "Instale Node.js manualmente: https://nodejs.org/"
        exit 1
    fi
fi
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
print_step "Node.js $NODE_VERSION instalado"
print_step "npm $NPM_VERSION instalado"

# 2. Verificar MongoDB
echo ""
echo "2️⃣  Verificando MongoDB..."
if ! command -v mongod &> /dev/null; then
    print_warning "MongoDB não encontrado. Instalando..."
    
    # Detectar sistema operacional
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "   Detectado: Linux"
        echo "   Instalando MongoDB..."
        
        # Importar chave pública
        wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add - || true
        
        # Adicionar repositório
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
        
        # Instalar
        sudo apt-get update
        sudo apt-get install -y mongodb-org
        
        # Iniciar serviço
        sudo systemctl start mongod
        sudo systemctl enable mongod
        
        print_step "MongoDB instalado e iniciado"
        
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "   Detectado: macOS"
        if ! command -v brew &> /dev/null; then
            print_error "Homebrew não instalado. Instale em: https://brew.sh/"
            exit 1
        fi
        brew tap mongodb/brew
        brew install mongodb-community@6.0
        brew services start mongodb/brew/mongodb-community@6.0
        print_step "MongoDB instalado e iniciado"
    else
        print_error "Sistema operacional não suportado automaticamente"
        echo "   Por favor, instale MongoDB manualmente:"
        echo "   https://www.mongodb.com/docs/manual/installation/"
        exit 1
    fi
else
    print_step "MongoDB já instalado"
    
    # Tentar iniciar MongoDB se não estiver rodando
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo systemctl start mongod 2>/dev/null || true
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start mongodb-community 2>/dev/null || true
    fi
fi

# 3. Verificar MongoDB Database Tools
echo ""
echo "3️⃣  Verificando MongoDB Database Tools..."
if ! command -v mongodump &> /dev/null; then
    print_warning "MongoDB Database Tools não encontrado. Instalando..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        wget https://fastdl.mongodb.org/tools/db/mongodb-database-tools-ubuntu2004-x86_64-100.9.0.deb
        sudo dpkg -i mongodb-database-tools-ubuntu2004-x86_64-100.9.0.deb
        rm mongodb-database-tools-ubuntu2004-x86_64-100.9.0.deb
        print_step "MongoDB Database Tools instalado"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install mongodb-database-tools
        print_step "MongoDB Database Tools instalado"
    fi
else
    print_step "MongoDB Database Tools já instalado"
fi

# 4. Instalar dependências do backend
echo ""
echo "4️⃣  Instalando dependências do backend..."
cd backend
npm install --silent
if [ $? -eq 0 ]; then
    print_step "Dependências do backend instaladas"
else
    print_error "Erro ao instalar dependências do backend"
    exit 1
fi

# 5. Instalar dependências do frontend
echo ""
echo "5️⃣  Instalando dependências do frontend..."
cd ../frontend
npm install --silent
if [ $? -eq 0 ]; then
    print_step "Dependências do frontend instaladas"
else
    print_error "Erro ao instalar dependências do frontend"
    exit 1
fi
cd ..

# 6. Configurar arquivos .env
echo ""
echo "6️⃣  Configurando arquivo .env..."
cd backend
if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
# Configurações do Servidor
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/game_ecommerce

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email (opcional - configure se quiser funcionalidade de email)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@voxel.com

# Mercado Pago (opcional - configure se quiser usar gateway real)
MERCADOPAGO_ACCESS_TOKEN=your-mercadopago-access-token

# PayPal (opcional)
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# PIX Key (para pagamentos PIX)
PIX_KEY=+5511999999999

# Encryption (para salvar cartões)
CARD_ENCRYPTION_KEY=mysecretkey12345mysecretkey12345
EOF
    print_step "Arquivo .env criado com valores padrão"
    print_warning "IMPORTANTE: Configure as variáveis sensíveis em backend/.env"
else
    print_step "Arquivo .env já existe"
fi
cd ..

# 7. Exportar banco de dados atual (se houver)
echo ""
echo "7️⃣  Verificando banco de dados..."
if command -v mongodump &> /dev/null; then
    if mongo game_ecommerce --eval "db.products.countDocuments()" --quiet 2>/dev/null | grep -q "[1-9]"; then
        echo "   Banco de dados com dados encontrado!"
        read -p "   Deseja exportar os dados atuais? (S/n): " -r
        echo ""
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            cd backend
            chmod +x scripts/export-database.sh
            ./scripts/export-database.sh
            cd ..
        fi
    else
        print_info "Banco de dados vazio ou não encontrado"
    fi
fi

# 8. Importar banco de dados (se houver backup)
echo ""
echo "8️⃣  Verificando backup do banco de dados..."
if [ -d "backend/database-backup" ]; then
    print_step "Backup encontrado em backend/database-backup/"
    read -p "   Deseja importar o banco de dados agora? (S/n): " -r
    echo ""
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        cd backend
        chmod +x scripts/import-database.sh
        ./scripts/import-database.sh
        cd ..
    else
        print_warning "Importação pulada. Execute depois: cd backend && ./scripts/import-database.sh"
    fi
else
    print_warning "Backup não encontrado. Popular banco com: cd backend && npm run seed"
fi

# 9. Tornar scripts executáveis
echo ""
echo "9️⃣  Configurando scripts executáveis..."
chmod +x backend/scripts/*.sh 2>/dev/null || true
print_step "Scripts configurados"

# 10. Criar script de execução principal
echo ""
echo "🔟 Criando script de inicialização..."

cat > start.sh << 'EOF'
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
EOF

chmod +x start.sh
print_step "Script start.sh criado"

# 11. Criar script para executar em modo desenvolvimento
cat > dev.sh << 'EOF'
#!/bin/bash

echo "🔧 Iniciando em modo DESENVOLVIMENTO..."
echo ""

# Abrir dois terminais (funciona no Linux com gnome-terminal ou xterm)
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal --tab --title="Backend" -- bash -c "cd backend && npm run dev; exec bash"
    gnome-terminal --tab --title="Frontend" -- bash -c "cd frontend && npm start; exec bash"
elif command -v xterm &> /dev/null; then
    xterm -e "cd backend && npm run dev" &
    xterm -e "cd frontend && npm start" &
else
    echo "Execute manualmente em terminais separados:"
    echo "  Terminal 1: cd backend && npm run dev"
    echo "  Terminal 2: cd frontend && npm start"
fi
EOF

chmod +x dev.sh
print_step "Script dev.sh criado"

# Sucesso!
echo ""
echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1️⃣  Configure as variáveis de ambiente (IMPORTANTE):"
echo "   → Edite: backend/.env"
echo "   → Configure: JWT_SECRET, EMAIL, MERCADOPAGO (se necessário)"
echo ""
echo "2️⃣  Inicie a aplicação:"
echo "   → ./start.sh"
echo ""
echo "   OU manualmente em terminais separados:"
echo "   → Terminal 1: cd backend && npm start"
echo "   → Terminal 2: cd frontend && npm start"
echo ""
echo "3️⃣  Acesse no navegador:"
echo "   → http://localhost:3001"
echo ""
echo "4️⃣  Comandos úteis:"
echo "   → ./start.sh              - Inicia backend e frontend"
echo "   → ./dev.sh                - Inicia em modo desenvolvimento"
echo "   → cd backend && npm run seed - Popular banco com dados de teste"
echo "   → cd backend && ./scripts/export-database.sh - Exportar banco"
echo "   → cd backend && ./scripts/import-database.sh - Importar banco"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
