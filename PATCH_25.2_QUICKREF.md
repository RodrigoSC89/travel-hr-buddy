# 🚀 PATCH_25.2 Quick Reference

## 🎯 Objetivo
Corrigir tela branca em Vercel/Lovable por problemas de roteamento SPA, cache e variáveis de ambiente.

## ⚡ Quick Start

```bash
# Execute o script de correção completo
chmod +x scripts/fix-vercel-preview.sh
bash scripts/fix-vercel-preview.sh
```

## 📋 Checklist de Verificação

- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] `vercel.json` atualizado com builds e env
- [ ] Cache limpo (dist, .vite-cache, etc.)
- [ ] Build passou (215+ arquivos)
- [ ] Preview local funcionando (`npm run preview`)

## 🔧 Comandos Essenciais

```bash
# Limpar cache completo
rm -rf .vercel_cache dist node_modules/.vite .next .vite-cache
npm cache clean --force

# Build forçado
npm run build -- --force

# Testar localmente
npm run preview

# Deploy Vercel (se CLI instalado)
vercel build --prod --force
vercel deploy --prod --force
```

## 🌐 Variáveis de Ambiente Obrigatórias

Configure no painel da Vercel (Settings → Environment Variables):

```
vite_app_url              → URL da aplicação
vite_supabase_url         → URL do Supabase
vite_supabase_publishable_key → Chave pública Supabase
vite_mqtt_url             → wss://broker.hivemq.com:8884/mqtt
```

**Importante**: Sem o prefixo `VITE_` no painel, mas com prefixo `@` no vercel.json!

## 📁 Arquivos Modificados

1. **vercel.json** → Adicionado builds, env
2. **scripts/fix-vercel-preview.sh** → Script automático (novo)
3. **vite.config.ts** → Já tinha tudo ✅

## ✅ Resultado Esperado

```bash
# Após build
$ ls -lh dist/index.html
-rw-rw-r-- 1 user user 3.3K dist/index.html

$ du -sh dist
32M     dist

$ find dist -type f | wc -l
215
```

## 🐛 Troubleshooting Rápido

### Tela branca após deploy
```bash
vercel env pull
rm -rf .vercel .vercel_cache
vercel build --prod --force
```

### Variáveis não encontradas
1. Vercel Dashboard → Settings → Environment Variables
2. Verificar prefixo `VITE_` e ambiente (Production/Preview)
3. Redeploy

### Erro de módulo
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
npm run build
```

## 📊 Verificação Manual

```bash
# 1. Verificar vercel.json
cat vercel.json | grep -A 2 '"env"'

# 2. Verificar variáveis locais
cat .env | grep VITE_

# 3. Testar build
npm run build && npm run preview

# 4. Abrir browser
# http://localhost:4173
```

## 🎓 Links Rápidos

- [Documentação Completa](./PATCH_25.2_IMPLEMENTATION_COMPLETE.md)
- [Script de Correção](./scripts/fix-vercel-preview.sh)
- [Vercel Env Vars](https://vercel.com/docs/concepts/projects/environment-variables)

## 📝 Status

| Item | Status |
|------|--------|
| vercel.json | ✅ |
| Script automático | ✅ |
| vite.config.ts | ✅ (já correto) |
| Build | ✅ (215 arquivos, 32MB) |
| Documentação | ✅ |

---

**Versão**: 25.2  
**Última atualização**: 2025-10-22  
**Compatibilidade**: Vercel, Lovable, Cloudflare Pages
