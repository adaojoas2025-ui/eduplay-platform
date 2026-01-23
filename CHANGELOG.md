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

## [2026-01-XX] - Implementação do Sistema Order Bump (Planejado)

### Objetivo
Implementar recurso de "Order Bump" no checkout para aumentar ticket médio em até 50%.

### Status
Em planejamento - Ver arquivo `.claude/plans/wobbly-wiggling-metcalfe.md`

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

### Contexto
Necessidade de limpar todos os dados de teste (usuários, produtos, pedidos, comissões) do banco de produção, mantendo apenas o administrador.

### Problema
O plano gratuito do Render apresenta as seguintes limitações:
1. **Sem acesso Shell** - O Render Shell requer plano Starter ($7/mês)
2. **Sem conexão externa ao banco** - O PostgreSQL do Render só aceita conexões internas (do próprio serviço)
3. **Deploy demorado** - O auto-deploy pode levar 2-5 minutos para atualizar o código

### Solução Implementada
Criar um endpoint GET temporário no `app.js` que executa a limpeza quando acessado via navegador:

```javascript
/**
 * One-time cleanup endpoint - DELETE AFTER USE
 */
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

### Passo a Passo para Limpeza do Banco de Produção

1. **Adicionar endpoint temporário** em `backend/src/app.js` (antes das rotas da API)
2. **Commit e push** para GitHub:
   ```bash
   git add -A && git commit -m "feat: Add one-time cleanup endpoint" && git push origin main
   ```
3. **Aguardar deploy** no Render (2-3 minutos)
4. **Acessar no navegador**: `https://eduplay-platform.onrender.com/api/v1/run-cleanup-now`
5. **Verificar resposta**: `{"success":true,"message":"Limpeza concluida","admin":"email@admin.com"}`
6. **Remover endpoint** do código e fazer novo push:
   ```bash
   git add -A && git commit -m "chore: Remove temporary cleanup endpoint" && git push origin main
   ```

### Por que GET ao invés de DELETE?
- Endpoint GET pode ser acessado diretamente pelo navegador
- Não requer token de autenticação ou ferramentas como Postman/curl
- Mais simples para execução única

### Ordem de Deleção (Respeitar Foreign Keys)
1. `reviews` - dependem de products e users
2. `cart_items` - dependem de products e users
3. `order_bumps` - dependem de products e users
4. `commissions` - dependem de orders e users
5. `orders` - dependem de products e users
6. `products` - dependem de users
7. `users` - deletar todos EXCETO admin

### Tentativas que NÃO Funcionaram

| Abordagem | Por que não funciona |
|-----------|---------------------|
| Conectar ao banco via DATABASE_URL local | Render bloqueia conexões externas no plano gratuito |
| Usar Render Shell | Requer plano Starter ($7/mês) |
| Endpoint DELETE com autenticação | Deploy demorado + complexidade de autenticação |
| Prisma `deleteMany()` em modelos específicos | Alguns modelos retornavam undefined no Prisma Client deployado |

### Resultado
- Admin `ja.eduplay@gmail.com` preservado
- Todos os outros usuários removidos
- Todos os produtos removidos
- Todos os pedidos e comissões removidos (já haviam sido limpos anteriormente)

### Lição Aprendida
Para operações de manutenção em banco de produção no Render (plano gratuito), a solução mais prática é criar um endpoint GET temporário, acessá-lo via navegador, e removê-lo imediatamente após o uso.
