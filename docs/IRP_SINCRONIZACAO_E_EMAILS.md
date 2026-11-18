> Atualização 1.0.34 preparada em 18/11/2026: teste opcional de 24h sem cota, com ativação paga direta desde o início. Guia atual: docs/IRP_TESTE_24_HORAS.md. Menções abaixo a teste de 24h ainda não implementado são históricas e foram superadas.

# IRP Master 1.0.33 — sincronização e identificação de uso

Data: 18/11/2026.

## Regra aprovada

A mesma extensão da Chrome Web Store, instalada no perfil da mesma conta Google com sincronização concluída, deve recuperar a licença existente em outro PC. O vencimento permanece o original; não são acrescentados dias nem criada uma nova licença na recuperação. A regra vale para os clientes em geral, sem e-mail pessoal fixo no código.

## Extensão

license-context.js prioriza irp_device_id de chrome.storage.sync sobre um ID local diferente. A criação do ID é serializada no service worker, consultado pelo painel. Se a sincronização falhar e não houver ID anterior, a extensão não gera outro ID silenciosamente.

requireValidLicense tenta /sync quando a chave local não existe e em conflito de dispositivo. Uma alteração de ID sincronizado com o painel aberto dispara nova recuperação. O servidor retorna a mesma chave e expiresAt. O modo offline exige que o último estado validado corresponda ao mesmo identificador.

O teste grátis não é emitido automaticamente ao abrir o painel ou iniciar uma automação sem licença. O botão Testar grátis permanece disponível. A ideia de teste ilimitado por 24 horas foi discutida, mas NÃO foi aplicada: o teste explícito continua com a cota atual do backend.

## E-mails no Admin

Em /#/admin/irp-licenses, Uso e tentativas recentes passa a mostrar titular da licença, conta Chrome quando disponível, vencimento e dias restantes, com busca por qualquer dos dois e-mails e paginação. Endereços sintéticos @sem-email.irpmaster.local são apresentados como Não informado. Os registros antigos não permitem descobrir retroativamente a conta Chrome.

identity e identity.email permitem consultar o perfil sincronizado; não há formulário ou confirmação própria da extensão. O Chrome pode apresentar seu aviso de novas permissões ao atualizar. A extensão não acessa o Gmail, mensagens ou contatos. O e-mail de perfil é metadado de uso informado pela extensão, não prova autenticada de identidade e não é usado para liberar uma licença. Nenhuma mensagem foi enviada automaticamente.

## Backend e painel do site

O backend adiciona chromeProfileEmail em IrpLicenseAttempt, recebe o metadado nos eventos, registra recuperação /sync e cruza a chave com o titular. A consulta /sync prefere licença paga/cortesia a um trial mais recente no mesmo ID, sem atualizar expiresAt. Esses ajustes exigem publicação separada do EducaPlay. A extensão recupera pelo /sync já existente, mas as novas colunas do Admin precisam do backend e frontend atualizados.

## Limites de sincronização

É necessário o mesmo ID de extensão e o armazenamento sincronizado da mesma conta. Pasta descompactada com outro ID, outro perfil, sincronização desligada ou ainda incompleta não equivalem a essa condição. chrome.storage.sync é eventual; não há promessa de recuperação antes de o ID original chegar. Se IDs já divergiram na nuvem por instalações antigas, o caso precisa ser diagnosticado; não foi introduzida transferência por e-mail não verificado.

## Validação

Testes simulados: prioridade do ID sincronizado, concorrência de criação, falha de sync, recuperação de chave/vencimento, IDs recebidos posteriormente, bloqueios/vencimento, email indisponível, auditoria e filtros SQL. Incluídas regressões de dispositivo e cotas. Build do frontend aprovado. Não houve acesso à conta real do cliente, envio de mensagens, alteração de licenças reais ou validação ponta a ponta em dois PCs nesta sessão.
