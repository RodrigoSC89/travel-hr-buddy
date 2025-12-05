# 📚 Documentação Técnica Completa - Nautilus One

## 1. Visão Geral do Sistema

### 1.1 Descrição
O **Nautilus One** é um sistema de gestão marítima enterprise-grade projetado para operar em ambientes com conectividade limitada (≤2mbps) ou offline. O sistema integra IA embarcada (LLM local) para assistência inteligente em todas as operações.

### 1.2 Stack Tecnológico
```
Frontend:
├── React 18.3.1 + TypeScript
├── Vite (build tool)
├── TailwindCSS + shadcn/ui
├── TanStack Query (cache/sync)
├── React Router DOM 6.x
└── Framer Motion (animações)

Backend:
├── Supabase (PostgreSQL + Auth + Storage)
├── Edge Functions (Deno)
├── Row Level Security (RLS)
└── Realtime Subscriptions

IA Embarcada:
├── Lovable AI Gateway (online)
├── Local Fallback System (offline)
├── Ollama/llama.cpp (LLM local)
└── Cache de prompts/respostas

Offline/Sync:
├── IndexedDB (persistência local)
├── Service Workers (cache)
├── Chunked Sync (transferência)
└── Circuit Breaker (resiliência)
```

### 1.3 Arquitetura de Alto Nível
```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Frota   │ │  RH     │ │ Manutenção│ │  ESG   │  ...     │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │
│       │           │           │           │                 │
│  ┌────┴───────────┴───────────┴───────────┴────┐           │
│  │           Service Layer (hooks/lib)          │           │
│  └────┬───────────────────────────────────┬────┘           │
│       │                                   │                 │
│  ┌────┴────┐                        ┌────┴────┐            │
│  │ Offline │                        │   AI    │            │
│  │ Manager │                        │ Engine  │            │
│  └────┬────┘                        └────┬────┘            │
└───────┼─────────────────────────────────┼──────────────────┘
        │                                 │
        ▼                                 ▼
┌───────────────┐                 ┌───────────────┐
│   IndexedDB   │                 │  LLM Local    │
│   + Cache     │                 │  (Ollama)     │
└───────┬───────┘                 └───────────────┘
        │
        ▼ (quando online)
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Auth    │ │Database │ │ Storage │ │  Edge   │           │
│  │         │ │(Postgres)│ │         │ │Functions│           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Módulos do Sistema

### 2.1 Catálogo de Módulos

| Módulo | Descrição | IA Integrada | Status |
|--------|-----------|--------------|--------|
| **Fleet Management** | Gestão completa de embarcações | ✅ | Produção |
| **Crew Management** | RH, tripulação, certificações | ✅ | Produção |
| **Maintenance** | Manutenção preventiva/corretiva | ✅ | Produção |
| **Documents** | Gestão documental com OCR | ✅ | Produção |
| **Safety/HSEQ** | Segurança, incidentes, checklists | ✅ | Produção |
| **Finance** | Custos, payroll, orçamentos | ✅ | Produção |
| **Compliance** | MLC 2006, STCW, auditorias | ✅ | Produção |
| **ESG** | Sustentabilidade, emissões | ✅ | Produção |
| **Training** | E-learning, certificações | ✅ | Produção |
| **Analytics** | Dashboards, KPIs, relatórios | ✅ | Produção |
| **Communication** | Mensagens, alertas, notificações | ✅ | Produção |
| **Automation** | Workflows, regras automáticas | ✅ | Produção |

### 2.2 Estrutura de Arquivos por Módulo
```
src/
├── components/
│   ├── fleet/           # Gestão de frota
│   ├── crew/            # Tripulação
│   ├── maintenance/     # Manutenção
│   ├── documents/       # Documentos
│   ├── safety/          # HSEQ
│   ├── finance/         # Finanças
│   ├── compliance/      # Conformidade
│   ├── esg/             # ESG
│   ├── training/        # Treinamento
│   ├── analytics/       # Analytics
│   └── automation/      # Automação
├── hooks/
│   ├── use-fleet.ts
│   ├── use-crew.ts
│   └── ...
├── lib/
│   ├── ai/              # Engine de IA
│   ├── offline/         # Sync offline
│   ├── security/        # Criptografia
│   └── performance/     # Otimizações
└── pages/
    └── [módulos].tsx
```

---

## 3. Fluxo de Dados e Integrações

### 3.1 Fluxo Principal
```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  User    │───▶│  React   │───▶│  Hooks   │───▶│ Supabase │
│  Action  │    │Component │    │ (Query)  │    │  Client  │
└──────────┘    └──────────┘    └──────────┘    └────┬─────┘
                                                      │
                     ┌────────────────────────────────┘
                     ▼
              ┌─────────────┐
              │   Online?   │
              └──────┬──────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │ Supabase│  │IndexedDB│  │  Sync   │
   │  Direct │  │  Queue  │  │  Later  │
   └─────────┘  └─────────┘  └─────────┘
```

### 3.2 Integrações Externas
```typescript
// Configuração de integrações
const integrations = {
  // AI Gateway
  lovableAI: {
    endpoint: 'https://ai.gateway.lovable.dev/v1/chat/completions',
    models: ['google/gemini-2.5-flash', 'openai/gpt-5-mini'],
    fallback: 'local-llm'
  },
  
  // Supabase
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  },
  
  // Storage
  storage: {
    buckets: ['documents', 'certificates', 'avatars', 'reports']
  },
  
  // Email (via Edge Functions)
  email: {
    provider: 'resend',
    templates: ['welcome', 'alert', 'report']
  }
};
```

---

## 4. Funcionamento da LLM Embarcada

### 4.1 Arquitetura Híbrida
```
┌─────────────────────────────────────────────────────────────┐
│                    AI Decision Engine                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐    ┌─────────────────┐                 │
│  │  Network Check  │───▶│  Route Request  │                 │
│  └─────────────────┘    └────────┬────────┘                 │
│                                  │                           │
│              ┌───────────────────┼───────────────────┐      │
│              ▼                   ▼                   ▼      │
│      ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│      │   Online    │    │   Offline   │    │   Cached    │ │
│      │   (Cloud)   │    │   (Local)   │    │  Response   │ │
│      └──────┬──────┘    └──────┬──────┘    └──────┬──────┘ │
│             │                  │                  │         │
│             ▼                  ▼                  ▼         │
│      ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│      │ Lovable AI  │    │ Ollama/GGUF │    │  IndexedDB  │ │
│      │   Gateway   │    │   Local     │    │   Cache     │ │
│      └─────────────┘    └─────────────┘    └─────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Casos de Uso por Módulo

```typescript
// src/lib/ai/module-prompts.ts
export const moduleAICapabilities = {
  fleet: {
    commands: [
      'Analisar performance da frota',
      'Prever necessidade de manutenção',
      'Otimizar rotas de navegação',
      'Gerar relatório de eficiência'
    ],
    context: 'Você é um especialista em gestão de frotas marítimas...'
  },
  
  maintenance: {
    commands: [
      'Priorizar ordens de serviço',
      'Identificar padrões de falha',
      'Estimar tempo de reparo',
      'Sugerir peças de reposição'
    ],
    context: 'Você é um engenheiro de manutenção naval...'
  },
  
  crew: {
    commands: [
      'Verificar compliance de certificações',
      'Planejar escala de tripulação',
      'Analisar horas de descanso (MLC)',
      'Sugerir treinamentos necessários'
    ],
    context: 'Você é um especialista em gestão de tripulação...'
  },
  
  compliance: {
    commands: [
      'Verificar conformidade MLC 2006',
      'Preparar documentação para auditoria',
      'Identificar gaps de certificação',
      'Gerar checklist de compliance'
    ],
    context: 'Você é um auditor de conformidade marítima...'
  }
};
```

### 4.3 Prompt Engineering para Contexto Marítimo

```typescript
// Sistema de prompts contextualizado
const systemPrompt = `
Você é ATLAS, assistente de IA especializado em operações marítimas.

CONHECIMENTO:
- Convenção MLC 2006 (Maritime Labour Convention)
- STCW (Standards of Training, Certification and Watchkeeping)
- ISM Code (International Safety Management)
- MARPOL (poluição marítima)
- SOLAS (Safety of Life at Sea)

CONTEXTO OPERACIONAL:
- Ambiente: embarcação ou escritório portuário
- Conectividade: pode ser limitada ou offline
- Usuários: tripulação técnica, gestores, operadores

COMPORTAMENTO:
- Respostas diretas e práticas
- Linguagem técnica mas acessível
- Priorizar segurança e compliance
- Sugerir ações concretas

LIMITAÇÕES:
- Não fornecer informações médicas específicas
- Não substituir decisões de segurança humanas
- Sempre recomendar consulta especializada em casos críticos
`;
```

---

## 5. Estratégias Offline e Rede Lenta

### 5.1 Níveis de Conectividade
```typescript
export enum NetworkLevel {
  ONLINE = 'online',      // >4mbps - funcionalidade completa
  LIMITED = 'limited',    // 2-4mbps - sync reduzido
  SLOW = 'slow',          // <2mbps - modo economia
  OFFLINE = 'offline'     // sem rede - modo local
}

// Configuração por nível
const networkConfig = {
  [NetworkLevel.ONLINE]: {
    syncInterval: 30000,      // 30s
    chunkSize: 64 * 1024,     // 64KB
    enableAnimations: true,
    imageQuality: 'high',
    aiMode: 'cloud'
  },
  [NetworkLevel.LIMITED]: {
    syncInterval: 60000,      // 1min
    chunkSize: 16 * 1024,     // 16KB
    enableAnimations: true,
    imageQuality: 'medium',
    aiMode: 'cloud'
  },
  [NetworkLevel.SLOW]: {
    syncInterval: 300000,     // 5min
    chunkSize: 4 * 1024,      // 4KB
    enableAnimations: false,
    imageQuality: 'low',
    aiMode: 'hybrid'
  },
  [NetworkLevel.OFFLINE]: {
    syncInterval: null,
    chunkSize: 0,
    enableAnimations: false,
    imageQuality: 'cached',
    aiMode: 'local'
  }
};
```

### 5.2 Priorização de Sincronização
```typescript
// Ordem de prioridade para sync
const syncPriority = {
  critical: [
    'safety_incidents',    // Incidentes de segurança
    'emergency_alerts',    // Alertas de emergência
    'crew_status',         // Status da tripulação
    'vessel_position'      // Posição da embarcação
  ],
  high: [
    'maintenance_orders',  // Ordens de serviço
    'certificate_expiry',  // Vencimento de certificados
    'compliance_deadlines' // Prazos de conformidade
  ],
  normal: [
    'documents',           // Documentos gerais
    'reports',             // Relatórios
    'training_records'     // Registros de treinamento
  ],
  low: [
    'analytics_data',      // Dados de analytics
    'audit_logs',          // Logs de auditoria
    'historical_data'      // Dados históricos
  ]
};
```

---

## 6. Segurança e Logs

### 6.1 Camadas de Segurança
```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: Authentication                                     │
│  ├── Supabase Auth (JWT)                                    │
│  ├── MFA Support (TOTP)                                     │
│  ├── OAuth Providers (Google, Microsoft)                    │
│  └── Session Management                                      │
│                                                              │
│  Layer 2: Authorization                                      │
│  ├── Role-Based Access Control (RBAC)                       │
│  ├── Row Level Security (RLS)                               │
│  ├── Feature Permissions                                     │
│  └── Organization Isolation                                  │
│                                                              │
│  Layer 3: Data Protection                                    │
│  ├── AES-256 Encryption (local)                             │
│  ├── TLS 1.3 (transit)                                      │
│  ├── PII Masking                                            │
│  └── Secure Storage Policies                                │
│                                                              │
│  Layer 4: Audit & Monitoring                                │
│  ├── Action Logging                                         │
│  ├── Access Tracking                                        │
│  ├── Anomaly Detection                                      │
│  └── Compliance Reports                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Criptografia Local
```typescript
// src/lib/security/local-crypto.ts
import { LocalCrypto } from './local-crypto';

// Uso
const crypto = LocalCrypto.getInstance();

// Criptografar dados sensíveis
const encrypted = await crypto.encrypt(
  JSON.stringify(sensitiveData),
  userPassword
);

// Descriptografar
const decrypted = await crypto.decrypt(encrypted, userPassword);
```

---

## 7. Configuração para Novos Desenvolvedores

### 7.1 Setup Inicial
```bash
# 1. Clonar repositório
git clone https://github.com/org/nautilus-one.git
cd nautilus-one

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais

# 4. Iniciar desenvolvimento
npm run dev

# 5. (Opcional) Rodar com Supabase local
npx supabase start
```

### 7.2 Variáveis de Ambiente
```env
# .env.example
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJxxx...

# Para desenvolvimento local com Supabase
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_PUBLISHABLE_KEY=eyJxxx...

# Feature flags
VITE_ENABLE_AI=true
VITE_ENABLE_OFFLINE=true
VITE_DEBUG_MODE=false
```

### 7.3 Comandos Úteis
```bash
# Desenvolvimento
npm run dev              # Inicia servidor dev
npm run build            # Build de produção
npm run preview          # Preview do build

# Supabase
npx supabase start       # Inicia Supabase local
npx supabase db reset    # Reset do banco
npx supabase functions serve  # Edge functions local

# Testes
npm run test             # Rodar testes
npm run test:coverage    # Com cobertura

# Qualidade
npm run lint             # ESLint
npm run typecheck        # TypeScript
```

---

## 8. APIs Internas

### 8.1 Hooks Disponíveis
```typescript
// Principais hooks do sistema
import { useFleet } from '@/hooks/use-fleet';
import { useCrew } from '@/hooks/use-crew';
import { useMaintenance } from '@/hooks/use-maintenance';
import { useDocuments } from '@/hooks/use-documents';
import { useCompliance } from '@/hooks/use-compliance';
import { useAI } from '@/hooks/use-ai';
import { useOffline } from '@/hooks/use-offline';
import { useNetworkQuality } from '@/lib/performance/network-quality-monitor';
```

### 8.2 Serviços de IA
```typescript
// src/lib/ai/index.ts
export { SmartAssistant } from './smart-assistant';
export { LocalFallbackAI } from './local-fallback';
export { AICommandProcessor } from './command-processor';
export { PromptCache } from './prompt-cache';
```

### 8.3 Serviços Offline
```typescript
// src/lib/offline/index.ts
export { IndexedDBSync } from './indexeddb-sync';
export { ChunkedSync } from './chunked-sync';
export { CircuitBreaker } from './circuit-breaker';
export { RequestBatcher } from './request-batcher';
export { PayloadCompression } from './payload-compression';
```

---

## 9. Estrutura para Expansão Modular

### 9.1 Criando Novo Módulo
```typescript
// 1. Criar estrutura de pastas
// src/components/novo-modulo/
// ├── index.ts
// ├── NovoModuloPage.tsx
// ├── components/
// │   ├── NovoModuloList.tsx
// │   └── NovoModuloForm.tsx
// └── hooks/
//     └── use-novo-modulo.ts

// 2. Registrar no plugin system
// src/lib/plugins/modules/novo-modulo.ts
import { PluginModule } from '../plugin-system';

export const novoModuloPlugin: PluginModule = {
  id: 'novo-modulo',
  name: 'Novo Módulo',
  version: '1.0.0',
  routes: [
    { path: '/novo-modulo', component: NovoModuloPage }
  ],
  permissions: ['novo-modulo.read', 'novo-modulo.write'],
  aiCapabilities: {
    commands: ['comando1', 'comando2'],
    context: 'Contexto para IA...'
  }
};

// 3. Registrar rota
// src/App.tsx
pluginSystem.register(novoModuloPlugin);
```

### 9.2 Pontos de Extensão
```typescript
// Eventos do sistema para extensão
export const systemEvents = {
  // Ciclo de vida
  'app:init': 'Aplicação inicializada',
  'app:ready': 'Aplicação pronta',
  'app:destroy': 'Aplicação encerrada',
  
  // Autenticação
  'auth:login': 'Usuário logou',
  'auth:logout': 'Usuário deslogou',
  
  // Dados
  'data:sync:start': 'Sincronização iniciada',
  'data:sync:complete': 'Sincronização completa',
  'data:offline': 'Modo offline ativado',
  
  // IA
  'ai:request': 'Requisição à IA',
  'ai:response': 'Resposta da IA',
  'ai:fallback': 'Usando fallback local'
};
```

---

## 10. Checklist de Manutenção

### 10.1 Tarefas Diárias
- [ ] Verificar logs de erro
- [ ] Monitorar filas de sincronização
- [ ] Revisar alertas críticos

### 10.2 Tarefas Semanais
- [ ] Atualizar dependências (patch)
- [ ] Revisar performance
- [ ] Backup de configurações

### 10.3 Tarefas Mensais
- [ ] Atualizar dependências (minor)
- [ ] Auditoria de segurança
- [ ] Revisão de RLS policies
- [ ] Limpeza de dados temporários

---

*Documentação gerada em: 2025-12-05*
*Versão do Sistema: 2.0.0*
