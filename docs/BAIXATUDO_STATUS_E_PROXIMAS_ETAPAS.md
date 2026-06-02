# BaixaTudo - Status atual e proximas etapas

Data: 01/06/2026

Este documento consolida o estado atual do BaixaTudo depois da publicacao inicial
na Chrome Web Store e antes das proximas implementacoes de licenca, pagamento,
painel administrativo de acompanhamento e versao Firefox.

## Repositorio

Repositorio informado pelo dono do projeto:

```text
https://github.com/adaojoas2025-ui/eduplay-platform
```

Branch usada como base local:

```text
main
```

Commit base antes desta documentacao:

```text
d2a1e5a
```

Documento de restauracao relacionado:

```text
docs/PONTO_RESTAURACAO_BAIXATUDO.md
```

## Publicacao atual na Chrome Web Store

A extensao BaixaTudo foi publicada na Chrome Web Store em modo nao apresentado.
Isso significa que ela nao aparece em buscas publicas da loja, mas pode ser
acessada por link direto.

Link publico confirmado:

```text
https://chromewebstore.google.com/detail/baixatudo-video-downloader/njdlafdofhnnokoomgebclhgomhhkfbk
```

ID da extensao:

```text
njdlafdofhnnokoomgebclhgomhhkfbk
```

Versao publicada/registrada no painel:

```text
2.1.6
```

Pagina oficial usada na ficha da loja:

```text
https://educaplayja.com.br/baixatudo
```

Politica de privacidade usada na ficha da loja:

```text
https://educaplayja.com.br/baixatudo/privacidade
```

Video promocional usado na ficha da loja:

```text
https://youtu.be/ZAlcI3G0bfs
```

## Modelo comercial definido

Planos definidos pelo dono do projeto:

```text
Mensal: R$ 9,99 - validade de 30 dias
Anual:  R$ 39,90 - validade de 365 dias
```

A versao gratuita/manual deve continuar permitindo uso basico. O modo automatico
completo deve ser tratado como recurso Pro, liberado por licenca valida.

## Comportamento esperado da extensao

### Sem licenca Pro

- A extensao abre apenas quando o usuario clica no icone.
- O download manual continua disponivel.
- O modo automatico pode baixar somente a amostra gratuita definida pelo produto,
  ou exibir mensagem informando que o automatico completo exige Pro.
- A extensao nao deve derrubar login, nao deve forcar navegacao e nao deve ficar
  recarregando paginas.

### Com licenca Pro valida

- Modo automatico completo liberado.
- A extensao pode baixar todas as aulas detectadas, respeitando a fila local.
- A extensao deve continuar usando o gerenciador nativo de downloads do navegador.
- A extensao deve manter controle local de progresso para parar e retomar quando
  aplicavel.

### Aulas em gravacao

Quando uma aula estiver indisponivel com mensagem de gravacao, o comportamento
esperado e registrar um marcador com o nome da aula e o status `em gravacao`, em
vez de simplesmente ignorar a aula.

Exemplo de nome esperado:

```text
012_Interpretacao_de_Texto_em_gravacao.txt
```

O conteudo do marcador pode conter:

```text
Aula em processo de gravacao.
Data provavel informada pela plataforma, quando disponivel.
URL da aula, quando disponivel.
```

## Licenca automatica pelo Mercado Pago

Fluxo implementado:

1. Usuario acessa `https://educaplayja.com.br/baixatudo`.
2. Informa nome e email.
3. Escolhe plano mensal ou anual.
4. Frontend chama o backend para criar checkout.
5. Mercado Pago confirma pagamento por webhook.
6. Backend gera ou renova a licenca BaixaTudo com prefixo `BT`.
7. Backend envia email ao comprador com chave e validade.
8. Extensao valida a chave no backend e libera o modo Pro.

Endpoints principais:

```text
GET  /api/v1/baixatudo/plans
POST /api/v1/baixatudo/checkout
POST /api/v1/webhooks/mercadopago
POST /api/v1/baixatudo/licenses/activate
POST /api/v1/baixatudo/licenses/validate
```

Implementacao registrada em 01/06/2026:

- o checkout do BaixaTudo envia `buyer_email` e `buyer_name` no metadata do Mercado Pago;
- o webhook usa `buyer_email` como email oficial para criar ou renovar a licenca;
- a licenca BaixaTudo e criada com prefixo `BT`;
- o webhook registra o evento `payment:<id>` em `IrpLicenseEvent`;
- se o Mercado Pago reenviar o mesmo pagamento, o backend reconhece duplicidade e nao cria nova licenca;
- a extensao pode ativar e validar chaves BaixaTudo em endpoints separados de `/api/v1/baixatudo`;
- rotas administrativas antigas nao podem criar licencas com produto `baixatudo` ou prefixo `BT`.

## Administracao de licencas

A regra oficial do BaixaTudo e automatica: toda licenca comercial deve nascer de
um pagamento confirmado pelo Mercado Pago e processado pelo webhook do backend.

O administrador nao deve gerar licenca manualmente para substituir pagamento. O
painel administrativo deve servir para acompanhamento e suporte operacional.

Funcoes administrativas permitidas:

- consultar licencas geradas automaticamente;
- verificar status, plano, email e validade;
- reenviar email de ativacao quando necessario;
- cancelar, bloquear ou revogar uma licenca com problema;
- consultar eventos de ativacao e validacao.

Regras:

- Nunca colocar senha administrativa dentro da extensao.
- Nao criar licencas comerciais fora do fluxo de pagamento automatico.
- Licencas BaixaTudo devem continuar usando prefixo `BT`.

## Dados minimos de licenca

Campos recomendados para persistencia:

```text
id
product
email
licenseKey
plan
status
source
expiresAt
paymentId
mercadoPagoStatus
notes
createdAt
updatedAt
```

Valores esperados:

```text
product: baixatudo
status: active | expired | cancelled | revoked
source: mercadopago
plan: monthly | annual
```

## Cuidados de privacidade e seguranca

- Nao coletar senha do usuario.
- Nao coletar dados de pagamento dentro da extensao.
- Nao armazenar historico de navegacao no backend por padrao.
- Nao enviar URLs de video para o EducaplayJA sem necessidade tecnica clara.
- Validar licenca no servidor.
- Fazer webhook idempotente para evitar duplicar licencas no Mercado Pago.
- Tratar expiracao de licenca de forma previsivel, retornando para modo gratuito.

## Versao Firefox

Existe uma linha separada de trabalho para Firefox, baseada na versao local do
BaixaTudo, com documentacao propria dentro da pasta da extensao Firefox.

Pasta local usada para testes:

```text
C:\Users\adao\Downloads\baixatudo-firefox-2.1.6-sem-limite-gravacao
```

Pacote local gerado:

```text
C:\Users\adao\Downloads\baixatudo-firefox-2.1.6-sem-limite-gravacao.zip
```

A documentacao especifica da versao Firefox deve ficar dentro da pasta da propria
extensao, em:

```text
docs-firefox
```

## Ordem recomendada das proximas implementacoes

1. Confirmar documentacao e ponto de restauracao.
2. Revisar o modelo de licencas existente no backend.
3. Implementar/validar endpoints de checkout e licenca BaixaTudo.
4. Implementar painel administrativo somente para consulta, suporte, reenvio e cancelamento de licencas automaticas.
5. Implementar validacao Pro na extensao sem quebrar login das plataformas.
6. Testar fluxo gratuito e Pro pago automatico.
7. Atualizar pagina publica com instrucoes de ativacao.
8. Atualizar pacote da Web Store quando a versao Pro estiver estavel.
9. Separar e testar pacote Firefox.

## Checklist antes de publicar nova versao na loja

- A extensao abre pelo icone em paginas de curso.
- A extensao nao abre sozinha.
- A extensao nao derruba login.
- A extensao nao forca navegacao repetida.
- Download manual funciona.
- Download automatico respeita regra Free/Pro.
- Aulas em gravacao geram marcador com nome correto.
- Licenca valida libera Pro.
- Licenca expirada volta para Free.
- Politica de privacidade continua coerente com as permissoes.
- ZIP final contem `manifest.json` na raiz.
- Todos os arquivos JS estao em UTF-8.

## Mapa tecnico encontrado no backend em 01/06/2026

Arquivos ja existentes relacionados ao BaixaTudo e licencas:

```text
backend/src/routes/baixatudo.js
backend/src/routes/licenses.js
backend/src/controllers/licenseController.js
backend/src/services/license.service.js
backend/src/services/email.service.js
backend/src/api/routes/webhook.routes.js
backend/src/api/routes/index.js
backend/prisma/schema.prisma
```

Pontos ja presentes no codigo:

- Rota `GET /api/v1/baixatudo/plans`.
- Rota `POST /api/v1/baixatudo/checkout`.
- Registro de rotas `licenses` e `baixatudo` em `backend/src/api/routes/index.js`.
- Webhook Mercado Pago em `POST /api/v1/webhooks/mercadopago`.
- Geracao/renovacao de licenca por prefixo, incluindo `BT` para BaixaTudo.
- Email `sendBaixaTudoLicenseEmail` para envio da chave ao comprador.
- Tabelas `IrpLicense` e `IrpLicenseEvent`, reaproveitadas para licencas de extensoes.

Ponto de atencao para a proxima implementacao:

O backend usa a tabela `IrpLicense` tambem para BaixaTudo. Isso funciona pelo
prefixo `BT`, mas a documentacao e o painel administrativo devem deixar claro que o campo
`licenseKey` identifica o produto pelo prefixo:

```text
BT-XXXX-XXXX-XXXX-XXXX  = BaixaTudo
IRP-XXXX-XXXX-XXXX-XXXX = IRP Master
```

Antes de criar novas tabelas, revisar se o reaproveitamento atende ao fluxo atual.
Se atender, a proxima etapa deve focar em checkout, webhook, painel de acompanhamento e tela de ativacao, e nao
em mudar schema sem necessidade.


## Licenca cortesia ou presente

Status em 02/06/2026: implementado no Admin interno do EducaplayJA.

Tela:

```text
/admin/extensions
```

Endpoint:

```text
POST /api/v1/admin/extensions/baixatudo/courtesy-licenses
```

A cortesia permite gerar ou renovar uma licenca `BT` sem pagamento, somente para uso administrativo. O fluxo aceita prazos por horas, dias, meses e anos, com motivo obrigatorio e envio opcional de email automatico.

Payload principal:

```json
{
  "email": "usuario@email.com",
  "durationValue": 30,
  "durationUnit": "days",
  "reason": "presente do administrador",
  "sendEmail": true
}
```

Regras implementadas:

- acesso somente para usuario com perfil `ADMIN`;
- rota criada em `/api/v1/admin/extensions`, separada do painel de vendedor/financeiro;
- prefixo da licenca BaixaTudo: `BT`;
- se o email ja tiver licenca `BT`, a licenca e renovada;
- se nao tiver, uma nova licenca e criada;
- notas registram `source:courtesy`, produto, admin, prazo e motivo;
- prazo minimo de 1 hora e maximo de 10 anos;
- a extensao nao gera cortesia e nao recebe segredo administrativo.

Isso nao exige novo pacote da extensao enquanto a extensao continuar validando chaves `BT` pelo backend. So sera necessario novo pacote se a regra visual, sincronizacao ou ativacao automatica da extensao mudar.

Documentacao especifica:

```text
docs/ADMIN_EXTENSOES.md
docs/BAIXATUDO_LICENCA_CORTESIA.md
```
