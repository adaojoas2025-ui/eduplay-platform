# 🚀 Guia de Deploy - EDUPLAY

## 📋 Checklist Pré-Deploy

### 1. Escolher Plataforma de Hospedagem

**Opções Recomendadas:**

#### Backend (Node.js + PostgreSQL):
- ✅ **Render.com** (Recomendado - Gratuito para começar)
  - PostgreSQL gratuito incluído
  - Deploy automático via Git
  - SSL gratuito

- ⭐ **Railway.app** (Alternativa)
  - PostgreSQL incluído
  - $5/mês após trial

- 🌟 **Heroku** (Pago)
  - Mais estabelecido
  - A partir de $7/mês

#### Frontend (React/Vite):
- ✅ **Vercel** (Recomendado - Gratuito)
  - Deploy automático
  - CDN global
  - SSL gratuito

- ⭐ **Netlify** (Alternativa)
  - Similar ao Vercel
  - Gratuito para projetos pequenos

---

## 🔧 Passo 1: Preparar Backend (Render.com)

### 1.1. Criar conta no Render
1. Acesse https://render.com
2. Crie uma conta (pode usar GitHub)

### 1.2. Criar PostgreSQL Database
1. No Dashboard, clique em "New +"
2. Selecione "PostgreSQL"
3. Configurações:
   - **Name**: eduplay-db
   - **Database**: eduplay
   - **User**: eduplay_user (será criado automaticamente)
   - **Region**: Ohio (US East) ou Oregon (US West)
   - **Plan**: Free (suficiente para começar)
4. Clique em "Create Database"
5. **IMPORTANTE**: Copie a "External Database URL" (vamos usar depois)

### 1.3. Preparar Repositório Git
```bash
cd c:/projetos
git init
git add .
git commit -m "Initial commit - EDUPLAY platform"

# Criar repositório no GitHub
# Depois conectar:
git remote add origin https://github.com/SEU_USUARIO/eduplay.git
git branch -M main
git push -u origin main
```

### 1.4. Criar Web Service no Render
1. No Dashboard, clique em "New +"
2. Selecione "Web Service"
3. Conecte seu repositório GitHub
4. Configurações:
   - **Name**: eduplay-backend
   - **Region**: Same as database (Ohio ou Oregon)
   - **Branch**: main
   - **Root Directory**: backend
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 1.5. Configurar Variáveis de Ambiente no Render

No painel do Web Service, vá em "Environment" e adicione:

```env
NODE_ENV=production
PORT=3000

# Database (use a External URL do PostgreSQL criado)
DATABASE_URL=postgresql://eduplay_user:SENHA@dpg-xxxxx.oregon-postgres.render.com/eduplay

# JWT (GERE NOVOS SEGREDOS!)
JWT_SECRET=GERE_UM_SEGREDO_FORTE_AQUI_32_CARACTERES_MINIMO
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=GERE_OUTRO_SEGREDO_FORTE_DIFERENTE
JWT_REFRESH_EXPIRES_IN=30d

# Mercado Pago (TROQUE PARA CREDENCIAIS DE PRODUÇÃO)
MP_ACCESS_TOKEN=SEU_ACCESS_TOKEN_DE_PRODUCAO
MP_PUBLIC_KEY=SEU_PUBLIC_KEY_DE_PRODUCAO

# Cloudinary (suas credenciais atuais)
CLOUDINARY_CLOUD_NAME=dexlzykqm
CLOUDINARY_API_KEY=761719984596219
CLOUDINARY_API_SECRET=QkAyuumJD-_EsIezBPd2UQVYKew

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=ja.eduplay@gmail.com
EMAIL_PASS=SUA_APP_PASSWORD_DO_GMAIL
EMAIL_FROM="EDUPLAY <ja.eduplay@gmail.com>"

# URLs (ATUALIZAR APÓS DEPLOY)
FRONTEND_URL=https://eduplay.vercel.app
BACKEND_URL=https://eduplay-backend.onrender.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Platform
PLATFORM_FEE_PERCENT=3
PLATFORM_NAME=EDUPLAY
PLATFORM_EMAIL=ja.eduplay@gmail.com
PLATFORM_SUPPORT_EMAIL=ja.eduplay@gmail.com

# Security
BCRYPT_ROUNDS=10
PASSWORD_MIN_LENGTH=8

# File Upload
MAX_FILE_SIZE=104857600
ALLOWED_FILE_TYPES=pdf,mp4,jpg,jpeg,png,gif,zip

# Logging
LOG_LEVEL=info
LOG_DIR=logs

# Google OAuth (ATUALIZAR URLs)
GOOGLE_CLIENT_ID=763826185307-f8utvlugc36q9hvd4enokig6ic6l9ddh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://eduplay-backend.onrender.com/api/v1/auth/google/callback
```

---

## 🎨 Passo 2: Preparar Frontend (Vercel)

### 2.1. Criar arquivo .env.production no frontend

```bash
cd c:/projetos/frontend
```

Crie o arquivo `.env.production`:

```env
VITE_API_URL=https://eduplay-backend.onrender.com/api/v1
```

### 2.2. Testar build localmente

```bash
npm run build
```

### 2.3. Deploy no Vercel

1. Acesse https://vercel.com
2. Faça login com GitHub
3. Clique em "Add New" → "Project"
4. Importe seu repositório
5. Configurações:
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: dist
   - **Install Command**: `npm install`

6. Em "Environment Variables", adicione:
   ```
   VITE_API_URL = https://eduplay-backend.onrender.com/api/v1
   ```

7. Clique em "Deploy"

---

## 🔐 Passo 3: Configurações de Segurança

### 3.1. Gerar Novos Segredos JWT

Use este script Node.js:

```javascript
const crypto = require('crypto');
console.log('JWT_SECRET:', crypto.randomBytes(32).toString('hex'));
console.log('JWT_REFRESH_SECRET:', crypto.randomBytes(32).toString('hex'));
```

### 3.2. Configurar Mercado Pago para Produção

1. Acesse https://www.mercadopago.com.br/developers/panel
2. Vá em "Suas aplicações"
3. Copie as credenciais de **PRODUÇÃO** (não TEST)
4. Atualize as variáveis `MP_ACCESS_TOKEN` e `MP_PUBLIC_KEY` no Render

### 3.3. Configurar Google OAuth

1. Acesse https://console.cloud.google.com
2. Vá no projeto OAuth
3. Em "Credenciais" → Editar cliente OAuth
4. Adicione em "URIs de redirecionamento autorizados":
   ```
   https://eduplay-backend.onrender.com/api/v1/auth/google/callback
   ```
5. Adicione em "Origens JavaScript autorizadas":
   ```
   https://eduplay.vercel.app
   https://eduplay-backend.onrender.com
   ```

---

## 📧 Passo 4: Configurar Email

### 4.1. Criar App Password do Gmail

1. Acesse https://myaccount.google.com/apppasswords
2. Nome: "EDUPLAY Production"
3. Copie a senha de 16 caracteres
4. Atualize `EMAIL_PASS` no Render

---

## 🗄️ Passo 5: Migrar Banco de Dados

### 5.1. Criar usuário admin em produção

Após o deploy, acesse o Shell do Render:

```bash
node scripts/create-admin.js
```

Ou crie manualmente via Prisma Studio:
```bash
npx prisma studio
```

---

## ✅ Passo 6: Verificações Finais

### Checklist de Testes:

- [ ] Backend está acessível (https://eduplay-backend.onrender.com/api/v1/health)
- [ ] Frontend carrega corretamente
- [ ] Login funciona
- [ ] Cadastro de usuário funciona
- [ ] Upload de imagens funciona (Cloudinary)
- [ ] Criação de produtos funciona
- [ ] Checkout de teste funciona
- [ ] Mercado Pago está em modo TESTE primeiro
- [ ] Emails são enviados corretamente
- [ ] Google OAuth funciona

---

## 🔄 Passo 7: Configurar Deploy Contínuo

Ambos Render e Vercel fazem deploy automático quando você faz push para o repositório GitHub:

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

---

## 📊 Passo 8: Monitoramento

### Render
- Logs: Dashboard → Service → Logs
- Metrics: Dashboard → Service → Metrics

### Vercel
- Analytics: Dashboard → Project → Analytics
- Logs: Dashboard → Project → Deployments → View Function Logs

---

## 🚨 Troubleshooting Comum

### Erro: "Application failed to respond"
- Verifique se PORT=3000 está nas variáveis de ambiente
- Verifique logs no Render

### Erro: "CORS blocked"
- Atualize FRONTEND_URL no backend
- Verifique configuração de CORS em app.js

### Erro: "Database connection failed"
- Verifique DATABASE_URL
- Certifique-se que migrations rodaram: `npx prisma migrate deploy`

### Erro 500 no Mercado Pago
- Verifique se está usando credenciais de PRODUÇÃO
- Teste primeiro com credenciais TEST

---

## 💰 Custos Estimados

### Gratuito (Início):
- Render Free Tier: Grátis (dorme após 15min de inatividade)
- Vercel Free: Grátis (100GB bandwidth/mês)
- PostgreSQL Free: Grátis (256MB)
- Cloudinary Free: Grátis (25 créditos/mês)

### Pago (Recomendado para produção):
- Render Starter: $7/mês (sempre ativo)
- Render PostgreSQL: $7/mês (1GB)
- **Total**: ~$14/mês

---

## 📞 Suporte

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs

---

## 🎯 Próximos Passos Após Deploy

1. ✅ Configurar domínio personalizado (opcional)
2. ✅ Ativar Mercado Pago em produção
3. ✅ Configurar backups automáticos do banco
4. ✅ Configurar monitoramento (Sentry, LogRocket)
5. ✅ Implementar analytics (Google Analytics)

---

**Última atualização**: 30/12/2024
**Versão**: 1.0
