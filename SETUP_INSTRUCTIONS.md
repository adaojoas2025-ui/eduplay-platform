# Instruções de Configuração - EDUPLAY

## Passo a Passo para Rodar o Projeto

### Pré-requisitos

Antes de começar, certifique-se de ter instalado:

1. **Node.js 18+** - [Download aqui](https://nodejs.org/)
2. **PostgreSQL** - [Download aqui](https://www.postgresql.org/download/)
3. **Git** (opcional) - [Download aqui](https://git-scm.com/)

---

## Ambiente de Desenvolvimento (Local)

### 1. Configurar o Banco de Dados PostgreSQL

#### Windows:
1. Abra o pgAdmin ou use o terminal
2. Crie um novo banco de dados chamado `eduplay`:
```sql
CREATE DATABASE eduplay;
```

#### Obter a URL de conexão:
```
postgresql://usuario:senha@localhost:5432/eduplay
```

Substitua:
- `usuario` - seu usuário do PostgreSQL (padrão: `postgres`)
- `senha` - sua senha do PostgreSQL

### 2. Configurar o Backend

Abra o terminal na pasta `backend`:

```bash
cd c:\projetos\backend
```

#### Instalar dependências:
```bash
npm install
```

#### Configurar variáveis de ambiente:

Edite o arquivo `backend/.env` e configure:

```env
# Database - OBRIGATÓRIO
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/eduplay?schema=public"

# JWT Secret - OBRIGATÓRIO
JWT_SECRET="eduplay_secret_key_2024_change_in_production"
JWT_REFRESH_SECRET="eduplay_refresh_secret_key_2024"

# Mercado Pago
MP_ACCESS_TOKEN="seu_access_token"

# Cloudinary - CONFIGURE SUAS CREDENCIAIS
CLOUDINARY_CLOUD_NAME="dexlzykqm"
CLOUDINARY_API_KEY="761719984596219"
CLOUDINARY_API_SECRET="seu_api_secret"

# Email (SendGrid) - OBRIGATÓRIO PARA PRODUÇÃO
SENDGRID_API_KEY="SG.xxxxx..."

# Server
PORT=3000
FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:3000"
```

#### Executar migrations do Prisma:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

#### Iniciar o servidor backend:

```bash
npm run dev
```

Backend rodando em: `http://localhost:3000`

### 3. Configurar o Frontend

Abra um NOVO terminal na pasta `frontend`:

```bash
cd c:\projetos\frontend
```

#### Instalar dependências:
```bash
npm install
```

#### Configurar variável de ambiente:

Edite o arquivo `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_CLOUDINARY_CLOUD_NAME=dexlzykqm
VITE_CLOUDINARY_UPLOAD_PRESET=eduplay_apps
```

#### Iniciar o servidor frontend:

```bash
npm run dev
```

Frontend rodando em: `http://localhost:5173`

---

## Ambiente de Produção (Render)

### URLs de Produção

- **Frontend:** https://eduplay-frontend.onrender.com
- **Backend:** https://eduplay-platform.onrender.com
- **API:** https://eduplay-platform.onrender.com/api/v1

### Variáveis de Ambiente no Render (Backend)

```env
# Database
DATABASE_URL=postgresql://eduplay_user:xxx@xxx/eduplay_db

# JWT
JWT_SECRET=xxx
JWT_REFRESH_SECRET=xxx

# Email (SendGrid - FUNCIONA NO RENDER)
SENDGRID_API_KEY=SG.xxxxx...

# Cloudinary
CLOUDINARY_CLOUD_NAME=dexlzykqm
CLOUDINARY_API_KEY=761719984596219
CLOUDINARY_API_SECRET=xxx

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=https://eduplay-platform.onrender.com/api/v1/auth/google/callback

# Mercado Pago
MP_ACCESS_TOKEN=APP_USR-xxx

# URLs
NODE_ENV=production
BACKEND_URL=https://eduplay-platform.onrender.com
FRONTEND_URL=https://eduplay-frontend.onrender.com
```

### IMPORTANTE: Email no Render

**Render bloqueia portas SMTP (587, 465)**. Sempre use serviços de email via API HTTP:

- **SendGrid API** (recomendado)
- Resend API
- Brevo API (chave `xkeysib-`, NÃO `xsmtpsib-`)

**NÃO FUNCIONA no Render:**
- Brevo SMTP
- Gmail SMTP
- Qualquer serviço SMTP

### Endpoint de Diagnóstico

Para verificar configuração de email:
```
GET https://eduplay-platform.onrender.com/api/v1/email-status
```

---

## Testar o Sistema

1. **Abra o navegador**: http://localhost:5173 (local) ou https://eduplay-frontend.onrender.com (produção)

2. **Criar conta de comprador**:
   - Clique em "Criar conta"
   - Preencha os dados
   - Escolha tipo: "Comprador"

3. **Criar conta de produtor**:
   - Clique em "Criar conta"
   - Preencha os dados
   - Escolha tipo: "Produtor (vender produtos)"
   - Aguardará aprovação do admin

4. **Login como admin**:
   - Email: ja.eduplay@gmail.com
   - Aprove produtores pendentes

5. **Criar produto** (como produtor aprovado):
   - Vá para "Dashboard"
   - Clique em "Novo Produto"
   - Preencha os dados e envie arquivos
   - Aguarde aprovação do admin (email será enviado)

6. **Comprar produto** (como comprador):
   - Navegue pelos produtos
   - Clique em um produto
   - Clique em "Comprar Agora"
   - Será redirecionado para o Mercado Pago

---

## Solução de Problemas

### Backend não inicia:

1. **Erro de conexão com banco de dados**:
   - Verifique se PostgreSQL está rodando
   - Confirme a DATABASE_URL no .env
   - Teste a conexão: `psql -U postgres -d eduplay`

2. **Erro "Cannot find module"**:
   ```bash
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Erro do Prisma**:
   ```bash
   npx prisma generate
   npx prisma migrate reset
   ```

### Frontend não inicia:

1. **Erro de dependências**:
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Erro de conexão com API**:
   - Verifique se backend está rodando
   - Confirme `VITE_API_URL` no frontend/.env

### Upload de arquivos não funciona:

- Configure credenciais do Cloudinary no backend/.env
- Verifique se o preset `eduplay_apps` está configurado como **unsigned** no Cloudinary

### Emails não são enviados:

**Em produção (Render):**
- Use SendGrid com `SENDGRID_API_KEY`
- NÃO use SMTP (portas bloqueadas no Render)

**Local:**
- Use App Password do Gmail ou SendGrid

---

## Recursos Úteis

- **Documentação Prisma**: https://www.prisma.io/docs
- **Documentação Mercado Pago**: https://www.mercadopago.com.br/developers
- **Documentação SendGrid**: https://docs.sendgrid.com/
- **Documentação React**: https://react.dev/
- **Documentação TailwindCSS**: https://tailwindcss.com/docs

---

**Última Atualização:** 22 de Janeiro de 2025
