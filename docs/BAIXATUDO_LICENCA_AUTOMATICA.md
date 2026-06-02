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

## Ativacao automatica sem colar chave

A extensao tambem suporta ativacao automatica apos o pagamento, sem exigir que o usuario cole a chave manualmente.

Fluxo:

1. O usuario clica em `Pagar / ativar Pro` dentro do widget da extensao.
2. A extensao gera ou reutiliza um `deviceId` local e abre:

```text
https://educaplayja.com.br/baixatudo?source=extension&deviceId=DEVICE_ID
```

3. A pagina publica envia o `deviceId` junto com o checkout:

```text
POST /api/v1/baixatudo/checkout
```

4. O backend grava o `device_id` na metadata da preferencia do Mercado Pago.
5. Quando o pagamento e aprovado, o webhook cria ou renova a licenca BT e registra o evento de pagamento com o `deviceId`.
6. A extensao consulta:

```text
POST /api/v1/baixatudo/licenses/sync
```

7. Se encontrar pagamento aprovado para aquele `deviceId`, o backend ativa a licenca automaticamente nesse navegador.

Com a licenca valida, o widget mostra:

```text
Licenca ativa ate DD/MM/AAAA.
Automatico Pro: baixar tudo
```

A chave BT continua sendo enviada por email e o campo manual permanece apenas como alternativa de recuperacao, caso o usuario troque de navegador, limpe os dados locais ou precise ativar em outro computador.
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



## Licenca cortesia ou presente

Status em 02/06/2026: ainda nao existe fluxo administrativo pronto para gerar licenca BaixaTudo de presente.

A regra comercial continua sendo automatica: toda licenca vendida deve nascer de pagamento confirmado pelo Mercado Pago. Isso evita liberar acesso pago sem registro financeiro e mantem o webhook como fonte oficial para mensal e anual.

Para dar uma licenca de presente, o modelo correto e criar um fluxo separado de cortesia administrativa. Esse fluxo deve ser diferente de uma venda e deve registrar claramente que nao houve pagamento.

Regras recomendadas para cortesia:

- somente administrador autenticado do EducaplayJA pode gerar;
- nunca colocar senha administrativa dentro da extensao;
- usar prefixo `BT`, mas com `source = courtesy` ou nota equivalente;
- exigir email do beneficiario;
- exigir plano/prazo, por exemplo 30 ou 365 dias;
- exigir motivo, por exemplo presente, suporte, teste, parceria ou compensacao;
- registrar quem criou, data, email, validade e motivo em `IrpLicenseEvent` ou campo de notas;
- enviar a chave por email ao usuario;
- permitir ativacao pela extensao usando o campo manual de recuperacao;
- opcionalmente permitir sincronizacao por email/dispositivo no futuro.

A rota antiga `/api/v1/licenses/admin/create` continua bloqueando `product = baixatudo` e prefixo `BT`. Portanto, hoje ela nao deve ser usada para BaixaTudo. Antes de gerar presentes de verdade, implementar uma rota nova e explicita, por exemplo:

```text
POST /api/v1/baixatudo/admin/courtesy-license
```

Payload sugerido:

```json
{
  "email": "usuario@email.com",
  "days": 365,
  "reason": "presente do administrador",
  "sendEmail": true
}
```

Resposta esperada:

```json
{
  "ok": true,
  "source": "courtesy",
  "licenseKey": "BT-XXXX-XXXX-XXXX-XXXX",
  "expiresAt": "2027-06-02T00:00:00.000Z"
}
```

Essa funcionalidade deve entrar como melhoria administrativa, nao como substituto do checkout automatico.
