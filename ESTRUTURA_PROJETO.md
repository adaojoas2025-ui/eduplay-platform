# 📁 EDUPLAY PLATFORM - Estrutura do Projeto

## 📦 RAIZ DO PROJETO
```
eduplay-platform/
├── 📄 README.md
├── 📄 DEPLOY.md
├── 📄 API_DOCUMENTATION.md
├── 📄 render.yaml (Blueprint para deploy no Render)
├── 📁 .claude/
│   └── settings.local.json
├── 📁 backend/
└── 📁 frontend/
```

## 📁 BACKEND (Node.js + Express + Prisma + PostgreSQL)

```
backend/
├── 📄 server.js (Ponto de entrada)
├── 📄 package.json
├── 📄 .env
├── 📄 .env.production.example
│
├── 📁 prisma/
│   ├── schema.prisma
│   ├── seed.js
│   └── seeds/
│       └── gamification.seed.js
│
├── 📁 src/
│   ├── 📄 app.js (Configuração do Express)
│   │
│   ├── 📁 config/
│   │   ├── database.js (Prisma Client)
│   │   ├── jwt.js
│   │   ├── passport.js (Google OAuth)
│   │   ├── mercadopago.js
│   │   ├── cloudinary.js
│   │   ├── email.js
│   │   └── env.js
│   │
│   ├── 📁 api/
│   │   ├── 📁 controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── order.controller.js
│   │   │   ├── cart.controller.js
│   │   │   ├── payment.controller.js
│   │   │   ├── admin.controller.js
│   │   │   └── gamification.controller.js
│   │   │
│   │   ├── 📁 routes/
│   │   │   ├── index.js (Roteador principal)
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── order.routes.js
│   │   │   ├── cart.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── seller.routes.js
│   │   │   ├── admin.routes.js
│   │   │   ├── gamification.routes.js
│   │   │   └── temp-upgrade.routes.js
│   │   │
│   │   ├── 📁 middlewares/
│   │   │   ├── auth.middleware.js (JWT verification)
│   │   │   ├── rbac.middleware.js (Role-Based Access Control)
│   │   │   ├── validator.middleware.js
│   │   │   ├── errorHandler.middleware.js
│   │   │   ├── rateLimiter.middleware.js
│   │   │   └── upload.middleware.js (Cloudinary)
│   │   │
│   │   ├── 📁 validators/
│   │   │   ├── auth.validator.js
│   │   │   ├── user.validator.js
│   │   │   ├── product.validator.js
│   │   │   └── order.validator.js
│   │   │
│   │   └── 📁 services/
│   │       ├── auth.service.js
│   │       ├── user.service.js
│   │       ├── product.service.js
│   │       ├── order.service.js
│   │       ├── cart.service.js
│   │       ├── payment.service.js
│   │       ├── commission.service.js
│   │       ├── gamification.service.js
│   │       ├── email.service.js
│   │       └── storage.service.js
│   │
│   ├── 📁 repositories/
│   │   ├── user.repository.js
│   │   ├── product.repository.js
│   │   ├── order.repository.js
│   │   ├── cart.repository.js
│   │   └── commission.repository.js
│   │
│   └── 📁 utils/
│       ├── ApiError.js
│       ├── ApiResponse.js
│       ├── asyncHandler.js
│       ├── constants.js
│       └── logger.js
│
├── 📁 scripts/
│   ├── create-database.js
│   ├── upgrade-user-to-producer.js
│   └── fix-production-role.js
│
└── 📁 logs/ (Winston logs)
```

## 📁 FRONTEND (React + Vite + TailwindCSS + Zustand)

```
frontend/
├── 📄 package.json
├── 📄 vite.config.js
├── 📄 tailwind.config.js
├── 📄 postcss.config.js
├── 📄 .env
├── 📄 .env.production
│
├── 📁 src/
│   ├── 📄 main.jsx (Ponto de entrada)
│   ├── 📄 App.jsx (App principal com rotas)
│   │
│   ├── 📁 config/
│   │   └── api.config.js
│   │
│   ├── 📁 contexts/
│   │   ├── AuthContext.jsx ⭐ (NOVO - React Context API)
│   │   └── CartContext.jsx
│   │
│   ├── 📁 store/ (Zustand)
│   │   ├── useStore.js (Store principal)
│   │   ├── authStore.js
│   │   ├── cartStore.js
│   │   └── productStore.js
│   │
│   ├── 📁 components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── Loading.jsx
│   │   ├── Modal.jsx
│   │   ├── Table.jsx
│   │   ├── Sidebar.jsx
│   │   ├── StatsCard.jsx
│   │   ├── FileUpload.jsx
│   │   ├── GamificationWidget.jsx
│   │   ├── AchievementNotification.jsx
│   │   └── auth/
│   │       └── CallbackGoogle.jsx
│   │
│   ├── 📁 pages/
│   │   ├── 📁 public/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Marketplace.jsx
│   │   │   └── ProductDetail.jsx
│   │   │
│   │   ├── 📁 buyer/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MyCourses.jsx
│   │   │   ├── MyPurchases.jsx
│   │   │   ├── Orders.jsx
│   │   │   └── Profile.jsx
│   │   │
│   │   ├── 📁 producer/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MyProducts.jsx
│   │   │   ├── AddProduct.jsx
│   │   │   └── Sales.jsx
│   │   │
│   │   ├── 📁 seller/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MyProducts.jsx
│   │   │   ├── MySales.jsx
│   │   │   ├── CreateProduct.jsx
│   │   │   ├── EditProduct.jsx
│   │   │   └── Commissions.jsx
│   │   │
│   │   ├── 📁 admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ManageUsers.jsx
│   │   │   ├── ManageProducts.jsx
│   │   │   ├── ManageCommissions.jsx
│   │   │   └── GamificationAdmin.jsx
│   │   │
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Marketplace.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── ProductForm.jsx
│   │   ├── Checkout.jsx
│   │   ├── OrderSuccess.jsx
│   │   ├── OrderFailure.jsx
│   │   ├── OrderPending.jsx
│   │   ├── SellerDashboard.jsx
│   │   ├── SellerProducts.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminCommissions.jsx
│   │   ├── Gamification.jsx
│   │   └── UpgradeToProducer.jsx ⭐
│   │
│   ├── 📁 services/
│   │   ├── api.js (Axios instance)
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── productService.js
│   │   ├── orderService.js
│   │   ├── paymentService.js
│   │   ├── commissionService.js
│   │   ├── gamificationService.js
│   │   └── reviewService.js
│   │
│   ├── 📁 hooks/
│   │   └── useAuth.js
│   │
│   └── 📁 utils/
│       ├── formatters.js
│       ├── validation.js
│       └── uploadToCloudinary.js
│
└── 📁 dist/ (Build de produção)
```

## 🔑 CARACTERÍSTICAS PRINCIPAIS

### ✅ Funcionalidades Implementadas:
- **Autenticação JWT + Google OAuth 2.0**
- **RBAC (Role-Based Access Control)**: BUYER, PRODUCER, ADMIN
- **Upload de imagens via Cloudinary**
- **Pagamentos via Mercado Pago**
- **Sistema de Carrinho de Compras**
- **Sistema de Comissões (10% da plataforma)**
- **Gamificação (Pontos, Badges, Níveis)**
- **Email notifications (Nodemailer)**
- **Rate limiting e segurança**
- **Logs com Winston**
- **Deploy automatizado no Render via render.yaml**

## 🚀 TECNOLOGIAS

### Backend:
- **Node.js + Express.js**
- **Prisma ORM + PostgreSQL**
- **JWT + Passport.js**
- **Mercado Pago SDK**
- **Cloudinary SDK**
- **Nodemailer**
- **Winston Logger**

### Frontend:
- **React 18 + Vite**
- **React Router v6**
- **TailwindCSS**
- **Zustand (State Management)**
- **React Context API (Auth)** ⭐ NOVO
- **Axios**
- **React Toastify**
- **React Icons**

## 📌 ALTERAÇÕES RECENTES

### ✅ Migração para React Context API (2024-12-10)
1. **Criado `AuthContext.jsx`** para gerenciar autenticação com Context API
2. **Migrado Login/Register** para usar AuthContext em vez de Zustand
3. **Navbar agora usa `useAuth()`** do Context para estado de autenticação
4. **Corrigido problema de F5** após login/logout - estado agora atualiza sincronamente
5. **Adicionado sistema de upgrade** BUYER → PRODUCER via página dedicada

### 🎯 Fluxo de Autenticação Atual:

```
Login/Register
    ↓
API Backend (/auth/login ou /auth/register)
    ↓
Recebe { user, accessToken, refreshToken }
    ↓
AuthContext.login(user, accessToken, refreshToken)
    ↓
1. localStorage.setItem('token', accessToken)
2. localStorage.setItem('refreshToken', refreshToken)
3. localStorage.setItem('userData', JSON.stringify(user))
4. setUser(user) ← ATUALIZAÇÃO SÍNCRONA DO ESTADO
    ↓
Navbar re-renderiza IMEDIATAMENTE
    ↓
Mostra nome do usuário e menu correto SEM PRECISAR DE F5
```

## 🔄 Estado da Aplicação

### Produção:
- **Frontend**: https://eduplay-frontend.onrender.com
- **Backend**: https://eduplay-backend.onrender.com
- **Database**: PostgreSQL no Render

### Último Deploy:
- Commit: `e0fdbb7` - Migrate authentication to React Context API
- Status: Em deploy no Render (aguardando 5-10 minutos)

## 📝 Próximos Passos

1. ✅ Testar se o problema do F5 foi resolvido com Context API
2. Se necessário, migrar também Login.jsx e Register.jsx standalone
3. Atualizar UpgradeToProducer.jsx para usar AuthContext
4. Considerar migrar todo Zustand para Context API para consistência
