# Configurar Email no Render.com

O backend precisa das seguintes variáveis de ambiente para enviar emails quando produtos são aprovados.

## Passo a Passo

1. Acesse https://dashboard.render.com
2. Faça login na sua conta
3. Clique no serviço do backend "eduplay-backend-yw7z"
4. Vá em **Environment** no menu lateral
5. Adicione as seguintes variáveis (se ainda não existirem):

### Variáveis de Email Gmail

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=adao.joas2025@gmail.com
EMAIL_PASS=kiiu xadt rbmk whns
EMAIL_FROM=EDUPLAY <adao.joas2025@gmail.com>
```

### Variável do Frontend URL

```
FRONTEND_URL=https://eduplay-platform.vercel.app
```

## Como Adicionar

Para cada variável:

1. Clique em **Add Environment Variable**
2. No campo **Key**, coloque o nome (ex: EMAIL_HOST)
3. No campo **Value**, coloque o valor (ex: smtp.gmail.com)
4. Clique em **Save Changes**

## Importante

⚠️ Após adicionar TODAS as variáveis, o Render vai **automaticamente fazer redeploy** do backend.

⚠️ Aguarde o deploy terminar (uns 2-3 minutos) antes de testar.

## Como Testar

Após configurar:

1. Crie um novo produto como PRODUTOR (adao1980aguiar@gmail.com)
2. Aprove o produto como ADMIN (ja.eduplay@gmail.com)
3. Verifique o email de adao1980aguiar@gmail.com
4. Você deve receber um email com o assunto "Produto Aprovado: [Nome do Produto]"

## Verificar Logs

Se não funcionar, veja os logs no Render:

1. No painel do Render, vá em **Logs**
2. Procure por mensagens com "email" ou "Error sending"
3. Isso vai mostrar se há algum erro no envio
