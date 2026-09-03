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

---

## Teste gratis de 1 dia - controle anti-abuso

Atualizado em: 25/06/2026

O teste gratis da IRP Master cria uma licenca com validade de 1 dia e registra o uso na tabela `IrpTrialClaim`.

Endpoint publico:

```text
POST /api/v1/licenses/trial
```

Payload esperado a partir da extensao `1.0.13`:

```json
{
  "email": "usuario@email.com",
  "deviceId": "dev_...",
  "clientFingerprint": "hash-tecnico",
  "extensionVersion": "1.0.13"
}
```

Regras de bloqueio automatico:

- mesmo email normalizado;
- mesmo `deviceId`;
- mesmo `clientFingerprint`.

O IP e gravado apenas para auditoria. Ele nao bloqueia o teste, porque reparticoes, escolas, empresas e orgaos publicos podem ter varios computadores usando o mesmo IP externo.

Campos importantes em `IrpTrialClaim`:

- `emailNormalized`;
- `deviceId`;
- `clientFingerprint`;
- `ip`;
- `licenseKey`;
- `createdAt`.

Tela administrativa:

```text
GET /api/v1/licenses/admin/trials
https://educaplayja.com.br/#/admin/irp-licenses
```

A tela e somente leitura e mostra email, status, inicio, vencimento, ultimo uso, versao, dispositivo, fingerprint e chave mascarada.

### Auditoria de uso e tentativas

Atualizado em: 25/06/2026

O backend registra chamadas da extensao na tabela `IrpLicenseAttempt` para permitir auditoria de uso e tentativas bloqueadas sem alterar a extensao.

Tabela:

```text
IrpLicenseAttempt
```

Campos:

- `action`: `activate`, `validate`, `heartbeat` ou `trial`;
- `licenseKey`;
- `deviceId`;
- `extensionVersion`;
- `ip`;
- `valid`;
- `reason`;
- `message`;
- `createdAt`.

Endpoint administrativo:

```text
GET /api/v1/licenses/admin/attempts
```

Filtros:

- `page`;
- `limit`;
- `valid=true|false`;
- `action=activate|validate|heartbeat|trial`.

Resumo retornado:

- total de tentativas;
- tentativas permitidas;
- tentativas bloqueadas;
- chamadas nas ultimas 24 horas;
- bloqueadas nas ultimas 24 horas;
- dispositivos unicos com uso permitido nas ultimas 24 horas.

Observacao: como a validacao comum da extensao envia chave e dispositivo, mas nao email, o painel associa o uso ao usuario comparando a chave mascarada da tentativa com a chave exibida na tabela de licencas/testes.

Privacidade: o `clientFingerprint` e um hash tecnico do ambiente do navegador. Ele nao le arquivos, planilhas, senhas, documentos, CPF, dados de pagamento ou dados da tela do SIASG.

## Teste gratis por quantidade de itens (substitui o teste de 1 dia)

Atualizado em: 03/09/2026

**Motivo da mudanca:** o uso do IRP Master e esporadico (um cadastro completo de IRP a cada
~3 meses por cliente). Com o teste de 24h antigo, quem testava conseguia terminar o
trabalho inteiro de graca numa unica sessao e so precisava da ferramenta de novo meses
depois — sem nenhuma receita associada aquele uso. O teste gratis agora e limitado por
**quantidade de itens processados com sucesso** (nao mais por tempo): o suficiente pra
provar que a automacao funciona, nao o suficiente pra terminar um trabalho real.

O pool de itens e **compartilhado entre as tres automacoes que escrevem no portal**
(UASG Local/Quantidade, Detalhes do Item, Beneficios ME/EPP) — nao ha limite separado por
categoria. **Limite padrao: 11 itens no total**, entre qualquer combinacao das tres.

`expiresAt` continua existindo, mas agora e so uma rede de seguranca (30 dias por padrao,
tambem configuravel) — quem realmente bloqueia o uso e `trialItemsLimit`/`trialItemsUsed`.

### Colunas novas em `IrpLicense`

| Coluna | Tipo | Descricao |
|---|---|---|
| `trialItemsLimit` | INTEGER, nullable | Limite de itens do trial, gravado como snapshot na criacao. `NULL` = licenca paga/cortesia, sem limite de itens. |
| `trialItemsUsed` | INTEGER, default 0 | Itens ja consumidos (nunca ultrapassa `trialItemsLimit`, mesmo com valor inflado enviado pelo cliente). |

### Tabela nova `IrpTrialConsumption` (idempotencia)

Garante que uma mesma execucao da automacao (`runId`, gerado uma vez pela extensao por
execucao) nunca e contada duas vezes, mesmo com reenvio de rede. `runId` tem indice
**unico** — a insercao nessa tabela e o proprio mecanismo atomico que decide quem "ganha"
o direito de incrementar `trialItemsUsed` numa corrida entre chamadas simultaneas com o
mesmo `runId`.

| Coluna | Tipo | Descricao |
|---|---|---|
| `runId` | TEXT, unique | Identificador da execucao, gerado uma vez pela extensao |
| `licenseKey` | TEXT | Licenca associada |
| `itemsRequested` | INTEGER | Valor enviado pelo cliente |
| `itemsApplied` | INTEGER | Quanto foi de fato somado (pode ser menor que `itemsRequested` se estourasse o limite; 0 numa repeticao do mesmo `runId`) |
| `flow` | TEXT | `'uasg_local'` \| `'detalhes'` \| `'beneficios'` |

### Tabela nova `IrpConfig` (chave/valor, tunavel sem deploy)

| Chave | Fallback se a linha nao existir |
|---|---|
| `trial_items_limit_default` | `11` |
| `trial_safety_net_days` | `30` |

Editar via `IrpConfig` (SQL direto ou Prisma Studio) muda o limite de trials **futuros**
imediatamente, sem precisar publicar nova versao do backend nem da extensao. Trials ja
concedidos mantem o `trialItemsLimit` que foi gravado no momento da criacao.

### POST /api/v1/licenses/trial — resposta estendida

```json
{
  "valid": true,
  "licenseKey": "IRP-XXXX-XXXX-XXXX-XXXX",
  "expiresAt": "2026-10-03T00:00:00.000Z",
  "daysRemaining": 30,
  "quota": { "itemsLimit": 11, "itemsUsed": 0, "itemsRemaining": 11 },
  "message": "Teste grátis ativado! Você pode processar até 11 itens..."
}
```

### POST /api/v1/licenses/trial/consume *(novo)*

Chamado pela extensao apos cada execucao de UASG Local/Quantidade, Detalhes do Item ou
Beneficios ME/EPP, reportando quantos itens foram processados com sucesso.

**Request:**
```json
{
  "licenseKey": "IRP-XXXX-XXXX-XXXX-XXXX",
  "deviceId": "dev_...",
  "runId": "uuid-gerado-pela-extensao-por-execucao",
  "itemsCompleted": 7,
  "flow": "detalhes"
}
```

**Response (licenca em trial):**
```json
{
  "valid": true,
  "quota": { "itemsLimit": 11, "itemsUsed": 7, "itemsRemaining": 4 },
  "applied": 7,
  "alreadyConsumed": false
}
```

**Response (licenca paga/cortesia — `trialItemsLimit` NULL, nada a consumir):**
```json
{ "valid": true, "quota": null, "applied": 0, "alreadyConsumed": false }
```

**Response (mesmo `runId` reenviado — idempotente, nao soma de novo):**
```json
{
  "valid": true,
  "quota": { "itemsLimit": 11, "itemsUsed": 7, "itemsRemaining": 4 },
  "applied": 7,
  "alreadyConsumed": true
}
```

Erros: `404` com `reason:"not_found"` (chave invalida) ou `409` com `reason:"device_changed"`
(licenca ativada em outro dispositivo).

### `validate`, `heartbeat`, `activate`, `sync` — todos ganham `quota`

Todas as respostas dessas quatro rotas passam a incluir o mesmo campo `quota` (ou `null`
pra licenca sem limite de itens). Isso deixa a checagem de cota "de carona" na chamada de
licenca que a extensao ja faz antes de cada acao — nenhuma chamada de rede nova e
necessaria so pra saber se ainda sobra cota, apenas pra *reportar* uso depois de um run
(`/trial/consume`).

**Importante:** `valid:true` sozinho **nao** significa mais "pode iniciar uma nova automacao"
para uma licenca em trial — e preciso checar tambem `quota.itemsRemaining > 0`. As duas
condicoes sao independentes e precisam ser verdadeiras juntas.

### POST /api/v1/licenses/admin/reset-trial-claim *(novo)*

Uso administrativo: libera um novo teste grátis pra um e-mail, removendo o registro em
`IrpTrialClaim` que bloqueia um segundo pedido (`already_used`). Não cria nem altera
nenhuma licença — só limpa o bloqueio, deixando o próximo `POST /trial` (chamado
normalmente pela extensão) seguir o fluxo real de novo. Útil pra suporte a um cliente
legítimo que reinstalou/trocou de dispositivo, e para o próprio dono do produto testar o
fluxo de trial repetidamente sem precisar de um e-mail novo a cada vez.

**Request:**
```
Header: x-admin-secret: irpmaster2026admin
POST /api/v1/licenses/admin/reset-trial-claim
{ "email": "cliente@example.com" }
```

**Response:**
```json
{ "ok": true, "removed": 1, "emailNormalized": "cliente@example.com", "licenseKeys": ["IRP-XXXX-XXXX-XXXX-XXXX"] }
```

### Teste automatizado

`backend/tests/irp-trial-item-quota.test.js` (roda com `node --test tests/irp-trial-item-quota.test.js`,
sem precisar de banco real nem `npm install` — usa um mock em memoria com indice unico
real de `runId`, igual ao padrao ja usado em `tests/baixatudo-license-fix.test.js`) cobre
especificamente: (1) idempotencia de `/trial/consume` com `runId` repetido — o ponto de
maior risco de bug de receita dessa mudanca; (2) trava no limite mesmo com valor inflado
enviado pelo cliente; (3) licenca paga nunca e afetada; (4) dispositivo trocado e
rejeitado; (5) `claimTrialLicense` usa o fallback de 11 itens quando `IrpConfig` nao tem
a linha `trial_items_limit_default`.

### E-mail do trial (`sendIrpTrialEmail`)

Assinatura mudou de `(email, licenseKey, expiresAt)` para
`(email, licenseKey, expiresAt, itemsLimit)`. O texto do e-mail nao fala mais em "1 dia" —
fala em "ate N itens" (com `expiresAt` mencionado como validade secundaria/rede de
seguranca).

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
| `c33c54e` | feat: add IRP trial admin view |
| `455f99e` | fix: use standard admin auth for IRP trials |
| `120dfa2` | docs: document IRP trial admin view |
| `3e8b3cc` | fix: strengthen IRP trial tracking |
| `7504434` | feat: add IRP license attempt monitoring |
