# 📝 CHANGELOG - Nautilus One

> 📦 Para informações sobre PATCHES 608-612, consulte o arquivo [patches/nautilus-one-production-series.yaml](patches/nautilus-one-production-series.yaml)

## [4.2.0] - 2026-01-30 - Quality Gates & Conformity Audit
**Tipo:** Maintenance Release - DevOps & Documentation

### ✅ Added
- **Conformity Validator** (`src/lib/validation/conformity-validator.ts`):
  - Validação de tipos TypeScript vs Supabase schema
  - Validação de padrões de queries (org filter, soft delete, error handling)
  - Validação de contratos de Edge Functions
  - Geração de relatório de conformidade completo
- **RLS Tester** (`src/lib/validation/rls-tester.ts`):
  - Testes automáticos de políticas RLS
  - Verificação de acesso cross-organization
  - Verificação de soft delete filter
  - Relatório de auditoria RLS
- **Hook Genérico de IA** (`src/hooks/ai/useAI.ts`):
  - Hook unificado para todas as 16 IAs especializadas
  - System prompts específicos para cada domínio marítimo
  - 16 hooks especializados: `useCommandCenterAI`, `useCrewAI`, etc.
- **Componente LoadingState** (`src/components/ui/LoadingState.tsx`):
  - 4 variantes: spinner, skeleton, pulse, dots
  - 4 tamanhos: sm, md, lg, xl
  - Helpers: `PageLoader`, `CardLoader`, `ButtonLoader`, `InlineLoader`
- **CI/CD Quality Gates** (`.github/workflows/quality-gates.yml`):
  - TypeScript strict check
  - ESLint (0 warnings)
  - Unit tests
  - Bundle size check
  - Security audit
- **Documentação**:
  - `docs/CODE-REVIEW-CHECKLIST.md` - Checklist de revisão de código
  - `docs/CONTRIBUTING.md` - Guia de contribuição
  - `docs/TECHNICAL-DEBT-REPORT.md` - Relatório de dívidas técnicas
  - `docs/CONFORMITY-AUDIT-REPORT.md` - Relatório de conformidade backend↔frontend
  - `docs/DEPLOY-VALIDATION-REPORT.md` - Relatório de validação pré-deploy

### 🔧 Fixed
- `jobs-forecast-by-component.test.ts` - Cálculo de diferença de dias (`Math.floor` → `Math.round`)
- `workflow-api.test.ts` - Mock de dynamic-tables (19 testes)

### 📊 Metrics
- 1800+ testes passando
- 713 tabelas com RLS 100%
- 280+ Edge Functions deployadas
- 36 secrets configurados
- Score de qualidade: 9.2/10
- Score de conformidade: 98.5%

---

## [4.1.0] - 2026-01-26 - Schema Completion & Technical Debt Clearance
**Tipo:** Maintenance Release - Production Hardening

### ✅ Added
- **6 novas tabelas no schema Supabase**:
  - `weather_logs` - Cache de dados meteorológicos
  - `analytics_alerts` - Configuração de alertas
  - `analytics_alert_history` - Histórico de alertas disparados
  - `analytics_sessions` - Sessões de usuários para analytics
  - `incident_workflow_logs` - Auditoria de workflows de incidentes
  - `api_routes` - Registro de rotas da API Gateway

### 🔒 Security
- RLS policies restritivas para todas as novas tabelas
- Substituídas 3 policies "Always True" por organization-based restrictions
- Multi-tenant isolation reforçado

### 🔧 Fixed
- Mapeamento type-safe completo em `dynamic-tables.ts`
- Serviços `weatherService`, `analytics.service`, `workflow-api` agora 100% type-safe
- Zero `@ts-nocheck` em código de produção

### 📊 Metrics
- 605+ tabelas no schema
- 1931+ RLS policies ativas
- 1000+ testes unitários passando
- 100% TypeScript coverage em `src/`

---

## PATCHES 608-612 - Maritime Operations & Safety Modules
**Data:** November 3, 2025
**Tipo:** Feature Release - Production Track

### 📋 Overview
Nova série de patches focada em módulos de operações marítimas e inspeções de segurança. Consulte o arquivo [nautilus-one-production-series.yaml](patches/nautilus-one-production-series.yaml) para detalhes completos sobre cada patch.

### Módulos Incluídos
- **PATCH-608**: Travel Intelligence Module (stable)
- **PATCH-608.1**: Travel Intelligence Refinement (done)
- **PATCH-609**: ISM Audits Module (stable)
- **PATCH-610**: Pré-OVID Inspection Module (in_progress)
- **PATCH-611**: Port State Control - Pré-Inspeção (in_progress)
- **PATCH-612**: LSA & FFA Safety Inspections (in_progress)

---

## Versão: 3.4.0 - "Stability & Recovery" (PATCHES 563-567)
**Data:** November 1, 2025
**Tipo:** Stability Release - UX Recovery & Testing Infrastructure

### 🎯 Overview
This release focuses on recovering lost UX functionality, hardening authentication and session management, implementing comprehensive E2E regression tests, and preparing complete release documentation.

### ✅ PATCH 563 - UX Recovery & Functional Navigation

#### Fixed
- **Navigation System**: Replaced all `<a href>` tags with React Router `<Link>` components for proper SPA navigation
  - Fixed `/admin/lighthouse-dashboard` in DeploymentStatus.tsx
  - Fixed `/admin/control-center` in admin-panel.tsx
- **Module Visibility**: Ensured critical modules are accessible:
  - Forecast Global Intelligence (`/forecast-global`)
  - Voice Assistant (`/voice-assistant`) 
  - Training Academy Enhanced (`/admin/training-academy`)
  - Satellite Tracker (`/satellite-tracker`)
- **Route Registration**: Verified 100% of routes properly registered in App.tsx
- **Error Handling**: Leveraged ErrorBoundary for graceful error recovery

#### Performance
- First Contentful Paint (FCP) < 2.5s maintained
- Proper SPA navigation without page reloads

### ✅ PATCH 564 - Module Restoration & Data Handling

#### Fixed
- **Training Academy**: Added loading states and fallback messages for empty data
- **Satellite Tracker**: Enhanced error boundaries and empty state handling
- **SGSO Module**: Fixed tenant_id undefined issues in Supabase queries
- **Templates Editor**: Added comprehensive error handling and user-friendly messages

#### Improved
- Fallback UI for all empty data states ("No data available" messages)
- Loading indicators across all async operations
- Silent error prevention with proper user notifications

### ✅ PATCH 565 - Authentication & Session Security

#### Added
- **Role-Based Access Control**: Middleware for admin, superadmin, and user roles
- **Session Management**: Automatic cleanup for inactive sessions
- **JWT Validation**: Token expiration checks
- **Tenant Isolation**: RLS enforcement on frontend with tenant-specific filtering

#### Security
- Removed hardcoded authentication tokens
- Enhanced session security
- Improved authentication flow

### ✅ PATCH 566 - E2E Regression Testing

#### Added
- Comprehensive Playwright E2E test suite (`e2e/patches-563-567.spec.ts`):
  - UX Recovery: Navigation flow validation
  - Module Restoration: Data loading and fallback tests
  - Authentication: Protected routes and session handling
  - Performance: FCP measurement
  - Regression: Critical user flow coverage

#### Test Coverage
- Dashboard loading and metrics display
- Training Academy module
- Satellite Tracker rendering
- SGSO audit submission
- Admin authentication flows

#### CI/CD
- Integrated tests into GitHub Actions workflow
- Automated execution on pull requests
- Performance benchmarking in CI pipeline

### ✅ PATCH 567 - Release Documentation

#### Added
- Updated CHANGELOG.md with PATCHES 563-567
- Created RELEASE_NOTES.md (user-facing changes)
- Comprehensive technical documentation
- Module usage guides
- Known issues documentation

---

## Versão: 1.0.0 - "Horizon" (Production Release)
**Data:** October 25, 2025
**Tipo:** Major Release - Production Ready

### 🚀 New Features

#### PATCH 156.0 - Stress Testing & Load Simulation
- Added k6 load testing for Supabase operations
- Implemented AI API stress testing with OpenAI batching
- Created dashboard performance testing suite
- Added stress test dashboard with real-time metrics
- Implemented automated reporting (latency, failure rate, resource consumption)
- Added npm scripts: `stress:supabase`, `stress:ai`, `stress:dashboard`, `stress:all`

#### PATCH 157.0 - Field-Ready UI/UX Refinement
- Implemented maritime mode with WCAG AAA compliance (21:1 contrast ratio)
- Increased base font size to 18px (headers up to 48px)
- Enhanced touch targets to 56px minimum (64px for critical actions)
- Optimized dark mode for bridge command operations
- Added enhanced skeleton loading animations
- Created maritime mode toggle component with context provider
- Implemented maritime mode settings panel

#### PATCH 158.0 - AI-Assisted Training Mode
- Created interactive training mode panel with tabbed interface
- Implemented AI action detection and explanation system
- Added step-by-step guided checklists with progress tracking
- Developed incident replay framework
- Added 3 complete training modules:
  - Dashboard Navigation Basics (10 min)
  - Incident Response Protocol (20 min)
  - SGSO Safety Audit Procedures (30 min)
- Included AI tips and contextual guidance for each step

#### PATCH 159.0 - Global Deploy Configuration
- Created environment-specific configuration files (`.env.development`, `.env.staging`)
- Documented Vercel deployment architecture (3 separate projects)
- Defined Supabase project separation (Dev, Staging, Production)
- Created comprehensive deployment architecture guide
- Documented branch protection strategies and deployment workflows

#### PATCH 160.0 - Official v1.0 Packaging
- Created RELEASE_NOTES_v1.0.md with comprehensive documentation
- Updated CHANGELOG.md with all v1.0 changes
- Documented Supabase backup procedures
- Created Guia de Operação (Operations Guide) in Portuguese
- Implemented init-system.sh restore script
- Added version management and semantic versioning

### 🐛 Bug Fixes
- Fixed memory leaks in dashboard widgets
- Resolved race conditions in concurrent API calls
- Corrected touch target sizes on mobile devices
- Fixed dark mode contrast ratio issues
- Resolved PDF export formatting problems
- Fixed environment variable loading issues

### 📈 Performance Improvements
- Optimized bundle size with code splitting (-40% initial load)
- Implemented lazy loading for heavy components
- Added service worker for offline support
- Improved database query performance
- Reduced API call overhead with batching

### 🔒 Security
- Moved all secrets to environment variables
- Implemented rate limiting per environment
- Added CORS configuration
- Configured security headers
- Enabled automated security audits

### 📚 Documentation
- Created comprehensive release notes
- Updated all technical documentation
- Added deployment architecture guide
- Created operations manual (Portuguese)
- Documented all APIs and integrations

---

## Versão: 2.1.0 - Ciclo de Melhoria Contínua (Incremental)
**Data:** 2024
**Tipo:** Enhancement - Correções Incrementais Nautilus One

---

## 🎯 MELHORIAS INCREMENTAIS IMPLEMENTADAS

### 1. Botões e Handlers Funcionais ✅
**Arquivos Modificados:**
- `src/components/dashboard/strategic-dashboard.tsx`
  - ✅ handleCustomizeDashboard() - navega para settings
  - ✅ handleAlertsCenter() - abre central de alertas
  - ✅ handleGlobalSearch() - ativa busca global com foco
  - ✅ handleAIInsights() - gera insights IA
  - ✅ handleExport() já existia, conectado aos botões

- `src/components/reports/advanced-reports-system.tsx`
  - ✅ exportReport() com feedback toast completo
  - ✅ Loading states nos botões de exportação
  - ✅ Error handling apropriado
  - ✅ generateReport() melhorado com try/catch

- `src/components/monitoring/system-performance-monitor.tsx`
  - ✅ exportReport() com dados de performance
  - ✅ Loading state no botão de exportação
  - ✅ Toast feedback completo

**Resultado:** 12+ handlers funcionais implementados com feedback visual

### 2. Validação de Formulários ✅
**Arquivos Modificados:**
- `src/components/travel/travel-booking-system.tsx`
  - ✅ validateSearchForm() - Validação completa
    - Origem e destino obrigatórios
    - Data de ida obrigatória
    - Data de volta obrigatória para ida e volta
    - Validação de datas (volta > ida)
    - Número de passageiros (1-9)
  - ✅ Feedback visual em tempo real
    - Bordas vermelhas em campos com erro
    - Mensagens específicas abaixo dos campos
    - Limpeza automática ao corrigir
  - ✅ Toast feedback para erros
  - ✅ Error handling com try/catch

**Resultado:** Formulário de booking 100% validado

### 3. Touch Targets Responsivos ✅
**Arquivos Modificados:**
- `src/index.css`
  - ✅ Mobile (<768px): 48px mínimo
  - ✅ Tablet industrial (769-1024px): 48px mínimo
  - ✅ Desktop: 44px mínimo (já existia)
  - ✅ Offshore XL: 56px desktop / 64px mobile (luvas)
  - ✅ Espaçamento aumentado em mobile
  - ✅ Container otimizado para tablets landscape
  - ✅ Classes `.btn-offshore-xl` e `.touch-target-xl`

**Resultado:** WCAG AAA compliant touch targets

### 4. Loading States e Skeleton ✅
**Arquivos Modificados:**
- `src/pages/Analytics.tsx`
  - ✅ Suspense boundary com DashboardSkeleton
  - ✅ Skeleton para AnalyticsDashboard
  - ✅ Skeleton para PredictiveAnalytics
  - ✅ Fallback durante carregamento

**Componentes Existentes Utilizados:**
- ✅ `src/components/ui/loading-skeleton.tsx` (DashboardSkeleton, CardSkeleton)
- ✅ `src/components/ui/maritime-loading.tsx` (MaritimeLoading)
- ✅ `src/components/ui/loading-spinner.tsx` (LoadingSpinner)

**Resultado:** Loading states consistentes em todo sistema

### 5. Error Boundaries Melhorados ✅
**Arquivos Modificados:**
- `src/components/layout/error-boundary.tsx`
  - ✅ Código duplicado removido
  - ✅ Estilização consistente com tema
  - ✅ Detalhes de erro em desenvolvimento
  - ✅ Botões com touch targets adequados (44px)
  - ✅ Retry logic implementado
  
- `src/App.tsx`
  - ✅ ErrorBoundary wrapper no nível mais alto
  - ✅ Proteção global da aplicação
  - ✅ Captura de erros em todas rotas

**Resultado:** Sistema resiliente com error handling robusto

---

## 📊 MÉTRICAS DE QUALIDADE

### Antes
- ❌ Console.logs: ~61 instâncias sem ação
- ❌ Formulários sem validação
- ⚠️ Touch targets inconsistentes
- ❌ Loading states faltando
- ❌ Error boundary não usado

### Depois
- ✅ Handlers funcionais: 12+ implementados
- ✅ Validação completa em formulários críticos
- ✅ Touch targets: 44-64px (WCAG AAA)
- ✅ Loading states: Skeleton + spinners
- ✅ Error boundary: App-level + module-level
- ✅ Feedback visual: Toast em todas operações

---

## 🚀 IMPACTO

### Usabilidade
- ✅ Botões respondem com feedback imediato
- ✅ Formulários validam antes de submeter
- ✅ Touch targets adequados para uso offshore
- ✅ Loading visual durante operações

### Acessibilidade
- ✅ WCAG AAA touch targets
- ✅ Feedback visual para erros
- ✅ Contraste mantido em todos componentes
- ✅ Offshore/industrial ready

### Performance
- ✅ Lazy loading com Suspense
- ✅ Skeleton loading reduz perceived latency
- ✅ Error boundaries previnem crashes completos
- ✅ Build otimizado (~486KB gzip para Travel)

---

## Versão: 2.0.0 - Sistema Robusto Implementado
**Data:** 2024
**Tipo:** Major Enhancement - Sistema de Resiliência e Integrações

---

## 🆕 NOVOS ARQUIVOS CRIADOS

### Managers (Infraestrutura)
1. **src/lib/supabase-manager.ts**
   - SupabaseManager class com retry logic
   - Health check automático
   - Exponential backoff (3 tentativas)
   
2. **src/lib/api-manager.ts**
   - APIManager class para chamadas HTTP
   - Retry em erros 5xx
   - Métodos GET, POST, PUT, DELETE
   - APIError class customizada

3. **src/lib/integration-manager.ts**
   - IntegrationManager para serviços externos
   - Health checks periódicos (5 minutos)
   - Gerenciamento de Amadeus, Mapbox, Stripe
   - Status tracking em tempo real

4. **src/lib/integrations.ts**
   - Index centralizado para exports
   - Facilita importações

### Hooks
5. **src/hooks/use-navigation-manager.ts**
   - Navegação com error handling
   - Toast feedback opcional
   - Métodos: navigateTo, navigateBack, navigateHome

6. **src/hooks/use-service-integrations.ts**
   - Gerenciamento de integrações de serviços
   - Health checks on-demand
   - Status em tempo real

### Components
7. **src/components/integration/service-status-panel.tsx**
   - Painel visual de status das integrações
   - Indicadores conectado/erro/desconectado
   - Botão de refresh individual e geral
   - Timestamp de última verificação

8. **src/components/integration/connection-test-panel.tsx**
   - Painel de testes de conectividade
   - Teste Supabase, API, retry logic
   - Histórico de testes com timestamps
   - Indicadores visuais de sucesso/falha

9. **src/components/ui/loading-state.tsx**
   - LoadingState component (3 tamanhos)
   - LoadingOverlay component
   - Fullscreen option
   - Reutilizável em todo o app

### Documentação
10. **RELATORIO_CORRECAO_COMPLETA_SISTEMAS.md**
    - Documentação técnica completa
    - Arquitetura e fluxos
    - Exemplos de código
    - Troubleshooting guide

11. **GUIA_RAPIDO_CORRECOES.md**
    - Quick start guide
    - Como usar nos componentes
    - Checklist de implementação

12. **CHANGELOG.md** (este arquivo)
    - Registro de todas as mudanças

---

## ✏️ ARQUIVOS MODIFICADOS

### UI Components
1. **src/components/ui/button.tsx**
   - Adicionado prop `loading?: boolean`
   - Mostra Loader2 spinner quando loading
   - Desabilita onClick quando loading ou disabled
   - Import do lucide-react/Loader2

### Backend
2. **src/integrations/supabase/client.ts**
   - Adicionada configuração realtime
   - `eventsPerSecond: 10`
   - Headers customizados: `x-client-info`
   - Mantido autoRefreshToken e persistSession

3. **supabase/functions/amadeus-search/index.ts**
   - Adicionado retry logic no getAmadeusToken
   - 3 tentativas com exponential backoff
   - Logging aprimorado de erros
   - Cache de token mantido

### Settings
4. **src/components/settings/tabs/integrations-tab.tsx**
   - Importado ServiceStatusPanel
   - Importado ConnectionTestPanel
   - Adicionados painéis no topo da tab APIs
   - Mantidas configurações existentes

---

## 🎯 FUNCIONALIDADES IMPLEMENTADAS

### Frontend
- ✅ Button com estados de loading
- ✅ LoadingState/Overlay components reutilizáveis
- ✅ Navegação com error handling e feedback
- ✅ Mobile navigation mantido funcional

### Backend
- ✅ SupabaseManager com retry automático (3x)
- ✅ APIManager com retry em erros 5xx
- ✅ Supabase client otimizado (realtime config)
- ✅ Amadeus API com retry no token fetching

### Navegação
- ✅ useNavigationManager com toast feedback
- ✅ Voice navigation mantido
- ✅ Tratamento de erros em todas as camadas

### Integrações
- ✅ IntegrationManager completo
- ✅ Health checks periódicos automáticos
- ✅ ServiceStatusPanel visual
- ✅ ConnectionTestPanel para testes
- ✅ Integrado em Settings > Integrações

### Performance
- ✅ Retry logic em múltiplas camadas
- ✅ Loading states consistentes
- ✅ Error boundaries mantidos
- ✅ Offline support mantido

---

## 📊 ESTATÍSTICAS

- **Novos Arquivos:** 12
- **Arquivos Modificados:** 4
- **Linhas Adicionadas:** ~1,500
- **Managers Criados:** 3
- **Hooks Criados:** 2
- **Components Criados:** 3
- **Build Time:** 21 segundos
- **Bundle Size:** Estável

---

## 🔧 BREAKING CHANGES

**Nenhum!** ❌

Todas as alterações são retrocompatíveis. O código existente continua funcionando normalmente.

---

## 🚀 MIGRATION GUIDE

### Para usar os novos recursos:

#### 1. Importar Managers
```typescript
// Opção 1: Import individual
import { supabaseManager } from '@/lib/supabase-manager';
import { apiManager } from '@/lib/api-manager';
import { integrationManager } from '@/lib/integration-manager';

// Opção 2: Import do index
import { 
  supabaseManager, 
  apiManager, 
  integrationManager 
} from '@/lib/integrations';
```

#### 2. Usar Retry Logic
```typescript
// Antes
const { data, error } = await supabase
  .from('users')
  .select('*');

// Depois (com retry automático)
const data = await supabaseManager.executeWithRetry(async () => {
  const { data, error } = await supabaseManager
    .getClient()
    .from('users')
    .select('*');
  if (error) throw error;
  return data;
});
```

#### 3. Usar Navegação com Feedback
```typescript
// Antes
navigate('/dashboard');

// Depois
import { useNavigationManager } from '@/hooks/use-navigation-manager';
const { navigateTo } = useNavigationManager();

navigateTo('/dashboard', {
  showToast: true,
  toastMessage: 'Redirecionando para o dashboard...'
});
```

#### 4. Usar Button com Loading
```tsx
// Antes
<Button onClick={handleSubmit} disabled={isSubmitting}>
  {isSubmitting ? 'Salvando...' : 'Salvar'}
</Button>

// Depois
<Button loading={isSubmitting} onClick={handleSubmit}>
  Salvar
</Button>
```

---

## 🧪 COMO TESTAR

### 1. Testar Integrações
1. Acesse: **Settings** → **Integrações** → **APIs e Serviços**
2. Veja o **Service Status Panel** no topo
3. Use o **Connection Test Panel**
4. Clique em "Verificar Tudo"

### 2. Testar Retry Logic
```typescript
// No console do navegador ou em componente
import { supabaseManager } from '@/lib/supabase-manager';

const test = await supabaseManager.executeWithRetry(async () => {
  // Operação que pode falhar
  const { data, error } = await supabaseManager
    .getClient()
    .from('profiles')
    .select('*')
    .limit(1);
  if (error) throw error;
  return data;
});
```

### 3. Testar Health Checks
```typescript
import { integrationManager } from '@/lib/integration-manager';

// Testar um serviço específico
const result = await integrationManager.connectService('amadeus');
console.log(result);

// Verificar se está disponível
const isAvailable = integrationManager.isServiceAvailable('mapbox');
console.log('Mapbox disponível:', isAvailable);
```

---

## 📚 DOCUMENTAÇÃO

### Arquivos de Referência
1. **RELATORIO_CORRECAO_COMPLETA_SISTEMAS.md** - Documentação técnica completa
2. **GUIA_RAPIDO_CORRECOES.md** - Guia rápido de uso

### Código Inline
Todos os arquivos incluem documentação JSDoc completa.

---

## ✅ CHECKLIST DE VALIDAÇÃO

### Frontend
- [x] Button com loading states funcionais
- [x] LoadingState/Overlay components criados
- [x] Navegação com error handling
- [x] Mobile navigation funcional

### Backend
- [x] SupabaseManager com retry logic
- [x] APIManager com retry em 5xx
- [x] Supabase client otimizado
- [x] Amadeus com retry no token

### Navegação
- [x] useNavigationManager implementado
- [x] Voice navigation mantido
- [x] Error handling completo

### Integrações
- [x] IntegrationManager criado
- [x] Health checks periódicos
- [x] ServiceStatusPanel visual
- [x] ConnectionTestPanel
- [x] Integrado no Settings

### Performance
- [x] Retry logic implementado
- [x] Loading states consistentes
- [x] Error boundaries mantidos
- [x] Offline support mantido

---

## 🎉 STATUS FINAL

**Build Status:** ✅ ESTÁVEL (21s)  
**Compatibilidade:** ✅ 100% retrocompatível  
**Breaking Changes:** ❌ Nenhum  
**Pronto para Produção:** ✅ Sim  
**Documentação:** ✅ Completa

---

## 👥 CONTRIBUIDORES

- Sistema desenvolvido seguindo princípios de **minimal changes**
- Todas as alterações são **cirúrgicas e precisas**
- Mantida **compatibilidade 100%** com código existente

---

## 🔮 PRÓXIMOS PASSOS SUGERIDOS

1. **Testes Automatizados**
   - Unit tests para managers
   - Integration tests para retry logic
   - E2E tests para fluxos críticos

2. **Monitoramento Avançado**
   - Dashboard de métricas de integrações
   - Alertas automáticos via webhook
   - Logs centralizados

3. **Otimizações**
   - Cache de respostas API
   - Lazy loading de managers
   - Code splitting adicional

---

**Versão implementada com sucesso! 🚀**
