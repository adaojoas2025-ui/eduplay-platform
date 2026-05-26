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

## Proximo passo

Publicar este commit no GitHub e aguardar deploy do Render.

Depois do deploy, testar:

```text
https://educaplayja.com.br/baixatudo
```

Teste esperado:

1. Informar email.
2. Clicar em Comprar mensal ou Comprar anual.
3. Ser redirecionado para o Mercado Pago.
4. Apos pagamento aprovado, receber chave `BT-...` automaticamente por email.
