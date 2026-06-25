# IRP Master - Teste gratis de 1 dia, fingerprint e reparticoes

Data: 25/06/2026

Este documento separa a regra do teste gratis de 1 dia da IRP Master para facilitar suporte, auditoria e manutencao futura.

## Objetivo

Permitir que usuarios reais testem a IRP Master por 1 dia, sem permitir que a mesma pessoa fique renovando o teste gratis varias vezes com contas diferentes.

## Problema encontrado

Na versao publicada `1.0.12`, a extensao enviava principalmente:

- email;
- `deviceId`;
- versao da extensao.

O `deviceId` nao e o numero fisico do computador. Ele pode mudar quando o usuario usa outro perfil do Chrome, limpa dados locais, reinstala a extensao ou troca o ambiente do navegador. Por isso, no mesmo PC, contas diferentes podiam aparecer com `deviceId` diferente.

## Decisao de produto

Nao bloquear por IP.

Motivo: em reparticoes, escolas, empresas e orgaos publicos, varios computadores podem usar o mesmo IP externo. Se o IP fosse bloqueio principal, somente uma pessoa daquela rede conseguiria testar, prejudicando usuarios legitimos.

## Regra adotada

O teste gratis passa a ser controlado por uma combinacao de sinais:

- email normalizado;
- `deviceId`;
- `clientFingerprint`;
- IP apenas para auditoria.

O backend bloqueia novo teste quando encontra uso anterior pelo mesmo email, mesmo `deviceId` ou mesmo `clientFingerprint`.

O IP fica registrado para suporte e analise manual, mas nao impede que varios computadores da mesma reparticao testem.

## Extensao

Versao com fingerprint:

```text
1.0.13
```

Pacote local gerado:

```text
C:\Users\adao\Downloads\IRP-Master-Automacao-v1.0.13-fingerprint.zip
```

A versao `1.0.13` envia no pedido de teste:

```json
{
  "email": "usuario@email.com",
  "deviceId": "dev_...",
  "clientFingerprint": "hash-tecnico",
  "extensionVersion": "1.0.13"
}
```

## Site EducaplayJA

Tela administrativa:

```text
https://educaplayja.com.br/#/admin/irp-licenses
```

Atalho:

```text
Admin Dashboard > Acoes Rapidas > IRP Licencas / Testes de 1 dia
```

A tela mostra email, status, inicio, vencimento, ultimo uso, versao, dispositivo, fingerprint e chave mascarada. Ela e somente leitura.

## Monitoramento de uso

A mesma tela tambem mostra `Uso e tentativas recentes`.

Essa area responde a pergunta: quem esta usando a extensao e quem tentou usar sem permissao?

- `Permitida`: a chamada foi aceita pelo backend.
- `Bloqueada`: a chamada foi negada pelo backend.
- `Usando em 24h`: dispositivos unicos com uso permitido nas ultimas 24 horas.
- `Bloqueadas 24h`: chamadas negadas nas ultimas 24 horas.

Para saber o usuario, compare a chave mascarada da tentativa com a coluna `Chave` da tabela de testes/licencas.


## Privacidade

O fingerprint nao le planilhas, arquivos, senhas, CPF, dados da tela do SIASG ou dados de pagamento.

Ele e um hash tecnico calculado no navegador para reduzir abuso do teste gratis. O objetivo e diferenciar ambiente de uso, nao identificar documentos pessoais.

## Commits relacionados

```text
c33c54e feat: add IRP trial admin view
455f99e fix: use standard admin auth for IRP trials
120dfa2 docs: document IRP trial admin view
3e8b3cc fix: strengthen IRP trial tracking
7504434 feat: add IRP license attempt monitoring
```
