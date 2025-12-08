# ⚡ Quick Start - EDUPLAY

## 🏃 Início Rápido (5 minutos)

### 1️⃣ Instalar dependências

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2️⃣ Configurar PostgreSQL

Crie o banco de dados:
```sql
CREATE DATABASE eduplay;
```

Edite `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/eduplay?schema=public"
```

### 3️⃣ Inicializar banco de dados

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 4️⃣ Rodar o projeto

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5️⃣ Acessar

Abra: http://localhost:5173

---

## 📝 Credenciais Incluídas

✅ **Mercado Pago** - Já configurado no .env
✅ **JWT Secret** - Já configurado no .env

⚠️ **Você precisa configurar:**
- PostgreSQL DATABASE_URL
- Cloudinary (opcional - para uploads)
- Email (opcional - para notificações)

---

## 👤 Criar Primeiro Admin

Use Prisma Studio:
```bash
cd backend
npx prisma studio
```

Ou use este comando SQL direto no PostgreSQL:
```sql
INSERT INTO users (id, name, email, password, role, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Admin',
  'admin@eduplay.com',
  '$2a$10$rOjLbfYZ8p8W8W8W8W8W8uqYvqYvqYvqYvqYvqYvqYvqYvqYvqY',
  'ADMIN',
  'APPROVED',
  NOW(),
  NOW()
);
```

Login:
- Email: admin@eduplay.com
- Senha: admin123

---

## 🎯 Fluxo de Teste

1. ✅ Criar conta de comprador
2. ✅ Criar conta de produtor
3. ✅ Login como admin → aprovar produtor
4. ✅ Login como produtor → criar produto
5. ✅ Login como admin → aprovar produto
6. ✅ Login como comprador → comprar produto
7. ✅ Teste pagamento via Mercado Pago

---

## 🔥 Comandos Úteis

### Backend
```bash
npm run dev          # Desenvolvimento
npm start            # Produção
npx prisma studio    # Interface visual do DB
npx prisma migrate   # Criar migration
```

### Frontend
```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run preview      # Preview build
```

---

## 📂 Estrutura de Arquivos

```
eduplay-marketplace/
├── backend/
│   ├── src/
│   │   ├── config/         # DB, Mercado Pago, Cloudinary
│   │   ├── controllers/    # Lógica de negócio
│   │   ├── middleware/     # Auth, Upload
│   │   ├── routes/         # Rotas da API
│   │   └── services/       # Email, Payments
│   ├── prisma/
│   │   └── schema.prisma   # Schema do banco
│   ├── .env               # ⚠️ Configure aqui
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/    # Navbar, Footer, etc
    │   ├── context/       # AuthContext
    │   ├── pages/         # Todas as páginas
    │   ├── services/      # API calls
    │   └── App.jsx
    └── .env              # ✅ Já configurado
```

---

## 🆘 Problemas Comuns

**Erro: "Port 3000 already in use"**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Erro: "Cannot connect to database"**
- Verifique se PostgreSQL está rodando
- Confirme DATABASE_URL no .env

**Erro: "Module not found"**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🎨 Customização

**Cores do TailwindCSS** - `frontend/tailwind.config.js`
```js
primary: '#7C3AED'    // Roxo
secondary: '#EC4899'  // Rosa
success: '#10B981'    // Verde
```

**Taxa da Plataforma** - `backend/src/services/paymentService.js`
```js
const platformFee = product.price * 0.10; // 10%
const producerCommission = order.amount * 0.90; // 90%
```

---

## 📖 Documentação Completa

Leia os arquivos:
- `README.md` - Documentação completa
- `SETUP_INSTRUCTIONS.md` - Instruções detalhadas

---

**Pronto! Seu marketplace está funcionando! 🎉**
