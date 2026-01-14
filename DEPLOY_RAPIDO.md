# 🚀 DEPLOY RÁPIDO - 3 PASSOS

## PASSO 1: Conectar Railway ao GitHub (30 segundos)

1. Acesse: https://railway.app/new
2. Clique em **"Deploy from GitHub repo"**
3. Autorize o Railway a acessar seu GitHub
4. Selecione: `adaojoas2025-ui/eduplay-platform`
5. ✅ Railway vai começar o deploy automaticamente!

## PASSO 2: Configurar depois do primeiro deploy (2 minutos)

Quando o deploy inicial terminar:

1. Clique no projeto criado
2. Vá em **Settings** → **Root Directory** → digite `backend`
3. Clique em **"+ New"** → **"Database"** → **"PostgreSQL"**
4. Vá em **Variables** do serviço backend
5. Clique em **"+ New Variable"** → **"Add Reference"**
6. Selecione o PostgreSQL → escolha `DATABASE_URL`
7. Adicione estas variáveis (cole todas de uma vez):

```
NODE_ENV=production
JWT_SECRET=eduplay-super-secret-jwt-key-2024-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=eduplay-refresh-secret-2024-change-in-production
JWT_REFRESH_EXPIRES_IN=30d
MP_ACCESS_TOKEN=TEST-4893843815915945-120117-dc45f68f6805eb7bf92f3d0dbe637ee5-145851665
MP_PUBLIC_KEY=TEST-d1674a6b-17bd-46d4-acc4-c95ad9fe02d9
CLOUDINARY_CLOUD_NAME=dexlzykqm
CLOUDINARY_API_KEY=761719984596219
CLOUDINARY_API_SECRET=QkAyuumJD-_EsIezBPd2UQVYKew
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=adao.joas2025@gmail.com
EMAIL_PASS=kiiu xadt rbmk whns
EMAIL_FROM=EDUPLAY <adao.joas2025@gmail.com>
PLATFORM_NAME=EDUPLAY
GOOGLE_CLIENT_ID=763826185307-f8utvlugc36q9hvd4enokig6ic6l9ddh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
FRONTEND_URL=https://frontend-alpha-pied-73.eduplay-frontend.onrender.com
```

8. Copie a **URL gerada pelo Railway** (ex: `https://backend-production-xxxx.railway.app`)
9. Adicione mais duas variáveis:
   - `BACKEND_URL` = [URL que você copiou]
   - `GOOGLE_CALLBACK_URL` = [URL que você copiou]/api/v1/auth/google/callback

## PASSO 3: Trigger Redeploy

1. Vá em **Deployments**
2. Clique nos 3 pontinhos do último deploy
3. Clique em **"Redeploy"**
4. Aguarde 2-3 minutos
5. ✅ **PRONTO!**

## 🧪 TESTAR

Teste: `https://[SUA-URL].railway.app/api/v1/health`

Deve retornar:
```json
{"success":true,"message":"API is running",...}
```

## 📝 ME AVISE

Depois que funcionar, **me mande a URL do Railway** que eu:
- ✅ Atualizo o frontend automaticamente
- ✅ Faço o deploy
- ✅ Testamos o registro/login juntos!

---

**DICA:** Se der erro no primeiro deploy, é normal! Depois de configurar o Root Directory e o PostgreSQL, faça o Redeploy que vai funcionar!
