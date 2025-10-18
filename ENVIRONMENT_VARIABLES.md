# 🔐 Environment Variables - Nautilus One

## 📋 Visão Geral

Este documento detalha todas as variáveis de ambiente necessárias e opcionais para o sistema Nautilus One.

**⚠️ IMPORTANTE**: 
- Variáveis começando com `VITE_` são expostas no frontend
- Variáveis sem `VITE_` são apenas para backend/build-time
- Nunca exponha `SERVICE_ROLE_KEY` ou secrets sensíveis no frontend

---

## 🔴 Variáveis Obrigatórias (Produção)

### Supabase (Backend)

```bash
# URL do projeto Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co

# Chave pública (anon key) - Seguro expor no frontend
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ID do projeto (para referência)
VITE_SUPABASE_PROJECT_ID=seu-projeto-id
```

**Como obter:**
1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá para Settings → API
4. Copie os valores de `Project URL`, `anon/public key` e `Project Reference ID`

### Sentry (Monitoramento de Erros)

```bash
# DSN do Sentry para captura de erros
VITE_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0

# Configurações para upload de source maps (opcional)
SENTRY_ORG=sua-organizacao
SENTRY_PROJECT=nautilus-one
SENTRY_AUTH_TOKEN=seu-auth-token
```

**Como obter:**
1. Acesse https://sentry.io
2. Crie um novo projeto ou use existente
3. Vá para Settings → Client Keys (DSN)
4. Copie o DSN
5. Para source maps: Settings → Auth Tokens

### App Configuration

```bash
# URL pública da aplicação
VITE_APP_URL=https://nautilus.vercel.app

# Ambiente (production, staging, development)
VITE_NODE_ENV=production
```

---

## 🟡 Variáveis Recomendadas

### OpenAI (Assistente IA)

```bash
# API Key do OpenAI para features de IA
VITE_OPENAI_API_KEY=sk-proj-...
```

**Como obter:**
1. Acesse https://platform.openai.com/api-keys
2. Crie uma nova API key
3. Copie e salve em local seguro

**Usado em:**
- Assistente IA (chat)
- Análise de documentos
- Sugestões inteligentes
- Classificação de incidentes

### Mapbox (Mapas e Geolocalização)

```bash
# Token público do Mapbox
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJja...
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJja...

# Para Edge Functions do Supabase (via supabase secrets)
MAPBOX_PUBLIC_TOKEN=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJja...
```

**Como obter:**
1. Acesse https://account.mapbox.com/
2. Vá para Access Tokens
3. Crie um novo token público
4. Copie o token

**Usado em:**
- Mapa de embarcações
- Tracking de viagens
- Visualização geográfica
- Meteorologia marítima

### OpenWeather (Dados Meteorológicos)

```bash
# Frontend (opcional)
VITE_OPENWEATHER_API_KEY=seu-api-key

# Supabase Edge Functions (obrigatório para maritime-weather)
OPENWEATHER_API_KEY=seu-api-key
```

**Como obter:**
1. Acesse https://openweathermap.org/api
2. Crie uma conta
3. Obtenha sua API key
4. Pode levar algumas horas para ativar

**Usado em:**
- Previsão do tempo marítimo
- Alertas meteorológicos
- Condições de navegação
- Planejamento de rotas

---

## 🟢 Variáveis Opcionais (Features Avançadas)

### Travel APIs

```bash
# Amadeus (Voos e Viagens)
VITE_AMADEUS_API_KEY=seu-client-id
VITE_AMADEUS_API_SECRET=seu-client-secret

# Outras APIs de viagem
VITE_SKYSCANNER_API_KEY=
VITE_GOOGLE_FLIGHTS_ENABLED=true
```

**Como obter Amadeus:**
1. Acesse https://developers.amadeus.com/
2. Registre-se para obter credenciais
3. Copie Client ID e Client Secret

### ElevenLabs (Text-to-Speech)

```bash
# API Key do ElevenLabs para síntese de voz
VITE_ELEVENLABS_API_KEY=seu-api-key
```

**Como obter:**
1. Acesse https://elevenlabs.io/
2. Crie uma conta
3. Vá para Profile → API Keys
4. Gere uma nova key

**Usado em:**
- Assistente de voz
- Notificações por áudio
- Acessibilidade

### Embed & TV Wall

```bash
# Token de acesso para rotas embed protegidas
VITE_EMBED_ACCESS_TOKEN=gere_um_token_seguro_aqui
```

**Como gerar:**
```bash
# Gerar token aleatório seguro
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Usado em:**
- `/embed/restore-chart`
- TV Wall dashboards
- Painéis públicos protegidos

### Notifications (Admin Wall)

```bash
# Slack Webhook para notificações de build
VITE_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Telegram Bot para notificações
VITE_TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
VITE_TELEGRAM_CHAT_ID=-1001234567890
```

**Como obter Slack Webhook:**
1. Acesse https://api.slack.com/apps
2. Crie um app
3. Ative Incoming Webhooks
4. Adicione webhook ao workspace
5. Copie a URL

**Como obter Telegram Bot:**
1. Fale com @BotFather no Telegram
2. Crie um novo bot com `/newbot`
3. Copie o token
4. Para Chat ID: adicione bot ao grupo e use @userinfobot

---

## 🔒 Variáveis Apenas para Backend

**⚠️ NUNCA exponha estas variáveis no frontend (não use prefixo `VITE_`)**

### Supabase Service Role

```bash
# Chave de serviço com acesso total (MUITO SENSÍVEL!)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Usado em:**
- Scripts de migração
- Tarefas administrativas
- Operações privilegiadas
- NUNCA no frontend

### Email (SMTP)

```bash
# Configuração SMTP para scripts locais
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_USER=seu@email.com
EMAIL_PASS=sua_senha_segura
EMAIL_FROM=nautilus@empresa.com
EMAIL_TO=equipe@empresa.com
```

**Usado em:**
- Scripts de relatórios semanais
- Alertas administrativos
- Notificações por email (scripts locais)

### Resend / SendGrid (Email APIs)

```bash
# Resend (recomendado para Edge Functions)
RESEND_API_KEY=re_...

# SendGrid (alternativa)
SENDGRID_API_KEY=SG....
```

**Como obter Resend:**
1. Acesse https://resend.com/
2. Crie uma conta
3. Gere uma API key
4. Configure via `supabase secrets set RESEND_API_KEY=...`

**Usado em:**
- Edge Functions (send-assistant-report)
- Envio de relatórios por email
- Notificações transacionais

---

## 📦 Configuração por Ambiente

### Development (.env.local)

```bash
# Supabase (projeto de desenvolvimento)
VITE_SUPABASE_URL=https://dev-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...dev-key...
VITE_SUPABASE_PROJECT_ID=dev-projeto-id

# App
VITE_APP_URL=http://localhost:5173
VITE_NODE_ENV=development

# Sentry (opcional em dev)
# VITE_SENTRY_DSN=

# APIs (use keys de teste quando disponível)
VITE_OPENAI_API_KEY=sk-proj-test...
```

### Staging (.env.staging - no Vercel)

```bash
# Supabase (projeto de staging)
VITE_SUPABASE_URL=https://staging-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...staging-key...
VITE_SUPABASE_PROJECT_ID=staging-projeto-id

# App
VITE_APP_URL=https://nautilus-staging.vercel.app
VITE_NODE_ENV=staging

# Sentry
VITE_SENTRY_DSN=https://...staging-sentry-dsn...

# APIs (mesmo de produção ou keys de teste)
VITE_OPENAI_API_KEY=sk-proj-...
```

### Production (.env.production - no Vercel)

```bash
# Supabase (projeto de produção)
VITE_SUPABASE_URL=https://prod-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...prod-key...
VITE_SUPABASE_PROJECT_ID=prod-projeto-id

# App
VITE_APP_URL=https://nautilus.sua-empresa.com
VITE_NODE_ENV=production

# Sentry
VITE_SENTRY_DSN=https://...prod-sentry-dsn...

# Todas as APIs configuradas
VITE_OPENAI_API_KEY=sk-proj-...
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ...
VITE_OPENWEATHER_API_KEY=...
# etc...
```

---

## 🛠️ Como Configurar

### Localmente (Desenvolvimento)

1. Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env.local
   ```

2. Edite `.env.local` com suas credenciais

3. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

### No Vercel (Produção/Staging)

#### Via Dashboard:

1. Acesse https://vercel.com/dashboard
2. Selecione o projeto Nautilus One
3. Vá para **Settings** → **Environment Variables**
4. Adicione cada variável:
   - **Key**: Nome da variável (ex: `VITE_SUPABASE_URL`)
   - **Value**: Valor da variável
   - **Environment**: Production, Preview, ou Development

#### Via CLI:

```bash
# Adicionar variável
vercel env add VITE_SUPABASE_URL production

# Listar variáveis
vercel env ls

# Remover variável
vercel env rm VITE_SUPABASE_URL production
```

### No Supabase (Edge Functions)

```bash
# Configurar secret
supabase secrets set OPENAI_API_KEY=sk-proj-...

# Configurar múltiplos secrets de uma vez
supabase secrets set \
  RESEND_API_KEY=re_... \
  ADMIN_EMAIL=admin@empresa.com \
  MAPBOX_PUBLIC_TOKEN=pk.eyJ...

# Listar secrets
supabase secrets list

# Remover secret
supabase secrets unset OPENAI_API_KEY
```

---

## ✅ Validação

### Script de Verificação

Execute o script de verificação para validar variáveis:

```bash
npm run verify:production
```

Este script verifica:
- ✅ Variáveis obrigatórias estão presentes
- ⚠️  Variáveis recomendadas ausentes
- ❌ Variáveis mal configuradas

### Teste Manual

1. **Frontend**:
   ```bash
   npm run dev
   # Acesse http://localhost:5173/admin/system-health
   # Verifique se todos os serviços estão online
   ```

2. **Backend/Supabase**:
   ```bash
   # Testar Edge Function localmente
   supabase functions serve send-chart-report
   ```

3. **Build**:
   ```bash
   npm run build
   # Verifique se não há erros sobre variáveis faltantes
   ```

---

## 🔒 Segurança

### Boas Práticas

1. **Nunca commite arquivos `.env`** - Já está no `.gitignore`
2. **Use secrets managers** - Vercel e Supabase têm built-in
3. **Rotacione keys regularmente** - Especialmente em caso de vazamento
4. **Use keys diferentes por ambiente** - Não reutilize produção em dev
5. **Limite permissões** - Use princípio do menor privilégio
6. **Monitore uso de APIs** - Configure alertas de uso anormal

### Em Caso de Vazamento

1. **Revogue a key imediatamente** no serviço correspondente
2. **Gere uma nova key**
3. **Atualize nos ambientes** (Vercel, Supabase, etc.)
4. **Monitore por uso suspeito**
5. **Revise logs de acesso**

### Checklist de Segurança

- [ ] Todas as keys são únicas (não reutilizadas)
- [ ] Service role key nunca exposta no frontend
- [ ] `.env` está no `.gitignore`
- [ ] Keys de produção diferentes de staging/dev
- [ ] Secrets sensíveis só no backend
- [ ] Monitoramento de uso configurado
- [ ] Alertas de rate limit configurados

---

## 📚 Referências

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase Environment Variables](https://supabase.com/docs/guides/cli/config#environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [12 Factor App - Config](https://12factor.net/config)

---

**Última atualização**: 2025-10-18
**Versão**: 1.0.0
