# Integração EducaPlay — Caçador de CATMAT

Produto: cacador-catmat. Prefixo: CMT. Banco compartilhado IrpLicense/IrpLicenseAttempt com separação por prefixo; trial em CatmatTrial24Claim. Não reutiliza trial ou licença IRP/BT.

## Rotas

- GET /api/v1/cacador-catmat/plans
- POST /api/v1/cacador-catmat/checkout
- POST /api/v1/cacador-catmat/licenses/activate, validate, heartbeat, logout, sync, trial
- GET /api/v1/cacador-catmat/admin/licenses e /admin/attempts (ADMIN)
- POST /api/v1/cacador-catmat/admin/licenses/:id/:action (ADMIN)
- POST /api/v1/admin/extensions/cacador-catmat/courtesy-licenses (ADMIN)

## Arquivos principais

backend/src/routes/cacador-catmat.js, services/catmat-license.service.js e catmat-trial24.service.js. Cadastro no index, catálogo de extensões e ramo de webhook com metadata.product_type=catmat_license. O provedor de pagamento é consultado pelo webhook existente antes do processamento; não basta o retorno success no navegador.

Frontend: páginas CacadorCatmat, CacadorCatmatPrivacy, CatmatLicenses, atalhos no Admin e seleção da cortesia. A rota pública direta preserva deviceId ao redirecionar para o HashRouter. A política tem HTML estático público, sem depender de login.

## Configuração

CATMAT_PRICE_MONTHLY (padrão 9.99), CATMAT_PRICE_ANNUAL (padrão 89.90). Usar ponto decimal. CATMAT_BACKEND_URL opcional (padrão https://eduplay-platform.onrender.com) controla o endereço do webhook. Mantidas as credenciais Mercado Pago e e-mail já configuradas no backend; nenhuma chave foi colocada na extensão.

Planos: monthly/30 dias e annual/365 dias. Preço e prefixo enviados pelo cliente são ignorados. O webhook exige status aprovado, produto catmat_license, plano aceito, moeda BRL e valor coerente com o preço registrado na preferência. Emissão é idempotente por paymentId; renovação começa na aprovação.

## Deploy

Enviar código ao repositório adaojoas2025-ui/eduplay-platform; no Render, publicar backend e frontend do commit contendo CMT. ensureLicenseSchema adiciona productPrefix na auditoria; o serviço cria CatmatTrial24Claim idempotentemente. Não apagar banco ou licenças. Confirmar páginas públicas e rotas antes de enviar o ZIP à loja.

Publicação do código no GitHub não comprova deploy no Render nem publicação da extensão. Uma cobrança de teste real, a entrega do e-mail e a recuperação em dois PCs ainda precisam ser conferidas. Não foram criadas licenças reais, enviadas mensagens ou feitas cobranças durante a validação automatizada.

## Regras comerciais e operacionais

# Licenças, usuários e cortesia — CMT

## Primeiro uso

O Caçador abre a tela de licença antes de carregar a aplicação. Ativar licença, Comprar, Recuperar e Testar por 24 horas estão disponíveis. O teste inicia automaticamente na primeira abertura após procurar uma licença existente. O manual e a ajuda continuam acessíveis.

Busca, preços e acesso à aplicação exigem licença paga/cortesia válida ou teste de 24h vigente. O menu de seleção que adiciona códigos também valida o acesso. Favoritos e planilha não são apagados ao vencer ou sair.

## Teste e pagamento

Cada novo teste dura 24 horas pelo relógio do servidor e não tem cota de itens. A tabela CatmatTrial24Claim preserva o primeiro prazo e impede reemissão pelo fluxo normal. A criação é transacional e separada dos registros IRP.

Mensal de R$ 9,99 por 30 dias; anual de R$ 89,90 por 365 dias. O backend define o valor, não o navegador. O pagamento aprovado é confirmado pelo Mercado Pago e renova/cria uma chave CMT, com prazo desde a aprovação, sem somar o teste. Webhook duplicado não deve gerar nova validade. E-mail entrega a chave; Verificar pagamento recupera a licença quando a compra veio da extensão com deviceId.

## Continuidade em outro PC

catmat_device_id é sincronizado pelo Chrome e tem precedência sobre a cópia local. A chave/estado validado ficam locais. Com a mesma extensão e sincronização concluída, a recuperação consulta a licença CMT associada e mantém seu vencimento. Outro ID descompactado, outro perfil ou apenas login na página Gmail não equivalem a essa condição. A conta de perfil é um metadado, não autenticação Google criptograficamente verificada.

O uso offline pago é temporário, limitado a 48 horas desde a última validação e ao vencimento original. Trial não ganha dias nem prazo offline adicional. Sair remove o estado local da licença e mantém o ID sincronizado, sem desvincular os outros PCs. A recuperação após Sair exige ação explícita.

## Acompanhar usuários

Admin → Caçador de CATMAT mostra licenças e usos apenas CMT. A tabela de tentativas inclui titular da licença, conta Chrome quando disponível, data, versão, motivo, resultado, vencimento e dias. Busca por e-mail e paginação. Identificadores sintéticos são mostrados como Não informado. O registro representa chamadas de licença, não todas as ações da pessoa no computador. Não há identificação retroativa se o e-mail nunca foi enviado.

O perfil Chrome é lido automaticamente por identity/identity.email; não há formulário adicional. O Chrome pode pedir aceitação das novas permissões ao atualizar. Não há leitura de mensagens do Gmail, contatos, planilhas ou dados de compras para o licenciamento. Não foram enviadas mensagens de agradecimento/feedback automaticamente.

## Emitir cortesia

Em Admin → Extensões, selecione Caçador de CATMAT. Informe e-mail, prazo/unidade, motivo e envio por e-mail. Faixa: mínimo 1 hora e máximo 10 anos. A emissão é protegida por login e perfil ADMIN.

Uma nova cortesia gera outra chave CMT sem dispositivo vinculado, cancela as chaves CMT anteriores ativas/expiradas do mesmo e-mail e inicia o prazo na nova emissão. Não soma validade antiga e não cancela IRP/BT ou licenças de outros e-mails. Cancelamento, chave nova e eventos ficam na mesma transação. E-mail é enviado depois; falha de envio não invalida a chave retornada ao administrador.

O painel permite bloquear, desbloquear, renovar e liberar a associação de uma licença CMT. As rotas rejeitam IDs pertencentes a outros produtos. A liberação não deve ser usada para contornar vencimento ou criar um novo teste.
