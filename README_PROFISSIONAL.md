# EDUPLAY - Professional Marketplace Platform

## Status do Projeto

**Versão:** 1.0.0
**Status:** Em Produção
**Última Atualização:** 22 de Janeiro de 2025

### URLs de Produção

- **Frontend:** https://eduplay-frontend.onrender.com
- **Backend API:** https://eduplay-platform.onrender.com/api/v1
- **Health Check:** https://eduplay-platform.onrender.com/api/v1/health

---

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                         RENDER.COM                           │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + Vite)                                     │
│  URL: https://eduplay-frontend.onrender.com                  │
├─────────────────────────────────────────────────────────────┤
│  Backend (Node.js + Express)                                 │
│  URL: https://eduplay-platform.onrender.com                  │
├─────────────────────────────────────────────────────────────┤
│  Database (PostgreSQL)                                       │
│  ORM: Prisma                                                 │
└─────────────────────────────────────────────────────────────┘

Serviços Externos:
├── Cloudinary (Upload de imagens/arquivos)
├── SendGrid (Envio de emails)
├── Mercado Pago (Pagamentos)
└── Google OAuth (Autenticação social)
```

---

## Estrutura do Backend

```
backend/
├── src/
│   ├── api/
│   │   ├── controllers/     # Controladores HTTP
│   │   ├── middlewares/     # Middlewares (auth, rate limit, etc)
│   │   ├── routes/          # Rotas da API
│   │   └── validators/      # Validação de entrada
│   ├── config/
│   │   ├── database.js      # Configuração Prisma
│   │   ├── email.js         # Configuração SendGrid
│   │   ├── cloudinary.js    # Configuração Cloudinary
│   │   ├── passport.js      # Google OAuth
│   │   └── env.js           # Variáveis de ambiente
│   ├── services/            # Lógica de negócio
│   ├── utils/               # Utilitários (logger, errors, etc)
│   └── app.js               # Configuração Express
├── prisma/
│   └── schema.prisma        # Schema do banco de dados
├── scripts/                 # Scripts utilitários
└── server.js                # Entry point
```

---

## Funcionalidades Implementadas

### Sistema de Email (SendGrid)

- Notificação ao admin quando produto é criado (aguardando aprovação)
- Notificação ao produtor quando produto é aprovado/rejeitado
- Emails de boas-vindas, recuperação de senha, etc.

**Importante:** Render bloqueia portas SMTP. Usar apenas APIs HTTP (SendGrid, Resend).

### Upload de Arquivos (Cloudinary)

- Upload direto do frontend usando preset não assinado
- Preset: `eduplay_apps`
- Suporta imagens e vídeos

### Autenticação

- JWT com access token e refresh token
- Google OAuth
- Role-based access control (USER, PRODUCER, ADMIN)

### Sistema de Produtos

- CRUD completo de produtos
- Fluxo de aprovação (PENDING → APPROVED/REJECTED)
- Categorias e tags
- Preço e arquivos para download

### Sistema de Pedidos

- Integração com Mercado Pago
- Webhooks para atualização de status
- Comissões automáticas para produtores

---

## Variáveis de Ambiente (Produção)

```env
# Database
DATABASE_URL=postgresql://user:pass@host/db

# JWT
JWT_SECRET=xxx
JWT_REFRESH_SECRET=xxx

# Email (SendGrid - OBRIGATÓRIO)
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

---

## Endpoints da API

### Autenticação
- `POST /api/v1/auth/register` - Registro de usuário
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/google` - Login com Google

### Produtos
- `GET /api/v1/products` - Listar produtos
- `GET /api/v1/products/:id` - Detalhes do produto
- `POST /api/v1/products` - Criar produto (Producer)
- `PUT /api/v1/products/:id` - Atualizar produto
- `DELETE /api/v1/products/:id` - Deletar produto

### Admin
- `GET /api/v1/admin/products/pending` - Produtos pendentes
- `PUT /api/v1/admin/products/:id/approve` - Aprovar produto
- `PUT /api/v1/admin/products/:id/reject` - Rejeitar produto

### Diagnóstico
- `GET /api/v1/health` - Health check
- `GET /api/v1/email-status` - Status do serviço de email

---

## Comandos Úteis

### Desenvolvimento Local
```bash
cd backend
npm install
npm run dev
```

### Prisma
```bash
npx prisma generate      # Gerar cliente
npx prisma migrate dev   # Criar migration
npx prisma studio        # Interface visual
```

### Build para Produção
```bash
npm run build
npm start
```

---

## Troubleshooting

### Emails não são enviados no Render
- **Problema:** Render bloqueia portas SMTP (587, 465)
- **Solução:** Usar SendGrid API com `SENDGRID_API_KEY`

### Upload de imagens não funciona
- **Problema:** Preset do Cloudinary não configurado
- **Solução:** Criar preset `eduplay_apps` como unsigned no Cloudinary

### Erro de conexão com banco de dados
- **Problema:** DATABASE_URL incorreta
- **Solução:** Verificar credenciais e host do PostgreSQL

### Google OAuth não funciona
- **Problema:** Callback URL incorreta
- **Solução:** GOOGLE_CALLBACK_URL deve apontar para `eduplay-platform.onrender.com`

---

## Changelog

Veja [CHANGELOG_JAN_2025.md](./CHANGELOG_JAN_2025.md) para histórico completo de alterações.

---

## Documentação Adicional

- [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) - Instruções de configuração
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Documentação completa da API
- [CHANGELOG_JAN_2025.md](./CHANGELOG_JAN_2025.md) - Changelog detalhado

---

**Mantido por:** Claude Code Assistant
**Última Atualização:** 22 de Janeiro de 2025
