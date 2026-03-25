# Sistema de Email - EducaplayJA

## Visão Geral

O sistema usa três provedores em cadeia de fallback: **Resend** (primário), SendGrid e Gmail SMTP via Nodemailer.

---

## Cadeia de Fallback

```
Resend → (falha) → SendGrid → (falha) → Gmail SMTP (Nodemailer)
```

---

## Configuração

### Variáveis de Ambiente (Render)

| Variável | Valor |
|----------|-------|
| `RESEND_API_KEY` | `re_gEGhi8vd_ByoWwVqhUUQc1Y8i7bB7WScr` (conta `ja.eduplay@gmail.com`) |
| `RESEND_FROM` | `EducaplayJA <noreply@educaplayja.com.br>` |
| `SENDGRID_API_KEY` | Chave SendGrid (plano free: 100 emails/dia) |
| `EMAIL_USER` | `ja.eduplay@gmail.com` |
| `EMAIL_PASS` | App Password do Gmail (16 chars) |

### Arquivos

- `backend/src/config/email.js` — inicialização dos clientes (Resend, SendGrid, Nodemailer)
- `backend/src/services/email.service.js` — templates e funções de envio

---

## Resend (Primário)

- **Conta**: `ja.eduplay@gmail.com` em resend.com
- **Plano**: Free (3.000 emails/mês, 100/dia)
- **FROM**: `noreply@educaplayja.com.br`
- **Domínio**: `educaplayja.com.br` — **Partially Verified** (DKIM ✅, SPF ✅, DMARC ✅)
- **Região**: São Paulo (sa-east-1)

### DNS do domínio (Cloudflare)

| Tipo | Nome | Conteúdo |
|------|------|----------|
| TXT | `resend._domainkey` | DKIM value (verificado) |
| MX | `send` | `feedback-smtp.sa-east-1.amazonses.com` (prioridade 10) |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:ja.eduplay@gmail.com` |

> **Status "Partially Verified"**: DKIM e SPF verificados — suficiente para envio. O registro MX para recebimento (`inbound-smtp`) não foi configurado (desnecessário).

### Se o Resend parar de funcionar

1. Verificar em resend.com → Logs se há erros de entrega
2. Verificar se o domínio continua verificado em resend.com → Domains
3. Se a chave expirou: gerar nova em resend.com → API Keys (conta `ja.eduplay@gmail.com`)
4. Atualizar `RESEND_API_KEY` no Render

---

## SendGrid (Fallback 2)

- **Trial**: expirou em 02/03/2026 → plano free (100 emails/dia)
- **FROM verificado**: `ja.eduplay@gmail.com` (Single Sender Identity)
- **Limitação**: emails chegam com tag "via sendgrid.net" → podem ir para spam
- **Erro "Maximum credits exceeded"**: limite diário atingido — aguardar reset meia-noite UTC

---

## Gmail SMTP / Nodemailer (Fallback 3)

- **Conta**: `ja.eduplay@gmail.com`
- **Autenticação**: App Password (não a senha normal)
- **2FA**: ativado via número (61) 99627-2214 — obrigatório para App Password funcionar
- **Gerar novo App Password**: myaccount.google.com/apppasswords

### Erro 535 5.7.8

App Password rejeitado. Causas:
- App Password gerado em conta errada
- 2FA não está ativado na conta

---

## Domínio e DNS (Cloudflare)

O domínio `educaplayja.com.br` foi registrado em registro.br e migrado para o Cloudflare em 25/03/2026.

- **Nameservers**: `gracie.ns.cloudflare.com` e `konnor.ns.cloudflare.com`
- **Frontend**: CNAME `@` e `www` → `eduplay-frontend.onrender.com` (Proxied)
- **Email**: registros TXT/MX para Resend (DNS only)

---

## Regras Importantes

| Regra | Detalhe |
|-------|---------|
| FROM deve ser de domínio verificado | Resend exige domínio verificado para enviar para qualquer destinatário |
| FROM ≠ TO no Gmail | Gmail descarta silenciosamente emails onde remetente = destinatário via serviço terceiro |
| Domínio novo → spam | Primeiros dias/semanas com novo domínio, emails podem ir para spam. DMARC ajuda a construir reputação. |

---

## Emails Enviados

| Função | Quando |
|--------|--------|
| `sendGuestPurchaseCredentials(user, tempPassword)` | Novo usuário compra via guest checkout |
| `sendLoginReminderEmail(user)` | Usuário existente compra via guest checkout |
| `sendProductAccessEmail(buyer, product, order)` | Pagamento confirmado (webhook MP) — botão "Meus Cursos" → `/#/my-products` |
| `sendPasswordResetEmail(user, token)` | Usuário clica "Esqueci minha senha" |
| `sendWelcomeEmail(user)` | Novo cadastro |
| `sendNewSaleNotification(order)` | Nova venda para o produtor |
| `sendProductApprovedEmail(product, producer)` | Produto aprovado pelo admin |
| `sendProductRejectedEmail(product, producer, reason)` | Produto rejeitado pelo admin |
| `sendProductPendingApprovalEmail(adminEmail, data)` | Produto enviado para aprovação |
| `sendCommissionPaidNotification(commission)` | Comissão paga ao produtor |

---

## Testar Envio

```bash
# Reenviar email de acesso a um pedido (admin)
curl -X POST https://eduplay-backend-yw7z.onrender.com/api/v1/orders/{orderId}/resend-email \
  -H "Authorization: Bearer {adminToken}"
```
