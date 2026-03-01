# ✅ RESUMO DAS ALTERAÇÕES PARA DEPLOY NO RENDER

## Arquivos Modificados

### 1. ✅ config/database.js
- Configurado para usar `DATABASE_URL` (variável do Render)
- SSL ativado apenas em produção: `{ rejectUnauthorized: false }`
- Pool de conexões configurado (min: 2, max: 10)
- Fallback para variáveis individuais (DB_HOST, DB_PORT, etc.)

### 2. ✅ config/app.js
- `trustProxy: true` - necessário para Render/proxies

### 3. ✅ package.json
- Adicionado script `prod`: `node ace serve --production`
- Adicionado script `serve`: `node ace serve`

### 4. ✅ .env.production (criado)
- Template para variáveis de produção
- HOST=0.0.0.0
- NODE_ENV=production
- CACHE_VIEWS=true

### 5. ✅ render.yaml (criado)
- Blueprint para deploy automático no Render
- Build Command: `npm install && node ace migration:run --force`
- Start Command: `node ace serve --production`

### 6. ✅ DEPLOY.md (criado)
- Documentação completa de deploy
- Checklist pré-deploy
- Erros comuns e soluções
- Comandos úteis

---

## 🚀 CONFIGURAÇÃO NO RENDER

### Build Command:
```bash
npm install && node ace migration:run --force
```

### Start Command:
```bash
node ace serve --production
```

### Environment Variables (obrigatórias):
```
NODE_ENV=production
HOST=0.0.0.0
PORT=3333
CACHE_VIEWS=true
APP_KEY=RR3d9kHEPEbcWzlrhVJTJluSh7aAOijU
DB_CONNECTION=pg
DATABASE_URL=<copiar-do-render-postgresql>
SESSION_DRIVER=cookie
HASH_DRIVER=bcrypt
```

---

## ⚠️ ERROS COMUNS DE DEPLOY

### 1. App não inicia / 502 Bad Gateway
**Causas:**
- HOST não está 0.0.0.0
- PORT não está configurada
- DATABASE_URL inválida
- Erro nas migrations

**Solução:**
- Verificar logs do Render
- Confirmar todas as env vars
- Testar migrations localmente

### 2. "self signed certificate" / SSL error
**Causa:** PostgreSQL do Render usa SSL

**Solução:** ✅ Já configurado em `config/database.js`
```js
ssl: Env.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false
```

### 3. "EADDRINUSE" / Port already in use
**Causa:** HOST incorreto

**Solução:** ✅ Configurar `HOST=0.0.0.0`

### 4. Migrations falham
**Causa:** DATABASE_URL incorreta ou banco inacessível

**Solução:**
- Usar Internal Database URL (se no mesmo datacenter)
- Verificar credenciais do banco
- Testar conexão manualmente

### 5. CORS blocked
**Causa:** Frontend não autorizado

**Solução:** Atualizar `config/cors.js`:
```js
origin: ['https://seu-frontend.vercel.app', 'https://seu-frontend.com']
```

### 6. "Cannot find module"
**Causa:** Dependências não instaladas

**Solução:** ✅ Build Command já inclui `npm install`

### 7. Session/Cookie não funciona
**Causa:** trustProxy desabilitado

**Solução:** ✅ Já configurado `trustProxy: true` em `config/app.js`

### 8. Uploads/arquivos não persistem
**Causa:** Render usa filesystem efêmero

**Solução:** Usar serviço externo (AWS S3, Cloudinary, etc.)

---

## 📋 CHECKLIST PRÉ-DEPLOY

- [x] config/database.js configurado para DATABASE_URL
- [x] SSL habilitado para produção
- [x] trustProxy: true em config/app.js
- [x] Scripts de produção no package.json
- [x] Documentação de deploy criada
- [ ] Criar PostgreSQL no Render
- [ ] Copiar DATABASE_URL para env vars
- [ ] Configurar todas as variáveis de ambiente
- [ ] Testar migrations localmente
- [ ] Configurar CORS para domínio do frontend
- [ ] Fazer primeiro deploy
- [ ] Verificar logs do Render
- [ ] Testar endpoints da API

---

## 🔧 COMANDOS ÚTEIS

**Testar em modo produção localmente:**
```bash
NODE_ENV=production node ace serve --production
```

**Rodar migrations:**
```bash
node ace migration:run --force
```

**Ver status das migrations:**
```bash
node ace migration:status
```

**Rollback migrations:**
```bash
node ace migration:rollback
```

---

## 📝 NOTAS IMPORTANTES

1. **PORT:** O Render injeta automaticamente `$PORT`. O AdonisJS detecta `process.env.PORT` automaticamente.

2. **DATABASE_URL:** Formato esperado:
   ```
   postgresql://user:password@host:port/database
   ```

3. **APP_KEY:** Use a mesma chave do desenvolvimento para manter compatibilidade com dados criptografados.

4. **Filesystem:** Render não persiste arquivos. Use serviço externo para uploads.

5. **Logs:** Acesse logs em tempo real no painel do Render.

6. **Health Check:** Render faz ping no app. Certifique-se de ter uma rota raiz (/) funcionando.

---

## ✅ PRÓXIMOS PASSOS

1. Criar PostgreSQL no Render
2. Copiar Internal Database URL
3. Criar Web Service no Render
4. Configurar variáveis de ambiente
5. Conectar ao repositório Git
6. Deploy automático
7. Verificar logs
8. Testar API

---

**Tudo pronto para deploy! 🚀**
