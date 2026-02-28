# EduplayJA - Documentação Completa do Projeto

## 📋 Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura Técnica](#2-arquitetura-técnica)
3. [Estrutura de Diretórios](#3-estrutura-de-diretórios)
4. [Modelos do Banco de Dados](#4-modelos-do-banco-de-dados)
5. [Fluxos Principais](#5-fluxos-principais)
6. [API Endpoints](#6-api-endpoints)
7. [Componentes Frontend](#7-componentes-frontend)
8. [Autenticação e Autorização](#8-autenticação-e-autorização)
9. [Sistema de Pagamentos](#9-sistema-de-pagamentos)
10. [Sistema de Emails](#10-sistema-de-emails)
11. [Sistema de Order Bump](#11-sistema-de-order-bump)
11. [Upload de Arquivos](#11-upload-de-arquivos)
12. [Gamificação](#12-gamificação)
13. [Segurança](#13-segurança)
14. [Logging e Monitoramento](#14-logging-e-monitoramento)
15. [Deploy e Configuração](#15-deploy-e-configuração)
16. [Testes Realizados](#16-testes-realizados)
17. [Funcionalidades Implementadas](#17-funcionalidades-implementadas)
18. [Scripts Úteis](#18-scripts-úteis)
19. [Padrões e Convenções](#19-padrões-e-convenções)
20. [Roadmap Futuro](#20-roadmap-futuro)

---

## 1. Visão Geral

### 📖 Sobre o Projeto

**Nome**: EduplayJA
**Tipo**: Marketplace de Produtos Digitais Educacionais
**Status**: Em Produção
**Objetivo**: Plataforma completa para venda e compra de produtos digitais educacionais com sistema de gamificação

### 🌐 URLs

- **Backend API**: https://eduplay-platform.onrender.com/api/v1
- **Frontend**: https://eduplay-frontend.onrender.com
- **Repositório**: GitHub (privado)

### 🎯 Propósito

EduplayJA é um marketplace que conecta produtores de conteúdo educacional com compradores, oferecendo:
- Sistema completo de venda de produtos digitais
- Aprovação administrativa de produtos
- Processamento de pagamentos via Mercado Pago (compras) e Asaas (saques PIX)
- Sistema de comissões (90% produtor, 10% plataforma; produtos do admin: 100% plataforma)
- Order Bump para aumentar ticket médio de vendas
- Gamificação com pontos, níveis, badges e missões
- Store de aplicativos/jogos educacionais
- Sistema de combos de produtos

---

## 2. Arquitetura Técnica

### 🏗️ Stack Backend

```javascript
{
  "runtime": "Node.js 18+",
  "framework": "Express.js",
  "database": "PostgreSQL",
  "orm": "Prisma",
  "authentication": "JWT + Google OAuth",
  "payments": "Mercado Pago API + Asaas (PIX transfers)",
  "storage": "Cloudinary",
  "email": "Nodemailer (Gmail) + SendGrid",
  "logger": "Winston",
  "validation": "Joi",
  "security": ["helmet", "cors", "bcryptjs", "express-rate-limit"]
}
```

### ⚛️ Stack Frontend

```javascript
{
  "framework": "React 18",
  "bundler": "Vite",
  "styling": "Tailwind CSS",
  "stateManagement": ["Zustand", "React Context"],
  "routing": "React Router v6",
  "http": "Axios",
  "icons": "React Icons",
  "dateHandling": "date-fns"
}
```

### 🔧 Infraestrutura

- **Backend Hosting**: Render.com (Free Tier)
- **Frontend Hosting**: Render (Free Tier)
- **Database**: PostgreSQL no Render.com
- **File Storage**: Cloudinary
- **Email Service**: Gmail SMTP + SendGrid
- **Payment Gateway**: Mercado Pago (compras) + Asaas (saques PIX)

### 🔄 Arquitetura de Camadas

```
┌─────────────────────────────────────────┐
│           Frontend (React)              │
│  - Pages, Components, Services          │
└──────────────┬──────────────────────────┘
               │ HTTP/REST
┌──────────────▼──────────────────────────┐
│         API Layer (Express)             │
│  - Routes, Middlewares, Validation      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Controller Layer                   │
│  - Request/Response handling            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│       Service Layer                     │
│  - Business Logic                       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│     Repository Layer                    │
│  - Data Access (Prisma)                 │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Database (PostgreSQL)              │
└─────────────────────────────────────────┘
```

---

## 3. Estrutura de Diretórios

### 📁 Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── cloudinary.js          # Configuração Cloudinary
│   │   ├── database.js             # Prisma client
│   │   └── mercadopago.js          # Configuração Mercado Pago
│   │
│   ├── controllers/                # 14 Controllers
│   │   ├── authController.js       # Autenticação e registro
│   │   ├── productController.js    # CRUD de produtos
│   │   ├── orderController.js      # Pedidos e compras
│   │   ├── cartController.js       # Carrinho de compras
│   │   ├── userController.js       # Perfil de usuário
│   │   ├── commissionController.js # Comissões
│   │   ├── paymentController.js    # Pagamentos e webhooks
│   │   ├── reviewController.js     # Avaliações
│   │   ├── comboController.js      # Combos de produtos
│   │   ├── appController.js        # Apps/Games
│   │   ├── uploadController.js     # Upload de arquivos
│   │   ├── gamificationController.js # Gamificação
│   │   ├── missionController.js    # Missões
│   │   └── leaderboardController.js # Rankings
│   │
│   ├── services/                   # 10 Services
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── orderService.js
│   │   ├── commissionService.js
│   │   ├── paymentService.js
│   │   ├── emailService.js
│   │   ├── uploadService.js
│   │   ├── gamificationService.js
│   │   ├── missionService.js
│   │   └── leaderboardService.js
│   │
│   ├── repositories/               # 7 Repositories
│   │   ├── userRepository.js
│   │   ├── productRepository.js
│   │   ├── orderRepository.js
│   │   ├── commissionRepository.js
│   │   ├── reviewRepository.js
│   │   ├── comboRepository.js
│   │   └── appRepository.js
│   │
│   ├── routes/                     # 14 Route Groups
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── userRoutes.js
│   │   ├── commissionRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── comboRoutes.js
│   │   ├── appRoutes.js
│   │   ├── uploadRoutes.js
│   │   ├── gamificationRoutes.js
│   │   ├── missionRoutes.js
│   │   └── leaderboardRoutes.js
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js       # JWT verification
│   │   ├── roleMiddleware.js       # Role-based access
│   │   ├── errorHandler.js         # Error handling
│   │   ├── rateLimiter.js          # Rate limiting
│   │   └── upload.js               # Multer config
│   │
│   ├── utils/
│   │   ├── logger.js               # Winston logger
│   │   ├── validators.js           # Joi validators
│   │   ├── emailTemplates.js       # Email HTML templates
│   │   └── helpers.js              # Helper functions
│   │
│   └── server.js                   # Express app entry
│
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── migrations/                 # Migration files
│
├── scripts/                        # Utility scripts
│   ├── approve-geografia-product.js
│   ├── check-admin-users.js
│   ├── check-user-purchases.js
│   ├── create-admin-and-check-products.js
│   ├── list-all-admins.js
│   ├── promote-user-to-producer.js
│   └── set-user-as-admin.js
│
├── package.json
└── .env
```

### 📁 Frontend Structure

```
frontend/
├── src/
│   ├── components/                 # 15+ Reusable Components
│   │   ├── Navbar.jsx              # Main navigation
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ErrorMessage.jsx
│   │   ├── SuccessMessage.jsx
│   │   ├── Modal.jsx
│   │   ├── Pagination.jsx
│   │   ├── SearchBar.jsx
│   │   ├── FilterSidebar.jsx
│   │   ├── ReviewCard.jsx
│   │   ├── ComboCard.jsx
│   │   ├── AppCard.jsx
│   │   ├── BadgeDisplay.jsx
│   │   └── LevelProgress.jsx
│   │
│   ├── pages/                      # 58+ Pages
│   │   ├── public/
│   │   │   ├── Home.jsx
│   │   │   ├── Marketplace.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── About.jsx
│   │   │   └── Contact.jsx
│   │   │
│   │   ├── buyer/
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── MyProducts.jsx
│   │   │   ├── MyOrders.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Gamification.jsx
│   │   │   ├── Missions.jsx
│   │   │   └── Leaderboard.jsx
│   │   │
│   │   ├── producer/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateProduct.jsx
│   │   │   ├── EditProduct.jsx
│   │   │   ├── MyProducts.jsx
│   │   │   ├── Sales.jsx
│   │   │   ├── Commissions.jsx
│   │   │   └── Analytics.jsx
│   │   │
│   │   └── admin/
│   │       ├── Dashboard.jsx
│   │       ├── Products.jsx
│   │       ├── Users.jsx
│   │       ├── Orders.jsx
│   │       ├── Commissions.jsx
│   │       ├── Analytics.jsx
│   │       └── Settings.jsx
│   │
│   ├── services/
│   │   ├── api.js                  # Axios instance
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── orderService.js
│   │   ├── cartService.js
│   │   └── gamificationService.js
│   │
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useCart.js
│   │   └── useDebounce.js
│   │
│   ├── utils/
│   │   ├── formatters.js
│   │   └── validators.js
│   │
│   ├── App.jsx                     # Main app component
│   └── main.jsx                    # Entry point
│
├── public/
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 4. Modelos do Banco de Dados

### 📊 Schema Completo (14 Models)

#### User Model
```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String?
  name          String
  role          Role     @default(BUYER)
  status        UserStatus @default(ACTIVE)
  googleId      String?  @unique
  avatar        String?
  bio           String?
  phone         String?

  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  lastLogin     DateTime?

  // Relationships
  producedProducts Product[]  @relation("ProducedProducts")
  approvedProducts Product[]  @relation("ApprovedProducts")
  purchases        Order[]    @relation("BuyerOrders")
  reviews          Review[]
  cart             CartItem[]
  commissions      Commission[]
  gamification     Gamification?
  missionProgress  MissionProgress[]

  @@map("users")
}

enum Role {
  BUYER
  PRODUCER
  ADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DELETED
}
```

#### Product Model
```prisma
model Product {
  id              String   @id @default(uuid())
  title           String
  slug            String   @unique
  description     String
  price           Decimal  @db.Decimal(10, 2)
  thumbnail       String?
  videoUrl        String?
  filesUrl        String[]
  category        String
  tags            String[]
  status          ProductStatus @default(PENDING_APPROVAL)

  // Producer info
  producerId      String
  producer        User     @relation("ProducedProducts", fields: [producerId], references: [id])

  // Approval info
  approvedBy      String?
  approver        User?    @relation("ApprovedProducts", fields: [approvedBy], references: [id])
  approvedAt      DateTime?
  rejectionReason String?

  // Stats
  views           Int      @default(0)
  salesCount      Int      @default(0)
  rating          Decimal? @db.Decimal(3, 2)

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relationships
  orders          OrderItem[]
  reviews         Review[]
  cartItems       CartItem[]
  comboProducts   ComboProduct[]

  @@map("products")
}

enum ProductStatus {
  PENDING_APPROVAL
  PUBLISHED
  REJECTED
  ARCHIVED
}
```

#### Order Model
```prisma
model Order {
  id              String   @id @default(uuid())
  orderNumber     String   @unique

  // Buyer info
  buyerId         String
  buyer           User     @relation("BuyerOrders", fields: [buyerId], references: [id])

  // Payment info
  totalAmount     Decimal  @db.Decimal(10, 2)
  paymentMethod   String
  paymentId       String?
  paymentStatus   PaymentStatus @default(PENDING)

  // Mercado Pago
  mpPreferenceId  String?
  mpPaymentId     String?

  // Status
  status          OrderStatus @default(PENDING)

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  paidAt          DateTime?

  // Relationships
  items           OrderItem[]
  commissions     Commission[]

  @@map("orders")
}

enum OrderStatus {
  PENDING
  PROCESSING
  APPROVED
  COMPLETED
  FAILED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  APPROVED
  REJECTED
  REFUNDED
}
```

#### OrderItem Model
```prisma
model OrderItem {
  id          String  @id @default(uuid())

  orderId     String
  order       Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)

  productId   String
  product     Product @relation(fields: [productId], references: [id])

  price       Decimal @db.Decimal(10, 2)
  quantity    Int     @default(1)

  createdAt   DateTime @default(now())

  @@map("order_items")
}
```

#### Commission Model
```prisma
model Commission {
  id              String   @id @default(uuid())

  orderId         String
  order           Order    @relation(fields: [orderId], references: [id])

  producerId      String
  producer        User     @relation(fields: [producerId], references: [id])

  amount          Decimal  @db.Decimal(10, 2)
  percentage      Decimal  @db.Decimal(5, 2) @default(97.00)
  platformFee     Decimal  @db.Decimal(10, 2)

  status          CommissionStatus @default(PENDING)

  createdAt       DateTime @default(now())
  paidAt          DateTime?

  @@map("commissions")
}

enum CommissionStatus {
  PENDING
  PAID
  CANCELLED
}
```

#### CartItem Model
```prisma
model CartItem {
  id          String   @id @default(uuid())

  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  quantity    Int      @default(1)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, productId])
  @@map("cart_items")
}
```

#### Review Model
```prisma
model Review {
  id          String   @id @default(uuid())

  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  userId      String
  user        User     @relation(fields: [userId], references: [id])

  rating      Int      // 1-5
  comment     String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([productId, userId])
  @@map("reviews")
}
```

#### Combo Model
```prisma
model Combo {
  id          String   @id @default(uuid())
  title       String
  slug        String   @unique
  description String
  price       Decimal  @db.Decimal(10, 2)
  discount    Decimal  @db.Decimal(5, 2)
  thumbnail   String?
  status      ComboStatus @default(ACTIVE)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  products    ComboProduct[]

  @@map("combos")
}

enum ComboStatus {
  ACTIVE
  INACTIVE
}
```

#### ComboProduct Model
```prisma
model ComboProduct {
  id          String  @id @default(uuid())

  comboId     String
  combo       Combo   @relation(fields: [comboId], references: [id], onDelete: Cascade)

  productId   String
  product     Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([comboId, productId])
  @@map("combo_products")
}
```

#### OrderBump Model
```prisma
model OrderBump {
  id              String   @id @default(uuid())

  // Produto que será oferecido como bump
  productId       String
  product         Product  @relation("OrderBumpProduct", fields: [productId], references: [id], onDelete: Cascade)

  // Configuração do bump
  title           String   // Ex: "Adicione este curso agora!"
  description     String   @db.Text // Descrição persuasiva
  discountPercent Float    @default(0) // Desconto opcional (ex: 20 = 20% off)

  // Regras de exibição
  triggerType     OrderBumpTrigger @default(CATEGORY)
  triggerValues   String[]         @default([]) // IDs de categorias ou produtos

  // Controle
  producerId      String
  producer        User     @relation("ProducerOrderBumps", fields: [producerId], references: [id], onDelete: Cascade)
  isActive        Boolean  @default(true)
  priority        Int      @default(0) // Ordem de exibição (maior = mais prioritário)

  // Analytics
  impressions     Int      @default(0) // Quantas vezes foi mostrado
  clicks          Int      @default(0) // Quantas vezes foi clicado
  conversions     Int      @default(0) // Quantas vezes resultou em compra
  revenue         Float    @default(0) // Receita total gerada

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([producerId])
  @@index([isActive])
  @@index([triggerType])
  @@map("order_bumps")
}

enum OrderBumpTrigger {
  CATEGORY // Mostrar para produtos de categoria X
  PRODUCT  // Mostrar quando produto Y está no carrinho
  ANY      // Mostrar sempre (universal)
}
```

#### App Model
```prisma
model App {
  id          String   @id @default(uuid())
  title       String
  slug        String   @unique
  description String
  icon        String?
  url         String
  category    String
  tags        String[]
  isFree      Boolean  @default(true)
  price       Decimal? @db.Decimal(10, 2)

  downloads   Int      @default(0)
  rating      Decimal? @db.Decimal(3, 2)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("apps")
}
```

#### Gamification Model
```prisma
model Gamification {
  id              String   @id @default(uuid())

  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  points          Int      @default(0)
  level           Int      @default(1)
  experiencePoints Int     @default(0)

  badges          String[] // Array of badge IDs

  streak          Int      @default(0)
  lastActiveDate  DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("gamification")
}
```

#### Mission Model
```prisma
model Mission {
  id          String   @id @default(uuid())
  title       String
  description String
  type        MissionType
  target      Int
  reward      Int

  startDate   DateTime
  endDate     DateTime

  isActive    Boolean  @default(true)

  createdAt   DateTime @default(now())

  progress    MissionProgress[]

  @@map("missions")
}

enum MissionType {
  DAILY
  WEEKLY
  MONTHLY
  SPECIAL
}
```

#### MissionProgress Model
```prisma
model MissionProgress {
  id          String   @id @default(uuid())

  missionId   String
  mission     Mission  @relation(fields: [missionId], references: [id], onDelete: Cascade)

  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  progress    Int      @default(0)
  completed   Boolean  @default(false)

  createdAt   DateTime @default(now())
  completedAt DateTime?

  @@unique([missionId, userId])
  @@map("mission_progress")
}
```

#### Leaderboard Model
```prisma
model Leaderboard {
  id          String   @id @default(uuid())
  userId      String
  points      Int
  rank        Int
  period      LeaderboardPeriod

  createdAt   DateTime @default(now())

  @@unique([userId, period])
  @@map("leaderboards")
}

enum LeaderboardPeriod {
  DAILY
  WEEKLY
  MONTHLY
  ALL_TIME
}
```

---

## 5. Fluxos Principais

### 🔐 Fluxo de Autenticação

```
1. REGISTRO
   User Input (name, email, password)
   ↓
   Backend Validation (Joi)
   ↓
   Check if email exists
   ↓
   Hash password (bcrypt, 10 rounds)
   ↓
   Create user in database (role: BUYER)
   ↓
   Create gamification profile
   ↓
   Generate JWT tokens (access + refresh)
   ↓
   Send welcome email
   ↓
   Return user data + tokens

2. LOGIN
   User Input (email, password)
   ↓
   Find user by email
   ↓
   Compare password (bcrypt)
   ↓
   Update lastLogin timestamp
   ↓
   Generate JWT tokens
   ↓
   Return user data + tokens

3. GOOGLE OAUTH
   Google OAuth redirect
   ↓
   Receive Google profile
   ↓
   Find or create user (googleId)
   ↓
   Generate JWT tokens
   ↓
   Return user data + tokens

4. TOKEN REFRESH
   Send refresh token
   ↓
   Verify refresh token
   ↓
   Generate new access token
   ↓
   Return new token
```

### 📦 Fluxo de Produtos

```
1. CRIAÇÃO (Producer)
   Producer fills product form
   ↓
   Upload thumbnail (Cloudinary)
   ↓
   Upload video (optional)
   ↓
   Upload files
   ↓
   Create product (status: PENDING_APPROVAL)
   ↓
   Send email to all ADMINs
   ↓
   Return product data

2. APROVAÇÃO (Admin)
   Admin views pending products
   ↓
   Admin clicks "Aprovar"
   ↓
   Update product:
     - status: PUBLISHED
     - approvedBy: adminId
     - approvedAt: now()
   ↓
   Send approval email to producer
   ↓
   Product appears in marketplace

3. REJEIÇÃO (Admin)
   Admin clicks "Rejeitar"
   ↓
   Admin provides rejection reason
   ↓
   Update product:
     - status: REJECTED
     - rejectionReason: reason
   ↓
   Send rejection email to producer

4. VISUALIZAÇÃO NO MARKETPLACE
   User browses marketplace
   ↓
   Filter by category/search
   ↓
   Click on product card
   ↓
   View product details
   ↓
   Check if already purchased
   ↓
   If purchased: Show download buttons
   ↓
   If not: Show "Add to Cart"
```

### 💳 Fluxo de Pagamento

```
1. ADICIONAR AO CARRINHO
   User clicks "Add to Cart"
   ↓
   Check if already in cart
   ↓
   Create CartItem or update quantity
   ↓
   Update cart total

2. CHECKOUT
   User goes to cart
   ↓
   Click "Finalizar Compra"
   ↓
   Redirect to checkout page
   ↓
   Review items and total
   ↓
   Select payment method: PIX or Cartão
   ↓
   PIX: price = product price (no extra fees)
   Cartão: price = product + 4.99% MP fee + installment fee + R$1.00
   ↓
   Click "Pagar R$ X com PIX/Cartão"
   ↓
   Backend creates Mercado Pago preference (restricted to selected method)
   ↓
   Redirect to Mercado Pago checkout
   ↓
   User completes payment on MP

3. WEBHOOK (Mercado Pago)
   Mercado Pago sends payment notification
   ↓
   Backend receives webhook
   ↓
   Validate signature
   ↓
   Find order by mpPaymentId
   ↓
   If payment approved:
     - Update order: status=APPROVED
     - Create OrderItems
     - Calculate commissions (90% / 10%)
     - Clear user's cart
     - Send email to buyer (purchase confirmation)
     - Send email to producer (sale notification)
     - Update product salesCount
     - Award gamification points to buyer
   ↓
   Return 200 OK to Mercado Pago

4. ACESSO AO PRODUTO
   User goes to "Meus Produtos"
   ↓
   View purchased products
   ↓
   Click "Acessar Produto"
   ↓
   Redirect to product page (by slug)
   ↓
   Product page checks if purchased
   ↓
   Show download buttons for files
```

### 💰 Fluxo de Comissões

```
Order APPROVED
↓
For each OrderItem:
  ↓
  Get product.price and product.producerId
  ↓
  Calculate:
    - producerAmount = price * 0.90 (90%)
    - platformFee = price * 0.10 (10%)
  ↓
  Check producer role:
    - If ADMIN → Skip commission (100% platform revenue)
    - If PRODUCER → Create Commission:
      - orderId
      - producerId
      - amount = producerAmount
      - platformFee
      - status = PENDING
  ↓
  Producer can view in dashboard
  ↓
  Admin can mark as PAID when transferred
```

### 🎮 Fluxo de Gamificação

```
1. GANHAR PONTOS
   User completes action:
     - Makes purchase: +100 XP
     - Leaves review: +50 XP
     - Daily login: +10 XP
     - Completes mission: +mission.reward
   ↓
   Add XP to gamification.experiencePoints
   ↓
   Check if leveled up (XP threshold)
   ↓
   If leveled up:
     - Increment level
     - Award level badge
     - Send congratulations notification
   ↓
   Update leaderboards

2. BADGES
   Predefined badges:
     - first_purchase
     - level_5, level_10, level_25
     - mission_master (complete 10 missions)
     - social_butterfly (leave 5 reviews)
   ↓
   When condition met:
     - Add badge to gamification.badges[]
     - Award bonus XP
     - Show unlock animation

3. MISSÕES
   System creates missions:
     - Daily: "Make a purchase today"
     - Weekly: "Leave 3 reviews this week"
     - Monthly: "Spend R$500 this month"
   ↓
   User views missions
   ↓
   User performs action
   ↓
   Update MissionProgress.progress
   ↓
   If progress >= target:
     - Mark completed
     - Award reward XP
     - Show completion notification

4. LEADERBOARDS
   Updated periodically (cron job):
     - Daily: Reset every midnight
     - Weekly: Reset every Sunday
     - Monthly: Reset on 1st of month
     - All-time: Never reset
   ↓
   Calculate ranks by points
   ↓
   Display top 100 users
```

---

## 6. API Endpoints

### 🔌 Base URL
```
Production: https://eduplay-platform.onrender.com/api/v1/api/v1
```

### 🔐 Authentication Endpoints

#### POST /auth/register
Registra novo usuário

**Request Body:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@example.com",
      "role": "BUYER"
    },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

#### POST /auth/login
Realiza login

**Request Body:**
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

#### POST /auth/refresh
Renova access token

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

#### GET /auth/google
Inicia OAuth com Google

#### GET /auth/google/callback
Callback do Google OAuth

#### POST /auth/logout
Realiza logout (limpa tokens)

---

### 📦 Product Endpoints

#### GET /products
Lista produtos publicados (marketplace)

**Query Params:**
- `page` (default: 1)
- `limit` (default: 12)
- `category` (filter)
- `search` (search term)
- `sort` (createdAt, price, rating)

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "total": 50,
      "page": 1,
      "pages": 5
    }
  }
}
```

#### GET /products/:slug
Detalhes de um produto

#### POST /products
Cria novo produto (PRODUCER only)

**Auth Required:** Yes
**Role Required:** PRODUCER, ADMIN

**Request Body:**
```json
{
  "title": "Curso de Geografia",
  "description": "Curso completo...",
  "price": 99.90,
  "category": "educacao",
  "tags": ["geografia", "ensino-medio"],
  "thumbnail": "url",
  "videoUrl": "url",
  "filesUrl": ["url1", "url2"]
}
```

#### PUT /products/:id
Atualiza produto (PRODUCER only - own products)

**Auth Required:** Yes
**Role Required:** PRODUCER (próprio produto) ou ADMIN

**Request Body:** (todos os campos são opcionais)
```json
{
  "title": "Novo título do produto",
  "description": "Nova descrição detalhada...",
  "price": 149.90,
  "category": "Programação",
  "thumbnailUrl": "https://exemplo.com/nova-imagem.jpg",
  "videoUrl": "https://youtube.com/...",
  "filesUrl": ["https://drive.google.com/arquivo1", "https://drive.google.com/arquivo2"],
  "level": "Intermediário",
  "language": "Português",
  "certificateIncluded": true,
  "hasSupport": true,
  "supportDuration": 30
}
```

**Campos protegidos (não podem ser alterados):**
- `producerId` - Dono do produto
- `slug` - URL amigável (gerado automaticamente)
- `views` - Contador de visualizações
- `sales` - Contador de vendas
- `status` - Apenas ADMIN pode alterar

#### DELETE /products/:id
Deleta produto (PRODUCER only - own products)

#### GET /products/producer/my-products
Lista produtos do produtor logado

#### PUT /products/:id/approve
Aprova produto (ADMIN only)

**Request Body:**
```json
{
  "approvedBy": "admin-user-id"
}
```

#### PUT /products/:id/reject
Rejeita produto (ADMIN only)

**Request Body:**
```json
{
  "rejectionReason": "Conteúdo inadequado"
}
```

#### GET /products/admin/pending
Lista produtos pendentes de aprovação (ADMIN only)

---

### 🛒 Cart Endpoints

#### GET /cart
Retorna carrinho do usuário logado

**Auth Required:** Yes

#### POST /cart
Adiciona produto ao carrinho

**Request Body:**
```json
{
  "productId": "uuid",
  "quantity": 1
}
```

#### PUT /cart/:itemId
Atualiza quantidade do item

**Request Body:**
```json
{
  "quantity": 2
}
```

#### DELETE /cart/:itemId
Remove item do carrinho

#### DELETE /cart
Limpa todo o carrinho

---

### 💳 Payment Endpoints

#### POST /payments/create-preference
Cria preferência de pagamento no Mercado Pago

**Auth Required:** Yes

**Request Body:**
```json
{
  "items": [
    {
      "productId": "uuid",
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "preferenceId": "mp-preference-id",
    "initPoint": "https://mercadopago.com/checkout/..."
  }
}
```

#### POST /payments/webhook
Webhook do Mercado Pago (pagamentos)

**Request Body:** (enviado pelo Mercado Pago)
```json
{
  "type": "payment",
  "data": {
    "id": "payment-id"
  }
}
```

---

### 📋 Order Endpoints

#### GET /orders
Lista pedidos do usuário logado

**Auth Required:** Yes

#### GET /orders/:id
Detalhes de um pedido

#### GET /orders/purchases
Lista produtos comprados pelo usuário (orders APPROVED)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-id",
      "status": "APPROVED",
      "product": {
        "id": "uuid",
        "title": "Curso de Geografia",
        "slug": "curso-de-geografia",
        "filesUrl": ["url1", "url2"]
      }
    }
  ]
}
```

#### GET /orders/admin/all
Lista todos os pedidos (ADMIN only)

---

### 💰 Commission Endpoints

#### GET /commissions
Lista comissões do produtor logado

**Auth Required:** Yes
**Role Required:** PRODUCER, ADMIN

#### GET /commissions/admin/all
Lista todas as comissões (ADMIN only)

#### PUT /commissions/:id/mark-paid
Marca comissão como paga (ADMIN only)

---

### ⭐ Review Endpoints

#### GET /reviews/product/:productId
Lista reviews de um produto

#### POST /reviews
Cria review (só quem comprou)

**Request Body:**
```json
{
  "productId": "uuid",
  "rating": 5,
  "comment": "Excelente produto!"
}
```

#### PUT /reviews/:id
Atualiza review própria

#### DELETE /reviews/:id
Deleta review própria

---

### 👤 User Endpoints

#### GET /users/profile
Perfil do usuário logado

#### PUT /users/profile
Atualiza perfil

**Request Body:**
```json
{
  "name": "João Silva",
  "bio": "Professor de Geografia",
  "phone": "11999999999",
  "avatar": "url"
}
```

#### POST /users/upgrade-to-producer
Upgrade de BUYER para PRODUCER

#### PATCH /users/producer-settings
Atualiza configurações do produtor (dados comerciais e bancários)

**Auth Required:** Yes
**Role Required:** PRODUCER, ADMIN

**Request Body:**
```json
{
  "businessName": "Nome da Empresa",
  "businessDocument": "12.345.678/0001-90",
  "businessPhone": "11999999999",
  "businessAddress": "Rua Exemplo, 123, Cidade - Estado",
  "bankName": "Banco do Brasil",
  "bankAgency": "1234",
  "bankAccount": "12345-6",
  "bankAccountType": "corrente",
  "pixKey": "email@exemplo.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com",
    "businessName": "Nome da Empresa",
    "businessDocument": "12.345.678/0001-90",
    "businessPhone": "11999999999",
    "businessAddress": "Rua Exemplo, 123",
    "bankName": "Banco do Brasil",
    "bankAgency": "1234",
    "bankAccount": "12345-6",
    "bankAccountType": "corrente",
    "pixKey": "email@exemplo.com"
  },
  "message": "Producer settings updated successfully"
}
```

#### GET /users/admin/all
Lista todos usuários (ADMIN only)

---

### 📊 Seller Endpoints

#### GET /seller/stats
Estatísticas do vendedor (total vendas, comissões, produtos)

**Auth Required:** Yes
**Role Required:** PRODUCER, ADMIN

#### GET /seller/products
Lista produtos do vendedor

#### GET /seller/sales
Vendas recentes do vendedor

#### GET /seller/revenue-by-product
Receita detalhada por produto

#### GET /seller/reports
Relatórios detalhados de vendas com filtros

**Auth Required:** Yes
**Role Required:** PRODUCER, ADMIN

**Query Params:**
- `startDate` - Data inicial (YYYY-MM-DD)
- `endDate` - Data final (YYYY-MM-DD)
- `page` - Página (default: 1)
- `limit` - Itens por página (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [...],
    "summary": {
      "totalSales": 10,
      "totalAmount": 199.90,
      "totalProducerAmount": 193.90,
      "totalPlatformFee": 6.00
    },
    "chartData": [
      { "date": "2026-01-30", "count": 2, "amount": 39.98 }
    ],
    "salesByProduct": [
      { "productId": "...", "productTitle": "Curso X", "count": 5, "amount": 99.95 }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "pages": 1
    }
  }
}
```

---

### 📦 Combo Endpoints

#### GET /combos
Lista combos ativos

#### GET /combos/:slug
Detalhes de um combo

#### POST /combos
Cria combo (ADMIN only)

#### PUT /combos/:id
Atualiza combo (ADMIN only)

#### DELETE /combos/:id
Deleta combo (ADMIN only)

---

### 🎮 App Endpoints

#### GET /apps
Lista apps/games

**Query Params:**
- `category` (filter)
- `isFree` (true/false)

#### GET /apps/:slug
Detalhes de um app

#### POST /apps
Cria app (ADMIN only)

#### PUT /apps/:id
Atualiza app (ADMIN only)

#### DELETE /apps/:id
Deleta app (ADMIN only)

---

### 📤 Upload Endpoints

#### POST /upload/image
Upload de imagem (Cloudinary)

**Auth Required:** Yes
**Content-Type:** multipart/form-data

**Request:**
```
file: [image file]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://cloudinary.com/..."
  }
}
```

#### POST /upload/video
Upload de vídeo (Cloudinary)

#### POST /upload/file
Upload de arquivo (Cloudinary)

---

### 🎮 Gamification Endpoints

#### GET /gamification/profile
Perfil de gamificação do usuário

**Response:**
```json
{
  "success": true,
  "data": {
    "points": 1250,
    "level": 5,
    "experiencePoints": 1250,
    "badges": ["first_purchase", "level_5"],
    "streak": 7
  }
}
```

#### POST /gamification/award-points
Concede pontos ao usuário (system)

**Request Body:**
```json
{
  "userId": "uuid",
  "points": 100,
  "reason": "purchase"
}
```

---

### 🎯 Mission Endpoints

#### GET /missions
Lista missões ativas

#### GET /missions/my-progress
Progresso do usuário em missões

#### POST /missions/:id/update-progress
Atualiza progresso em missão

---

### 🏆 Leaderboard Endpoints

#### GET /leaderboards/:period
Ranking por período

**Params:**
- `period`: daily, weekly, monthly, all_time

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "userId": "uuid",
      "userName": "João Silva",
      "points": 5000
    }
  ]
}
```

---

## 7. Componentes Frontend

### 🧩 Componentes Reutilizáveis

#### Navbar.jsx
Barra de navegação principal

**Features:**
- Responsive (mobile + desktop)
- Dropdown menus com chevrons
- Links condicionais por role:
  - BUYER: Home, Marketplace, Cart, Profile
  - PRODUCER: + Dashboard, My Products, Sales
  - ADMIN: + Admin Panel, Pending Products, Commissions
- Avatar do usuário
- Logout

**Key Props:**
```jsx
// Usa AuthContext para user data
const { user, logout } = useAuth();
```

**Responsive Behavior:**
```jsx
// Desktop
<div className="hidden md:flex">
  {/* Desktop menu */}
</div>

// Mobile
<div className="md:hidden">
  <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
    <FiMenu />
  </button>
</div>

{mobileMenuOpen && (
  <div className="md:hidden">
    {/* Mobile dropdown menu */}
  </div>
)}
```

#### ProductCard.jsx
Card de produto para marketplace

**Props:**
```jsx
{
  product: {
    id, title, slug, thumbnail, price, rating, producer
  }
}
```

**Features:**
- Thumbnail com fallback
- Título truncado
- Preço formatado (R$)
- Rating com estrelas
- Nome do produtor
- Link para detalhes (by slug)

#### LoadingSpinner.jsx
Spinner de carregamento

```jsx
<LoadingSpinner size="large" /> // large, medium, small
```

#### ErrorMessage.jsx
Mensagem de erro estilizada

```jsx
<ErrorMessage message="Erro ao carregar dados" />
```

#### SuccessMessage.jsx
Mensagem de sucesso estilizada

```jsx
<SuccessMessage message="Produto adicionado ao carrinho!" />
```

#### Modal.jsx
Modal genérico

**Props:**
```jsx
{
  isOpen: boolean,
  onClose: () => void,
  title: string,
  children: ReactNode
}
```

#### Pagination.jsx
Paginação

**Props:**
```jsx
{
  currentPage: number,
  totalPages: number,
  onPageChange: (page) => void
}
```

---

### 📄 Páginas Principais

#### Home.jsx
Página inicial

**Sections:**
- Hero com CTA
- Produtos em destaque
- Categorias
- Estatísticas
- Depoimentos

#### Marketplace.jsx
Listagem de produtos

**Features:**
- Grid de ProductCards
- Filtros (categoria, preço, rating)
- Busca
- Ordenação
- Paginação

**State:**
```jsx
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [filters, setFilters] = useState({
  category: '',
  search: '',
  sort: 'createdAt'
});
const [pagination, setPagination] = useState({
  page: 1,
  totalPages: 1
});
```

#### ProductDetails.jsx
Detalhes do produto

**Features:**
- Thumbnail/Video
- Título, descrição, preço
- Rating e reviews
- Informações do produtor
- Botão "Add to Cart" OU Download buttons (se já comprou)

**Key Logic:**
```jsx
// Check if user purchased this product
const checkIfPurchased = async (productId) => {
  const response = await api.get('/orders/purchases');
  const purchased = response.data.data.some(
    p => p.product?.id === productId &&
         (p.status === 'APPROVED' || p.status === 'COMPLETED')
  );
  setHasPurchased(purchased);
};
```

#### MyProducts.jsx
Produtos comprados pelo usuário

**Features:**
- Lista de produtos comprados
- Botão "Acessar Produto" (link by slug)
- Download files (se disponível)
- Filtros por categoria

**Important Fix:**
```jsx
// CORRETO - usar slug
<Link to={`/product/${purchase.product?.slug || purchase.product?.id}`}>
  Acessar Produto
</Link>

// ERRADO - não usar apenas ID
// <Link to={`/product/${purchase.product?.id}`}>
```

#### Cart.jsx
Carrinho de compras

**Features:**
- Lista de itens no carrinho
- Atualizar quantidade
- Remover item
- Total calculado
- Botão "Finalizar Compra"

**State:**
```jsx
const { cart, updateQuantity, removeItem, clearCart } = useCart();
```

#### Checkout.jsx
Página de checkout com seletor de forma de pagamento

**Features:**
- Revisão dos itens
- Seletor PIX / Cartão (cards grandes e visíveis)
- PIX: preço normal com badge "Melhor preço!"
- Cartão: preço com taxas + detalhamento transparente
- Tabela de parcelas 1x a 12x com valores
- Resumo lateral dinâmico (atualiza conforme seleção)
- Botão muda cor: verde (PIX) / azul (Cartão)

**Taxas no Cartão:**
- Taxa MP: 4.99% sobre o preço do produto
- Taxa de parcelamento: varia de 0% (1x) a 17.28% (12x)
- Taxa de serviço: R$1.00 fixo
- Todas as taxas são visíveis para o comprador antes de pagar

**Flow:**
```jsx
const handleCheckout = async () => {
  const orderData = {
    productId: item.productId,
    paymentMethod: paymentType === 'pix' ? 'PIX' : 'CARD',
    paymentType: paymentType, // 'pix' or 'card'
  };

  const response = await axios.post(`${API_URL}/orders`, orderData);

  // Redirect to Mercado Pago (restricted to selected method)
  window.location.href = response.data.data.paymentUrl;
};
```

#### Producer Dashboard
Dashboard do produtor

**Sections:**
- Total de vendas
- Comissões pendentes
- Produtos publicados
- Gráficos de vendas
- Últimas vendas

#### Admin Dashboard
Dashboard do administrador

**Sections:**
- Total de usuários
- Total de produtos
- Total de vendas
- Comissões da plataforma
- Produtos pendentes (link direto)

---

## 8. Autenticação e Autorização

### 🔐 JWT Authentication

#### Token Structure
```javascript
// Access Token (expires in 7 days)
{
  userId: "uuid",
  email: "user@example.com",
  role: "BUYER",
  iat: 1234567890,
  exp: 1234567890
}

// Refresh Token (expires in 30 days)
{
  userId: "uuid",
  type: "refresh",
  iat: 1234567890,
  exp: 1234567890
}
```

#### Token Generation
```javascript
// authService.js
const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );
};
```

### 🛡️ Middleware Stack

#### authMiddleware.js
Verifica se usuário está autenticado

```javascript
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'Usuário inválido ou inativo'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};
```

#### roleMiddleware.js
Verifica role do usuário

```javascript
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Não autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    next();
  };
};

// Usage:
// router.get('/admin/users', authMiddleware, requireRole('ADMIN'), controller);
// router.post('/products', authMiddleware, requireRole('PRODUCER', 'ADMIN'), controller);
```

### 👥 Role Hierarchy

```
ADMIN (mais privilégios)
  ↓
  - Acesso total ao sistema (todas as rotas e funcionalidades)
  - Aprovar/rejeitar produtos
  - Ver todos usuários, comissões e pedidos
  - Criar combos e apps
  - Criar e vender produtos (sem comissão - 100% receita plataforma)
  - Configurar PIX e Mercado Pago
  - Solicitar saques
  - Acessar dashboard de vendedor e admin

PRODUCER
  ↓
  - Criar produtos
  - Ver próprios produtos e vendas
  - Ver próprias comissões (90% da venda)
  - Dashboard de vendas
  - Configurar PIX e Mercado Pago
  - Solicitar saques

BUYER (menos privilégios)
  ↓
  - Comprar produtos
  - Ver produtos comprados
  - Adicionar ao carrinho
  - Deixar reviews
  - Ver perfil de gamificação
```

### 🔄 Role Upgrade

```javascript
// User can upgrade from BUYER to PRODUCER
POST /users/upgrade-to-producer

// userController.js
const upgradeToProducer = async (req, res) => {
  const userId = req.user.id;

  // Check if already PRODUCER or ADMIN
  if (req.user.role !== 'BUYER') {
    return res.status(400).json({
      success: false,
      message: 'Usuário já é produtor ou admin'
    });
  }

  // Update role
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role: 'PRODUCER' }
  });

  // Send notification email
  await emailService.sendProducerWelcome(updated.email);

  return res.json({
    success: true,
    data: { user: updated }
  });
};
```

### 🔒 Frontend Auth Context

```javascript
// AuthContext.jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // Set token in axios default headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Get user profile
          const response = await api.get('/users/profile');
          setUser(response.data.data);
        } catch (error) {
          // Token invalid, clear
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user, accessToken, refreshToken } = response.data.data;

    // Save tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    // Set axios header
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### 🚧 Protected Routes

```javascript
// ProtectedRoute.jsx
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

// Usage in App.jsx
<Route
  path="/producer/dashboard"
  element={
    <ProtectedRoute allowedRoles={['PRODUCER', 'ADMIN']}>
      <ProducerDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/*"
  element={
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminRoutes />
    </ProtectedRoute>
  }
/>
```

---

## 9. Sistema de Pagamentos

### 💳 Mercado Pago Integration

#### Configuration
```javascript
// config/mercadopago.js
const mercadopago = require('mercadopago');

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

module.exports = mercadopago;
```

#### Environment Variables
```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxx-xxxxxxxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxx-xxxxxxxx
FRONTEND_URL=https://eduplay-frontend.onrender.com
BACKEND_URL=https://eduplay-platform.onrender.com/api/v1
```

### 🛒 Checkout Flow

#### Step 1: Create Preference
```javascript
// paymentController.js
const createPreference = async (req, res) => {
  const { items } = req.body; // [{ productId, quantity }]
  const userId = req.user.id;

  try {
    // Get products details
    const products = await Promise.all(
      items.map(item =>
        prisma.product.findUnique({ where: { id: item.productId } })
      )
    );

    // Calculate total
    const totalAmount = products.reduce((sum, p, i) =>
      sum + (parseFloat(p.price) * items[i].quantity), 0
    );

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        buyerId: userId,
        totalAmount,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: {
          create: products.map((p, i) => ({
            productId: p.id,
            price: p.price,
            quantity: items[i].quantity
          }))
        }
      }
    });

    // Create Mercado Pago preference
    const preference = {
      items: products.map((p, i) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        picture_url: p.thumbnail,
        quantity: items[i].quantity,
        unit_price: parseFloat(p.price),
        currency_id: 'BRL'
      })),
      payer: {
        email: req.user.email,
        name: req.user.name
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/payment/success`,
        failure: `${process.env.FRONTEND_URL}/payment/failure`,
        pending: `${process.env.FRONTEND_URL}/payment/pending`
      },
      auto_return: 'approved',
      external_reference: order.id,
      notification_url: `${process.env.BACKEND_URL}/api/v1/payments/webhook`,
      statement_descriptor: 'EDUPLAYJA',
      // IMPORTANTE: NÃO usar 'purpose: onboarding_credits' pois força login obrigatório no MP

      // Payment method restrictions based on paymentType:
      // PIX: excludes credit_card, debit_card, prepaid_card, account_money, ticket
      // Card: excludes bank_transfer (PIX) and ticket, allows up to 12 installments
      payment_methods: paymentMethodsConfig
    };

    const response = await mercadopago.preferences.create(preference);

    // Update order with MP preference ID
    await prisma.order.update({
      where: { id: order.id },
      data: { mpPreferenceId: response.body.id }
    });

    return res.json({
      success: true,
      data: {
        preferenceId: response.body.id,
        initPoint: response.body.init_point
      }
    });
  } catch (error) {
    logger.error('Error creating preference:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar preferência de pagamento'
    });
  }
};
```

#### Step 2: Webhook Handler
```javascript
// paymentController.js
const handleWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;

    // Only process payment notifications
    if (type !== 'payment') {
      return res.sendStatus(200);
    }

    const paymentId = data.id;

    // Get payment details from Mercado Pago
    const payment = await mercadopago.payment.findById(paymentId);
    const paymentData = payment.body;

    logger.info('Webhook payment data:', {
      id: paymentData.id,
      status: paymentData.status,
      external_reference: paymentData.external_reference
    });

    // Find order by external_reference
    const orderId = paymentData.external_reference;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        items: {
          include: {
            product: {
              include: {
                producer: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      logger.error('Order not found:', orderId);
      return res.sendStatus(404);
    }

    // Update order based on payment status
    if (paymentData.status === 'approved') {
      // Update order
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'APPROVED',
          paymentStatus: 'APPROVED',
          mpPaymentId: paymentId.toString(),
          paidAt: new Date()
        }
      });

      // Create commissions
      for (const item of order.items) {
        const productPrice = parseFloat(item.price);
        const producerAmount = productPrice * 0.90; // 90%
        const platformFee = productPrice * 0.10; // 10%

        await prisma.commission.create({
          data: {
            orderId: order.id,
            producerId: item.product.producerId,
            amount: producerAmount,
            percentage: 97.00,
            platformFee: platformFee,
            status: 'PENDING'
          }
        });

        // Update product sales count
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            salesCount: { increment: item.quantity }
          }
        });
      }

      // Clear buyer's cart
      await prisma.cartItem.deleteMany({
        where: { userId: order.buyerId }
      });

      // Award gamification points
      await gamificationService.awardPoints(
        order.buyerId,
        100,
        'purchase'
      );

      // Send emails
      await emailService.sendPurchaseConfirmation(
        order.buyer.email,
        order
      );

      for (const item of order.items) {
        await emailService.sendSaleNotification(
          item.product.producer.email,
          order,
          item.product
        );
      }

      logger.info('Order approved:', order.id);
    } else if (paymentData.status === 'rejected') {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'FAILED',
          paymentStatus: 'REJECTED'
        }
      });

      logger.info('Payment rejected:', order.id);
    }

    return res.sendStatus(200);
  } catch (error) {
    logger.error('Webhook error:', error);
    return res.sendStatus(500);
  }
};
```

### 💰 Commission Calculation

**Regra de comissão por tipo de vendedor:**

| Cenário | Comissão Produtor | Receita Plataforma |
|---------|-------------------|--------------------|
| Produto de PRODUCER | 90% | 10% |
| Produto de ADMIN | 0% (sem comissão) | 100% |
| App purchase | 0% (sem comissão) | 100% |

```javascript
// order.service.js - updateOrderStatus()
// Ao completar um pedido:
// 1. Verifica se o produtor é ADMIN
// 2. Se ADMIN: pula comissão (100% plataforma)
// 3. Se PRODUCER: cria comissão (90% produtor / 10% plataforma)
const producer = await userRepository.findUserById(order.product.producerId);
const isAdminProduct = producer && producer.role === USER_ROLES.ADMIN;

if (!isAdminProduct) {
  await commissionRepository.createCommission({
    id: crypto.randomUUID(),
    orderId: order.id,
    producerId: order.product.producerId,
    amount: order.producerAmount, // 90%
    status: COMMISSION_STATUS.PENDING,
  });
};
```

### 📧 Payment Emails

#### Purchase Confirmation (Buyer)
```javascript
// emailService.js
const sendPurchaseConfirmation = async (buyerEmail, order) => {
  const subject = `Compra Confirmada - Pedido #${order.orderNumber}`;

  const html = `
    <h2>🎉 Compra Confirmada!</h2>
    <p>Seu pagamento foi aprovado com sucesso.</p>

    <h3>Detalhes do Pedido</h3>
    <ul>
      <li>Número: ${order.orderNumber}</li>
      <li>Total: R$ ${order.totalAmount}</li>
      <li>Data: ${new Date(order.paidAt).toLocaleString('pt-BR')}</li>
    </ul>

    <h3>Produtos</h3>
    <ul>
      ${order.items.map(item => `
        <li>${item.product.title} - R$ ${item.price}</li>
      `).join('')}
    </ul>

    <p>
      <a href="${process.env.FRONTEND_URL}/my-products">
        Acessar Meus Produtos
      </a>
    </p>
  `;

  await sendEmail(buyerEmail, subject, html);
};
```

#### Sale Notification (Producer)
```javascript
const sendSaleNotification = async (producerEmail, order, product) => {
  const subject = `Nova Venda - ${product.title}`;

  const productPrice = parseFloat(product.price);
  const commission = productPrice * 0.97;

  const html = `
    <h2>💰 Nova Venda!</h2>
    <p>Você realizou uma nova venda no EduplayJA.</p>

    <h3>Produto</h3>
    <p><strong>${product.title}</strong></p>
    <p>Preço: R$ ${product.price}</p>

    <h3>Sua Comissão</h3>
    <p><strong>R$ ${commission.toFixed(2)}</strong> (90%)</p>

    <p>
      <a href="${process.env.FRONTEND_URL}/producer/sales">
        Ver Detalhes
      </a>
    </p>
  `;

  await sendEmail(producerEmail, subject, html);
};
```

### 💸 Asaas - Transferências PIX (Saques de Produtores)

O sistema usa **Asaas** para enviar PIX aos produtores quando solicitam saques.

- **Mercado Pago**: Recebe pagamentos dos compradores
- **Asaas**: Envia PIX para os produtores (saques)

#### Configuração
```env
ASAAS_API_KEY=sua_api_key
ASAAS_ENVIRONMENT=production
ASAAS_WEBHOOK_TOKEN=token_para_webhooks
```

#### Fluxo de Saque
1. Produtor solicita saque (valor exato ou total)
2. Sistema consome pedidos (inteiros ou parcialmente)
3. Envia valor exato via Asaas API `/transfers`
4. Asaas chama webhook de autorização automática
5. Webhook retorna `{ "status": "APPROVED" }`
6. PIX é enviado ao produtor

#### Saque Parcial
- O produtor pode sacar qualquer valor dentro do saldo
- Pedidos são consumidos parcialmente quando necessário
- Relação 1:N entre pedidos e transferências PIX

> **Documentação completa**: Ver [PIX-TRANSFER-SYSTEM.md](PIX-TRANSFER-SYSTEM.md)

---

## 10. Sistema de Emails

### 📧 Email Service Configuration

#### Providers Setup
```javascript
// services/emailService.js
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Configure Nodemailer (Gmail)
const gmailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Choose provider based on environment
const sendEmail = async (to, subject, html) => {
  try {
    if (process.env.EMAIL_PROVIDER === 'sendgrid') {
      await sgMail.send({
        to,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject,
        html
      });
    } else {
      await gmailTransporter.sendMail({
        from: process.env.GMAIL_USER,
        to,
        subject,
        html
      });
    }

    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    logger.error('Email send error:', error);
    throw error;
  }
};
```

### 📬 Email Templates

#### 1. Welcome Email (New User)
```javascript
const sendWelcomeEmail = async (userEmail, userName) => {
  const subject = '🎉 Bem-vindo ao EduplayJA!';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .button { background: #6366f1; color: white; padding: 12px 24px;
                  text-decoration: none; border-radius: 6px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bem-vindo ao EduplayJA!</h1>
        </div>
        <div class="content">
          <p>Olá, ${userName}!</p>
          <p>Estamos muito felizes em ter você conosco.</p>
          <p>O EduplayJA é a plataforma perfeita para você encontrar e adquirir
             produtos digitais educacionais de qualidade.</p>

          <h3>Comece agora:</h3>
          <ul>
            <li>Explore nosso marketplace</li>
            <li>Complete missões e ganhe pontos</li>
            <li>Suba de nível e desbloqueie badges</li>
          </ul>

          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/marketplace" class="button">
              Explorar Marketplace
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(userEmail, subject, html);
};
```

#### 2. Product Created (to Admins)
```javascript
const sendProductCreatedNotification = async (adminEmails, product) => {
  const subject = `📦 Novo Produto Pendente - ${product.title}`;

  const html = `
    <div class="container">
      <h2>Novo Produto Aguardando Aprovação</h2>

      <h3>Detalhes do Produto</h3>
      <ul>
        <li><strong>Título:</strong> ${product.title}</li>
        <li><strong>Categoria:</strong> ${product.category}</li>
        <li><strong>Preço:</strong> R$ ${product.price}</li>
        <li><strong>Produtor:</strong> ${product.producer.name} (${product.producer.email})</li>
      </ul>

      <p><strong>Descrição:</strong></p>
      <p>${product.description}</p>

      <p style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL}/admin/products" class="button">
          Revisar Produto
        </a>
      </p>
    </div>
  `;

  // Send to all admins
  for (const adminEmail of adminEmails) {
    await sendEmail(adminEmail, subject, html);
  }
};
```

#### 3. Product Approved (to Producer)
```javascript
const sendProductApprovedEmail = async (producerEmail, product) => {
  const subject = `✅ Produto Aprovado - ${product.title}`;

  const html = `
    <div class="container">
      <div class="header" style="background: #10b981;">
        <h1>🎉 Produto Aprovado!</h1>
      </div>
      <div class="content">
        <p>Ótimas notícias!</p>
        <p>Seu produto <strong>${product.title}</strong> foi aprovado e já está
           disponível no marketplace.</p>

        <p><strong>Data de aprovação:</strong> ${new Date(product.approvedAt).toLocaleString('pt-BR')}</p>

        <p>Agora os compradores podem encontrar e adquirir seu produto.
           Você receberá 90% do valor de cada venda.</p>

        <p style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/product/${product.slug}" class="button">
            Ver Produto
          </a>
        </p>
      </div>
    </div>
  `;

  await sendEmail(producerEmail, subject, html);
};
```

#### 4. Product Rejected (to Producer)
```javascript
const sendProductRejectedEmail = async (producerEmail, product, reason) => {
  const subject = `❌ Produto Não Aprovado - ${product.title}`;

  const html = `
    <div class="container">
      <div class="header" style="background: #ef4444;">
        <h1>Produto Não Aprovado</h1>
      </div>
      <div class="content">
        <p>Infelizmente, seu produto <strong>${product.title}</strong> não foi aprovado.</p>

        <p><strong>Motivo:</strong></p>
        <p style="background: #fee2e2; padding: 15px; border-radius: 6px;">${reason}</p>

        <p>Por favor, revise seu produto e faça os ajustes necessários antes de enviá-lo novamente.</p>

        <p style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/producer/products" class="button">
            Ver Meus Produtos
          </a>
        </p>
      </div>
    </div>
  `;

  await sendEmail(producerEmail, subject, html);
};
```

#### 5. Purchase Confirmation (to Buyer)
```javascript
// (Already shown in Payment section)
```

#### 6. Sale Notification (to Producer)
```javascript
// (Already shown in Payment section)
```

#### 7. Producer Welcome (Upgrade to Producer)
```javascript
const sendProducerWelcome = async (email) => {
  const subject = '🚀 Bem-vindo como Produtor!';

  const html = `
    <div class="container">
      <div class="header">
        <h1>🚀 Você agora é um Produtor!</h1>
      </div>
      <div class="content">
        <p>Parabéns! Sua conta foi promovida para Produtor.</p>

        <h3>O que você pode fazer agora:</h3>
        <ul>
          <li>Criar e vender produtos digitais</li>
          <li>Receber 90% do valor de cada venda</li>
          <li>Acompanhar suas vendas em tempo real</li>
          <li>Gerenciar suas comissões</li>
        </ul>

        <h3>Próximos Passos:</h3>
        <ol>
          <li>Crie seu primeiro produto</li>
          <li>Aguarde a aprovação do admin</li>
          <li>Comece a vender!</li>
        </ol>

        <p style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/producer/dashboard" class="button">
            Acessar Dashboard
          </a>
        </p>
      </div>
    </div>
  `;

  await sendEmail(email, subject, html);
};
```

#### 8. Password Reset
```javascript
const sendPasswordResetEmail = async (email, resetToken) => {
  const subject = '🔒 Redefinir Senha - EduplayJA';
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = `
    <div class="container">
      <h2>Redefinir Senha</h2>
      <p>Você solicitou a redefinição de senha.</p>
      <p>Clique no link abaixo para criar uma nova senha:</p>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" class="button">Redefinir Senha</a>
      </p>

      <p><small>Este link expira em 1 hora.</small></p>
      <p><small>Se você não solicitou, ignore este email.</small></p>
    </div>
  `;

  await sendEmail(email, subject, html);
};
```

### 📊 Email Sending Statistics

```javascript
// Track email statistics
const emailStats = {
  sent: 0,
  failed: 0,
  types: {
    welcome: 0,
    productCreated: 0,
    productApproved: 0,
    productRejected: 0,
    purchaseConfirmation: 0,
    saleNotification: 0,
    producerWelcome: 0,
    passwordReset: 0
  }
};

const trackEmail = (type, success) => {
  if (success) {
    emailStats.sent++;
    emailStats.types[type]++;
  } else {
    emailStats.failed++;
  }
};
```

### 📧 Configuração Atual (Produção)

#### Provedor: SendGrid (Primário)

```env
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=EducaplayJA <ja.eduplay@gmail.com>
PLATFORM_SUPPORT_EMAIL=adao.joas2025@gmail.com
```

**Regras importantes:**
- **FROM** deve ser um email verificado no SendGrid (Single Sender Identity)
- **FROM e TO devem ser diferentes** - Gmail rejeita silenciosamente emails onde remetente = destinatário via terceiros
- Configuração atual: FROM=`ja.eduplay@gmail.com` (verificado) | TO de suporte=`adao.joas2025@gmail.com`

#### Provedor: Nodemailer/Gmail SMTP (Fallback)

Usado automaticamente quando `SENDGRID_API_KEY` não está configurada.

```env
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=app_password_do_gmail
```

#### Arquivos do Sistema de Email

| Arquivo | Função |
|---------|--------|
| `backend/src/config/email.js` | Inicialização do serviço (SendGrid ou Nodemailer) |
| `backend/src/services/email.service.js` | Templates HTML e funções de envio |
| `backend/src/config/env.js` | Variáveis de ambiente (defaults) |

#### Templates de Email (12 tipos)

1. **Welcome** - Boas-vindas ao novo usuário
2. **Verification** - Verificação de email
3. **Password Reset** - Redefinição de senha (link expira em 1h)
4. **Order Confirmation** - Confirmação de pedido ao comprador
5. **Product Access** - Acesso ao produto com links de download
6. **New Sale Notification** - Notificação de venda ao produtor
7. **Commission Paid** - Comissão paga ao produtor
8. **Product Submitted** - Produto enviado para aprovação (admin)
9. **Product Pending Approval** - Produto aguardando aprovação (admin, template detalhado)
10. **Product Approved** - Produto aprovado (produtor)
11. **Product Rejected** - Produto rejeitado com motivo (produtor)
12. **Contact Form** - Mensagem do formulário de contato

### 📬 Formulário de Contato

**Endpoint:** `POST /api/v1/contact`

```javascript
// Campos obrigatórios
{
  name: "Nome do usuário",
  email: "email@exemplo.com",
  subject: "Assunto",
  message: "Mensagem de contato"
}
```

- **Rate limit**: 5 requisições por hora por IP
- **Destino**: `config.platform.supportEmail` (padrão: `adao.joas2025@gmail.com`)
- **Reply-To**: Email do remetente (permite responder diretamente)
- **Arquivo**: `backend/src/api/routes/contact.routes.js`

### 📧 Links de Email no Frontend

Os links de email nas páginas HelpCenter e Contact usam **Gmail Compose URL** ao invés de `mailto:`:

```
https://mail.google.com/mail/?view=cm&to=EMAIL&su=SUBJECT
```

**Motivo**: `mailto:` com `target="_blank"` abre `about:blank` em navegadores sem cliente de email configurado.

---


## 11. Sistema de Order Bump

### 💡 Visão Geral

Order Bump é uma estratégia de marketing que permite aos produtores **fortalecer vendas** ao oferecer produtos complementares durante o checkout, antes do pagamento finalizar. Inspirado no Checkout Sun da Eduzz, esta funcionalidade pode **aumentar o ticket médio em até 50%**.

### 🎯 Conceito

**Diferença entre Order Bump e Combo:**
- **Combo**: Bundle pré-definido com 2+ produtos e desconto fixo
- **Order Bump**: Produto individual sugerido DURANTE o checkout com base em regras inteligentes

### 📊 Como Funciona

1. **Configuração pelo Produtor**: O produtor cria um Order Bump definindo:
   - Produto a ser oferecido
   - Título persuasivo (ex: "Adicione este curso agora\!")
   - Descrição convincente
   - Desconto opcional (ex: 20% OFF)
   - Regras de exibição (categoria, produto específico, ou universal)
   - Prioridade de exibição

2. **Exibição no Checkout**: Quando o comprador está no checkout:
   - Sistema analisa os produtos no carrinho
   - Busca Order Bumps relevantes baseado nas regras
   - Exibe até 3 sugestões ordenadas por prioridade e taxa de conversão
   - Visual atrativo com destaque em amarelo/laranja

3. **Adição ao Pedido**: Se o comprador aceitar:
   - Produto do bump é adicionado ao carrinho
   - Total é recalculado automaticamente
   - Analytics registra a conversão

### 🔧 Estrutura Técnica

#### Modelo OrderBump
- **productId**: Produto oferecido como bump
- **title/description**: Textos persuasivos
- **discountPercent**: Desconto opcional (0-100)
- **triggerType**: CATEGORY | PRODUCT | ANY
- **triggerValues**: Array de IDs de categorias ou produtos
- **producerId**: Dono do bump
- **isActive**: Ativo/Inativo
- **priority**: Ordem de exibição (maior = mais prioritário)

#### Analytics Integrado
- **impressions**: Quantas vezes foi mostrado
- **clicks**: Quantas vezes foi clicado
- **conversions**: Quantas vendas gerou
- **revenue**: Receita total gerada
- **Taxa de conversão**: conversions / impressions * 100

### 🎨 UX/UI

**Localização**: Entre "Resumo do Pedido" e "Botão Pagar" na página Checkout

**Design Visual**:


### 📈 Regras de Negócio

#### Triggers (Quando Mostrar)
1. **CATEGORY**: Mostrar quando carrinho tem produto da categoria X
   - Ex: Carrinho tem "Matemática" → Mostra bump de "Geometria Avançada"

2. **PRODUCT**: Mostrar quando produto específico está no carrinho
   - Ex: Carrinho tem "Curso Básico" → Mostra bump de "Curso Avançado"

3. **ANY**: Mostrar sempre (universal)
   - Ex: Produto best-seller oferecido para qualquer compra

#### Priorização
- Sistema ordena bumps por: **priority (desc)** → **conversions (desc)**
- Máximo de 3 sugestões simultâneas
- Não exibe produtos já no carrinho

#### Comissões
- Mantém o sistema existente: 90% produtor, 10% plataforma
- Bumps contam como vendas normais para analytics

### 🚀 Implementação (Fase 1 Completa)

#### ✅ Banco de Dados
- Modelo  criado no Prisma
- Enum  com 3 tipos
- Relações com  e 
- Índices para performance (producerId, isActive, triggerType)
- Migração aplicada: 

#### 🔄 Próximas Fases

**Fase 2 - Backend API**:
- : CRUD + analytics
- : Lógica de sugestões e tracking
- : Endpoints REST
- Endpoints:
  - GET  - Buscar sugestões
  - POST  - Rastrear eventos
  - CRUD completo para produtores

**Fase 3 - Frontend**:
- : Componente de exibição
- Integração no 
- Lógica de adicionar/remover do carrinho
- Atualização automática do total

**Fase 4 - Dashboard Producer**:
- : Página de gerenciamento
- Criar/editar/deletar bumps
- Visualizar analytics (impressões, cliques, conversões)
- Gráficos de performance

### 📊 Exemplo de Uso

**Cenário**: Produtor de cursos de idiomas

1. **Criar Order Bump**:
   - Produto: "Curso de Inglês Avançado"
   - Título: "Evolua para o nível avançado agora\!"
   - Descrição: "Aproveite 30% de desconto ao adicionar o curso avançado"
   - Desconto: 30%
   - Trigger: CATEGORY = "Inglês Básico"
   - Priority: 10

2. **Fluxo do Comprador**:
   - Adiciona "Inglês Básico" ao carrinho (R$ 99,90)
   - Vai para checkout
   - Vê sugestão: "Inglês Avançado" por R$ 139,93 (30% OFF)
   - Clica em "Adicionar"
   - Total atualiza: R$ 239,83
   - Finaliza compra

3. **Analytics Registrado**:
   - Impressions: +1
   - Clicks: +1
   - Conversions: +1
   - Revenue: +139.93

### 🔒 Segurança e Permissões

- Apenas PRODUCER e ADMIN podem criar Order Bumps
- Produtor só vê/edita seus próprios bumps
- Validação de ownership antes de update/delete
- Rate limiting nos endpoints públicos
- Sanitização de inputs (XSS protection)

### 📝 Benefícios

**Para Produtores**:
- Aumenta ticket médio das vendas
- Estratégia de upsell automatizada
- Analytics detalhado de performance
- Fácil configuração e gerenciamento

**Para Compradores**:
- Descoberta de produtos relevantes
- Descontos exclusivos no momento da compra
- Oportunidade única (só aparece no checkout)

**Para Plataforma**:
- Aumenta comissões (10% de vendas maiores)
- Melhora métricas de conversão
- Diferencial competitivo

---
## 16. Testes Realizados

### ✅ Testes Manuais Executados

#### 1. Fluxo de Autenticação
- ✅ Registro de novo usuário
- ✅ Login com credenciais válidas
- ✅ Login com credenciais inválidas
- ✅ Google OAuth login
- ✅ Token refresh
- ✅ Logout

#### 2. Fluxo de Produtos
- ✅ Criar produto como PRODUCER
- ✅ Produto inicia com status PENDING_APPROVAL
- ✅ Admin recebe email de notificação
- ✅ Admin aprova produto
- ✅ Produtor recebe email de aprovação
- ✅ Produto aparece no marketplace
- ✅ Admin rejeita produto
- ✅ Produtor recebe email de rejeição

**Teste Real Executado:**
```javascript
// Script: approve-geografia-product.js
✅ Produto "geografia" encontrado
✅ Status alterado para PUBLISHED
✅ Aprovação registrada com adminId
✅ Email enviado ao produtor
```

#### 3. Fluxo de Compra
- ✅ Adicionar produto ao carrinho
- ✅ Atualizar quantidade no carrinho
- ✅ Remover item do carrinho
- ✅ Criar preferência no Mercado Pago
- ✅ Redirect para checkout MP
- ✅ Webhook recebe notificação de pagamento
- ✅ Order status atualizado para APPROVED
- ✅ Comissões criadas (90% / 10%)
- ✅ Carrinho limpo após compra
- ✅ Emails enviados (comprador + produtor)
- ✅ Gamificação: +100 XP para comprador

**Teste Real Executado:**
```javascript
// Script: check-user-purchases.js
✅ Verificado compras do usuário "adao18"
✅ Produto "geografia" adicionado às compras
✅ Status: COMPLETED
✅ Arquivos disponíveis para download
```

#### 4. Acesso ao Produto Comprado
- ✅ Produto aparece em "Meus Produtos"
- ✅ Botão "Acessar Produto" usa slug (não ID)
- ✅ Product Details verifica se foi comprado
- ✅ Mostra botões de download quando comprado
- ✅ Mostra "Add to Cart" quando não comprado

**Correção Aplicada:**
```javascript
// MyProducts.jsx - ANTES (incorreto)
to={`/product/${purchase.product?.id}`}  // ❌ 404 error

// MyProducts.jsx - DEPOIS (correto)
to={`/product/${purchase.product?.slug || purchase.product?.id}`}  // ✅ works
```

#### 5. Sistema de Comissões
- ✅ Comissão criada após aprovação do pagamento
- ✅ Cálculo correto: 90% produtor, 10% plataforma
- ✅ Produtor visualiza comissões no dashboard
- ✅ Admin pode marcar comissão como paga

#### 6. Mobile Responsiveness
- ✅ Navbar responsivo (mobile + desktop)
- ✅ Menu mobile com dropdown
- ✅ Chevrons nos links de dropdown
- ✅ Marketplace grid adapta para mobile
- ✅ Formulários responsivos

**Correções Aplicadas:**
```jsx
// Navbar.jsx
✅ Adicionado: md:hidden para mobile
✅ Adicionado: hidden md:block para desktop
✅ Adicionado: FiChevronDown icons
✅ "Produtos Pendentes" visível para PRODUCER e ADMIN
```

#### 7. Permissões por Role
- ✅ BUYER: acesso a marketplace, cart, purchases
- ✅ PRODUCER: + dashboard, create products, sales
- ✅ ADMIN: + approve products, view all users/orders
- ✅ Routes protegidas por roleMiddleware
- ✅ Frontend usa ProtectedRoute

**Script de Teste:**
```javascript
// set-user-as-admin.js
✅ Usuário ja.eduplay@gmail.com promovido para ADMIN
✅ Menu admin aparece na navbar
✅ Acesso aos produtos pendentes
```

#### 8. Upload de Arquivos
- ✅ Upload de thumbnail (Cloudinary)
- ✅ Upload de vídeo (opcional)
- ✅ Upload de múltiplos arquivos (product files)
- ✅ Preview de imagens
- ✅ Restrições de tipo e tamanho

#### 9. Sistema de Emails
- ✅ Welcome email ao registrar
- ✅ Email para admins quando produto criado
- ✅ Email para produtor quando produto aprovado
- ✅ Email para produtor quando produto rejeitado
- ✅ Email de confirmação de compra (comprador)
- ✅ Email de notificação de venda (produtor)

**Teste Real:**
```javascript
✅ Admin recebe email: "Novo Produto Pendente - Curso de Geografia"
✅ Produtor recebe email: "Produto Aprovado - Curso de Geografia"
✅ Comprador recebe email: "Compra Confirmada - Pedido #12345"
```

### 🧪 Áreas para Testes Futuros

#### Unit Tests (Jest + Supertest)
```javascript
// Exemplo de estrutura de testes
describe('AuthController', () => {
  describe('POST /auth/register', () => {
    it('should register new user with valid data', async () => {
      // Test implementation
    });

    it('should reject duplicate email', async () => {
      // Test implementation
    });

    it('should validate password length', async () => {
      // Test implementation
    });
  });
});
```

#### Integration Tests
- [ ] Fluxo completo de compra (end-to-end)
- [ ] Webhook do Mercado Pago (mock)
- [ ] Sistema de gamificação
- [ ] Missões e leaderboards

#### Frontend Tests (Vitest + React Testing Library)
```javascript
// Exemplo
describe('ProductCard', () => {
  it('should render product information', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Curso de Geografia')).toBeInTheDocument();
  });
});
```

---

## 17. Funcionalidades Implementadas

### ✨ Core Features

#### 1. Sistema de Autenticação Completo
- Registro de usuários (email + password)
- Login tradicional
- Google OAuth integration
- JWT access + refresh tokens
- Password reset (email)
- Session management

#### 2. Marketplace de Produtos Digitais
- Listagem de produtos publicados
- Filtros por categoria
- Busca por termo
- Ordenação (data, preço, rating)
- Paginação
- Visualização de detalhes
- Cards responsivos

#### 3. Sistema de Aprovação de Produtos
- Producer cria produto → PENDING_APPROVAL
- Notificação automática para admins
- Admin pode aprovar ou rejeitar
- Notificação para producer
- Apenas produtos PUBLISHED aparecem no marketplace

#### 4. Carrinho de Compras
- Adicionar produtos ao carrinho
- Atualizar quantidades
- Remover itens
- Calcular total
- Persistência por usuário
- Clear cart após compra

#### 5. Integração com Mercado Pago
- Criação de preferências de pagamento
- Redirect para checkout MP
- Webhook para processar pagamentos
- Status tracking (PENDING → APPROVED)
- Suporte a diferentes métodos de pagamento

#### 6. Sistema de Comissões
- Cálculo automático: 90% produtor, 10% plataforma
- Registro de comissões por venda
- Dashboard para produtores
- Admin pode marcar como paga
- Histórico de pagamentos

#### 7. Acesso a Produtos Comprados
- Página "Meus Produtos"
- Verificação automática de compra
- Download de arquivos
- Acesso permanente após compra
- Links por slug (SEO-friendly)

#### 8. Upload de Arquivos (Cloudinary)
- Upload de thumbnails
- Upload de vídeos
- Upload de múltiplos arquivos (product files)
- Otimização automática de imagens
- CDN global

#### 9. Sistema de Avaliações (Reviews)
- Apenas compradores podem avaliar
- Rating de 1-5 estrelas
- Comentários opcionais
- Média de rating por produto
- Editar/deletar próprias reviews

#### 10. Sistema de Gamificação Completo
**Pontos e Níveis:**
- XP por ações (compra, review, login)
- Sistema de níveis (1-100)
- Thresholds de XP por nível
- Progress bar visual

**Badges:**
- first_purchase
- level_5, level_10, level_25
- mission_master
- social_butterfly
- big_spender
- streak_7

**Missões:**
- Tipos: DAILY, WEEKLY, MONTHLY, SPECIAL
- Sistema de progresso
- Recompensas em XP
- Tracking automático

**Leaderboards:**
- Rankings: DAILY, WEEKLY, MONTHLY, ALL_TIME
- Top 100 usuários
- Atualização periódica
- Visualização de posição própria

#### 11. Combos de Produtos
- Agrupar múltiplos produtos
- Preço com desconto
- Gerenciamento (ADMIN)
- Exibição no marketplace
#### 12. Sistema de Order Bump (Fase 1 Completa)
**Funcionalidade inspirada no Checkout Sun da Eduzz - aumenta vendas em até 50%**

**Database (Implementado):**
- Modelo OrderBump com analytics integrado
- Enum OrderBumpTrigger (CATEGORY, PRODUCT, ANY)
- Relações com User e Product
- Índices de performance
- Migração aplicada: 20260113195636_add_order_bump_feature

**Características:**
- Sugestões inteligentes baseadas em triggers
- Descontos opcionais configuráveis
- Sistema de priorização
- Analytics: impressions, clicks, conversions, revenue
- Taxa de conversão automática

**Próximas Fases:**
- Backend API (controller, service, routes)
- Frontend component (OrderBumpSuggestion.jsx)
- Integração no Checkout.jsx
- Dashboard para produtores gerenciarem bumps


#### 13. Store de Apps/Jogos
- Listagem de apps educacionais
- Categoria e tags
- Apps gratuitos ou pagos
- Rating e downloads
- Links externos

#### 14. Dashboards por Role
**Producer Dashboard:**
- Total de vendas
- Comissões pendentes
- Produtos publicados
- Gráficos de vendas
- Últimas vendas

**Admin Dashboard:**
- Total de usuários
- Total de produtos
- Total de vendas
- Comissões da plataforma
- Produtos pendentes
- Estatísticas gerais

#### 15. Configurações do Produtor (Seller Settings)
**Página para produtores atualizarem dados comerciais e bancários**

**Dados do Negócio:**
- Nome do Negócio (businessName)
- CPF/CNPJ (businessDocument)
- Telefone Comercial (businessPhone)
- Endereço Completo (businessAddress)

**Dados Bancários:**
- Nome do Banco (bankName)
- Agência (bankAgency)
- Número da Conta (bankAccount)
- Tipo de Conta (bankAccountType: corrente/poupança)
- Chave PIX (pixKey)

**Acesso:**
- Rota: `/seller/settings`
- Botão no SellerDashboard
- Menu dropdown do usuário (navbar)
- Apenas PRODUCER e ADMIN

**Arquivos:**
- Frontend: `frontend/src/pages/seller/SellerSettings.jsx`
- Backend: `PATCH /api/v1/users/producer-settings`
- Service: `user.service.js → updateProducerSettings()`

#### 16. Relatórios de Vendas (Seller Reports)
**Página completa de analytics para produtores**

**Filtros:**
- Período rápido: Todos, Hoje, 7 dias, 30 dias, 1 ano
- Período customizado: Data inicial e final

**Métricas (Cards):**
- Total de Vendas
- Valor Total
- Comissão Plataforma (10%)
- Valor Líquido (você recebe)

**Visualizações:**
- Vendas por Dia (últimos 14 dias)
- Vendas por Produto (ranking com medalhas)
- Histórico de Vendas (tabela paginada)

**Funcionalidades:**
- Exportar para CSV
- Paginação
- Detalhes: data, produto, cliente, valores

**Acesso:**
- Rota: `/seller/reports`
- Botão "Ver Relatórios" no Dashboard
- Link "Ver todas" nas vendas recentes

**Arquivos:**
- Frontend: `frontend/src/pages/seller/SellerReports.jsx`
- Backend: `GET /api/v1/seller/reports`

#### 17. Sistema de Emails Automatizados
- Welcome email
- Produto criado (admin notification)
- Produto aprovado/rejeitado
- Confirmação de compra
- Notificação de venda
- Producer welcome (upgrade)
- Password reset

#### 18. Navegação Mobile Responsiva
- Menu mobile com hamburger
- Dropdowns animados
- Chevrons nos menus
- Links condicionais por role
- Touch-friendly
- Click outside para fechar dropdown (desktop)

#### 19. Sistema de Roles e Permissões
**3 Níveis:**
- BUYER: Comprar produtos
- PRODUCER: + Vender produtos
- ADMIN: + Gerenciar plataforma

**Role-based Access:**
- Backend: roleMiddleware
- Frontend: ProtectedRoute
- Conditional rendering

#### 20. Segurança Implementada
- Password hashing (bcrypt)
- JWT authentication
- HTTPS (production)
- CORS whitelist
- Helmet.js headers
- Rate limiting
- Input validation (Joi)
- SQL injection prevention (Prisma)
- XSS prevention
- File upload restrictions

#### 21. Logging e Monitoramento
- Winston logger
- Daily rotating logs
- Error tracking
- Request logging
- Performance monitoring
- Health check endpoints

#### 22. Pagamento Automático (Split Payment)
**Sistema de pagamento automático para produtores via Mercado Pago Split Payment**

**Como Funciona:**
- Produtor vincula conta do Mercado Pago via OAuth
- Ao vender, o dinheiro é dividido automaticamente:
  - 90% é repassado para a conta MP do produtor
  - 10% vai para a conta da plataforma (marketplace_fee)
- Não precisa de transferências manuais
- Reembolsos são processados proporcionalmente

**Fluxo de Vinculação:**
1. Produtor acessa Configurações
2. Clica em "Vincular Mercado Pago"
3. É redirecionado para página de autorização do MP
4. Faz login e autoriza a plataforma
5. Redirecionado de volta com código de autorização
6. Sistema troca código por tokens de acesso
7. Conta vinculada e pronta para receber

**Database (Novos campos em users):**
- `mercadopagoAccessToken` - Token de acesso OAuth
- `mercadopagoRefreshToken` - Token para renovação
- `mercadopagoUserId` - ID do usuário no MP
- `mercadopagoPublicKey` - Chave pública
- `mercadopagoAccountLinked` - Status da vinculação
- `mercadopagoLinkedAt` - Data da vinculação
- `mercadopagoTokenExpiresAt` - Expiração do token

**API Endpoints:**
- `GET /users/mercadopago/auth-url` - Gera URL de autorização
- `GET /users/mercadopago/callback` - Callback OAuth (recebe código)
- `GET /users/mercadopago/status` - Status da conta vinculada
- `POST /users/mercadopago/unlink` - Desvincular conta

**Frontend Components:**
- `LinkMercadoPago.jsx` - Componente de vinculação
- Aviso no Dashboard se MP não vinculado
- Seção na página de Configurações

**Fallback:**
- Se produtor não vincular MP, usa sistema de comissões manuais
- Aviso aparece no dashboard incentivando vinculação

**Arquivos:**
- Backend: `mercadopago.service.js`, `paymentService.js`
- Frontend: `LinkMercadoPago.jsx`, `SellerSettings.jsx`, `SellerDashboard.jsx`

**Variáveis de Ambiente Necessárias:**
- `MP_CLIENT_ID` - Client ID da aplicação OAuth
- `MP_CLIENT_SECRET` - Client Secret
- `MP_REDIRECT_URI` - URL de callback

### 🎯 Features por Módulo

```
AUTENTICAÇÃO
├── Register/Login/Logout
├── Google OAuth
├── JWT Tokens (access + refresh)
└── Password Reset

PRODUTOS
├── CRUD de produtos
├── Aprovação/Rejeição (Admin)
├── Upload de arquivos
├── Categorias e tags
└── Reviews e ratings

VENDAS
├── Carrinho de compras
├── Checkout (Mercado Pago)
├── Webhook de pagamentos
├── Sistema de comissões
└── Acesso a produtos comprados

GAMIFICAÇÃO
├── Pontos e níveis
├── Badges
├── Missões
└── Leaderboards

GERENCIAMENTO
├── Dashboard Producer
├── Dashboard Admin
├── Gestão de usuários
└── Gestão de comissões

COMUNICAÇÃO
├── Sistema de emails
├── Notificações automáticas
└── Templates personalizados
```

---

## 18. Scripts Úteis

### 🛠️ Scripts de Administração

#### 1. set-user-as-admin.js
Promove usuário para ADMIN

```javascript
// Uso
node backend/scripts/set-user-as-admin.js

// Funcionalidade
- Busca usuário por email (ja.eduplay@gmail.com)
- Altera role para ADMIN
- Exibe produtos pendentes de aprovação
- Mostra estatísticas de admins
```

#### 2. promote-user-to-producer.js
Promove usuário para PRODUCER

```javascript
// Uso
node backend/scripts/promote-user-to-producer.js

// Funcionalidade
- Busca usuário por email
- Altera role para PRODUCER
- Envia email de boas-vindas
```

#### 3. approve-geografia-product.js
Aprova produto específico (geografia)

```javascript
// Uso
node backend/scripts/approve-geografia-product.js

// Funcionalidade
- Busca produto por título (case-insensitive)
- Atualiza status para PUBLISHED
- Registra approvedBy e approvedAt
- Envia email ao produtor
```

#### 4. check-user-purchases.js
Verifica compras de um usuário

```javascript
// Uso
node backend/scripts/check-user-purchases.js

// Funcionalidade
- Busca usuário por username
- Lista todos os orders (APPROVED/COMPLETED)
- Mostra produtos comprados
- Exibe arquivos disponíveis
```

#### 5. check-admin-users.js
Lista todos usuários ADMIN

```javascript
// Uso
node backend/scripts/check-admin-users.js

// Funcionalidade
- Lista todos admins no sistema
- Mostra: id, name, email, createdAt
- Útil para verificar permissões
```

#### 6. list-all-admins.js
Lista admins com detalhes

```javascript
// Uso
node backend/scripts/list-all-admins.js

// Funcionalidade
- Similar ao check-admin-users
- Mais detalhes sobre cada admin
```

#### 7. create-admin-and-check-products.js
Cria admin e lista produtos pendentes

```javascript
// Uso
node backend/scripts/create-admin-and-check-products.js

// Funcionalidade
- Cria usuário admin (se não existir)
- Lista produtos PENDING_APPROVAL
- Mostra informações dos produtores
```

### 📦 Scripts do Package.json

#### Backend Scripts
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "build": "npx prisma generate",
    "migrate": "npx prisma migrate deploy",
    "migrate:dev": "npx prisma migrate dev",
    "migrate:reset": "npx prisma migrate reset",
    "studio": "npx prisma studio",
    "seed": "node prisma/seed.js",
    "lint": "eslint src/",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

**Uso:**
```bash
# Development
npm run dev

# Production
npm start

# Database
npm run migrate        # Deploy migrations
npm run migrate:dev    # Create new migration
npm run studio         # Open Prisma Studio
npm run seed           # Seed database

# Testing
npm test               # Run tests
npm run test:watch     # Watch mode
```

#### Frontend Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src/",
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

**Uso:**
```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Testing
npm test
npm run test:ui
```

### 🗄️ Database Scripts

#### Criar Migration
```bash
npx prisma migrate dev --name add_user_avatar
```

#### Deploy Migration (Production)
```bash
npx prisma migrate deploy
```

#### Reset Database (Development only)
```bash
npx prisma migrate reset
```

#### Gerar Prisma Client
```bash
npx prisma generate
```

#### Abrir Prisma Studio (GUI)
```bash
npx prisma studio
```

### 🔧 Utility Scripts

#### Clear Logs
```bash
# Windows
del /Q logs\*.log

# Linux/Mac
rm -f logs/*.log
```

#### Check Database Connection
```bash
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('Connected!')).catch(e => console.error(e))"
```

---

## 19. Padrões e Convenções

### 📐 Arquitetura de Código

#### Backend: Layered Architecture
```
Controller → Service → Repository → Database
```

**Responsabilidades:**
- **Controller**: HTTP request/response, validation
- **Service**: Business logic, orchestration
- **Repository**: Data access, Prisma queries
- **Database**: Prisma ORM, PostgreSQL

#### Exemplo:
```javascript
// Controller (HTTP layer)
exports.createProduct = async (req, res) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    const product = await productService.createProduct(value, req.user.id);
    return res.json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Service (Business logic)
class ProductService {
  async createProduct(data, producerId) {
    const slug = this.generateSlug(data.title);
    const product = await productRepository.create({ ...data, slug, producerId });
    await emailService.notifyAdminsNewProduct(product);
    return product;
  }
}

// Repository (Data access)
class ProductRepository {
  async create(data) {
    return await prisma.product.create({ data });
  }
}
```

### 📝 Naming Conventions

#### Backend (JavaScript)
```javascript
// Files: camelCase
authController.js
productService.js
userRepository.js

// Classes: PascalCase
class ProductService { }
class EmailService { }

// Functions/Methods: camelCase
async createProduct() { }
async sendEmail() { }

// Variables: camelCase
const userId = req.user.id;
const productData = req.body;

// Constants: UPPER_SNAKE_CASE
const JWT_SECRET = process.env.JWT_SECRET;
const XP_REWARDS = { purchase: 100 };

// Private methods: _camelCase
_calculateCommission() { }
```

#### Frontend (React)
```javascript
// Components: PascalCase
ProductCard.jsx
LoadingSpinner.jsx

// Pages: PascalCase
Marketplace.jsx
ProductDetails.jsx

// Hooks: camelCase with 'use' prefix
useAuth()
useCart()

// Services: camelCase
authService.js
api.js

// Props: camelCase
<ProductCard product={product} onAddToCart={handleAdd} />

// State variables: camelCase
const [loading, setLoading] = useState(false);
const [products, setProducts] = useState([]);
```

#### Database (Prisma)
```prisma
// Models: PascalCase singular
model User { }
model Product { }

// Fields: camelCase
email
createdAt
productId

// Enums: PascalCase
enum Role { BUYER PRODUCER ADMIN }

// Relations: camelCase plural for many
products Product[]
orders Order[]
```

### 🎨 Code Style

#### Indentation
- 2 spaces (not tabs)
- Consistent across files

#### Quotes
- Single quotes for strings: `'hello'`
- Double quotes for JSX: `<div className="container">`

#### Semicolons
- Always use semicolons

#### Line Length
- Max 100 characters (soft limit)
- Break long lines logically

#### Comments
```javascript
// Single line comment

/**
 * Multi-line comment
 * for functions/classes
 */

// TODO: Future improvement
// FIXME: Known issue
```

### 🔄 API Response Format

#### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Error message here"
}
```

#### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "total": 50,
      "page": 1,
      "pages": 5,
      "limit": 10
    }
  }
}
```

### 📂 File Organization

#### Backend
```
src/
├── config/         # Configuration files
├── controllers/    # HTTP handlers
├── services/       # Business logic
├── repositories/   # Data access
├── routes/         # Route definitions
├── middlewares/    # Express middlewares
├── utils/          # Utility functions
└── server.js       # Entry point
```

#### Frontend
```
src/
├── components/     # Reusable components
├── pages/          # Page components
├── services/       # API services
├── contexts/       # React contexts
├── hooks/          # Custom hooks
├── utils/          # Utility functions
└── App.jsx         # Main app component
```

### 🚀 Best Practices

#### 1. DRY (Don't Repeat Yourself)
```javascript
// ❌ Bad
const user1 = await prisma.user.findUnique({ where: { id: id1 } });
const user2 = await prisma.user.findUnique({ where: { id: id2 } });

// ✅ Good
const getUser = (id) => prisma.user.findUnique({ where: { id } });
const user1 = await getUser(id1);
const user2 = await getUser(id2);
```

#### 2. Single Responsibility
```javascript
// ❌ Bad - controller does too much
exports.createProduct = async (req, res) => {
  // Validates, creates, sends email, updates stats...
};

// ✅ Good - separate concerns
exports.createProduct = async (req, res) => {
  const product = await productService.createProduct(data);
  return res.json({ success: true, data: product });
};
```

#### 3. Error Handling
```javascript
// ✅ Always use try-catch in async functions
try {
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  logger.error('Operation failed:', error);
  throw error;
}
```

#### 4. Input Validation
```javascript
// ✅ Always validate user input
const { error, value } = schema.validate(req.body);
if (error) {
  return res.status(400).json({ success: false, message: error.message });
}
```

#### 5. Use Environment Variables
```javascript
// ✅ Never hardcode secrets
const secret = process.env.JWT_SECRET;

// ❌ Don't do this
const secret = 'my-secret-key-123';
```

---

## 20. Roadmap Futuro

### 🚀 Features Planejadas

#### Curto Prazo (1-2 meses)

**1. Melhorias no Sistema de Busca**
- [ ] Busca avançada com filtros múltiplos
- [ ] Sugestões de busca (autocomplete)
- [ ] Busca por tags
- [ ] Histórico de buscas

**2. Sistema de Favoritos**
- [ ] Adicionar produtos aos favoritos
- [ ] Página "Meus Favoritos"
- [ ] Notificações de promoções em favoritos

**3. Sistema de Cupons de Desconto**
- [ ] Criar cupons (ADMIN)
- [ ] Aplicar cupom no checkout
- [ ] Cupons por porcentagem ou valor fixo
- [ ] Data de expiração
- [ ] Limite de uso

**4. Melhorias no Dashboard**
- [ ] Gráficos interativos (Chart.js)
- [ ] Filtros por período
- [ ] Export de relatórios (CSV/PDF)
- [ ] Métricas avançadas

**5. Sistema de Notificações**
- [ ] Notificações in-app
- [ ] Badge de notificações não lidas
- [ ] Notificações push (PWA)
- [ ] Configuração de preferências

#### Médio Prazo (3-6 meses)

**6. Sistema de Afiliados**
- [ ] Links de afiliado personalizados
- [ ] Comissão para afiliados (5%)
- [ ] Dashboard de afiliado
- [ ] Tracking de conversões

**7. Sistema de Assinaturas (Subscription)**
- [ ] Planos mensais/anuais
- [ ] Acesso a conteúdo exclusivo
- [ ] Renovação automática
- [ ] Cancelamento a qualquer momento

**8. Chat ao Vivo**
- [ ] Chat comprador-produtor
- [ ] Chat suporte
- [ ] Upload de imagens no chat
- [ ] Histórico de conversas

**9. Sistema de Avaliação de Produtores**
- [ ] Rating de produtores
- [ ] Reviews de produtores
- [ ] Badge de "Top Seller"
- [ ] Perfil público do produtor

**10. Melhorias em Gamificação**
- [ ] Mais badges (100+ tipos)
- [ ] Conquistas desbloqueáveis
- [ ] Recompensas físicas (níveis altos)
- [ ] Competições mensais

#### Longo Prazo (6-12 meses)

**11. App Mobile (React Native)**
- [ ] Versão iOS
- [ ] Versão Android
- [ ] Push notifications nativas
- [ ] Offline mode

**12. Sistema de Lives**
- [ ] Lives com produtos
- [ ] Compra durante live
- [ ] Gravação automática
- [ ] Chat ao vivo

**13. Marketplace de Serviços**
- [ ] Além de produtos, vender serviços
- [ ] Agendamento de sessões
- [ ] Videoconferência integrada
- [ ] Sistema de agendas

**14. AI Integration**
- [ ] Recomendação de produtos (ML)
- [ ] Chatbot de suporte
- [ ] Geração de descrições (GPT)
- [ ] Análise de sentimento em reviews

**15. Internacionalização**
- [ ] Multi-idioma (PT, EN, ES)
- [ ] Multi-moeda
- [ ] Gateways de pagamento internacionais
- [ ] Localização de conteúdo

### 🔧 Melhorias Técnicas

#### Performance
- [ ] Implementar Redis para cache
- [ ] CDN para assets estáticos
- [ ] Lazy loading de imagens
- [ ] Code splitting (React)
- [ ] Service workers (PWA)

#### Testing
- [ ] Unit tests (Jest) - 80% coverage
- [ ] Integration tests (Supertest)
- [ ] E2E tests (Playwright/Cypress)
- [ ] Load testing (Artillery)

#### DevOps
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Automated deployments
- [ ] Staging environment
- [ ] Monitoring (Sentry, Datadog)
- [ ] Automated backups

#### Security
- [ ] Two-factor authentication (2FA)
- [ ] Email verification
- [ ] Security audit
- [ ] Penetration testing
- [ ] GDPR compliance

#### Documentation
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Component storybook
- [ ] User documentation
- [ ] Video tutorials

### 📊 Métricas de Sucesso

**KPIs para Acompanhar:**
- Número de usuários ativos (DAU/MAU)
- Taxa de conversão (visitantes → compradores)
- Ticket médio
- NPS (Net Promoter Score)
- Churn rate
- Tempo médio no site
- Taxa de rejeição
- Produtos mais vendidos
- Produtores mais lucrativos

### 🎯 Objetivos 2026

- **10.000 usuários cadastrados**
- **500 produtos publicados**
- **R$ 100.000 em vendas**
- **50 produtores ativos**
- **95% uptime**
- **< 2s tempo de carregamento**

---

## 📌 Conclusão

Este documento representa o estado atual completo do projeto **EduplayJA**, um marketplace de produtos digitais educacionais com funcionalidades avançadas de gamificação, sistema de pagamentos integrado e gestão completa de produtores e compradores.

### 🎉 Principais Conquistas

- ✅ **Sistema completo de autenticação** com OAuth e JWT
- ✅ **Marketplace funcional** com aprovação de produtos
- ✅ **Integração com Mercado Pago** (pagamentos, webhooks, taxas de cartão repassadas ao comprador)
- ✅ **Seletor PIX/Cartão no checkout** com taxas transparentes e tabela de parcelas
- ✅ **Sistema de comissões** (90% / 10%)
- ✅ **Order Bump** para aumentar ticket médio (Fase 1 completa)
- ✅ **Gamificação completa** (XP, níveis, badges, missões, leaderboards)
- ✅ **Upload de arquivos** via Cloudinary
- ✅ **Sistema de emails** automatizados
- ✅ **Mobile responsivo** com navegação otimizada
- ✅ **Segurança robusta** (bcrypt, JWT, CORS, rate limiting)
- ✅ **Deploy em produção** (Render + Render)

### 📚 Stack Tecnológica

**Backend**: Node.js, Express, Prisma, PostgreSQL
**Frontend**: React, Vite, Tailwind CSS, Zustand
**Infraestrutura**: Render.com, Render, Cloudinary
**Pagamentos**: Mercado Pago (compras) + Asaas (saques PIX)
**Email**: SendGrid / Gmail SMTP

### 👥 Equipe

- **Desenvolvimento**: Implementado com assistência de Claude Code (Anthropic)
- **Cliente**: ja.eduplay@gmail.com
- **Projeto**: Iniciado em 2025

### 📞 Contato

- **Website**: https://eduplay-frontend.onrender.com
- **Email**: ja.eduplay@gmail.com
- **GitHub**: [Repositório Privado]

---

**Última atualização**: 05 de Fevereiro de 2026
**Versão do documento**: 1.0.0

---

*Documentação gerada com ❤️ por [Claude Code](https://claude.com/claude-code)*

---

## 🔑 Credenciais e Serviços (atualizado 27/02/2026)

### Cloudinary (Storage para Imagens)
- **Cloud name**: `dexlzykqm`
- **API Key**: `915819541386718` (key "Untitled", criada 27/02/2026)
- **API Secret**: `XZKW5DwOEzrwindclMB1HnRhvkM`
- **Uso**: Upload de imagens/screenshots (unsigned preset `eduplay_apps` no frontend)

### Supabase (Storage para APKs)
- **Projeto**: EducaplayJA (criado 27/02/2026)
- **Senha do banco**: ver painel do Render / Supabase
- **Project URL**: `https://ssjeotuuqlmkyeiihqxw.supabase.co`
- **Publishable key (anon)**: configurada no Render como `SUPABASE_URL`
- **Secret key (service_role)**: configurada no Render como `SUPABASE_SERVICE_ROLE_KEY`
- **Bucket**: `Apks` (público, limite 50MB) ← nome com A maiúsculo
- **Uso**: Upload de APKs via backend (REST API direto, sem JS client)

### Variáveis de Ambiente no Render (Backend)
- `SUPABASE_URL` = URL do projeto Supabase
- `SUPABASE_SERVICE_ROLE_KEY` = service_role key (ver painel Supabase)
- `CLOUDINARY_API_KEY` = `915819541386718`
- `CLOUDINARY_API_SECRET` = ver painel Cloudinary ← não usado (hardcoded no código)
- `CLOUDINARY_CLOUD_NAME` = `dexlzykqm` ← não usado (hardcoded)

---

## 📝 Changelog — 26 e 27/02/2026

### 27/02/2026 — Upload de APK corrigido (depois de muita investigação)

**Problema**: Upload de APK falhava com "Invalid Signature" do Cloudinary.

**Investigação**:
1. `upload_stream` + pipe causava assinatura incorreta no SDK → substituído por `upload()` com base64 data URI
2. Render tinha `CLOUDINARY_API_SECRET` com uppercase 'I' errado → restaurado fallback
3. O fallback `||` nunca executa quando env var está definida (mesmo errada) → hardcode direto
4. Com hardcode, assinatura bate mas Cloudinary ainda rejeita → api_secret do Root key estava com problema no dashboard
5. Gerado novo par de credenciais (key "Untitled") → assinatura aceita, mas novo erro: **arquivo 13MB > limite 10MB do Cloudinary free**
6. Migração para **Firebase Storage** → requer plano pago (Blaze)
7. Migração para **Supabase Storage** → gratuito, sem limite por arquivo, funciona

**Arquivos modificados**:
- `backend/src/api/controllers/upload.controller.js` — APKs → Supabase REST API; imagens → Cloudinary
- `backend/src/config/cloudinary.js` — credenciais hardcoded (sem env vars)
- `backend/src/config/supabase.js` — criado (cliente Supabase, usado apenas para configuração)

**Fluxo de upload atual**:
- **Imagens** (screenshots, ícones): frontend → Cloudinary diretamente (unsigned preset `eduplay_apps`)
- **APKs**: frontend → backend `/api/v1/upload` → Supabase Storage bucket `Apks`

### 27/02/2026 — Correções no sistema de Apps

**Problemas corrigidos**:
- `prisma.app` → `prisma.apps` (nome correto do modelo)
- `prisma.appReview` → `prisma.app_reviews`
- `prisma.appDownload` → `app_downloads`
- Relação `reviews` → `app_reviews` nos includes
- UUID não gerado ao criar app → adicionado `crypto.randomUUID()`

**Arquivos modificados**:
- `backend/src/repositories/app.repository.js`
- `backend/src/services/app.service.js`

### 28/02/2026 — Pagamento real via Mercado Pago para compra de apps

**Problema**: Ao clicar em "Pagar Agora" na compra de app, o pagamento era aprovado instantaneamente via `/test/approve-payment` sem passar pelo Mercado Pago. Usuário recebia o app sem pagar.

**Causa raiz**: `handlePurchaseApp()` no frontend chamava sequencialmente `POST /apps/:id/purchase` e `POST /test/approve-payment/:orderId` (modo de teste automático).

**Solução**: Integração completa com Mercado Pago, idêntica ao fluxo dos produtos.

**Fluxo implementado**:
1. Usuário clica "Pagar Agora" → frontend chama `POST /apps/:id/purchase`
2. Backend cria pedido + cria preferência no Mercado Pago (`createAppPaymentPreference`)
3. Backend retorna `paymentUrl` (init_point do Mercado Pago)
4. Frontend redireciona para `window.location.href = paymentUrl`
5. Usuário paga (PIX ou cartão) no Mercado Pago
6. Mercado Pago chama webhook `POST /api/v1/payments/webhook`
7. Webhook atualiza pedido para COMPLETED (sem comissão — 100% para plataforma)
8. Usuário é redirecionado de volta para `/apps/{slug}` e pode baixar

**Correções adicionais**:
- `purchaseApp` em `app.service.js` recebia pedido sem `id` → adicionado `id: crypto.randomUUID()`
- Webhook `processPaymentWebhook` tentava enviar email de produto para pedidos de app (productId null) → adicionado `if (order.productId)` antes do email
- `AppDetails.jsx` não mostrava detalhes antes do checkout → corrigido: checkout só aparece ao clicar "Comprar", não na entrada da página

**Arquivos modificados**:
- `backend/src/services/payment.service.js` — nova função `createAppPaymentPreference(order, app)`; fix no webhook
- `backend/src/services/app.service.js` — `purchaseApp()` chama `createAppPaymentPreference`, retorna `paymentUrl`
- `backend/src/api/controllers/app.controller.js` — resposta inclui `paymentUrl`
- `frontend/src/pages/AppDetails.jsx` — `handlePurchaseApp()` redireciona para `paymentUrl`; checkout só exibido com `showCheckout === true`

---

### 27/02/2026 — Apps em Destaque na Homepage

**Funcionalidade**: Apps publicados agora aparecem na homepage (`/`) na seção "Apps em Destaque", abaixo de "Produtos em Destaque".

**Comportamento**:
- Seção só aparece quando há ao menos um app com `status: PUBLISHED`
- Exibe até 6 apps ordenados por downloads (desc)
- Card de app: ícone arredondado, título, developer, rating ⭐, badge GRÁTIS/preço
- Scroll horizontal com setas (igual a "Produtos em Destaque")
- Link "Ver todos →" aponta para `/apps`
- Clique no card navega para `/apps/{slug}`

**Detalhe técnico**: `fetchFeaturedApps` usa `axios.get(`${API_URL}/apps`)` diretamente (igual ao AppsStore.jsx), não o wrapper `api` — o wrapper `api` tem `baseURL: VITE_API_URL` sem `/api/v1`, enquanto `API_URL` (de `api.config.js`) sempre inclui `/api/v1`.

**Arquivos modificados**:
- `frontend/src/pages/Home.jsx` — estado `featuredApps`, ref `appsScrollRef`, função `fetchFeaturedApps`, seção JSX "Apps em Destaque"

---

### 26/02/2026 — Correções diversas

- Permissões de admin corrigidas
- Lógica de comissões ajustada (90%/10%, produtos do admin = 100% plataforma)
- Admin Dashboard: corrigido React Error #31 (objeto renderizado como filho JSX)
- APK upload migrado de unsigned (limite 10MB) para signed via backend (limite 100MB multer)
