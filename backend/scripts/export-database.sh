#!/bin/bash

# Script para exportar todo o banco de dados MongoDB

set -e

echo "════════════════════════════════════════════════════════════════"
echo "   📦 EXPORTAÇÃO DO BANCO DE DADOS"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se mongodump está instalado
if ! command -v mongodump &> /dev/null; then
    echo -e "${RED}✗${NC} mongodump não encontrado!"
    echo "Instalando MongoDB Database Tools..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        wget https://fastdl.mongodb.org/tools/db/mongodb-database-tools-ubuntu2004-x86_64-100.9.0.deb
        sudo dpkg -i mongodb-database-tools-ubuntu2004-x86_64-100.9.0.deb
        rm mongodb-database-tools-ubuntu2004-x86_64-100.9.0.deb
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install mongodb-database-tools
    else
        echo "Instale manualmente: https://www.mongodb.com/try/download/database-tools"
        exit 1
    fi
fi

# Nome do banco de dados
DB_NAME="game_ecommerce"

# Verificar se .env existe e extrair MONGODB_URI
if [ -f ".env" ]; then
    MONGO_URI=$(grep MONGODB_URI .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
    if [ ! -z "$MONGO_URI" ]; then
        DB_NAME=$(echo $MONGO_URI | sed 's/.*\///' | cut -d '?' -f1)
    fi
fi

echo "🗄️  Banco de dados: $DB_NAME"
echo ""

# Diretório de backup
BACKUP_DIR="database-backup"

# Remover backup antigo se existir
if [ -d "$BACKUP_DIR" ]; then
    echo "🗑️  Removendo backup anterior..."
    rm -rf "$BACKUP_DIR"
fi

# Criar diretório de backup
mkdir -p "$BACKUP_DIR"

echo "📤 Exportando banco de dados..."
echo ""

# Exportar todas as coleções usando mongodump
mongodump \
    --db=$DB_NAME \
    --out="$BACKUP_DIR" \
    2>&1 | grep -v "writing"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Exportação concluída com sucesso!${NC}"
    echo ""
    echo "📁 Backup salvo em: backend/$BACKUP_DIR/"
    echo ""
    
    # Listar coleções exportadas
    echo "📊 Coleções exportadas:"
    if [ -d "$BACKUP_DIR/$DB_NAME" ]; then
        ls "$BACKUP_DIR/$DB_NAME/" | grep ".bson$" | sed 's/.bson//' | awk '{print "   → " $0}'
    fi
    
    echo ""
    echo "💡 Dica: Commite esta pasta no Git para compartilhar com a equipe"
    echo ""
else
    echo ""
    echo -e "${RED}✗ Erro ao exportar banco de dados${NC}"
    exit 1
fi
