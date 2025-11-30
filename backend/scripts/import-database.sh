#!/bin/bash

# Script para importar backup do banco de dados MongoDB
# Este script restaura um banco usando arquivos gerados pelo mongodump.

set -e  # Encerra imediatamente se qualquer comando retornar erro

echo "════════════════════════════════════════════════════════════════"
echo "   📥 IMPORTAÇÃO DO BANCO DE DADOS"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Cores para mensagens coloridas no terminal
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'   # No Color: usado para resetar a cor

# Verificar se mongorestore está instalado
# 'command -v' verifica se o comando existe no sistema
if ! command -v mongorestore &> /dev/null; then
    echo -e "${RED}✗${NC} mongorestore não encontrado!"
    echo "Instalando MongoDB Database Tools..."
    
    # Detecta o sistema operacional para instalar corretamente
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

# Diretório onde o backup deve estar armazenado
BACKUP_DIR="database-backup"

# Verificar se o diretório de backup existe
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}✗${NC} Backup não encontrado!"
    echo "Execute primeiro: cd backend && ./scripts/export-database.sh"
    exit 1
fi

# Nome padrão do banco de dados
DB_NAME="game_ecommerce"

# Se existir um arquivo .env, tentar extrair o nome do banco do MONGODB_URI
# Isso permite restaurar automaticamente o banco configurado na aplicação
if [ -f ".env" ]; then
    MONGO_URI=$(grep MONGODB_URI .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
    if [ ! -z "$MONGO_URI" ]; then
        # Extrai o nome do banco da URI (última parte antes do ?)
        DB_NAME=$(echo $MONGO_URI | sed 's/.*\///' | cut -d '?' -f1)
    fi
fi

echo "🗄️  Banco de dados: $DB_NAME"
echo "📁 Backup: $BACKUP_DIR/"
echo ""

# Aviso de segurança antes de prosseguir
echo -e "${YELLOW}⚠️  ATENÇÃO:${NC} Esta operação irá:"
echo "   → Remover dados existentes do banco $DB_NAME"
echo "   → Importar os dados do backup"
echo ""
read -p "Deseja continuar? (S/n): " -r
echo ""

# Se o usuário responder N ou n, cancelar processo
if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo "❌ Importação cancelada"
    exit 0
fi

echo "📥 Importando banco de dados..."
echo ""

# Processo de restauração:
# --db define o nome do banco a ser restaurado
# --drop apaga coleções existentes antes de restaurar
# Caminho aponta para o diretório contendo os arquivos .bson
mongorestore \
    --db=$DB_NAME \
    --drop \
    "$BACKUP_DIR/$DB_NAME" \
    2>&1 | grep -v "continuing through error"   # Remove mensagens irrelevantes

# Código de retorno 0 = sucesso; 1 = alguns avisos (mongorestore costuma usar)
if [ $? -eq 0 ] || [ $? -eq 1 ]; then
    echo ""
    echo -e "${GREEN}✅ Importação concluída com sucesso!${NC}"
    echo ""
    echo "📊 Banco de dados restaurado:"
    echo "   → Database: $DB_NAME"
    echo ""
    
    # Listar coleções restauradas (com base nos arquivos .bson)
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
