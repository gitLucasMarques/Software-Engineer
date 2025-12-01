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
