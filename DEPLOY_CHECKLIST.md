# ✅ Checklist de Deploy - EducaplayJA

Use este checklist para fazer o deploy sem erros!

---

## 📦 PASSO 1: Preparar o Código

- [ ] Código está funcionando localmente (backend + frontend)
- [ ] Arquivo `.env` tem TODAS as credenciais corretas
- [ ] Git repository está inicializado
- [ ] Arquivo `.gitignore` está correto (não commita `.env`)

**Comandos:**
```bash
cd c:\projetos
git status  # Verificar o que vai ser commitado
git add .
git commit -m "Deploy EducaplayJA v1.5.0"
```

---

## 🔗 PASSO 2: Criar Contas (se ainda não tem)

- [ ] Conta no [GitHub](https://github.com)
- [ ] Conta no [Render](https://render.com)
- [ ] Conta no [Vercel](https://vercel.com)

**Dica:** Use a mesma conta do Google para facilitar!

---

## 📤 PASSO 3: Push para GitHub

- [ ] Repositório criado no GitHub
- [ ] Git remote configurado
- [ ] Push feito com sucesso

**Comandos:**
```bash
# Criar repo no GitHub primeiro (via site), depois:
git remote add origin https://github.com/seu-usuario/educaplayja.git
git branch -M main
git push -u origin main
```

---

## 🖥️ PASSO 4: Deploy do Backend (Render)

### 4.1 Criar Web Service

- [ ] Acessei [Render Dashboard](https://dashboard.render.com)
- [ ] Cliquei em "New +" → "Web Service"
- [ ] Conectei meu repositório GitHub
- [ ] Configurei:
  - Name: `educaplayja-api`
  - Region: `Oregon (US West)`
  - Branch: `main`
  - Root Directory: `backend`
  - Environment: `Node`
  - Build Command: `npm install && npx prisma generate`
  - Start Command: `npm start`
  - Plan: `Free`

### 4.2 Configurar Variáveis de Ambiente

**CRÍTICO:** Copie estas variáveis do seu `.env` local para o Render!

- [ ] `NODE_ENV=production`
- [ ] `PORT=3000`
- [ ] `DATABASE_URL` (URL do banco que JÁ EXISTE no Render)
- [ ] `JWT_SECRET` (mesmo do .env local)
- [ ] `JWT_REFRESH_SECRET` (mesmo do .env local)
- [ ] `JWT_EXPIRES_IN=7d`
- [ ] `JWT_REFRESH_EXPIRES_IN=30d`
- [ ] `MP_ACCESS_TOKEN` (usar TEST primeiro!)
- [ ] `MP_PUBLIC_KEY` (usar TEST primeiro!)
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `EMAIL_HOST=smtp.gmail.com`
- [ ] `EMAIL_PORT=587`
- [ ] `EMAIL_SECURE=false`
- [ ] `EMAIL_USER` (seu email)
- [ ] `EMAIL_PASS` (senha de app do Gmail)
- [ ] `EMAIL_FROM` (ex: "EducaplayJA <seu-email@gmail.com>")
- [ ] `FRONTEND_URL` (deixe temporário, atualizar depois)
- [ ] `BACKEND_URL` (deixe temporário, atualizar depois)
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `GOOGLE_CALLBACK_URL` (ex: https://educaplayja-api.onrender.com/api/v1/auth/google/callback)
- [ ] `RATE_LIMIT_WINDOW_MS=900000`
- [ ] `RATE_LIMIT_MAX_REQUESTS=100`
- [ ] `PLATFORM_FEE_PERCENT=3`
- [ ] `PLATFORM_NAME=EducaplayJA`
- [ ] `PLATFORM_EMAIL=contato@educaplayja.com.br`
- [ ] `PLATFORM_SUPPORT_EMAIL=suporte@educaplayja.com.br`
- [ ] `BCRYPT_ROUNDS=10`
- [ ] `PASSWORD_MIN_LENGTH=8`
- [ ] `MAX_FILE_SIZE=104857600`
- [ ] `ALLOWED_FILE_TYPES=pdf,mp4,jpg,jpeg,png,gif,zip`
- [ ] `LOG_LEVEL=info`
- [ ] `LOG_DIR=logs`

### 4.3 Deploy e Verificação

- [ ] Cliquei em "Create Web Service"
- [ ] Aguardei o build (5-10 minutos)
- [ ] Backend está "Live" no dashboard
- [ ] Testei: `https://educaplayja-api.onrender.com/api/v1/health` → retorna `{"status":"ok"}`

**Se falhou:** Verifique os logs no Render Dashboard!

---

## 🌐 PASSO 5: Deploy do Frontend (Vercel)

### 5.1 Criar Projeto

- [ ] Acessei [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Cliquei em "Add New..." → "Project"
- [ ] Conectei meu repositório GitHub
- [ ] Configurei:
  - Framework Preset: `Vite`
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`

### 5.2 Variável de Ambiente

- [ ] Na aba "Environment Variables", adicionei:
  - Name: `VITE_API_URL`
  - Value: `https://educaplayja-api.onrender.com/api/v1`
  - Selecionei: Production, Preview, Development (todos!)

### 5.3 Deploy e Verificação

- [ ] Cliquei em "Deploy"
- [ ] Aguardei o build (2-5 minutos)
- [ ] Frontend está "Ready" no dashboard
- [ ] Copiei a URL do Vercel (ex: `https://educaplayja.vercel.app`)
- [ ] Acessei a URL e o site carregou

**Se der erro:** Verifique se `VITE_API_URL` está correto!

---

## 🔧 PASSO 6: Configurações Finais

### 6.1 Atualizar URLs no Backend

- [ ] Voltei no Render Dashboard
- [ ] Entrei no Web Service `educaplayja-api`
- [ ] Fui em "Environment"
- [ ] Atualizei:
  - `FRONTEND_URL` = URL real do Vercel (ex: https://educaplayja.vercel.app)
  - `BACKEND_URL` = URL real do Render (ex: https://educaplayja-api.onrender.com)
- [ ] Cliquei em "Save Changes"
- [ ] Aguardei o redeploy (2-3 minutos)

### 6.2 Atualizar Google OAuth

- [ ] Acessei [Google Cloud Console](https://console.cloud.google.com)
- [ ] Fui em "APIs & Services" → "Credentials"
- [ ] Editei o OAuth 2.0 Client
- [ ] Adicionei em "Authorized redirect URIs":
  - `https://educaplayja-api.onrender.com/api/v1/auth/google/callback`
- [ ] Adicionei em "Authorized JavaScript origins":
  - `https://educaplayja.vercel.app`
- [ ] Cliquei em "Save"

---

## ✅ PASSO 7: Testes Finais

### Teste TUDO nesta ordem:

- [ ] Backend responde: `https://educaplayja-api.onrender.com/api/v1/health` → `{"status":"ok"}`
- [ ] Frontend carrega: `https://educaplayja.vercel.app` → Home aparece
- [ ] **Login funciona:** Consigo fazer login com email/senha
- [ ] **Dados aparecem:** Meus produtos/cursos estão lá (do banco existente)
- [ ] **Login Google funciona:** Consigo fazer login com Google
- [ ] **Upload funciona:** Consigo publicar novo app/produto com imagem
- [ ] **Compra funciona:** Consigo fazer uma compra (modo TEST do Mercado Pago)

---

## 🎉 PRONTO!

Se todos os checkboxes acima estão marcados, seu EducaplayJA está NO AR! 🚀

**URLs:**
- Frontend: https://educaplayja.vercel.app (ou sua URL)
- Backend: https://educaplayja-api.onrender.com
- Admin: https://educaplayja.vercel.app/admin/dashboard

---

## 🚨 Problemas? Veja isso:

### Backend não responde (502/504)
- Aguarde 30 segundos (Render em sleep mode na primeira requisição)
- Veja os logs no Render Dashboard
- Verifique se DATABASE_URL está correto

### Frontend não conecta ao backend
- Abra F12 no navegador e veja o Console
- Verifique se `VITE_API_URL` está correto no Vercel
- Confirme que `FRONTEND_URL` está correto no Render (para CORS)

### Login não funciona
- Verifique `JWT_SECRET` no Render
- Veja logs do backend no Render
- Confirme que o banco de dados está conectado

### Upload de imagens falha
- Verifique credenciais do Cloudinary no Render
- Veja logs do backend
- Confirme que as env vars estão corretas

---

## 📱 PRÓXIMOS PASSOS

Depois que tudo estiver funcionando:

1. **Ativar Mercado Pago em PRODUÇÃO:**
   - Pegue credenciais de produção no Mercado Pago
   - Atualize `MP_ACCESS_TOKEN` e `MP_PUBLIC_KEY` no Render
   - Configure webhook: `https://educaplayja-api.onrender.com/api/v1/webhooks/mercadopago`

2. **Domínio Próprio (Opcional):**
   - Compre domínio (www.educaplayja.com.br)
   - Configure no Vercel e Render
   - Atualize DNS

3. **Monitoramento:**
   - Configure alertas no Render
   - Ative Analytics no Vercel
   - Configure backup do banco de dados

---

**Dúvidas?** Consulte o [DEPLOY.md](DEPLOY.md) completo!
