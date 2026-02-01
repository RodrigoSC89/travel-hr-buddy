# 🏗️ Arquitetura Técnica - NAUTI ONE

> Documento de arquitetura técnica do sistema NAUTI ONE (Nautilus One)

## 📊 Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                     NAUTI ONE                               │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React 18 + TypeScript 5 + Tailwind)             │
├─────────────────────────────────────────────────────────────┤
│  State Management (TanStack Query + Zustand)                │
├─────────────────────────────────────────────────────────────┤
│  Backend (Supabase)                                         │
│  ├── PostgreSQL (Database)                                  │
│  ├── Edge Functions (Deno)                                  │
│  ├── Auth (JWT + OAuth)                                     │
│  └── Realtime (WebSocket)                                   │
├─────────────────────────────────────────────────────────────┤
│  External Services                                          │
│  ├── OpenAI GPT-4o (AI)                                     │
│  ├── Mapbox (Maps)                                          │
│  ├── ElevenLabs (Voice)                                     │
│  └── AIS/VTS APIs (Vessel Tracking)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Estrutura de Diretórios

```
src/
├── components/          # Componentes React reutilizáveis
│   ├── ui/             # Componentes UI base (shadcn/ui)
│   ├── fleet/          # Componentes de frota
│   ├── crew/           # Componentes de tripulação
│   ├── ai/             # Componentes de IA
│   └── v2/             # Componentes v2 (modernizados)
├── hooks/              # Custom hooks
│   ├── useVesselsRealData.ts
│   ├── useCrewMedicalData.ts
│   ├── useComplianceData.ts
│   └── ...
├── pages/              # Páginas/Rotas
├── modules/            # Módulos de negócio
│   ├── compliance-hub/
│   ├── nauti-people/
│   ├── medical-infirmary/
│   └── ...
├── lib/                # Utilitários e helpers
│   ├── logger.ts       # Logger centralizado
│   ├── utils.ts        # Funções utilitárias
│   └── performance/    # Performance monitoring
├── services/           # Serviços externos
│   ├── space-weather/
│   └── mocks/          # @deprecated
└── integrations/
    └── supabase/       # Cliente Supabase
```

---

## 🗄️ Banco de Dados (Supabase/PostgreSQL)

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `vessels` | Embarcações da frota |
| `crew_members` | Tripulantes |
| `maritime_certificates` | Certificados marítimos |
| `voyages` | Viagens/Rotas |
| `maintenance_records` | Registros de manutenção |
| `compliance_records` | Registros de conformidade |
| `soc_alerts` | Alertas do sistema |
| `ai_decisions` | Decisões de IA |
| `audit_logs` | Logs de auditoria |

### Políticas RLS

O sistema possui **2.395+ políticas RLS** implementadas para garantir:
- Isolamento de tenant (multi-tenant)
- Controle de acesso por role (RBAC)
- Proteção de dados sensíveis

---

## 🤖 Edge Functions (Supabase)

| Função | Descrição |
|--------|-----------|
| `ai-hub-chat` | Chat com IA centralizado |
| `safety-incident-ai` | Análise de segurança |
| `inventory-spares-ai` | Gestão de inventário |
| `training-ai-assistant` | Assistente de treinamento |
| `mapbox-token` | Token do Mapbox |
| `ais-tracking` | Rastreamento AIS |

---

## 📊 Hooks de Dados

### Hooks Críticos (Integrados com Supabase)

```typescript
// Embarcações com sensores
useVesselsRealData() -> VesselMonitor[]

// Dados médicos da tripulação
useCrewMedicalData() -> CrewMedicalData[]

// Rastreamento de frota
useFleetTrackingData() -> FleetData

// Conformidade
useComplianceData() -> ComplianceResult

// Manutenção preditiva
usePredictiveMaintenanceData() -> PredictedMaintenance[]

// Bem-estar da tripulação
useCrewWellnessData() -> CrewWellnessMember[]
```

---

## 🔐 Segurança

### Autenticação
- Supabase Auth (JWT)
- OAuth (Google, Microsoft)
- MFA (opcional)

### Autorização
- Row Level Security (RLS)
- Role-Based Access Control (RBAC)
- Políticas por tenant

### Auditoria
- `system_audit_logs` table
- Logs de todas as mutações críticas
- IP tracking, user agent

---

## ⚡ Performance

### Otimizações Implementadas

1. **Lazy Loading** - Todas as rotas são carregadas sob demanda
2. **TanStack Query** - Cache e deduplicação de requests
3. **Zustand** - State management leve
4. **WebSocket** - Atualizações em tempo real
5. **Service Worker** - Cache offline (PWA)

### Métricas Alvo

| Métrica | Alvo | Atual |
|---------|------|-------|
| LCP | < 2.5s | ✅ |
| FID | < 100ms | ✅ |
| CLS | < 0.1 | ✅ |
| Bundle Size | < 5MB | ✅ |

---

## 🧪 Testes

### Stack de Testes

- **Unit Tests**: Vitest
- **E2E Tests**: Playwright
- **Type Checking**: TypeScript 5
- **Linting**: ESLint

### Scripts

```bash
npm run test          # Testes unitários
npm run test:e2e      # Testes E2E
npm run typecheck     # Verificação de tipos
npm run lint          # Linting
```

---

## 🚀 Deploy

### Ambientes

| Ambiente | URL | Branch |
|----------|-----|--------|
| Production | nautilus.app | main |
| Staging | staging.nautilus.app | develop |
| Dev | localhost:8080 | feature/* |

### CI/CD Gates

```bash
npm run gate:no-console    # Verifica console.log
npm run gate:no-mock       # Verifica dados mock
npm run gate:no-ts-ignore  # Verifica @ts-ignore
```

---

## 📈 Métricas de Qualidade

### Estado Atual (Jan 2026)

| Dimensão | Nota |
|----------|------|
| Técnica | 9.0/10 |
| UX | 8.0/10 |
| Segurança | 8.7/10 |
| Regulatória | 8.2/10 |
| **GERAL** | **8.5/10** |

### Metas

- Zero `@ts-ignore` em produção ✅
- Zero mock data em hooks críticos ✅
- Type safety em componentes críticos ✅
- 420+ migrations no Supabase ✅
- 2.395+ políticas RLS ✅

---

## 📚 Referências

- [Supabase Docs](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

---

*Última atualização: Janeiro 2026*
