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

# Google OAuth (ver seção "Configurar Google OAuth" abaixo)
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

### Configurar Google OAuth

Para habilitar o login com Google, siga os passos:

#### 1. Criar Projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs e Serviços** > **Credenciais**

#### 2. Configurar Tela de Consentimento OAuth

1. Vá em **APIs e Serviços** > **Tela de consentimento OAuth**
2. Selecione **Externo** e clique em **Criar**
3. Preencha:
   - Nome do app: `EducaplayJA`
   - Email de suporte: seu email
   - Domínios autorizados: `onrender.com`
4. Em **Escopos**, adicione: `email`, `profile`, `openid`
5. Em **Usuários de teste**, adicione seu email (enquanto em modo de teste)

#### 3. Criar Credenciais OAuth

1. Vá em **APIs e Serviços** > **Credenciais**
2. Clique em **Criar credenciais** > **ID do cliente OAuth**
3. Tipo de aplicativo: **Aplicativo da Web**
4. Nome: `EducaplayJA Web`
5. **Origens JavaScript autorizadas**:
   ```
   https://eduplay-frontend.onrender.com
   ```
6. **URIs de redirecionamento autorizados**:
   ```
   https://eduplay-platform.onrender.com/api/v1/auth/google/callback
   ```
7. Clique em **Criar**
8. Copie o **ID do cliente** e **Chave secreta do cliente**

#### 4. Configurar no Render (Backend)

Adicione estas variáveis de ambiente no serviço `eduplay-platform`:

| Variável | Valor |
|----------|-------|
| `GOOGLE_CLIENT_ID` | `seu-client-id.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-sua-chave-secreta` |
| `GOOGLE_CALLBACK_URL` | `https://eduplay-platform.onrender.com/api/v1/auth/google/callback` |

#### 5. Fluxo de Autenticação

```
1. Usuário clica em "Continuar com Google"
2. Frontend redireciona para: /api/v1/auth/google
3. Backend redireciona para Google
4. Usuário autoriza o app
5. Google redireciona para: /api/v1/auth/google/callback
6. Backend cria/encontra usuário e gera tokens JWT
7. Backend redireciona para: /#/auth/google/callback?token=xxx
8. Frontend salva tokens e redireciona para home
```

#### Observações Importantes

- O frontend usa **HashRouter**, por isso o callback usa `/#/`
- Usuários novos são criados com role `BUYER`
- O `googleId` é salvo para identificar o usuário em logins futuros
- Não é necessário senha para usuários OAuth

---

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

### Google OAuth não funciona:

1. **Erro `redirect_uri_mismatch`**:
   - Verifique se a URL de callback está exatamente igual no Google Cloud Console
   - URL correta: `https://eduplay-platform.onrender.com/api/v1/auth/google/callback`

2. **Erro `invalid_client`**:
   - Verifique se `GOOGLE_CLIENT_ID` está correto no Render
   - Confirme que as credenciais são do projeto correto

3. **Erro 500 no callback**:
   - Verifique os logs do backend no Render
   - Possíveis causas: role inválido, ID não gerado, campo obrigatório faltando

4. **Página "Not Found" após login**:
   - O frontend usa HashRouter, a URL deve ter `/#/`
   - Verifique se o backend está redirecionando para `/#/auth/google/callback`

5. **Login funciona mas usuário não aparece logado**:
   - Verifique se o localStorage está salvando com a chave `userData`
   - O Navbar lê de `localStorage.getItem('userData')`

### Mercado Pago exige login para pagar:

1. **Checkout pede login do Mercado Pago**:
   - Verifique se a preferência de pagamento NÃO contém `purpose: 'onboarding_credits'`
   - Esta configuração força o login obrigatório
   - Remova essa linha para permitir pagamento como convidado

2. **Usando credenciais de teste**:
   - Credenciais `TEST-xxx` funcionam apenas em modo sandbox
   - Para produção, use credenciais `APP_USR-xxx`

### Recuperação de senha não funciona:

1. **Senha resetada mas login falha com credenciais inválidas**:
   - Verifique os logs no Render para confirmar que o usuário correto foi atualizado
   - Os logs devem mostrar: `findUserByResetToken result` com o email correto
   - Se o email estiver errado, pode haver tokens duplicados no banco

2. **Link de recuperação inválido ou expirado**:
   - O token expira em 1 hora após a solicitação
   - Solicite um novo link de recuperação
   - Verifique se o email está correto

3. **Email de recuperação não chega**:
   - Verifique a pasta de spam
   - Confirme que o SendGrid está configurado corretamente
   - Use o endpoint `/api/v1/email-status` para diagnóstico

---

## Histórico de Correções

### 29 de Janeiro de 2026

#### Google OAuth
- **Problema**: Erro 500 no callback do Google OAuth
- **Causa**: Role `CUSTOMER` inválido (deveria ser `BUYER`) e ID não gerado automaticamente
- **Solução**: Corrigido `passport.js` para usar role `BUYER` e gerar UUID com `crypto.randomUUID()`

#### Google OAuth - Redirect
- **Problema**: Página "Not Found" após login com Google
- **Causa**: Backend redirecionava sem o prefixo `/#/` necessário para HashRouter
- **Solução**: Corrigido `auth.controller.js` para redirecionar para `/#/auth/google/callback`

#### Google OAuth - LocalStorage
- **Problema**: Login com Google funciona mas usuário não aparece logado
- **Causa**: `CallbackGoogle.jsx` salvava dados com chave `user` em vez de `userData`
- **Solução**: Corrigido para usar `localStorage.setItem('userData', ...)`

#### Recuperação de Senha
- **Problema**: Senha resetada com sucesso mas login falha com senha antiga
- **Causa**: Função `listUsers()` ignorava o filtro `resetPasswordToken`, atualizando a senha do usuário errado
- **Solução**: Criada função dedicada `findUserByResetToken()` no repositório que busca corretamente pelo token

#### Mercado Pago - Login Obrigatório
- **Problema**: Checkout do Mercado Pago exigia login, não permitia pagar como convidado
- **Causa**: Configuração `purpose: 'onboarding_credits'` na preferência de pagamento
- **Solução**: Removida essa configuração para permitir pagamento como convidado

**Arquivos modificados:**
- `backend/src/config/passport.js` - Google OAuth strategy
- `backend/src/api/controllers/auth.controller.js` - Redirect URL
- `backend/src/repositories/user.repository.js` - Nova função `findUserByResetToken`
- `backend/src/services/auth.service.js` - Usa a nova função de busca
- `frontend/src/components/auth/CallbackGoogle.jsx` - LocalStorage key fix
- `backend/src/services/payment.service.js` - Removido `purpose: 'onboarding_credits'`

---

## Recursos Úteis

- **Documentação Prisma**: https://www.prisma.io/docs
- **Documentação Mercado Pago**: https://www.mercadopago.com.br/developers
- **Documentação SendGrid**: https://docs.sendgrid.com/
- **Documentação React**: https://react.dev/
- **Documentação TailwindCSS**: https://tailwindcss.com/docs

---

**Última Atualização:** 30 de Janeiro de 2026
