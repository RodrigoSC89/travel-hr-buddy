# 📚 Nautilus One - Documentação Técnica Completa

> **Versão**: 3.0.0  
> **Data**: 2025-12-08  
> **Status**: Produção

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico

| Camada | Tecnologias | Versão |
|--------|-------------|--------|
| **Frontend** | React, TypeScript, Vite | 18.3, 5.x, 5.x |
| **UI/UX** | Tailwind CSS, Radix UI, Shadcn/ui | 3.x |
| **State** | TanStack Query, React Hook Form | v5, 7.x |
| **Backend** | Supabase (PostgreSQL, Edge Functions) | 2.x |
| **Auth** | Supabase Auth (Email, OAuth) | - |
| **Storage** | Supabase Storage | - |
| **Realtime** | Supabase Realtime, WebSockets | - |
| **IA** | Lovable AI Gateway (Gemini 2.5 Flash) | - |
| **Mobile** | PWA + Capacitor | 7.x |

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                       NAUTILUS ONE v3.0                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐   │
│  │    FRONTEND      │  │    BACKEND       │  │   AI LAYER   │   │
│  │    (React)       │◄─┤   (Supabase)     │◄─┤  (Lovable)   │   │
│  │                  │  │                  │  │              │   │
│  │ • 248+ Pages     │  │ • 311 Tables     │  │ • 10+ Copil. │   │
│  │ • 126+ Modules   │  │ • 145+ Edge Fn   │  │ • Streaming  │   │
│  │ • 500+ Comps     │  │ • RLS Security   │  │ • Context    │   │
│  └──────────────────┘  └──────────────────┘  └──────────────┘   │
│           │                    │                    │            │
│           ▼                    ▼                    ▼            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    PERFORMANCE LAYER                      │   │
│  │                                                           │   │
│  │  • Lazy Loading     • Virtual Scroll    • Smart Cache    │   │
│  │  • Code Splitting   • Delta Sync        • Offline Queue  │   │
│  │  • Connection Aware • Rate Limiting     • Compression    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Pastas

```
nautilus-one/
├── src/
│   ├── modules/              # 30+ módulos de negócio
│   │   ├── crew-management/  # Gestão de tripulação
│   │   ├── fleet-operations/ # Operações de frota
│   │   ├── voyage-planner/   # Planejamento de viagens
│   │   ├── maintenance-planner/ # Manutenção preditiva
│   │   ├── nautilus-academy/ # Treinamentos CBT
│   │   ├── nautilus-command/ # Centro de comando
│   │   ├── document-hub/     # Gestão documental
│   │   ├── procurement-inventory/ # Compras e estoque
│   │   └── ...
│   │
│   ├── components/           # Componentes reutilizáveis
│   │   ├── ui/              # Shadcn/ui primitivos
│   │   ├── layout/          # Layout da aplicação
│   │   ├── unified/         # Componentes consolidados
│   │   └── performance/     # Componentes de performance
│   │
│   ├── hooks/               # 110+ Custom hooks
│   │   ├── unified/         # Hooks consolidados
│   │   ├── ai/              # Hooks de IA
│   │   └── performance/     # Hooks de performance
│   │
│   ├── lib/                 # Bibliotecas e utilitários
│   │   ├── performance/     # 60+ arquivos de otimização
│   │   ├── offline/         # Suporte offline
│   │   ├── unified/         # Libs consolidadas
│   │   └── pwa/            # PWA utilities
│   │
│   ├── contexts/            # React Contexts
│   ├── services/            # Serviços de API
│   ├── integrations/        # Supabase client
│   └── pages/               # Páginas da aplicação
│
├── supabase/
│   ├── functions/           # 145+ Edge Functions
│   ├── migrations/          # Database migrations
│   └── config.toml         # Supabase config
│
├── docs/                    # Documentação
├── locales/                 # Internacionalização
└── public/                  # Assets estáticos
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais (311 total)

| Categoria | Tabelas | Descrição |
|-----------|---------|-----------|
| **Core** | `organizations`, `profiles`, `user_roles` | Usuários e orgs |
| **Crew** | `crew_members`, `crew_payroll`, `crew_certificates` | Tripulação |
| **Fleet** | `vessels`, `vessel_positions`, `vessel_status` | Embarcações |
| **Voyage** | `voyages`, `voyage_legs`, `ports` | Viagens |
| **Maintenance** | `maintenance_schedules`, `work_orders`, `parts_inventory` | Manutenção |
| **Training** | `academy_courses`, `academy_progress`, `cbt_courses` | Treinamentos |
| **Compliance** | `ism_audits`, `peotram_audits`, `non_conformities` | Conformidade |
| **Documents** | `documents`, `document_versions`, `templates` | Documentos |
| **AI** | `ai_logs`, `ai_memory_events`, `ai_suggestions` | IA |
| **Analytics** | `analytics_events`, `analytics_metrics` | Analytics |

### Políticas de Segurança (RLS)

```sql
-- Exemplo: Acesso a crew_payroll (apenas HR/Finance)
CREATE POLICY "Only HR and Admin can view payroll"
ON public.crew_payroll
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organization_users ou
    WHERE ou.user_id = auth.uid()
    AND ou.role IN ('admin', 'hr_manager', 'manager')
    AND ou.status = 'active'
  )
  OR auth.uid() = crew_payroll.crew_member_id
);
```

---

## 🤖 Integração de IA

### Edge Functions de IA

| Function | Módulo | Funcionalidade |
|----------|--------|----------------|
| `nautilus-command` | Command Center | Briefings, alertas, decisões |
| `nautilus-ai` | Universal | Hub central de IA |
| `crew-ai-copilot` | Crew | Escalas, compliance, gaps |
| `mmi-advanced-copilot` | Maintenance | Predição de falhas |
| `training-ai-assistant` | Academy | Planos personalizados |
| `voyage-ai-copilot` | Voyage | Otimização de rotas |
| `compliance-ai` | Compliance | Auditorias, ISM |

### Hook Universal de IA

```typescript
import { useNautilusAI } from '@/hooks/useNautilusAI';

function Component() {
  const { query, predict, analyze, suggest, isLoading } = useNautilusAI();
  
  // Predição de manutenção
  const result = await predict('maintenance', 
    'Analise histórico do motor principal', 
    { vesselId: '123' }
  );
  
  // Chat com contexto
  const chat = await query({
    module: 'command',
    action: 'chat',
    prompt: 'Status da frota hoje?'
  });
}
```

### Prompt por Módulo

| Módulo | Especialização |
|--------|---------------|
| `maintenance` | Manutenção preditiva, SOLAS, ISM |
| `crew` | MLC 2006, STCW, escalas |
| `voyage` | Weather routing, ECDIS, otimização |
| `qhse` | ISM/ISPS, TMSA, OCIMF |
| `peodp` | PEO-DP, IMCA, NORMAM |
| `training` | CBT, STCW, simuladores |
| `command` | Visão 360°, alertas, KPIs |

---

## 🚀 Performance para Internet Lenta

### Estratégias Implementadas

| Técnica | Arquivo | Impacto |
|---------|---------|---------|
| **Lazy Loading** | `App.tsx` | 15+ rotas lazy |
| **Code Splitting** | `vite.config.ts` | Chunks otimizados |
| **Virtual Scroll** | `VirtualizedList.tsx` | Listas infinitas |
| **Smart Cache** | `api-cache-layer.ts` | TTL adaptativo |
| **Offline Queue** | `offline-queue.ts` | Mutations offline |
| **Delta Sync** | `delta-sync.ts` | Sync incremental |
| **Compression** | `compression.ts` | Payload comprimido |
| **Connection Aware** | `SlowNetworkOptimizer.tsx` | Adaptativo |

### Comportamento por Velocidade

| Conexão | Ações Automáticas |
|---------|-------------------|
| **> 5 Mbps** | Modo completo, prefetch ativo |
| **2-5 Mbps** | Reduz animações, aumenta cache |
| **< 2 Mbps** | Skeleton loaders, 1 request por vez |
| **< 0.5 Mbps** | Modo crítico, cache 5x, LQ images |
| **Offline** | Queue mutations, show cached data |

### Hooks de Performance

```typescript
import { 
  useConnectionQuality,
  useSlowConnectionFetch,
  useAdaptivePolling,
  useBandwidthOptimizer
} from '@/hooks';

// Detectar qualidade
const { quality, effectiveBandwidth } = useConnectionQuality();

// Fetch com cache automático
const { data, loading } = useSlowConnectionFetch(
  () => api.getVessels(),
  'vessels-list'
);

// Polling adaptativo (30s → 120s em slow)
const { data: status } = useAdaptivePolling(
  () => api.getStatus(),
  30000
);
```

---

## 📱 PWA & Mobile

### Configuração PWA

```typescript
// vite.config.ts
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Nautilus One',
    short_name: 'Nautilus',
    theme_color: '#0f766e',
    icons: [...]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    runtimeCaching: [...]
  }
})
```

### Capacitor (App Nativo)

```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  appId: 'app.lovable.ead06aada7d445d3bdf7e23796c6ac50',
  appName: 'Nautilus One',
  webDir: 'dist',
  server: {
    url: 'https://ead06aad-a7d4-45d3-bdf7-e23796c6ac50.lovableproject.com',
    cleartext: true
  },
  plugins: {
    PushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] },
    LocalNotifications: { smallIcon: 'ic_stat_icon' }
  }
};
```

---

## 🔐 Segurança

### Medidas Implementadas

| Área | Implementação |
|------|---------------|
| **RLS** | Todas as tabelas com políticas |
| **RBAC** | Roles: admin, hr_manager, manager, employee |
| **Rate Limiting** | 60 logs/min/user |
| **Audit Trail** | Triggers em tabelas sensíveis |
| **Session Management** | Token rotation, device tracking |
| **Encryption** | Dados sensíveis criptografados |

### Funções de Segurança

```sql
-- Verificar role do usuário
SELECT public.get_user_role(auth.uid());

-- Verificar permissão específica
SELECT public.has_permission('crew_management', 'write');

-- Verificar acesso a organização
SELECT public.user_belongs_to_organization(org_id);
```

---

## 🧪 Testes

### Estrutura de Testes

```
tests/
├── unit/           # Jest + Testing Library
├── integration/    # Vitest
├── e2e/           # Playwright
└── mocks/         # Mock data
```

### Comandos

```bash
npm run test           # Unit tests
npm run test:e2e       # E2E tests
npm run test:coverage  # Coverage report
```

---

## 📦 Deploy

### Build

```bash
npm run build         # Production build
npm run preview       # Preview build
```

### Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://vnbptmixvwropvanyhdb.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

### Edge Functions Deploy

```bash
# Automático via Lovable
# Manual: supabase functions deploy <function-name>
```

---

## 📊 Métricas

| Métrica | Valor |
|---------|-------|
| Componentes | 500+ |
| Páginas | 248+ |
| Módulos | 126+ |
| Edge Functions | 145+ |
| Tabelas DB | 311 |
| Hooks | 110+ |
| Lighthouse Score | 92+ |

---

## 🔗 Links Úteis

- [Supabase Dashboard](https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb)
- [Edge Functions Logs](https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/functions)
- [SQL Editor](https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/sql/new)
- [Auth Settings](https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/auth/providers)

---

*Documentação gerada automaticamente - Nautilus One v3.0.0*
