# IRP Master 1.0.34 — publicação e identificação dos usuários

Atualizado em **18/11/2026**, fuso America/Sao_Paulo.

## Estado confirmado

- Código de backend, frontend e testes enviado à main de adaojoas2025-ui/eduplay-platform no commit **e715a18** (feat: show IRP user emails and add optional 24-hour trial).
- 42 testes automatizados aprovados; build Vite do frontend aprovado.
- A imagem do usuário mostra ativação registrada pela extensão 1.0.34; isso não comprova publicação na Chrome Web Store.
- Na verificação pública de 18/11, aproximadamente 15h52 de Brasília, eduplay-frontend.onrender.com ainda entregava o asset antigo /assets/index.1794929617690.js.
- eduplay-platform.onrender.com/api/v1/health respondeu API is running. Esse health check, sozinho, NÃO identifica o commit do backend.
- O GitHub informou sucesso de deploys Vercel para o commit. Isso NÃO confirma deploy dos serviços Render usados pelo usuário.
- Não houve confirmação de deploy do commit e715a18 nos dois serviços Render. Não foi acionado deploy manual no Render nesta sessão.

Publicação do código no GitHub, deploy no Render e distribuição da extensão são etapas distintas. Não tratar um push ou um health check como confirmação de ponta a ponta.

## Por que o e-mail do Adão ainda não aparecia

O painel da imagem ainda era o antigo: mostrava Quando, Resultado, Ação, Motivo, Versão, Dispositivo, Chave e IP, sem Titular da licença ou Conta Chrome. Também continuava exibindo a descrição do teste de 11 itens.

Atualizar apenas a extensão não adiciona colunas ao site e não faz o backend antigo persistir o campo chromeProfileEmail. Os endereços device-...@sem-email.irpmaster.local são identificadores sintéticos criados para testes sem e-mail, não caixas postais dos usuários.

## Implantar no Render

1. Abrir o serviço **eduplay-backend**, cuja URL ativa é https://eduplay-platform.onrender.com.
2. Usar **Manual Deploy → Deploy latest commit** e conferir que o commit inclui e715a18 (ou descendente com essas alterações). Aguardar Live e conferir logs.
3. Fazer o mesmo no serviço **eduplay-frontend**, associado ao domínio educaplayja.com.br e ao endereço eduplay-frontend.onrender.com.
4. Não reativar nem voltar a configurar o endereço antigo eduplay-backend-yw7z.onrender.com.
5. Conferir o backend e abrir o Admin com Ctrl+Shift+R. A tabela deve mostrar **Titular da licença**, **Conta Chrome**, **Vencimento** e **Dias restantes**.

O backend cria a coluna chromeProfileEmail, a coluna trialMode e a tabela IrpTrial24Claim de forma idempotente. Não apagar banco, licenças ou histórico para atualizar. O arquivo irp-trial24.service.js precisa ser publicado junto de license.service.js.

## Gerar e conferir um novo registro de uso

Com a extensão 1.0.34 carregada, reabrir o painel e validar/ativar a licença já existente. Essa validação não deve emitir trial nem renovar a validade paga. Atualizar a seção Uso e tentativas recentes no Admin.

- Titular da licença é obtido pelo cruzamento da chave com o registro do backend.
- Conta Chrome vem automaticamente de chrome.identity.getProfileUserInfo com conta SYNC, quando disponível. O manifest usa identity e identity.email.
- Não há formulário nem confirmação adicional dentro da extensão. O Chrome pode exibir o aviso nativo de novas permissões.
- Estar logado numa página Google ou no Gmail não comprova, sozinho, login/sincronização do perfil do Chrome. Confirmar a conta e a sincronização do navegador se Conta Chrome aparecer como Não informado.
- O Chrome pode não disponibilizar e-mail; nesse caso o painel deve indicar Não informado, sem inventar endereço.
- Registros anteriores não ganham e-mail retroativamente. A coluna de titular pode ser preenchida pelo cadastro da licença; a conta Chrome só aparece nos registros que a nova extensão enviar e o novo backend gravar.
- A busca por e-mail consulta titular e perfil; a paginação permite acompanhar os demais registros. Os dados não representam monitoramento instantâneo de toda ação na tela: correspondem às chamadas de licença registradas.

## Regras comerciais mantidas

Teste opcional de 24 horas sem limite de itens nas novas emissões; repetição não reinicia o prazo. A mesma instalação sincronizada conserva o vencimento em outro PC. Testes legados não foram convertidos em massa. Ativar licença ou comprar diretamente continua disponível desde o início, sem passar pelo teste grátis.

O e-mail de perfil é metadado informado pela extensão, não autenticação Google verificada nem autorização para transferir chave. A extensão não lê mensagens do Gmail ou contatos. Não foi enviada mensagem de agradecimento/feedback a usuários nesta sessão.

## Pendências de conferência real

Confirmar os dois deploys Render, novo registro de uso com o perfil do Adão, recuperação em dois PCs com o mesmo ID sincronizado e o fluxo real de trial/pagamento. Os testes automatizados usam simulações e não substituem essa verificação.
