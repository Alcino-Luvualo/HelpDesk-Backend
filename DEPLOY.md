# Deploy no Render - HelpDesk Backend

## Configuração no Render

### 1. Criar Web Service

- **Build Command:**
  ```bash
  npm install && node ace migration:run --force
  ```

- **Start Command:**
  ```bash
  node ace serve --production
  ```

### 2. Variáveis de Ambiente (Environment Variables)

Configure as seguintes variáveis no painel do Render:

```
NODE_ENV=production
HOST=0.0.0.0
PORT=3333
CACHE_VIEWS=true
APP_KEY=RR3d9kHEPEbcWzlrhVJTJluSh7aAOijU
DB_CONNECTION=pg
DATABASE_URL=<sua-database-url-do-render>
SESSION_DRIVER=cookie
HASH_DRIVER=bcrypt
```

**IMPORTANTE:** O Render injeta automaticamente a variável `PORT`. O AdonisJS vai usar `process.env.PORT` automaticamente.

### 3. Banco de Dados PostgreSQL

- Crie um PostgreSQL no Render
- Copie a **Internal Database URL** ou **External Database URL**
- Cole em `DATABASE_URL` nas variáveis de ambiente

### 4. Erros Comuns e Soluções

#### ❌ Erro: "EADDRINUSE" ou "Port already in use"
**Solução:** Certifique-se de que HOST=0.0.0.0 está configurado

#### ❌ Erro: "self signed certificate"
**Solução:** SSL já está configurado com `rejectUnauthorized: false` no config/database.js

#### ❌ Erro: "Cannot find module"
**Solução:** Adicione `npm install` no Build Command

#### ❌ Erro: "Migration failed"
**Solução:** Verifique se DATABASE_URL está correta e acessível

#### ❌ Erro: "App crashed" ou "502 Bad Gateway"
**Causas possíveis:**
- Porta incorreta (deve usar $PORT do Render)
- HOST não está 0.0.0.0
- Erro nas migrations
- DATABASE_URL inválida
- APP_KEY não configurada

#### ❌ Erro: "Connection timeout" no banco
**Solução:** Use a Internal Database URL se o banco estiver no mesmo datacenter

#### ❌ Erro: "CORS blocked"
**Solução:** Configure CORS no config/cors.js para aceitar o domínio do frontend

### 5. Checklist Pré-Deploy

- [ ] NODE_ENV=production configurado
- [ ] HOST=0.0.0.0 configurado
- [ ] DATABASE_URL configurada
- [ ] APP_KEY configurada (mesma do desenvolvimento)
- [ ] Build Command inclui migrations
- [ ] Start Command correto: `node ace serve --production`
- [ ] PostgreSQL criado no Render
- [ ] SSL habilitado no config/database.js

### 6. Comandos Úteis

**Testar localmente em modo produção:**
```bash
NODE_ENV=production node ace serve --production
```

**Rodar migrations manualmente:**
```bash
node ace migration:run --force
```

**Verificar status das migrations:**
```bash
node ace migration:status
```

### 7. Monitoramento

Após deploy, verifique:
- Logs do Render para erros
- Conexão com banco de dados
- Endpoints da API funcionando
- CORS configurado corretamente

### 8. Rollback

Se algo der errado:
1. Acesse o painel do Render
2. Vá em "Events" ou "Deploys"
3. Clique em "Rollback" para versão anterior
