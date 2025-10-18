# 📋 Guia de Configuração - .env.production

## 🎯 Visão Geral

Este guia explica o arquivo `.env.production` e como usá-lo para fazer deploy do **Nautilus One** em produção.

## 📁 Arquivos Criados

| Arquivo | Propósito |
|---------|-----------|
| `.env.production` | Template com todas as variáveis de ambiente necessárias |
| `DEPLOY_CHECKLIST.md` | Checklist rápido para deploy em produção |
| `VERCEL_DEPLOYMENT_GUIDE.md` | Guia completo e detalhado de deploy (atualizado) |

## 🔍 Entendendo as Variáveis

### 🔐 Variáveis Frontend vs Backend

**Frontend (VITE_* prefix)**: Variáveis expostas no navegador
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_OPENAI_API_KEY=sk-...
```

**Backend (sem VITE_ prefix)**: Variáveis usadas apenas em scripts Node.js
```bash
SUPABASE_KEY=your-service-role-key
RESEND_API_KEY=re_...
EMAIL_HOST=smtp.yourdomain.com
```

### ⚡ Por que VITE_* e não NEXT_PUBLIC_*?

Este é um projeto **Vite**, não Next.js. Vite requer o prefixo `VITE_` para expor variáveis ao frontend.

## 🚀 Configuração Rápida (5 Passos)

### 1️⃣ Preparar Credenciais

Reúna as seguintes credenciais antes de começar:

**Obrigatórias:**
- ✅ Supabase URL e Keys (https://supabase.com)
- ✅ OpenAI API Key (https://openai.com)

**Recomendadas:**
- ⭐ Resend API Key (https://resend.com) - Para emails
- ⭐ Sentry DSN (https://sentry.io) - Para monitoramento
- ⭐ Mapbox Token (https://mapbox.com) - Para mapas

**Opcionais:**
- ⚪ Amadeus, ElevenLabs, OpenWeather, etc.

### 2️⃣ Configurar Vercel

```bash
# 1. Acesse vercel.com e faça login
# 2. Import Project → Select Repository
# 3. Settings → Environment Variables
# 4. Adicione as variáveis do .env.production
```

**Dica:** Copie e cole cada variável do `.env.production`, substituindo os valores de exemplo.

### 3️⃣ Configurar Supabase Edge Functions

```bash
# Instalar CLI
npm install -g supabase

# Login e linkar projeto
supabase login
supabase link --project-ref seu-projeto-id

# Configurar secrets
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set ADMIN_EMAIL=admin@empresa.com
```

### 4️⃣ Deploy

**Opção A - Automático (Recomendado):**
```bash
git push origin main
# Deploy automático na Vercel
```

**Opção B - Manual na Vercel:**
```
Dashboard → Seu Projeto → Deploy
```

### 5️⃣ Validar

Após deploy, verifique:
- ✅ Site acessível na URL da Vercel
- ✅ Login funciona
- ✅ `/admin/system-health` mostra status OK
- ✅ Módulos principais carregam

## 📊 Estrutura do .env.production

```
🔐 SUPABASE
├── VITE_SUPABASE_URL
├── VITE_SUPABASE_PUBLISHABLE_KEY
├── VITE_SUPABASE_PROJECT_ID
└── SUPABASE_KEY (service role)

🤖 OPENAI
└── VITE_OPENAI_API_KEY

📤 RESEND (Emails)
└── RESEND_API_KEY

🔧 CONFIGURAÇÕES
├── VITE_APP_NAME
├── VITE_ENVIRONMENT
├── VITE_NODE_ENV
└── NODE_ENV

🗺️ MAPBOX (Mapas)
├── VITE_MAPBOX_ACCESS_TOKEN
└── MAPBOX_PUBLIC_TOKEN

🚨 SENTRY (Monitoramento)
├── VITE_SENTRY_DSN
├── SENTRY_ORG
├── SENTRY_PROJECT
└── SENTRY_AUTH_TOKEN

... e mais opcionais
```

## ⚠️ Segurança - IMPORTANTE

### ✅ O que FAZER:
- ✅ Use `.env.production` como template
- ✅ Configure variáveis direto na Vercel
- ✅ Mantenha credenciais em gerenciadores de senhas
- ✅ Use diferentes keys para dev/staging/prod

### ❌ O que NÃO FAZER:
- ❌ Não commit credenciais reais no repositório
- ❌ Não compartilhe service role keys
- ❌ Não exponha variáveis sensíveis no frontend
- ❌ Não use mesmas keys em múltiplos ambientes

## 🔄 Ambientes

| Ambiente | Arquivo | Onde Configurar |
|----------|---------|-----------------|
| Development | `.env` (local) | Arquivo local, não commitado |
| Staging | N/A | Vercel → Preview Environment Variables |
| Production | `.env.production` (template) | Vercel → Production Environment Variables |

## 🧪 Testando Localmente

Para testar com variáveis de produção localmente:

```bash
# 1. Copiar template
cp .env.production .env

# 2. Preencher com credenciais reais
nano .env

# 3. Build
npm run build

# 4. Preview
npm run preview
```

**Nota:** O arquivo `.env` não será commitado (está no .gitignore)

## 📈 Melhores Práticas

### 1. Versionamento de Credenciais
- Use um gerenciador de senhas (1Password, LastPass, etc.)
- Mantenha backup das credenciais em local seguro
- Documente onde cada credencial foi obtida

### 2. Rotação de Keys
- Troque keys periodicamente (a cada 3-6 meses)
- Revogue keys antigas após atualizar
- Monitore uso de keys via dashboards dos serviços

### 3. Monitoramento
- Configure alertas no Sentry para erros críticos
- Monitore logs da Vercel diariamente
- Verifique health check regularmente

### 4. Disaster Recovery
- Mantenha backup das configurações da Vercel
- Documente processo de restauração
- Teste recuperação periodicamente

## 🔗 Links Úteis

- **Template de Variáveis**: [`.env.production`](./.env.production)
- **Checklist de Deploy**: [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)
- **Guia Completo**: [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)

### Documentação Externa
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## 🆘 Problemas Comuns

### ❓ Build Falha com "VITE_SUPABASE_URL is not defined"
**Solução:** Certifique-se de adicionar as variáveis na Vercel com o prefixo `VITE_`

### ❓ Edge Functions retornam 500
**Solução:** Configure os secrets via `supabase secrets set`

### ❓ Autenticação não funciona
**Solução:** Verifique se `VITE_SUPABASE_PUBLISHABLE_KEY` está correto (é o anon key, não service role)

### ❓ Variável não aparece no código
**Solução:** Variáveis frontend devem ter prefixo `VITE_`

### ❓ Deploy antigo ainda aparece
**Solução:** Limpe cache do navegador ou faça hard refresh (Ctrl+Shift+R)

## 📞 Suporte

Para mais ajuda:
1. Consulte [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
2. Revise [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)
3. Verifique logs na Vercel
4. Contate o time de desenvolvimento

---

**Última atualização:** 2025-10-18  
**Versão:** 1.0.0  
**Projeto:** Nautilus One - Travel HR Buddy
