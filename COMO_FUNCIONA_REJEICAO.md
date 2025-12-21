# 🚫 COMO FUNCIONA A REJEIÇÃO DE PRODUTOS

## ✅ Sistema Automático de Remoção

Quando você **REJEITA** um produto como administrador:

### 🔄 O que acontece automaticamente:

1. **Status muda para REJECTED**
   - O produto sai do status `PENDING_APPROVAL`
   - Entra no status `REJECTED`

2. **Produto SOME do marketplace**
   - ❌ Compradores NÃO veem mais o produto
   - ❌ Produto NÃO aparece em buscas
   - ❌ Produto NÃO aparece na listagem
   - ✅ Apenas o vendedor consegue ver (como rejeitado)

3. **Vendedor recebe email**
   - Email automático informando rejeição
   - Contém o motivo que você digitou
   - Vendedor pode corrigir e reenviar

---

## 🎯 QUANDO USAR CADA AÇÃO:

### 📋 REJEITAR
**Use quando:**
- Produto viola regras da plataforma
- Conteúdo inadequado
- Descrição enganosa
- Preço abusivo
- Qualquer problema que possa ser corrigido

**Resultado:**
- ✅ Produto SAI DO AR imediatamente
- ✅ Vendedor pode corrigir e reenviar
- ✅ Histórico preservado

### 🗑️ DELETAR
**Use quando:**
- Produto foi criado por engano
- Duplicata
- Spam/Teste
- **ATENÇÃO:** Só funciona se o produto NÃO tiver vendas

**Resultado:**
- ⚠️ Produto é REMOVIDO permanentemente
- ❌ NÃO pode ser recuperado
- ❌ NÃO funciona se houver pedidos

---

## 💡 RECOMENDAÇÃO

Na maioria dos casos, use **REJEITAR** ao invés de **DELETAR**:

✅ **REJEITAR é melhor porque:**
- Mantém histórico
- Vendedor pode corrigir
- Sem risco de perder dados
- Produto sai do ar igualmente

❌ **DELETAR só quando:**
- Produto é spam/teste
- Sem vendas associadas
- Precisa remover permanentemente

---

## 📊 STATUS DE PRODUTOS

### Fluxo completo:

```
DRAFT (Rascunho)
    ↓ Vendedor publica
PENDING_APPROVAL (Aguardando)
    ↓
    ├─ Admin APROVA → PUBLISHED (No ar) ✅
    └─ Admin REJEITA → REJECTED (Fora do ar) ❌
```

### O que aparece no marketplace:

- ✅ **PUBLISHED** → Visível para todos
- ❌ **DRAFT** → Só vendedor vê
- ❌ **PENDING_APPROVAL** → Só admin vê
- ❌ **REJECTED** → Só vendedor vê (com motivo)
- ❌ **ARCHIVED** → Ninguém vê

---

## 🔐 RESUMO

**Quando você REJEITA um produto:**
1. Produto SAI DO AR instantaneamente
2. Vendedor recebe email com motivo
3. Vendedor pode corrigir e reenviar
4. Histórico preservado

**✨ É exatamente o que você precisa!**
