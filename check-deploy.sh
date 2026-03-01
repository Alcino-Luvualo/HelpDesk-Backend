#!/bin/bash

echo "🔍 Verificando configuração para deploy no Render..."
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar arquivos
echo "📁 Verificando arquivos..."

if [ -f "config/database.js" ]; then
    echo -e "${GREEN}✓${NC} config/database.js existe"
    if grep -q "DATABASE_URL" config/database.js; then
        echo -e "${GREEN}✓${NC} DATABASE_URL configurada"
    else
        echo -e "${RED}✗${NC} DATABASE_URL não encontrada em config/database.js"
    fi
    if grep -q "rejectUnauthorized: false" config/database.js; then
        echo -e "${GREEN}✓${NC} SSL configurado"
    else
        echo -e "${RED}✗${NC} SSL não configurado"
    fi
else
    echo -e "${RED}✗${NC} config/database.js não encontrado"
fi

if [ -f "config/app.js" ]; then
    echo -e "${GREEN}✓${NC} config/app.js existe"
    if grep -q "trustProxy: true" config/app.js; then
        echo -e "${GREEN}✓${NC} trustProxy habilitado"
    else
        echo -e "${YELLOW}⚠${NC} trustProxy não está habilitado (recomendado para Render)"
    fi
else
    echo -e "${RED}✗${NC} config/app.js não encontrado"
fi

if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json existe"
    if grep -q "pg" package.json; then
        echo -e "${GREEN}✓${NC} Driver PostgreSQL (pg) instalado"
    else
        echo -e "${RED}✗${NC} Driver PostgreSQL não encontrado"
    fi
else
    echo -e "${RED}✗${NC} package.json não encontrado"
fi

echo ""
echo "🔐 Verificando variáveis de ambiente necessárias..."
echo ""
echo "Para produção no Render, configure:"
echo ""
echo -e "${YELLOW}NODE_ENV${NC}=production"
echo -e "${YELLOW}HOST${NC}=0.0.0.0"
echo -e "${YELLOW}PORT${NC}=3333"
echo -e "${YELLOW}APP_KEY${NC}=<sua-chave>"
echo -e "${YELLOW}DATABASE_URL${NC}=<url-do-postgresql-render>"
echo -e "${YELLOW}DB_CONNECTION${NC}=pg"
echo -e "${YELLOW}CACHE_VIEWS${NC}=true"
echo ""

echo "📋 Build Command para Render:"
echo -e "${GREEN}npm install && node ace migration:run --force${NC}"
echo ""

echo "🚀 Start Command para Render:"
echo -e "${GREEN}node ace serve --production${NC}"
echo ""

echo "✅ Verificação concluída!"
echo ""
echo "📖 Leia DEPLOY.md e RENDER_SETUP.md para instruções completas."
