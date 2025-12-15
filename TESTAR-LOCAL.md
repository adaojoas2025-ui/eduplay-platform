# COMO TESTAR O SISTEMA LOCALMENTE

## 1. Iniciar Backend
```bash
cd c:\projetos\backend
npm run dev
```
Deve aparecer: "Server running on port 3000"

## 2. Iniciar Frontend (em OUTRO terminal)
```bash
cd c:\projetos\frontend
npm run dev
```
Vai abrir no navegador ou mostrar algo como: "Local: http://localhost:5173"

## 3. Acessar no navegador
```
http://localhost:5173
```

## 4. Fazer login
Email: adao1980aguiar@gmail.com
Senha: (sua senha)

## 5. Clicar em "Meus Produtos"
Deve aparecer o produto "apostila de artes" com botão de download

---

## PROBLEMA NO RENDER

O Render está dando erro 503 (serviço fora do ar).

Você precisa:
1. Entrar no painel do Render (https://dashboard.render.com)
2. Verificar se o serviço está rodando
3. Ver os logs para entender o erro
4. Provavelmente precisa de um REDEPLOY

---

## EXPLICAÇÃO DO PROBLEMA

Você estava acessando `eduplay-platform.onrender.com` e vendo JSON porque:
- Esse domínio aponta para o BACKEND (API)
- O FRONTEND precisa estar em outro lugar ou configurado diferente

**Opções:**
1. Frontend separado (ex: eduplay-frontend.vercel.app)
2. Backend servir o frontend junto (precisa configurar build)
