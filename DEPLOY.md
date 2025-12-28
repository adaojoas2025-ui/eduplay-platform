# 🚀 Guia de Deploy - EducaplayJA Platform

Este guia explica como fazer deploy do sistema **EducaplayJA** em produção usando **Render** (backend) e **Vercel** (frontend).

**IMPORTANTE:** Vamos usar o banco de dados PostgreSQL que VOCÊ JÁ TEM em produção no Render, então não vamos criar um novo banco!

---

## ⚡ Resumo Ultra Rápido (TL;DR)

**Se você já tem contas no Render e Vercel, siga isso:**

1. **Push para GitHub:**
   ```bash
   git add .
   git commit -m "Deploy EducaplayJA v1.5.0"
   git push origin main
   ```

2. **Render (Backend):**
   - New → Web Service → Conecte o repo
   - Name: `educaplayja-api`
   - Root: `backend`
   - Build: `npm install && npx prisma generate`
   - Start: `npm start`
   - Copie TODAS as variáveis do `.env` local (Seção 2.3 deste guia)
   - Deploy!

3. **Vercel (Frontend):**
   - New Project → Conecte o repo
   - Root: `frontend`
   - Framework: Vite
   - Adicione variável: `VITE_API_URL=https://educaplayja-api.onrender.com/api/v1`
   - Deploy!

4. **Configurações Finais:**
   - Atualize `FRONTEND_URL` e `BACKEND_URL` no Render
   - Atualize Google OAuth com as URLs de produção
   - Teste tudo!

**Leia o guia completo abaixo se tiver dúvidas!**

---

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
   - **Name**: `educaplayja-api`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### 2.2 ⚠️ IMPORTANTE: Usar seu Banco de Dados Existente

**NÃO CRIE UM NOVO BANCO!** Você já tem um banco PostgreSQL rodando no Render com todos os dados.

1. No Render Dashboard, encontre seu banco existente (deve ser algo como `eduplay_db_rsyj`)
2. Clique nele e copie a **External Database URL** (formato: `postgresql://eduplay_user:senha@dpg-...`)
3. Essa é a URL que você vai usar na variável `DATABASE_URL` do Web Service

### 2.3 Configurar Variáveis de Ambiente

No Web Service `educaplayja-api`, vá em **"Environment"** e adicione TODAS as variáveis abaixo:

**ATENÇÃO:** As variáveis marcadas com ⚠️ você JÁ TEM configuradas. Copie do seu arquivo `.env` local!

```bash
# Application
NODE_ENV=production
PORT=3000

# Database - ⚠️ COPIE a URL do seu banco existente no Render
DATABASE_URL=postgresql://eduplay_user:e6WRYc525CE1Q5EeQXFbsK1dCL0ZqHml@dpg-d4tjga3uibrs73aohlpg-a.oregon-postgres.render.com:5432/eduplay_db_rsyj

# JWT Secrets - ⚠️ MANTENHA os mesmos valores do seu .env local OU gere novos
JWT_SECRET=eduplay-super-secret-jwt-key-2024-change-in-production
JWT_REFRESH_SECRET=eduplay-refresh-secret-2024-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Mercado Pago - ⚠️ INICIALMENTE USE TEST, depois troque para PRODUÇÃO
MP_ACCESS_TOKEN=TEST-4893843815915945-120117-dc45f68f6805eb7bf92f3d0dbe637ee5-145851665
MP_PUBLIC_KEY=TEST-d1674a6b-17bd-46d4-acc4-c95ad9fe02d9

# Cloudinary - ⚠️ COPIE do seu .env local
CLOUDINARY_CLOUD_NAME=dexlzykqm
CLOUDINARY_API_KEY=761719984596219
CLOUDINARY_API_SECRET=QkAyuumJD-_EsIezBPd2UQVYKew

# Email - ⚠️ COPIE do seu .env local
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=adao.joas2025@gmail.com
EMAIL_PASS=kiiu xadt rbmk whns
EMAIL_FROM="EducaplayJA <adao.joas2025@gmail.com>"

# URLs - ⚠️ VOCÊ VAI ATUALIZAR ISSO DEPOIS DO DEPLOY
FRONTEND_URL=https://seu-app.vercel.app
BACKEND_URL=https://educaplayja-api.onrender.com

# Google OAuth - ⚠️ COPIE do seu .env local
GOOGLE_CLIENT_ID=763826185307-f8utvlugc36q9hvd4enokig6ic6l9ddh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://educaplayja-api.onrender.com/api/v1/auth/google/callback

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Platform Configuration
PLATFORM_FEE_PERCENT=3
PLATFORM_NAME=EducaplayJA
PLATFORM_EMAIL=contato@educaplayja.com.br
PLATFORM_SUPPORT_EMAIL=suporte@educaplayja.com.br

# Security
BCRYPT_ROUNDS=10
PASSWORD_MIN_LENGTH=8

# File Upload
MAX_FILE_SIZE=104857600
ALLOWED_FILE_TYPES=pdf,mp4,jpg,jpeg,png,gif,zip

# Logging
LOG_LEVEL=info
LOG_DIR=logs
```

**IMPORTANTE:**
- A senha do email está com espaços propositalmente (`kiiu xadt rbmk whns`)
- Use TESTE do Mercado Pago primeiro, depois ativamos produção
- O `DATABASE_URL` já aponta para seu banco existente com todos os dados

### 2.4 Gerar JWT Secrets Seguros

Use este comando para gerar secrets seguros:

```bash
# No terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Execute 2 vezes para gerar `JWT_SECRET` e `JWT_REFRESH_SECRET` diferentes.

### 2.4 Deploy do Backend

1. Clique em **"Create Web Service"**
2. Aguarde o build e deploy (pode levar 5-10 minutos na primeira vez)
3. ⚠️ **MUITO IMPORTANTE:** O Render vai tentar rodar migrations automaticamente. Se der erro, é normal! Seu banco já tem as tabelas.
4. Após completar o deploy, acesse: `https://educaplayja-api.onrender.com/api/v1/health`
5. Deve retornar: `{"status":"ok"}`

**Se o deploy falhar por causa de migrations:**
1. No Render Dashboard, vá em **"Environment"** do Web Service
2. Mude o **Build Command** para apenas: `npm install && npx prisma generate`
3. Clique em **"Manual Deploy"** → **"Clear build cache & deploy"**

---

## 🌐 Parte 3: Deploy do Frontend (Vercel)

### 3.1 Preparar o Frontend

**IMPORTANTE:** Primeiro você precisa saber a URL do seu backend no Render!

1. No Render Dashboard, copie a URL do seu Web Service (algo como: `https://educaplayja-api.onrender.com`)

2. No VSCode, verifique se existe o arquivo `frontend/.env.production`. Se NÃO existir, crie ele:

```bash
# frontend/.env.production
VITE_API_URL=https://educaplayja-api.onrender.com/api/v1
```

3. **NÃO PRECISA** fazer commit agora, vamos configurar via Vercel Dashboard

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

**CRÍTICO:** Na aba **"Environment Variables"**, adicione:

```
Name: VITE_API_URL
Value: https://educaplayja-api.onrender.com/api/v1
```

⚠️ **ATENÇÃO:**
- Marque as 3 checkboxes (Production, Preview, Development)
- Cole a URL EXATA do seu backend no Render
- Não esqueça o `/api/v1` no final!

### 3.4 Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (2-5 minutos)
3. Quando terminar, clique em **"Visit"** ou copie a URL (algo como: `https://educaplayja.vercel.app`)
4. Acesse a URL e teste se o site abre

**Se der erro de conexão:**
- Verifique se `VITE_API_URL` está correto
- Teste o backend diretamente: `https://educaplayja-api.onrender.com/api/v1/health`

---

## 🔧 Parte 4: Configurações Finais (DEPOIS de ambos estarem no ar)

### 4.1 Atualizar URLs no Backend

Agora que você tem as URLs finais, volte no Render:

1. No Web Service `educaplayja-api`, vá em **"Environment"**
2. Atualize essas 2 variáveis com as URLs REAIS:
   ```
   FRONTEND_URL=https://educaplayja.vercel.app
   BACKEND_URL=https://educaplayja-api.onrender.com
   ```
3. Clique em **"Save Changes"**
4. O Render vai fazer redeploy automático (aguarde 2-3 minutos)

### 4.2 Atualizar Google OAuth (se você usar login com Google)

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Vá em **"APIs & Services"** → **"Credentials"**
3. Edite o OAuth 2.0 Client ID que você está usando
4. Adicione nas **"Authorized redirect URIs"**:
   ```
   https://educaplayja-api.onrender.com/api/v1/auth/google/callback
   ```
5. Adicione nas **"Authorized JavaScript origins"**:
   ```
   https://educaplayja.vercel.app
   ```
6. Clique em **"Save"**

### 4.3 Verificar CORS (NÃO precisa mexer se já está certo)

O arquivo `backend/src/config/cors.config.js` já deve estar permitindo múltiplas origens. Se tiver problema, verifique se tem isso:

```javascript
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:5173']
  : ['http://localhost:5173'];
```

### 4.4 NÃO precisa fazer Seed!

**IMPORTANTE:** Seu banco JÁ TEM todos os dados (usuários, produtos, etc). Não rode o seed em produção!

---

## ✅ Parte 5: Verificação e Testes

### 5.1 Checklist de Funcionamento Básico

Teste NESTA ORDEM:

- [ ] **Backend responde:** Abra `https://educaplayja-api.onrender.com/api/v1/health` → deve retornar `{"status":"ok"}`
- [ ] **Frontend carrega:** Abra `https://educaplayja.vercel.app` → deve mostrar a home
- [ ] **Login funciona:** Tente fazer login com um usuário que EXISTE no banco
- [ ] **Dados aparecem:** Veja se seus produtos/cursos aparecem (já estão no banco!)
- [ ] **Upload de imagens:** Tente publicar um novo app/produto
- [ ] **Compra com Mercado Pago:** Teste uma compra (modo TEST ainda)

### 5.2 Problemas Comuns

**❌ Backend não responde (502/504):**
- O Render demora ~30 segundos na primeira requisição (sleep mode)
- Aguarde e tente novamente
- Se continuar, veja os logs no Render Dashboard

**❌ Frontend carrega mas não conecta ao backend:**
- Verifique `VITE_API_URL` no Vercel
- Abra o Console do navegador (F12) e veja se tem erro de CORS
- Verifique se `FRONTEND_URL` está correta no Render

**❌ Login não funciona:**
- Verifique se `JWT_SECRET` está configurado no Render
- Veja os logs do backend no Render Dashboard
- Confirme que o banco de dados está conectado corretamente

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

Seu sistema **EducaplayJA** está no ar! 🚀

URLs de acesso:
- **Frontend**: https://educaplayja.vercel.app (sua URL real pode ser diferente)
- **Backend API**: https://educaplayja-api.onrender.com/api/v1
- **Health Check**: https://educaplayja-api.onrender.com/api/v1/health

---

## 📱 Próximos Passos (DEPOIS que tudo estiver funcionando)

### Ativar Mercado Pago em PRODUÇÃO

**ATENÇÃO:** Só faça isso DEPOIS de testar tudo em modo TEST!

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Vá em **"Suas integrações"** → Sua aplicação → **"Credenciais de produção"**
3. Copie:
   - Access Token de Produção
   - Public Key de Produção
4. No Render, atualize as variáveis:
   ```
   MP_ACCESS_TOKEN=APP_USR-seu-token-de-producao
   MP_PUBLIC_KEY=APP_USR-sua-chave-publica-producao
   ```
5. No Mercado Pago, configure o **Webhook URL**:
   ```
   https://educaplayja-api.onrender.com/api/v1/webhooks/mercadopago
   ```

### Configurar Domínio Próprio (Opcional)

Se quiser usar `www.educaplayja.com.br`:

1. Compre o domínio (Registro.br, GoDaddy, etc)
2. No Vercel: **"Settings"** → **"Domains"** → Adicione seu domínio
3. No Render: **"Settings"** → **"Custom Domain"** → Adicione `api.educaplayja.com.br`
4. Configure DNS conforme instruções do Vercel e Render

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no Render/Vercel
2. Consulte a documentação oficial
3. Revise as variáveis de ambiente

**Importante:** Nunca commit arquivos `.env` com credenciais reais!
