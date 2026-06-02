# BaixaTudo - Publicacao na Chrome Web Store

Data: 26/05/2026

Este documento registra a criacao das paginas publicas da extensao BaixaTudo no
site EducaplayJA, como preparacao para submissao na Chrome Web Store.

## URLs publicas

Pagina oficial da extensao:

```text
https://educaplayja.com.br/baixatudo
```

Politica de privacidade da extensao:

```text
https://educaplayja.com.br/baixatudo/privacidade
```

URL a informar na Chrome Web Store:

```text
https://educaplayja.com.br/baixatudo/privacidade
```

## O que foi criado

Foram criadas duas versoes das paginas:

1. Paginas React dentro do frontend:

```text
frontend/src/pages/BaixaTudo.jsx
frontend/src/pages/BaixaTudoPrivacy.jsx
```

2. Paginas HTML estaticas dentro de `public`:

```text
frontend/public/baixatudo/index.html
frontend/public/baixatudo/privacidade/index.html
```

As paginas estaticas foram adicionadas porque o Render retornava `404 Not Found`
em rotas diretas do React Router, mesmo com configuracao de rewrite. Como a Chrome
Web Store exige uma URL publica direta e estavel para a politica de privacidade,
os arquivos HTML estaticos garantem que as URLs existam como arquivos reais no build.

## Rotas React registradas

Arquivo alterado:

```text
frontend/src/App.jsx
```

Rotas adicionadas:

```jsx
<Route path="/baixatudo" element={<BaixaTudo />} />
<Route path="/baixatudo/privacidade" element={<BaixaTudoPrivacy />} />
```

## Conteudo principal das paginas

A pagina `/baixatudo` informa:

- Nome da extensao: BaixaTudo.
- Finalidade: detectar videos carregados em paginas web e ajudar no download de aulas e conteudos autorizados.
- Acionamento manual pelo usuario.
- Downloads organizados.
- Fila com retomada.
- Uso responsavel.
- Link para a politica de privacidade.
- Email de suporte.

A pagina `/baixatudo/privacidade` informa:

- A extensao nao vende dados pessoais.
- A extensao nao coleta senhas.
- A extensao nao coleta dados de pagamento.
- A extensao nao envia historico de navegacao para servidores do EducaplayJA por padrao.
- Uso de armazenamento local do Chrome.
- Justificativa das permissoes:
  - `webRequest`
  - `downloads`
  - `tabs`
  - `activeTab`
  - `scripting`
  - `storage`
  - `<all_urls>`
- Responsabilidade do usuario quanto a direitos autorais e termos de uso.
- Canais de contato.

## Commits relacionados

Criacao das paginas React e documento de ponto de restauracao:

```text
f95eb1c5dce852c9f08cf19edf42272265befdf8
feat: add BaixaTudo public pages
```

Criacao das paginas HTML estaticas para evitar `404` em URLs diretas:

```text
811def2
fix: publish BaixaTudo static pages
```

## Validacao realizada

Build local executado com sucesso:

```bash
npm run build
```

Arquivos confirmados no build:

```text
frontend/dist/baixatudo/index.html
frontend/dist/baixatudo/privacidade/index.html
```

Depois do deploy manual no Render, as URLs responderam `200 OK`:

```text
https://educaplayja.com.br/baixatudo
https://educaplayja.com.br/baixatudo/privacidade
```

## Deploy

O primeiro deploy publicou o commit `f95eb1c`, mas as rotas diretas ainda retornavam
`404 Not Found`.

Depois do commit `811def2`, foi acionado deploy manual do frontend no Render pelo
deploy hook documentado em `backend/docs/DEPLOYMENT.md`.

Resultado confirmado:

```text
HTTP/1.1 200 OK
last-modified: Tue, 26 May 2026 19:28:31 UTC
```

## Proximo passo

Usar a URL abaixo no campo de politica de privacidade da Chrome Web Store:

```text
https://educaplayja.com.br/baixatudo/privacidade
```

Depois disso, continuar a submissao da extensao gratuita na Chrome Web Store.

---

## Atualizacao de status em 01/06/2026

A extensao foi publicada na Chrome Web Store como item `nao apresentado`.

Link publico final:

```text
https://chromewebstore.google.com/detail/baixatudo-video-downloader/njdlafdofhnnokoomgebclhgomhhkfbk
```

ID da extensao:

```text
njdlafdofhnnokoomgebclhgomhhkfbk
```

Versao publicada no painel:

```text
2.1.6
```

Documento consolidado com o estado atual, modelo comercial, licencas e proximas
etapas:

```text
docs/BAIXATUDO_STATUS_E_PROXIMAS_ETAPAS.md
```

---

## Atualizacao de instalacao em 02/06/2026

A extensao esta publicada na Chrome Web Store como item `Publicado - nao apresentado`.

Isso significa:

- a extensao nao aparece na busca publica da Web Store;
- a instalacao deve ser feita pelo link direto;
- o botao de instalar aparece somente em navegador Chrome normal, com usuario logado;
- em aba anonima ou modo visitante o Chrome pode bloquear instalacao.

Link direto de instalacao:

```text
https://chromewebstore.google.com/detail/baixatudo-video-downloader/njdlafdofhnnokoomgebclhgomhhkfbk
```

ID da extensao:

```text
njdlafdofhnnokoomgebclhgomhhkfbk
```

Situacao atual:

```text
Publicado - nao apresentado
Versao: 2.1.6
```

Orientacao ao usuario:

1. Abrir o link direto no Chrome normal.
2. Entrar na conta Google, se necessario.
3. Clicar em `Usar no Chrome`.
4. Evitar aba anonima para instalacao.

A tela de analytics da Chrome Web Store Developer Dashboard nao e usada para instalar a extensao. Ela serve apenas para acompanhar instalacoes, impressoes, usuarios e metricas do item.
