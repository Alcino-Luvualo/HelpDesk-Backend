# Fix: URLs antigas de fotos

## Problema
Fotos salvas antes do Cloudinary têm URLs antigas (`/uploads/...`) que não funcionam em produção.

## Solução aplicada

### 1. Getter atualizado (Models)
Os getters de `Cliente.js` e `Tecnico.js` agora ignoram URLs antigas:
```javascript
getFotoUrl (fotoUrl) {
  if (!fotoUrl) return null
  if (fotoUrl.startsWith('/uploads/')) return null // Ignora URLs antigas
  return fotoUrl
}
```

### 2. Migration para limpar banco
Criada migration `1773060000000_clean_old_photo_urls.js` que limpa URLs antigas:
```sql
UPDATE clientes SET "fotoUrl" = NULL WHERE "fotoUrl" LIKE '/uploads/%';
UPDATE tecnicos SET "fotoUrl" = NULL WHERE "fotoUrl" LIKE '/uploads/%';
```

## Deploy

✅ Push feito para `main`
⏳ Aguardando redeploy no Render

### Após deploy

A migration será executada automaticamente pelo comando:
```bash
node ace migration:run --force
```

## Resultado

- URLs antigas (`/uploads/...`) → retornam `null` (sem foto)
- Novos uploads → salvam no Cloudinary (`https://res.cloudinary.com/...`)
- Usuários precisam fazer novo upload da foto de perfil

## Testar

1. Aguarde redeploy completar (~2-3 min)
2. Recarregue o frontend
3. Erro 404 não deve mais aparecer
4. Faça novo upload de foto → deve salvar no Cloudinary
