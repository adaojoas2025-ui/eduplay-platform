#!/bin/bash

# Script para atualizar URL do backend no frontend
# Uso: ./update-backend-url.sh https://sua-url-railway.app

if [ -z "$1" ]; then
    echo "❌ Erro: Forneça a URL do backend Railway"
    echo "Uso: ./update-backend-url.sh https://backend-production-xxxx.railway.app"
    exit 1
fi

BACKEND_URL="$1"
API_URL="${BACKEND_URL}/api/v1"

echo "🔧 Atualizando URL do backend..."
echo "📍 Nova URL: $API_URL"

# Atualizar frontend .env.production
echo "VITE_API_URL=$API_URL" > frontend/.env.production
echo "✅ Frontend .env.production atualizado"

# Atualizar backend CORS
echo "🔧 Atualizando CORS no backend..."
cd backend/src
sed -i "s|'https://backend-jet-ten-48.vercel.app'|'$BACKEND_URL'|g" app.js
cd ../..

# Commit e push
echo "📦 Commitando mudanças..."
git add frontend/.env.production backend/src/app.js
git commit -m "chore: update backend URL to Railway

Updated frontend to use Railway backend: $BACKEND_URL

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push

echo ""
echo "✅ Tudo pronto! Agora vou fazer o deploy do frontend..."
echo ""

cd frontend
vercel --prod --yes

echo ""
echo "🎉 DEPLOY COMPLETO!"
echo ""
echo "🌐 Frontend: https://frontend-alpha-pied-73.vercel.app"
echo "🔗 Backend: $BACKEND_URL"
echo ""
echo "🧪 Teste o health check:"
echo "curl $API_URL/health"
