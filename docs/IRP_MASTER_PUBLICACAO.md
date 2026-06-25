# IRP Master - Publicacao e Licenca

Data: 03/06/2026

## Pagina publica

Rotas publicas:

- `/irp-master`
- `/irp-master/privacidade`

Arquivos React:

- `frontend/src/pages/IrpMaster.jsx`
- `frontend/src/pages/IrpMasterPrivacy.jsx`

Arquivos estaticos equivalentes:

- `frontend/public/irp-master/index.html`
- `frontend/public/irp-master/privacidade/index.html`

## Planos

- Mensal: R$ 50,00 - 30 dias
- Anual: R$ 239,90 - 365 dias

## Backend

Rota:

- `backend/src/routes/irp-master.js`

Montagem:

- `router.use('/irp-master', irpMasterRoutes)`

Endpoints:

- `GET /api/v1/irp-master/plans`
- `POST /api/v1/irp-master/checkout`
- `POST /api/v1/irp-master/licenses/activate`
- `POST /api/v1/irp-master/licenses/validate`
- `POST /api/v1/irp-master/licenses/sync`
- `POST /api/v1/irp-master/licenses/heartbeat`
- `POST /api/v1/irp-master/licenses/logout`

## Licenca

- Produto: `irp-master`
- Prefixo: `IRP`
- Chave: `IRP-XXXX-XXXX-XXXX-XXXX`
- Webhook Mercado Pago usa `metadata.product_type = irp_license`
- Sincronizacao por dispositivo usa evento de pagamento registrado com `device_id`

## Admin

IRP Master foi adicionada em:

- `/admin/extensions`

O admin pode gerar licenca cortesia para IRP Master usando:

- `POST /api/v1/admin/extensions/irp-master/courtesy-licenses`

## Teste gratis de 1 dia

Atualizado em: 25/06/2026

A IRP Master possui fluxo de teste gratis de 1 dia. O backend registra cada uso para evitar abuso por email, dispositivo e identificacao tecnica do navegador.

Endpoint publico usado pela extensao:

- `POST /api/v1/licenses/trial`

Dados minimos enviados:

```json
{
  "email": "usuario@email.com",
  "deviceId": "device-id-da-extensao",
  "clientFingerprint": "hash-tecnico-da-extensao",
  "extensionVersion": "1.0.0"
}
```

Observacao de versao:

- a extensao `1.0.12` envia email e `deviceId`;
- a extensao `1.0.13` passa a enviar tambem `clientFingerprint`;
- o pacote local gerado para esse ajuste e `C:\Users\adao\Downloads\IRP-Master-Automacao-v1.0.13-fingerprint.zip`.

Registro interno:

- tabela `IrpTrialClaim`;
- licenca criada com prefixo `IRP`;
- validade de 1 dia;
- bloqueio por e-mail normalizado, `deviceId` e `clientFingerprint`;
- IP registrado apenas para auditoria, sem bloquear reparticoes ou empresas com varios computadores na mesma rede;
- evento `trial_claimed` em `IrpLicenseEvent`;
- notas da licenca com `free trial - 1 day`.

## Admin - consulta de testes

Foi adicionada uma tela somente leitura para o administrador ver quem usou o teste de 1 dia.

Link direto:

- `/admin/irp-licenses`

Atalho no painel:

- `Admin Dashboard > Acoes Rapidas > IRP Licencas / Testes de 1 dia`

Endpoint administrativo:

- `GET /api/v1/licenses/admin/trials`

Autorizacao:

- login obrigatorio;
- perfil `ADMIN`;
- middleware `authenticate` + `isAdmin`.

Filtros:

- `page`
- `limit`
- `state=active|expired`
- `email`

Campos exibidos:

- email;
- status;
- inicio;
- vencimento;
- ultimo uso;
- versao;
- dispositivo;
- fingerprint;
- chave mascarada.

Essa tela nao altera a extensao e nao altera licencas. Ela serve apenas para consulta, suporte e auditoria.

## Regra para reparticoes e empresas

O sistema nao deve bloquear o teste gratis apenas por IP. Em orgaos publicos, escolas, escritorios e reparticoes, varios computadores podem compartilhar a mesma internet e o mesmo IP externo. Bloquear por IP impediria que usuarios legitimos testassem em maquinas diferentes.

Regra adotada:

- usuarios diferentes podem testar em computadores/perfis diferentes mesmo na mesma rede;
- o mesmo email nao deve receber varios testes gratis;
- o mesmo `deviceId` nao deve receber varios testes gratis;
- o mesmo `clientFingerprint`, enviado a partir da extensao `1.0.13`, nao deve receber varios testes gratis;
- o IP continua salvo apenas como sinal de auditoria e suporte.

Limite tecnico: em extensao de navegador, nao existe acesso confiavel ao numero de serie real do computador. Por isso o fingerprint e uma identificacao tecnica aproximada do ambiente do navegador, sem ler arquivos, planilhas, senhas ou documentos do usuario.

## Privacidade

A politica declara que a extensao:

- nao coleta senhas;
- nao coleta dados de pagamento;
- nao envia planilhas, itens ou dados oficiais da tela do SIASG ao servidor de licencas;
- usa `deviceId` apenas para licenciamento;
- usa dados da tela de forma local para automacao solicitada pelo usuario.
