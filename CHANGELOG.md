# CHANGELOG - EDUPLAYJA Platform

## [2026-03-03] - Checkout Transparente (Compra sem Login) + Email + Auto-login + Navbar

### Resumo
Implementação completa do fluxo de compra sem login (checkout de convidado), com auto-login automático após a compra, exibição da senha provisória na tela de confirmação e envio por e-mail. Correção crítica do serviço de e-mail (fallback quebrado). Correção do auto-login (incompatibilidade de chaves no localStorage). Melhoria na geração de senha (caracteres sem ambiguidade visual). Reorganização da navbar com "Cursos Adquiridos" na barra superior.

---

### 1. Checkout Transparente — Compra sem Login

**Arquivo:** `frontend/src/pages/GuestCheckout.jsx`

- Novo formulário de checkout para usuários não autenticados
- Redireciona para Mercado Pago sem exigir cadastro prévio
- Salva `guestEmail`, `guestIsNew` e `guestTempPassword` no `sessionStorage` para sobreviver ao redirect do MP
- Após resposta da API, salva token + usuário em **ambas** as chaves `'user'` e `'userData'` no `localStorage` (compatibilidade com os dois sistemas de auth da app)

**Arquivo:** `backend/src/api/controllers/order.controller.js`

- Função `registerOrGet` cria conta automaticamente se o e-mail não existir
- Retorna `tempPassword` na resposta da API quando `isNewUser === true`
- Retorna `accessToken`, `refreshToken` e dados do usuário para auto-login

---

### 2. Exibição da Senha Provisória na Tela de Confirmação

**Arquivos:** `frontend/src/pages/OrderSuccess.jsx`, `frontend/src/pages/OrderPending.jsx`

- Lê `guestTempPassword` do `sessionStorage` e exibe na tela em destaque (`font-mono`, roxo)
- Botão "Copiar" com feedback visual (`✓ Copiado`)
- Remove os dados do `sessionStorage` após leitura (segurança)
- Mensagem instrucional: _"Esses dados também foram enviados para {email}. Verifique a pasta de spam."_
- Botão "Acessar Minha Conta Agora" leva diretamente para `/my-products` (usuário já está logado)

---

### 3. Correção Crítica do Serviço de E-mail

**Arquivo:** `backend/src/config/email.js`

**Problema:** O SendGrid era marcado como `useSendGrid = true` na inicialização (sem validar a chave via API). O Gmail SMTP só era inicializado `if (!useSendGrid)` — nunca sendo alcançado quando o SendGrid falhava no envio.

**Solução:**
- Adicionado suporte completo ao **Resend** (pacote `resend@^6.8.0` já estava instalado)
- Todos os provedores agora são inicializados **independentemente** (sem `if/else` entre eles)
- `sendEmail()` agora tenta o próximo provedor ao falhar: **Resend → SendGrid → Gmail SMTP**
- Prioridade: `RESEND_API_KEY` (1º) → `SENDGRID_API_KEY` (2º) → `EMAIL_USER/EMAIL_PASS` (3º)
- Variáveis de ambiente para o Render:
  - `RESEND_API_KEY` — chave da API do Resend (resend.com/api-keys)
  - `RESEND_FROM` — remetente (ex: `onboarding@resend.dev` para testes)

---

### 4. Correção do Auto-login após Compra

**Arquivo:** `frontend/src/pages/GuestCheckout.jsx`

**Problema:** Após a compra, a navbar exibia "Entrar" mesmo com o usuário autenticado.
**Causa:** `GuestCheckout` salvava o usuário na chave `'user'`, mas `lib/auth.js` (usado pela Navbar) lia a chave `'userData'`.

**Solução:** Salvar o usuário em ambas as chaves:
```js
localStorage.setItem('user', JSON.stringify(user));
localStorage.setItem('userData', JSON.stringify(user));
```

---

### 5. Senhas Provisórias sem Caracteres Ambíguos

**Arquivo:** `backend/src/services/auth.service.js`

**Problema:** `Math.random().toString(36)` gerava caracteres como `5`/`S`, `0`/`O`, `1`/`I`/`L`, `8`/`B` que o usuário confundia ao digitar.

**Solução:** Geração com charset explícito sem ambiguidade:
```js
const unambiguousChars = 'ABCDEFGHJKMNPQRTUVWXY234679';
let tempPassword = '';
for (let i = 0; i < 8; i++) {
  tempPassword += unambiguousChars[Math.floor(Math.random() * unambiguousChars.length)];
}
```

---

### 6. Navbar — "Cursos Adquiridos" na Barra Superior

**Arquivo:** `frontend/src/components/Navbar.jsx`

- "Cursos Adquiridos" movido do **dropdown do usuário** para a **barra de navegação superior** (desktop)
- Aparece entre "Apps Educativos" e "Vender", visível apenas para usuários autenticados
- No mobile, permanece no menu dropdown do usuário (comportamento inalterado)

---

### Commits do Dia

| Hash | Descrição |
|------|-----------|
| `8f5c12a` | feat: Implement transparent checkout (guest purchase without login) |
| `e631457` | fix: Correct gamification.service import path in order.controller |
| `f0fdd07` | fix: Redirect 'Comprar Agora' on product page to guest checkout |
| `4e05322` | fix: Fix useAuth import - use Zustand hook instead of broken Context |
| `33dc5f9` | feat: Show personalized instructions to guest buyers on success page |
| `68e41f7` | fix: Fix product access flow after guest checkout |
| `eb55843` | feat: Show guest credentials info on confirmation page |
| `92507ac` | feat: Show temp password on confirmation page + fix email fallback chain |
| `80acf91` | fix: Fix auto-login after guest checkout + unambiguous password chars |
| `aca80ac` | feat: Move 'Cursos Adquiridos' to top navbar for authenticated users |

---

## [2026-02-08] - Permissões ADMIN e Correção de Comissões

### Resumo
Correção completa das permissões do administrador para ter acesso total a todas as funcionalidades da plataforma. Correção do Admin Dashboard que apresentava tela branca (React Error #31). Ajuste no sistema de comissões para que produtos criados pelo ADMIN não gerem comissão (100% receita da plataforma).

### 1. Permissões ADMIN - Acesso Total

#### Problema
O administrador (ja.eduplay@gmail.com) recebia erros "Insufficient permissions" ao acessar o painel de vendedor e diversas funcionalidades de produtor. O middleware `authorize()` não incluía o role `ADMIN` nas rotas de produtor.

#### Correções Aplicadas

##### Rotas (authorize middleware)

| Arquivo | Rotas Corrigidas | Alteração |
|---------|-----------------|-----------|
| `backend/src/api/routes/user.routes.js` | 15 rotas PIX/Mercado Pago | `authorize(PRODUCER)` → `authorize(PRODUCER, ADMIN)` |
| `backend/src/api/routes/product.routes.js` | 5 rotas de produto | `authorize(PRODUCER)` → `authorize(PRODUCER, ADMIN)` |

**Rotas PIX corrigidas:**
- `PATCH /users/pix-key` - Atualizar chave PIX
- `PATCH /users/producer-settings` - Configurações do produtor
- `GET/POST/DELETE /users/pix/config` - Configuração PIX
- `POST /users/pix/enable` - Ativar PIX automático
- `POST /users/pix/disable` - Desativar PIX automático
- `GET /users/pix/transfers` - Histórico de transferências
- `GET /users/pix/stats` - Estatísticas PIX
- `GET /users/pix/balance` - Saldo disponível
- `POST /users/pix/withdraw` - Solicitar saque
- `DELETE /users/pix/restore-balance` - Restaurar saldo
- `GET /users/mercadopago/auth-url` - URL de autenticação MP
- `GET /users/mercadopago/status` - Status da conta MP
- `POST /users/mercadopago/unlink` - Desvincular MP

**Rotas de produto corrigidas:**
- `POST /products` - Criar produto
- `POST /products/:id/publish` - Publicar produto
- `POST /products/:id/thumbnail` - Upload de thumbnail
- `POST /products/:id/video` - Upload de vídeo
- `POST /products/:id/files` - Upload de arquivos

##### Services (verificações de role internas)

| Arquivo | Função | Alteração |
|---------|--------|-----------|
| `backend/src/services/product.service.js` | `createProduct()` | ADMIN pode criar produtos |
| `backend/src/services/product.service.js` | `getProducerProducts()` | ADMIN pode ver produtos |
| `backend/src/services/user.service.js` | `updatePixKey()` | ADMIN pode configurar PIX |
| `backend/src/services/user.service.js` | `getProducerStats()` | ADMIN pode ver estatísticas |
| `backend/src/services/user.service.js` | `updateProducerSettings()` | ADMIN pode atualizar configurações |
| `backend/src/services/commission.service.js` | `getProducerCommissions()` | ADMIN pode ver comissões |
| `backend/src/services/commission.service.js` | `getPendingCommissions()` | ADMIN pode ver pendentes |
| `backend/src/services/commission.service.js` | `requestWithdrawal()` | ADMIN pode solicitar saque |

---

### 2. Admin Dashboard - Correção React Error #31

#### Problema
O Admin Dashboard (`/admin/dashboard`) apresentava tela branca com erro "Objects are not valid as a React child" (React Error #31).

#### Causa Raiz
Incompatibilidade entre os nomes de campos retornados pelo backend e os esperados pelo frontend:

| Frontend Esperava | Backend Retornava | Tipo de Erro |
|-------------------|-------------------|--------------|
| `stats.users.total` | `stats.users.totalUsers` | Campo inexistente |
| `stats.orders.total` | `stats.orders.totalOrders` | Campo inexistente |
| `stats.users.byRole.CUSTOMER` | `stats.users.byRole.buyers` | Campo inexistente |
| `stats.commissions.byStatus.PENDING` (como número) | `stats.commissions.byStatus.PENDING` (como `{count, amount}`) | Objeto renderizado como React child |

#### Correção

**Arquivo:** `frontend/src/pages/AdminDashboard.jsx`

- Corrigidos todos os nomes de campo para corresponder ao backend
- Acessado `.count` dos objetos de status de comissão
- Substituída seção "Status dos Pedidos" (sem dados no backend) por "Receita da Plataforma" com `totalRevenue`, `platformRevenue`, `producerRevenue`

---

### 3. Comissões - Produtos do ADMIN sem Comissão

#### Problema
Quando o ADMIN criava um produto e alguém comprava, o sistema criava uma comissão (90% produtor / 10% plataforma) como se fosse um produtor normal. Isso estava errado porque o ADMIN **é** a plataforma.

#### Solução

**Arquivo:** `backend/src/services/order.service.js` - Função `updateOrderStatus()`

Adicionada verificação antes de criar comissão:
1. Busca o produtor do produto (`userRepository.findUserById`)
2. Verifica se o role é `ADMIN`
3. Se for ADMIN: pula criação de comissão, loga como "100% platform revenue"
4. Se for PRODUCER normal: cria comissão normalmente (90/10)

```javascript
// Lógica adicionada
const producer = await userRepository.findUserById(order.product.producerId);
const isAdminProduct = producer && producer.role === USER_ROLES.ADMIN;

if (!isAdminProduct) {
  // Cria comissão para produtores normais
  await commissionRepository.createCommission({ ... });
} else {
  // Produto do admin - 100% receita da plataforma
  logger.info('Admin product sold - no commission created');
}
```

#### Regra de Negócio Atualizada

| Cenário | Comissão | Receita Plataforma |
|---------|----------|--------------------|
| Produto de PRODUCER | 90% produtor / 10% plataforma | 10% |
| Produto de ADMIN | Sem comissão | 100% |
| App purchase | Sem comissão | 100% |

---

### Arquivos Modificados

| Arquivo | Alteração |
|---------|-----------|
| `backend/src/api/routes/user.routes.js` | 15 rotas: ADMIN adicionado ao authorize |
| `backend/src/api/routes/product.routes.js` | 5 rotas: ADMIN adicionado ao authorize |
| `backend/src/services/product.service.js` | 2 verificações de role: ADMIN permitido |
| `backend/src/services/user.service.js` | 3 verificações de role: ADMIN permitido |
| `backend/src/services/commission.service.js` | 3 verificações de role: ADMIN permitido |
| `frontend/src/pages/AdminDashboard.jsx` | Corrigidos nomes de campos e React Error #31 |
| `backend/src/services/order.service.js` | Pular comissão para produtos do ADMIN |

### Commits Relacionados
- `fix: Grant ADMIN full access to PIX/MP routes and fix Admin Dashboard crash` (3fbf11e)
- `fix: Skip commission creation for admin-created products` (7f80483)

---

## [2026-01-28] - Configuração de Pagamento Real com Mercado Pago

### Resumo
Configuração completa do sistema de pagamento real utilizando Mercado Pago em produção. Removido o modo de teste e habilitado pagamentos via PIX, Cartão de Crédito e Boleto.

### Configuração do Mercado Pago

#### Credenciais de Produção (Render)
| Variável | Descrição |
|----------|-----------|
| `MP_ACCESS_TOKEN` | Token de acesso privado (APP_USR-...) |
| `MP_PUBLIC_KEY` | Chave pública (APP_USR-...) |

#### URLs Configuradas
| Tipo | URL |
|------|-----|
| **Webhook** | `https://eduplay-platform.onrender.com/api/v1/payments/webhook` |
| **Sucesso** | `https://eduplay-frontend.onrender.com/#/order/{id}/success` |
| **Falha** | `https://eduplay-frontend.onrender.com/#/order/{id}/failure` |
| **Pendente** | `https://eduplay-frontend.onrender.com/#/order/{id}/pending` |

#### Conta Mercado Pago (Vendedor)
| Campo | Valor |
|-------|-------|
| **Titular** | Adao Aguiar |
| **Aplicação** | EDUPLAY (ID: 5906862362960927) |
| **Status** | Ativo (Avaliação de qualidade: 75+ pontos) |

### Métodos de Pagamento Suportados
| Método | Taxa | Aprovação |
|--------|------|-----------|
| PIX | 0,00% | Instantânea |
| Cartão de Crédito | 4,98% | Instantânea |
| Cartão de Débito | 1,99% | Instantânea |
| Boleto | - | 1-3 dias úteis |

### Fluxo de Pagamento
```
1. Cliente adiciona produto ao carrinho
2. Cliente vai para checkout
3. Backend cria preferência no Mercado Pago
4. Cliente é redirecionado para página de pagamento do MP
5. Cliente paga (PIX, Cartão ou Boleto)
6. Mercado Pago envia webhook para o backend
7. Backend atualiza status do pedido para COMPLETED
8. Se produtor for PRODUCER: cria comissão (90% produtor / 10% plataforma)
   Se produtor for ADMIN: 100% receita plataforma (sem comissão)
9. Cliente é redirecionado para página de sucesso
```

### Arquivos Modificados

| Arquivo | Alteração |
|---------|-----------|
| `backend/src/services/payment.service.js` | Configuração da preferência de pagamento com dados do comprador |
| `backend/src/config/mercadopago.js` | SDK do Mercado Pago configurado |
| `frontend/src/pages/Checkout.jsx` | Removido pagamento de teste, mantido apenas Mercado Pago |
| `frontend/index.html` | Script de redirecionamento para hash routes |
| `frontend/public/_redirects` | Configuração SPA para Render |

### Correção de Redirecionamento

O Mercado Pago remove o `#` das URLs de callback. Foi adicionado um script no `index.html` que detecta URLs sem hash e redireciona automaticamente:

```javascript
// Redirect non-hash routes to hash routes
if (path !== '/' && !window.location.hash) {
  window.location.replace('/#' + path + search);
}
```

### Configuração no Painel Mercado Pago

1. Acessar: https://www.mercadopago.com.br/developers/panel
2. Selecionar aplicação EDUPLAY
3. Configurar webhook em "Notificações"
4. Usar credenciais de "Produção" (não teste)

### Avaliação de Qualidade da Integração
| Critério | Pontos |
|----------|--------|
| Conciliação financeira | 25 |
| Escalabilidade | 15 |
| Experiência de compra | 10 |
| Segurança | 25 |
| **Total** | **75+** |

### Importante - Teste de Pagamento

Para testar pagamentos, o comprador deve usar uma conta **diferente** da conta que recebe os pagamentos (Adao Aguiar). Opções:
1. Usar outro navegador ou janela anônima
2. Fazer logout do Mercado Pago antes de pagar
3. Pagar como visitante (sem login no MP)

---

## [2026-01-27] - Reorganização do Menu e Visibilidade de Produtos

### Mudanças no Menu de Navegação

#### Items Removidos
| Item | Motivo |
|------|--------|
| Meus Cursos | Redundante - funcionalidade movida para "Cursos Adquiridos" |

#### Items Renomeados
| Antes | Depois | Rota | Descrição |
|-------|--------|------|-----------|
| Meus Produtos | Cursos Adquiridos | `/my-products` | Cursos/produtos comprados pelo usuário |
| Pedidos | Meus Produtos | `/seller/products` | Produtos criados pelo vendedor |

#### Permissões de Menu
| Item | BUYER | PRODUCER | ADMIN |
|------|-------|----------|-------|
| Cursos Adquiridos | ✅ | ✅ | ✅ |
| Meus Produtos | ✅ | ✅ | ✅ |
| Financeiro | ✅ | ✅ | ✅ |
| Meus Combos | ❌ | ✅ | ✅ |
| Order Bumps | ❌ | ✅ | ✅ |
| Produtos Pendentes | ❌ | ❌ | ✅ |

### Filtros na Página "Meus Produtos" (Vendedor)

Adicionados filtros de status para o produtor visualizar seus produtos:

| Filtro | Status | Cor |
|--------|--------|-----|
| Aguardando Aprovação | PENDING_APPROVAL | Amarelo |
| Publicados | PUBLISHED | Verde |
| Rejeitados | REJECTED | Vermelho |
| Rascunhos | DRAFT | Azul |
| Todos | Todos os status | Cinza escuro |

**Arquivo modificado:** `frontend/src/pages/SellerProducts.jsx`

### Arquivos Modificados

| Arquivo | Alteração |
|---------|-----------|
| `frontend/src/components/Navbar.jsx` | Menu reorganizado, "Meus Cursos" removido, "Produtos Pendentes" restrito a ADMIN |
| `frontend/src/pages/SellerProducts.jsx` | Adicionados filtros de status |
| `frontend/src/pages/MyProducts.jsx` | Título alterado para "Cursos Adquiridos" |
| `backend/PASSOS-RENDER.txt` | Senha do admin atualizada |
| `backend/scripts/fix-adao1980-role.js` | Script para corrigir role de usuário |

### Credenciais do Sistema

| Tipo | Email | Senha |
|------|-------|-------|
| **ADMIN** | ja.eduplay@gmail.com | Asa122448 |
| PRODUTOR | adao1980aguiar@gmail.com | Senha123@ |
| PRODUTOR (teste) | teste@exemplo.com | Senha123 |

### Script de Correção de Role

Para corrigir o role de um usuário de ADMIN para PRODUCER, execute no Render Shell:

```bash
node scripts/fix-adao1980-role.js
```

### Commits Relacionados
- `fix: Change 'Meus Produtos' menu link to /seller/products`
- `feat: Add status filters to Meus Produtos page`
- `fix: Remove 'Meus Cursos' from navigation menu`
- `fix: Restrict 'Produtos Pendentes' menu to ADMIN only`
- `docs: Update admin password in documentation`
- `chore: Add script to fix adao1980 user role to PRODUCER`

---

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
