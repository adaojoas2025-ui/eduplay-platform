> **Status em 18/11/2026:** código publicado na main em e715a18. Frontend Render antigo na última verificação; versão do backend não confirmada pelo health. [Procedimento de deploy e identificação de e-mails](IRP_PUBLICACAO_1.0.34.md).

# IRP Master 1.0.34 — teste de 24 horas

Data: 18/11/2026. Código publicado no GitHub em e715a18; deploy Render ainda não confirmado.

## Regra atual

- Ativar licença e Comprar licença estão disponíveis desde o início; teste grátis é opcional.
- Novo teste: 24 horas exatas a partir da primeira emissão, pelo relógio do servidor, sem limite de itens.
- Repetir Testar grátis recupera o mesmo teste e vencimento, sem acrescentar tempo.
- Em outro PC, a mesma extensão/conta Chrome com o ID já sincronizado mantém a mesma licença e vencimento.
- Após 24 horas, o servidor nega uso; é preciso comprar/ativar uma licença válida.
- Licenças pagas/cortesias ativas não são substituídas por trial. Pagamento retira o modo trial e a cota de itens da licença renovada.

## Instalação e ativação direta

Pasta: C:\Users\adao\Documents\NOVO PORTAL DE COMPRAS\irp-master-extension-v1.0.34.
ZIP: irp-master-extension-v1.0.34.zip, para a Chrome Web Store. Preserve versões anteriores e dados locais; recarregue a pasta correta e confirme 1.0.34. Para testar continuidade entre PCs, use o mesmo ID de extensão e sincronização concluída; outro ID descompactado não equivale à instalação da loja.

Quem já tem chave pode clicar Ativar licença imediatamente. Não precisa solicitar teste nem esperar 24 horas. O início do painel não emite teste automático.

## Backend e identidade

irp-trial24.service.js cria licença e registro IrpTrial24Claim na mesma transação, com travas por identificadores. O registro guarda startedAt/expiresAt e não é removido pelo apagamento do teste legado no Admin. O e-mail normalizado disponível e o ID sincronizado são usados para deduplicação; sem e-mail há fallback de dispositivo/fingerprint. E-mail informado pela extensão não é autenticação Google verificada e não autoriza transferir chave para outro ID. Não é uma garantia contra clientes modificados.

Um pedido com e-mail já usado e ID diferente não recebe a chave antiga nem outro prazo. É orientado a sincronizar o Chrome ou comprar. Não há bloqueio por IP compartilhado. Falha de emissão reverte a transação. Falha de envio do e-mail não renova nem recria o teste.

Licenças de teste legadas já emitidas não têm seus dados ou vencimentos alterados em massa; mantêm as condições anteriores. A emissão pelo novo endpoint passa a usar 24 horas. O painel identifica o modelo de cada teste. A política nova tem seu próprio registro persistente, sem apagar o histórico legado.

## Expiração e execução em andamento

Novos inícios validam a licença. Mais Ferramentas revalida a cada início; o motor de análise consulta a validação antes de iniciar leitura/manifestações/PDF. O backend continua sendo a fonte de autorização.

Um alarme do Chrome solicita parada cooperativa das automações do portal quando o teste vence, mesmo com o painel fechado. O painel aberto mostra a expiração e oferece ativar/comprar. O alarme verifica uma compra aprovada antes de parar. Alarmes podem ser adiados por suspensão do computador; requisições já enviadas não são desfeitas. Comparação local e consulta/exportação de dados já obtidos não são ações de escrita no portal.

## Painel e e-mail

O cabeçalho informa que o teste é de 24h e exibe a data/hora final. O Admin mostra 24 horas / itens ilimitados nos novos testes e preserva a indicação dos legados. O e-mail de emissão informa o horário de Brasília. A identificação de uso por titular/perfil Chrome da 1.0.33 permanece, sem formulário próprio de confirmação.

## Publicação e validação

São duas entregas: extensão 1.0.34 e ajustes do backend/frontend EducaPlay. Publicar somente a extensão não muda a política do endpoint em produção. A tabela nova e a coluna trialMode são criadas idempotentemente; não é necessário apagar o banco.

Testes automatizados cobrem 24h exatas, repetição, mesma conta/ID em outro PC, concorrência, rollback, expiração, licença paga, parada e ativação direta sem teste, com regressões das cotas legadas. Build Vite do frontend aprovado. São testes com simulações; ainda falta conferir backend real, dois PCs sincronizados e compra real antes de publicar na loja.
