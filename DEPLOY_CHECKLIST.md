# 🚀 Checklist de Deploy para Produção - Nautilus One

> **Guia rápido** para desenvolvedores experientes que precisam fazer deploy rápido para produção.
> 
> Para um guia completo e detalhado, veja [ENV_PRODUCTION_SETUP_GUIDE.md](./ENV_PRODUCTION_SETUP_GUIDE.md)

---

## ✅ PRÉ-DEPLOY (5-10 minutos)

### 1. Verificação Local

```bash
# Clone ou pull das últimas alterações
git pull origin main

# Instale dependências
npm install

# Execute testes
npm test

# Execute lint
npm run lint

# Build local para verificar erros
npm run build

# Verifique script de produção
npm run verify:production
```

**Resultado esperado:**
- ✅ Todos os testes passando
- ✅ Build sem erros
- ✅ Lint sem warnings críticos
- ✅ Verificação de produção OK

### 2. Verifique Variáveis Obrigatórias

Use `.env.production` como referência. Mínimo obrigatório:

- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY`
- [ ] `VITE_SUPABASE_PROJECT_ID`
- [ ] `VITE_SENTRY_DSN`
- [ ] `VITE_APP_URL` (com URL real de produção)
- [ ] `VITE_NODE_ENV=production`

**Recomendado adicionar:**
- [ ] `VITE_OPENAI_API_KEY` (para IA)
- [ ] `VITE_MAPBOX_ACCESS_TOKEN` (para mapas)
- [ ] `VITE_OPENWEATHER_API_KEY` (para clima)

### 3. Verifique Supabase

```bash
# Login no Supabase CLI
supabase login

# Link ao projeto
supabase link --project-ref seu-projeto-id

# Verifique migrations
supabase db remote list

# Verifique Edge Functions
supabase functions list
```

**Checklist Supabase:**
- [ ] Projeto criado e configurado
- [ ] Migrations aplicadas
- [ ] RLS (Row Level Security) ativado
- [ ] Edge Functions deployadas
- [ ] Secrets configurados (se usar Edge Functions)

---

## 🚀 DEPLOY (5 minutos)

### Opção 1: Deploy Automático via GitHub (Recomendado)

```bash
# Commit e push para main
git add .
git commit -m "feat: ready for production"
git push origin main

# GitHub Actions fará automaticamente:
# 1. Run tests
# 2. Build
# 3. Deploy para Vercel
```

**Vantagens:**
- ✅ Testes automáticos antes do deploy
- ✅ Build verificado
- ✅ Histórico de deploys
- ✅ Rollback fácil

### Opção 2: Deploy Manual via Vercel Dashboard

1. Acesse https://vercel.com/new
2. Selecione repositório `RodrigoSC89/travel-hr-buddy`
3. Configure Framework: **Vite**
4. Adicione variáveis de ambiente (Settings → Environment Variables)
5. Clique em **Deploy**

### Opção 3: Deploy via CLI

```bash
# Instale Vercel CLI (se ainda não instalou)
npm install -g vercel

# Login
vercel login

# Deploy de produção
npm run deploy:vercel
```

---

## 🔧 CONFIGURAÇÃO DE VARIÁVEIS NO VERCEL

### Via Dashboard (Recomendado para primeiro deploy)

1. **Acesse:** https://vercel.com/dashboard
2. **Selecione:** Seu projeto Nautilus One
3. **Vá para:** Settings → Environment Variables
4. **Adicione:** Cada variável do `.env.production`
   - **Key:** Nome da variável (ex: `VITE_SUPABASE_URL`)
   - **Value:** Valor real (sem aspas)
   - **Environment:** Selecione "Production"

### Via CLI (Para atualizações rápidas)

```bash
# Adicionar variável
vercel env add VITE_SUPABASE_URL production

# Listar variáveis
vercel env ls

# Puxar variáveis localmente (para debug)
vercel env pull .env.vercel
```

### Configurar Secrets do Supabase (Edge Functions)

```bash
# Secrets necessários para Edge Functions
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set ADMIN_EMAIL=admin@empresa.com
supabase secrets set OPENWEATHER_API_KEY=...
supabase secrets set MAPBOX_PUBLIC_TOKEN=pk.eyJ...

# Verificar secrets
supabase secrets list
```

---

## ✅ PÓS-DEPLOY (5 minutos)

### 1. Verificação Básica

- [ ] Deploy completo sem erros
- [ ] Build time < 3 minutos
- [ ] Bundle size < 7MB

### 2. Teste Funcional

Acesse sua URL de produção e verifique:

- [ ] **Homepage carrega:** https://seu-app.vercel.app
- [ ] **Health check OK:** https://seu-app.vercel.app/admin/system-health
  - ✅ Sistema operacional
  - ✅ Variáveis essenciais OK
  - ⚠️ Variáveis opcionais (pode ter warnings)
- [ ] **Login funciona:** Teste autenticação
- [ ] **Dashboard carrega:** Acesse dashboard principal
- [ ] **Módulos principais:** Teste 2-3 módulos críticos

### 3. Performance & Monitoring

```bash
# Lighthouse (Chrome DevTools)
# Target: Score > 80 em todas as categorias
```

- [ ] **Lighthouse Performance:** > 80
- [ ] **Lighthouse Accessibility:** > 90
- [ ] **Lighthouse Best Practices:** > 90
- [ ] **Lighthouse SEO:** > 80

**Verifique Sentry:**
- [ ] Acesse https://sentry.io
- [ ] Selecione projeto Nautilus One
- [ ] Confirme que está recebendo eventos
- [ ] Force um erro de teste para validar

**Logs da Vercel:**
- [ ] Acesse Dashboard → Deployments → Último deploy
- [ ] Verifique logs sem erros críticos
- [ ] Verifique Function Logs (se usar)

### 4. Notificações (Opcional)

Se configurou Slack/Telegram:
- [ ] Webhook funcionando
- [ ] Recebendo notificações de build
- [ ] Alertas de erro chegando

---

## 🐛 TROUBLESHOOTING RÁPIDO

### Build Falhando

```bash
# Limpar e rebuildar
rm -rf node_modules dist
npm install
npm run build
```

**Causas comuns:**
- Versão do Node incorreta (precisa 22.x, mas 20.x funciona)
- Dependências desatualizadas
- Erros de TypeScript
- Variáveis de ambiente faltando

### Variáveis Não Funcionam

**Checklist:**
- [ ] Variável começa com `VITE_` (para frontend)
- [ ] Sem espaços extras antes/depois do valor
- [ ] Redeployar após adicionar variáveis novas
- [ ] Limpar cache: Vercel Dashboard → Deployments → Redeploy

### Site Carrega mas com Erros

**Verificar:**
1. Console do browser (F12) para erros JavaScript
2. Network tab para falhas de API
3. Sentry para stack traces
4. Logs da Vercel para erros de backend

**Soluções comuns:**
```bash
# Verificar Supabase conectado
curl https://seu-projeto.supabase.co/rest/v1/

# Verificar variáveis expostas
# No console do browser:
console.log(import.meta.env)
```

### Edge Functions Falhando

```bash
# Ver logs
supabase functions logs nome-da-funcao --tail

# Testar localmente
supabase functions serve nome-da-funcao

# Verificar secrets
supabase secrets list
```

### Performance Baixa

**Quick fixes:**
- [ ] Ativar compression no Vercel
- [ ] Verificar bundle size: `npm run build`
- [ ] Lazy loading para componentes pesados
- [ ] Otimizar imagens
- [ ] Verificar cache headers

---

## 🔄 ROLLBACK RÁPIDO

### Se algo der errado após deploy:

**Via Vercel Dashboard (1 minuto):**
1. Dashboard → Deployments
2. Encontre último deploy estável
3. Três pontos → "Promote to Production"

**Via Git (2 minutos):**
```bash
git revert HEAD
git push origin main
# Aguarde deploy automático
```

---

## 📊 MÉTRICAS DE SUCESSO

Seu deploy foi bem-sucedido se:

- ✅ **Build Time:** < 3 minutos
- ✅ **Bundle Size:** < 7MB
- ✅ **Lighthouse Score:** > 80
- ✅ **Response Time:** < 500ms
- ✅ **Uptime:** 99.9%+
- ✅ **Zero Critical Errors:** No Sentry
- ✅ **Tests Passing:** 100%

---

## 📚 DOCUMENTAÇÃO RELACIONADA

Para mais detalhes, consulte:

- **[ENV_PRODUCTION_SETUP_GUIDE.md](./ENV_PRODUCTION_SETUP_GUIDE.md)** - Guia completo e detalhado
- **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)** - Guia específico do Vercel
- **[ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)** - Documentação de todas as variáveis
- **[PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)** - Guia passo-a-passo completo
- **[.env.production](./.env.production)** - Template de variáveis de ambiente

---

## 🆘 PRECISA DE AJUDA?

1. **Logs da Vercel:** https://vercel.com/dashboard
2. **Logs do Supabase:** `supabase functions logs --tail`
3. **Erros em Tempo Real:** https://sentry.io
4. **Troubleshooting Completo:** Ver VERCEL_DEPLOYMENT_GUIDE.md seção Troubleshooting
5. **Issues no GitHub:** https://github.com/RodrigoSC89/travel-hr-buddy/issues

---

**✨ Bom deploy! Em caso de dúvidas, consulte a documentação completa.**

---

📅 **Última Atualização:** 2025-10-18  
📌 **Versão:** 1.0.0  
🏷️ **Projeto:** Nautilus One
