# IRP Master Automação — Sistema de Licenças

Documentação das mudanças realizadas na plataforma Educaplayja para suportar o licenciamento da extensão Chrome **IRP Master Automação**.

---

## Visão geral

O sistema de licenças permite que a extensão Chrome valide se o usuário tem uma licença paga antes de executar qualquer automação. A plataforma Educaplayja atua como servidor de licenças e gateway de pagamento.

### Fluxo completo

```
Usuário compra licença na Educaplayja (Mercado Pago)
  → Webhook confirma pagamento
  → Sistema gera chave IRP-XXXX-XXXX-XXXX-XXXX
  → Envia chave por e-mail automaticamente
  → Usuário ativa a chave na extensão Chrome
  → Extensão valida com a API a cada uso
```

### Princípio de privacidade

O servidor de licenças recebe **apenas**: `licenseKey`, `deviceId`, `extensionVersion`.

**Nunca recebe**: planilha, itens, CATMATs, IRP, UASG, CPF, dados da tela do SIASG.

---

## Arquivos adicionados

### `prisma/schema.prisma`

Adicionados dois novos models ao final do arquivo:

```prisma
model IrpLicense {
  id               String            @id @default(uuid())
  licenseKey       String            @unique
  email            String
  status           String            @default("active")
  expiresAt        DateTime
  activeDeviceId   String?
  lastSeenAt       DateTime?
  extensionVersion String?
  notes            String?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  events           IrpLicenseEvent[]

  @@index([licenseKey])
  @@index([email])
  @@index([status])
}

model IrpLicenseEvent {
  id               String     @id @default(uuid())
  licenseId        String
  license          IrpLicense @relation(fields: [licenseId], references: [id], onDelete: Cascade)
  eventType        String
  deviceId         String?
  extensionVersion String?
  createdAt        DateTime   @default(now())

  @@index([licenseId])
}
```

**Tabelas criadas no banco:** `IrpLicense`, `IrpLicenseEvent`

**Eventos registrados em `IrpLicenseEvent`:**

| eventType | Quando ocorre |
|---|---|
| `created` | Licença criada (pagamento confirmado) |
| `activated` | Primeira ativação em dispositivo |
| `validated` | Validação normal a cada uso |
| `device_changed` | Troca de dispositivo |
| `expired` | Vencimento detectado |
| `blocked` | Bloqueio manual pelo admin |
| `renewed` | Renovação após pagamento |
| `logout` | Dispositivo desvinculado |

---

### `src/services/license.service.js` *(novo)*

Lógica de negócio das licenças.

**Funções exportadas:**

```js
generateLicenseKey()
// Gera chave no formato IRP-XXXX-XXXX-XXXX-XXXX
// Caracteres: A-Z e 2-9 (sem 0/O/1/I para evitar confusão)

createLicense(email, days, notes)
// Cria nova licença + evento "created"
// Retorna o objeto IrpLicense criado

activateLicense(licenseKey, deviceId, extensionVersion)
// Vincula deviceId à licença (primeira ativação ou troca de dispositivo)
// Retorna { valid, status, expiresAt, daysRemaining, message }

validateLicense(licenseKey, deviceId, extensionVersion)
// Valida chave + dispositivo a cada uso da extensão
// Retorna { valid, reason?, message }

heartbeat(licenseKey, deviceId)
// Atualiza lastSeenAt — chamado a cada 1 hora pela extensão
// Retorna { valid }

logoutLicense(licenseKey, deviceId)
// Desvincula o dispositivo atual
// Retorna { ok }

renewLicense(email, days)
// Renova licença existente (mesmo e-mail) ou cria nova
// Retorna { renewed, licenseKey, expiresAt }
```

**Status possíveis de licença:**

| Status | Descrição |
|---|---|
| `active` | Licença válida e em uso |
| `expired` | Data de vencimento ultrapassada |
| `blocked` | Bloqueada manualmente pelo admin |
| `cancelled` | Cancelada |

**Razões de bloqueio retornadas pela API:**

| reason | Descrição |
|---|---|
| `not_found` | Chave não existe |
| `expired` | Licença vencida |
| `blocked` | Licença bloqueada |
| `cancelled` | Licença cancelada |
| `device_changed` | Ativada em outro dispositivo |

---

### `src/controllers/licenseController.js` *(novo)*

Handlers HTTP para as rotas de licença.

**Funções:** `activate`, `validate`, `heartbeat`, `logout`

Todas as rotas são **públicas** (sem JWT). A autenticação é feita pela combinação `licenseKey + deviceId`.

---

### `src/routes/licenses.js` *(novo)*

```
POST /api/v1/licenses/activate   → licenseController.activate
POST /api/v1/licenses/validate   → licenseController.validate
POST /api/v1/licenses/heartbeat  → licenseController.heartbeat
POST /api/v1/licenses/logout     → licenseController.logout
```

---

## Arquivos modificados

### `src/api/routes/index.js`

Adicionado registro das rotas de licença:

```js
const licenseRoutes = require('../../routes/licenses');
router.use('/licenses', licenseRoutes);
```

---

### `src/api/routes/webhook.routes.js`

Implementado o handler real do Mercado Pago (antes era placeholder).

**Lógica adicionada em `POST /api/v1/webhooks/mercadopago`:**

1. Responde `200` imediatamente (MP retenta se não receber 200 rápido)
2. Verifica se `type === 'payment'`
3. Busca detalhes do pagamento na API do Mercado Pago
4. Verifica se é pagamento aprovado (`status === 'approved'`)
5. Identifica se é produto IRP Master pelo campo `description` ou `metadata.product_type === 'irp_license'`
6. Extrai e-mail do pagador
7. Determina validade em dias via `metadata.license_days` (padrão: 30 dias)
8. Chama `licenseService.renewLicense(email, days)` — cria ou renova
9. Envia e-mail com a chave via `emailService.sendIrpLicenseEmail()`

**Como identificar produto IRP no Mercado Pago:**

Na criação do produto/preferência, incluir em `metadata`:
```json
{
  "product_type": "irp_license",
  "license_days": 30
}
```
Ou garantir que a `description` contenha "irp master".

---

### `src/services/email.service.js`

Adicionada função `sendIrpLicenseEmail(email, licenseKey, expiresAt)`.

Envia e-mail com:
- Chave destacada em verde
- Data de validade
- Instruções de ativação passo a passo (4 passos)
- Aviso legal sobre responsabilidade do usuário

Exportada junto das demais funções no `module.exports`.

---

## API Reference

### POST /api/v1/licenses/activate

**Request:**
```json
{
  "licenseKey": "IRP-XXXX-XXXX-XXXX-XXXX",
  "deviceId": "dev_1234567890_uuid",
  "extensionVersion": "1.0.0"
}
```

**Response (sucesso):**
```json
{
  "valid": true,
  "status": "active",
  "expiresAt": "2026-06-10T00:00:00.000Z",
  "daysRemaining": 30,
  "message": "Licença ativada com sucesso."
}
```

**Response (falha):**
```json
{
  "valid": false,
  "reason": "not_found",
  "message": "Chave de licença inválida."
}
```

---

### POST /api/v1/licenses/validate

Mesmo payload e formato de resposta do `/activate`.

---

### POST /api/v1/licenses/heartbeat

**Request:**
```json
{ "licenseKey": "IRP-XXXX-XXXX-XXXX-XXXX", "deviceId": "dev_..." }
```

**Response:**
```json
{ "valid": true }
```

---

### POST /api/v1/licenses/logout

**Request:**
```json
{ "licenseKey": "IRP-XXXX-XXXX-XXXX-XXXX", "deviceId": "dev_..." }
```

**Response:**
```json
{ "ok": true }
```

---

## Criar licença manualmente (admin)

### Via script Node.js

```bash
cd C:\projetos\backend
node criar-chave-teste.js
```

### Via Prisma Studio

```bash
cd C:\projetos\backend
npx prisma studio
# Abre em http://localhost:5555
# Navegar até IrpLicense → Add record
```

### Via SQL direto

```sql
INSERT INTO "IrpLicense" (id, "licenseKey", email, status, "expiresAt", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'IRP-XXXX-XXXX-XXXX-XXXX',
  'cliente@email.com',
  'active',
  NOW() + INTERVAL '30 days',
  NOW(),
  NOW()
);
```

---

## Renovação automática

Quando um cliente paga novamente com o mesmo e-mail:
- `renewLicense()` detecta licença existente (status `active` ou `expired`)
- Estende a validade a partir da data atual (ou da data de expiração se ainda no futuro)
- Registra evento `renewed`
- **Não gera nova chave** — o cliente usa a mesma

Se o e-mail for diferente: gera nova licença com nova chave.

---

## Correções e ajustes pós-implantação

### `src/services/license.service.js` — reescrito com SQL direto

**Problema:** O Prisma client em produção (Render) estava cacheado sem o modelo `irpLicense`, causando erro 500 em todos os endpoints.

**Solução:** Todas as funções foram reescritas usando `prisma.$queryRawUnsafe` e `prisma.$executeRawUnsafe` — SQL direto que não depende dos modelos gerados do Prisma.

### `src/routes/licenses.js` — endpoint admin adicionado

```
POST /api/v1/licenses/admin/create
  Header: x-admin-secret: irpmaster2026admin
  Body: { email, days }
  → Cria ou renova licença manualmente (para admin)
```

### `scripts/start-with-migrate.js` — criação automática de tabelas

Adicionada função `ensureIrpTables()` que cria as tabelas `IrpLicense` e `IrpLicenseEvent` automaticamente em cada startup, usando `CREATE TABLE IF NOT EXISTS`. Garante que as tabelas existam mesmo em bancos de produção novos.

### `src/app.js` — CORS liberado para extensão Chrome

**Problema:** O CORS bloqueava requisições com `Origin: chrome-extension://...`, causando erro 500 na extensão.

**Solução:** Adicionada regra que permite todas as origens `chrome-extension://`:

```js
if (origin && origin.startsWith('chrome-extension://')) {
  return callback(null, true);
}
```

### Scripts utilitários criados

| Arquivo | Uso |
|---|---|
| `criar-chave-teste.js` | Cria chave de teste no banco LOCAL |
| `criar-tabelas-producao.js` | Cria tabelas via Prisma no banco de produção |
| `setup-producao.js` | Cria tabelas + chave de teste via `pg` direto |

---

## Commits relacionados

| Hash | Descrição |
|---|---|
| `b6bf2f0` | feat: add IRP Master license system |
| `3cd7997` | feat: IRP license email + Mercado Pago webhook |
| `48601a4` | docs: add IRP Master license system documentation |
| `93529a1` | feat: add migration for IRP license tables |
| `6b0886d` | feat: add admin endpoint to create IRP licenses |
| `47d7f45` | fix: auto-create IRP license tables on startup |
| `405a748` | fix: expose error message for debugging |
| `42a1ffb` | fix: rewrite license service with raw SQL |
| `1b881ca` | fix: allow Chrome extension origins in CORS |
