# 🔧 Production Environment Setup Guide - Nautilus One

> **Guia completo de configuração de variáveis de ambiente para produção**  
> Passo a passo detalhado com explicações e melhores práticas

---

## 📑 Table of Contents
1. [Introdução](#introdução)
2. [Frontend vs Backend Variables](#frontend-vs-backend-variables)
3. [Quick Configuration (5 Steps)](#quick-configuration-5-steps)
4. [Detailed Variable Reference](#detailed-variable-reference)
5. [Security Best Practices](#security-best-practices)
6. [Common Problems & Solutions](#common-problems--solutions)

---

## 🎯 Introdução

Este guia explica como configurar **todas as variáveis de ambiente** necessárias para um deploy de produção bem-sucedido do Nautilus One na Vercel.

### 📊 Overview
- **Total**: 55+ variáveis documentadas
- **✅ Obrigatórias**: 14 variáveis (sistema não funciona sem elas)
- **⚡ Recomendadas**: 8 variáveis (funcionalidades importantes)
- **🔧 Opcionais**: 33+ variáveis (recursos específicos)

### 🎯 Objetivos
- ✅ Zero falhas silenciosas por falta de configuração
- ✅ Processo sistemático e reproduzível
- ✅ Segurança e melhores práticas
- ✅ Facilitar onboarding de novos desenvolvedores

---

## 🔀 Frontend vs Backend Variables

### 🌐 Frontend Variables (VITE_*)

**O que são?**
- Variáveis expostas no **bundle JavaScript** do frontend
- Acessíveis via `import.meta.env.VITE_*` no código
- **Visíveis publicamente** no browser (DevTools)

**Quando usar?**
- ✅ URLs públicas (Supabase, APIs)
- ✅ Chaves públicas (anon keys, publishable keys)
- ✅ Configurações de UI (feature flags, tenant ID)
- ✅ IDs de projeto (não são secretos)

**⚠️ NUNCA use VITE_* para:**
- ❌ API keys privadas (OpenAI, Resend)
- ❌ Service role keys
- ❌ Senhas ou tokens de autenticação
- ❌ Secrets de Edge Functions

**Exemplo correto:**
```typescript
// ✅ BOM - Chave pública
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// ❌ RUIM - Chave privada exposta!
const openaiKey = import.meta.env.VITE_OPENAI_API_KEY // NUNCA FAZER ISSO!
```

### 🔒 Backend Variables (sem prefixo)

**O que são?**
- Variáveis **não expostas** no frontend
- Acessíveis apenas em:
  - Scripts Node.js (`scripts/*.js`)
  - Build-time plugins
  - Server-side code (se houver)

**Quando usar?**
- ✅ Chaves de API privadas
- ✅ Database passwords
- ✅ Service role keys
- ✅ SMTP credentials

**Exemplo:**
```javascript
// Em scripts/weekly-report-cron.js
const supabaseKey = process.env.SUPABASE_KEY // ✅ Seguro - backend only
```

### 🔐 Supabase Edge Functions Secrets

**O que são?**
- Variáveis específicas para **Edge Functions do Supabase**
- Configuradas via CLI do Supabase
- **Totalmente isoladas** do código frontend

**Como configurar:**
```bash
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set ADMIN_EMAIL=admin@empresa.com
```

**Quando usar?**
- ✅ APIs privadas chamadas por Edge Functions
- ✅ Credenciais de serviços externos
- ✅ Tokens de autenticação

---

## ⚡ Quick Configuration (5 Steps)

### Step 1: 📋 Prepare API Keys

Obtenha as credenciais necessárias:

| Service | URL | Custo | Priority |
|---------|-----|-------|----------|
| Supabase | https://app.supabase.com | Grátis até 500MB | ✅ REQUIRED |
| OpenAI | https://platform.openai.com | ~$0.002/1K tokens | ✅ REQUIRED |
| Sentry | https://sentry.io | Grátis até 5K eventos/mês | ✅ REQUIRED |
| Resend | https://resend.com | Grátis até 100 emails/dia | ✅ REQUIRED |
| Mapbox | https://account.mapbox.com | Grátis até 50K loads/mês | ⚡ RECOMMENDED |
| OpenWeather | https://openweathermap.org | Grátis até 60 calls/min | ⚡ RECOMMENDED |

### Step 2: 🚀 Configure Vercel Variables

1. Acesse https://vercel.com/dashboard
2. Selecione o projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione as variáveis **OBRIGATÓRIAS**:

```bash
# Supabase (5 vars)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
VITE_SUPABASE_PROJECT_ID=seu-projeto-id
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

# OpenAI (1 var)
VITE_OPENAI_API_KEY=sk-proj-...

# Sentry (4 vars)
VITE_SENTRY_DSN=https://your-sentry-dsn@o0.ingest.sentry.io/0000000
SENTRY_ORG=your-organization
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token

# Resend (1 var)
RESEND_API_KEY=re_...

# System (3 vars)
VITE_APP_URL=https://seu-app.vercel.app
VITE_NODE_ENV=production
VITE_APP_NAME=Nautilus One
```

5. Clique em **Save** para cada variável
6. Selecione **Production** environment

### Step 3: 🔐 Configure Supabase Secrets

```bash
# 1. Instalar CLI (se ainda não tiver)
npm install -g supabase

# 2. Login
supabase login

# 3. Linkar projeto
supabase link --project-ref SEU_PROJECT_ID

# 4. Configurar secrets obrigatórios
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set ADMIN_EMAIL=admin@empresa.com

# 5. (Opcional) Configurar secrets recomendados
supabase secrets set OPENWEATHER_API_KEY=...
supabase secrets set MAPBOX_PUBLIC_TOKEN=pk.eyJ...

# 6. Verificar
supabase secrets list
```

### Step 4: ✅ Validate Configuration

```bash
# Local validation
npm install
npm run build
npm run test

# Deploy
git push origin main

# Wait for Vercel deploy (~2-3 min)
```

### Step 5: 🩺 Health Check

1. Acesse: https://seu-app.vercel.app/admin/system-health
2. Verifique status de todos os serviços
3. Todos devem estar ✅ verde

---

## 📖 Detailed Variable Reference

### 🔐 Supabase (5 variables - REQUIRED)

#### VITE_SUPABASE_URL
- **Tipo**: Frontend (público)
- **Obrigatória**: ✅ Sim
- **Exemplo**: `https://xyzcompany.supabase.co`
- **Onde obter**: Supabase Dashboard → Settings → API → Project URL

#### VITE_SUPABASE_PUBLISHABLE_KEY
- **Tipo**: Frontend (público)
- **Obrigatória**: ✅ Sim
- **Nome correto**: `PUBLISHABLE_KEY` (não `ANON_KEY`)
- **Exemplo**: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...`
- **Onde obter**: Supabase Dashboard → Settings → API → anon public

#### VITE_SUPABASE_PROJECT_ID
- **Tipo**: Frontend (público)
- **Obrigatória**: ✅ Sim
- **Exemplo**: `xyzcompany`
- **Onde obter**: Extrai da URL (antes de `.supabase.co`)

#### SUPABASE_URL + SUPABASE_KEY
- **Tipo**: Backend (privado)
- **Obrigatória**: ✅ Sim
- **Uso**: Scripts Node.js (weekly-report, etc.)
- **Valores**: Mesmos que as versões VITE_*

### 🤖 OpenAI (1 variable - REQUIRED)

#### VITE_OPENAI_API_KEY
- **Tipo**: Frontend (⚠️ público mas necessário para client-side AI)
- **Obrigatória**: ✅ Sim
- **Exemplo**: `sk-proj-...`
- **Onde obter**: https://platform.openai.com/api-keys
- **Custo**: ~$0.002 por 1K tokens (GPT-4o-mini)
- **⚠️ Segurança**: 
  - Configure rate limits no OpenAI dashboard
  - Monitore uso via OpenAI dashboard
  - Use usage limits por usuário no código

### 🚨 Sentry (4 variables - REQUIRED)

#### VITE_SENTRY_DSN
- **Tipo**: Frontend (público)
- **Obrigatória**: ✅ Sim
- **Exemplo**: `https://abc123@o0.ingest.sentry.io/123456`
- **Onde obter**: Sentry → Settings → Projects → Client Keys (DSN)

#### SENTRY_ORG
- **Tipo**: Build-time
- **Obrigatória**: ✅ Sim
- **Exemplo**: `nautilus-ai`
- **Onde obter**: Sentry URL: https://sentry.io/organizations/`nautilus-ai`/

#### SENTRY_PROJECT
- **Tipo**: Build-time
- **Obrigatória**: ✅ Sim
- **Exemplo**: `nautilus-one`
- **Onde obter**: Sentry project slug

#### SENTRY_AUTH_TOKEN
- **Tipo**: Build-time (privado)
- **Obrigatória**: ✅ Sim
- **Exemplo**: `sntrys_...`
- **Onde obter**: Sentry → Settings → Auth Tokens → Create Token
- **Permissions**: `project:releases`, `project:write`

### 📤 Resend (1 variable - REQUIRED)

#### RESEND_API_KEY
- **Tipo**: Backend + Edge Functions
- **Obrigatória**: ✅ Sim
- **Exemplo**: `re_123456789...`
- **Onde obter**: https://resend.com/api-keys
- **Configure em 2 lugares**:
  1. Vercel: `RESEND_API_KEY=re_...`
  2. Supabase: `supabase secrets set RESEND_API_KEY=re_...`

### 🗺️ Mapbox (3 variables - RECOMMENDED)

#### VITE_MAPBOX_ACCESS_TOKEN + VITE_MAPBOX_TOKEN
- **Tipo**: Frontend (público)
- **Obrigatória**: ⚡ Recomendada
- **Exemplo**: `pk.eyJ1IjoibmF1dGlsdXMiLCJhIjoiY2x...`
- **Onde obter**: https://account.mapbox.com/access-tokens/
- **Nota**: Ambas podem ter o mesmo valor

#### MAPBOX_PUBLIC_TOKEN
- **Tipo**: Edge Functions
- **Obrigatória**: ⚡ Recomendada
- **Configure**: `supabase secrets set MAPBOX_PUBLIC_TOKEN=pk.eyJ...`

### 🌤️ OpenWeather (2 variables - RECOMMENDED)

#### VITE_OPENWEATHER_API_KEY
- **Tipo**: Frontend (público)
- **Obrigatória**: ⚡ Recomendada
- **Onde obter**: https://openweathermap.org/api

#### OPENWEATHER_API_KEY
- **Tipo**: Edge Functions
- **Obrigatória**: ⚡ Recomendada
- **Configure**: `supabase secrets set OPENWEATHER_API_KEY=...`

### ⚙️ System Configuration (3 variables - REQUIRED)

#### VITE_APP_URL
- **Tipo**: Frontend (público)
- **Obrigatória**: ✅ Sim
- **Exemplo**: `https://nautilus-one.vercel.app`
- **Uso**: Base URL para links, redirects, etc.

#### VITE_NODE_ENV
- **Tipo**: Frontend (público)
- **Obrigatória**: ✅ Sim
- **Valor**: `production` (sempre)
- **Uso**: Conditional rendering, feature flags

#### VITE_APP_NAME
- **Tipo**: Frontend (público)
- **Obrigatória**: ✅ Sim
- **Exemplo**: `Nautilus One`
- **Uso**: Branding, page titles

### 🔒 Embed Access Token (1 variable - RECOMMENDED)

#### VITE_EMBED_ACCESS_TOKEN
- **Tipo**: Frontend (público mas usado para auth)
- **Obrigatória**: ⚡ Recomendada
- **Gerar**: `openssl rand -base64 32`
- **Uso**: Proteger rotas `/embed/*`

---

## 🔐 Security Best Practices

### ✅ DO's

1. **✅ Use VITE_* apenas para dados públicos**
```typescript
// ✅ BOM
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID
```

2. **✅ Configure rate limits**
- OpenAI: Limite de $10/mês no início
- Supabase: Database quotas e RLS policies
- Resend: Limite de 100 emails/dia na versão grátis

3. **✅ Rotacione chaves regularmente**
- A cada 90 dias (recomendado)
- Imediatamente após suspeita de vazamento
- Quando um desenvolvedor sai da equipe

4. **✅ Use Sentry para monitoramento**
```typescript
Sentry.captureException(error)
Sentry.captureMessage('API rate limit reached')
```

5. **✅ Valide variáveis na inicialização**
```typescript
if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_URL is required')
}
```

### ❌ DON'Ts

1. **❌ NUNCA commite valores reais**
```bash
# ❌ RUIM
git add .env
git add .env.local

# ✅ BOM
# .env* já está no .gitignore
```

2. **❌ NUNCA use VITE_* para secrets**
```typescript
// ❌ RUIM - Expõe chave privada!
const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// ✅ BOM - Use backend variable ou Edge Function secret
```

3. **❌ NUNCA logue variáveis de ambiente**
```typescript
// ❌ RUIM
console.log('API Key:', import.meta.env.VITE_OPENAI_API_KEY)

// ✅ BOM
console.log('API Key configured:', !!import.meta.env.VITE_OPENAI_API_KEY)
```

4. **❌ NUNCA compartilhe .env files**
- Não envie por email, Slack, WhatsApp
- Use 1Password, Bitwarden, ou similar
- Configure via Vercel Dashboard diretamente

5. **❌ NUNCA reutilize chaves entre ambientes**
```bash
# ❌ RUIM - Mesma chave em dev e prod
VITE_OPENAI_API_KEY=sk-proj-...

# ✅ BOM - Chaves separadas
# Development: sk-proj-dev-...
# Production: sk-proj-prod-...
```

---

## 🐛 Common Problems & Solutions

### Problem 1: "Supabase connection failed"

**Sintomas:**
- Erro ao fazer login
- `Failed to connect to Supabase`
- Console: `SupabaseClient is not defined`

**Causas:**
- ❌ `VITE_SUPABASE_URL` não configurada
- ❌ `VITE_SUPABASE_PUBLISHABLE_KEY` não configurada
- ❌ Typo no nome da variável

**Soluções:**
```bash
# 1. Verificar variáveis no Vercel
# Dashboard → Settings → Environment Variables

# 2. Verificar valores corretos no Supabase
# Dashboard → Settings → API

# 3. Redeploy após adicionar variáveis
git commit --allow-empty -m "chore: redeploy"
git push origin main
```

### Problem 2: "OpenAI API rate limit exceeded"

**Sintomas:**
- Assistente não responde
- Console: `429 Rate Limit Exceeded`

**Causas:**
- ❌ Chave do OpenAI sem limite configurado
- ❌ Uso excessivo de tokens

**Soluções:**
```bash
# 1. Configurar limite no OpenAI dashboard
# https://platform.openai.com/account/limits

# 2. Implementar throttling no código
# Ver: src/hooks/useAIAssistant.ts

# 3. Monitorar uso via OpenAI dashboard
```

### Problem 3: "Sentry not receiving events"

**Sintomas:**
- Dashboard vazio no Sentry
- Nenhum erro capturado

**Causas:**
- ❌ `VITE_SENTRY_DSN` incorreto
- ❌ Environment não configurado
- ❌ Demora na primeira captura (~5min)

**Soluções:**
```bash
# 1. Testar captura manual
throw new Error('Test Sentry error')

# 2. Verificar DSN correto
# https://sentry.io → Settings → Client Keys

# 3. Aguardar até 5 minutos para primeiro evento

# 4. Verificar console do browser
# Deve mostrar: "[Sentry] Event sent successfully"
```

### Problem 4: "Emails not sending"

**Sintomas:**
- Relatórios não chegam
- Edge Function timeout

**Causas:**
- ❌ `RESEND_API_KEY` não configurado no Supabase
- ❌ Email remetente não verificado no Resend
- ❌ Limite de 100 emails/dia atingido

**Soluções:**
```bash
# 1. Verificar secrets no Supabase
supabase secrets list

# 2. Configurar se não existir
supabase secrets set RESEND_API_KEY=re_...

# 3. Verificar domínio no Resend
# https://resend.com/domains

# 4. Ver logs da Edge Function
supabase functions logs send-chart-report --tail
```

### Problem 5: "Map not loading (Mapbox)"

**Sintomas:**
- Mapa em branco
- Console: `Mapbox token missing`

**Causas:**
- ❌ `VITE_MAPBOX_ACCESS_TOKEN` não configurado
- ❌ Token expirado
- ❌ Quota excedida (50K loads/mês grátis)

**Soluções:**
```bash
# 1. Verificar token
# https://account.mapbox.com/access-tokens/

# 2. Verificar uso
# https://account.mapbox.com/usage

# 3. Criar novo token se necessário
# Scope: Public (read-only)
```

---

## 📚 Additional Resources

- 📘 **DEPLOY_CHECKLIST.md** - Checklist rápido
- 📗 **VERCEL_DEPLOYMENT_GUIDE.md** - Guia Vercel
- 📙 **PRODUCTION_ENV_IMPLEMENTATION_SUMMARY.md** - Estatísticas
- 📓 **.env.production** - Template completo

---

## 🆘 Need Help?

1. ✅ Consulte este guia primeiro
2. ✅ Verifique `/admin/system-health`
3. ✅ Confira logs no Vercel Dashboard
4. ✅ Revise logs no Sentry
5. ✅ Consulte Supabase Edge Function logs
6. ✅ Abra issue no GitHub com logs relevantes

---

**Last Updated**: 2025-10-18  
**Version**: 2.0  
**Author**: Nautilus One Team
