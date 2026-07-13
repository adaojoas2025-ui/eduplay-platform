# BaixaTudo - regras de licenca

Atualizado em: 13/07/2026

## Vinculo de dispositivo

- Uma chave `BT-...` e vinculada ao primeiro `deviceId` que a ativa.
- Nova ativacao com outro `deviceId` deve retornar `valid: false` e `reason: device_changed`.
- A tentativa rejeitada nao pode substituir `activeDeviceId`.
- Liberacao ou troca de dispositivo deve ser feita pelo administrador.

## Cortesia

- Cada emissao de cortesia do BaixaTudo cria uma chave nova.
- O vencimento e calculado a partir do instante da emissao.
- Uma cortesia de `1 dia` vence exatamente 24 horas depois.
- Gerar nova cortesia nao renova nem amplia uma chave antiga.

## Separacao da IRP Master

A regra estrita e ativada somente pela rota do BaixaTudo com `strictDeviceBinding: true`. O fluxo de ativacao e renovacao da IRP Master permanece inalterado.

## Testes

Execute:

```powershell
node --test backend\tests\baixatudo-license-fix.test.js
```

## Auditoria de uso e tentativas (paridade com a IRP Master)

Adicionado em: 13/07/2026

O BaixaTudo passou a usar o mesmo sistema de rastreamento ja existente para a IRP Master, sem replicar o teste gratis de 1 dia (o BaixaTudo nao tem essa modalidade).

### O que mudou

- `activate`, `validate` e `sync` (`src/routes/baixatudo.js`) agora chamam `licenseService.recordLicenseAttempt(...)` a cada chamada, gravando na mesma tabela `IrpLicenseAttempt` ja usada pela IRP Master (chaves `BT-...` convivem com chaves `IRP-...` na mesma tabela, diferenciadas pelo prefixo).
- Novos endpoints, espelhando `licenseController.js`:
  - `POST /api/v1/baixatudo/licenses/heartbeat` — chamado pela extensao a cada hora (`chrome.alarms`) para manter `lastSeenAt` atualizado.
  - `POST /api/v1/baixatudo/licenses/logout` — libera o `activeDeviceId` da licenca.
- `licenseService.listLicenses()` e `licenseService.listLicenseAttempts()` agora aceitam um parametro `prefix` opcional (`BT` ou `IRP`) que filtra por `licenseKey LIKE '<prefix>-%'`, incluindo no resumo agregado (`summary`) das tentativas. Sem `prefix`, o comportamento antigo (todos os produtos misturados) e mantido.
- `GET /api/v1/licenses/admin/list` e `GET /api/v1/licenses/admin/attempts` aceitam `?prefix=BT` (ou `IRP`) para escopar a consulta a um unico produto.
- Corrigido bug pre-existente: o alias SQL `activeDevices24h` (sem aspas) era dobrado para `activedevices24h` pelo Postgres, fazendo o tile "Usando em 24h" nunca bater com o campo esperado pelo frontend. Corrigido para os dois produtos.
- Corrigido bug pre-existente no middleware `adminOnly` (`src/routes/licenses.js`): so aceitava um Bearer JWT se `decoded.role === 'ADMIN'` estivesse no proprio token, mas o fluxo de login ativo (`src/api/controllers/auth.controller.js` -> `src/config/jwt.js`) assina tokens so com `{ userId, type }`, sem `role`. Isso derrubava com 401 `Unauthorized` qualquer chamada admin real a `/admin/list` (e as demais rotas que usam `adminOnly`). Agora, quando o token nao tem `role`, o papel e buscado no banco pelo `userId`, igual ao middleware `isAdmin` ja usado em `/admin/attempts`.

### Extensao (background.js)

- Heartbeat a cada 60 minutos via `chrome.alarms` (`baixatudo_license_heartbeat`), so quando ha `licenseKey` e `deviceId` salvos localmente.
- Gate de validacao server-side antes do automatico (`startAutoDownloadWithLessons`): com licenca valida libera a fila completa (`freeAutoPendingLessons`); sem licenca ou invalida, limita a 1 aula de amostra por pasta (`firstAutoLessonPerFolder`, funcao que ja existia mas nao era usada); em caso de falha de rede, usa o ultimo estado local conhecido como tolerancia, para nao bloquear quem ja pagou so por estar offline no momento do clique.

### Dashboard admin

Nova pagina `frontend/src/pages/admin/BaixaTudoLicenses.jsx`, roteada em `/admin/baixatudo-licenses` e linkada em `AdminDashboard.jsx` e `Extensions.jsx`. Modelada em `IrpLicenses.jsx`, mas sem a tabela de testes gratis (nao existe no BaixaTudo) — no lugar, mostra a lista de licencas BaixaTudo (`GET /licenses/admin/list?prefix=BT`). Tiles: total de licencas, ativas, vencidas, "Usando em 24h" e "Bloqueadas 24h" (de `GET /licenses/admin/attempts?prefix=BT`).