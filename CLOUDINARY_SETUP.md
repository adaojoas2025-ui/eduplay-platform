# Configuração do Cloudinary para Upload de Imagens

## Por que usar Cloudinary?

O Cloudinary é um serviço gratuito de hospedagem de imagens que permite fazer upload de imagens diretamente do navegador. É muito mais confiável que Google Drive ou Imgur para usar em produção.

## Plano Gratuito

- ✅ 25 GB de armazenamento
- ✅ 25 GB de banda mensal
- ✅ Upload ilimitado
- ✅ Totalmente gratuito (não precisa cartão de crédito)

## Passo a Passo para Configurar

### 1. Criar Conta no Cloudinary

1. Acesse: https://cloudinary.com/users/register_free
2. Preencha seus dados (pode usar email pessoal)
3. Confirme o email
4. Faça login em: https://cloudinary.com/console

### 2. Obter Credenciais

Ao fazer login, você verá o **Dashboard** com suas credenciais:

```
Cloud name: seu-cloud-name
API Key: 123456789012345
API Secret: abcdefghijklmnop
```

**Você só precisa do Cloud Name!**

### 3. Criar Upload Preset (Importante!)

1. No menu lateral, clique em **Settings** (⚙️)
2. Clique na aba **Upload**
3. Role até a seção **Upload presets**
4. Clique em **Add upload preset**
5. Configure assim:
   - **Preset name**: `eduplay_apps` (ou qualquer nome que quiser)
   - **Signing mode**: Selecione **Unsigned** ✅ (MUITO IMPORTANTE!)
   - **Folder**: `eduplay/apps` (opcional, organiza suas imagens)
   - Deixe o resto como padrão
6. Clique em **Save**

### 4. Atualizar Arquivo .env do Frontend

Edite o arquivo `c:\projetos\frontend\.env`:

```env
VITE_API_URL=http://localhost:3000/api/v1

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=seu-cloud-name-aqui
VITE_CLOUDINARY_UPLOAD_PRESET=eduplay_apps
```

**Substitua**:
- `seu-cloud-name-aqui` pelo seu Cloud Name real
- `eduplay_apps` pelo nome do preset que você criou

### 5. Reiniciar o Frontend

Sempre que alterar o arquivo `.env`, você precisa reiniciar o servidor:

```bash
# Parar o servidor (Ctrl+C no terminal)
# Iniciar novamente
npm run dev
```

## Como Usar no Formulário

Depois de configurar:

1. Acesse **Admin → Apps → Novo App**
2. Você verá um botão **"📤 Enviar Imagem do Computador"**
3. Clique e selecione uma imagem do seu computador
4. A imagem será enviada automaticamente para o Cloudinary
5. A URL será preenchida automaticamente no campo

## Solução de Problemas

### Erro: "Cloudinary configuration is missing"

Você esqueceu de adicionar as variáveis no `.env` ou não reiniciou o frontend.

### Erro: "Upload failed"

Verifique se:
1. O upload preset está configurado como **Unsigned**
2. O nome do preset no `.env` está correto
3. Seu Cloud Name está correto

### As imagens não aparecem

Verifique se:
1. A imagem foi realmente enviada (deve aparecer um alerta "Ícone enviado com sucesso!")
2. A URL começa com `https://res.cloudinary.com/`
3. Você tem internet estável

## Alternativas

Se não quiser usar Cloudinary, você ainda pode:

1. **Usar links externos**: Cole links do Imgur, ImgBB, etc
2. **Usar Google Drive**: O sistema converte automaticamente os links
3. **Implementar upload próprio**: Configure um servidor de arquivos próprio

## Dúvidas?

- Documentação Cloudinary: https://cloudinary.com/documentation
- Tutorial de Upload Preset: https://cloudinary.com/documentation/upload_presets
