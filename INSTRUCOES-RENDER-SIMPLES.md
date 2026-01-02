# 🚀 Como Adicionar RESEND_API_KEY no Render (3 CLIQUES)

## ✅ API Key Já Copiada!
```
rnd_KEeok6oD7nWFmLejFY1dtHgbISus
```

## 📝 Passo a Passo (3 cliques):

### 1️⃣ Abrir Render
- URL: https://dashboard.render.com/web/srv-d5a5badactks73f4mcq0/env
- **JÁ DEVE ESTAR ABERTO!**

### 2️⃣ Adicionar Variável
1. Clique no botão **"Add Environment Variable"** (azul, canto superior direito)

### 3️⃣ Preencher Dados
- **Key**: `RESEND_API_KEY`
- **Value**: Pressione **CTRL+V** (API Key já está copiada!)

### 4️⃣ Salvar
- Clique em **"Save Changes"** (botão azul)

---

## ⏳ O que vai acontecer:

1. Render faz **deploy automático** (2-3 minutos)
2. Backend detecta `RESEND_API_KEY`
3. Sistema usa **Resend** em vez de SMTP
4. Emails chegam em **< 1 segundo**! 🎉

---

## 🔍 Como saber se funcionou:

Após o deploy terminar, você verá nos logs:
```
✅ Using Resend for email service (PROFESSIONAL)
```

Se ver isso, **EMAILS FUNCIONANDO!** 📧

---

## ❓ Problemas?

- **Não vê o botão "Add Environment Variable"?**
  → Faça login no Render primeiro

- **API Key não cola?**
  → Copie manualmente: `rnd_KEeok6oD7nWFmLejFY1dtHgbISus`

- **Deploy não inicia?**
  → Clique em "Manual Deploy" → "Deploy latest commit"

---

**É SÓ ISSO! 3 cliques e pronto! 🚀**
