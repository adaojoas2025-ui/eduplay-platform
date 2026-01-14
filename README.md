# 🎓 EducaplayJA - Plataforma Marketplace Profissional

**Plataforma completa de marketplace para cursos digitais, produtos educacionais e aplicativos.**

Sistema 100% funcional com pagamentos via Mercado Pago, gamificação, comissões automáticas, loja de apps e painel administrativo completo.

---

## ✨ Características Principais

- 🛒 **Marketplace completo** - Venda cursos, produtos digitais e apps
- 💳 **Pagamentos integrados** - Mercado Pago com webhooks
- 🎮 **Sistema de gamificação** - XP, níveis e conquistas
- 💰 **Comissões automáticas** - 3% para plataforma, 97% para vendedores
- 📊 **Dashboard administrativo** - Estatísticas e gerenciamento
- 🔐 **Autenticação completa** - Email/senha + Google OAuth
- 📱 **Loja de Apps** - Publique e venda aplicativos educacionais
- 📧 **Sistema de emails** - Notificações automáticas
- 🖼️ **Upload de imagens** - Integração com Cloudinary
- 📱 **Design responsivo** - Funciona em desktop e mobile

---

## ✅ O QUE JÁ ESTÁ FUNCIONANDO (100%)

### Backend (API REST)
- ✅ API RESTful completa
- ✅ PostgreSQL + Prisma ORM
- ✅ Autenticação JWT + Refresh Tokens
- ✅ Google OAuth 2.0
- ✅ Sistema de roles (BUYER, PRODUCER, ADMIN)
- ✅ CRUD completo de produtos
- ✅ Sistema de pedidos (PENDING → APPROVED)
- ✅ Integração Mercado Pago com webhooks
- ✅ Sistema de comissões (3% plataforma / 97% vendedor)
- ✅ Upload de arquivos via Cloudinary
- ✅ Sistema de gamificação (XP e níveis)
- ✅ Logging profissional (Winston)
- ✅ Rate limiting (segurança)
- ✅ Sistema de emails (Nodemailer)
- ✅ CORS configurado
- ✅ Loja de Apps completa
- ✅ Repositórios PostgreSQL em produção

### Frontend (React + Vite)
- ✅ Login/Registro com validação
- ✅ Login com Google OAuth
- ✅ Navegação completa (React Router)
- ✅ Navbar responsivo com dropdown
- ✅ Home page profissional
- ✅ Marketplace com grid de produtos
- ✅ Página de detalhes do produto
- ✅ Carrinho de compras funcional
- ✅ Checkout via Mercado Pago
- ✅ Confirmação de pedidos
- ✅ Meus Produtos (comprados)
- ✅ Dashboard do Vendedor
- ✅ Gerenciar produtos (criar/editar/excluir)
- ✅ Upload de imagens
- ✅ Dashboard Administrativo completo
- ✅ Gerenciamento de comissões
- ✅ Loja de Apps educacionais
- ✅ Publicação de apps (admin only)
- ✅ Sistema de gamificação visível
- ✅ Upgrade Comprador → Produtor

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js >= 18.0.0
- PostgreSQL >= 14
- npm >= 9.0.0

### 1. Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/educaplayja.git
cd educaplayja

# Instale dependências do backend
cd backend
npm install

# Instale dependências do frontend
cd ../frontend
npm install
```

### 2. Configure o Banco de Dados

```bash
cd backend

# Rode as migrations
npx prisma migrate dev

# (Opcional) Popule com dados de teste
npm run db:seed
```

### 3. Configure as Variáveis de Ambiente

Crie `backend/.env` baseado no `backend/.env.example` com suas credenciais.

### 4. Inicie os Servidores

**Opção 1: Script automático (Windows)**
```bash
# Na raiz do projeto
START_SERVERS.bat
```

**Opção 2: Manualmente**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Acesse

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health Check: http://localhost:3000/api/v1/health

---

## 🌐 Deploy em Produção

**Guias completos de deploy:**
- 📘 [DEPLOY.md](DEPLOY.md) - Passo a passo detalhado
- ✅ [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md) - Checklist rápido

**Stack de Deploy:**
- **Backend:** Render.com (gratuito)
- **Frontend:** Render.com (gratuito)
- **Banco:** PostgreSQL no Render (gratuito)

---

## 📦 Tecnologias Utilizadas

### Backend
- **Runtime:** Node.js + Express
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT + Google OAuth 2.0
- **Payments:** Mercado Pago SDK
- **Storage:** Cloudinary
- **Email:** Nodemailer (Gmail SMTP)
- **Logging:** Winston + Daily Rotate File
- **Security:** Helmet, CORS, Rate Limiting, bcrypt

### Frontend
- **Framework:** React 18 + Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **State:** Zustand
- **Icons:** React Icons
- **Notifications:** React Toastify

---

## 📁 Estrutura do Projeto

```
educaplayja/
├── backend/                 # API REST
│   ├── prisma/             # Schema e migrations
│   ├── src/
│   │   ├── api/            # Rotas e controllers
│   │   ├── config/         # Configurações
│   │   ├── middleware/     # Auth, rate limit
│   │   ├── repositories/   # Acesso a dados
│   │   └── services/       # Lógica de negócio
│   └── scripts/            # Scripts auxiliares
│
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/    # Componentes
│   │   ├── pages/         # Páginas
│   │   ├── lib/           # Utilitários
│   │   └── store/         # Estado global
│   └── public/
│
├── DEPLOY.md              # Guia de deploy
├── DEPLOY_CHECKLIST.md    # Checklist de deploy
└── START_SERVERS.bat      # Inicialização rápida
```

---

## 💼 Funcionalidades por Perfil

### 👤 Usuários (Compradores)
- Navegação no marketplace
- Compra de produtos via Mercado Pago
- Acesso aos produtos comprados
- Sistema de XP e níveis
- Upgrade para Produtor

### 🏪 Produtores (Vendedores)
- Dashboard financeiro
- Publicar e editar produtos
- Upload de imagens (Cloudinary)
- Receber 97% das vendas
- Visualizar comissões

### 🛡️ Administradores
- Dashboard com estatísticas completas
- Gerenciar usuários
- Gerenciar produtos
- Ver todos os pedidos
- Controlar comissões (3%)
- Publicar apps na loja

---

## 🎮 Sistema de Gamificação

### Níveis
- **Iniciante:** 0-99 XP
- **Estudante:** 100-299 XP
- **Entusiasta:** 300-599 XP
- **Expert:** 600-999 XP
- **Mestre:** 1000+ XP

### Como Ganhar XP
- ✅ Completar perfil: 50 XP
- ✅ Primeira compra: 100 XP
- ✅ Comprar curso: 20 XP
- ✅ Deixar avaliação: 10 XP
- ✅ Indicar amigo: 50 XP

---

## 💰 Sistema de Comissões

- **Plataforma:** 3% de cada venda
- **Vendedor:** 97% de cada venda

**Fluxo de Comissão:**
1. Cliente compra produto (R$ 100)
2. Mercado Pago processa pagamento
3. Webhook notifica aprovação
4. Sistema cria comissões:
   - Plataforma: R$ 3,00 (3%)
   - Vendedor: R$ 97,00 (97%)
5. Status atualizado: PENDING → PAID

---

## 🔒 Segurança

- ✅ Senhas criptografadas (bcrypt, 10 rounds)
- ✅ JWT com Refresh Tokens
- ✅ Rate Limiting (100 req/15min)
- ✅ Helmet.js (headers de segurança)
- ✅ CORS configurado
- ✅ Validação de inputs (Joi)
- ✅ SQL Injection prevention (Prisma)
- ✅ XSS protection

---

## 📱 Loja de Apps

Marketplace de aplicativos educacionais:

- **Categorias:** Matemática, Português, Ciências, Geografia, etc.
- **Recursos:** Upload de ícone, screenshots, descrição
- **Filtros:** Busca e filtro por categoria
- **Permissão:** Apenas administradores podem publicar

---

## 📞 Suporte

- **Email:** contato@educaplayja.com.br
- **Suporte:** suporte@educaplayja.com.br

---

## 📄 Licença

MIT License

---

**Versão:** 1.5.0
**Status:** ✅ Produção
**Última atualização:** Dezembro 2024
