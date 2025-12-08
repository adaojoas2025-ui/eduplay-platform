# ⚡ Quick Start - Deploy Rápido (5 minutos)

## 🎯 Deploy Express para colocar o EDUPLAY no ar

### Passo 1: GitHub (2 minutos)

```bash
cd c:\projetos
git init
git add .
git commit -m "Deploy EDUPLAY"
git remote add origin https://github.com/SEU-USUARIO/eduplay.git
git push -u origin main
```

### Passo 2: Backend - Render (2 minutos)

1. Acesse: https://dashboard.render.com/
2. **New +** → **Web Service**
3. Conecte GitHub → Selecione repositório
4. Configure:
   - Root Directory: `backend`
   - Build: `npm install && npx prisma generate && npx prisma migrate deploy`
   - Start: `npm start`
5. **Environment Variables** → Adicione apenas essas 3:
   ```
   NODE_ENV=production
   JWT_SECRET=cole-valor-gerado-abaixo
   JWT_REFRESH_SECRET=cole-valor-diferente-abaixo
   ```

   **Gerar secrets:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   (Execute 2x para ter 2 valores diferentes)

6. **Create Database** → PostgreSQL Free
7. Copie a DATABASE_URL e cole nas env vars
8. Deploy! 🚀

### Passo 3: Frontend - Vercel (1 minuto)

1. Acesse: https://vercel.com/new
2. Import repositório GitHub
3. Configure:
   - Root Directory: `frontend`
   - Framework: Vite
4. **Environment Variables**:
   ```
   VITE_API_URL=https://seu-backend.onrender.com/api/v1
   ```
5. Deploy! 🎉

### Passo 4: Testar

Acesse: `https://seu-app.vercel.app`

- ✅ Cadastro funciona
- ✅ Login funciona
- ✅ Produtos funcionam
- ✅ Gamificação funciona

**Pronto! Sistema no ar!** 🎊

---

## ⚠️ Importante Depois

Para funcionar 100%, configure:

1. **Google OAuth** (opcional)
   - Console: https://console.cloud.google.com
   - Adicione URLs autorizadas

2. **Mercado Pago** (para pagamentos)
   - Adicione credenciais nas env vars

3. **Cloudinary** (para imagens)
   - Adicione credenciais nas env vars

Veja detalhes completos em: [DEPLOY.md](DEPLOY.md)
