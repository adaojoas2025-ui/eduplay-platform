# TESTE DO SISTEMA DE APROVAÇÃO DE PRODUTOS

## IMPLEMENTAÇÃO COMPLETA

### Backend

#### 1. Constants.js
- ✅ Adicionado `PENDING_APPROVAL` e `REJECTED` ao `PRODUCT_STATUS`

#### 2. Admin Controller
- ✅ `listProductsPendingApproval()` - Lista produtos aguardando aprovação
- ✅ `approveProduct(productId, adminId)` - Aprovar produto
- ✅ `rejectProduct(productId, adminId, reason)` - Rejeitar produto

#### 3. Admin Routes
- ✅ `GET /api/v1/admin/products/pending` - Produtos aguardando aprovação
- ✅ `POST /api/v1/admin/products/:id/approve` - Aprovar produto
- ✅ `POST /api/v1/admin/products/:id/reject` - Rejeitar produto

#### 4. Product Service
- ✅ `publishProduct()` modificado para marcar como `PENDING_APPROVAL`
- ✅ `approveProduct(productId, adminId)` - Função de aprovação
- ✅ `rejectProduct(productId, adminId, reason)` - Função de rejeição

#### 5. Email Service
- ✅ `sendProductSubmittedEmail(product, producer)` - Email para admin quando produto é submetido
- ✅ `sendProductApprovedEmail(product, producer)` - Email para produtor quando aprovado
- ✅ `sendProductRejectedEmail(product, producer, reason)` - Email para produtor quando rejeitado
- ✅ Email enviado para `ja.eduplay@gmail.com` quando produto é submetido

### Frontend

#### 6. AdminProducts.jsx
- ✅ Página criada em `/frontend/src/pages/admin/AdminProducts.jsx`
- ✅ Lista produtos PENDING_APPROVAL
- ✅ Mostra: título, vendedor, preço, data de criação
- ✅ Botões "Aprovar" e "Rejeitar"
- ✅ Campo de motivo para rejeição
- ✅ Filtros: PENDING_APPROVAL, PUBLISHED, REJECTED, ALL

#### 7. App.jsx
- ✅ Link "Produtos Pendentes" adicionado no dropdown do admin
- ✅ Rota `/admin/products` adicionada

#### 8. ProductForm.jsx
- ✅ Mensagem de aprovação quando produto é publicado
- ✅ Alterado texto do select de "Publicado" para "Enviar para Aprovação"
- ✅ Mensagem informativa: "Ao publicar, o produto será enviado para aprovação do administrador"

## FLUXO DE TESTE

### Passo 1: Criar produto como vendedor
1. Logar como vendedor (teste@exemplo.com / Senha123)
2. Ir para "Vender" > "Produtos"
3. Clicar em "Novo Produto"
4. Preencher todos os campos obrigatórios
5. Adicionar pelo menos 1 arquivo
6. Selecionar status "Enviar para Aprovação"
7. Clicar em "Criar Produto"
8. Verificar mensagem: "Produto enviado para aprovação do administrador"

### Passo 2: Verificar status PENDING_APPROVAL
1. O produto deve aparecer na lista com status "Aguardando Aprovação"
2. Verificar se email foi enviado para ja.eduplay@gmail.com

### Passo 3: Aprovar produto como admin
1. Fazer logout
2. Logar como admin (ja.eduplay@gmail.com / Asa122448@)
3. Clicar no dropdown do usuário
4. Clicar em "Produtos Pendentes"
5. Verificar se o produto aparece na lista
6. Clicar em "Aprovar"
7. Confirmar aprovação
8. Produto deve desaparecer da lista de pendentes

### Passo 4: Verificar produto PUBLISHED
1. Ir para Marketplace
2. Produto deve aparecer para venda
3. Vendedor deve receber email de aprovação

### Passo 5: Testar rejeição
1. Criar outro produto como vendedor
2. Publicar (enviar para aprovação)
3. Logar como admin
4. Ir em "Produtos Pendentes"
5. Clicar em "Rejeitar"
6. Digitar motivo da rejeição
7. Confirmar rejeição
8. Vendedor deve receber email com motivo da rejeição

## ENDPOINTS DA API

```
GET    /api/v1/admin/products/pending          - Lista produtos pendentes (Admin only)
POST   /api/v1/admin/products/:id/approve      - Aprovar produto (Admin only)
POST   /api/v1/admin/products/:id/reject       - Rejeitar produto (Admin only)
```

## STATUS DOS PRODUTOS

- `DRAFT` - Rascunho (não aparece no marketplace)
- `PENDING_APPROVAL` - Aguardando aprovação do admin
- `PUBLISHED` - Aprovado e disponível no marketplace
- `REJECTED` - Rejeitado pelo admin
- `ARCHIVED` - Arquivado pelo produtor/admin

## EMAILS ENVIADOS

1. **Produto Submetido** → Admin (ja.eduplay@gmail.com)
   - Assunto: "Novo Produto para Aprovação: [título]"

2. **Produto Aprovado** → Produtor
   - Assunto: "Produto Aprovado: [título]"

3. **Produto Rejeitado** → Produtor
   - Assunto: "Produto Não Aprovado: [título]"
   - Inclui o motivo da rejeição

## ARQUIVOS MODIFICADOS

### Backend
- `backend/src/utils/constants.js`
- `backend/src/api/controllers/admin.controller.js`
- `backend/src/api/routes/admin.routes.js`
- `backend/src/services/product.service.js`
- `backend/src/services/email.service.js`

### Frontend
- `frontend/src/App.jsx`
- `frontend/src/pages/admin/AdminProducts.jsx` (novo)
- `frontend/src/pages/ProductForm.jsx`
