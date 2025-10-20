# 🚢 Nautilus One

Sistema modular de operações marítimas, offshore e industriais com IA embarcada, auditorias, checklists e relatórios automatizados.

---

## 📦 Stack Tecnológica

| Camada     | Tecnologias |
|------------|-------------|
| Frontend   | Vite, React, TypeScript, TailwindCSS, TipTap |
| Backend    | Supabase (PostgreSQL, Auth, RLS, Storage, Edge Functions) |
| IA         | OpenAI GPT-4, embeddings, RAG |
| Email IA   | Resend |
| PDF        | html2pdf.js |
| Deploy     | Vercel + GitHub Actions |
| Realtime   | Supabase Realtime |

---

## ✅ Módulos Implementados

- Autenticação com RLS
- Documentos com IA
- Checklists Inteligentes
- Chat Assistente GPT-4 com logs
- Forecast com IA + envio por cron
- Auditorias Técnicas (IMCA, MTS, IMO)
- SGSO (em fase de refino)
- MMI - Manutenção Inteligente
- Painel de Saúde do Sistema
- System Debug Endpoint
- Templates IA reutilizáveis

---

## 🧠 Inteligência Artificial

- GPT-4 via OpenAI
- Geração de documentos, planos de ação, forecasts
- Explicações técnicas e normativas (IMCA, MTS, PEO-DP)
- Log e rastreabilidade de cada interação

---

## 🔧 Setup do Projeto

```bash
git clone https://github.com/RodrigoSC89/travel-hr-buddy.git
cd travel-hr-buddy
cp .env.example .env.local
npm install
npm run dev
```

## 🧪 Testes Automatizados

```bash
npm run test
```

Utiliza: vitest + @testing-library/react

## 🚀 Deploy

> **📘 Guia Completo**: [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md)  
> **📗 Setup Detalhado**: [ENV_PRODUCTION_SETUP_GUIDE.md](ENV_PRODUCTION_SETUP_GUIDE.md)  
> **📙 Template Completo**: [.env.production](.env.production)

### ✅ Variáveis Obrigatórias (14)

Configuração no Vercel Dashboard → Settings → Environment Variables:

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

### ⚡ Variáveis Recomendadas (8)

```bash
# Mapbox, OpenWeather, Embed Token, Admin Email
# Ver .env.production para lista completa
```

### 🔧 Variáveis Opcionais (33+)

```bash
# Amadeus, ElevenLabs, Slack, Telegram, Feature Flags, etc.
# Ver .env.production para lista completa
```

**Nota**: Este é um projeto **Vite** (não Next.js), por isso usamos `VITE_*` prefix para variáveis de frontend.

## 📁 Estrutura de Diretórios

```
/app
  /admin
  /api
  /auth
  /documents
/lib
/components
/hooks
/__tests__
```

## 🛠️ Painéis de Administração

- `/admin`
- `/admin/templates`
- `/admin/system-health`
- `/admin/audit`
- `/admin/mmi`
- `/admin/sgso`

## 📊 Business Intelligence

- Forecast por componente/sistema
- Exportação CSV/PDF
- Envio automático por cron (Resend)

## 🐍 Módulos Python (Phase 3)

Novos módulos Python para comunicação e previsão com IA:

### 🌉 BridgeLink
Sistema de comunicação segura bordo-costa para SGSO Petrobras.

### 🔮 Forecast Global
Motor de previsão de riscos com Machine Learning para toda a frota.

**[📖 Documentação Completa](./modules/README.md)**

## 🧭 Roadmap

- ✅ **Phase 3 Completa** - BridgeLink + Forecast Global
- Finalizar SGSO integração
- PEO-DP com IA explicadora
- FMEA com geração automática
- Exportação completa dos relatórios em PDF
- Deploy final de produção + monitoramento
- Control Hub web interface (Phase 3.4)

## 👥 Equipe

- **Product Owner**: [Seu Nome]
- **Desenvolvedor Líder**: [Seu Nome]
- **Colaboradores**: IA GPT-4, GitHub Copilot, Supabase, Vercel

## 📄 Licença

MIT — © 2025 Nautilus One
