# 📘 Guia Completo de Configuração de Produção - Nautilus One

> **Guia detalhado** para configurar todas as variáveis de ambiente necessárias para produção.
> 
> Para um checklist rápido, veja [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)

---

## 📋 Índice

1. [Introdução](#-introdução)
2. [Diferença: Frontend vs Backend](#-diferença-frontend-vs-backend)
3. [Por que VITE_* em vez de NEXT_PUBLIC_*?](#-por-que-vite_-em-vez-de-next_public_)
4. [Guia Rápido de 5 Passos](#-guia-rápido-de-5-passos)
5. [Configuração Detalhada por Categoria](#-configuração-detalhada-por-categoria)
6. [Melhores Práticas de Segurança](#-melhores-práticas-de-segurança)
7. [Problemas Comuns e Soluções](#-problemas-comuns-e-soluções)
8. [Validação e Testes](#-validação-e-testes)

---

## 🎯 Introdução

Este guia explica **como e por que** configurar cada variável de ambiente para o deploy em produção do Nautilus One.

### O que você vai aprender:

- ✅ Quais variáveis são obrigatórias vs opcionais
- ✅ Como obter cada API key necessária
- ✅ Diferença entre variáveis frontend e backend
- ✅ Como configurar no Vercel e Supabase
- ✅ Melhores práticas de segurança
- ✅ Como validar a configuração

### Tempo estimado:

- **Configuração mínima (essencial):** 15-20 minutos
- **Configuração completa (todas features):** 1-2 horas

---

## 🔄 Diferença: Frontend vs Backend

### Variáveis Frontend (VITE_*)

**Características:**
- ✅ Começam com `VITE_`
- ✅ São expostas no código JavaScript do browser
- ✅ Usuários podem ver via DevTools
- ✅ Configuradas no Vercel Dashboard

**Exemplos:**
```bash
VITE_SUPABASE_URL=https://projeto.supabase.co
VITE_OPENAI_API_KEY=sk-proj-...
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ...
```

**⚠️ NUNCA exponha secrets sensíveis com VITE_:**
- ❌ Service Role Keys
- ❌ Senhas de admin
- ❌ Tokens com permissões totais

### Variáveis Backend (SEM prefixo)

**Características:**
- ✅ NÃO têm prefixo `VITE_`
- ✅ Apenas acessíveis no servidor/build
- ✅ Nunca expostas ao browser
- ✅ Configuradas via Supabase CLI ou Vercel (build-time)

**Exemplos:**
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # NUNCA use VITE_
EMAIL_PASS=senha_segura           # NUNCA use VITE_
RESEND_API_KEY=re_...             # NUNCA use VITE_
```

**Usado em:**
- Scripts Node.js locais
- Supabase Edge Functions
- Build-time configuration

---

## 🚀 Por que VITE_* em vez de NEXT_PUBLIC_*?

### Este é um projeto Vite, NÃO Next.js

**Importante entender:**
- ❌ **NEXT_PUBLIC_*** é para Next.js
- ✅ **VITE_*** é para Vite (framework deste projeto)

**Por que essa confusão?**

O problema mencionado na issue original citava `NEXT_PUBLIC_*`, mas após análise do projeto:
- `package.json` usa `"build": "vite build"`
- `vite.config.ts` existe (configuração do Vite)
- Framework: **Vite + React** (não Next.js)

**Conclusão:**
```bash
# ❌ ERRADO (Next.js)
NEXT_PUBLIC_SUPABASE_URL=...

# ✅ CORRETO (Vite)
VITE_SUPABASE_URL=...
```

---

## ⚡ Guia Rápido de 5 Passos

### Passo 1: Supabase (Obrigatório - 5 min)

```bash
# 1. Acesse: https://supabase.com/dashboard
# 2. Crie/selecione seu projeto
# 3. Settings → API

# Copie e configure:
VITE_SUPABASE_URL=https://[seu-projeto].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=[project-id]
```

### Passo 2: Sentry (Obrigatório - 3 min)

```bash
# 1. Acesse: https://sentry.io
# 2. Crie projeto
# 3. Settings → Client Keys (DSN)

# Configure:
VITE_SENTRY_DSN=https://[key]@o[org].ingest.sentry.io/[project]
```

### Passo 3: App Config (Obrigatório - 1 min)

```bash
VITE_APP_URL=https://[seu-dominio].vercel.app
VITE_NODE_ENV=production
VITE_APP_NAME=Nautilus One
```

### Passo 4: OpenAI (Recomendado - 5 min)

```bash
# 1. Acesse: https://platform.openai.com/api-keys
# 2. Create new secret key

# Configure:
VITE_OPENAI_API_KEY=sk-proj-...
```

### Passo 5: Mapbox (Recomendado - 5 min)

```bash
# 1. Acesse: https://account.mapbox.com/
# 2. Access Tokens → Create token

# Configure:
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ...
VITE_MAPBOX_TOKEN=pk.eyJ...
```

**🎉 Pronto! Com esses 5 passos você tem uma configuração funcional.**

Para features avançadas, continue para a seção detalhada abaixo.

---

## 🗂 Configuração Detalhada por Categoria

### 1. 🔴 Essenciais (Obrigatórios)

#### 1.1 Supabase

**O que é:** Backend as a Service - Autenticação, Database, Storage

**Por que obrigatório:**
- Sistema não funciona sem banco de dados
- Autenticação depende do Supabase
- Todas as APIs usam Supabase

**Como obter:**

1. Acesse https://supabase.com/dashboard
2. Crie novo projeto ou selecione existente
3. Aguarde ~2 minutos (provisioning)
4. Vá para Settings → API
5. Copie os valores:

```bash
# Project URL
VITE_SUPABASE_URL=https://xyzabcdef.supabase.co

# anon/public key (começa com eyJ)
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Project Reference ID (está na URL)
VITE_SUPABASE_PROJECT_ID=xyzabcdef
```

**Para scripts backend:**
```bash
# Mesma URL
SUPABASE_URL=https://xyzabcdef.supabase.co

# Use anon key (OU service_role_key se precisar de permissões admin)
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 1.2 Sentry

**O que é:** Error tracking e performance monitoring

**Por que obrigatório:**
- Captura erros em produção
- Monitora performance
- Essencial para debug

**Como obter:**

1. Acesse https://sentry.io
2. Crie conta (gratuita)
3. Create Project → Choose React
4. Copie o DSN:

```bash
VITE_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/456789
```

**Opcional (para source maps):**
```bash
# Settings → Auth Tokens
SENTRY_ORG=sua-organizacao
SENTRY_PROJECT=nautilus-one
SENTRY_AUTH_TOKEN=seu-token
```

#### 1.3 App Configuration

```bash
# URL real de produção (sem trailing slash)
VITE_APP_URL=https://nautilus.vercel.app

# Sempre "production" em produção
VITE_NODE_ENV=production

# Nome da aplicação
VITE_APP_NAME=Nautilus One

# Build configuration
NODE_ENV=production
```

---

### 2. 🟡 Recomendados (Features Importantes)

#### 2.1 OpenAI (IA & Assistente)

**O que faz:**
- Chat IA
- Análise de documentos
- Classificação inteligente de incidentes
- Sugestões automáticas

**Como obter:**

1. Acesse https://platform.openai.com/api-keys
2. Crie conta ou faça login
3. Create new secret key
4. Copie (só mostra uma vez!)

```bash
VITE_OPENAI_API_KEY=sk-proj-abcd1234...
```

**💰 Custo:** Pay-as-you-go, ~$0.002 por requisição

**⚠️ Sem essa key:**
- Assistente IA não funciona
- Análise de documentos desabilitada
- Classificação manual apenas

#### 2.2 Mapbox (Mapas)

**O que faz:**
- Mapas interativos
- Tracking de embarcações
- Visualização geográfica
- Rotas de navegação

**Como obter:**

1. Acesse https://account.mapbox.com/
2. Crie conta (gratuita até 50k visualizações/mês)
3. Access Tokens → Create token
4. Copie o token público

```bash
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoic2V1dXNlciIsImEiOiJjbGV...
VITE_MAPBOX_TOKEN=pk.eyJ1Ijoic2V1dXNlciIsImEiOiJjbGV...
```

**Para Edge Functions:**
```bash
# Configurar via CLI:
supabase secrets set MAPBOX_PUBLIC_TOKEN=pk.eyJ...
```

**⚠️ Sem essa key:**
- Mapas não carregam
- Tracking de embarcações não funciona
- Módulos marítimos limitados

#### 2.3 OpenWeather (Meteorologia)

**O que faz:**
- Previsão do tempo marítimo
- Alertas meteorológicos
- Condições de navegação
- Planejamento de rotas

**Como obter:**

1. Acesse https://openweathermap.org/api
2. Crie conta
3. API Keys → Generate key
4. Aguarde ~2h (pode demorar para ativar)

```bash
# Frontend (opcional)
VITE_OPENWEATHER_API_KEY=abc123def456...

# Edge Functions (obrigatório para maritime-weather)
OPENWEATHER_API_KEY=abc123def456...
```

**💰 Custo:** Gratuito até 1000 calls/dia

**⚠️ Sem essa key:**
- Previsões meteorológicas não funcionam
- Alertas de tempo desabilitados
- Planejamento de rotas limitado

---

### 3. 🟢 Opcionais (Features Avançadas)

#### 3.1 Amadeus (Viagens)

```bash
# 1. Acesse: https://developers.amadeus.com/
# 2. Registre-se
# 3. Copie credenciais

VITE_AMADEUS_API_KEY=seu-client-id
VITE_AMADEUS_API_SECRET=seu-client-secret
```

#### 3.2 ElevenLabs (Text-to-Speech)

```bash
# 1. Acesse: https://elevenlabs.io/
# 2. Profile → API Keys

VITE_ELEVENLABS_API_KEY=seu-api-key
```

#### 3.3 Embed Token (Painéis Públicos)

```bash
# Gerar token seguro:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

VITE_EMBED_ACCESS_TOKEN=[token-gerado]
```

#### 3.4 Notificações Slack

```bash
# 1. https://api.slack.com/apps
# 2. Create App → Incoming Webhooks

VITE_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00/B00/abc123
```

#### 3.5 Notificações Telegram

```bash
# 1. Fale com @BotFather no Telegram
# 2. /newbot → siga instruções
# 3. Para chat_id: adicione bot ao grupo, use @userinfobot

VITE_TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
VITE_TELEGRAM_CHAT_ID=-1001234567890
```

---

## 🔒 Melhores Práticas de Segurança

### ✅ DO (Faça)

1. **Use variáveis diferentes por ambiente**
   ```bash
   # Dev
   VITE_SUPABASE_URL=https://dev-project.supabase.co
   
   # Production
   VITE_SUPABASE_URL=https://prod-project.supabase.co
   ```

2. **Rotacione keys regularmente**
   - A cada 3-6 meses
   - Imediatamente se suspeitar de vazamento

3. **Use secrets managers**
   - Vercel: Built-in environment variables
   - Supabase: `supabase secrets set`

4. **Limite permissões**
   - Use anon key (público) quando possível
   - Service role key apenas para backend

5. **Monitore uso**
   - Configure alertas de rate limit
   - Revise logs regularmente

### ❌ DON'T (Não faça)

1. **NUNCA commite arquivos .env**
   - Já está no `.gitignore`
   - Use `.env.example` como template

2. **NUNCA exponha service role key com VITE_**
   ```bash
   # ❌ ERRADO
   VITE_SUPABASE_SERVICE_ROLE_KEY=...
   
   # ✅ CORRETO
   SUPABASE_SERVICE_ROLE_KEY=...  # Sem VITE_
   ```

3. **NUNCA reutilize keys entre ambientes**
   ```bash
   # ❌ ERRADO (mesma key em dev e prod)
   
   # ✅ CORRETO (keys diferentes)
   ```

4. **NUNCA compartilhe keys via chat/email**
   - Use secrets managers
   - Ou compartilhe via ferramenta segura (1Password, etc.)

---

## 🐛 Problemas Comuns e Soluções

### Problema 1: Variáveis não aparecem no browser

**Sintomas:**
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL) // undefined
```

**Solução:**
```bash
# ✅ Verifique que variável começa com VITE_
VITE_SUPABASE_URL=...  # Correto

# ❌ Sem VITE_ não funciona no frontend
SUPABASE_URL=...  # Errado para frontend
```

**Redeploy obrigatório:**
Após adicionar/alterar variáveis no Vercel, você DEVE fazer redeploy.

### Problema 2: Build falha com "Cannot find module"

**Sintomas:**
```
Error: Cannot find module '@supabase/supabase-js'
```

**Solução:**
```bash
# Limpe e reinstale
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Problema 3: Supabase conecta mas dá erro de auth

**Sintomas:**
```
Error: Invalid JWT
```

**Causas comuns:**
- Key incorreta (verificar se copiou completa)
- Key de projeto errado
- Key expirada

**Solução:**
```bash
# Re-obtenha keys do Supabase Dashboard
# Settings → API
# Copie novamente (cuidado com espaços extras)
```

### Problema 4: Edge Functions não funcionam

**Sintomas:**
```
Error: Missing RESEND_API_KEY
```

**Solução:**
```bash
# Edge Functions usam secrets separados
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set ADMIN_EMAIL=admin@empresa.com

# Verificar
supabase secrets list
```

---

## ✅ Validação e Testes

### Teste 1: Build Local

```bash
# Deve completar sem erros
npm run build

# Resultado esperado:
# ✓ built in 2.5s
# dist/index.html                   0.46 kB
# dist/assets/index-abc123.js       200.00 kB
```

### Teste 2: Verificação de Produção

```bash
# Script automatizado
npm run verify:production

# Resultado esperado:
# ✓ Required variables: OK
# ⚠️ Optional variables: 3 missing
# ✓ Build: OK
# ✓ Tests: PASSED
```

### Teste 3: Health Check

```bash
# Local
npm run dev
# Acesse: http://localhost:5173/admin/system-health

# Produção
# Acesse: https://seu-app.vercel.app/admin/system-health
```

**Resultado esperado:**
```
✅ Sistema Operacional
✅ Supabase: Conectado
✅ OpenAI: Configurado
⚠️ Mapbox: Não configurado (opcional)
```

### Teste 4: Sentry

```javascript
// No console do browser
throw new Error('Teste Sentry');

// Deve aparecer em https://sentry.io após ~1 minuto
```

---

## 📚 Recursos Adicionais

- **[.env.production](./.env.production)** - Template completo
- **[DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)** - Checklist rápido
- **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)** - Guia Vercel
- **[ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)** - Documentação completa

---

## 🆘 Ainda com Dúvidas?

1. **Troubleshooting completo:** Ver VERCEL_DEPLOYMENT_GUIDE.md
2. **Logs da Vercel:** https://vercel.com/dashboard
3. **Logs do Supabase:** `supabase functions logs --tail`
4. **Sentry:** https://sentry.io
5. **Issues:** https://github.com/RodrigoSC89/travel-hr-buddy/issues

---

📅 **Última Atualização:** 2025-10-18  
📌 **Versão:** 1.0.0  
🏷️ **Projeto:** Nautilus One
