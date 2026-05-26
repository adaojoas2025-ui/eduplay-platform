# BaixaTudo Pro - Licenca automatica

Data: 26/05/2026

Este documento registra o modelo automatico de venda e liberacao do BaixaTudo Pro.

## Planos definidos

```text
Mensal: R$ 9,99 - validade de 30 dias
Anual:  R$ 39,90 - validade de 365 dias
```

O plano anual e a melhor oferta.

## Fluxo automatico

1. Cliente acessa `https://educaplayja.com.br/baixatudo`.
2. Informa nome e email.
3. Escolhe plano mensal ou anual.
4. O frontend chama:

```text
POST /api/v1/baixatudo/checkout
```

5. O backend cria uma preferencia no Mercado Pago com metadata:

```json
{
  "product_type": "baixatudo_license",
  "license_prefix": "BT",
  "license_days": 30,
  "plan": "monthly",
  "plan_label": "Mensal"
}
```

ou, para anual:

```json
{
  "product_type": "baixatudo_license",
  "license_prefix": "BT",
  "license_days": 365,
  "plan": "annual",
  "plan_label": "Anual"
}
```

6. Cliente paga no Mercado Pago.
7. Mercado Pago chama:

```text
POST /api/v1/webhooks/mercadopago
```

8. O webhook identifica `product_type = baixatudo_license`.
9. O backend cria ou renova uma licenca com prefixo:

```text
BT-XXXX-XXXX-XXXX-XXXX
```

10. O sistema envia automaticamente um email para o comprador com a chave e a validade.

## Endpoints criados

Arquivo:

```text
backend/src/routes/baixatudo.js
```

Rotas:

```text
GET  /api/v1/baixatudo/plans
POST /api/v1/baixatudo/checkout
```

Rota registrada em:

```text
backend/src/api/routes/index.js
```

## Licencas

O sistema reaproveita a base de licencas existente do IRP Master, mas agora aceita
prefixo customizado.

Arquivo:

```text
backend/src/services/license.service.js
```

Mudancas:

- `generateLicenseKey(prefix)`
- `createLicense(email, days, notes, { prefix })`
- `renewLicense(email, days, { prefix, notes })`

Para BaixaTudo, o prefixo usado e:

```text
BT
```

Para IRP Master, o prefixo continua:

```text
IRP
```

Isso evita misturar licencas de produtos diferentes para o mesmo email.

## Email automatico

Arquivo:

```text
backend/src/services/email.service.js
```

Funcao adicionada:

```text
sendBaixaTudoLicenseEmail(email, licenseKey, expiresAt, planLabel)
```

O email informa:

- Nome do plano.
- Chave de licenca.
- Data de validade.
- Passos para ativar na extensao.
- Aviso de uso responsavel.

## Pagina publica

Arquivo principal publicado:

```text
frontend/public/baixatudo/index.html
```

A pagina agora possui:

- Campo de nome.
- Campo de email.
- Botao Comprar mensal.
- Botao Comprar anual.
- Redirecionamento automatico para Mercado Pago.

Endpoint chamado pela pagina:

```text
https://eduplay-backend-yw7z.onrender.com/api/v1/baixatudo/checkout
```

## Validacao tecnica

Comandos executados com sucesso:

```bash
node --check backend/src/services/license.service.js
node --check backend/src/routes/baixatudo.js
node --check backend/src/api/routes/webhook.routes.js
node --check backend/src/services/email.service.js
npm run build
```

## Status de publicacao

O checkout e a geracao automatica de licencas ja foram implementados e publicados
no EducaplayJA.

Validacoes em producao:

```text
https://educaplayja.com.br/baixatudo
https://eduplay-backend-yw7z.onrender.com/api/v1/baixatudo/plans
```

## Decisao de ordem

Antes de vender amplamente, a extensao deve ser enviada primeiro para a Chrome
Web Store.

Ordem definida:

1. Subir a extensao BaixaTudo na Chrome Web Store.
2. Aguardar aprovacao/publicacao.
3. Testar o fluxo de compra e geracao de licenca.
4. Integrar/validar a ativacao Pro dentro da extensao, caso ainda nao esteja na
   versao enviada.
5. Divulgar a venda dos planos mensal e anual.

## Dados para Chrome Web Store

Pagina oficial:

```text
https://educaplayja.com.br/baixatudo
```

Politica de privacidade:

```text
https://educaplayja.com.br/baixatudo/privacidade
```

Planos definidos para uso comercial posterior:

```text
Mensal: R$ 9,99
Anual: R$ 39,90
```

ZIP local gerado para envio/teste:

```text
C:\tmp\baixatudo-webstore-20260526-164626.zip
```

Observacao: antes do envio definitivo, revisar se a versao da extensao que sera
enviada contem o comportamento desejado para a primeira publicacao. A versao atual
da extensao local possui bloqueio por senha do dono e ainda precisa da tela final
de ativacao de licenca `BT-...` caso a publicacao ja seja feita como Pro.

## Gerar licenca manual sem pagamento

Tambem existe uma rota administrativa para gerar ou renovar licenca sem pagamento.
Use apenas para testes, cortesia, suporte ou liberacao manual autorizada.

### Pelo login ADMIN do EducaplayJA

Estando logado como administrador no site, abra o console do navegador e execute:

```js
fetch('https://eduplay-backend-yw7z.onrender.com/api/v1/licenses/admin/create-auth', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    product: 'baixatudo',
    email: 'cliente@email.com',
    days: 365,
    notes: 'Licenca BaixaTudo Pro anual liberada manualmente'
  })
}).then(r => r.json()).then(console.log);
```

Resposta esperada:

```json
{
  "ok": true,
  "prefix": "BT",
  "createdBy": "admin@educaplayja.com.br",
  "renewed": false,
  "licenseKey": "BT-XXXX-XXXX-XXXX-XXXX",
  "expiresAt": "2027-05-26T00:00:00.000Z"
}
```

Para plano mensal manual:

```js
body: JSON.stringify({
  product: 'baixatudo',
  email: 'cliente@email.com',
  days: 30,
  notes: 'Licenca BaixaTudo Pro mensal liberada manualmente'
})
```

### Pelo segredo administrativo

A rota antiga com segredo continua funcionando:

```bash
curl -X POST https://eduplay-backend-yw7z.onrender.com/api/v1/licenses/admin/create \
  -H "x-admin-secret: SEU_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d "{\"product\":\"baixatudo\",\"email\":\"cliente@email.com\",\"days\":365}"
```

Essa rota tambem gera chave com prefixo `BT` quando `product` e `baixatudo`.
