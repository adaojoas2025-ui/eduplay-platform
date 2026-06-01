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
POST /api/v1/baixatudo/licenses/activate
POST /api/v1/baixatudo/licenses/validate
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
- `renewLicenseFromPayment(email, days, { paymentId, prefix, notes })`

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

## Ativacao na extensao

A extensao possui um campo para colar a chave recebida por email no formato:

```text
BT-XXXX-XXXX-XXXX-XXXX
```

Quando o usuario clica em `Ativar licenca`, a extensao chama o backend do EducaplayJA e salva localmente:

- chave da licenca;
- identificador local do dispositivo;
- status da licenca;
- data de validade.

Quando a validacao retorna sucesso, o widget passa a exibir:

```text
Licenca ativa ate DD/MM/AAAA.
```

Esse texto vale tanto para o plano mensal quanto para o anual. A diferenca fica na data calculada pelo backend:

```text
Mensal: data de expiracao em 30 dias
Anual:  data de expiracao em 365 dias
```
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

## Administracao de licencas automaticas

A regra oficial do BaixaTudo e 100% automatica: a licenca comercial deve ser criada
ou renovada somente depois da confirmacao de pagamento pelo Mercado Pago.

O administrador nao deve gerar licenca manualmente como substituto de pagamento.
O painel administrativo deve ser usado apenas para suporte e acompanhamento:

- consultar licencas geradas automaticamente;
- verificar email, plano, validade e status;
- reenviar email de ativacao;
- cancelar, bloquear ou revogar licencas quando necessario;
- auditar eventos de ativacao e validacao.

Qualquer rota antiga de criacao administrativa deve ser tratada como legado interno
e nao faz parte do fluxo oficial do produto.

Implementacao aplicada em 01/06/2026:

- rotas administrativas bloqueiam `product = baixatudo` e prefixo `BT`;
- webhook do Mercado Pago chama `renewLicenseFromPayment`;
- cada pagamento aprovado grava evento `payment:<id>` para impedir duplicidade;
- compras repetidas renovam a validade da chave existente do mesmo email;
- reenvio do mesmo webhook nao cria nem envia uma nova chave.

---

## Atualizacao de status em 01/06/2026

A publicacao inicial na Chrome Web Store foi concluida como item `nao apresentado`.
A proxima fase deve transformar a licenca Pro em um fluxo completo e estavel:

- compra mensal ou anual pelo Mercado Pago;
- webhook automatico para gerar ou renovar chave `BT`;
- envio de email com chave e validade;
- validacao da chave pela extensao;
- painel administrativo para consultar, reenviar email, cancelar ou acompanhar licencas automaticas;
- retorno para modo gratuito quando a licenca expirar.

Link publico da extensao:

```text
https://chromewebstore.google.com/detail/baixatudo-video-downloader/njdlafdofhnnokoomgebclhgomhhkfbk
```

Documento consolidado da fase atual:

```text
docs/BAIXATUDO_STATUS_E_PROXIMAS_ETAPAS.md
```


