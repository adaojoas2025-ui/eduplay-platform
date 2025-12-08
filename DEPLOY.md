# 🚀 Guia de Deploy - EDUPLAY Platform

Este guia explica como fazer deploy do sistema EDUPLAY em produção usando **Render** (backend) e **Vercel** (frontend).

## 📋 Pré-requisitos

Antes de começar, você precisa:

1. ✅ Conta no [GitHub](https://github.com) (para hospedar o código)
2. ✅ Conta no [Render](https://render.com) (para o backend - GRÁTIS)
3. ✅ Conta no [Vercel](https://vercel.com) (para o frontend - GRÁTIS)
4. ✅ Credenciais configuradas:
   - Mercado Pago (produção)
   - Cloudinary
   - Google OAuth
   - Email SMTP

---

## 🗂️ Parte 1: Preparar o Código no GitHub

### 1.1 Criar repositório no GitHub

```bash
# Se ainda não inicializou o git
cd c:\projetos
git init

# Adicionar todos os arquivos
git add .
git commit -m "Initial commit - EDUPLAY Platform"

# Criar repositório no GitHub e vincular
git remote add origin https://github.com/seu-usuario/eduplay.git
git branch -M main
git push -u origin main
```

### 1.2 Verificar arquivos sensíveis

Certifique-se que o `.gitignore` está correto e os arquivos `.env` NÃO estão no Git:

```bash
# Verificar
git status

# Deve mostrar que .env está ignorado
```

---

## 🖥️ Parte 2: Deploy do Backend (Render)

### 2.1 Criar Web Service no Render

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub
4. Configure:
   - **Name**: `eduplay-api`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### 2.2 Criar Database PostgreSQL no Render

1. No Render Dashboard → **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `eduplay-db`
   - **Database**: `eduplay`
   - **Plan**: `Free`
   - **Region**: `Oregon (US West)`
3. Clique em **"Create Database"**
4. Copie a **Internal Database URL** (formato: `postgresql://...`)

### 2.3 Configurar Variáveis de Ambiente

No Web Service `eduplay-api`, vá em **"Environment"** e adicione:

```bash
# Application
NODE_ENV=production
PORT=3000

# Database (Cole a URL do banco criado acima)
DATABASE_URL=postgresql://eduplay_user:senha@dpg-xxxxx.oregon-postgres.render.com/eduplay

# JWT Secrets (IMPORTANTE: Gere valores seguros!)
JWT_SECRET=gere-um-valor-aleatorio-muito-seguro-minimo-32-caracteres
JWT_REFRESH_SECRET=outro-valor-aleatorio-diferente-minimo-32-caracteres
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Mercado Pago (Credenciais de PRODUÇÃO)
MP_ACCESS_TOKEN=seu-token-de-producao-mercadopago
MP_PUBLIC_KEY=sua-chave-publica-de-producao

# Cloudinary
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=seu-api-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app
EMAIL_FROM="EDUPLAY <seu-email@gmail.com>"

# URLs (Atualize depois do deploy)
FRONTEND_URL=https://seu-app.vercel.app
BACKEND_URL=https://eduplay-api.onrender.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Platform
PLATFORM_FEE_PERCENT=10
PLATFORM_NAME=EDUPLAY
PLATFORM_EMAIL=contato@eduplay.com.br
PLATFORM_SUPPORT_EMAIL=suporte@eduplay.com.br

# Security
BCRYPT_ROUNDS=12
PASSWORD_MIN_LENGTH=8

# File Upload
MAX_FILE_SIZE=104857600
ALLOWED_FILE_TYPES=pdf,mp4,jpg,jpeg,png,gif,zip

# Logging
LOG_LEVEL=info
LOG_DIR=logs

# Google OAuth (Credenciais de PRODUÇÃO)
GOOGLE_CLIENT_ID=seu-client-id-producao.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret-producao
GOOGLE_CALLBACK_URL=https://eduplay-api.onrender.com/api/v1/auth/google/callback
```

### 2.4 Gerar JWT Secrets Seguros

Use este comando para gerar secrets seguros:

```bash
# No terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Execute 2 vezes para gerar `JWT_SECRET` e `JWT_REFRESH_SECRET` diferentes.

### 2.5 Deploy

1. Clique em **"Create Web Service"**
2. Aguarde o build e deploy (pode levar 5-10 minutos)
3. Após completar, acesse: `https://eduplay-api.onrender.com/api/v1/health`
4. Deve retornar: `{"status":"ok","timestamp":"..."}`

---

## 🌐 Parte 3: Deploy do Frontend (Vercel)

### 3.1 Preparar o Frontend

1. Atualize o arquivo `.env.production` com a URL do backend:

```bash
VITE_API_URL=https://eduplay-api.onrender.com/api/v1
```

2. Commit e push:

```bash
git add .
git commit -m "Configure production environment"
git push
```

### 3.2 Deploy na Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em **"Add New..."** → **"Project"**
3. Importe seu repositório GitHub
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3.3 Configurar Variáveis de Ambiente

Na aba **"Environment Variables"**, adicione:

```bash
VITE_API_URL=https://eduplay-api.onrender.com/api/v1
```

### 3.4 Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (2-5 minutos)
3. Acesse a URL fornecida: `https://seu-app.vercel.app`

---

## 🔧 Parte 4: Configurações Finais

### 4.1 Atualizar Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Vá em **"APIs & Services"** → **"Credentials"**
3. Edite o OAuth 2.0 Client
4. Adicione nas **"Authorized redirect URIs"**:
   ```
   https://eduplay-api.onrender.com/api/v1/auth/google/callback
   ```
5. Adicione nas **"Authorized JavaScript origins"**:
   ```
   https://seu-app.vercel.app
   ```

### 4.2 Atualizar CORS no Backend

Verifique se o arquivo `backend/src/config/cors.js` permite a URL do Vercel:

```javascript
origin: [
  'https://seu-app.vercel.app',
  'http://localhost:5173'
]
```

### 4.3 Seed do Banco de Dados

Para popular o banco com dados iniciais:

1. No Render, vá em **"Shell"** do Web Service
2. Execute:
   ```bash
   npm run db:seed
   ```

---

## ✅ Parte 5: Verificação

### 5.1 Checklist de Funcionamento

- [ ] Backend API responde: `https://eduplay-api.onrender.com/api/v1/health`
- [ ] Frontend carrega: `https://seu-app.vercel.app`
- [ ] Login com email funciona
- [ ] Login com Google funciona
- [ ] Cadastro de usuário funciona
- [ ] Upload de imagens funciona (Cloudinary)
- [ ] Criação de produtos funciona
- [ ] Sistema de gamificação funciona
- [ ] Compra com Mercado Pago funciona

### 5.2 Monitoramento

**Render Dashboard:**
- Logs em tempo real
- Métricas de uso
- Status do serviço

**Vercel Dashboard:**
- Analytics
- Build logs
- Performance metrics

---

## 🐛 Troubleshooting

### Problema: Build falha no Render

**Solução:** Verifique os logs e certifique-se que:
- `package.json` está correto
- Todas as dependências estão instaladas
- Prisma schema está válido

### Problema: Frontend não conecta ao Backend

**Solução:**
- Verifique a variável `VITE_API_URL` na Vercel
- Confirme que CORS está configurado corretamente
- Teste a API diretamente no navegador

### Problema: Google OAuth não funciona

**Solução:**
- Verifique as URLs autorizadas no Google Console
- Confirme que `GOOGLE_CALLBACK_URL` está correto
- Verifique os logs do Render para erros OAuth

### Problema: Banco de dados não conecta

**Solução:**
- Verifique a `DATABASE_URL` nas variáveis de ambiente
- Certifique-se que o banco PostgreSQL está ativo
- Teste a conexão usando `npx prisma db pull`

---

## 📊 Limites do Plano Gratuito

### Render Free Plan:
- ✅ 750 horas/mês
- ✅ 512 MB RAM
- ✅ 0.1 CPU
- ⚠️ Suspende após 15 min inativo (primeiro request demora ~30s)

### Vercel Free Plan:
- ✅ 100 GB bandwidth/mês
- ✅ Builds ilimitados
- ✅ HTTPS automático
- ✅ CDN global

### PostgreSQL Free Plan (Render):
- ✅ 1 GB armazenamento
- ⚠️ Expira após 90 dias (backup necessário)

---

## 🚀 Upgrade para Produção Real

Para uso comercial, considere:

1. **Render Starter Plan** ($7/mês):
   - Sem sleep
   - Mais recursos
   - 400 GB bandwidth

2. **Vercel Pro** ($20/mês):
   - Analytics avançados
   - Mais builds
   - Suporte prioritário

3. **Railway** ou **Supabase** para PostgreSQL:
   - Sem expiração
   - Backups automáticos
   - Mais armazenamento

---

## 📝 Manutenção

### Atualizar o Sistema

```bash
# 1. Fazer mudanças no código
git add .
git commit -m "Descrição das mudanças"
git push

# 2. Deploy automático
# Render e Vercel detectam e fazem redeploy automaticamente
```

### Backup do Banco de Dados

```bash
# No Render Shell
pg_dump $DATABASE_URL > backup.sql

# Ou use a ferramenta de backup do Render Dashboard
```

### Logs

```bash
# Ver logs em tempo real no Render Dashboard
# Ou use a CLI do Render:
render logs -s eduplay-api
```

---

## 🎉 Pronto!

Seu sistema EDUPLAY está no ar! 🚀

URLs de acesso:
- **Frontend**: https://seu-app.vercel.app
- **Backend API**: https://eduplay-api.onrender.com/api/v1
- **API Docs**: https://eduplay-api.onrender.com/api/v1/health

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no Render/Vercel
2. Consulte a documentação oficial
3. Revise as variáveis de ambiente

**Importante:** Nunca commit arquivos `.env` com credenciais reais!
