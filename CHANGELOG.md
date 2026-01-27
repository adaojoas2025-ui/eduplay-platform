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

## [2026-01-27] - Implementacao do Sistema Order Bump (Frontend)

### Objetivo
Implementar recurso de "Order Bump" no checkout para aumentar ticket medio em ate 50%.

### Status
**IMPLEMENTADO** - Frontend completo

### Arquivos Criados

#### Frontend
- `frontend/src/components/OrderBumpSuggestion.jsx` - Componente de sugestoes no checkout
- `frontend/src/pages/producer/OrderBumps.jsx` - Pagina de gerenciamento para produtores

### Arquivos Modificados

#### Frontend
- `frontend/src/pages/Checkout.jsx` - Integracao do componente Order Bump
- `frontend/src/App.jsx` - Rota `/producer/order-bumps` adicionada

### Funcionalidades Implementadas

1. **Componente OrderBumpSuggestion**
   - Exibe sugestoes de produtos complementares no checkout
   - Busca sugestoes via API `/order-bumps/suggestions`
   - Permite adicionar/remover bumps com um clique
   - Rastreia impressoes e cliques para analytics

2. **Integracao no Checkout**
   - Order bumps aparecem antes do botao de pagamento
   - Total e atualizado dinamicamente ao adicionar bumps
   - Bumps sao processados junto com itens do carrinho

3. **Dashboard do Produtor** (`/producer/order-bumps`)
   - CRUD completo de order bumps
   - Analytics: impressoes, cliques, conversoes, taxa de conversao
   - Ativar/desativar bumps
   - Configurar desconto percentual e prioridade

### Backend (Ja existia)
- `backend/src/api/controllers/order-bump.controller.js`
- `backend/src/api/routes/order-bump.routes.js`
- `backend/src/api/services/order-bump.service.js`
- Model `order_bumps` no Prisma schema

### Como Usar

1. **Produtor**: Acessar `/producer/order-bumps` para criar ofertas
2. **Comprador**: Ver sugestoes automaticas no checkout
3. **Analytics**: Acompanhar metricas no dashboard do produtor

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
