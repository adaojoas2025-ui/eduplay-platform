# 🚀 Informações de Deploy - EduplayJA

## ✅ Status Atual: ONLINE E FUNCIONANDO

**Data da última atualização**: 14/01/2026

---

## 🌐 URLs de Produção

### Frontend (Render.com - Static Site)
- **URL Principal**: https://eduplay-frontend.onrender.com
- **Home**: https://eduplay-frontend.onrender.com
- **Marketplace**: https://eduplay-frontend.onrender.com/marketplace
- **Login**: https://eduplay-frontend.onrender.com/login
- **Registro**: https://eduplay-frontend.onrender.com/register
- **Apps**: https://eduplay-frontend.onrender.com/apps

### Backend (Render.com - Web Service)
- **API Base**: https://eduplay-backend-yw7z.onrender.com/api/v1
- **Health Check**: https://eduplay-backend-yw7z.onrender.com/api/v1/health
- **Order Bumps**: https://eduplay-backend-yw7z.onrender.com/api/v1/order-bumps

### Database
- **Tipo**: PostgreSQL
- **Hospedagem**: Render.com
- **Status**: ✅ Conectado

---

## 📋 Configuração do Deploy

### Frontend (Static Site)

**Serviço**: `eduplay-frontend`
**Tipo**: Static Site
**Configuração**:
```yaml
rootDir: frontend
buildCommand: npm install && npm run build
staticPublishPath: ./dist
branch: main
auto-deploy: On Commit
```

**Variáveis de Ambiente**:
- `VITE_API_URL`: https://eduplay-backend-yw7z.onrender.com/api/v1
- `VITE_CLOUDINARY_CLOUD_NAME`: dexlzykqm
- `VITE_CLOUDINARY_UPLOAD_PRESET`: eduplay_apps
- `VITE_CLOUDINARY_RAW_UPLOAD_PRESET`: eduplay_raw_files

### Backend (Web Service)

**Serviço**: `eduplay-backend`
**Tipo**: Web Service (Node.js)
**Configuração**:
```yaml
rootDir: backend
buildCommand: npm install && npx prisma generate && npx prisma migrate deploy
startCommand: npm start
branch: main
auto-deploy: On Commit
```

**Variáveis de Ambiente** (configuradas no dashboard):
- `NODE_ENV`: production
- `DATABASE_URL`: [PostgreSQL connection string]
- `JWT_SECRET`: [secret]
- `JWT_REFRESH_SECRET`: [secret]
- `SESSION_SECRET`: [secret]
- `FRONTEND_URL`: https://eduplay-frontend.onrender.com
- `GOOGLE_CLIENT_ID`: [OAuth credentials]
- `GOOGLE_CLIENT_SECRET`: [OAuth credentials]
- `GOOGLE_CALLBACK_URL`: [callback URL]

---

## 🔄 Pipeline de Deploy

### Fluxo Automático (GitHub → Render)

1. **Desenvolvedor faz push para branch `main`**
2. **GitHub notifica Render via webhook**
3. **Render inicia build automático**:
   - **Frontend**:
     - Clona repositório
     - Entra na pasta `frontend/`
     - Executa `npm install && npm run build`
     - Publica pasta `dist/`
   - **Backend**:
     - Clona repositório
     - Entra na pasta `backend/`
     - Executa `npm install`
     - Gera Prisma Client
     - Aplica migrations do banco
     - Inicia servidor com `npm start`
4. **Deploy completo** (2-5 minutos)

---

## ✅ Testes de Funcionalidade

### Backend
- [x] Health check respondendo
- [x] Autenticação funcionando
- [x] Registro de usuários
- [x] CORS configurado
- [x] Prisma conectado ao PostgreSQL
- [x] Order Bump API funcionando

### Frontend
- [x] Build sem erros
- [x] Rotas funcionando (SPA)
- [x] Conexão com backend
- [x] Variáveis de ambiente corretas
- [x] Cloudinary configurado
- [x] Assets carregando

---

## 📝 Histórico de Deploy

### 14/01/2026
- ✅ Removidas todas referências ao Vercel
- ✅ Frontend migrado 100% para Render
- ✅ Configuração de `rootDir` corrigida
- ✅ Tipo de serviço corrigido (static)
- ✅ Variáveis Cloudinary adicionadas
- ✅ Correções de Prisma (singular → plural)
- ✅ UUID generation implementado
- ✅ Order Bump backend implementado

---

## 🔧 Manutenção

### Como fazer deploy manual:
1. Acesse https://dashboard.render.com
2. Selecione o serviço (frontend ou backend)
3. Clique em **"Manual Deploy"**
4. Escolha a branch `main`
5. Aguarde o build completar

### Como ver logs:
1. Acesse o dashboard do Render
2. Selecione o serviço
3. Clique em **"Logs"** no menu lateral
4. Logs em tempo real aparecerão

### Como adicionar variáveis de ambiente:
1. Acesse o serviço no dashboard
2. Vá em **"Environment"** no menu lateral
3. Adicione a variável
4. Salve e faça redeploy

---

## ⚠️ Importante

- **Plano Free do Render**: Serviços ficam inativos após 15 minutos de inatividade e demoram ~30 segundos para "acordar" no primeiro acesso
- **Build time**: Frontend ~2min, Backend ~3-4min
- **Database**: Backup automático não incluído no plano free
- **SSL**: Certificado HTTPS automático via Render

---

## 📞 Suporte

Em caso de problemas:
1. Verifique logs no dashboard do Render
2. Confirme que todas variáveis de ambiente estão configuradas
3. Teste localmente antes de fazer deploy
4. Verifique status do Render: https://status.render.com

---

**Todas as configurações estão funcionando e testadas! ✅**
