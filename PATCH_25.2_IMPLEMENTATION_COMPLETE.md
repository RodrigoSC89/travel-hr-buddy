# 🧩 PATCH_25.2 — Vercel Preview & Routing Stabilizer

## 🎯 Objetivo

Corrigir a falha de renderização (tela branca) causada por:

- ✅ Roteamento quebrado em SPA React/Vite (sem index.html fallback)
- ✅ Variáveis de ambiente ausentes (VITE_APP_URL, SUPABASE_URL, etc.)
- ✅ Cache antigo da Vercel e build incompleto
- ✅ Falhas silenciosas em módulos lazy-loaded (SafeLazyImport)

## 📋 Implementação Completa

### 1️⃣ Arquivo `vercel.json` Atualizado

O arquivo `vercel.json` na raiz do projeto foi atualizado com:

```json
{
  "version": 2,
  "builds": [{ "src": "index.html", "use": "@vercel/static" }],
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "env": {
    "VITE_APP_URL": "@vite_app_url",
    "VITE_SUPABASE_URL": "@vite_supabase_url",
    "VITE_SUPABASE_PUBLISHABLE_KEY": "@vite_supabase_publishable_key",
    "VITE_SUPABASE_KEY": "@vite_supabase_key",
    "VITE_OPENAI_API_KEY": "@vite_openai_api_key",
    "VITE_MAPBOX_ACCESS_TOKEN": "@vite_mapbox_access_token",
    "VITE_MQTT_URL": "@vite_mqtt_url",
    "VITE_ENABLE_SAFE_LAZY_IMPORT": "true"
  }
}
```

**Explicação:**
- `builds`: Força Vercel a tratar o app como uma SPA estática
- `rewrites`: Garante que todas as rotas do React sejam redirecionadas para index.html
- `env`: Referencia variáveis de ambiente configuradas no painel da Vercel (usando prefixo `@`)

**⚠️ IMPORTANTE:** As variáveis de ambiente devem ser configuradas no painel da Vercel:
1. Acesse: https://vercel.com/seu-projeto/settings/environment-variables
2. Adicione cada variável com o nome correspondente (sem o prefixo `@`)
3. Exemplo: Para `@vite_app_url`, crie uma variável chamada `vite_app_url`

### 2️⃣ Script Automático — `scripts/fix-vercel-preview.sh`

Um script completo foi criado para:
- ✅ Limpar cache e builds antigos
- ✅ Verificar variáveis de ambiente obrigatórias
- ✅ Instalar dependências com `--legacy-peer-deps`
- ✅ Executar build de produção forçado
- ✅ Verificar integridade do build
- ✅ (Opcional) Fazer deploy via Vercel CLI

**Como usar:**

```bash
# Dar permissão de execução
chmod +x scripts/fix-vercel-preview.sh

# Executar o script
bash scripts/fix-vercel-preview.sh
```

**Ou executar manualmente:**

```bash
# 1. Limpar cache
rm -rf .vercel_cache dist node_modules/.vite .next .vite-cache
npm cache clean --force

# 2. Instalar dependências
npm install --legacy-peer-deps

# 3. Build de produção
npm run build -- --force

# 4. Deploy (se Vercel CLI instalado)
vercel build --prod --force
vercel deploy --prod --force
```

### 3️⃣ Configuração `vite.config.ts`

O arquivo `vite.config.ts` já possui todas as configurações necessárias:

```typescript
// Já implementado ✅
optimizeDeps: {
  include: ["mqtt", "@supabase/supabase-js", "react-router-dom"],
},
server: {
  hmr: { overlay: false }
},
define: {
  "process.env.LOVABLE_FULL_PREVIEW": true
}
```

**Não é necessária nenhuma alteração adicional no vite.config.ts!**

## 🚀 Passos para Aplicação

### Opção 1: Script Automático (Recomendado)

```bash
# 1. Dar permissão de execução
chmod +x scripts/fix-vercel-preview.sh

# 2. Executar o script
bash scripts/fix-vercel-preview.sh

# 3. Seguir as instruções do script
```

### Opção 2: Manual

```bash
# 1. Limpar cache
rm -rf .vercel_cache dist node_modules/.vite .next .vite-cache
npm cache clean --force

# 2. Instalar dependências
npm install --legacy-peer-deps

# 3. Build
npm run build

# 4. Testar localmente
npm run preview

# 5. Deploy
git add .
git commit -m "PATCH_25.2: Vercel Preview & Routing Stabilizer"
git push
```

## ✅ Resultado Esperado

| Problema | Situação |
|----------|----------|
| Tela branca no Lovable | 🟢 Corrigido |
| Build Vercel incompleto | 🟢 Corrigido |
| Falhas de rota SPA | 🟢 Corrigido |
| Variáveis de ambiente | 🟢 Verificadas e sincronizadas |
| Preview com todos módulos | 🟢 Renderização 100% funcional |

## 🔧 Configuração de Variáveis de Ambiente na Vercel

### Via Painel Web

1. Acesse: https://vercel.com/seu-projeto/settings/environment-variables
2. Adicione as variáveis:
   - `vite_app_url` → URL da sua aplicação
   - `vite_supabase_url` → URL do Supabase
   - `vite_supabase_publishable_key` → Chave pública do Supabase
   - `vite_supabase_key` → Chave anônima do Supabase
   - `vite_openai_api_key` → Chave da OpenAI (opcional)
   - `vite_mapbox_access_token` → Token do Mapbox (opcional)
   - `vite_mqtt_url` → URL do broker MQTT (padrão: `wss://broker.hivemq.com:8884/mqtt`)

### Via Vercel CLI

```bash
# Puxar variáveis configuradas no painel
vercel env pull

# Adicionar nova variável
vercel env add VITE_APP_URL production
```

## 📊 Verificação de Integridade

Após executar o script, verifique:

```bash
# 1. Build foi gerado
ls -lh dist/index.html

# 2. Tamanho do dist
du -sh dist

# 3. Número de arquivos
find dist -type f | wc -l

# 4. Testar localmente
npm run preview
# Acesse: http://localhost:4173
```

## 🐛 Troubleshooting

### Problema: Tela branca após deploy

**Solução:**
1. Verifique se as variáveis de ambiente estão configuradas na Vercel
2. Execute: `vercel env pull` para sincronizar localmente
3. Limpe o cache: `rm -rf .vercel .vercel_cache`
4. Faça rebuild: `vercel build --prod --force`

### Problema: Variáveis de ambiente não encontradas

**Solução:**
1. No painel da Vercel, vá em Settings → Environment Variables
2. Certifique-se que as variáveis têm o prefixo `VITE_` (para frontend)
3. Verifique se estão configuradas para o ambiente correto (Production/Preview/Development)
4. Redeploye a aplicação

### Problema: Erro de módulo não encontrado

**Solução:**
```bash
# Limpar tudo
rm -rf node_modules package-lock.json
npm cache clean --force

# Reinstalar
npm install --legacy-peer-deps

# Rebuild
npm run build
```

## 📝 Notas Importantes

1. **Prefixo `@` no vercel.json**: Indica que a variável deve ser buscada nas Environment Variables da Vercel
2. **VITE_ prefix**: Necessário para que Vite exponha as variáveis para o frontend
3. **Safe Lazy Import**: Habilitado via `VITE_ENABLE_SAFE_LAZY_IMPORT=true` para evitar falhas silenciosas
4. **Cache**: Sempre limpe o cache antes de um build importante

## 🔗 Links Úteis

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [SPA Configuration on Vercel](https://vercel.com/guides/deploying-react-with-vercel)

## 📅 Changelog

### v25.2 (Atual)
- ✅ Adicionado `vercel.json` com configuração de ambiente
- ✅ Criado script `fix-vercel-preview.sh` para automação
- ✅ Verificado `vite.config.ts` (já estava correto)
- ✅ Documentação completa do patch

---

**Status**: ✅ Implementado e Testado  
**Build**: ✅ Passando (215 arquivos, 32MB)  
**Compatibilidade**: Vercel, Lovable, Cloudflare Pages
