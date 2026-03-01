# CONFIGURAÇÃO RENDER - COPIAR E COLAR

## 🎯 Web Service Settings

### Build Command
```
npm install && node ace migration:run --force
```

### Start Command (escolha uma opção)

**OPÇÃO 1 (Recomendada):**
```
ENV_SILENT=true node server.js
```

**OPÇÃO 2:**
```
node ace serve --production
```

**⚠️ NOTA:** Ambas funcionam. O AdonisJS detecta `HOST` e `PORT` automaticamente das variáveis de ambiente.

---

## 🔐 Environment Variables

Copie e cole no painel do Render (Settings > Environment):

```
NODE_ENV=production
HOST=0.0.0.0
PORT=3333
CACHE_VIEWS=true
APP_KEY=RR3d9kHEPEbcWzlrhVJTJluSh7aAOijU
DB_CONNECTION=pg
DATABASE_URL=
SESSION_DRIVER=cookie
HASH_DRIVER=bcrypt
```

**⚠️ IMPORTANTE:** 
- Deixe `DATABASE_URL` vazio inicialmente
- Após criar o PostgreSQL no Render, copie a **Internal Database URL**
- Cole em `DATABASE_URL`
- O Render injeta `PORT` automaticamente, mas mantenha como fallback

---

## 📊 PostgreSQL Settings (se criar novo banco)

- **Database Name:** helpdesk_h82g
- **User:** helpdesk_h82g_user
- **Region:** Mesmo do Web Service (para melhor performance)

Após criar:
1. Copie a **Internal Database URL**
2. Cole em `DATABASE_URL` nas Environment Variables do Web Service

---

## 🔗 Se já tem PostgreSQL no Render

1. Acesse seu PostgreSQL no Render
2. Vá em "Info"
3. Copie a **Internal Database URL** (formato: `postgresql://user:pass@host:port/db`)
4. Cole em `DATABASE_URL` nas Environment Variables

---

## ✅ Checklist Final

- [ ] Web Service criado
- [ ] Build Command configurado
- [ ] Start Command configurado (usar OPÇÃO 1)
- [ ] Todas as Environment Variables adicionadas
- [ ] DATABASE_URL preenchida com URL do PostgreSQL
- [ ] Deploy iniciado
- [ ] Logs verificados (sem erros)
- [ ] API testada (fazer request para https://seu-app.onrender.com)

---

## 🐛 Se der erro no deploy

1. **Verifique os logs** no painel do Render
2. **Erros comuns:**
   - "Cannot connect to database" → DATABASE_URL incorreta
   - "Port already in use" → HOST não está 0.0.0.0
   - "Migration failed" → Verificar estrutura do banco
   - "502 Bad Gateway" → App não iniciou, ver logs
   - "Env variable APP_KEY is required" → Adicionar APP_KEY

3. **Teste localmente:**
   ```bash
   NODE_ENV=production HOST=0.0.0.0 DATABASE_URL="sua-url" node server.js
   ```

---

## 📞 Suporte

- **Análise completa:** `ANALISE_DEPLOY.md`
- **Documentação detalhada:** `DEPLOY.md`
- **Verificar configuração:** `./check-deploy.sh`
