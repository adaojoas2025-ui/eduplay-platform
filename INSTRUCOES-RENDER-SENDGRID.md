# 🚀 Como Adicionar SENDGRID_API_KEY no Render

## ✅ API Key SendGrid:
```
(use a API Key que você recebeu do SendGrid)
```

## 📝 Passo a Passo:

### 1️⃣ Abrir Configurações do Render
- URL: https://dashboard.render.com/web/srv-d5a5badactks73f4mcq0/env

### 2️⃣ Adicionar Variável
1. Clique no botão **"Add Environment Variable"**

### 3️⃣ Preencher Dados
- **Key**: `SENDGRID_API_KEY`
- **Value**: (cole a API Key do SendGrid aqui)

### 4️⃣ Salvar
- Clique em **"Save Changes"** (botão azul)
- Render fará deploy automático (2-3 minutos)

---

## ⚠️ IMPORTANTE ANTES DE TESTAR:

Você precisa **verificar o sender no SendGrid** primeiro!

Siga as instruções no arquivo: `INSTRUCOES-SENDGRID.md`

**Resumo:**
1. Acesse: https://app.sendgrid.com/settings/sender_auth/senders
2. Clique em "Create New Sender"
3. Preencha com o email `ja.eduplay@gmail.com`
4. Verifique o email que o SendGrid enviar
5. Clique no link de verificação

---

## 🔍 Como saber se funcionou:

Após o deploy terminar e o sender verificado, você verá nos logs do Render:

```
✅ Using SendGrid for email service (API-based)
📤 Sending email via SendGrid...
✅ Email sent successfully via SendGrid
```

---

## 🧪 Como Testar:

Crie um produto de teste na produção:

```bash
# 1. Login como produtor
curl -X POST "https://eduplay-backend-yw7z.onrender.com/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"adao1980aguiar@gmail.com","password":"Senha123@"}'

# 2. Criar produto (use o token do login)
curl -X POST "https://eduplay-backend-yw7z.onrender.com/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{"title":"Teste SendGrid Produção","description":"Teste","price":50,"category":"CURSO","status":"PENDING_APPROVAL"}'
```

Se tudo estiver certo:
- O email chegará em `ja.eduplay@gmail.com`
- Com remetente: **EDUPLAY <ja.eduplay@gmail.com>**
- Em menos de 1 segundo! 🎉

---

## 📋 Checklist:

- [ ] Adicionar `SENDGRID_API_KEY` no Render
- [ ] Aguardar deploy (2-3 min)
- [ ] Verificar sender `ja.eduplay@gmail.com` no SendGrid
- [ ] Criar produto de teste
- [ ] Verificar email em ja.eduplay@gmail.com

---

**🎯 Por que SendGrid funciona e SMTP não:**

- SMTP usa portas 587 e 465 → **Bloqueadas pelo Render**
- SendGrid usa API HTTP (porta 443) → **Funciona no Render!**
