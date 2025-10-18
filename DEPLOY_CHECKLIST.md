# 🚀 Deploy Checklist - Nautilus One

> **Checklist rápido para deploy em produção**  
> Para desenvolvedores experientes que precisam de uma referência rápida

---

## 📋 PRÉ-DEPLOY VERIFICATION

### 1. ✅ Environment Variables
- [ ] Copiar `.env.production` como referência
- [ ] Configurar 14 variáveis **OBRIGATÓRIAS** no Vercel:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_PUBLISHABLE_KEY`
  - [ ] `VITE_SUPABASE_PROJECT_ID`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_KEY`
  - [ ] `VITE_OPENAI_API_KEY`
  - [ ] `VITE_SENTRY_DSN`
  - [ ] `SENTRY_ORG`
  - [ ] `SENTRY_PROJECT`
  - [ ] `SENTRY_AUTH_TOKEN`
  - [ ] `RESEND_API_KEY`
  - [ ] `VITE_APP_URL`
  - [ ] `VITE_NODE_ENV=production`
  - [ ] `VITE_APP_NAME`

### 2. ⚡ Recommended Variables (8 variáveis)
- [ ] `VITE_MAPBOX_ACCESS_TOKEN` - Mapas interativos
- [ ] `VITE_MAPBOX_TOKEN` - Mapas (alternativo)
- [ ] `MAPBOX_PUBLIC_TOKEN` - Para Edge Functions
- [ ] `VITE_OPENWEATHER_API_KEY` - Clima (frontend)
- [ ] `OPENWEATHER_API_KEY` - Clima (backend)
- [ ] `VITE_EMBED_ACCESS_TOKEN` - Proteção de embeds
- [ ] `ADMIN_EMAIL` - Email do administrador
- [ ] `EMAIL_FROM` - Email de envio

### 3. 🔧 Optional Variables (conforme necessário)
- [ ] Amadeus (viagens)
- [ ] ElevenLabs (voz)
- [ ] Slack/Telegram (notificações)
- [ ] Marine Traffic (rastreamento)
- [ ] Feature flags

### 4. 🗄️ Supabase Edge Functions Secrets
Configure via CLI: `supabase secrets set KEY=value`

```bash
# Instalar CLI
npm install -g supabase

# Login e link
supabase login
supabase link --project-ref SEU_PROJECT_ID

# Configurar secrets
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set ADMIN_EMAIL=admin@empresa.com
supabase secrets set OPENWEATHER_API_KEY=...
supabase secrets set MAPBOX_PUBLIC_TOKEN=pk.eyJ...
```

### 5. 🧪 Build & Tests
```bash
# Install dependencies
npm install

# Run tests
npm run test

# Build production bundle
npm run build

# Verificar tamanho do bundle (deve ser < 8MB)
du -sh dist/
```

### 6. 📝 Code Review
- [ ] Sem `console.log()` em produção
- [ ] Sem credenciais hardcoded
- [ ] Sem TODOs críticos
- [ ] RLS policies ativas no Supabase
- [ ] CORS configurado corretamente

---

## 🚀 DEPLOYMENT OPTIONS

### Option 1: 🤖 Automatic Deploy (Recomendado)

1. **Push para branch `main`**
```bash
git add .
git commit -m "feat: descrição da mudança"
git push origin main
```

2. **Vercel deploy automático**
   - GitHub Actions detecta push
   - Build inicia automaticamente
   - Deploy em ~2-3 minutos

3. **Verificar status**
   - Acesse https://vercel.com/dashboard
   - Verifique logs em **Deployments**

### Option 2: 🖐️ Manual Deploy

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Verificar URL gerada
# https://seu-app.vercel.app
```

---

## ✅ POST-DEPLOY VALIDATION

### 1. 🌐 Site Accessibility
- [ ] Site carrega em: https://seu-app.vercel.app
- [ ] HTTPS ativo (cadeado verde)
- [ ] Sem erros 404 ou 500

### 2. 🔐 Authentication
- [ ] Login funciona corretamente
- [ ] Logout funciona
- [ ] Proteção de rotas ativa
- [ ] RLS policies funcionando

### 3. 🎨 UI/UX
- [ ] Dashboard carrega sem erros
- [ ] Todos os módulos acessíveis:
  - [ ] `/admin`
  - [ ] `/admin/templates`
  - [ ] `/admin/system-health`
  - [ ] `/admin/audit`
  - [ ] `/admin/mmi`
  - [ ] `/admin/sgso`
- [ ] Imagens carregam corretamente
- [ ] CSS aplicado corretamente

### 4. 🔌 Integrations
- [ ] Supabase conectado
- [ ] OpenAI respondendo (testar assistente)
- [ ] Sentry recebendo eventos
- [ ] Mapbox carregando mapas
- [ ] Email enviando (testar relatório)

### 5. 📊 Performance & Monitoring

```bash
# Lighthouse test
npm install -g lighthouse
lighthouse https://seu-app.vercel.app --view

# Verificar métricas:
# - Performance Score > 80
# - Accessibility Score > 90
# - Best Practices Score > 85
# - SEO Score > 85
```

- [ ] Lighthouse Performance > 80
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 4s
- [ ] Bundle size < 8MB
- [ ] Sentry dashboard funcionando

### 6. 🩺 System Health Check
- [ ] Acessar: https://seu-app.vercel.app/admin/system-health
- [ ] Verificar status de todos os serviços:
  - [ ] ✅ Supabase Database
  - [ ] ✅ Supabase Auth
  - [ ] ✅ OpenAI API
  - [ ] ✅ Mapbox
  - [ ] ✅ Sentry
  - [ ] ✅ Email Service

---

## 🐛 TROUBLESHOOTING

### 1. ❌ Build Failed
**Sintomas**: Build falha no Vercel

**Soluções**:
```bash
# Limpar cache local
rm -rf node_modules dist
npm install
npm run build

# Verificar TypeScript
npm run lint

# Verificar variáveis de ambiente
# Certifique-se que todas as REQUIRED estão configuradas
```

### 2. 🔴 Supabase Connection Error
**Sintomas**: "Failed to connect to Supabase"

**Soluções**:
- Verificar `VITE_SUPABASE_URL` está correto
- Verificar `VITE_SUPABASE_PUBLISHABLE_KEY` está correto
- Verificar RLS policies no Supabase
- Verificar CORS settings no Supabase

### 3. 🚨 Sentry Not Receiving Errors
**Sintomas**: Dashboard vazio no Sentry

**Soluções**:
- Verificar `VITE_SENTRY_DSN` está correto
- Testar erro intencional: lançar `throw new Error('Test')`
- Verificar project settings no Sentry
- Aguardar até 5 minutos para primeiro evento

### 4. 📧 Email Not Sending
**Sintomas**: Relatórios não chegam

**Soluções**:
```bash
# Verificar secrets do Supabase
supabase secrets list

# Verificar logs da Edge Function
supabase functions logs send-chart-report --tail

# Verificar dashboard do Resend
# https://resend.com/logs
```

---

## 🔄 ROLLBACK PROCEDURE

Se o deploy apresentar problemas críticos:

### 1. 🚨 Rollback via Vercel Dashboard

1. Acesse https://vercel.com/dashboard
2. Selecione o projeto
3. Vá em **Deployments**
4. Encontre o último deploy estável
5. Clique nos três pontos (...) → **Promote to Production**
6. Confirme o rollback

### 2. 🔧 Rollback via CLI

```bash
# Listar deploys
vercel ls

# Promover deploy anterior
vercel promote [deployment-url]
```

### 3. 📝 Post-Rollback
- [ ] Verificar site funcionando
- [ ] Notificar equipe
- [ ] Criar issue no GitHub
- [ ] Investigar causa raiz
- [ ] Planejar correção

---

## 📊 SUCCESS METRICS

### ✅ Deploy bem-sucedido quando:
- [x] Build completo em < 3 minutos
- [x] Todos os testes passando
- [x] Site acessível em HTTPS
- [x] Login/autenticação funcionando
- [x] System Health Check: 100% OK
- [x] Sentry recebendo eventos
- [x] Performance Score > 80
- [x] Zero erros críticos nos primeiros 15 minutos

---

## 📚 DOCUMENTATION REFERENCES

- 📘 **ENV_PRODUCTION_SETUP_GUIDE.md** - Guia completo de configuração
- 📗 **VERCEL_DEPLOYMENT_GUIDE.md** - Guia específico da Vercel
- 📙 **PRODUCTION_ENV_IMPLEMENTATION_SUMMARY.md** - Resumo da implementação
- 📕 **BEFORE_AFTER_PRODUCTION_ENV.md** - Comparação antes/depois
- 📓 **.env.production** - Template de variáveis

---

## 🎯 QUICK REFERENCE

| Task | Command |
|------|---------|
| Install | `npm install` |
| Test | `npm run test` |
| Build | `npm run build` |
| Deploy | `vercel --prod` |
| Logs | Vercel Dashboard → Deployments → Runtime Logs |
| Rollback | Vercel Dashboard → Deployments → Promote |
| Health Check | https://seu-app.vercel.app/admin/system-health |

---

**Last Updated**: 2025-10-18  
**Version**: 2.0  
**Estimated Deploy Time**: 30-60 minutos (primeira vez) | 10-15 minutos (subsequentes)
