# 📡 Documentação da API - EDUPLAY

Base URL: `http://localhost:3000/api`

---

## 🔐 Autenticação

Todas as rotas protegidas requerem header:
```
Authorization: Bearer {TOKEN}
```

### POST `/auth/register`
Criar nova conta

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "role": "BUYER" | "PRODUCER"
}
```

**Response:**
```json
{
  "message": "Usuário criado com sucesso",
  "user": { "id": "...", "name": "...", "email": "...", "role": "...", "status": "..." },
  "token": "eyJhbGc..."
}
```

### POST `/auth/login`
Fazer login

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "message": "Login realizado com sucesso",
  "user": { ... },
  "token": "eyJhbGc..."
}
```

### GET `/auth/me` 🔒
Obter usuário logado

**Response:**
```json
{
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "...",
    "status": "...",
    "producerData": { ... }
  }
}
```

---

## 📦 Produtos

### GET `/products`
Listar produtos aprovados

**Query Params:**
- `page` - Número da página (default: 1)
- `limit` - Itens por página (default: 12)
- `search` - Buscar por título/descrição

**Response:**
```json
{
  "products": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 50,
    "pages": 5
  }
}
```

### GET `/products/:id`
Obter produto por ID

**Response:**
```json
{
  "product": {
    "id": "...",
    "title": "Curso de React",
    "description": "...",
    "price": 99.90,
    "thumbnail": "https://...",
    "producer": { "id": "...", "name": "..." },
    "files": [ ... ],
    "_count": { "orders": 10 }
  }
}
```

### POST `/products` 🔒 (Producer)
Criar produto

**Body:**
```json
{
  "title": "Curso Completo de React",
  "description": "Aprenda React do zero",
  "price": 99.90
}
```

### PUT `/products/:id` 🔒 (Producer/Admin)
Atualizar produto

**Body:**
```json
{
  "title": "Novo título",
  "description": "Nova descrição",
  "price": 149.90,
  "status": "PENDING" | "APPROVED"
}
```

### DELETE `/products/:id` 🔒 (Producer/Admin)
Deletar produto

### POST `/products/:id/thumbnail` 🔒 (Producer/Admin)
Upload de thumbnail

**Body:** FormData
```
thumbnail: File
```

### POST `/products/:id/files` 🔒 (Producer/Admin)
Upload de arquivos do produto

**Body:** FormData
```
files: File[]
```

### GET `/products/my/products` 🔒 (Producer)
Listar meus produtos

---

## 🛒 Pedidos

### POST `/orders/create` 🔒
Criar pedido e preferência Mercado Pago

**Body:**
```json
{
  "productId": "uuid",
  "payerInfo": {
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```

**Response:**
```json
{
  "message": "Pedido criado com sucesso",
  "order": { ... },
  "preferenceId": "123456789-...",
  "initPoint": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=..."
}
```

### POST `/orders/webhook` (Public)
Webhook do Mercado Pago

**Body:** (enviado pelo Mercado Pago)
```json
{
  "type": "payment",
  "data": { "id": "123456789" }
}
```

### GET `/orders/my-purchases` 🔒 (Buyer)
Listar minhas compras

**Response:**
```json
{
  "purchases": [
    {
      "id": "...",
      "amount": 99.90,
      "createdAt": "...",
      "product": {
        "title": "...",
        "files": [ ... ]
      }
    }
  ]
}
```

### GET `/orders/my-sales` 🔒 (Producer)
Listar minhas vendas

**Response:**
```json
{
  "sales": [ ... ],
  "stats": {
    "totalSales": 50,
    "totalRevenue": 4995.00,
    "totalCommission": 4495.50
  }
}
```

### GET `/orders/:id` 🔒
Obter pedido por ID

---

## 🎁 Order Bumps

Sistema de ofertas complementares no checkout para aumentar ticket médio.

### GET `/order-bumps/suggestions` (Public)
Buscar sugestões de Order Bump para o checkout

**Query Params:**
- `productIds` - IDs dos produtos no carrinho (separados por vírgula)
- `category` - Categoria do produto principal

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "productId": "uuid",
      "title": "Adicione com 20% OFF!",
      "description": "Complemento perfeito para sua compra",
      "discountPercent": 20,
      "triggerType": "ANY",
      "product": {
        "id": "uuid",
        "title": "Curso Extra",
        "price": 50.00,
        "thumbnailUrl": "https://..."
      }
    }
  ]
}
```

### POST `/order-bumps/:id/track` (Public)
Registrar evento de analytics (impressão ou clique)

**Body:**
```json
{
  "event": "impression" | "click" | "conversion"
}
```

**Response:**
```json
{
  "success": true
}
```

### GET `/order-bumps/producer/my-bumps` 🔒 (Producer)
Listar Order Bumps do produtor logado

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Oferta Especial",
      "description": "...",
      "discountPercent": 20,
      "isActive": true,
      "impressions": 150,
      "clicks": 30,
      "conversions": 10,
      "product": { ... }
    }
  ]
}
```

### POST `/order-bumps` 🔒 (Producer)
Criar novo Order Bump

**Body:**
```json
{
  "productId": "uuid",
  "title": "Adicione com 20% OFF!",
  "description": "Aproveite esta oferta exclusiva",
  "discountPercent": 20,
  "triggerType": "ANY",
  "triggerValues": [],
  "priority": 1,
  "isActive": true
}
```

**Trigger Types:**
- `ANY` - Aparece em qualquer checkout
- `CATEGORY` - Aparece quando produto é da categoria especificada
- `PRODUCT` - Aparece quando produto específico está no carrinho

### PUT `/order-bumps/:id` 🔒 (Producer)
Atualizar Order Bump

**Body:** (campos opcionais)
```json
{
  "title": "Novo título",
  "description": "Nova descrição",
  "discountPercent": 15,
  "isActive": false
}
```

### DELETE `/order-bumps/:id` 🔒 (Producer)
Deletar Order Bump

---

## 👑 Admin

### GET `/admin/dashboard` 🔒 (Admin)
Estatísticas gerais

**Response:**
```json
{
  "stats": {
    "totalUsers": 100,
    "totalProducts": 50,
    "totalOrders": 200,
    "totalRevenue": 1000.00,
    "pendingProducers": 5,
    "pendingProducts": 3
  },
  "recentOrders": [ ... ]
}
```

### GET `/admin/users` 🔒 (Admin)
Listar usuários

**Query Params:**
- `role` - ADMIN | PRODUCER | BUYER
- `status` - PENDING | APPROVED | REJECTED | SUSPENDED
- `page` - Número da página
- `limit` - Itens por página

### PUT `/admin/users/:id/approve` 🔒 (Admin)
Aprovar produtor

### PUT `/admin/users/:id/reject` 🔒 (Admin)
Rejeitar produtor

### PUT `/admin/users/:id/suspend` 🔒 (Admin)
Suspender usuário

### GET `/admin/products/pending` 🔒 (Admin)
Listar produtos pendentes

### PUT `/admin/products/:id/approve` 🔒 (Admin)
Aprovar produto

### PUT `/admin/products/:id/reject` 🔒 (Admin)
Rejeitar produto

**Body:**
```json
{
  "reason": "Motivo da rejeição (opcional)"
}
```

### GET `/admin/orders` 🔒 (Admin)
Listar todos os pedidos

**Query Params:**
- `status` - PENDING | APPROVED | REJECTED
- `page` - Número da página
- `limit` - Itens por página

---

## 🏥 Health Check

### GET `/health`
Verificar status da API

**Response:**
```json
{
  "status": "ok",
  "message": "EDUPLAY API is running"
}
```

---

## 📋 Enums

### UserRole
- `ADMIN` - Administrador
- `PRODUCER` - Produtor de conteúdo
- `BUYER` - Comprador

### UserStatus
- `PENDING` - Aguardando aprovação
- `APPROVED` - Aprovado
- `REJECTED` - Rejeitado
- `SUSPENDED` - Suspenso

### ProductStatus
- `DRAFT` - Rascunho
- `PENDING` - Aguardando aprovação
- `APPROVED` - Aprovado
- `REJECTED` - Rejeitado

### PaymentStatus
- `PENDING` - Pagamento pendente
- `APPROVED` - Pagamento aprovado
- `REJECTED` - Pagamento rejeitado
- `REFUNDED` - Pagamento reembolsado

### OrderStatus
- `PENDING` - Pedido pendente
- `COMPLETED` - Pedido completo
- `CANCELLED` - Pedido cancelado

---

## ⚠️ Códigos de Erro

- `200` - OK
- `201` - Created
- `400` - Bad Request (dados inválidos)
- `401` - Unauthorized (não autenticado)
- `403` - Forbidden (sem permissão)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🧪 Exemplos com cURL

### Registrar usuário:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "senha123",
    "role": "BUYER"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "senha123"
  }'
```

### Listar produtos:
```bash
curl http://localhost:3000/api/products
```

### Criar produto (com autenticação):
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "title": "Curso de React",
    "description": "Aprenda React",
    "price": 99.90
  }'
```

---

## 🔒 Permissões de Rotas

| Rota | Public | Buyer | Producer | Admin |
|------|--------|-------|----------|-------|
| `/auth/*` | ✅ | ✅ | ✅ | ✅ |
| `/products` (GET) | ✅ | ✅ | ✅ | ✅ |
| `/products` (POST) | ❌ | ❌ | ✅ | ✅ |
| `/orders/create` | ❌ | ✅ | ✅ | ✅ |
| `/orders/my-purchases` | ❌ | ✅ | ❌ | ✅ |
| `/orders/my-sales` | ❌ | ❌ | ✅ | ✅ |
| `/order-bumps/suggestions` | ✅ | ✅ | ✅ | ✅ |
| `/order-bumps/:id/track` | ✅ | ✅ | ✅ | ✅ |
| `/order-bumps/producer/*` | ❌ | ❌ | ✅ | ✅ |
| `/order-bumps` (POST/PUT/DELETE) | ❌ | ❌ | ✅ | ✅ |
| `/admin/*` | ❌ | ❌ | ❌ | ✅ |

---

**Para mais detalhes, consulte o código fonte em `backend/src/routes/`**
