# 🚢 Nautilus One

Sistema modular de operações marítimas, offshore e industriais com IA embarcada, auditorias, checklists e relatórios automatizados.

---

## 📦 Stack Tecnológica

| Camada     | Tecnologias |
|------------|-------------|
| Frontend   | Next.js 13+, TypeScript, TailwindCSS, TipTap |
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

---

## 🧪 Testes Automatizados

```bash
npm run test
```

Utiliza: vitest + @testing-library/react

---

## 🚀 Deploy

Configuração recomendada no Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
RESEND_API_KEY=
```

---

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

---

## 🛠️ Painéis de Administração

- `/admin`
- `/admin/templates`
- `/admin/system-health`
- `/admin/audit`
- `/admin/mmi`
- `/admin/sgso`

---

## 📊 Business Intelligence

- Forecast por componente/sistema
- Exportação CSV/PDF
- Envio automático por cron (Resend)

---

## 🧭 Roadmap

- [ ] Finalizar SGSO
- [ ] PEO-DP com IA explicadora
- [ ] FMEA com geração automática
- [ ] Exportação completa dos relatórios em PDF
- [ ] Deploy final de produção + monitoramento

---

## 👥 Equipe

- **Product Owner:** [Seu Nome]
- **Desenvolvedor Líder:** [Seu Nome]
- **Colaboradores:** IA GPT-4, GitHub Copilot, Supabase, Vercel

---

## 📄 Licença

MIT — © 2025 Nautilus One
