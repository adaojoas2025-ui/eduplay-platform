# Deploy - EducaplayJA

## Visão Geral

O projeto usa o Render para hospedar backend e frontend, com auto-deploy via GitHub.

---

## Serviços no Render

| Serviço | URL | ID | Tipo |
|---------|-----|----|------|
| Backend | `eduplay-backend-yw7z.onrender.com` | `srv-d5a5badactks73f4mcq0` | Web Service |
| Frontend | `eduplay-frontend.onrender.com` | `srv-d5br6v6mcj7s73ccahp0` | Static Site |

- **Auto-deploy**: qualquer push para `main` no GitHub aciona redeploy automático
- **Frontend** fica em "Ungrouped Services" — Static Sites não podem ser movidos para projetos no Render
- **Domínio customizado**: `educaplayja.com.br` e `www.educaplayja.com.br` apontam para o frontend (verificado em 25/03/2026)
- **`FRONTEND_URL`** no Render: `https://educaplayja.com.br`

---

## Comandos de Build e Start

**Build** (`node scripts/build.js`):
```
npx prisma generate
npx prisma db push
```

**Start** (`node scripts/start-with-migrate.js`):
```
npx prisma generate
node server.js
```

> **CRÍTICO**: NÃO rodar `prisma migrate deploy` nem `prisma db push` no startup.
> Durante zero-downtime deploy, a instância antiga ainda está rodando e segura o lock do banco.
> O novo container fica preso esperando o lock liberar → timeout → deploy falha.

---

## Render API

**API Key**: `rnd_0MWaxKDUd9Cnxhp4JqClOpiFZIw4`

**Deploy hooks** (acionar redeploy manualmente via POST):
- Backend: `https://api.render.com/deploy/srv-d5a5badactks73f4mcq0?key=XL9sbi_hvMY`
- Frontend: `https://api.render.com/deploy/srv-d5br6v6mcj7s73ccahp0?key=QLnpomz6DMo`

---

## Atualizar Variáveis de Ambiente

### CRÍTICO: PUT /env-vars SUBSTITUI TUDO

O endpoint `PUT /v1/services/{id}/env-vars` **apaga todas as env vars existentes** e coloca apenas as enviadas. Nunca usar para atualizar variáveis individuais sem antes buscar a lista completa.

**Processo correto para atualizar uma variável:**

```bash
# 1. Buscar todas as variáveis atuais
curl -s "https://api.render.com/v1/services/srv-d5a5badactks73f4mcq0/env-vars" \
  -H "Authorization: Bearer rnd_0MWaxKDUd9Cnxhp4JqClOpiFZIw4" \
  -o envvars.json

# 2. Modificar o JSON com o novo valor
# 3. Enviar a lista completa atualizada
curl -X PUT "https://api.render.com/v1/services/srv-d5a5badactks73f4mcq0/env-vars" \
  -H "Authorization: Bearer rnd_0MWaxKDUd9Cnxhp4JqClOpiFZIw4" \
  -H "Content-Type: application/json" \
  -d @envvars.json
```

---

## Variáveis de Ambiente Principais

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | PostgreSQL Render (banco `eduplay_db_48aw`) |
| `JWT_SECRET` | Chave JWT (mín. 32 chars) |
| `JWT_REFRESH_SECRET` | Chave refresh JWT (mín. 32 chars) |
| `MP_ACCESS_TOKEN` | Token produção Mercado Pago (`APP_USR-...`) |
| `MP_PUBLIC_KEY` | Public key produção Mercado Pago |
| `GOOGLE_CLIENT_ID` | `281135818687-n0g00u9s17miid792l4ogrprc2orsrti.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Secret do OAuth Google |
| `GOOGLE_CALLBACK_URL` | `https://eduplay-backend-yw7z.onrender.com/api/v1/auth/google/callback` |
| `ASAAS_API_KEY` | Token produção Asaas (PIX transfers) |
| `RESEND_API_KEY` | Chave Resend (primário) — conta `ja.eduplay@gmail.com` |
| `RESEND_FROM` | `EducaplayJA <noreply@educaplayja.com.br>` |
| `SENDGRID_API_KEY` | Chave SendGrid (fallback, 100 emails/dia plano free) |
| `EMAIL_USER` | `ja.eduplay@gmail.com` |
| `EMAIL_PASS` | App Password Gmail (16 chars) |
| `FRONTEND_URL` | `https://educaplayja.com.br` |
| `CLOUDINARY_API_KEY` | Chave Cloudinary para upload de imagens |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave Supabase para upload de APKs |

> **Backup**: `render-env-restore.json` na raiz do projeto contém todas as variáveis.
> **Atenção**: esse arquivo tem `GOOGLE_CLIENT_ID` = `763826185307-...` (dev local) — não usar em produção.

---

## Prisma — Novas Migrations

Ao adicionar novos campos no schema:

1. Criar migration SQL em `backend/prisma/migrations/`
2. **Nunca** usar `prisma db push` para alterações em produção (não gera migration)
3. O build script roda `prisma db push` — OK para criar tabelas novas, não para alterar colunas com dados

---

## Admin do Banco

- **Host**: `dpg-d6omrjcr85hc739ifuvg-a.oregon-postgres.render.com`
- **Banco**: `eduplay_db_48aw`
- **Usuário admin na plataforma**: `ja.eduplay@gmail.com` / `Asa122448@` (role ADMIN)
