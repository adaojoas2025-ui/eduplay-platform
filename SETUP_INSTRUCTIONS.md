# 🚀 Instruções de Configuração - EDUPLAY

## Passo a Passo para Rodar o Projeto

### 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

1. **Node.js 18+** - [Download aqui](https://nodejs.org/)
2. **PostgreSQL** - [Download aqui](https://www.postgresql.org/download/)
3. **Git** (opcional) - [Download aqui](https://git-scm.com/)

### 🗄️ 1. Configurar o Banco de Dados PostgreSQL

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

### 🔧 2. Configurar o Backend

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

# Mercado Pago - JÁ CONFIGURADO
MP_ACCESS_TOKEN="APP_USR-4893843815915945-120117-beb0db31f37c04eaf6ecb8f4a9037bcb-145851665"
MP_PUBLIC_KEY="APP_USR-a9edbf1a-d1e3-4c35-9a68-0d890e6bef51"

# Cloudinary - CONFIGURE SUAS CREDENCIAIS
# Cadastre-se grátis em: https://cloudinary.com/
CLOUDINARY_CLOUD_NAME="seu_cloud_name"
CLOUDINARY_API_KEY="sua_api_key"
CLOUDINARY_API_SECRET="seu_api_secret"

# Email - OPCIONAL (para envio de emails)
# Use App Password do Gmail
EMAIL_USER="seu_email@gmail.com"
EMAIL_PASS="sua_senha_de_app"

# Server
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

#### Executar migrations do Prisma:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

#### (Opcional) Criar usuário admin inicial:

Abra o Prisma Studio:
```bash
npx prisma studio
```

Navegue para a tabela `User` e crie um usuário:
- name: Admin
- email: admin@eduplay.com
- password: `$2a$10$X7QWQoQKZz9QKqQzQqQzQeX7QWQoQKZz9QKqQzQqQzQeX7QWQoQ` (senha: "admin123")
- role: ADMIN
- status: APPROVED

#### Iniciar o servidor backend:

```bash
npm run dev
```

✅ Backend rodando em: `http://localhost:3000`

### 🎨 3. Configurar o Frontend

Abra um NOVO terminal na pasta `frontend`:

```bash
cd c:\projetos\frontend
```

#### Instalar dependências:
```bash
npm install
```

#### Configurar variável de ambiente:

O arquivo `frontend/.env` já está configurado:
```env
VITE_API_URL=http://localhost:3000/api
```

#### Iniciar o servidor frontend:

```bash
npm run dev
```

✅ Frontend rodando em: `http://localhost:5173`

### 🎯 4. Testar o Sistema

1. **Abra o navegador**: http://localhost:5173

2. **Criar conta de comprador**:
   - Clique em "Criar conta"
   - Preencha os dados
   - Escolha tipo: "Comprador"

3. **Criar conta de produtor**:
   - Clique em "Criar conta"
   - Preencha os dados
   - Escolha tipo: "Produtor (vender produtos)"
   - Aguardará aprovação do admin

4. **Login como admin** (se criou):
   - Email: admin@eduplay.com
   - Senha: admin123
   - Aprove produtores pendentes

5. **Criar produto** (como produtor aprovado):
   - Vá para "Dashboard"
   - Clique em "Novo Produto"
   - Preencha os dados e envie arquivos
   - Aguarde aprovação do admin

6. **Comprar produto** (como comprador):
   - Navegue pelos produtos
   - Clique em um produto
   - Clique em "Comprar Agora"
   - Será redirecionado para o Mercado Pago

### 🐛 Solução de Problemas

#### Backend não inicia:

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

#### Frontend não inicia:

1. **Erro de dependências**:
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Erro de conexão com API**:
   - Verifique se backend está rodando
   - Confirme `VITE_API_URL` no frontend/.env

#### Upload de arquivos não funciona:

- Configure credenciais do Cloudinary no backend/.env
- Cadastre-se grátis em: https://cloudinary.com/

#### Emails não são enviados:

1. Use App Password do Gmail:
   - Acesse: https://myaccount.google.com/apppasswords
   - Gere uma senha de app
   - Use no EMAIL_PASS

### 📚 Recursos Úteis

- **Documentação Prisma**: https://www.prisma.io/docs
- **Documentação Mercado Pago**: https://www.mercadopago.com.br/developers
- **Documentação React**: https://react.dev/
- **Documentação TailwindCSS**: https://tailwindcss.com/docs

### 🎓 Próximos Passos

1. Configure o Cloudinary para upload de arquivos
2. Configure o email para envio automático
3. Teste o fluxo completo de compra
4. Personalize cores e textos
5. Adicione mais produtos

### 🚀 Deploy (Produção)

#### Backend (Render, Railway, Heroku):
1. Faça push do código
2. Configure variáveis de ambiente
3. Execute: `npx prisma migrate deploy`

#### Frontend (Vercel, Netlify):
1. Faça push do código
2. Configure `VITE_API_URL` para URL do backend
3. Build automático

---

**Precisa de ajuda?** Consulte o README.md ou abra uma issue no repositório.

**Boa sorte com seu marketplace! 🎉**
