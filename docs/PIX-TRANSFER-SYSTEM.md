# Sistema de Transferência PIX - EducaplayJA

## Visão Geral

O sistema de transferência PIX permite que produtores solicitem saques de suas vendas. O dinheiro é transferido automaticamente via PIX para a chave cadastrada pelo produtor.

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
ASAAS_WEBHOOK_TOKEN=token_para_validar_webhooks  # Opcional - para autorização automática
```

### Configuração no Asaas

1. Criar conta em https://www.asaas.com
2. Completar verificação de identidade
3. Obter API Key em: Configurações → Integrações → Chaves de API
4. Depositar saldo na conta Asaas para realizar transferências

### Autorização de Transferências

Existem duas formas de autorizar transferências no Asaas:

#### Opção 1: Via SMS (Padrão)

1. Produtor solicita saque na plataforma
2. Sistema envia solicitação para Asaas
3. Asaas envia SMS com código de autorização
4. Administrador autoriza no painel Asaas
5. PIX é enviado ao produtor

#### Opção 2: Automática (Sem SMS) - RECOMENDADO

Para automatizar transferências sem precisar de SMS, configure:

**Passo 1: Whitelist de IPs no Asaas**
1. Acesse: Menu do usuário → Integrações → Mecanismos de segurança
2. Adicione os IPs do Render (ver seção abaixo)
3. **IMPORTANTE**: Desative "Evento crítico em requisições de saque"

**Passo 2: Autorização Externa via Webhook**
1. No Asaas: Integrações → Webhooks → Autorização Externa
2. Configure a URL: `https://eduplay-platform.onrender.com/api/v1/webhooks/asaas/authorize-transfer`
3. Crie um token de autenticação e salve-o
4. No Render, adicione: `ASAAS_WEBHOOK_TOKEN=seu_token_aqui`

**IPs do Render para Whitelist:**
O Render usa IPs dinâmicos. Para obter os IPs atuais:
- Acesse: https://render.com/docs/static-outbound-ip-addresses
- Ou use um serviço como https://api.ipify.org no seu app para descobrir

**Variáveis de Ambiente Adicionais:**
```env
ASAAS_WEBHOOK_TOKEN=token_configurado_no_asaas
```

**Fluxo Automático:**
1. Produtor solicita saque
2. Sistema envia para Asaas
3. Asaas chama nosso webhook de autorização
4. Webhook valida token e retorna `{ "authorized": true }`
5. PIX é enviado automaticamente ao produtor

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
- `requestWithdrawal(producerId, amount?)` - Solicita saque (com valor opcional)
- `getAvailableBalance(producerId)` - Retorna saldo disponível
- `getTransferHistory(producerId)` - Histórico de transferências
- `savePixKey()` - Salva chave PIX do produtor

#### `backend/src/api/routes/webhook.routes.js`
Endpoints de webhook:
- `POST /api/v1/webhooks/asaas/authorize-transfer` - Autorização de transferências
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
2. **Visualiza saldo disponível** (vendas completadas sem saque)
3. **Opcionalmente escolhe valor** a sacar (toggle + input)
4. **Clica em "Solicitar Saque"**
5. **Sistema cria registro** de transferência no banco
6. **Envia para Asaas** via API `/transfers`
7. **Asaas solicita autorização** via SMS
8. **Admin autoriza** no painel Asaas
9. **PIX é enviado** ao produtor
10. **Status atualizado** no sistema

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
- Confirme se o webhook está desabilitado (use SMS)
- Verifique logs no Render

### SMS não chega
- Verifique número cadastrado no Asaas
- Clique em "Reenviar código" no painel Asaas

## Histórico de Mudanças

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
- `backend/src/services/pixTransfer.service.js` (Asaas + saque parcial)
- `backend/src/api/routes/webhook.routes.js` (NOVO - com validação de token)
- `backend/src/api/routes/index.js` (webhook routes)
- `backend/src/api/controllers/user.controller.js` (amount param)
- `frontend/src/components/WithdrawalSection.jsx` (escolher valor)
