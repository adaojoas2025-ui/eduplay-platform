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

## Privacidade

A politica declara que a extensao:

- nao coleta senhas;
- nao coleta dados de pagamento;
- nao envia planilhas, itens ou dados oficiais da tela do SIASG ao servidor de licencas;
- usa `deviceId` apenas para licenciamento;
- usa dados da tela de forma local para automacao solicitada pelo usuario.
