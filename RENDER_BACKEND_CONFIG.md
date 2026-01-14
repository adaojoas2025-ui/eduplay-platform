# 🚀 Configuração do Backend no Render - PASSO A PASSO

## 1️⃣ Criar Novo Serviço

1. Clique em **"+ New"** (canto superior direito)
2. Selecione **"Web Service"**

## 2️⃣ Conectar Repositório

- Repositório: **eduplay-platform** ou **adaojoas2025-ui/eduplay-platform**
- Clique em **"Connect"**

## 3️⃣ Configurações Básicas

### Name (Nome do Serviço):
```
eduplay-backend
```

### Region:
```
Oregon (US West)
```

### Branch:
```
main
```

### Root Directory:
```
backend
```
⚠️ **IMPORTANTE**: Digite exatamente `backend` (sem barra no início ou fim)

### Runtime:
```
Node
```

### Build Command:
```
npm install && npx prisma generate && npx prisma migrate deploy
```

### Start Command:
```
npm start
```

## 4️⃣ Variáveis de Ambiente

Clique em **"Add Environment Variable"** para cada uma abaixo.

### ✅ COPIE E COLE EXATAMENTE COMO ESTÁ:

**1. NODE_ENV**
```
production
```

**2. DATABASE_URL**
```
postgresql://eduplay_user:e6mRYc520CE1d0EedXFsbkldCL0ZqHm1@dpg-d4tjga3uibts73aohlpg-a.oregon-postgres.render.com/eduplay_db_rsyj
```

**3. JWT_SECRET**
```
65352485ca01361f165f97e274534be1ca2f98a4140ea0c1674a2944084eb3530b7c50b5dd9c7fba9f4cbfd0e73bdc8166d0246443a3aefafd10378775b825f4
```

**4. JWT_REFRESH_SECRET**
```
9f1b62103b511f4ea956b4e56734dd716490617b4c902c646a75c03114fd3637ef798d85755e8a95bb4cf9e2a27079128429e054c13ef9a4b4fda8155ce3bfc5
```

**5. SESSION_SECRET**
```
5edeffba84ed664646b60b083b2faa2c88c04e646e216addb710fad3cdc6cd3b10aaa72aaa13826d92f9f90eb76e80d5ced3b866a2873c22a9a606cae1887231
```

**6. FRONTEND_URL**
```
https://eduplay-frontend.onrender.com
```

### 🔐 OAuth Google (Opcional - Pule se não tiver configurado):

**7. GOOGLE_CLIENT_ID** (deixe vazio se não tiver)
```
SEU_GOOGLE_CLIENT_ID_AQUI
```

**8. GOOGLE_CLIENT_SECRET** (deixe vazio se não tiver)
```
SEU_GOOGLE_CLIENT_SECRET_AQUI
```

**9. GOOGLE_CALLBACK_URL** (deixe vazio se não tiver)
```
https://eduplay-backend.onrender.com/api/v1/auth/google/callback
```

## 5️⃣ Plano

**Instance Type:**
```
Free
```

## 6️⃣ Auto-Deploy

Deixe marcado: **"Auto-Deploy: Yes"**

## 7️⃣ Finalizar

1. Role até o final da página
2. Clique no botão azul **"Create Web Service"**
3. Aguarde o build (vai demorar 3-5 minutos)

---

## ✅ Após o Deploy Completar

O backend estará disponível em uma URL parecida com:
```
https://eduplay-backend-XXXX.onrender.com
```

### Teste se está funcionando:
```
https://SEU-BACKEND-URL.onrender.com/api/v1/health
```

Deve retornar:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "...",
  "version": "1.0.0"
}
```

---

## 📌 IMPORTANTE

- Guarde a URL final do backend
- Você vai precisar atualizar a variável `VITE_API_URL` no frontend com a nova URL
- Se a URL gerada for diferente de `eduplay-platform.onrender.com`, me avise para atualizarmos o frontend

---

**Data de criação**: 14/01/2026
**Secrets gerados em**: 14/01/2026 às 13:00 (horário de Brasília)
