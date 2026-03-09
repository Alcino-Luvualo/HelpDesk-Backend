# Configuração do Cloudinary

## O que foi implementado

A aplicação agora usa **Cloudinary** para armazenar fotos de perfil de clientes e técnicos, substituindo o armazenamento local em `public/uploads/`.

## Por que Cloudinary?

- **Render não persiste arquivos**: O sistema de arquivos do Render é efêmero e reinicia a cada deploy
- **CDN global**: Imagens são servidas via CDN para melhor performance
- **Gerenciamento automático**: Redimensionamento, otimização e transformações automáticas

## Configuração

### 1. Criar conta no Cloudinary

1. Acesse https://cloudinary.com/
2. Crie uma conta gratuita (10GB de armazenamento e 25GB de bandwidth/mês)
3. Após login, vá para **Dashboard**

### 2. Obter CLOUDINARY_URL

No Dashboard do Cloudinary, você verá:

```
API Environment variable
cloudinary://123456789012345:AbCdEfGhIjKlMnOpQrStUvWxYz@your-cloud-name
```

### 3. Configurar no Render

1. Acesse seu serviço no Render
2. Vá em **Environment**
3. Adicione a variável:
   - **Key**: `CLOUDINARY_URL`
   - **Value**: `cloudinary://...` (cole a URL completa do Dashboard)
4. Salve e aguarde o redeploy automático

### 4. Configurar localmente (desenvolvimento)

Crie/edite o arquivo `.env` na raiz do backend:

```env
CLOUDINARY_URL=cloudinary://123456789012345:AbCdEfGhIjKlMnOpQrStUvWxYz@your-cloud-name
```

## Como funciona

### Upload de foto

```javascript
// ClienteController.js
const { uploadImage } = require('../../Services/CloudinaryService')

const uploadResult = await uploadImage(foto.tmpPath, 'clientes', cliente.id)
cliente.fotoUrl = uploadResult.secure_url // https://res.cloudinary.com/...
```

### Estrutura no Cloudinary

As imagens são organizadas em pastas:
- `helpdesk/clientes/` - Fotos de clientes
- `helpdesk/tecnicos/` - Fotos de técnicos

Formato do nome: `clientes_123_1234567890.jpg`

### Remoção de foto antiga

Ao fazer upload de nova foto, a antiga é automaticamente deletada do Cloudinary:

```javascript
if (cliente.fotoUrl) {
  await deleteImageByUrl(cliente.fotoUrl)
}
```

## Testando

### Local

```bash
# Certifique-se que CLOUDINARY_URL está no .env
npm run serve

# Teste upload via frontend ou curl:
curl -X PATCH http://localhost:3333/clientes/1/foto \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "foto=@/path/to/image.jpg"
```

### Produção

Após configurar no Render, teste fazendo upload de foto de perfil pelo frontend.

## Verificação

1. **Backend logs**: Verifique se não há erros de "CLOUDINARY_URL não configurada"
2. **Cloudinary Dashboard**: Acesse **Media Library** para ver as imagens enviadas
3. **Frontend**: A foto deve aparecer com URL `https://res.cloudinary.com/...`

## Troubleshooting

### Erro: "CLOUDINARY_URL não configurada"

- Verifique se a variável está no `.env` (local) ou no Render (produção)
- Reinicie o servidor após adicionar a variável

### Erro: "Arquivo temporário do upload não encontrado"

- Verifique se o bodyparser está configurado corretamente
- Confirme que o campo do formulário se chama `foto`

### Imagem não aparece no frontend

- Verifique se `cliente.fotoUrl` retorna URL completa do Cloudinary
- Confirme que não há CORS bloqueando as imagens
- Verifique o getter `getFotoUrl()` no Model Cliente/Tecnico

## Migração de imagens antigas

Se você tem imagens em `public/uploads/`, elas não serão migradas automaticamente. Opções:

1. **Ignorar**: Novos uploads usarão Cloudinary
2. **Script de migração**: Criar script para fazer upload das imagens locais para Cloudinary
3. **Manual**: Pedir aos usuários para fazer novo upload

## Custos

Plano gratuito do Cloudinary:
- 25 créditos/mês
- 10GB de armazenamento
- 25GB de bandwidth
- Suficiente para ~1000 usuários ativos

Se exceder, considerar upgrade ou otimizar imagens.
