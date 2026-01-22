# EDUPLAY - Changelog Janeiro 2025

## Resumo das Alterações (16-22 Janeiro 2025)

Este documento detalha todas as correções, melhorias e implementações realizadas na plataforma EduplayJA durante o período de deploy e estabilização em produção.

---

## 📧 Sistema de Email (Resolvido - 22 Jan)

### Problema Inicial
- Emails de notificação não estavam sendo enviados
- SendGrid apresentava rate limiting para contas Gmail em trial

### Histórico de Tentativas

#### 1. SendGrid (17 Jan) - Funcionava mas tinha rate limiting
- Adicionado `SENDGRID_API_KEY` nas variáveis de ambiente do Render
- Problema: Rate limiting para contas trial

#### 2. Resend (19 Jan) - Testado
- Instalado pacote `resend`
- Problema: Restrições de domínio

#### 3. Brevo SMTP (21-22 Jan) - NÃO FUNCIONA NO RENDER
- Tentativa com porta 587 (TLS) - **BLOQUEADA NO RENDER**
- Tentativa com porta 465 (SSL) - **BLOQUEADA NO RENDER**
- Conclusão: Render bloqueia todas as portas SMTP

### Solução Final (22 Jan) - SendGrid via API HTTP

**SendGrid configurado como serviço único de email.**

O SendGrid usa API HTTP (não SMTP), portanto funciona perfeitamente no Render.

**Arquivo:** `backend/src/config/email.js`

```javascript
// Use SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  useSendGrid = true;
}
```

### Variáveis de Ambiente Necessárias
```env
SENDGRID_API_KEY=SG.xxxxx...
EMAIL_FROM=EDUPLAY <ja.eduplay@gmail.com>
```

### Lição Aprendida
**Render bloqueia portas SMTP (587, 465).** Sempre usar serviços de email via API HTTP:
- SendGrid API ✅
- Resend API ✅
- Brevo API (requer chave xkeysib-, não xsmtpsib-) ✅
- Brevo SMTP ❌ (não funciona no Render)

---

## 🖼️ Upload de Imagens - Cloudinary (Resolvido)

### Problema Inicial
- Erro "Invalid Signature" ao fazer upload de imagens
- Upload via backend falhava com credenciais assinadas

### Tentativas de Solução
1. Hardcode de credenciais (não funcionou)
2. Alteração do API Secret no Cloudinary (não funcionou)
3. Upload via stream com base64 (não funcionou)

### Solução Final (19 Jan)
**Upload direto do frontend usando preset não assinado**

- Criado preset `eduplay_apps` no Cloudinary (unsigned)
- Frontend faz upload diretamente para API do Cloudinary
- Arquivo modificado: `frontend/src/utils/uploadToCloudinary.js`

```javascript
// Upload direto sem passar pelo backend
const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
const response = await fetch(url, {
  method: 'POST',
  body: formData, // FormData com file + upload_preset
});
```

### Variáveis de Ambiente (Frontend)
```env
VITE_CLOUDINARY_CLOUD_NAME=dexlzykqm
VITE_CLOUDINARY_UPLOAD_PRESET=eduplay_apps
```

---

## 🗄️ Banco de Dados - PostgreSQL (Resolvido)

### Problemas Resolvidos

#### 1. Migração Falha (16-17 Jan)
- Conflitos de migração ao fazer deploy
- Solução: Script robusto de startup que tenta migrate e fallback para generate

#### 2. Nomes de Tabelas/Relações (17 Jan)
- Corrigido `cart_items` e `combo_products`
- Ajustadas relações no Prisma schema

#### 3. Relação product-user (17 Jan)
- Renomeada relação para `producer`
- Adicionada geração de UUID para produtos

### Commits Relacionados
```
fix: Corrigir nomes de tabelas e relações Prisma
fix: Correct frontend API URL in render.yaml
fix: Fix order schema relations and add UUID generation
fix: Rename product-user relation to 'producer'
fix: Add UUID generation for product creation
```

---

## 🔗 URLs e CORS (Resolvido)

### Problema
- Frontend não conseguia conectar ao backend
- Erros de CORS em produção

### Solução
- URL correta do backend: `https://eduplay-platform.onrender.com`
- CORS configurado para aceitar Vercel e domínios locais

### Variáveis de Ambiente (Frontend)
```env
VITE_API_URL=https://eduplay-platform.onrender.com/api/v1
```

---

## 🔐 Autenticação e Admin (Resolvido)

### Implementações

#### 1. Endpoint Temporário de Upgrade (17 Jan)
- Criado `/api/v1/users/temp-upgrade/:userId`
- Permite upgrade de usuário para ADMIN/PRODUCER
- Usado para configuração inicial

#### 2. Rotas de Admin (17 Jan)
- Adicionadas rotas para aprovação de produtos
- Endpoints de teste para verificar permissões

#### 3. Google OAuth Callback URL (22 Jan)
- Corrigida URL de callback para: `https://eduplay-platform.onrender.com/api/v1/auth/google/callback`
- URL antiga estava apontando para `eduplay-backend` (não existe mais)

### Commits Relacionados
```
feat: Add temporary admin upgrade endpoint
feat: Add test endpoints for admin and product publish
fix: Allow role parameter in temp-upgrade endpoint
```

---

## 📦 Combos (Resolvido)

### Problema
- Endpoint `/combos` retornava erro com arrays vazios

### Solução (17 Jan)
- Tratamento de arrays vazios no controller
- Arquivo: `backend/src/api/controllers/combo.controller.js`

---

## 🚀 Deploy no Render

### Arquitetura Final

```
┌─────────────────────────────────────────────────────────┐
│                      RENDER.COM                          │
├─────────────────────────────────────────────────────────┤
│  Frontend: Static Site (Vercel/Render)                   │
│  URL: https://eduplay-frontend.onrender.com             │
├─────────────────────────────────────────────────────────┤
│  Backend: Web Service                                    │
│  URL: https://eduplay-platform.onrender.com             │
│  Build: npm install && npm run build                     │
│  Start: npm start                                        │
├─────────────────────────────────────────────────────────┤
│  Database: PostgreSQL                                    │
│  Plan: Free                                              │
└─────────────────────────────────────────────────────────┘
```

### Variáveis de Ambiente Backend (Render)

```env
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EXPIRES_IN=7d

# Email (SendGrid - FUNCIONA NO RENDER)
SENDGRID_API_KEY=SG.xxxxx...

# Cloudinary
CLOUDINARY_CLOUD_NAME=dexlzykqm
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://eduplay-platform.onrender.com/api/v1/auth/google/callback

# Mercado Pago
MP_ACCESS_TOKEN=...

# App
NODE_ENV=production
BACKEND_URL=https://eduplay-platform.onrender.com
FRONTEND_URL=https://eduplay-frontend.onrender.com
```

---

## 📋 Arquivos Modificados (Lista Completa)

### Backend
| Arquivo | Descrição |
|---------|-----------|
| `src/config/email.js` | Configurado SendGrid como serviço de email |
| `src/controllers/adminController.js` | Email de aprovação ao produtor |
| `src/controllers/upload.controller.js` | Upload com fallback para servidor local |
| `src/api/routes/upload.routes.js` | Rotas de upload |
| `src/app.js` | Endpoint diagnóstico `/api/v1/email-status` |
| `scripts/build.js` | Script de build simplificado |
| `prisma/schema.prisma` | Correções de relações |
| `package.json` | Dependências de email |

### Frontend
| Arquivo | Descrição |
|---------|-----------|
| `src/utils/uploadToCloudinary.js` | Upload direto para Cloudinary |
| `.env.production` | URLs e configs de produção |

---

## ✅ Status Final (22 Jan 2025)

| Funcionalidade | Status |
|----------------|--------|
| Upload de Imagens | ✅ Funcionando |
| Envio de Emails | ✅ Funcionando (SendGrid) |
| Banco de Dados | ✅ Funcionando |
| Autenticação | ✅ Funcionando |
| Google OAuth | ✅ Funcionando |
| Aprovação de Produtos | ✅ Funcionando |
| CORS | ✅ Configurado |
| Deploy Backend | ✅ Render |
| Deploy Frontend | ✅ Render |

---

## 🔧 Próximos Passos Recomendados

1. **Monitoramento**: Configurar logs e alertas no Render
2. **Backup**: Configurar backup automático do PostgreSQL
3. **CDN**: Considerar uso de CDN para assets estáticos
4. **SSL**: Verificar certificados SSL (já incluídos no Render)
5. **Rate Limiting**: Revisar configurações de rate limit em produção

---

## 📝 Notas Importantes

### Email (SendGrid)
- **Usar SendGrid API**, não SMTP (Render bloqueia portas SMTP)
- Criar API Key em: https://app.sendgrid.com/settings/api_keys
- Verificar sender identity para melhor deliverability
- Plano gratuito: 100 emails/dia

### Cloudinary
- Preset `eduplay_apps` deve estar configurado como **unsigned**
- Upload de APKs (arquivos grandes) salva no servidor local em `/public/uploads/apks`

### Render
- Plano gratuito pode ter "cold starts" após inatividade
- **IMPORTANTE**: Render bloqueia portas SMTP (587, 465) - sempre usar APIs HTTP
- Considerar upgrade para plano pago se necessário

### Endpoint de Diagnóstico
- URL: `https://eduplay-platform.onrender.com/api/v1/email-status`
- Mostra qual serviço de email está ativo e variáveis configuradas

---

**Última Atualização:** 22 de Janeiro de 2025
**Autor:** Claude Code Assistant
