# IRP Master - Publicacao e Licenca

## Regra atual de cortesia IRP Master - 21/10/2026

Cada nova cortesia no Admin gera uma chave IRP diferente e cancela as licencas
anteriores ativas ou expiradas do mesmo email e prefixo IRP. A chave nova nasce
sem dispositivo vinculado e pode ser ativada no dispositivo desejado; depois
da ativacao, continua valendo a vinculacao por dispositivo.

O prazo selecionado no formulario conta a partir da nova emissao, sem somar
o tempo restante da chave antiga. Exemplo: uma nova cortesia de 30 dias vale
por 30 dias desde a emissao, mesmo que a anterior ainda tivesse validade.
Outros prazos selecionados seguem a mesma regra; nao existe prazo fixo de
30 dias para todas as cortesias.

Criacao da chave, cancelamento das anteriores e eventos de auditoria ficam
na mesma transacao. Uma falha reverte a operacao; emissoes simultaneas da
mesma conta sao serializadas. O envio de email acontece apos a transacao e
uma falha de email nao invalida a chave criada.

Escopo: apenas a emissao administrativa de cortesia IRP. Outros emails e
licencas BT nao sao cancelados por essa operacao. A renovacao de compras
continua no fluxo existente. Os registros anteriores ficam no historico.

Para resolver o aviso de chave vinculada a outro dispositivo, apos o deploy,
gere uma nova cortesia no Admin e ative a NOVA chave na extensao. Gerar a
nova cortesia revoga a anterior; apenas recarregar ou reutilizar a chave
antiga nao resolve. A mudanca nao exige novo pacote da extensao.

Implementacao: backend/src/services/license.service.js (replaceCourtesyLicense)
e backend/src/api/routes/admin-extension.routes.js. Publicado no GitHub em
c3650f5. Push confirmado; conclusao do deploy e ativacao em producao ainda
nao verificadas nesta sessao. Validacao local: 9 testes isolados aprovados.

Esta secao substitui instrucoes historicas que dizem que gerar cortesia IRP
renova a mesma chave e acumula a validade anterior.


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
- `GET /api/v1/licenses/admin/attempts`

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

## Admin - uso e tentativas recentes

A tela `/admin/irp-licenses` tambem possui a area `Uso e tentativas recentes`.

Ela mostra chamadas reais feitas pela extensao ao backend:

- `activate`: ativacao da licenca;
- `validate`: validacao antes de executar a automacao;
- `heartbeat`: uso continuo;
- `trial`: pedido de teste gratis.

Cada tentativa recebe resultado:

- `Permitida`: backend aceitou a licenca/tentativa;
- `Bloqueada`: backend negou a tentativa.

A area tambem mostra contadores:

- `Usando em 24h`: dispositivos unicos com chamadas permitidas nas ultimas 24 horas;
- `Bloqueadas 24h`: chamadas negadas nas ultimas 24 horas.

Para descobrir quem usou, compare a chave mascarada da tentativa com a coluna `Chave` da tabela de testes/licencas. A extensao nao envia o email a cada validacao comum, entao a associacao e feita pela chave da licenca.

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
