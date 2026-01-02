# 🔧 Solução: SMTP Gmail no Render (Porta 465)

## ❌ Problema Identificado:

O Render **BLOQUEIA a porta 587** (SMTP padrão do Gmail), causando timeout:

```
❌ Error sending email via SMTP: Connection timeout
code: "ETIMEDOUT"
```

## ✅ Solução: Usar Porta 465 com SSL

O Gmail também aceita conexões SMTP na **porta 465 com SSL**, que o Render **NÃO bloqueia**.

## 📋 Passo a Passo no Render:

1. Acesse: https://dashboard.render.com/web/srv-d5a5badactks73f4mcq0/env

2. Localize e **ALTERE** estas variáveis:

   **ANTES:**
   ```
   EMAIL_PORT=587
   EMAIL_SECURE=false
   ```

   **DEPOIS:**
   ```
   EMAIL_PORT=465
   EMAIL_SECURE=true
   ```

3. Clique em **"Save Changes"**

4. O Render vai fazer **redeploy automático**

5. Aguarde 2-3 minutos para o deploy terminar

## 🧪 Como Testar:

Após o deploy, crie um produto de teste:

```bash
# Login como produtor
curl -X POST "https://eduplay-backend-yw7z.onrender.com/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"adao1980aguiar@gmail.com","password":"Senha123@"}'

# Criar produto (use o token do login acima)
curl -X POST "https://eduplay-backend-yw7z.onrender.com/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{"title":"Teste Email Porta 465","description":"Teste","price":50,"category":"CURSO","status":"PENDING_APPROVAL"}'
```

## ✅ Resultado Esperado:

Você deve receber um email em **ja.eduplay@gmail.com** com o assunto:

**"🔔 Novo Produto Aguardando Aprovação: Teste Email Porta 465"**

---

## 📝 Referências:

- Gmail SMTP Settings: https://support.google.com/mail/answer/7126229
  - Porta 465: SSL/TLS
  - Porta 587: STARTTLS (bloqueada pelo Render)
