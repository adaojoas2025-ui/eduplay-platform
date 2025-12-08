# ⚡ EDUPLAY - Setup Rápido

## ✅ Checklist de Configuração

### 1. PostgreSQL
- [ ] Baixar PostgreSQL: https://www.postgresql.org/download/windows/
- [ ] Instalar (anotar a senha!)
- [ ] Criar banco de dados `eduplay`
- [ ] Atualizar `.env` com DATABASE_URL

**Senha PostgreSQL que você definiu:** _______________

**DATABASE_URL para .env:**
```
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/eduplay?schema=public"
```

---

### 2. Instalar Dependências do Backend

```bash
cd backend
npm install
```

---

### 3. Configurar Prisma

```bash
npx prisma generate
npx prisma migrate dev --name init
```

---

### 4. Iniciar o Servidor Backend

```bash
npm run dev
```

Deve aparecer:
```
✅ Database connected successfully
🚀 EDUPLAY API RUNNING!
Port: 3000
```

---

## 📋 Status das Configurações

| Serviço | Status | Valor |
|---------|--------|-------|
| Node.js | ✅ | v22.19.0 |
| PostgreSQL | ⏳ | Precisa instalar |
| JWT | ✅ | Configurado |
| Mercado Pago | ✅ | Configurado |
| Cloudinary | ✅ | dexlzykqm |
| Email | ⏳ | Opcional (configure depois) |

---

## 🎯 Ordem de Execução

### 1️⃣ Instalar PostgreSQL
Siga: `SETUP_POSTGRESQL.md`

### 2️⃣ Configurar DATABASE_URL
Edite `backend/.env` linha 6:
```
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/eduplay?schema=public"
```

### 3️⃣ Instalar Dependências
```bash
cd backend
npm install
```

### 4️⃣ Gerar Prisma Client
```bash
npx prisma generate
```

### 5️⃣ Executar Migrations
```bash
npx prisma migrate dev --name init
```

### 6️⃣ Iniciar Servidor
```bash
npm run dev
```

### 7️⃣ Frontend (Depois)
```bash
cd frontend
npm install
npm run dev
```

---

## 🆘 Comandos de Ajuda

### Ver se PostgreSQL está rodando:
```bash
psql --version
```

### Ver bancos de dados:
```bash
psql -U postgres -l
```

### Resetar banco (CUIDADO!):
```bash
cd backend
npx prisma migrate reset
```

### Ver tabelas com Prisma Studio:
```bash
npx prisma studio
```

---

## 📞 Próximos Passos

Após o backend estar rodando:

1. ✅ Testar endpoints com Postman/Insomnia
2. ✅ Criar primeiro usuário admin
3. ✅ Configurar frontend
4. ✅ Testar fluxo completo

---

## 🎓 Arquivos de Referência

- `SETUP_POSTGRESQL.md` - Instalação detalhada do PostgreSQL
- `README_PROFISSIONAL.md` - Documentação completa do projeto
- `PROJECT_STATUS.md` - Status de implementação
- `IMPLEMENTATION_GUIDE.md` - Guia de desenvolvimento

---

**Está com tudo configurado? Execute:**

```bash
cd backend
npm run dev
```

**Sucesso!** 🎉
