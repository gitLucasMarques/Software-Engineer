#!/bin/bash

# Script para exportar todo o banco de dados MongoDB

# Encerra o script imediatamente se algum comando retornar erro
set -e

echo "════════════════════════════════════════════════════════════════"
echo "   📦 EXPORTAÇÃO DO BANCO DE DADOS"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Definição de cores para mensagens formatadas no terminal
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'   # Sem cor

# Verificar se o comando mongodump está instalado no sistema
if ! command -v mongodump &> /dev/null; then
    echo -e "${RED}✗${NC} mongodump não encontrado!"
    echo "Instalando MongoDB Database Tools..."
    
    # Detecta se o sistema é Linux
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Baixa o pacote das ferramentas oficiais do MongoDB
        wget https://fastdl.mongodb.org/tools/db/mongodb-database-tools-ubuntu2004-x86_64-100.9.0.deb
        # Instala o pacote
        sudo dpkg -i mongodb-database-tools-ubuntu2004-x86_64-100.9.0.deb
        # Remove o pacote após instalado
        rm mongodb-database-tools-ubuntu2004-x86_64-100.9.0.deb
    
    # Detecta se o sistema é macOS
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install mongodb-database-tools
    
    # Sistemas não suportados automaticamente
    else
        echo "Instale manualmente: https://www.mongodb.com/try/download/database-tools"
        exit 1
    fi
fi

# Nome padrão do banco de dados
DB_NAME="game_ecommerce"

# Verifica se o arquivo .env existe para extrair a variável MONGODB_URI
if [ -f ".env" ]; then
    # Pega o valor da chave MONGODB_URI e remove aspas e espaços
    MONGO_URI=$(grep MONGODB_URI .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
    
    # Se o valor existir, extrai o nome do banco a partir da URI
    if [ ! -z "$MONGO_URI" ]; then
        # Pega tudo após a última "/" e antes de possíveis parâmetros "?"
        DB_NAME=$(echo $MONGO_URI | sed 's/.*\///' | cut -d '?' -f1)
    fi
fi

# Exibe o banco que será exportado
echo "🗄️  Banco de dados: $DB_NAME"
echo ""

# Nome do diretório onde o backup será salvo
BACKUP_DIR="database-backup"

# Se um backup antigo já existir, remove antes de gerar outro
if [ -d "$BACKUP_DIR" ]; then
    echo "🗑️  Removendo backup anterior..."
    rm -rf "$BACKUP_DIR"
fi

# Cria diretório para armazenar o backup
mkdir -p "$BACKUP_DIR"

echo "📤 Exportando banco de dados..."
echo ""

# Executa o mongodump para exportar TODAS as coleções do banco
# A flag "--out" define o diretório destino
# Mensagens sobre "writing" são filtradas para deixar o log mais limpo
mongodump \
    --db=$DB_NAME \
    --out="$BACKUP_DIR" \
    2>&1 | grep -v "writing"

# Verifica se o comando executou com sucesso
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Exportação concluída com sucesso!${NC}"
    echo ""
    echo "📁 Backup salvo em: backend/$BACKUP_DIR/"
    echo ""
    
    # Lista os arquivos .bson exportados (cada um representa uma coleção)
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
