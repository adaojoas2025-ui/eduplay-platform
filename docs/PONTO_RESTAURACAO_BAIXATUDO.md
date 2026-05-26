# Ponto de Restauracao - BaixaTudo

Data: 26/05/2026

Este documento registra o ponto de restauracao antes da inclusao das paginas publicas
da extensao BaixaTudo no frontend do EducaplayJA.

## Commit base

Commit original antes das alteracoes:

```text
4c5da4e54324eb31621f69fe1c057ff1c6b2dc55
```

Mensagem do commit:

```text
docs: update IRP license doc with CORS fix, raw SQL rewrite and all corrections
```

Data do commit:

```text
2026-05-12 10:34:37 -0300
```

## Arquivos alterados apos este ponto

Arquivos planejados para a criacao das rotas do BaixaTudo:

```text
frontend/src/App.jsx
frontend/src/pages/BaixaTudo.jsx
frontend/src/pages/BaixaTudoPrivacy.jsx
frontend/public/baixatudo/index.html
frontend/public/baixatudo/privacidade/index.html
docs/PONTO_RESTAURACAO_BAIXATUDO.md
docs/BAIXATUDO_PUBLICACAO_WEBSTORE.md
```

## Documentacao complementar

O registro completo da publicacao das paginas, URLs finais, commits e validacao
para Chrome Web Store esta em:

```text
docs/BAIXATUDO_PUBLICACAO_WEBSTORE.md
```

## Como restaurar manualmente

Para desfazer somente a implementacao do BaixaTudo e voltar o frontend ao estado
anterior, revise o status do Git e remova/reverta apenas os arquivos acima.

Comandos de referencia:

```bash
git status --short
git diff -- frontend/src/App.jsx
git restore frontend/src/App.jsx
```

Depois, remova os arquivos novos:

```bash
rm frontend/src/pages/BaixaTudo.jsx
rm frontend/src/pages/BaixaTudoPrivacy.jsx
rm docs/PONTO_RESTAURACAO_BAIXATUDO.md
```

No Windows PowerShell, use:

```powershell
Remove-Item frontend/src/pages/BaixaTudo.jsx
Remove-Item frontend/src/pages/BaixaTudoPrivacy.jsx
Remove-Item frontend/public/baixatudo -Recurse
Remove-Item docs/PONTO_RESTAURACAO_BAIXATUDO.md
Remove-Item docs/BAIXATUDO_PUBLICACAO_WEBSTORE.md
```

## Restauracao completa do repositorio

Se for necessario voltar todo o repositorio exatamente para o commit base, use este
hash como referencia:

```bash
git reset --hard 4c5da4e54324eb31621f69fe1c057ff1c6b2dc55
```

Atencao: o comando acima descarta todas as alteracoes locais nao commitadas. Use
somente quando tiver certeza de que nenhum outro trabalho local deve ser preservado.
