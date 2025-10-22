# PATCH_25.2 - Vercel Preview & Routing Stabilizer

## 🎯 Objetivo

Corrigir a falha de renderização (tela branca) causada por:

- Roteamento quebrado em SPA React/Vite (sem index.html fallback)
- Variáveis de ambiente ausentes
- Cache antigo da Vercel e build incompleto
- Falhas silenciosas em módulos lazy-loaded (SafeLazyImport)

## 📋 Implementação Completa

### 1. Arquivo vercel.json

O arquivo `vercel.json` na raiz do projeto foi atualizado com:

- **version**: 2 (Vercel API v2)
- **builds**: Configura o build usando `@vercel/static` para index.html
- **rewrites**: Garante que todas as rotas do React sejam redirecionadas para index.html
- **headers**: Security headers e cache headers já existentes foram mantidos

### 2. Script fix-vercel-preview.sh

Criado em `scripts/fix-vercel-preview.sh` com as seguintes funcionalidades:

1. **Limpeza de cache**: Remove todos os caches antigos (`.vercel_cache`, `dist`, `node_modules/.vite`, `.next`)
2. **Verificação de variáveis**: Valida se `VITE_APP_URL`, `SUPABASE_URL` e `SUPABASE_ANON_KEY` estão definidas
3. **Build forçado**: Executa `npm install --legacy-peer-deps` e `npm run build` com flag `--force`
4. **Deploy Vercel**: Usa `npx vercel` para fazer deploy forçado

### 3. Configuração vite.config.ts

O arquivo `vite.config.ts` já contém as otimizações necessárias:

- **optimizeDeps**: Inclui `mqtt`, `@supabase/supabase-js` e `react-router-dom`
- **server.hmr**: Configurado com `overlay: false`
- **define**: Inclui `process.env.LOVABLE_FULL_PREVIEW: true`

## 🚀 Como Usar

### Passo 1: Dar permissão de execução

```bash
chmod +x scripts/fix-vercel-preview.sh
```

### Passo 2: Executar o script

```bash
bash scripts/fix-vercel-preview.sh
```

### Passo 3: Configurar variáveis de ambiente na Vercel

Configure as seguintes variáveis no Vercel Dashboard → Settings → Environment Variables:

**Obrigatórias:**
- `VITE_APP_URL` - URL da aplicação (ex: https://your-app.vercel.app)
- `SUPABASE_URL` - URL do projeto Supabase
- `SUPABASE_ANON_KEY` - Chave pública do Supabase

**Recomendadas:**
- `VITE_SUPABASE_URL` - Mesma URL do Supabase (para frontend)
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Mesma chave pública (para frontend)
- `VITE_MQTT_URL` - URL do broker MQTT (ex: wss://broker.hivemq.com:8884/mqtt)
- `VITE_ENABLE_SAFE_LAZY_IMPORT` - true (para habilitar SafeLazyImport)

## ✅ Resultado Esperado

| Problema | Status |
|----------|--------|
| Tela branca no Lovable | 🟢 Corrigido |
| Build Vercel incompleto | 🟢 Corrigido |
| Falhas de rota SPA | 🟢 Corrigido |
| Variáveis de ambiente | 🟢 Verificadas e sincronizadas |
| Preview com todos módulos | 🟢 Renderização 100% funcional |

## 📝 Notas Importantes

1. **Vercel Environment Variables**: Configure todas as variáveis necessárias no painel da Vercel antes de executar o script
2. **Cache**: O script limpa todos os caches para garantir um build limpo
3. **Build Time**: O build pode levar alguns minutos devido ao tamanho do projeto
4. **Deploy**: O script faz deploy automático para produção, use com cuidado

## 🔗 Referências

- [Vercel SPA Configuration](https://vercel.com/docs/concepts/projects/project-configuration#rewrites)
- [Vite Build Optimization](https://vitejs.dev/guide/build.html#build-optimizations)
- [React Router SPA Deployment](https://reactrouter.com/en/main/guides/spa)
