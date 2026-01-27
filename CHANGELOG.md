# CHANGELOG - EDUPLAYJA Platform

## [2026-01-22] - Correções do Sistema de Pagamento e Comissões

### Problema
O checkout apresentava erro 500 (Internal Server Error) ao clicar em "Pagar Agora - Aprovação Instantânea". O pagamento era processado corretamente, mas o usuário recebia erro.

### Causa Raiz
Incompatibilidade entre os nomes usados no código e os nomes definidos no schema Prisma:

1. **Modelo Prisma incorreto**: O código usava `prisma.commission` (singular), mas o schema define `commissions` (plural)
2. **Relações incorretas**: O código usava `order` e `producer` nos includes, mas o schema define `orders` e `users`
3. **Campo ID ausente**: A criação de comissão não incluía o campo `id` obrigatório

### Arquivos Corrigidos

#### 1. `backend/src/repositories/commission.repository.js`
- Alterado `prisma.commission` para `prisma.commissions` em todas as funções
- Corrigido `include: { order: ... }` para `include: { orders: ... }`
- Corrigido `include: { producer: ... }` para `include: { users: ... }`
- Renomeado variável `order` para `sortOrder` em `listCommissions()` para evitar conflito
- Simplificado `createCommission()` removendo includes desnecessários que causavam erro

#### 2. `backend/src/services/order.service.js`
- Adicionado `const crypto = require('crypto')` no topo
- Adicionado `id: crypto.randomUUID()` na criação de comissão

#### 3. `backend/src/services/paymentService.js`
- Adicionado `const crypto = require('crypto')` no topo
- Adicionado `id: crypto.randomUUID()` na criação de comissão

#### 4. `backend/src/repositories/user.repository.js`
- Alterado `prisma.commission` para `prisma.commissions` em `getProducerStats()`

#### 5. `backend/scripts/*.js`
- Corrigido referências de `prisma.commission` para `prisma.commissions` em scripts de manutenção

### Commits Relacionados
- `fix: Correct Prisma model name from commission to commissions`
- `fix: Add missing id field when creating commission records`
- `fix: Use correct Prisma relation names in commission.repository.js`
- `fix: Simplify createCommission to avoid nested include errors`

### Schema Prisma de Referência
```prisma
model commissions {
  id            String           @id
  orderId       String           @unique
  producerId    String
  amount        Float
  status        CommissionStatus @default(PENDING)
  transferId    String?
  paidAt        DateTime?
  processingAt  DateTime?
  failureReason String?
  failedAt      DateTime?
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  orders        orders           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  users         users            @relation(fields: [producerId], references: [id])

  @@index([producerId])
  @@index([status])
}
```

### Convenção de Nomes Prisma
| Tabela/Modelo | Relação para Orders | Relação para Users |
|---------------|---------------------|-------------------|
| commissions   | orders              | users             |
| orders        | buyer, product      | -                 |
| products      | producer            | -                 |

### Verificação Pós-Correção
- [x] Checkout funciona sem erro 500
- [x] Comissões são criadas corretamente
- [x] Pedidos são processados
- [x] Deploy no Render bem-sucedido

---

## [2026-01-27] - Sistema Order Bump Completo

### Objetivo
Implementar recurso de "Order Bump" (similar ao Checkout Sun da Eduzz) para aumentar ticket médio em até 50%.

### Status
**IMPLEMENTADO E TESTADO** - Frontend + Backend funcionando

---

### O que é Order Bump?
Order Bump é uma técnica de vendas onde produtos complementares são oferecidos durante o checkout, permitindo que o cliente adicione itens extras com um clique antes de finalizar a compra.

---

### Arquivos Criados/Modificados

#### Frontend - Novos
| Arquivo | Descrição |
|---------|-----------|
| `frontend/src/components/OrderBumpSuggestion.jsx` | Componente que exibe sugestões no checkout |
| `frontend/src/pages/producer/OrderBumps.jsx` | Dashboard de gerenciamento para produtores |

#### Frontend - Modificados
| Arquivo | Alteração |
|---------|-----------|
| `frontend/src/pages/Checkout.jsx` | Integração do componente OrderBumpSuggestion |
| `frontend/src/App.jsx` | Rota `/producer/order-bumps` adicionada |
| `frontend/src/components/Navbar.jsx` | Link "🎁 Order Bumps" no menu do usuário |

#### Backend - Modificados
| Arquivo | Alteração |
|---------|-----------|
| `backend/src/api/services/order-bump.service.js` | Fix: triggerType 'ANY' sempre incluído no filtro |

---

### Funcionalidades

#### 1. Componente OrderBumpSuggestion (Checkout)
- Busca sugestões via `GET /order-bumps/suggestions`
- Exibe produtos complementares com desconto
- Permite adicionar/remover com um clique
- Rastreia impressões e cliques automaticamente
- Atualiza total do carrinho em tempo real

#### 2. Dashboard do Produtor (`/#/producer/order-bumps`)
- **CRUD completo**: Criar, editar, excluir Order Bumps
- **Analytics em tempo real**:
  - Total de impressões
  - Total de cliques
  - Total de conversões
  - Taxa de conversão (%)
- **Configurações por bump**:
  - Produto a oferecer
  - Título persuasivo
  - Descrição da oferta
  - Desconto percentual (0-100%)
  - Prioridade (maior aparece primeiro)
  - Ativo/Inativo

#### 3. Tipos de Trigger (quando exibir)
| Tipo | Comportamento |
|------|---------------|
| `ANY` | Aparece em qualquer checkout |
| `CATEGORY` | Aparece quando produto do carrinho é da mesma categoria |
| `PRODUCT` | Aparece quando produto específico está no carrinho |

---

### Endpoints da API

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/order-bumps/suggestions` | Busca sugestões para checkout | Público |
| POST | `/order-bumps/:id/track` | Registra impressão/clique | Público |
| GET | `/order-bumps/producer/my-bumps` | Lista bumps do produtor | PRODUCER |
| POST | `/order-bumps` | Cria novo bump | PRODUCER |
| PUT | `/order-bumps/:id` | Atualiza bump | PRODUCER |
| DELETE | `/order-bumps/:id` | Remove bump | PRODUCER |

---

### Bugs Corrigidos

#### 1. triggerType 'ANY' não aparecia
**Problema**: Order Bumps com `triggerType: 'ANY'` não apareciam quando `productIds` era enviado sem `category`.

**Causa**: O filtro OR só incluía 'ANY' quando category existia.

**Correção** (`order-bump.service.js`):
```javascript
// ANTES - Bug
if (category) {
  where.OR = [{ triggerType: 'ANY' }, ...];
}

// DEPOIS - Corrigido
const orConditions = [{ triggerType: 'ANY' }]; // SEMPRE inclui
if (category) { orConditions.push(...); }
where.OR = orConditions;
```

#### 2. Produtos não carregavam no formulário
**Problema**: Dropdown de produtos vazio ao criar Order Bump.

**Causa**: Endpoint `/products/my-products` não existia no backend.

**Correção** (`OrderBumps.jsx`):
```javascript
// ANTES
const response = await productAPI.getMyProducts();

// DEPOIS
const response = await api.get('/seller/products');
```

#### 3. Link Order Bumps não existia no menu
**Problema**: Usuário não conseguia acessar a página de Order Bumps.

**Correção**: Adicionado link "🎁 Order Bumps" no Navbar para PRODUCER e ADMIN.

---

### Como Usar

#### Para Produtores
1. Acesse `/#/producer/order-bumps` (ou clique no menu > Order Bumps)
2. Clique em "Novo Order Bump"
3. Selecione um dos seus produtos publicados
4. Configure título, descrição e desconto
5. Salve e o bump aparecerá nos checkouts

#### Para Compradores
1. Adicione um produto ao carrinho
2. Vá para o checkout
3. Veja as sugestões de Order Bump (caixa laranja)
4. Clique "Adicionar" para incluir na compra
5. Finalize o pagamento

---

### Schema Prisma

```prisma
model order_bumps {
  id              String   @id
  productId       String
  title           String
  description     String
  discountPercent Float    @default(0)
  triggerType     String   @default("CATEGORY")
  triggerValues   String[] @default([])
  producerId      String
  isActive        Boolean  @default(true)
  priority        Int      @default(0)
  impressions     Int      @default(0)
  clicks          Int      @default(0)
  conversions     Int      @default(0)
  revenue         Float    @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  products        products @relation(fields: [productId], references: [id])
  users           users    @relation(fields: [producerId], references: [id])
}
```

---

### Commits Relacionados
- `feat: Implement Order Bump frontend`
- `feat: Add Order Bumps link to producer menu`
- `fix: Always include triggerType ANY in order bump suggestions`
- `fix: Use correct endpoint for fetching seller products in OrderBumps`

---

## Convenções do Projeto

### Prisma
- Modelos usam **plural** (users, orders, products, commissions)
- Relações são nomeadas conforme o modelo relacionado
- Sempre incluir `id` ao criar registros manualmente

### Código
- Usar `crypto.randomUUID()` para gerar IDs
- Usar `logger` ao invés de `console.log`
- Usar `ApiError` para erros padronizados
- Sempre usar try-catch em operações async

### Deploy
- Render faz deploy automático ao push no GitHub
- Verificar se o commit correto está em produção pelos logs
- Se cache estiver desatualizado, fazer commit vazio para forçar redeploy

---

## [2026-01-22] - Limpeza do Banco de Dados de Produção

### Como Limpar o Banco de Produção no Render (Plano Gratuito)

1. Adicionar em `backend/src/app.js` (antes de `app.use('/api/v1', routes)`):

```javascript
app.get('/api/v1/run-cleanup-now', async (req, res) => {
  const { prisma } = require('./config/database');
  try {
    const admin = await prisma.users.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) return res.status(400).json({ error: 'Admin not found' });

    await prisma.reviews.deleteMany({});
    await prisma.cart_items.deleteMany({});
    await prisma.order_bumps.deleteMany({});
    await prisma.products.deleteMany({});
    await prisma.users.deleteMany({ where: { id: { not: admin.id } } });

    res.json({ success: true, message: 'Limpeza concluida', admin: admin.email });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
```

2. Fazer push e aguardar deploy (2-3 min):
```bash
git add -A && git commit -m "feat: Add cleanup endpoint" && git push origin main
```

3. Acessar no navegador: `https://eduplay-platform.onrender.com/api/v1/run-cleanup-now`

4. Remover endpoint e fazer push novamente:
```bash
git add -A && git commit -m "chore: Remove cleanup endpoint" && git push origin main
```

---

## [2026-01-23] - Correção do SPA Routing no Render

### Problema
Ao clicar em "Tornar-se Vendedor" ou acessar rotas como `/seller/dashboard` diretamente, o Render retornava "Not Found" (404).

### Causa
O Render Static Site não estava fazendo rewrite das rotas para `index.html`. Mesmo com `_redirects` e `render.yaml` configurados, o servidor retornava 404 para rotas que não existiam como arquivos.

### Solução
Mudança de `BrowserRouter` para `HashRouter` no React Router.

#### Arquivo: `frontend/src/main.jsx`
```javascript
// Antes
import { BrowserRouter } from 'react-router-dom';
<BrowserRouter>

// Depois
import { HashRouter } from 'react-router-dom';
<HashRouter>
```

#### Arquivo: `frontend/src/pages/UpgradeToProducer.jsx`
```javascript
// Antes
window.location.href = '/seller/dashboard';

// Depois
window.location.href = '/#/seller/dashboard';
```

### Como funciona
- **BrowserRouter**: URLs como `site.com/seller/dashboard` - requer configuração do servidor
- **HashRouter**: URLs como `site.com/#/seller/dashboard` - funciona sem configuração

### Por que HashRouter resolve
O `#` (hash) na URL é tratado pelo navegador, não pelo servidor. O servidor sempre recebe apenas `site.com/` e o React Router lê a parte após o `#` para fazer a navegação.
