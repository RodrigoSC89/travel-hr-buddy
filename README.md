# 🚢 Nautilus One – Sistema Operacional Inteligente para Operações Navais

[![Run Tests](https://github.com/RodrigoSC89/travel-hr-buddy/actions/workflows/run-tests.yml/badge.svg)](https://github.com/RodrigoSC89/travel-hr-buddy/actions/workflows/run-tests.yml)
[![Code Quality Check](https://github.com/RodrigoSC89/travel-hr-buddy/actions/workflows/code-quality-check.yml/badge.svg)](https://github.com/RodrigoSC89/travel-hr-buddy/actions/workflows/code-quality-check.yml)
[![Lighthouse CI](https://github.com/RodrigoSC89/travel-hr-buddy/actions/workflows/lighthouse-ci.yml/badge.svg)](https://github.com/RodrigoSC89/travel-hr-buddy/actions/workflows/lighthouse-ci.yml)
[![Deploy to Vercel](https://github.com/RodrigoSC89/travel-hr-buddy/actions/workflows/deploy-vercel.yml/badge.svg)](https://github.com/RodrigoSC89/travel-hr-buddy/actions/workflows/deploy-vercel.yml)
[![codecov](https://codecov.io/gh/RodrigoSC89/travel-hr-buddy/branch/main/graph/badge.svg)](https://codecov.io/gh/RodrigoSC89/travel-hr-buddy)
[![WCAG Compliance](https://img.shields.io/badge/WCAG%202.1%20AA-Accessible-brightgreen?style=flat-square)](https://www.w3.org/TR/WCAG21/)
[![Performance](https://img.shields.io/badge/Lighthouse-92%25-brightgreen?style=flat-square)](https://github.com/RodrigoSC89/travel-hr-buddy)

Sistema operacional inteligente para operações navais, auditoria, compliance e logística integrada com IA.

---

## ✅ Módulos Ativos e Estáveis

### 🧭 Travel Intelligence & Booking (PATCH-608)
> Integração com APIs de busca de passagens e hospedagem:
- **Fontes**: Skyscanner, Google Flights, MaxMilhas, Booking, Airbnb, LATAM, Azul, GOL
- Filtros por rota, preço, duração, companhia
- Deep link builder para redirecionamento direto
- Painel com histórico de buscas e favoritos
- Recomendação automática com LLM
- Interface mobile responsiva
- Cache de buscas recentes

### 🧠 Auditorias ISM (PATCH-609)
> Auditoria digital com checklist, IA e exportação PDF:
- Upload de documentos ISM escaneados (OCR)
- Checklist interativo com pontuação por item
- Análise automática com LLM explicativo
- Relatório PDF e dashboard de conformidade
- Histórico por navio, data, auditor
- Integração com System Watchdog
- Row Level Security (RLS) por embarcação

---

## 🚧 Módulos em Desenvolvimento

### ⚠️ Pré-OVID Inspections (PATCH-610)
- Checklist interativo baseado no OCIMF OVID
- Upload de evidências por item
- IA assistiva para interpretação de requisitos
- Dashboard por tipo de navio
- Pontuação automatizada de conformidade

### ⚠️ Port State Control – Pré-Inspeção (PATCH-611)
- Baseado em DNV e IMO Res. A.1185(33)
- Geração de score automático de conformidade
- Alerta de risco por categoria
- Interface intuitiva para tripulação e auditor
- Histórico por país/porto de inspeção

### ⚠️ LSA & FFA Inspections (PATCH-612)
- Equipamentos de segurança (LSA/FFA)
- Checklist SOLAS com OCR
- Pontuação de segurança + histórico por navio
- IA explicativa para requisitos técnicos
- Exportação PDF de relatórios de inspeção

---

## 🔗 Integrações Ativas

| API / Engine           | Uso                             |
|------------------------|----------------------------------|
| Skyscanner API         | Busca de voos                   |
| Booking/Airbnb         | Hospedagem                      |
| Supabase               | DB + Auth + Edge + Storage      |
| ONNX Runtime / LLM     | IA explicativa e análise        |
| System Watchdog        | Monitoramento de conformidade   |
| OpenAI GPT-4           | Assistente IA e recomendações   |

---

## 📦 Stack Tecnológica

| Camada     | Tecnologias |
|------------|-------------|
| Frontend   | React 18, Vite, TypeScript, Tailwind CSS, Zustand, ShadCN |
| UI Components | Radix UI, shadcn/ui |
| Backend    | Supabase (PostgreSQL, Auth, RLS, Storage, Edge Functions) |
| IA / OCR   | ONNX Runtime, OpenAI GPT-4, APIs LLM externas, PDF.js |
| Email      | Resend |
| PDF        | jsPDF, html2pdf.js |
| Performance | React Virtual, Image Optimization, Lighthouse CI |
| Deploy     | Vercel + GitHub Actions |
| Realtime   | Supabase Realtime |
| Monitoring | System Watchdog, Logs Center, Performance Dashboards |
| Testes     | Vitest, Playwright (E2E), Testing Library |

---

## 🔧 Setup do Projeto

```bash
# Clone repository
git clone https://github.com/RodrigoSC89/travel-hr-buddy.git
cd travel-hr-buddy

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### Quick Start Commands

```bash
# Development
npm run dev              # Start dev server

# Build & Preview
npm run build            # Production build
npm run preview          # Preview build locally

# Testing
npm test                 # Run unit tests
npm run test:e2e        # Run E2E tests
npm run test:all        # Run all tests

# Performance
npm run lighthouse       # Run Lighthouse audit
npm run benchmark       # Run CPU benchmark

# Code Quality
npm run lint            # Lint code
npm run format          # Format code
npm run type-check      # TypeScript check
```

---

## 🎯 Admin Control Center

Access all admin tools from: **`/admin/control-center`**

### Performance & Validation Tools
- `/admin/benchmark` - CPU Benchmark System
- `/admin/health-validation` - System Health Validator
- `/admin/code-health` - Code Health Dashboard
- `/logs-center-virtual` - Virtualized Logs (98% faster)

### Image & Performance
- `/admin/image-optimization` - Image CDN Panel
- `/admin/lighthouse-dashboard` - Performance Metrics

### PATCHES 506-510 Admin
- `/admin/patches-506-510/ai-memory` - AI Memory Events
- `/admin/patches-506-510/backups` - Backup Management
- `/admin/patches-506-510/rls-audit` - RLS Security Logs
- `/admin/patches-506-510/ai-feedback` - AI Feedback Scores
- `/admin/patches-506-510/sessions` - Session Management

[➡️ View Admin Control Center Guide](ADMIN_CONTROL_CENTER.md)

---

## ⚡ Performance Metrics

### Lighthouse Scores

| Category | Score | Target | Status |
|----------|-------|--------|--------|
| Performance | **92%** | 85% | ✅ Exceeding |
| Accessibility | **95%** | 90% | ✅ Exceeding |
| Best Practices | **88%** | 85% | ✅ Passing |
| SEO | **96%** | 90% | ✅ Exceeding |
| PWA | **85%** | 80% | ✅ Exceeding |

### Core Web Vitals

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| LCP (Largest Contentful Paint) | **1.8s** | < 2.5s | ✅ Good |
| FID (First Input Delay) | **45ms** | < 100ms | ✅ Good |
| CLS (Cumulative Layout Shift) | **0.05** | < 0.1 | ✅ Good |
| FCP (First Contentful Paint) | **1.2s** | < 1.8s | ✅ Good |
| TTFB (Time to First Byte) | **350ms** | < 600ms | ✅ Good |
| TBT (Total Blocking Time) | **180ms** | < 300ms | ✅ Good |

### Optimization Impact

| Optimization | Improvement |
|--------------|-------------|
| List Rendering (Virtualization) | **98% faster** |
| Image Size (WebP/AVIF) | **40% smaller** |
| LCP (Image Optimization) | **-0.8s** |
| CLS (Aspect Ratios) | **-0.03** |

---

## ✅ Validações Realizadas

- ✅ Zero erros de runtime no console
- ✅ Fallback para falha de rede
- ✅ 92% performance no Lighthouse
- ✅ Testes E2E ativos (Travel, ISM)
- ✅ Monitoramento ativo no System Watchdog
- ✅ 95% Accessibility Score
- ✅ All Core Web Vitals in "Good" range
- ✅ Automated CI/CD with GitHub Actions

---

## 🗂️ Estrutura de Arquivos

```
/src
  ├── modules/
  │   ├── travel/                    # PATCH-608: Travel Intelligence
  │   ├── travel-system/             # Sistema de gerenciamento de viagens
  │   ├── compliance/
  │   │   ├── audit-center/          # PATCH-609: ISM Audits
  │   │   ├── pre-psc/               # PATCH-611: Port State Control
  │   │   └── mlc-inspection/
  │   ├── lsa-ffa-inspections/       # PATCH-612: LSA & FFA Safety
  │   └── ...
  ├── components/
  │   ├── travel/                    # Componentes de viagem
  │   ├── pre-ovid/                  # PATCH-610: OVID Inspections
  │   └── ...
  ├── lib/
  │   ├── ocr/                       # OCR para documentos
  │   ├── psc/                       # PSC utilities
  │   └── supabase-manager.ts
  └── pages/
      ├── admin/
      │   ├── pre-ovid-inspection.tsx
      │   └── ...
      └── api/
          └── pre-ovid/

/tests
  └── e2e/
      ├── travel.cy.ts               # Testes de viagem
      ├── ism-audit-upload.cy.ts     # Testes de auditoria ISM
      └── ...

/docs
  └── modules/
      ├── travel-intelligence.md
      ├── ism-audits.md
      └── ...
```

---

## 📚 Documentação

### Módulos por PATCH
- [Travel Intelligence & Booking - PATCH-608](docs/modules/travel-intelligence.md)
- [ISM Audits - PATCH-609](docs/modules/ism-audits.md)
- [Pre-OVID Inspections - PATCH-610](docs/modules/pre-ovid.md)
- [Port State Control Pre-Inspection - PATCH-611](src/modules/pre-psc/README.md)
- [LSA & FFA Inspections - PATCH-612](docs/modules/lsa-ffa-inspections.md)

### Guias de Operação
- [Quick Start Guide](QUICK_START_GUIDE.md)
- [Deployment Checklist](DEPLOYMENT_FINAL_CHECKLIST.md)
- [Admin Control Center](ADMIN_CONTROL_CENTER.md)
- [Validation Guide](VALIDATION_GUIDE.md)
- [Nautilus README](README_NAUTILUS.md)

### Performance & Admin (PATCHES 541-543)
- [PATCH 541 - Performance Tools](PATCH_541_FINAL.md)
- [PATCH 542 - Image Optimization](PATCH_542_IMAGE_OPTIMIZATION.md)
- [PATCH 543 - Lighthouse CI](PATCH_543_LIGHTHOUSE_CI.md)
- [PATCHES 541-543 Final Report](PATCHES_541-543_FINAL_REPORT.md)

---

## 🛠️ Painéis de Administração

### Main Admin
- `/admin` - Admin Dashboard
- `/admin/control-center` - Admin Control Center Hub

### Maritime Operations (PATCHES 608-612)
- `/travel` - Travel Intelligence & Booking (PATCH-608)
- `/compliance/ism-audits` - ISM Auditorias Digitais (PATCH-609)
- `/admin/pre-ovid-inspection` - Pre-OVID Inspections (PATCH-610)
- `/pre-psc` - Port State Control Pre-Inspection (PATCH-611)
- `/lsa-ffa` - LSA & FFA Safety Inspections (PATCH-612)

### Performance & Monitoring
- `/admin/benchmark` - CPU Benchmark System
- `/admin/health-validation` - System Health Validator
- `/admin/code-health` - Code Health Dashboard
- `/admin/lighthouse-dashboard` - Performance Metrics
- `/logs-center-virtual` - Virtualized Logs

### System Management
- `/admin/templates` - Template Management
- `/admin/system-health` - System Health
- `/admin/audit` - Audit Management
- `/admin/mmi` - Maintenance Intelligence
- `/admin/sgso` - SGSO Management

---

## 📊 Business Intelligence

- Forecast por componente/sistema
- Exportação CSV/PDF
- Envio automático por cron (Resend)
- Performance metrics dashboard
- Core Web Vitals tracking
- Lighthouse score history

---

## 🧭 Roadmap

### Completed ✅
- [x] PATCH 608 - Travel Intelligence & Booking
- [x] PATCH 609 - ISM Audits Digital System
- [x] PATCH 541-543 - Performance & Optimization Tools
- [x] Admin Control Center
- [x] System Watchdog Integration
- [x] Automated CI/CD Pipeline

### In Progress 🚧
- [ ] PATCH 610 - Pré-OVID Inspections
- [ ] PATCH 611 - Port State Control Pre-Inspection
- [ ] PATCH 612 - LSA & FFA Safety Inspections
- [ ] SGSO finalization
- [ ] FMEA automated generation

### Planned 📋
- [ ] PATCH 613 - Auditorias LSA/FFA Avançadas
- [ ] PATCH 614 - Drill Manager (Exercícios simulados)
- [ ] PATCH 615 - ESG Compliance Tracker
- [ ] PATCH 616 - SIRE Pré-Auditoria (Oil Tankers)
- [ ] Advanced monitoring dashboards
- [ ] Real User Monitoring (RUM)

---

## 🔍 Troubleshooting

### Performance Issues
1. Check `/admin/lighthouse-dashboard`
2. Run `bash scripts/lighthouse-local.sh`
3. Review `/admin/code-health`
4. Check `/admin/benchmark`

### Build Issues
```bash
npm run clean
npm install
npm run build
```

### Health Check
```bash
# Open in browser
/admin/health-validation

# Or use CLI
npm run status
```

[➡️ Full Troubleshooting Guide](QUICK_START_GUIDE.md#troubleshooting)

---

## 👥 Equipe

- **Product Owner**: Rodrigo SC
- **Desenvolvedor Líder**: Rodrigo SC
- **Colaboradores**: IA GPT-4, GitHub Copilot, Supabase, Vercel
- **Maritime Operations**: PATCHES 608-612 Development Team

---

## 📌 Links Úteis

- 📖 [Documentação por módulo](docs/modules/)
- ✅ [Painel de status dos PATCHES](admin/control-center)
- 🧪 [Relatórios técnicos e validações](VALIDATION_GUIDE.md)
- 📦 [PATCHES 541-543 Final Report](PATCHES_541-543_FINAL_REPORT.md)
- 🚢 [Maritime Operations Documentation](README_NAUTILUS.md)

---

## 📄 Licença

MIT — © 2025 Nautilus One

---

## 🎯 System Highlights

### Maritime Operations Modules
- 🧭 **Travel Intelligence & Booking** - PATCH-608 ✅
- 🧠 **ISM Audits Digital System** - PATCH-609 ✅
- ⚠️ **Pre-OVID Inspections** - PATCH-610 🚧
- ⚠️ **Port State Control Pre-Inspection** - PATCH-611 🚧
- ⚠️ **LSA & FFA Safety Inspections** - PATCH-612 🚧

### Performance & Quality
- ⚡ **98% faster** list rendering
- 🚦 **92% Performance Score**
- 📊 **95% Accessibility Score**
- 🎯 **All Core Web Vitals Green**
- 🤖 **Automated CI/CD**

### Infrastructure
- 🛠️ **18+ Admin Tools**
- 🔐 **Row Level Security (RLS)**
- 🔍 **System Watchdog Active**
- 📈 **Production Ready**

**Sistema Operacional para Operações Navais! 🚢**
