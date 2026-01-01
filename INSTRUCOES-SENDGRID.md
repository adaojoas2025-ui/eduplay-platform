# 📧 Instruções: Verificar Sender no SendGrid

## ❌ Erro Atual:

O SendGrid está bloqueando o envio porque o endereço `ja.eduplay@gmail.com` ainda não foi verificado como "Sender Identity".

```
The from address does not match a verified Sender Identity.
Mail cannot be sent until this error is resolved.
```

## ✅ Solução: Verificar Single Sender

### Passo a Passo:

1. **Acesse o painel do SendGrid:**
   - URL: https://app.sendgrid.com/settings/sender_auth/senders

2. **Clique em "Create New Sender"**

3. **Preencha o formulário:**
   - **From Name:** `EDUPLAY`
   - **From Email Address:** `ja.eduplay@gmail.com`
   - **Reply To:** `ja.eduplay@gmail.com`
   - **Company Address:** (pode ser o mesmo endereço)
   - **City:** (sua cidade)
   - **State:** (seu estado)
   - **Zip Code:** (seu CEP)
   - **Country:** Brazil

4. **Clique em "Create"**

5. **Verifique o email:**
   - O SendGrid enviará um email para `ja.eduplay@gmail.com`
   - Abra o email e clique no link de verificação
   - **IMPORTANTE:** Verifique também a pasta de SPAM!

6. **Aguarde confirmação:**
   - Após clicar no link, volte ao painel do SendGrid
   - O status deve mudar para "Verified" ✅

## 🧪 Como Testar Depois:

Após verificar o sender, rode o script de teste:

```bash
cd c:/projetos/backend
node scripts/test-sendgrid.js
```

Se der certo, você verá:

```
✅ RESPOSTA DO SENDGRID:
Status Code: 202
🎉 Email enviado com sucesso via SendGrid!
```

## 📝 Notas Importantes:

- O email de verificação pode demorar alguns minutos para chegar
- Sempre verifique a pasta de SPAM
- O sender precisa ser verificado APENAS UMA VEZ
- Depois disso, todos os emails enviados pelo backend funcionarão automaticamente

## 🔗 Links Úteis:

- Painel de Senders: https://app.sendgrid.com/settings/sender_auth/senders
- Documentação: https://sendgrid.com/docs/for-developers/sending-email/sender-identity/

---

**Próximo passo:** Verificar o sender `ja.eduplay@gmail.com` no SendGrid antes de testar novamente.
