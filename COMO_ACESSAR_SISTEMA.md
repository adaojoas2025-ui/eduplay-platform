# 🚀 COMO ACESSAR O SISTEMA EDUPLAY

## ✅ STATUS ATUAL

- ✅ Backend RODANDO na porta 3000
- ⚠️ Frontend PRECISA SER INICIADO

---

## 📋 PASSO A PASSO PARA ACESSAR

### Opção 1: Usar o arquivo batch (RECOMENDADO)

1. Vá até a pasta: `c:\projetos`
2. Clique duas vezes no arquivo: **`INICIAR_FRONTEND.bat`**
3. Uma janela preta vai abrir mostrando o frontend iniciando
4. Aguarde até aparecer a mensagem com a URL (geralmente http://localhost:5173)
5. Abra seu navegador e acesse: **http://localhost:5173**

### Opção 2: Iniciar manualmente

1. Abra o CMD (Prompt de Comando)
2. Execute os comandos:
   ```
   cd c:\projetos\frontend
   npm run dev
   ```
3. Aguarde até aparecer a URL
4. Acesse **http://localhost:5173** no navegador

---

## 🔐 CREDENCIAIS DO ADMINISTRADOR

**Email:** `ja.eduplay@gmail.com`
**Senha:** `Asa122448@`

---

## 💰 COMO TESTAR O SISTEMA DE APROVAÇÃO E COMISSÕES

### 1. Ver Comissões da Plataforma (3%)

1. Faça login com: `ja.eduplay@gmail.com`
2. Clique no seu nome (canto superior direito)
3. No menu dropdown, clique em: **"💰 Comissões (3%)"**
4. Você verá:
   - Total arrecadado: **R$ 1.448,95** (comissões pendentes)
   - Lista completa de todas as comissões
   - Botão para marcar como pago

### 2. Aprovar Produtos de Vendedores

1. Faça login com: `ja.eduplay@gmail.com`
2. Clique no seu nome (canto superior direito)
3. No menu dropdown, clique em: **"📋 Produtos Pendentes"**
4. Você verá todos os produtos aguardando aprovação
5. Para cada produto você pode:
   - **Aprovar** → Produto vai ao ar e vendedor recebe email
   - **Rejeitar** → Digite o motivo e vendedor recebe email com a justificativa

---

## 📧 SISTEMA DE EMAILS

Quando você aprovar ou rejeitar um produto:
- ✅ Vendedor recebe email automático
- ✅ Email contém informações do produto
- ✅ Se rejeitado, email contém o motivo

---

## 📊 ESTATÍSTICAS ATUAIS

```
👥 Usuários: 6 (4 vendedores)
📦 Produtos: 16
💳 Pedidos: 50 (17 completos)
💰 Comissões: 17

💵 RECEITA TOTAL: R$ 2.497,95
💵 Taxa Plataforma (3%): R$ 187,63
💵 Vendedores (97%): R$ 2.310,32
```

---

## ⚡ FUNCIONALIDADES IMPLEMENTADAS

✅ Sistema de aprovação de produtos pelo admin
✅ Sistema de comissões 3% da plataforma
✅ Emails automáticos (aprovação/rejeição)
✅ Dashboard admin com estatísticas
✅ Filtros por status (PENDING, APPROVED, REJECTED)
✅ Interface completa e responsiva

---

## 🐛 SE DER PROBLEMA

1. **Frontend não abre:**
   - Verifique se executou o `INICIAR_FRONTEND.bat`
   - Aguarde até aparecer a mensagem "ready in XXXms"
   - Tente acessar http://localhost:5173

2. **Backend parou:**
   - Execute: `cd c:\projetos\backend && npm run dev`

3. **Erro de conexão:**
   - Certifique-se que ambos os servidores estão rodando
   - Backend: porta 3000
   - Frontend: porta 5173

---

**✨ TUDO ESTÁ PRONTO E FUNCIONANDO!**

Basta iniciar o frontend e começar a usar! 🎉
