#!/bin/bash

# Script para importar backup do banco de dados MongoDB

set -e

echo "════════════════════════════════════════════════════════════════"
echo "   📥 IMPORTAÇÃO DO BANCO DE DADOS"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se mongorestore está instalado
if ! command -v mongorestore &> /dev/null; then
    echo -e "${RED}✗${NC} mongorestore não encontrado!"
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

# Diretório de backup
BACKUP_DIR="database-backup"

# Verificar se o backup existe
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}✗${NC} Backup não encontrado!"
    echo "Execute primeiro: cd backend && ./scripts/export-database.sh"
    exit 1
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
echo "📁 Backup: $BACKUP_DIR/"
echo ""

# Avisar sobre dados existentes
echo -e "${YELLOW}⚠️  ATENÇÃO:${NC} Esta operação irá:"
echo "   → Remover dados existentes do banco $DB_NAME"
echo "   → Importar os dados do backup"
echo ""
read -p "Deseja continuar? (S/n): " -r
echo ""

if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo "❌ Importação cancelada"
    exit 0
fi

echo "📥 Importando banco de dados..."
echo ""

# Importar com drop (remove coleções existentes)
mongorestore \
    --db=$DB_NAME \
    --drop \
    "$BACKUP_DIR/$DB_NAME" \
    2>&1 | grep -v "continuing through error"

if [ $? -eq 0 ] || [ $? -eq 1 ]; then
    echo ""
    echo -e "${GREEN}✅ Importação concluída com sucesso!${NC}"
    echo ""
    echo "📊 Banco de dados restaurado:"
    echo "   → Database: $DB_NAME"
    echo ""
    
    # Listar coleções importadas
    echo "📦 Coleções importadas:"
    if [ -d "$BACKUP_DIR/$DB_NAME" ]; then
        ls "$BACKUP_DIR/$DB_NAME/" | grep ".bson$" | sed 's/.bson//' | awk '{print "   → " $0}'
    fi
    
    echo ""
    echo "🎉 Banco de dados pronto para uso!"
    echo ""
else
    echo ""
    echo -e "${RED}✗ Erro ao importar banco de dados${NC}"
    exit 1
fi
