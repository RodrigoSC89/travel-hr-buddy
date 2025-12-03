# 🚀 DEPLOY CHECKLIST - Nautilus One

**Status**: ✅ PRONTO PARA DEPLOY (15 minutos)

**Data**: Novembro 2025  
**Projeto**: travel-hr-buddy (Nautilus One)  
**Target**: Vercel (Frontend) + Supabase (Backend/Edge Functions)

---

## ✅ PRÉ-REQUISITOS (JÁ COMPLETO)

### **Build Status** ✅
- [x] Build passa sem erros críticos
- [x] TypeScript compilation: 57s, 188 chunks
- [x] Warnings: 7 arquivos com `@ts-nocheck` (não bloqueia deploy)
- [x] 250+ módulos implementados
- [x] 377+ rotas funcionais

### **Configuração** ✅
- [x] `vercel.json` configurado
- [x] Headers de segurança (CSP, CORS, X-Frame-Options)
- [x] PWA service worker
- [x] `.env.example` documentado
- [x] Supabase project: `vnbptmixvwropvanyhdb`

### **Código** ✅
- [x] Componentes React funcionais
- [x] State management (Zustand)
- [x] Routing (React Router)
- [x] API integration (Supabase)
- [x] Edge Functions criadas (6 functions)

---

## 🎯 DEPLOY WORKFLOW (15 minutos)

### **PASSO 1: Deploy Frontend no Vercel** ⏱️ 5 min

#### **1.1. Conectar Repositório**

```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Login
vercel login

# Link do projeto (primeira vez)
vercel link
```

**Prompts**:
- Set up and deploy: `Y`
- Scope: `[seu username/org]`
- Link to existing project: `N` (se primeira vez)
- Project name: `nautilus-one` (ou `travel-hr-buddy`)
- Directory: `./` (raiz)
- Override settings: `N`

#### **1.2. Configurar Environment Variables**

**Via CLI**:
```bash
# Supabase URL
vercel env add VITE_SUPABASE_URL production
# Valor: https://vnbptmixvwropvanyhdb.supabase.co

# Supabase Anon Key
vercel env add VITE_SUPABASE_ANON_KEY production
# Valor: [sua anon key do Supabase]

# Supabase Project ID
vercel env add VITE_SUPABASE_PROJECT_ID production
# Valor: vnbptmixvwropvanyhdb

# MQTT URL
vercel env add VITE_MQTT_URL production
# Valor: wss://broker.hivemq.com:8884/mqtt

# Client Metrics
vercel env add VITE_ENABLE_CLIENT_METRICS production
# Valor: false

# DP ASOG Service (opcional - se tiver rodando)
vercel env add VITE_DP_ASOG_SERVICE_URL production
# Valor: https://your-dp-asog-server.com:8000
```

**Ou via Dashboard**:
1. Acesse https://vercel.com/dashboard
2. Selecione o projeto
3. Settings → Environment Variables
4. Adicione cada variável acima

#### **1.3. Deploy**

```bash
# Deploy para produção
vercel --prod

# Ou simplesmente (vai perguntar se é prod)
vercel
```

**Output esperado**:
```
Deploying...
✓ Deployment ready [57s]
🔍 Inspect: https://vercel.com/...
✅ Production: https://nautilus-one.vercel.app
```

---

### **PASSO 2: Deploy Edge Functions no Supabase** ⏱️ 5 min

#### **2.1. Login e Link**

```bash
# Login no Supabase
npx supabase login

# Link ao projeto
npx supabase link --project-ref vnbptmixvwropvanyhdb
```

**Prompts**:
- Database password: `[sua senha do Supabase]`

#### **2.2. Deploy Edge Functions**

```bash
# Deploy TODAS as functions de uma vez
npx supabase functions deploy --no-verify-jwt

# Ou uma por uma (se preferir)
npx supabase functions deploy generate-drill-evaluation --no-verify-jwt
npx supabase functions deploy generate-drill-scenario --no-verify-jwt
npx supabase functions deploy generate-report --no-verify-jwt
npx supabase functions deploy generate-scheduled-tasks --no-verify-jwt
npx supabase functions deploy generate-training-explanation --no-verify-jwt
npx supabase functions deploy generate-training-quiz --no-verify-jwt

# Se tiver DP ASOG integration
npx supabase functions deploy space-weather-status --no-verify-jwt
```

**Output esperado**:
```
Deploying function: generate-drill-evaluation
✓ Function deployed successfully
URL: https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/generate-drill-evaluation

Deploying function: generate-drill-scenario
✓ Function deployed successfully
URL: https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/generate-drill-scenario

... (6 functions total)
```

#### **2.3. Configurar Environment Variables (Edge Functions)**

```bash
# OpenAI API Key (se usar AI)
npx supabase secrets set OPENAI_API_KEY=sk-...

# DP ASOG Service URL (se usar)
npx supabase secrets set DP_ASOG_SERVICE_URL=http://your-server:8000

# Outras secrets (se necessário)
npx supabase secrets set SMTP_HOST=smtp.gmail.com
npx supabase secrets set SMTP_USER=seu-email@gmail.com
npx supabase secrets set SMTP_PASS=senha-app
```

**Verificar secrets**:
```bash
npx supabase secrets list
```

---

### **PASSO 3: Testes Pós-Deploy** ⏱️ 5 min

#### **3.1. Acesso à Aplicação**

```bash
# Abrir URL de produção
start https://nautilus-one.vercel.app

# Ou ver status
vercel ls
```

**Checklist**:
- [ ] Homepage carrega
- [ ] Login funciona
- [ ] Dashboard acessível
- [ ] Navegação entre módulos

#### **3.2. Testar Edge Functions**

```bash
# Teste manual (curl)
curl -X POST https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/generate-drill-scenario -H "Content-Type: application/json" -H "Authorization: Bearer [sua-anon-key]" -d '{\"vessel_type\": \"tanker\", \"scenario_type\": \"fire\"}'

# Deve retornar JSON com scenario gerado
```

**Checklist**:
- [ ] Edge functions respondem (status 200)
- [ ] JSON válido retornado
- [ ] Logs sem erros críticos

#### **3.3. Testar Funcionalidades Principais**

**Via Browser (manual)**:
1. Login com usuário de teste
2. Acessar Dashboard
3. Navegar pelos módulos:
   - [ ] Emergency Response
   - [ ] ASOG (Admin)
   - [ ] Training
   - [ ] Drills
   - [ ] Reports
4. Testar uma operação de escrita (criar drill, etc.)
5. Verificar se dados persistem

---

## 📊 RESUMO DE URLs

### **Frontend (Vercel)**
- **Production**: https://nautilus-one.vercel.app
- **Preview**: https://nautilus-one-[hash].vercel.app (auto-deploy em PRs)
- **Dashboard**: https://vercel.com/[seu-user]/nautilus-one

### **Backend (Supabase)**
- **Project**: https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb
- **API URL**: https://vnbptmixvwropvanyhdb.supabase.co
- **Edge Functions**: https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/[function-name]

### **Database**
- **Connection**: `postgresql://postgres:[password]@db.vnbptmixvwropvanyhdb.supabase.co:5432/postgres`
- **Dashboard**: https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/editor

---

## 🔧 TROUBLESHOOTING

### **Erro: "Deployment failed to build"**

```bash
# Verificar build local
npm run build

# Se passar local, limpar cache Vercel
vercel --force
```

### **Erro: "Edge function timeout"**

```bash
# Ver logs
npx supabase functions logs generate-drill-scenario

# Aumentar timeout (se necessário - em supabase/functions/[name]/index.ts)
# Adicionar no handler:
serve(handler, { timeout: 60 }) // 60 segundos
```

### **Erro: "CORS policy blocked"**

Verificar `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PUT,DELETE,OPTIONS" }
      ]
    }
  ]
}
```

### **Erro: "Environment variable not found"**

```bash
# Verificar env vars no Vercel
vercel env ls

# Re-adicionar se necessário
vercel env add VITE_SUPABASE_URL production
```

### **Edge Function retorna 401 Unauthorized**

```bash
# Verificar JWT verification
# Em supabase/functions/[name]/index.ts:
# Se não precisa de auth, adicionar:
serve(handler, { jwt: false })
```

---

## ⚠️ MELHORIAS PÓS-DEPLOY (NÃO BLOQUEIAM)

### **Curto Prazo (1 semana)**

- [ ] Remover `@ts-nocheck` (7 arquivos)
  - `src/components/admin/AdminAlertasPanel.tsx`
  - `src/components/admin/AdminDashboard.tsx`
  - Etc.
  - **Tempo**: 2-4 horas
  - **Benefício**: Type safety melhorado

- [ ] Testes E2E (Playwright)
  - Login flow
  - Dashboard navigation
  - CRUD operations
  - **Tempo**: 1 dia
  - **Benefício**: Confiança em deploys

- [ ] Monitoring
  - Verificar Sentry configurado
  - Adicionar custom events
  - Dashboard de métricas
  - **Tempo**: 2 horas
  - **Benefício**: Visibilidade de erros

### **Médio Prazo (1 mês)**

- [ ] Auditoria de Segurança
  - RLS policies no Supabase
  - CORS fine-tuning
  - Rate limiting
  - **Tempo**: 1 dia
  - **Benefício**: Segurança robusta

- [ ] Performance Optimization
  - Code splitting otimizado
  - Image optimization
  - Lazy loading
  - **Tempo**: 2 dias
  - **Benefício**: Faster loads

- [ ] CI/CD Pipeline
  - GitHub Actions
  - Auto-deploy em merge
  - Tests automáticos
  - **Tempo**: 1 dia
  - **Benefício**: Deploy contínuo

### **Longo Prazo (3 meses)**

- [ ] Internacionalização (i18n)
- [ ] Accessibility audit (WCAG)
- [ ] Mobile app (React Native)
- [ ] Offline-first PWA completo

---

## 📋 CHECKLIST FINAL

### **Pré-Deploy**
- [x] Build passa sem erros críticos
- [x] Variáveis de ambiente documentadas
- [x] Edge functions criadas
- [x] `vercel.json` configurado

### **Deploy**
- [ ] Vercel CLI instalado
- [ ] Repositório linkado no Vercel
- [ ] Environment variables configuradas
- [ ] `vercel --prod` executado com sucesso
- [ ] Supabase CLI instalado
- [ ] Projeto linkado (`supabase link`)
- [ ] Edge functions deployadas (`supabase functions deploy`)
- [ ] Secrets configurados (`supabase secrets set`)

### **Pós-Deploy**
- [ ] URL de produção acessível
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Módulos principais funcionais
- [ ] Edge functions respondem
- [ ] Logs sem erros críticos
- [ ] Monitoring ativo (Sentry)

---

## 🎉 CONCLUSÃO

**Tempo total estimado**: **15 minutos**

1. **Deploy Vercel**: 5 min
2. **Deploy Supabase**: 5 min
3. **Testes**: 5 min

**Status**: ✅ **SISTEMA PRONTO PARA PRODUÇÃO**

Os 7 arquivos com `@ts-nocheck` **NÃO impedem o deploy**. São warnings de tipos profundos que podem ser resolvidos em iterações futuras.

---

## 📞 SUPORTE

**Se algo falhar**:
1. Verificar logs: `vercel logs` e `npx supabase functions logs [function-name]`
2. Re-executar build: `npm run build`
3. Limpar cache: `vercel --force`
4. Consultar docs:
   - Vercel: https://vercel.com/docs
   - Supabase: https://supabase.com/docs

---

## 🚀 COMANDOS RÁPIDOS (COLA E EXECUTA)

```bash
# === DEPLOY COMPLETO (COPIE TUDO) ===

# 1. Vercel
vercel login
vercel link
vercel env add VITE_SUPABASE_URL production
# [Cole: https://vnbptmixvwropvanyhdb.supabase.co]
vercel env add VITE_SUPABASE_ANON_KEY production
# [Cole sua anon key]
vercel env add VITE_SUPABASE_PROJECT_ID production
# [Cole: vnbptmixvwropvanyhdb]
vercel env add VITE_MQTT_URL production
# [Cole: wss://broker.hivemq.com:8884/mqtt]
vercel --prod

# 2. Supabase
npx supabase login
npx supabase link --project-ref vnbptmixvwropvanyhdb
npx supabase functions deploy --no-verify-jwt

# 3. Testar
start https://nautilus-one.vercel.app
```

---

**Nautilus One - Deploy Checklist**  
*Versão 1.0 - Novembro 2025*  
*Ready for Production* ✅🚀
