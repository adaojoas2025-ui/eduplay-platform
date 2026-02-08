# Sistema de Transferência PIX - EducaplayJA

## Visão Geral

O sistema de transferência PIX permite que produtores e administradores solicitem saques de suas vendas. O dinheiro é transferido automaticamente via PIX para a chave cadastrada pelo produtor.

**Nota:** Produtos criados pelo ADMIN não geram comissão (100% receita da plataforma). Apenas produtos de produtores regulares (PRODUCER) geram comissão com split 90/10.

O sistema suporta **saque de valor exato** com consumo parcial de pedidos. O produtor pode escolher qualquer valor dentro do saldo disponível, e o sistema consome os pedidos necessários (incluindo parcialmente) para atingir o valor solicitado.

## Arquitetura

```
COMPRADORES                         PRODUTORES
     │                                   ▲
     │ Pagam via PIX                     │ Recebem via PIX
     ▼                                   │
┌──────────────┐                  ┌──────────────┐
│ Mercado Pago │ ──── $$ ────▶   │    Asaas     │
│  (RECEBE)    │                  │   (ENVIA)    │
└──────────────┘                  └──────────────┘
```

- **Mercado Pago**: Recebe pagamentos dos compradores
- **Asaas**: Envia PIX para os produtores (saques)

## Configuração

### Variáveis de Ambiente (Render)

```env
# Asaas Configuration
ASAAS_API_KEY=sua_api_key_aqui
ASAAS_ENVIRONMENT=production  # ou 'sandbox' para testes
ASAAS_WEBHOOK_TOKEN=token_para_validar_webhooks  # Para autorização automática
```

### Configuração no Asaas

1. Criar conta em https://www.asaas.com
2. Completar verificação de identidade
3. Obter API Key em: Configurações → Integrações → Chaves de API
4. Depositar saldo na conta Asaas para realizar transferências

### Autorização de Transferências

Existem duas formas de autorizar transferências no Asaas:

#### Opção 1: Via SMS (Manual)

1. Produtor solicita saque na plataforma
2. Sistema envia solicitação para Asaas
3. Asaas envia SMS com código de autorização
4. Administrador autoriza no painel Asaas
5. PIX é enviado ao produtor

#### Opção 2: Automática via Webhook (Sem SMS) - RECOMENDADO E ATIVO

Para automatizar transferências sem precisar de SMS, configure:

**Passo 1: Mecanismo de Segurança no Asaas**
1. Acesse: Menu do usuário → Integrações → Mecanismos de segurança
   - URL direta: `https://www.asaas.com/apiAccessControl/index`
2. Na seção "Validação de saque via webhooks", configure:
   - **URL**: `https://eduplay-platform.onrender.com/api/v1/webhooks/asaas/authorize-transfer`
   - **Email**: email para notificações de falha
   - **Token de autenticação**: crie um token e salve-o
3. **IMPORTANTE**: Desative "Evento crítico em requisições de saque" (se quiser evitar SMS)

**Passo 2: Configurar Token no Render**
1. No Render, adicione a variável de ambiente: `ASAAS_WEBHOOK_TOKEN=seu_token_aqui`
2. O token deve ser **exatamente igual** ao configurado no Asaas

**IPs do Render para Whitelist (opcional):**
O Render usa IPs dinâmicos. Para obter os IPs atuais:
- Acesse: https://render.com/docs/static-outbound-ip-addresses
- Ou use um serviço como https://api.ipify.org no seu app para descobrir

**Fluxo Automático:**
1. Produtor solicita saque
2. Sistema envia para Asaas via API `/transfers`
3. Asaas chama nosso webhook de autorização (5 segundos após criação)
4. Asaas envia token no header `asaas-access-token`
5. Webhook valida token e retorna `{ "status": "APPROVED" }`
6. PIX é enviado automaticamente ao produtor

**Obs:** Se o webhook falhar 3 vezes, a transferência é cancelada automaticamente pelo Asaas.

## Saque de Valor Exato (Consumo Parcial)

O sistema permite que o produtor saque **qualquer valor** dentro do saldo disponível, não apenas pedidos inteiros.

### Como Funciona

- Cada pedido tem um `producerAmount` (valor do produtor após taxa da plataforma)
- O saldo disponível é calculado como: `producerAmount - SUM(transferências COMPLETED)` por pedido
- Um mesmo pedido pode ser sacado parcialmente em múltiplas transferências

### Relação no Banco de Dados

- **pix_transfers.orderId**: NÃO é unique (permite múltiplas transferências por pedido)
- **Relação**: `orders` 1:N `pix_transfers` (um pedido pode ter várias transferências parciais)

### Exemplo

**Pedidos disponíveis:** Pedido A (R$1,79), Pedido B (R$4,05)
**Usuário solicita:** R$2,00

1. Sistema consome Pedido A inteiro → `pix_transfer(orderId=A, amount=1.79)`
2. Falta R$0,21 → consome Pedido B parcialmente → `pix_transfer(orderId=B, amount=0.21)`
3. Envia **exatamente R$2,00** via Asaas PIX
4. Saldo restante: Pedido B tem R$3,84 disponível

**Próximo saque de R$3,84:**
1. Pedido B tem R$3,84 restante → `pix_transfer(orderId=B, amount=3.84)`
2. Envia R$3,84 via Asaas PIX
3. Saldo: R$0,00

## Arquivos do Sistema

### Backend

#### `backend/src/config/asaas.js`
Configuração do cliente Asaas API com funções:
- `createPixTransfer()` - Cria transferência PIX
- `getTransferStatus()` - Consulta status da transferência
- `getAccountBalance()` - Consulta saldo da conta
- `isConfigured()` - Verifica se Asaas está configurado

#### `backend/src/services/pixTransfer.service.js`
Serviço principal de transferências PIX:
- `requestWithdrawal(producerId, amount?)` - Solicita saque com consumo parcial de pedidos. Se `amount` é informado, saca exatamente esse valor. Se não, saca todo o saldo disponível.
- `getAvailableBalance(producerId)` - Calcula saldo disponível por pedido (descontando transferências já realizadas)
- `getTransferHistory(producerId)` - Histórico de transferências
- `savePixKey()` - Salva chave PIX do produtor

#### `backend/src/api/routes/webhook.routes.js`
Endpoints de webhook:
- `POST /api/v1/webhooks/asaas/authorize-transfer` - Autorização de transferências (retorna `{ "status": "APPROVED" }`)
- `POST /api/v1/webhooks/asaas/transfer-status` - Notificações de status
- `POST /api/v1/webhooks/asaas` - Webhook genérico

#### `backend/src/api/controllers/user.controller.js`
Controller com endpoint de saque:
- `POST /api/v1/users/pix/withdraw` - Aceita `{ amount?: number }` no body

### Frontend

#### `frontend/src/components/WithdrawalSection.jsx`
Componente de saque com:
- Toggle "Escolher valor do saque"
- Input para valor personalizado
- Validação de valor mínimo (R$ 1,00) e máximo (saldo disponível)
- Exibição de saldo restante após saque parcial

## API Endpoints

### Saques

```
POST /api/v1/users/pix/withdraw
Body: { amount?: number }  // Opcional - se não informado, saca tudo
Response: {
  success: true,
  totalAmount: 10.50,
  transferCount: 2,
  remainingBalance: 5.00,
  pixKey: "+5561999992214",
  asaasId: "abc123"
}
```

### Saldo

```
GET /api/v1/users/pix/balance
Response: {
  availableBalance: 15.50,
  pendingOrders: 3,
  orders: [...]
}
```

### Configuração PIX

```
GET /api/v1/users/pix/config
Response: {
  pixKey: "+5561999992214",
  pixKeyType: "PHONE",
  pixAccountHolder: "João Silva",
  isConfigured: true
}

POST /api/v1/users/pix/config
Body: {
  pixKey: "+5561999992214",
  pixKeyType: "PHONE",  // CPF, CNPJ, EMAIL, PHONE, RANDOM
  pixAccountHolder: "João Silva"
}
```

## Fluxo de Saque

1. **Produtor acessa Financeiro** no painel do vendedor
2. **Visualiza saldo disponível** (calculado a partir das vendas, descontando saques anteriores)
3. **Opcionalmente escolhe valor** a sacar (toggle + input)
4. **Clica em "Solicitar Saque"**
5. **Sistema seleciona pedidos** para consumo (inteiros e/ou parciais)
6. **Cria registros de transferência** no banco (um por pedido consumido)
7. **Envia valor exato para Asaas** via API `/transfers`
8. **Asaas chama webhook** de autorização automática
9. **Webhook retorna** `{ "status": "APPROVED" }`
10. **PIX é enviado** ao produtor
11. **Status atualizado** no sistema

## Taxas

| Operação | Taxa Asaas |
|----------|------------|
| Transferência PIX | ~R$ 0,00 - R$ 5,00* |
| Recebimento PIX | Gratuito |

*Taxa pode variar conforme plano da conta Asaas

## Troubleshooting

### Erro "Saldo insuficiente"
- Verifique se há saldo na conta Asaas
- Deposite via PIX: Meu Dinheiro → Adicionar saldo

### Transferência "Falhou"
- Verifique se a chave PIX do produtor está correta
- Verifique se o webhook de autorização está configurado corretamente
- Verifique logs no Render

### Erro "Autorização externa foi recusada"
- Verifique se o `ASAAS_WEBHOOK_TOKEN` no Render é igual ao token configurado no Asaas
- Verifique se a URL do webhook está acessível externamente
- Verifique se o servidor está rodando e respondendo (logs no Render)
- No Asaas: Menu do usuário → Integrações → Mecanismos de segurança → verificar configuração

### Webhook não funciona / SMS continua sendo exigido
- Confirme que a "Validação de saque via webhooks" está ativada no Asaas
- Desative "Evento crítico em requisições de saque" no Asaas
- Verifique se a URL do webhook responde com status 200

## Histórico de Mudanças

### 06/02/2026
- **Seleção de parcelas no checkout**: Usuário pode escolher 1x a 12x antes de ir ao Mercado Pago
  - Parcelas clicáveis com visual radio-button
  - Total e botão atualizam dinamicamente
  - Resumo mostra parcela selecionada e juros quando > 1x
  - Botão mostra "Pagar em 3x de R$ X,XX" quando parcelado
- **Contador do carrinho no header**: Badge mostra quantidade de itens no ícone do carrinho
  - Navbar agora usa `useCart` (CartContext) em vez de `useStore` (local)
  - Sincronizado com backend para mostrar contagem real
- **Melhoria de mensagens de erro no checkout**:
  - "Network Error" → "Servidor indisponivel. Verifique sua conexao..."
  - Erro 404 → "Produto nao encontrado. Pode ter sido removido..."
- **Correção ManageApps**: Removido alerta de erro ao clicar nos filtros quando não há apps

### 05/02/2026 (Noite 2)
- **Páginas de ajuda individuais**: 6 artigos detalhados em `/help/:slug`
  - primeira-compra, comecar-a-vender, combos, reembolso, formas-pagamento, receber-vendas
  - Cada artigo com passo a passo, dicas, tabelas e boxes informativos
  - Reembolso em 7 dias (Art. 49 CDC) documentado
- **Script de reset do banco**: `reset-keep-users.js` remove produtos e dados financeiros mantendo usuários
- **Tradução de status de comissões**: PENDING→Pendentes, PROCESSING→Processando, PAID→Pagas, FAILED→Falhou
- **Comissão da plataforma**: 3% (corrigido na documentação - não é 10%)
- **Correção ManageApps**: Removido alerta de erro ao clicar nos filtros quando não há apps cadastrados

### 05/02/2026 (Noite)
- **Taxa de cartão + R$1 no checkout**: Comprador escolhe PIX ou Cartão ANTES de redirecionar ao MP
- PIX: preço normal do produto, MP mostra apenas PIX
- Cartão: preço + taxa MP (4.99%) + taxa parcelamento + R$1,00 de serviço
- Seletor visual com cards grandes (PIX verde / Cartão azul) no checkout
- Detalhamento transparente de todas as taxas quando cartão selecionado
- Tabela de parcelas 1x a 12x com valores por parcela e total
- Resumo lateral atualiza dinamicamente com taxas do cartão
- Backend restringe métodos de pagamento no MP via `payment_methods.excluded_payment_types`
- Comissão do produtor sempre calculada sobre preço BASE (não afetada pelas taxas)
- `paymentType` armazenado em `metadata` JSON (sem necessidade de migration)

### 05/02/2026
- Formulário de contato conectado ao backend (antes era fake com setTimeout)
- Criada rota `POST /api/v1/contact` com rate limiting (5/hora/IP)
- Correção de email de suporte: FROM (`ja.eduplay@gmail.com`) diferente do TO (`adao.joas2025@gmail.com`)
- Links `mailto:` substituídos por Gmail Compose URL nas páginas HelpCenter e Contact
- Tentativa de melhoria anti-spam nos templates (revertida - não melhorou deliverability)
- Emojis restaurados nos log messages de `email.js` (📤, ✅, ❌)
- Documentação PROJETO_COMPLETO.md atualizada com seções de Asaas, email e contato

### 04/02/2026 (Noite)
- Saque de valor exato com consumo parcial de pedidos (v4)
- Mudança de schema: relação `pix_transfers` de 1:1 para 1:N (um pedido pode ter múltiplas transferências)
- Migration: removido unique index de `orderId`, adicionado index não-único para performance
- Correção do formato de resposta do webhook: `{ "status": "APPROVED" }` (antes `{ "authorized": true }`)
- `getAvailableBalance()` agora calcula saldo restante por pedido (descontando transferências anteriores)
- `requestWithdrawal()` agora consome pedidos parcialmente para atingir valor exato

### 04/02/2026 (Tarde)
- Implementação de autorização automática sem SMS
- Adição de validação de token no webhook (`asaas-access-token`)
- Nova variável de ambiente `ASAAS_WEBHOOK_TOKEN`
- Documentação de como configurar Whitelist de IPs + Webhook no Asaas

### 04/02/2026 (Manhã)
- Integração com Asaas para transferências PIX
- Substituição do Mercado Pago (que não suporta payouts em contas normais)
- Adição de saque parcial (escolher valor)
- Criação de webhook para autorização
- Toggle no frontend para escolher valor de saque

### Arquivos Modificados
- `backend/src/config/asaas.js` (NOVO)
- `backend/src/config/env.js` (variáveis Asaas + webhookToken)
- `backend/src/services/pixTransfer.service.js` (Asaas + saque parcial + consumo parcial v4)
- `backend/src/api/routes/webhook.routes.js` (NOVO - com validação de token)
- `backend/src/api/routes/index.js` (webhook routes)
- `backend/src/api/controllers/user.controller.js` (amount param)
- `frontend/src/components/WithdrawalSection.jsx` (escolher valor)
- `backend/prisma/schema.prisma` (relação 1:N em pix_transfers, removido @unique de orderId)
- `backend/prisma/migrations/20260204200000_allow_partial_order_withdrawals/migration.sql` (NOVO)
