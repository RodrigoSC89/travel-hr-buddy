# 🔐 Guia de Setup de Variáveis de Ambiente para Produção

Este guia explica em detalhes como configurar todas as variáveis de ambiente necessárias para deployment em produção do Nautilus One.

---

## 📋 Índice

1. [Entendendo Variáveis de Ambiente](#entendendo-variáveis-de-ambiente)
2. [Por que VITE_* e não NEXT_PUBLIC_*?](#por-que-vite_-e-não-next_public_)
3. [Configuração Rápida (5 Passos)](#configuração-rápida-5-passos)
4. [Variáveis por Categoria](#variáveis-por-categoria)
5. [Configuração no Vercel](#configuração-no-vercel)
6. [Configuração no Supabase](#configuração-no-supabase)
7. [Segurança e Boas Práticas](#segurança-e-boas-práticas)
8. [Problemas Comuns e Soluções](#problemas-comuns-e-soluções)

---

## 🎯 Entendendo Variáveis de Ambiente

### Frontend vs Backend

**Frontend (VITE_*)** - Expostas ao navegador:
- Prefixo obrigatório: `VITE_`
- Visíveis no bundle JavaScript
- Usadas por componentes React
- Configuradas no Vercel Dashboard
- Exemplos: `VITE_SUPABASE_URL`, `VITE_OPENAI_API_KEY`

**Backend (sem prefixo)** - Apenas servidor:
- Sem prefixo `VITE_`
- Não expostas ao navegador
- Usadas apenas em scripts Node.js
- Mais seguras para secrets sensíveis
- Exemplos: `SUPABASE_KEY`, `EMAIL_PASS`

**Supabase Edge Functions**:
- Configuradas via CLI: `supabase secrets set KEY=value`
- Não acessam variáveis do Vercel
- Sistema independente de secrets
- Exemplos: `RESEND_API_KEY`, `OPENWEATHER_API_KEY`

### ⚠️ Importante sobre Segurança

Mesmo variáveis `VITE_*` sendo expostas ao navegador, isso é seguro para:
- ✅ URLs públicas (Supabase URL, App URL)
- ✅ Keys públicas (Supabase Anon Key, Mapbox Public Token)
- ✅ IDs de projeto (Supabase Project ID, Sentry DSN)

Nunca use `VITE_*` para:
- ❌ Passwords e secrets privados
- ❌ Service Role Keys do Supabase
- ❌ Private API Keys com permissões admin

---

## 🔧 Por que VITE_* e não NEXT_PUBLIC_*?

### Contexto

O problema statement menciona `NEXT_PUBLIC_*`, mas **este é um projeto Vite, não Next.js**.

### Diferenças

| Framework | Prefixo | Build Tool |
|-----------|---------|------------|
| Next.js   | `NEXT_PUBLIC_*` | Webpack/Turbopack |
| Vite/React | `VITE_*` | Vite |
| Create React App | `REACT_APP_*` | Webpack |

### Por que Vite?

- ⚡ Build 10-100x mais rápido que Webpack
- 🔥 Hot Module Replacement instantâneo
- 📦 Bundling otimizado com Rollup
- 🎯 Melhor para aplicações React puras (não SSR)

**Conclusão**: Todas as variáveis frontend neste projeto usam o prefixo `VITE_*`.

---

## 🚀 Configuração Rápida (5 Passos)

### Passo 1: Obter API Keys

1. **Supabase**: https://supabase.com/dashboard → Settings → API
   - Copiar: `URL`, `anon key`, `Project ID`
   
2. **OpenAI**: https://platform.openai.com/api-keys
   - Criar nova key: "Nautilus Production"
   
3. **Sentry**: https://sentry.io → Settings → Projects
   - Copiar: `DSN`, `Auth Token`
   
4. **Resend**: https://resend.com/api-keys
   - Criar key: "Nautilus Email Service"
   
5. **Mapbox** (opcional): https://account.mapbox.com/
   - Copiar: `Public Token`

### Passo 2: Configurar Vercel

Acesse: Vercel Dashboard → Seu Projeto → **Settings** → **Environment Variables**

Cole as variáveis essenciais:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=seu-projeto-id
VITE_OPENAI_API_KEY=sk-proj-...
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_APP_URL=https://seu-app.vercel.app
VITE_NODE_ENV=production
RESEND_API_KEY=re_...
```

> 💡 Dica: Adicione para todos os ambientes: **Production**, **Preview**, e **Development**

### Passo 3: Configurar Supabase Secrets

```bash
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Linkar projeto
supabase link --project-ref SEU_PROJECT_ID

# Configurar secrets
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set ADMIN_EMAIL=admin@empresa.com
supabase secrets set OPENWEATHER_API_KEY=...
supabase secrets set MAPBOX_PUBLIC_TOKEN=pk.eyJ...
```

### Passo 4: Verificar Configuração

No terminal local:

```bash
# Testar build
npm run build

# Se passar, está OK!
```

### Passo 5: Deploy e Validar

```bash
# Deploy
git push origin main

# Após deploy, verificar
# https://seu-app.vercel.app/admin/system-health
```

---

## 📦 Variáveis por Categoria

### 1️⃣ Essenciais (Build falhará sem estas)

#### Supabase

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=seu-projeto-id
```

**Onde obter**: Supabase Dashboard → Settings → API  
**Custo**: Grátis até 500MB DB + 50K MAU  
**Obrigatório**: ✅ SIM

#### OpenAI

```env
VITE_OPENAI_API_KEY=sk-proj-...
```

**Onde obter**: https://platform.openai.com/api-keys  
**Custo**: Pay-as-you-go (~$0.002/request)  
**Obrigatório**: ✅ SIM (assistente IA)

#### Sentry

```env
VITE_SENTRY_DSN=https://...@o0.ingest.sentry.io/0000000
SENTRY_AUTH_TOKEN=...
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

**Onde obter**: https://sentry.io/settings/  
**Custo**: Grátis até 5K events/mês  
**Obrigatório**: ✅ SIM (monitoramento)

#### Resend

```env
RESEND_API_KEY=re_...
```

**Onde obter**: https://resend.com/api-keys  
**Custo**: Grátis até 100 emails/dia  
**Obrigatório**: ✅ SIM (envio de relatórios)

#### System Config

```env
VITE_APP_URL=https://seu-app.vercel.app
VITE_NODE_ENV=production
VITE_APP_NAME=Nautilus One
```

**Obrigatório**: ✅ SIM

---

### 2️⃣ Recomendadas (Features importantes)

#### Mapbox

```env
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ...
VITE_MAPBOX_TOKEN=pk.eyJ...
MAPBOX_PUBLIC_TOKEN=pk.eyJ...
```

**Onde obter**: https://account.mapbox.com/  
**Custo**: Grátis até 50K requests/mês  
**Obrigatório**: ⚡ RECOMENDADO (sistema marítimo)  
**Features**: Mapas, Tracking de navios, Geolocation

#### OpenWeather

```env
VITE_OPENWEATHER_API_KEY=...
OPENWEATHER_API_KEY=...
```

**Onde obter**: https://home.openweathermap.org/api_keys  
**Custo**: Grátis até 1K calls/dia  
**Obrigatório**: ⚡ RECOMENDADO (clima marítimo)  
**Features**: Previsões, Alertas meteorológicos

#### Embed Token

```env
VITE_EMBED_ACCESS_TOKEN=seu_token_secreto_unico
```

**Como gerar**: Use um UUID ou string aleatória longa  
**Obrigatório**: ⚡ RECOMENDADO (gráficos embed)  
**Features**: Protege rotas `/embed/*`

---

### 3️⃣ Opcionais (Features avançadas)

#### Amadeus Travel

```env
VITE_AMADEUS_API_KEY=your-client-id
VITE_AMADEUS_API_SECRET=your-client-secret
```

**Onde obter**: https://developers.amadeus.com/  
**Custo**: Tier grátis disponível  
**Obrigatório**: 🔧 OPCIONAL (módulo viagens)

#### ElevenLabs Voice

```env
VITE_ELEVENLABS_API_KEY=...
```

**Onde obter**: https://elevenlabs.io/  
**Custo**: 10K caracteres/mês grátis  
**Obrigatório**: 🔧 OPCIONAL (voz sintética)

#### Slack Notifications

```env
VITE_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

**Onde obter**: https://api.slack.com/messaging/webhooks  
**Obrigatório**: 🔧 OPCIONAL (Admin Wall)

#### Telegram Notifications

```env
VITE_TELEGRAM_BOT_TOKEN=123456789:ABC...
VITE_TELEGRAM_CHAT_ID=-1001234567890
```

**Onde obter**: @BotFather no Telegram  
**Obrigatório**: 🔧 OPCIONAL (Admin Wall)

---

## ⚙️ Configuração no Vercel

### Método 1: Via Dashboard (Recomendado)

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Para cada variável:
   - Clique **"Add New"**
   - Nome: `VITE_SUPABASE_URL`
   - Value: Sua URL
   - Environment: Marque **Production**, **Preview**, **Development**
   - Clique **"Save"**

### Método 2: Via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Adicionar variável
vercel env add VITE_SUPABASE_URL production
# Digite o valor quando solicitado
```

### Método 3: Via .env.local (apenas para desenvolvimento)

```bash
# Copiar template
cp .env.production .env.local

# Editar com valores reais
nano .env.local

# NÃO commitar este arquivo!
```

### Verificar Variáveis

```bash
# Via CLI
vercel env ls

# Via Dashboard
# Settings → Environment Variables → Ver lista
```

---

## 🔧 Configuração no Supabase

### Por que configurar no Supabase?

As **Edge Functions** do Supabase rodam em um ambiente isolado e **não têm acesso** às variáveis do Vercel. É necessário configurar secrets separadamente.

### Quais variáveis configurar?

Configure no Supabase apenas as variáveis usadas por Edge Functions:

```bash
# Email service (send-chart-report, send-restore-dashboard-daily)
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set ADMIN_EMAIL=admin@empresa.com

# Weather data (maritime-weather)
supabase secrets set OPENWEATHER_API_KEY=...

# Maps (se usado em functions)
supabase secrets set MAPBOX_PUBLIC_TOKEN=pk.eyJ...
```

### Passo a Passo

1. **Instalar Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Login**:
   ```bash
   supabase login
   # Seguir instruções no navegador
   ```

3. **Linkar Projeto**:
   ```bash
   supabase link --project-ref SEU_PROJECT_ID
   # Project ID: Dashboard → Settings → General → Reference ID
   ```

4. **Adicionar Secrets**:
   ```bash
   supabase secrets set RESEND_API_KEY=re_...
   ```

5. **Verificar**:
   ```bash
   supabase secrets list
   ```

6. **Redeploy Functions** (se necessário):
   ```bash
   supabase functions deploy FUNCTION_NAME
   ```

---

## 🔐 Segurança e Boas Práticas

### ✅ DO (Faça)

1. **Rotacionar Keys Regularmente**
   - OpenAI: A cada 3 meses
   - Sentry: A cada 6 meses
   - Tokens de acesso: Mensalmente

2. **Usar Permissões Mínimas**
   - API Keys: Limitar apenas aos endpoints necessários
   - Supabase: Usar RLS (Row Level Security)
   - Sentry: Apenas permissões de leitura para tokens públicos

3. **Monitorar Uso**
   - Configurar alertas de uso em cada serviço
   - Verificar logs regularmente no Sentry
   - Monitorar custos no billing dos serviços

4. **Separar Ambientes**
   - Keys diferentes para Development/Preview/Production
   - Nunca usar keys de produção em desenvolvimento

5. **Documentar Secrets**
   - Manter inventário de todas as keys
   - Documentar onde e por quem foram criadas
   - Ter processo de recuperação se perder acesso

### ❌ DON'T (Não Faça)

1. **Nunca Commitar Secrets**
   - Não commitar `.env`, `.env.local`, `.env.production` com valores reais
   - Usar `.env.example` apenas como template
   - Adicionar `.env*` no `.gitignore`

2. **Não Compartilhar Keys**
   - Não enviar por email, Slack, ou WhatsApp
   - Usar password managers (1Password, LastPass)
   - Compartilhar apenas via sistemas seguros

3. **Não Usar Same Key Everywhere**
   - Keys diferentes por ambiente
   - Keys diferentes por serviço
   - Revogar keys antigas ao criar novas

4. **Não Expor Secrets no Frontend**
   - Nunca usar `VITE_*` para passwords
   - Service Role Keys apenas no backend
   - Private API Keys em Edge Functions

---

## 🐛 Problemas Comuns e Soluções

### Problema 1: "VITE_SUPABASE_URL is not defined"

**Sintoma**: App mostra erro de variável não definida

**Causas**:
- Variável não configurada no Vercel
- Typo no nome da variável
- Build antigo sem a variável

**Soluções**:
1. Verificar nome correto: `VITE_SUPABASE_URL` (com `VITE_`)
2. Redeploy após adicionar variável
3. Aguardar 2-3 minutos para propagar
4. Verificar: Settings → Environment Variables

### Problema 2: Build Passa mas App Quebra

**Sintoma**: Build sucesso, mas app não funciona em produção

**Causas**:
- Variáveis configuradas apenas em Development
- Typo nos valores (URL errada, etc)
- Valores de desenvolvimento usados

**Soluções**:
1. Marcar variáveis para **Production**
2. Verificar valores (copiar/colar novamente)
3. Testar URLs manualmente (abrir no navegador)
4. Ver logs: Vercel Dashboard → Deployments → Runtime Logs

### Problema 3: Edge Functions Retornam 500

**Sintoma**: Supabase Functions falham com erro 500

**Causas**:
- Secrets não configurados no Supabase
- Secrets configurados com typo
- Function não redeploy após adicionar secret

**Soluções**:
1. Verificar: `supabase secrets list`
2. Reconfigurar: `supabase secrets set KEY=value`
3. Redeploy: `supabase functions deploy FUNCTION_NAME`
4. Ver logs: `supabase functions logs FUNCTION_NAME --tail`

### Problema 4: "Invalid API Key" em Produção

**Sintoma**: API externa retorna erro de key inválida

**Causas**:
- Key copiada incorretamente
- Key expirada ou revogada
- Key de desenvolvimento em produção
- Espaços ou quebras de linha na key

**Soluções**:
1. Recopiar key do dashboard do serviço
2. Verificar validade da key (testar com curl)
3. Remover espaços: `echo $KEY | tr -d '[:space:]'`
4. Criar nova key se necessário

### Problema 5: Variáveis Não Atualizam

**Sintoma**: Mudanças em variáveis não têm efeito

**Causas**:
- Cache do Vercel
- Build antigo ainda ativo
- Variável no ambiente errado

**Soluções**:
1. Redeploy: Deployments → ... → Redeploy
2. Limpar cache: Settings → Build & Development → Clear Cache
3. Verificar ambiente: Production vs Preview vs Development
4. Aguardar alguns minutos (propagação)

---

## 📚 Recursos Adicionais

### Documentação Oficial

- **Vite Env Variables**: https://vitejs.dev/guide/env-and-mode.html
- **Vercel Env Variables**: https://vercel.com/docs/environment-variables
- **Supabase Secrets**: https://supabase.com/docs/guides/functions/secrets

### Guias do Projeto

- 📋 [.env.production](./.env.production) - Template completo
- ✅ [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) - Checklist rápido
- 🚀 [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) - Guia Vercel
- 📖 [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md) - Guia oficial

### Ferramentas Úteis

- **Gerador de Tokens**: https://www.uuidgenerator.net/
- **Validador de JWT**: https://jwt.io/
- **Teste de API Keys**: Postman ou Insomnia

---

## ✅ Próximos Passos

Após configurar todas as variáveis:

1. ✅ Fazer deploy: `git push origin main`
2. ✅ Verificar: https://seu-app.vercel.app/admin/system-health
3. ✅ Testar features principais
4. ✅ Monitorar erros no Sentry
5. ✅ Configurar alertas de uso/custos

---

**Última atualização**: 2025-10-18  
**Versão**: 1.0

> 💡 **Dica**: Mantenha este guia como referência durante todo o ciclo de vida do projeto!
