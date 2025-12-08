# 🐘 PostgreSQL - Guia Completo de Instalação

## 📥 Passo 1: Download do PostgreSQL

1. Acesse: https://www.postgresql.org/download/windows/
2. Clique em **"Download the installer"**
3. Escolha a versão mais recente (ex: PostgreSQL 16.x)
4. Download: **Windows x86-64**

## 🔧 Passo 2: Instalação

1. **Execute o instalador** baixado
2. Clique em **Next**
3. **Installation Directory**: Deixe o padrão → Next
4. **Select Components**: Marque todos → Next
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4
   - ✅ Stack Builder
   - ✅ Command Line Tools
5. **Data Directory**: Deixe o padrão → Next
6. **Password**:
   - Digite uma senha (ex: `postgres123`)
   - ⚠️ **IMPORTANTE: Anote essa senha!**
   - Confirme a senha
7. **Port**: Deixe `5432` → Next
8. **Locale**: Deixe o padrão → Next
9. Clique em **Next** → **Install**
10. Aguarde a instalação...
11. **Finish** (desmarque Stack Builder)

## ✅ Passo 3: Verificar Instalação

Abra o **Prompt de Comando** (CMD) e digite:

```bash
psql --version
```

Deve aparecer algo como:
```
psql (PostgreSQL) 16.x
```

## 🗄️ Passo 4: Criar o Banco de Dados

### Opção A: Usando pgAdmin (Interface Gráfica)

1. Abra o **pgAdmin 4** (foi instalado junto)
2. Clique em **Servers** → **PostgreSQL 16**
3. Digite a **senha** que você criou
4. Clique com botão direito em **Databases** → **Create** → **Database**
5. **Database name**: `eduplay`
6. Clique em **Save**

### Opção B: Usando Linha de Comando

1. Abra o **CMD** como Administrador
2. Digite:

```bash
psql -U postgres
```

3. Digite a senha que você criou
4. No prompt do PostgreSQL, digite:

```sql
CREATE DATABASE eduplay;
```

5. Verifique se foi criado:

```sql
\l
```

6. Saia do PostgreSQL:

```sql
\q
```

## 🔐 Passo 5: Configurar o .env

Agora atualize o arquivo `backend/.env` com suas credenciais:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/eduplay?schema=public"
```

**Exemplo:**
Se sua senha for `postgres123`:
```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/eduplay?schema=public"
```

## 🧪 Passo 6: Testar Conexão

1. Abra o terminal na pasta `backend`:

```bash
cd backend
```

2. Instale as dependências (se ainda não instalou):

```bash
npm install
```

3. Gere o Prisma Client:

```bash
npx prisma generate
```

4. Execute as migrations:

```bash
npx prisma migrate dev --name init
```

Se tudo der certo, você verá:
```
✅ Database connected successfully
✅ Migration applied successfully
```

## 🎯 Comandos Úteis do PostgreSQL

### Ver bancos de dados:
```bash
psql -U postgres -c "\l"
```

### Conectar a um banco:
```bash
psql -U postgres -d eduplay
```

### Ver tabelas:
```sql
\dt
```

### Sair do psql:
```sql
\q
```

## 🔧 Prisma Studio (Visualizar Dados)

Abrir interface visual do banco:

```bash
cd backend
npx prisma studio
```

Abre em: http://localhost:5555

## ⚠️ Problemas Comuns

### Erro: "psql not found"

**Solução:** Adicionar PostgreSQL ao PATH:

1. Copie o caminho: `C:\Program Files\PostgreSQL\16\bin`
2. Painel de Controle → Sistema → Variáveis de Ambiente
3. Em "Path" → Editar → Novo
4. Cole o caminho
5. OK → Reinicie o terminal

### Erro: "password authentication failed"

**Solução:** Senha incorreta no .env
- Verifique a senha que você usou na instalação
- Atualize no `DATABASE_URL`

### Erro: "database does not exist"

**Solução:** Criar o banco de dados:
```bash
psql -U postgres -c "CREATE DATABASE eduplay;"
```

## 📊 Estrutura Final

Após tudo configurado:

```
PostgreSQL Server (localhost:5432)
└── Database: eduplay
    └── Tabelas serão criadas pelo Prisma
```

## 🚀 Próximos Passos

Depois de configurar o PostgreSQL:

1. ✅ Configurar DATABASE_URL no .env
2. ✅ Executar `npm install` no backend
3. ✅ Executar `npx prisma generate`
4. ✅ Executar `npx prisma migrate dev`
5. ✅ Testar servidor: `npm run dev`

---

**Precisa de ajuda?** Consulte a documentação oficial:
- PostgreSQL: https://www.postgresql.org/docs/
- Prisma: https://www.prisma.io/docs/
