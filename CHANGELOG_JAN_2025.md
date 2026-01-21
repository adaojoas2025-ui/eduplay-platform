# EDUPLAY - Changelog Janeiro 2025

## Resumo das Alterações (16-21 Janeiro 2025)

Este documento detalha todas as correções, melhorias e implementações realizadas na plataforma EduplayJA durante o período de deploy e estabilização em produção.

---

## 📧 Sistema de Email (Resolvido)

### Problema Inicial
- Emails de notificação não estavam sendo enviados
- SendGrid apresentava rate limiting para contas Gmail em trial

### Soluções Implementadas

#### 1. Configuração SendGrid (17 Jan)
- Adicionado `SENDGRID_API_KEY` nas variáveis de ambiente do Render
- Configurado sender verificado

#### 2. Migração para Resend (19 Jan)
- Instalado pacote `resend`
- Configurado Resend como serviço primário
- SendGrid mantido como fallback

#### 3. Migração para Brevo (21 Jan) - ATUAL
- Instalado pacote `@getbrevo/brevo`
- Brevo configurado como serviço **primário**
- Resend e SendGrid mantidos como fallback
- Arquivo modificado: `backend/src/config/email.js`

**Hierarquia de Email:**
1. Brevo (primário) - `BREVO_API_KEY`
2. Resend (fallback) - `RESEND_API_KEY`
3. SendGrid (fallback) - `SENDGRID_API_KEY`

#### 4. Email de Aprovação de Produto (19 Jan)
- Implementado envio de email ao produtor quando produto é aprovado
- Arquivo modificado: `backend/src/controllers/adminController.js`
- Adicionada chamada para `emailService.sendProductApprovedEmail()`

### Variáveis de Ambiente Necessárias
```env
BREVO_API_KEY=xsmtpsib-...
EMAIL_FROM_ADDRESS=ja.eduplay@gmail.com
```

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
│  URL: https://eduplay-frontend.vercel.app               │
├─────────────────────────────────────────────────────────┤
│  Backend: Web Service                                    │
│  URL: https://eduplay-platform.onrender.com             │
│  Build: npm install && npm run db:generate              │
│  Start: npm run start:migrate                            │
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
JWT_EXPIRES_IN=7d

# Email (Brevo - NOVO)
BREVO_API_KEY=xsmtpsib-...
EMAIL_FROM_ADDRESS=ja.eduplay@gmail.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=dexlzykqm
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Mercado Pago (opcional)
MP_ACCESS_TOKEN=...
MP_PUBLIC_KEY=...

# App
NODE_ENV=production
BACKEND_URL=https://eduplay-platform.onrender.com
FRONTEND_URL=https://eduplay-frontend.vercel.app
```

---

## 📋 Arquivos Modificados (Lista Completa)

### Backend
| Arquivo | Descrição |
|---------|-----------|
| `src/config/email.js` | Suporte Brevo, Resend, SendGrid |
| `src/controllers/adminController.js` | Email de aprovação ao produtor |
| `src/controllers/upload.controller.js` | Upload com fallback para servidor local |
| `src/api/routes/upload.routes.js` | Rotas de upload |
| `prisma/schema.prisma` | Correções de relações |
| `package.json` | Adicionado @getbrevo/brevo, resend |

### Frontend
| Arquivo | Descrição |
|---------|-----------|
| `src/utils/uploadToCloudinary.js` | Upload direto para Cloudinary |
| `.env.production` | URLs e configs de produção |

---

## ✅ Status Final

| Funcionalidade | Status |
|----------------|--------|
| Upload de Imagens | ✅ Funcionando |
| Envio de Emails | ✅ Funcionando (Brevo) |
| Banco de Dados | ✅ Funcionando |
| Autenticação | ✅ Funcionando |
| Aprovação de Produtos | ✅ Funcionando |
| CORS | ✅ Configurado |
| Deploy Backend | ✅ Render |
| Deploy Frontend | ✅ Vercel |

---

## 🔧 Próximos Passos Recomendados

1. **Monitoramento**: Configurar logs e alertas no Render
2. **Backup**: Configurar backup automático do PostgreSQL
3. **CDN**: Considerar uso de CDN para assets estáticos
4. **SSL**: Verificar certificados SSL (já incluídos no Render)
5. **Rate Limiting**: Revisar configurações de rate limit em produção

---

## 📝 Notas Importantes

### Cloudinary
- Preset `eduplay_apps` deve estar configurado como **unsigned**
- Upload de APKs (arquivos grandes) salva no servidor local em `/public/uploads/apks`

### Email
- Brevo tem limite de 300 emails/dia no plano gratuito
- Verificar domínio de envio para melhor deliverability

### Render
- Plano gratuito pode ter "cold starts" após inatividade
- Considerar upgrade para plano pago se necessário

---

**Última Atualização:** 21 de Janeiro de 2025
**Autor:** Claude Code Assistant
