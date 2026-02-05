# 🚢 NAUTI ONE - Documentação Técnica Completa

> Guia Definitivo para Desenvolvedores | Sistema de Gestão Marítima Integrado

---

## 📋 Índice

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Arquitetura Técnica](#2-arquitetura-técnica)
3. [Estrutura do Código](#3-estrutura-do-código)
4. [Principais Módulos](#4-principais-módulos)
5. [Database Schema](#5-database-schema)
6. [Dívidas Técnicas](#6-dívidas-técnicas)
7. [Guia de Setup Local](#7-guia-de-setup-local)
8. [Como Contribuir](#8-como-contribuir)
9. [Próximos Passos](#9-próximos-passos)

---

## 1. Visão Geral do Sistema

### 1.1 O que é NAUTI ONE?

**NAUTI ONE** é uma plataforma SaaS completa para gestão de operações marítimas, projetada para companhias de navegação, armadores e operadores de frota.

#### Problema que Resolve

| Problema | Impacto | Nossa Solução |
|----------|---------|---------------|
| Gestão fragmentada em múltiplos sistemas | Perda de dados, retrabalho | Plataforma unificada all-in-one |
| Falta de visibilidade em tempo real | Decisões lentas, riscos | Monitoramento via AIS/SATCOM |
| Compliance manual e propenso a erros | Multas, detenções | Compliance automatizado |
| Ineficiência por processos manuais | Alto custo operacional | Workflows digitalizados |
| Dificuldade em rastrear custos | Margem pressionada | Analytics completo |

#### Solução Oferecida

- ✅ **Plataforma Unificada** - 50+ módulos integrados
- ✅ **Real-Time Tracking** - Monitoramento ao vivo via AIS
- ✅ **Compliance Automatizado** - ISM, ISPS, MLC, MARPOL
- ✅ **AI-Powered** - 16+ agentes de IA especializados
- ✅ **Telemedicine 24/7** - Consultas remotas integradas
- ✅ **ESG Completo** - Carbon tracking + CSRD/CDP

### 1.2 Usuários-Alvo

```
┌─────────────────────────────────────────────────────────────┐
│  PRIMARY: Companhias de Navegação                           │
│  ├── Fleet Managers (Gestores de Frota)                    │
│  ├── Superintendentes Técnicos                             │
│  ├── Gerentes de Operações                                 │
│  ├── Diretores de Compliance                               │
│  └── CFOs e Controllers                                    │
├─────────────────────────────────────────────────────────────┤
│  SECONDARY: Tripulações a Bordo                             │
│  ├── Capitães e Oficiais                                   │
│  ├── Engenheiros                                           │
│  ├── Crew Members                                          │
│  └── Médicos de Bordo                                      │
├─────────────────────────────────────────────────────────────┤
│  TERTIARY: Fornecedores e Parceiros                         │
│  ├── Fornecedores de Spare Parts                           │
│  ├── Estaleiros                                            │
│  ├── Agentes Portuários                                    │
│  └── Seguradoras                                           │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Números do Sistema

| Métrica | Valor | Descrição |
|---------|-------|-----------|
| **Módulos** | 50+ | Módulos funcionais completos |
| **Edge Functions** | 280+ | Serverless functions (Deno) |
| **Database Tables** | 711 | Tabelas PostgreSQL |
| **RLS Policies** | 2.145+ | Row Level Security policies |
| **Components** | 500+ | React components |
| **Pages** | 200+ | Route pages |
| **Custom Hooks** | 50+ | React hooks |

### 1.4 Diferenciais Competitivos

| Diferencial | NAUTI ONE | Competidores |
|-------------|-----------|--------------|
| All-in-One | ✅ 50+ módulos | Sistemas separados |
| Real-Time | ✅ AIS + SATCOM | Dados defasados |
| AI-Powered | ✅ 16+ AI agents | Manual ou básico |
| Offline-First | ✅ PWA + IndexedDB | Requer conexão |
| Telemedicina | ✅ Integrada | Sistema separado |
| ESG Completo | ✅ CII + CSRD | Planilhas |

### 1.5 Mercado

```
TAM (Total Addressable Market):
├── 95.000+ navios comerciais no mundo
├── Mercado de $8B+ em maritime software
└── Crescimento: 12% ao ano

Competidores Principais:
├── DNV ShipManager (líder global)
├── Helm CONNECT
├── SERTICA
├── PRIME Marine
├── SeaLogs
└── Veson IMOS
```

---

## 2. Arquitetura Técnica

### 2.1 Stack Tecnológico

#### Frontend

| Categoria | Tecnologia | Versão | Uso |
|-----------|------------|--------|-----|
| **Framework** | React | 18.3 | Core framework |
| **Language** | TypeScript | 5.6+ | Type safety |
| **Build Tool** | Vite | 5.4 | Dev + Production build |
| **Routing** | React Router | v6 | Client-side routing |
| **Styling** | Tailwind CSS | 3.4 | Utility-first CSS |
| **Components** | shadcn/ui | Latest | Base UI components |
| **Icons** | Lucide React | Latest | Icon library |
| **Charts** | Recharts | 2.x | Data visualization |
| **Forms** | React Hook Form | 7.x | Form handling |
| **Validation** | Zod | 4.x | Schema validation |
| **State (Server)** | TanStack Query | 5.x | Server state |
| **State (Client)** | React Context | - | Auth, theme |
| **Animations** | Framer Motion | 11.x | Animations |
| **Maps** | Mapbox GL | 3.x | Interactive maps |

#### Backend (Supabase)

| Componente | Tecnologia | Descrição |
|------------|------------|-----------|
| **Database** | PostgreSQL 15 | ACID, JSON, extensions |
| **API** | PostgREST | Auto-generated REST API |
| **Auth** | Supabase Auth | JWT-based authentication |
| **Realtime** | WebSocket | Live subscriptions |
| **Storage** | S3-compatible | Object storage |
| **Functions** | Deno Runtime | Edge functions (280+) |
| **Security** | RLS | Row Level Security |

#### AI & Machine Learning

| Tecnologia | Uso |
|------------|-----|
| OpenAI GPT-4o | Primary LLM |
| Google Gemini 2.5 | Secondary LLM |
| ElevenLabs | Voice synthesis |
| TensorFlow.js | On-device ML |
| Tesseract.js | OCR processing |

#### Mobile & PWA

| Tecnologia | Uso |
|------------|-----|
| Capacitor 7 | Native apps |
| Service Worker | Offline cache |
| IndexedDB (Dexie) | Local storage |
| Push Notifications | Alerts |

### 2.2 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                   │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  React 18 + TypeScript + Vite                               │     │
│  │  ├── Components (shadcn/ui + custom)                        │     │
│  │  ├── Pages (React Router v6)                                │     │
│  │  ├── Hooks (TanStack Query)                                 │     │
│  │  ├── Contexts (Auth, Tenant, Theme)                         │     │
│  │  └── Stores (local state)                                   │     │
│  └────────────────────────────────────────────────────────────┘     │
│                              ↕                                       │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  Supabase Client                                            │     │
│  │  ├── Auth (JWT tokens)                                      │     │
│  │  ├── Database (PostgREST queries)                           │     │
│  │  ├── Realtime (WebSocket subscriptions)                     │     │
│  │  ├── Storage (file uploads)                                 │     │
│  │  └── Functions (RPC calls)                                  │     │
│  └────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
                                 ↕
┌─────────────────────────────────────────────────────────────────────┐
│                           BACKEND                                    │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  Supabase Platform (Project: vnbptmixvwropvanyhdb)         │     │
│  │                                                             │     │
│  │  ┌─────────────────────────────────────────────────────┐   │     │
│  │  │  PostgreSQL 15                                       │   │     │
│  │  │  ├── 711 Tables                                      │   │     │
│  │  │  ├── 2.145+ RLS Policies                            │   │     │
│  │  │  ├── 1.936+ Indexes                                  │   │     │
│  │  │  ├── Functions (PL/pgSQL)                            │   │     │
│  │  │  └── Triggers (audit, validation)                    │   │     │
│  │  └─────────────────────────────────────────────────────┘   │     │
│  │                                                             │     │
│  │  ┌─────────────────────────────────────────────────────┐   │     │
│  │  │  Edge Functions (Deno Runtime)                       │   │     │
│  │  │  ├── 280+ serverless functions                       │   │     │
│  │  │  ├── Business logic                                  │   │     │
│  │  │  ├── AI/LLM integrations                             │   │     │
│  │  │  ├── External API calls                              │   │     │
│  │  │  └── Scheduled jobs                                  │   │     │
│  │  └─────────────────────────────────────────────────────┘   │     │
│  │                                                             │     │
│  │  ┌─────────────────────────────────────────────────────┐   │     │
│  │  │  Storage (S3-compatible)                             │   │     │
│  │  │  └── Buckets: documents, photos, files               │   │     │
│  │  └─────────────────────────────────────────────────────┘   │     │
│  │                                                             │     │
│  │  ┌─────────────────────────────────────────────────────┐   │     │
│  │  │  Realtime (WebSocket)                                │   │     │
│  │  │  └── Live subscriptions                              │   │     │
│  │  └─────────────────────────────────────────────────────┘   │     │
│  └────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
                                 ↕
┌─────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ OpenAI   │  │ Weather  │  │ AIS APIs │  │ ESG APIs │            │
│  │ GPT-4o   │  │ Providers│  │ Marine   │  │ Climatiq │            │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ ElevenLab│  │ Stripe   │  │ Twilio   │  │ SendGrid │            │
│  │ Voice    │  │ Payments │  │ SMS      │  │ Email    │            │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.3 Request Flow - Exemplo

```
┌─────────────────────────────────────────────────────────────────┐
│  1. USER ACTION                                                  │
│     └── Usuário clica "Add Vessel" e preenche form              │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. FRONTEND VALIDATION                                          │
│     └── Zod schema valida dados                                 │
│         ├── Se inválido: mostra erros inline                    │
│         └── Se válido: prossegue                                │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. REACT QUERY MUTATION                                         │
│     └── useCreateVessel() hook invocado                         │
│         └── Optimistic update (UI atualiza imediatamente)       │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. SUPABASE CLIENT CALL                                         │
│     └── supabase.from('vessels').insert(data)                   │
│         └── Request HTTP POST via PostgREST                     │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│  5. SUPABASE BACKEND                                             │
│     ├── Auth Check: JWT token validado                          │
│     ├── RLS Policy: Verifica company_id = user.company_id       │
│     ├── Database Insert: INSERT na tabela vessels               │
│     ├── Trigger: audit_log trigger dispara                      │
│     └── Response: Retorna vessel criado + ID                    │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│  6. REACT QUERY CACHE UPDATE                                     │
│     ├── Cache atualizado com dados reais do servidor            │
│     └── Queries relacionadas invalidadas                        │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│  7. UI UPDATE                                                    │
│     ├── Toast: "Vessel created successfully"                    │
│     ├── Lista de vessels atualizada                             │
│     └── Redirect para detail view                               │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│  8. REALTIME (opcional)                                          │
│     └── Se outro usuário está na mesma view                     │
│         └── Recebe update via WebSocket                         │
│             └── UI dele atualiza automaticamente                │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 Multi-Tenancy Architecture

```sql
-- Estratégia: Row Level Security (RLS)
-- Cada companhia de navegação = 1 tenant isolado

-- organizations table (tenant root)
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  settings JSONB DEFAULT '{}'
);

-- profiles table (users linked to tenants)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  role TEXT NOT NULL, -- admin, manager, user, crew
  full_name TEXT
);

-- RLS Policy Example (applied to ALL tables)
CREATE POLICY "Company isolation"
  ON vessels FOR ALL
  USING (
    organization_id = (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid()
    )
  );
```

**Benefits:**
- ✅ Isolamento total de dados por tenant
- ✅ Security no database level
- ✅ Zero chance de data leakage
- ✅ Escalável (1 database, N tenants)

### 2.5 Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: TRANSPORT (HTTPS/TLS 1.3)                             │
│  └── All traffic encrypted in transit                          │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2: AUTHENTICATION (Supabase Auth)                        │
│  ├── JWT tokens (access + refresh)                              │
│  ├── Token expiry: 1 hour (access), 7 days (refresh)            │
│  └── Session management                                         │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 3: AUTHORIZATION (RLS)                                   │
│  ├── Row Level Security on ALL 711 tables                       │
│  ├── 2.145+ policies enforced at database level                 │
│  └── Multi-tenant isolation via organization_id                 │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 4: ROLE-BASED ACCESS (RBAC)                              │
│  ├── Roles: super_admin, admin, manager, user, crew             │
│  └── Permissions per role per resource                          │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 5: DATA PROTECTION                                       │
│  ├── Encryption at rest (Supabase default)                      │
│  ├── Sensitive data masking (medical, financial)                │
│  └── GDPR compliance measures                                   │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 6: AUDIT & MONITORING                                    │
│  ├── Audit trail for all changes                                │
│  ├── Access logs with IP, user agent                            │
│  └── Anomaly detection (AI-powered)                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Estrutura do Código

### 3.1 Organização de Pastas

```
nautilus-one/
├── docs/                           # Documentação
│   ├── README_TECHNICAL.md        # Este arquivo
│   ├── handoff/                   # Documentos de handoff
│   ├── onboarding/                # Guias de onboarding
│   ├── security/                  # Documentação de segurança
│   └── development/               # Guias de desenvolvimento
│
├── public/                         # Assets estáticos
│   ├── sw.js                      # Service Worker
│   ├── manifest.json              # PWA manifest
│   └── icons/                     # App icons
│
├── src/                            # Código fonte (Frontend)
│   ├── components/                # React Components
│   │   ├── ui/                   # shadcn/ui base (50+ components)
│   │   ├── common/               # Shared components
│   │   ├── layouts/              # Layout components
│   │   ├── auth/                 # Auth components
│   │   └── tier1/                # Premium Tier-1 components
│   │       ├── finance/          # VoyagePnL, Laytime
│   │       ├── compliance/       # ISM/ISPS Audit Center
│   │       ├── operations/       # Port Call, Voyage Optimizer
│   │       ├── maintenance/      # PMS, Spare Parts
│   │       ├── people/           # STCW Matrix, Sea Time
│   │       ├── medical/          # Telemedicine, EHR
│   │       ├── waste/            # MARPOL Annex V
│   │       ├── esg/              # CII, EU ETS
│   │       ├── tracking/         # AIS Fleet Tracker
│   │       └── system/           # Integration Hub
│   │
│   ├── pages/                     # Route pages (200+)
│   │   ├── Dashboard.tsx
│   │   ├── Fleet/
│   │   ├── Crew/
│   │   ├── Maintenance/
│   │   ├── Compliance/
│   │   ├── Finance/
│   │   └── ...
│   │
│   ├── modules/                   # Feature modules
│   │   ├── compliance-hub/
│   │   ├── waste-management/
│   │   ├── digital-infirmary/
│   │   └── ...
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useVessels.ts
│   │   ├── useCrew.ts
│   │   └── data-hooks.ts         # CRUD hooks for all entities
│   │
│   ├── contexts/                  # React Contexts
│   │   ├── AuthContext.tsx
│   │   ├── TenantContext.tsx
│   │   └── OrganizationContext.tsx
│   │
│   ├── services/                  # API services
│   │   ├── vesselService.ts
│   │   ├── crewService.ts
│   │   └── ...
│   │
│   ├── integrations/              # External integrations
│   │   └── supabase/
│   │       ├── client.ts         # Supabase client
│   │       └── types.ts          # Generated types (DO NOT EDIT)
│   │
│   ├── lib/                       # Utilities
│   │   ├── utils.ts              # Helper functions
│   │   ├── logger.ts             # Centralized logging
│   │   ├── performance/          # Performance optimizations
│   │   └── security/             # Security utilities
│   │
│   ├── types/                     # TypeScript types
│   │   ├── common.ts
│   │   └── ...
│   │
│   ├── App.tsx                    # Root component
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Design system tokens
│
├── supabase/                       # Backend (Supabase)
│   ├── functions/                 # Edge Functions (280+)
│   │   ├── _shared/              # Shared utilities
│   │   ├── nauti-brain/          # AI orchestration
│   │   ├── ai-chat/              # Chat functions
│   │   └── ...
│   │
│   ├── migrations/                # Database migrations
│   │   └── (500+ migration files)
│   │
│   └── config.toml                # Supabase config
│
├── package.json                    # Dependencies
├── vite.config.ts                 # Vite configuration
├── tailwind.config.ts             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
└── CONTRIBUTING.md                # Contributing guide
```

### 3.2 Naming Conventions

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| **Components** | PascalCase | `VesselCard.tsx` |
| **Pages** | PascalCase | `Dashboard.tsx` |
| **Hooks** | camelCase + `use` | `useVessels.ts` |
| **Utils** | camelCase | `formatDate.ts` |
| **Constants** | SCREAMING_SNAKE | `MAX_FILE_SIZE` |
| **Database** | snake_case | `vessel_id`, `created_at` |
| **CSS Classes** | kebab-case | `vessel-card` |
| **Context** | PascalCase + `Context` | `AuthContext.tsx` |

### 3.3 Component Structure Pattern

```tsx
// Standard component structure
// src/components/vessels/VesselCard.tsx

// 1. Imports (ordenados)
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Ship, MapPin } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVessel } from '@/hooks/useVessels';
import { formatDate } from '@/lib/utils';
import type { Vessel } from '@/types';

// 2. Types/Interfaces
interface VesselCardProps {
  vessel: Vessel;
  onSelect?: (vessel: Vessel) => void;
  isCompact?: boolean;
}

// 3. Component
export function VesselCard({ vessel, onSelect, isCompact = false }: VesselCardProps) {
  // 3.1 Hooks (ordem: state, effects, queries)
  const [isHovered, setIsHovered] = useState(false);
  const { data: vesselDetails, isLoading } = useVessel(vessel.id);

  // 3.2 Derived state / Memoization
  const statusColor = useMemo(() => {
    switch (vessel.status) {
      case 'active': return 'bg-green-500';
      case 'in_port': return 'bg-blue-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-muted';
    }
  }, [vessel.status]);

  // 3.3 Handlers
  const handleClick = () => {
    onSelect?.(vessel);
  };

  // 3.4 Early returns
  if (isLoading) {
    return <VesselCardSkeleton />;
  }

  // 3.5 Render
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="flex flex-row items-center gap-4">
        <Ship className="h-6 w-6" />
        <div>
          <h3 className="font-semibold">{vessel.name}</h3>
          <p className="text-sm text-muted-foreground">
            IMO {vessel.imo_number}
          </p>
        </div>
        <Badge className={statusColor}>{vessel.status}</Badge>
      </CardHeader>
      {!isCompact && (
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{vessel.current_port || 'At sea'}</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// 4. Sub-components (se necessário)
function VesselCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="h-20 bg-muted" />
    </Card>
  );
}
```

### 3.4 React Query Patterns

```tsx
// src/hooks/useVessels.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Vessel, VesselInsert } from '@/types';

// Query Keys (centralizados)
export const vesselKeys = {
  all: ['vessels'] as const,
  lists: () => [...vesselKeys.all, 'list'] as const,
  list: (filters: string) => [...vesselKeys.lists(), filters] as const,
  details: () => [...vesselKeys.all, 'detail'] as const,
  detail: (id: string) => [...vesselKeys.details(), id] as const,
};

// Fetch all vessels
export function useVessels() {
  return useQuery({
    queryKey: vesselKeys.lists(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Vessel[];
    },
  });
}

// Fetch single vessel
export function useVessel(id: string) {
  return useQuery({
    queryKey: vesselKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vessels')
        .select(`
          *,
          crew_members (id, full_name, rank),
          maintenance_jobs (id, title, status, due_date)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id, // Only fetch if id exists
  });
}

// Create vessel
export function useCreateVessel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (vessel: VesselInsert) => {
      const { data, error } = await supabase
        .from('vessels')
        .insert(vessel)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vesselKeys.lists() });
      toast.success(`Vessel "${data.name}" created successfully`);
    },
    onError: (error) => {
      toast.error('Failed to create vessel');
      console.error('Create vessel error:', error);
    },
  });
}

// Update vessel
export function useUpdateVessel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Vessel> & { id: string }) => {
      const { data, error } = await supabase
        .from('vessels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vesselKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: vesselKeys.lists() });
      toast.success('Vessel updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update vessel');
      console.error('Update vessel error:', error);
    },
  });
}

// Delete vessel
export function useDeleteVessel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vessels')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vesselKeys.lists() });
      toast.success('Vessel deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete vessel');
      console.error('Delete vessel error:', error);
    },
  });
}
```

### 3.5 Logging Standards

```typescript
// ❌ NUNCA use console.log diretamente
console.log('User logged in'); // ERRADO

// ✅ Use o logger centralizado
import { logger } from '@/lib/logger';

// Info - para eventos normais
logger.info('User logged in', { userId: user.id, email: user.email });

// Warn - para situações que precisam atenção
logger.warn('Rate limit approaching', { 
  currentRequests: count, 
  limit: 100 
});

// Error - para erros que precisam investigação
logger.error('Failed to fetch data', error, { 
  endpoint: '/api/vessels',
  userId: user.id 
});

// Debug - para troubleshooting (não aparece em prod)
logger.debug('API response', { data, duration: ms });
```

---

## 4. Principais Módulos

### 4.1 Mapa de Módulos

```
┌─────────────────────────────────────────────────────────────────────┐
│                        OPERATIONS COMMAND                            │
├─────────────────────────────────────────────────────────────────────┤
│  1. Operations Hub          Central de operações                    │
│  2. Fleet Management        Gestão de frota + AIS tracking          │
│  3. Voyage Planning         Planejamento + weather routing          │
│  4. Logistics               Suprimentos + port calls                │
│  5. Port Call Manager       Berth scheduling + agents               │
│  6. Voyage Optimizer        Route optimization + fuel analysis      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        MAINTENANCE HUB                               │
├─────────────────────────────────────────────────────────────────────┤
│  7. PMS Engine              Planned Maintenance System               │
│  8. Spare Parts Inventory   ROB, min/max, critical spares           │
│  9. Drydock Management      Docagem + CAPEX tracking                │
│  10. Fuel Management        Bunker + consumption tracking           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      COMPLIANCE & AUDITS                             │
├─────────────────────────────────────────────────────────────────────┤
│  11. ISM/ISPS Audit Center  Checklists + NCR tracking               │
│  12. MLC 2006 Compliance    Maritime Labour Convention              │
│  13. MARPOL Compliance      Pollution prevention                    │
│  14. Certifications         DOC, SMC, ISSC tracking                 │
│  15. Risk Matrix            HIRA + risk scoring                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          PEOPLE HUB                                  │
├─────────────────────────────────────────────────────────────────────┤
│  16. STCW Competency Matrix Table A-II/III compliance               │
│  17. Sea Time Calculator    MLC eligibility + certification         │
│  18. Crew Management        Embarkation + rotations                 │
│  19. Training & Development Courses + certifications                │
│  20. Performance Management Appraisals + KPIs                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        HEALTH & SAFETY                               │
├─────────────────────────────────────────────────────────────────────┤
│  21. Digital Infirmary      EHR + telemedicine                      │
│  22. Medical Records        GDPR compliant storage                  │
│  23. Incident Reporting     LTIFR + root cause analysis             │
│  24. Safety Drills          Schedules + compliance                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      FINANCE & CONTRACTS                             │
├─────────────────────────────────────────────────────────────────────┤
│  25. Voyage P&L Calculator  TCE + cost breakdown                    │
│  26. Laytime/Demurrage      BIMCO compliant calculations            │
│  27. Procurement            PO workflow + approvals                 │
│  28. Supplier Portal        Self-service portal                     │
│  29. Budget Management      CAPEX + OPEX tracking                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       ESG & SUSTAINABILITY                           │
├─────────────────────────────────────────────────────────────────────┤
│  30. Carbon Intensity (CII) IMO 2023+ compliance                    │
│  31. EU ETS Compliance      EUA position + cost forecast            │
│  32. Waste Management       MARPOL Annex V + GRB                    │
│  33. ESG Reporting          CSRD, CDP, TCFD                         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      TRACKING & TELEMETRY                            │
├─────────────────────────────────────────────────────────────────────┤
│  34. AIS Fleet Tracker      Real-time positions + geofencing        │
│  35. SATCOM Dashboard       Communication status                    │
│  36. Predictive Analytics   ML-based predictions                    │
│  37. Alerts & Notifications Multi-channel alerts                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       AI CONTROL TOWER                               │
├─────────────────────────────────────────────────────────────────────┤
│  38. AI Hub                 Central orchestration                   │
│  39. Chat & Assistants      GPT-4o + Gemini                         │
│  40. 16+ AI Agents          Specialized per domain                  │
│  41. Voice Assistant        ARIA (ElevenLabs)                       │
│  42. AI Audit               Autonomous auditing                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         SYSTEM HUB                                   │
├─────────────────────────────────────────────────────────────────────┤
│  43. Integration Hub        Third-party APIs + webhooks             │
│  44. Settings               Company + user preferences              │
│  45. User Management        RBAC + permissions                      │
│  46. API Gateway            Rate limiting + logs                    │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Módulos Críticos - Deep Dive

#### Fleet Management

```typescript
// Localização: src/pages/Fleet/
// Tier-1 Components: src/components/tier1/operations/

// Funcionalidades:
- Lista de embarcações da frota
- Status em tempo real (via AIS)
- Detalhes técnicos de cada vessel
- Documentação (certificates, surveys)
- Maintenance history
- Crew assignment

// Tabelas Supabase:
- vessels
- vessel_specifications
- vessel_certificates
- vessel_equipment
- vessel_documents

// Hooks:
- useVessels()
- useVessel(id)
- useVesselCertificates(vesselId)
- useVesselCrew(vesselId)

// APIs Externas (planejadas):
- MarineTraffic AIS
- VesselFinder
- Weather providers
```

#### Compliance Hub

```typescript
// Localização: src/pages/Compliance/
// Tier-1 Components: src/components/tier1/compliance/

// Funcionalidades:
- ISM/ISPS Audit checklists
- NCR (Non-Conformity Report) tracking
- CAPA (Corrective Action) management
- Certificate expiry tracking
- DOC/SMC/ISSC status
- Compliance scoring

// Tabelas Supabase:
- compliance_items
- audits
- audit_findings
- ncrs
- capas
- certificates

// Regras de Negócio:
- Certificates expiring < 30 days: Yellow alert
- Certificates expired: Red alert + block operations
- NCRs open > 90 days: Auto-escalate
- Critical findings: Immediate notification
```

#### Digital Infirmary

```typescript
// Localização: src/pages/DigitalInfirmary/
// Tier-1 Components: src/components/tier1/medical/

// Funcionalidades:
- Electronic Health Records (EHR)
- Telemedicine integration
- Medical inventory management
- Vaccination tracking
- Medical certificates (MLC 2006)
- Incident reporting (LTIFR)

// Tabelas Supabase:
- crew_medical_records
- medical_visits
- medical_inventory
- vaccinations
- medical_certificates
- medical_incidents

// Compliance:
- MLC 2006 (Maritime Labour Convention)
- GDPR (data privacy)
- Medical data encryption required

// Security:
- Restricted access (Admin, Medical Officer only)
- Audit trail mandatory
- Self-view exception for crew members
```

---

## 5. Database Schema

### 5.1 Core Tables

#### Organizations (Tenants)

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
```

#### Profiles (Users)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user', -- super_admin, admin, manager, user, crew
  permissions JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view profiles in same org"
  ON profiles FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );
```

#### Vessels

```sql
CREATE TABLE vessels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  
  -- Identification
  name TEXT NOT NULL,
  imo_number TEXT UNIQUE NOT NULL,
  mmsi TEXT,
  call_sign TEXT,
  
  -- Specifications
  vessel_type TEXT NOT NULL,
  flag_state TEXT,
  built_year INTEGER,
  builder TEXT,
  dwt DECIMAL,
  grt DECIMAL,
  nrt DECIMAL,
  length_overall DECIMAL,
  beam DECIMAL,
  draft DECIMAL,
  
  -- Status
  status TEXT DEFAULT 'active', -- active, in_port, maintenance, drydock, laid_up
  current_port TEXT,
  current_voyage_id UUID,
  
  -- Position (from AIS)
  last_position GEOGRAPHY(POINT, 4326),
  last_position_time TIMESTAMPTZ,
  speed DECIMAL,
  heading DECIMAL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_imo CHECK (imo_number ~ '^[0-9]{7}$')
);

-- Indexes
CREATE INDEX idx_vessels_org ON vessels(organization_id);
CREATE INDEX idx_vessels_imo ON vessels(imo_number);
CREATE INDEX idx_vessels_status ON vessels(status);
CREATE INDEX idx_vessels_position ON vessels USING GIST(last_position);

-- RLS
ALTER TABLE vessels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization isolation"
  ON vessels FOR ALL
  USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );
```

#### Crew Members

```sql
CREATE TABLE crew_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  vessel_id UUID REFERENCES vessels(id),
  profile_id UUID REFERENCES profiles(id),
  
  -- Personal
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  nationality TEXT,
  passport_number TEXT,
  seaman_book_number TEXT,
  
  -- Position
  rank TEXT NOT NULL,
  department TEXT, -- Deck, Engine, Catering
  
  -- Contact
  email TEXT,
  phone TEXT,
  emergency_contact JSONB,
  
  -- Employment
  join_date DATE,
  contract_end_date DATE,
  status TEXT DEFAULT 'active', -- active, on_leave, signed_off, blacklisted
  
  -- Compliance
  stcw_certificates JSONB,
  medical_certificate_expiry DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_crew_org ON crew_members(organization_id);
CREATE INDEX idx_crew_vessel ON crew_members(vessel_id);
CREATE INDEX idx_crew_status ON crew_members(status);

-- RLS (with self-view exception)
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization isolation or self view"
  ON crew_members FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    OR profile_id = auth.uid()
  );
```

### 5.2 RLS Policies Pattern

```sql
-- Standard pattern for all tables

-- 1. Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- 2. Organization isolation (SELECT)
CREATE POLICY "org_select"
  ON table_name FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 3. Organization isolation (INSERT)
CREATE POLICY "org_insert"
  ON table_name FOR INSERT
  WITH CHECK (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 4. Organization isolation (UPDATE)
CREATE POLICY "org_update"
  ON table_name FOR UPDATE
  USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 5. Organization isolation (DELETE)
CREATE POLICY "org_delete"
  ON table_name FOR DELETE
  USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- 6. Role-based restrictions (example: sensitive data)
CREATE POLICY "admin_only"
  ON sensitive_table FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- 7. Self-view exception (for personal data)
CREATE POLICY "self_view"
  ON crew_members FOR SELECT
  USING (
    profile_id = auth.uid()
    OR organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );
```

### 5.3 Key Statistics

| Metric | Value |
|--------|-------|
| **Total Tables** | 711 |
| **RLS Policies** | 2,145+ |
| **Indexes** | 1,936+ |
| **Database Functions** | 50+ |
| **Triggers** | 30+ |
| **Views** | 20+ |

---

## 6. Dívidas Técnicas

### 6.1 Resumo por Categoria

| Categoria | Severidade | Items | Estimativa |
|-----------|------------|-------|------------|
| **TypeScript Typing** | 🔴 Alta | ~150 @ts-nocheck, ~1.300 any | 4-6 sprints |
| **Mock Data** | 🔴 Alta | ~40% still mocked | 3-4 sprints |
| **API Integrations** | 🟡 Média | 5 APIs não implementadas | 4-6 sprints |
| **Test Coverage** | 🟡 Média | 68% (meta: 85%) | 2-3 sprints |
| **Security** | 🔴 Alta | 3 issues críticos | 1 sprint |
| **Performance** | 🟡 Média | Bundle 2-3MB, TTI 4-5s | 2 sprints |
| **Documentation** | 🟢 Baixa | Incompleta | 1-2 sprints |

### 6.2 Detalhamento

#### 🔴 P0 - CRÍTICO (Resolver em 2 semanas)

```
1. Security Issues
   ├── [ ] Leaked Password Protection não ativado
   ├── [ ] Rate limiting básico (melhorar)
   └── [ ] Audit trail incompleto

2. TypeScript Strictness
   ├── [ ] Remover @ts-nocheck em arquivos críticos (auth, payments)
   └── [ ] Corrigir types em hooks de data fetching

3. Mock Data em Módulos Críticos
   ├── [ ] Fleet Management - 40% mock
   ├── [ ] Compliance Dashboard - 30% mock
   └── [ ] Finance - 50% mock
```

#### 🟡 P1 - ALTO (Resolver em 6 semanas)

```
1. TypeScript Cleanup
   ├── [ ] Remover todos @ts-nocheck (150 arquivos)
   ├── [ ] Reduzir 'any' para < 100 ocorrências
   └── [ ] Adicionar strict null checks

2. Data Integration
   ├── [ ] Eliminar todos dados mock
   ├── [ ] Implementar real-time subscriptions
   └── [ ] Adicionar offline sync

3. Test Coverage
   ├── [ ] Unit tests: 68% → 85%
   ├── [ ] Integration tests para fluxos críticos
   └── [ ] E2E tests para happy paths

4. API Integrations
   ├── [ ] AIS (MarineTraffic/VesselFinder)
   ├── [ ] Weather (StormGeo/OpenWeather)
   └── [ ] ESG (Climatiq)
```

#### 🟢 P2 - IMPORTANTE (Resolver em 12 semanas)

```
1. Performance
   ├── [ ] Bundle splitting (2.5MB → 500KB initial)
   ├── [ ] Image optimization
   ├── [ ] Lazy loading routes
   └── [ ] Query optimization

2. Offline Mode
   ├── [ ] Service Worker v2
   ├── [ ] IndexedDB sync
   └── [ ] Conflict resolution

3. Documentation
   ├── [ ] API documentation
   ├── [ ] Component storybook
   └── [ ] Architecture diagrams
```

### 6.3 Roadmap de Correção

```
Sprint 1-2 (Semanas 1-4):
├── Security fixes (P0)
├── Critical mock data removal
└── Auth flow hardening

Sprint 3-4 (Semanas 5-8):
├── TypeScript cleanup (50%)
├── Test coverage boost
└── Remaining mock data

Sprint 5-6 (Semanas 9-12):
├── TypeScript cleanup (100%)
├── API integrations (AIS, Weather)
└── Performance optimization

Sprint 7-8 (Semanas 13-16):
├── Offline mode
├── Remaining integrations
└── Documentation complete
```

---

## 7. Guia de Setup Local

### 7.1 Pré-requisitos

```bash
# Versões mínimas
Node.js >= 18.0.0
npm >= 9.0.0 ou bun >= 1.0.0
Git >= 2.30.0
```

### 7.2 Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/your-org/nautilus-one.git
cd nautilus-one

# 2. Instale dependências
npm install
# ou
bun install

# 3. Configure variáveis de ambiente
# (Não há .env necessário - Supabase config está no código)

# 4. Inicie o servidor de desenvolvimento
npm run dev
# ou
bun run dev
```

### 7.3 Comandos Disponíveis

```bash
# Development
npm run dev              # Inicia servidor de desenvolvimento (port 8080)
npm run build            # Build de produção
npm run preview          # Preview do build

# Linting & Formatting
npm run lint             # Executa ESLint
npm run lint:fix         # Corrige problemas automaticamente
npm run format           # Formata com Prettier
npm run format:check     # Verifica formatação

# Testing
npm run test             # Executa testes unitários
npm run test:watch       # Modo watch
npm run test:coverage    # Relatório de cobertura
npm run test:ui          # Interface visual

# Type Checking
npm run typecheck        # Verifica tipos TypeScript
```

### 7.4 URLs de Desenvolvimento

| Ambiente | URL | Uso |
|----------|-----|-----|
| **Local** | http://localhost:8080 | Desenvolvimento |
| **Preview** | https://id-preview--xxx.lovable.app | Preview branches |
| **Production** | https://travel-hr-buddy.lovable.app | Produção |
| **Supabase** | https://vnbptmixvwropvanyhdb.supabase.co | Backend |

### 7.5 Troubleshooting

```bash
# Problema: "Port 8080 already in use"
lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Problema: "Module not found"
rm -rf node_modules
npm install

# Problema: "TypeScript errors"
npm run typecheck
# Verifique os erros específicos

# Problema: "Supabase connection failed"
# Verifique se está usando as URLs corretas:
# - Project ID: vnbptmixvwropvanyhdb
# - Anon Key: (verifique client.ts)

# Problema: "Build failed"
npm run build 2>&1 | tee build.log
# Analise o log para erros específicos
```

---

## 8. Como Contribuir

### 8.1 Fluxo de Trabalho

```
1. Pegar Task
   └── GitHub Projects / Issues

2. Criar Branch
   └── git checkout -b feature/nome-descritivo

3. Desenvolver
   └── Seguir padrões de código

4. Testar
   └── npm run test && npm run lint

5. Commit
   └── git commit -m "feat: description"

6. Pull Request
   └── Criar PR com template

7. Code Review
   └── Aguardar 2+ approvals

8. Merge
   └── Squash merge para main
```

### 8.2 Branch Naming Convention

```
feature/add-vessel-tracking     # Nova funcionalidade
fix/login-redirect-issue        # Correção de bug
refactor/auth-module           # Refatoração
docs/update-api-docs           # Documentação
chore/update-dependencies      # Manutenção
test/add-vessel-tests          # Testes
```

### 8.3 Commit Message Format

```
<type>(<scope>): <subject>

# Types:
feat:     Nova funcionalidade
fix:      Correção de bug
docs:     Documentação
style:    Formatação (não afeta código)
refactor: Refatoração
test:     Testes
chore:    Manutenção

# Examples:
feat(vessels): add real-time tracking integration
fix(auth): resolve session refresh issue
docs(api): update vessel endpoints documentation
refactor(hooks): extract common logic to useDataFetching
test(crew): add unit tests for crew service
chore(deps): update React to 18.3
```

### 8.4 Pull Request Template

```markdown
## Descrição
<!-- Descreva as mudanças -->

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Refatoração
- [ ] Documentação
- [ ] Outros

## Checklist
- [ ] Código segue os padrões do projeto
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Sem console.logs (usar logger)
- [ ] TypeScript sem erros
- [ ] Lint sem warnings

## Screenshots (se aplicável)
<!-- Adicione screenshots -->

## Como Testar
<!-- Passos para testar as mudanças -->
```

### 8.5 Code Review Guidelines

```
✅ APROVAR quando:
- Código funciona e está testado
- Segue padrões do projeto
- Sem security issues
- TypeScript sem erros
- Testes passando

🔄 SOLICITAR MUDANÇAS quando:
- Security vulnerabilities
- Performance issues significativos
- Código difícil de manter
- Falta de testes para lógica crítica
- Violação de padrões

💬 COMENTAR quando:
- Sugestões de melhoria
- Alternativas de implementação
- Dúvidas sobre decisões
```

---

## 9. Próximos Passos

### 9.1 Roadmap Curto Prazo (1-2 meses)

```
Sprint 1-2: Security & Stability
├── [ ] Fix security issues (P0)
├── [ ] Remove critical mock data
├── [ ] Improve error handling
└── [ ] Add monitoring (Sentry)

Sprint 3-4: Data Integration
├── [ ] Complete CRUD for all modules
├── [ ] Real-time subscriptions
├── [ ] Offline sync foundation
└── [ ] API integrations (AIS)

Sprint 5-6: UX Polish
├── [ ] Loading states
├── [ ] Error boundaries
├── [ ] Empty states
├── [ ] Success feedback
└── [ ] Accessibility audit
```

### 9.2 Roadmap Médio Prazo (3-6 meses)

```
Q1 2026:
├── [ ] Complete API integrations
├── [ ] Mobile app (Capacitor)
├── [ ] Offline mode complete
└── [ ] Performance optimization

Q2 2026:
├── [ ] AI agents full integration
├── [ ] Advanced analytics
├── [ ] Custom reporting
└── [ ] White-label support
```

### 9.3 Onboarding de Novos Devs

| Semana | Foco | Entregável |
|--------|------|------------|
| **1** | Setup + Arquitetura | Ambiente rodando, PR de warmup |
| **2** | Codebase + Padrões | Bug fix ou small feature |
| **3** | Módulo específico | Feature completa |
| **4** | Autonomia | Contribuição independente |

### 9.4 Recursos Úteis

#### Documentação Externa

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Supabase Docs](https://supabase.com/docs)
- [Vite](https://vitejs.dev/)

#### Documentação Interna

- [CONTRIBUTING.md](../CONTRIBUTING.md)
- [Security Guide](./security/SECURITY.md)
- [Technical Handoff](./handoff/TECHNICAL-HANDOFF.md)

---

## 📞 Suporte

- **Slack:** #nauti-one-dev
- **Email:** dev@nautione.com.br
- **Issues:** GitHub Issues

---

*Última atualização: Fevereiro 2026*  
*Versão: 4.0*  
*Mantido por: Time de Engenharia NAUTI ONE*
