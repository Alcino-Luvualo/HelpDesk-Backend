## ✅ Cloudinary Configurado

### Credenciais (já configuradas)

- **Cloud Name**: dqf6cbhja
- **API Key**: 747917171684282
- **CLOUDINARY_URL**: `cloudinary://747917171684282:euok4B_f8NY0DcGfX2WK1BKEMyk@dqf6cbhja`

### Status

✅ Configurado localmente no `.env`
⏳ Pendente: Configurar no Render

### Configurar no Render (Produção)

1. Acesse: https://dashboard.render.com/
2. Selecione seu serviço **helpdesk-backend**
3. Vá em **Environment** (menu lateral)
4. Clique em **Add Environment Variable**
5. Adicione:
   - **Key**: `CLOUDINARY_URL`
   - **Value**: `cloudinary://747917171684282:euok4B_f8NY0DcGfX2WK1BKEMyk@dqf6cbhja`
6. Clique em **Save Changes**
7. Aguarde o redeploy automático (~2-3 minutos)

### Testar

Após configurar no Render:

1. Acesse o frontend em produção
2. Faça login como cliente ou técnico
3. Vá em Perfil
4. Faça upload de uma foto
5. Verifique se a URL da foto é: `https://res.cloudinary.com/dqf6cbhja/...`

### Verificar no Cloudinary

1. Acesse: https://console.cloudinary.com/
2. Vá em **Media Library**
3. Você verá as pastas:
   - `helpdesk/clientes/`
   - `helpdesk/tecnicos/`

### Comandos úteis

```bash
# Fazer push das alterações
git push origin main

# Ver logs do Render (após deploy)
# Acesse: https://dashboard.render.com/ > seu serviço > Logs
```

### Troubleshooting

Se aparecer erro "CLOUDINARY_URL não configurada":
- Verifique se a variável foi salva no Render
- Aguarde o redeploy completar
- Verifique os logs do Render
