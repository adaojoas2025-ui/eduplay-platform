# Deploy EduplayJA no Render.com

## URLs de Produção

- **Frontend:** https://eduplay-frontend.onrender.com
- **Backend:** https://eduplay-platform.onrender.com
- **API Base:** https://eduplay-platform.onrender.com/api/v1

---

## Variáveis de Ambiente

### Backend (eduplay-platform)

```env
# Database
DATABASE_URL=postgresql://eduplay_user:9ob3x50jpR1C1Teaa2K7htpdk72wcTGB@dpg-d5jtmvvgi27c73e2uqqg-a.oregon-postgres.render.com/eduplay_db_yhu2

# JWT
JWT_SECRET=sua_chave_secreta_muito_longa_32_caracteres_minimo
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=outra_chave_secreta_muito_longa_32_caracteres
JWT_REFRESH_EXPIRES_IN=30d

# Mercado Pago
MP_ACCESS_TOKEN=seu_access_token_mercadopago
MP_PUBLIC_KEY=sua_public_key_mercadopago

# Cloudinary (Upload de Imagens)
CLOUDINARY_CLOUD_NAME=dexlzykqm
CLOUDINARY_API_KEY=761719984596219
CLOUDINARY_API_SECRET=QkAyuumJD-_EslezBPd2UQVYKew

# URLs
FRONTEND_URL=https://eduplay-frontend.onrender.com
BACKEND_URL=https://eduplay-platform.onrender.com

# Platform
PLATFORM_FEE_PERCENT=10
PLATFORM_NAME=EducaplayJA

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app
EMAIL_FROM=EducaplayJA <noreply@educaplayja.com.br>
```

### Frontend (eduplay-frontend)

```env
VITE_API_URL=https://eduplay-platform.onrender.com/api/v1
VITE_CLOUDINARY_CLOUD_NAME=dexlzykqm
VITE_CLOUDINARY_UPLOAD_PRESET=eduplay_apps
```

---

## Usuários de Teste

| Papel | Email | Senha |
|-------|-------|-------|
| Admin | ja.eduplay@gmail.com | Asa122448@ |
| Produtor | adao1980aguiar@gmail.com | Asa122448@ |
| Comprador | comprador@teste.com | Teste123@ |

---

## Correções Aplicadas

### 1. Schema Prisma - Relações
**Arquivo:** `backend/prisma/schema.prisma`

Corrigido nomes das relações:
- `products.users` → `products.producer`
- `orders.users` → `orders.buyer`
- `orders.products` → `orders.product`

### 2. UUID Generation
**Arquivos:**
- `backend/src/services/product.service.js`
- `backend/src/services/order.service.js`

Adicionado `crypto.randomUUID()` para gerar IDs automáticos.

### 3. Combo Repository
**Arquivo:** `backend/src/repositories/combo.repository.js`

Corrigido nome da relação:
- `products` → `combo_products` (para corresponder ao schema)

### 4. CORS
**Arquivo:** `backend/src/app.js`

Adicionado suporte para origens `.vercel.app` e `.onrender.com`.

### 5. Frontend API URL
**Arquivo:** `frontend/render.yaml`

Corrigido URL do backend de `eduplay-backend-2f0c` para `eduplay-platform`.

---

## Endpoints Principais

### Autenticação
```
POST /api/v1/auth/register     - Criar conta
POST /api/v1/auth/login        - Login
POST /api/v1/auth/refresh      - Renovar token
```

### Produtos
```
GET  /api/v1/products          - Listar produtos publicados
GET  /api/v1/products/:id      - Detalhes do produto
POST /api/v1/products          - Criar produto (PRODUCER)
```

### Pedidos
```
GET  /api/v1/orders            - Listar pedidos do usuário
POST /api/v1/orders            - Criar pedido (compra)
```

### Admin
```
GET  /api/v1/admin/products    - Produtos pendentes
POST /api/v1/admin/products/:id/approve - Aprovar produto
```

### Teste (Desenvolvimento)
```
POST /api/v1/test/approve-payment/:orderId - Simular pagamento aprovado
POST /api/v1/test/make-admin               - Promover usuário a admin
POST /api/v1/test/publish-product/:id      - Publicar produto direto
POST /api/v1/temp-upgrade                  - Upgrade para PRODUCER/ADMIN
```

---

## Fluxo de Teste Completo

### 1. Criar Produtor
```bash
curl -X POST https://eduplay-platform.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Produtor","email":"produtor@teste.com","password":"Teste123@"}'
```

### 2. Upgrade para Producer
```bash
curl -X POST https://eduplay-platform.onrender.com/api/v1/temp-upgrade \
  -H "Content-Type: application/json" \
  -d '{"email":"produtor@teste.com","role":"PRODUCER"}'
```

### 3. Criar Produto
```bash
curl -X POST https://eduplay-platform.onrender.com/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DO_PRODUTOR" \
  -d '{
    "title":"Meu Curso",
    "description":"Descrição do curso",
    "price":97,
    "category":"PROGRAMMING"
  }'
```

### 4. Aprovar Produto (Admin)
```bash
curl -X POST https://eduplay-platform.onrender.com/api/v1/admin/products/PRODUCT_ID/approve \
  -H "Authorization: Bearer TOKEN_DO_ADMIN"
```

### 5. Criar Comprador e Comprar
```bash
# Registrar comprador
curl -X POST https://eduplay-platform.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Comprador","email":"comprador2@teste.com","password":"Teste123@"}'

# Criar pedido
curl -X POST https://eduplay-platform.onrender.com/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DO_COMPRADOR" \
  -d '{"productId":"PRODUCT_ID"}'
```

### 6. Simular Pagamento Aprovado
```bash
curl -X POST https://eduplay-platform.onrender.com/api/v1/test/approve-payment/ORDER_ID \
  -H "Authorization: Bearer TOKEN_DO_COMPRADOR"
```

---

## Troubleshooting

### Erro: "Email already registered"
O email já está cadastrado. Use outro email ou faça login.

### Erro 500 no /combos
Verificar se o deploy com a correção do `combo_products` foi concluído.

### Erro CORS
Verificar se `FRONTEND_URL` está correto nas variáveis do backend.

### Upload de imagem falha
Verificar credenciais do Cloudinary nas variáveis de ambiente.

### Token inválido
O token expira em 7 dias. Faça login novamente ou use o refresh token.

---

## Commits Recentes

- `ddf9ac1` - fix: Correct frontend API URL in render.yaml and add Vercel CORS
- `ede5f57` - fix: Fix order schema relations and add UUID generation
- `72684b0` - fix: Allow role parameter in temp-upgrade endpoint
- `a24b893` - fix: Corrigir nome da relação combo_products no repository

---

## Histórico de Problemas Resolvidos

### Problema: Upload de imagem retornando 404
**Causa:** Frontend estava apontando para `eduplay-backend` (serviço incorreto) ao invés de `eduplay-platform`.

**Solução:**
1. Alterar `VITE_API_URL` no Render Dashboard do `eduplay-frontend` para:
   ```
   https://eduplay-platform.onrender.com/api/v1
   ```

### Problema: Erro 500 no endpoint /combos
**Causa:** Nome da relação no repository não correspondia ao schema Prisma.

**Solução:** Em `backend/src/repositories/combo.repository.js`, alterar:
```javascript
// De:
products: { create: ... }

// Para:
combo_products: { create: ... }
```

### Problema: CORS bloqueando requisições
**Causa:** Origens do Vercel e Render não estavam na lista de permitidos.

**Solução:** Em `backend/src/app.js`, adicionar origens:
```javascript
const allowedOrigins = [
  // ... outras origens
  /\.vercel\.app$/,
  /\.onrender\.com$/
];
```

---

## Serviços no Render

| Serviço | Tipo | URL |
|---------|------|-----|
| eduplay-frontend | Static Site | https://eduplay-frontend.onrender.com |
| eduplay-platform | Web Service | https://eduplay-platform.onrender.com |
| eduplay_db_yhu2 | PostgreSQL | (internal) |

**IMPORTANTE:** Existe um serviço `eduplay-backend` no Render que NÃO é o correto. Use sempre `eduplay-platform`.

---

*Última atualização: 2026-01-20*
