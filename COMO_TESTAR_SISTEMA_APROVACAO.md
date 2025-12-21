# COMO TESTAR O SISTEMA DE APROVAÇÃO DE PRODUTOS

## OPÇÃO 1: TESTE MANUAL (Recomendado)

### Pré-requisitos
1. Backend rodando em `http://localhost:3000`
2. Frontend rodando em `http://localhost:5173`

### Passo a Passo Completo

#### PARTE 1: CRIAR PRODUTO COMO VENDEDOR

1. **Abrir o navegador:**
   - Ir para: `http://localhost:5173`

2. **Fazer login como vendedor:**
   - Email: `teste@exemplo.com`
   - Senha: `Senha123`

3. **Ir para produtos:**
   - Clicar em "Vender" no menu superior
   - Clicar em "Produtos"
   - Clicar em "Novo Produto"

4. **Preencher o formulário:**
   - Título: "Curso de Teste - Sistema de Aprovação"
   - Descrição: "Este é um curso de teste para validar o sistema de aprovação"
   - Preço: 99.90
   - Categoria: Programação
   - Nível: Iniciante
   - Idioma: Português

5. **Adicionar arquivos (OBRIGATÓRIO):**
   - Clicar em "+ Adicionar Link de Arquivo"
   - Colar qualquer URL (ex: https://drive.google.com/teste)
   - Você pode adicionar múltiplos arquivos

6. **Publicar:**
   - Mudar Status para: "Enviar para Aprovação"
   - Clicar em "Criar Produto"
   - **Verificar mensagem:** "✅ Produto enviado para aprovação do administrador. Você receberá um email quando for aprovado."

7. **Verificar status:**
   - Voltar para "Produtos"
   - Produto deve aparecer com badge amarelo: "Aguardando Aprovação"

#### PARTE 2: APROVAR PRODUTO COMO ADMIN

1. **Fazer logout:**
   - Clicar no nome do usuário (dropdown)
   - Clicar em "Sair"

2. **Fazer login como admin:**
   - Email: `ja.eduplay@gmail.com`
   - Senha: `Asa122448@`

3. **Acessar produtos pendentes:**
   - Clicar no nome do usuário (dropdown)
   - Clicar em "📋 Produtos Pendentes"
   - **Deve aparecer o produto criado anteriormente**

4. **Revisar informações:**
   - Título: "Curso de Teste - Sistema de Aprovação"
   - Vendedor: Teste Vendedor
   - Email: teste@exemplo.com
   - Preço: R$ 99.90
   - Data de Criação
   - Arquivos: 1 arquivo(s)

5. **Aprovar o produto:**
   - Clicar no botão verde "Aprovar"
   - Confirmar na mensagem
   - **Verificar:** Produto desaparece da lista de pendentes
   - **Verificar mensagem:** "Produto aprovado com sucesso!"

#### PARTE 3: VERIFICAR PRODUTO PUBLICADO

1. **Ir para Marketplace:**
   - Clicar em "Marketplace" no menu
   - **Produto deve aparecer para venda**

2. **Verificar emails (se configurado):**
   - Email para admin: "Novo Produto para Aprovação"
   - Email para vendedor: "Produto Aprovado"

#### PARTE 4: TESTAR REJEIÇÃO

1. **Criar outro produto (como vendedor):**
   - Fazer logout
   - Login como vendedor
   - Criar novo produto
   - Enviar para aprovação

2. **Rejeitar produto (como admin):**
   - Fazer logout
   - Login como admin
   - Ir em "Produtos Pendentes"
   - Clicar em "Rejeitar"
   - **Digitar motivo:** "Conteúdo inadequado para a plataforma. Por favor, revise as diretrizes."
   - Clicar em "Confirmar Rejeição"

3. **Verificar:**
   - Produto desaparece da lista de pendentes
   - Pode ver produto rejeitado usando filtro "Rejeitados"
   - Vendedor deve receber email com motivo da rejeição

## OPÇÃO 2: TESTE AUTOMATIZADO

### Executar Script de Teste

```bash
# No terminal, ir para pasta backend
cd c:\projetos\backend

# Executar script de teste
node scripts/test-approval-flow.js
```

### O que o script testa:

1. ✅ Login de vendedor
2. ✅ Login de admin
3. ✅ Criação de produto
4. ✅ Publicação (vai para PENDING_APPROVAL)
5. ✅ Listagem de produtos pendentes
6. ✅ Aprovação de produto (vai para PUBLISHED)
7. ✅ Rejeição de produto (vai para REJECTED)

### Saída Esperada:

```
=================================================
TESTE DO SISTEMA DE APROVAÇÃO DE PRODUTOS
=================================================

1. Fazendo login como VENDEDOR...
✅ Login vendedor OK

2. Fazendo login como ADMIN...
✅ Login admin OK

3. Criando produto de teste...
✅ Produto criado: [ID]

4. Publicando produto (enviando para aprovação)...
✅ Produto publicado (status: PENDING_APPROVAL)
📧 Email deve ter sido enviado para: ja.eduplay@gmail.com

5. Listando produtos pendentes de aprovação...
✅ Encontrados 1 produto(s) pendente(s)

6. Aprovando produto...
✅ Produto aprovado! Status: PUBLISHED
📧 Email de aprovação deve ter sido enviado para o vendedor

7. Testando rejeição de produto...
✅ Produto para rejeição criado: [ID]
✅ Produto rejeitado! Status: REJECTED
📧 Email de rejeição deve ter sido enviado para o vendedor

=================================================
✅ TODOS OS TESTES PASSARAM!
=================================================
```

## VERIFICAÇÕES IMPORTANTES

### Backend está rodando?
```bash
curl http://localhost:3000/api/v1/health
```

### Frontend está rodando?
- Abrir: http://localhost:5173
- Deve carregar a página inicial

### Banco de dados está conectado?
- Verificar logs do backend
- Deve aparecer: "Database connected successfully"

## TROUBLESHOOTING

### Produto não aparece na lista de pendentes

**Problema:** Produto foi criado mas não aparece para o admin

**Solução:**
1. Verificar se produto tem status PENDING_APPROVAL
2. Verificar se admin está logado corretamente
3. Recarregar a página
4. Verificar console do navegador (F12)

### Erro ao aprovar/rejeitar

**Problema:** "Unauthorized" ou "Forbidden"

**Solução:**
1. Verificar se está logado como admin
2. Verificar token no localStorage
3. Fazer logout e login novamente
4. Verificar role do usuário no banco

### Email não foi enviado

**Problema:** Emails não chegam

**Nota:**
- Sistema de email pode estar desabilitado em desenvolvimento
- Verificar configuração em `backend/src/config/email.js`
- Logs do backend mostram se email foi enviado
- Buscar por: "Product submitted email sent to admin"

### Produto não tem botão de aprovar

**Problema:** Botões não aparecem

**Verificação:**
1. Produto está com status PENDING_APPROVAL?
2. Usuário é admin?
3. Filtro está em "Aguardando Aprovação"?

## ENDPOINTS DA API PARA TESTE MANUAL

### Listar produtos pendentes
```bash
curl -X GET http://localhost:3000/api/v1/admin/products/pending \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN"
```

### Aprovar produto
```bash
curl -X POST http://localhost:3000/api/v1/admin/products/PRODUCT_ID/approve \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN"
```

### Rejeitar produto
```bash
curl -X POST http://localhost:3000/api/v1/admin/products/PRODUCT_ID/reject \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Motivo da rejeição"}'
```

## CREDENCIAIS DE TESTE

### Vendedor
- **Email:** teste@exemplo.com
- **Senha:** Senha123
- **Pode:** Criar e publicar produtos

### Admin
- **Email:** ja.eduplay@gmail.com
- **Senha:** Asa122448@
- **Pode:** Aprovar e rejeitar produtos

## CAPTURAS DE TELA ESPERADAS

### 1. ProductForm - Novo Status
- Dropdown de status mostra: "Enviar para Aprovação"
- Texto abaixo: "Ao publicar, o produto será enviado para aprovação do administrador"

### 2. Lista de Produtos do Vendedor
- Badge amarelo: "Aguardando Aprovação"
- Produto não aparece no marketplace

### 3. Menu Admin
- Link roxo: "📋 Produtos Pendentes"
- Aparece apenas para admins

### 4. AdminProducts - Lista Pendentes
- Filtro "Aguardando Aprovação" selecionado (amarelo)
- Cards com todas as informações
- Botões verde "Aprovar" e vermelho "Rejeitar"

### 5. AdminProducts - Rejeição
- Campo de texto para motivo
- Botões "Confirmar Rejeição" e "Cancelar"

### 6. Marketplace
- Produto aprovado aparece para venda
- Produto pendente/rejeitado NÃO aparece

## FLUXOGRAMA DO TESTE

```
[Vendedor Cria Produto]
         ↓
[Status: DRAFT]
         ↓
[Vendedor Publica]
         ↓
[Status: PENDING_APPROVAL]
         ↓
[Email → Admin]
         ↓
[Admin Revisa]
         ↓
    ┌────┴────┐
    ↓         ↓
[Aprovar] [Rejeitar]
    ↓         ↓
[PUBLISHED] [REJECTED]
    ↓         ↓
[Marketplace] [Email → Vendedor]
```

## CHECKLIST DE TESTE

- [ ] Login vendedor funciona
- [ ] Login admin funciona
- [ ] Criar produto funciona
- [ ] Adicionar arquivos funciona
- [ ] Publicar muda status para PENDING_APPROVAL
- [ ] Produto aparece na lista do vendedor como "Aguardando Aprovação"
- [ ] Link "Produtos Pendentes" aparece no menu admin
- [ ] Lista de pendentes carrega corretamente
- [ ] Informações do produto são exibidas
- [ ] Botão "Aprovar" funciona
- [ ] Produto vai para PUBLISHED após aprovação
- [ ] Produto aparece no marketplace
- [ ] Botão "Rejeitar" abre modal
- [ ] Campo de motivo é obrigatório
- [ ] Produto vai para REJECTED após rejeição
- [ ] Filtros funcionam (Pendentes, Publicados, Rejeitados, Todos)
- [ ] Mensagens de sucesso/erro aparecem
- [ ] Loading states funcionam
- [ ] Emails são enviados (se configurado)

## RESULTADO ESPERADO

✅ **Sistema 100% Funcional**
- Todos os endpoints respondem corretamente
- Interface intuitiva e responsiva
- Validações funcionando
- Emails sendo enviados
- Fluxo completo funcionando

## SUPORTE

Se encontrar problemas:

1. Verificar logs do backend no terminal
2. Verificar console do navegador (F12)
3. Verificar Network tab para requisições HTTP
4. Verificar se banco de dados está rodando
5. Limpar cache do navegador
6. Fazer logout e login novamente

**Sistema implementado e testado em:** 19/12/2024
