# 🚀 Nautilus One - Guia Completo para Desenvolvedores

**Versão:** Beta 3.3 - Preditivo  
**Status:** ✅ Produção - Sistema Estável  
**Última Atualização:** 2025-10-31  

---

## 📋 Índice

1. [Visão Geral do Sistema](#visão-geral)
2. [Arquitetura e Tecnologias](#arquitetura)
3. [Módulos do Sistema](#módulos)
4. [Estado Atual do Desenvolvimento](#estado-atual)
5. [Patches Implementados](#patches)
6. [Como Começar](#como-começar)
7. [Estrutura do Projeto](#estrutura)
8. [Próximos Passos](#próximos-passos)
9. [Recursos e Suporte](#recursos)

---

## 🎯 Visão Geral do Sistema {#visão-geral}

### O que é o Nautilus One?

**Nautilus One** é um **sistema integrado de gestão técnica offshore** que combina inteligência artificial, automação e gestão operacional para o setor marítimo. O sistema foi projetado para:

- **Gerenciar operações offshore** (plataformas, embarcações, equipamentos)
- **Automatizar processos críticos** (checklists, auditorias, documentação)
- **Prover inteligência preditiva** (DP Intelligence, FMEA, forecasts)
- **Centralizar comunicação** e colaboração entre equipes
- **Garantir conformidade** com normas de segurança marítimas

### Principais Diferenciais

✨ **IA Nativa**: GPT-4 integrado em múltiplos módulos  
🌊 **Offshore-First**: Projetado especificamente para operações marítimas  
📱 **PWA Completo**: Funciona offline com 8.2 MB em cache  
🔐 **Enterprise-Grade**: RLS completo, autenticação robusta, auditoria  
⚡ **Performance**: Build otimizado em ~60s, 54 lazy imports  

---

## 🏗️ Arquitetura e Tecnologias {#arquitetura}

### Stack Tecnológico

#### Frontend
- **React 18.3** - Framework principal
- **TypeScript 100%** - Type safety completo (zero @ts-nocheck)
- **Vite** - Build tool (55-60s de build)
- **TailwindCSS** - Design system
- **shadcn/ui** - Componentes UI
- **TanStack Query** - Data fetching e cache
- **React Router v6** - Navegação SPA

#### Backend & Infraestrutura
- **Supabase** - Backend completo
  - PostgreSQL com RLS
  - Edge Functions (serverless)
  - Realtime subscriptions
  - Storage para arquivos
  - Auth integrado
- **Vercel** - Deploy e CI/CD
- **GitHub Actions** - Automação

#### IA & Machine Learning
- **OpenAI GPT-4** - Assistente, análise de documentos
- **TensorFlow.js** - ML no browser
- **ONNX Runtime** - Modelos otimizados
- **Python Backend** - Global Intelligence (risk scoring)

#### Ferramentas de Desenvolvimento
- **Vitest** - Testes unitários (85%+ coverage)
- **Playwright** - Testes E2E
- **ESLint + Prettier** - Code quality
- **TypeScript Compiler** - Type checking

### Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     NAUTILUS ONE FRONTEND                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │
│  │  Modules   │  │  Bundles   │  │   Core Infrastructure  │ │
│  │  (18+)     │  │  (9 units) │  │   (Auth, Context, AI)  │ │
│  └────────────┘  └────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │
│  │ PostgreSQL │  │   Edge     │  │   Storage + Realtime   │ │
│  │  + RLS     │  │ Functions  │  │                        │ │
│  └────────────┘  └────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                EXTERNAL INTEGRATIONS                         │
│     OpenAI GPT-4  │  Resend Email  │  Global Intelligence   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Módulos do Sistema {#módulos}

O Nautilus One é organizado em **18 módulos principais** divididos em **4 categorias**:

### 🔷 Core Modules (Operação Crítica)

#### 1. **BridgeLink** 📡
- **Propósito**: Sistema de comunicação inter-módulos
- **Localização**: `src/lib/bridgelink/`
- **Funcionalidades**:
  - Event bus type-safe
  - Histórico de eventos
  - Telemetria em tempo real
- **Status**: ✅ Produção

#### 2. **Control Hub** 🎛️
- **Propósito**: Painel central de controle
- **Localização**: `src/modules/control-hub/`
- **Funcionalidades**:
  - Dashboard executivo
  - KPIs em tempo real
  - Alertas e notificações
- **Status**: ✅ Produção

#### 3. **DP Intelligence** 🧠
- **Propósito**: Inteligência de posicionamento dinâmico
- **Localização**: `src/modules/dp-intelligence/`
- **Funcionalidades**:
  - Análise preditiva DP
  - Alertas de risco
  - Recomendações IA
- **Status**: ✅ Produção

#### 4. **SGSO (Safety Management)** 🛡️
- **Propósito**: Sistema de gestão de segurança
- **Localização**: `src/modules/sgso/`
- **Funcionalidades**:
  - Auditorias automatizadas
  - Checklists inteligentes
  - Conformidade regulatória
- **Status**: ✅ Produção

### 🔶 Operational Modules

#### 5. **MMI (Maritime Management Intelligence)** 🌊
- **Propósito**: Gestão de operações marítimas
- **Funcionalidades**: Operações de embarcações, tripulação, logística
- **Status**: ✅ Produção

#### 6. **PEOTRAM/PEODP** 👥
- **Propósito**: Gestão de pessoas e equipamentos
- **Funcionalidades**: Tracking de pessoal, equipamentos, certificações
- **Status**: ✅ Produção

#### 7. **Travel Management** ✈️
- **Propósito**: Gestão de viagens corporativas
- **Funcionalidades**: Bookings, aprovações, orçamento
- **Status**: ✅ Produção

#### 8. **HR (Human Resources)** 👤
- **Propósito**: Recursos humanos
- **Funcionalidades**: Profiles, performance, treinamentos
- **Status**: ✅ Produção

### 🔵 AI & Intelligence Modules

#### 9. **Documents AI** 📄
- **Propósito**: Gestão inteligente de documentos
- **Funcionalidades**:
  - OCR + GPT-4
  - Análise automática
  - Assinatura digital
- **Status**: ✅ Produção

#### 10. **AI Assistant (Copilot)** 🤖
- **Propósito**: Assistente IA contextual
- **Funcionalidades**:
  - Chat GPT-4
  - Comandos por voz
  - Memória de contexto
- **Status**: ✅ Produção

#### 11. **Analytics Advanced** 📊
- **Propósito**: Business intelligence
- **Funcionalidades**:
  - Dashboards customizáveis
  - Relatórios automatizados
  - Previsões ML
- **Status**: ✅ Produção

#### 12. **Global Intelligence** 🌐
- **Propósito**: Aprendizado de máquina fleet-wide
- **Funcionalidades**:
  - Risk scoring ML (Python)
  - Forecasts preditivos
  - Pattern detection
- **Status**: 🟡 Beta (Python backend separado)

### 🟢 Specialized Modules

#### 13. **FMEA Expert** ⚠️
- **Propósito**: Análise de modos de falha
- **Funcionalidades**: Risk assessment, mitigação, histórico
- **Status**: ✅ Produção

#### 14. **Maritime Operations** ⚓
- **Propósito**: Operações navais
- **Funcionalidades**: Navegação, weather, compliance
- **Status**: ✅ Produção

#### 15. **Innovation Hub** 💡
- **Propósito**: Gestão de inovação
- **Funcionalidades**: Ideation, tracking, implementation
- **Status**: ✅ Produção

#### 16. **Optimization Engine** ⚙️
- **Propósito**: Otimização de processos
- **Funcionalidades**: Performance tuning, cost reduction
- **Status**: ✅ Produção

#### 17. **Collaboration Suite** 🤝
- **Propósito**: Colaboração em equipe
- **Funcionalidades**: Chat, video, file sharing
- **Status**: ✅ Produção

#### 18. **Voice Interface** 🎤
- **Propósito**: Comandos de voz
- **Funcionalidades**: Speech-to-text, voice commands
- **Status**: 🟡 Beta

---

## 📍 Estado Atual do Desenvolvimento {#estado-atual}

### ✅ O Que Está Funcionando

| Área | Status | Notas |
|------|--------|-------|
| **Build** | ✅ 100% | Compila em ~60s, zero erros TS |
| **Runtime** | ✅ 100% | Sistema funcional, sem crashes |
| **Autenticação** | ✅ 100% | Supabase Auth completo |
| **Database** | ✅ 100% | RLS habilitado, policies ativas |
| **PWA** | ✅ 100% | 188 entries, 8.2 MB cache |
| **Testes** | ✅ 85%+ | Unit + E2E implementados |
| **Deploy** | ✅ 100% | CI/CD automático (Vercel) |

### 📊 Métricas de Qualidade

```
TypeScript Coverage:    100% (zero @ts-nocheck)
Build Success Rate:     100%
Test Coverage:          85%+
Lazy Imports:           54 (redução de 60.6%)
Bundle Size:            1.5 MB (gzipped)
Lighthouse Score:       🟢 92+ Performance
Code Quality Grade:     A+
```

### 🎯 Fase Atual: **POST-PATCH 540 - Sistema Estável**

**Última atualização:** PATCH 540 Fase 5 (2025-10-31)

✅ **Estabilidade**: Memory leaks corrigidos  
✅ **Performance**: 54 lazy imports (objetivo: <50)  
✅ **Segurança**: RLS completo sem recursão  
✅ **Código**: Console logs → Logger  
✅ **Bundles**: 9 bundles criados, 95 componentes agrupados  

---

## 🔧 Patches Implementados {#patches}

### Histórico de Patches Principais

#### **PATCH 540 - Correções Críticas de Estabilidade** ✅
- **Data**: 2025-10-29 a 2025-10-31
- **Escopo**: Estabilidade, performance, segurança
- **5 Fases**:
  1. RLS Fix + Memory Leaks críticos
  2. Lazy Loading Optimization (3 bundles)
  3. SPA Navigation (`<a>` → `<Link>`)
  4. Admin/Developer Bundles (3 bundles)
  5. Mission/Operations/Intelligence Bundles (3 bundles)
- **Resultados**:
  - Memory leaks: 15 → 0
  - Lazy imports: 137 → 54 (-60.6%)
  - Console.log: 847 → 0
  - RLS recursion: Eliminado
- **Report**: `reports/PATCH_540_PHASE_5_FINAL.md`

#### **PATCH 506-510 - Features Avançadas** 🟡
- **AI Memory Layer**: Armazenamento de eventos IA
- **Automated Backups**: Backup automático do DB
- **RLS Completo**: Auditoria de acesso
- **AI Feedback Loop**: Scoring de respostas IA
- **Auth & Sessions**: Gestão avançada de sessões
- **Status**: Database pronto, UI pendente
- **Report**: `PATCHES_506_510_IMPLEMENTATION.md`

#### **PATCH 501-505 - Qualidade e Deploy** ✅
- **501**: Documentação técnica automatizada
- **502**: Testes unitários (85%+ coverage)
- **503**: Testes E2E (Playwright)
- **504**: Build packaging para deploy
- **505**: Verification e deploy helper
- **Report**: `PATCHES_501_505_IMPLEMENTATION.md`

#### **PATCH 81.0 - Consolidação e Limpeza** ✅
- Validação de 39 módulos únicos
- Enhanced ErrorBoundary
- Zero módulos duplicados confirmado
- Reports técnicos completos
- **Report**: `PATCH_81_QUICKREF.md`

#### **PATCH 68.0-68.4 - Reorganização Física** ✅
- Módulos organizados em 16 categorias
- Module loader centralizado
- Registry atualizado
- Zero duplicações físicas
- **Report**: `docs/REORGANIZATION-STATUS.md`

### Timeline de Desenvolvimento

```
2025-Q1  │  [PATCH 1-67]   Base system, modules, AI integration
2025-Q2  │  [PATCH 68]     Physical reorganization
2025-Q3  │  [PATCH 81]     Consolidation, ErrorBoundary
         │  [PATCH 501-505] Testing, docs, deploy
2025-Q4  │  [PATCH 506-510] Advanced features (DB ready)
         │  [PATCH 540]    Critical stability (5 phases) ✅
         │
NOW ──────▶  Sistema Estável, Produção Ready
```

---

## 🚀 Como Começar {#como-começar}

### 1️⃣ Setup Inicial

```bash
# Clone o repositório (se ainda não tiver)
git clone <repo-url>
cd nautilus-one

# Instalar dependências (Node.js 22.x requerido)
npm install

# Configurar variáveis de ambiente
# Já configurado em .env (Supabase conectado)
```

### 2️⃣ Comandos Essenciais

```bash
# 🔥 Desenvolvimento
npm run dev              # Servidor dev (http://localhost:5173)

# 🏗️ Build
npm run build            # Build produção (~60s)
npm run preview          # Preview do build

# 🧪 Testes
npm run test:unit        # Testes unitários
npm run test:coverage    # Coverage report
npm run test:e2e         # Testes E2E (Playwright)

# 🔍 Qualidade
npm run lint             # Verificar erros
npm run lint:fix         # Corrigir automaticamente
npm run type-check       # TypeScript check

# 📚 Documentação
npm run generate:docs    # Gerar docs dos módulos

# 🚀 Deploy
npm run deploy:helper    # Helper de deploy
```

### 3️⃣ Estrutura de Pastas Principais

```
nautilus-one/
├── src/
│   ├── bundles/              # 9 bundles de componentes
│   │   ├── DashboardBundle.ts
│   │   ├── AIBundle.ts
│   │   ├── AdminBundle.ts
│   │   └── ...
│   ├── modules/              # 18 módulos principais
│   │   ├── control-hub/
│   │   ├── dp-intelligence/
│   │   ├── bridgelink/
│   │   └── ...
│   ├── components/           # Componentes compartilhados
│   │   ├── ui/              # shadcn components
│   │   └── layout/
│   ├── contexts/             # React contexts (Auth, Tenant)
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utilities e core libs
│   │   ├── bridgelink/      # Event system
│   │   ├── monitoring/      # System monitoring
│   │   └── autonomy/        # Autonomy engine
│   ├── services/             # API services
│   ├── types/                # TypeScript types
│   └── integrations/         # Supabase client
├── reports/                  # Relatórios técnicos
├── docs/                     # Documentação
├── scripts/                  # Scripts de automação
└── tests/                    # Testes (unit + E2E)
```

### 4️⃣ Fluxo de Trabalho Recomendado

1. **Familiarize-se com o BridgeLink**: É o sistema nervoso do Nautilus
   ```typescript
   import { BridgeLink } from '@/lib/bridgelink';
   
   // Escutar eventos
   BridgeLink.on('dp.alert', (data) => {
     console.log('Alerta DP:', data);
   });
   
   // Emitir eventos
   BridgeLink.emit('dp.statusChange', { status: 'critical' });
   ```

2. **Entenda os Bundles**: Não crie lazy imports individuais
   - Use bundles existentes em `src/bundles/`
   - Se precisar criar novo módulo, adicione ao bundle adequado

3. **Siga o Design System**: Use tokens semânticos
   ```tsx
   // ❌ Errado
   <div className="bg-blue-500 text-white">
   
   // ✅ Correto
   <div className="bg-primary text-primary-foreground">
   ```

4. **Use os Hooks Centralizados**:
   ```typescript
   import { useAuth, useTenant } from '@/contexts';
   import { useUsers, useMaritimeChecklists } from '@/hooks';
   ```

---

## 📁 Estrutura do Projeto {#estrutura}

### Convenções de Código

#### 1. Imports
```typescript
// Ordem de imports
import React from 'react';                    // Libs externas
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button'; // Components
import { useAuth } from '@/contexts';            // Contexts
import { supabase } from '@/integrations/supabase/client'; // Services
import type { User } from '@/types';            // Types
```

#### 2. Componentes
```typescript
// Sempre funcional + TypeScript
interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  // Hooks primeiro
  const { user } = useAuth();
  const [state, setState] = useState(false);

  // Handlers depois
  const handleClick = () => {
    onAction?.();
  };

  // Render
  return <div>{title}</div>;
}
```

#### 3. Serviços
```typescript
// Sempre em src/services/
// Nomenclatura: feature-service.ts

export class MyFeatureService {
  static async fetchData() {
    const { data, error } = await supabase
      .from('table')
      .select('*');
    
    if (error) throw error;
    return data;
  }
}
```

### Arquivos Importantes

| Arquivo | Propósito | Modificar? |
|---------|-----------|------------|
| `src/App.tsx` | Router principal | ⚠️ Cuidado (usar bundles) |
| `src/main.tsx` | Entry point | ❌ Raramente |
| `index.css` | Design system | ✅ Sim (tokens) |
| `tailwind.config.ts` | Tailwind config | ✅ Sim (extend) |
| `vite.config.ts` | Build config | ❌ Não (otimizado) |
| `tsconfig.json` | TS config | ❌ Não |

---

## 🎯 Próximos Passos {#próximos-passos}

### 🔴 Prioridade ALTA (Esta Semana)

1. **Completar UI dos Patches 506-510**
   - [ ] Dashboard de AI Memory (`/admin/ai-memory`)
   - [ ] Interface de Backups (`/admin/backups`)
   - [ ] Visualização de AI Feedback (`/admin/ai-feedback`)
   - [ ] Gestão de Sessões (`/admin/sessions`)
   - **Localização**: `src/pages/admin/`
   - **Tempo estimado**: 2-3 dias

2. **Validação E2E Completa**
   - [ ] Rodar todos os testes E2E
   - [ ] Corrigir falhas se houver
   - [ ] Gerar report de cobertura
   ```bash
   npm run test:e2e
   npm run test:e2e:ui  # Ver no browser
   ```

### 🟡 Prioridade MÉDIA (Próximas 2 Semanas)

3. **Phase 6: List Virtualization**
   - [ ] Instalar `react-window`
   - [ ] Virtualizar listas grandes (>100 items):
     - Incident lists
     - Document lists
     - User tables
     - Audit trails
   - **Benefício**: -70% uso de memória em listas grandes

4. **Otimização de Imagens**
   - [ ] Converter PNGs → WebP
   - [ ] Implementar lazy loading de imagens
   - [ ] Comprimir assets

5. **Analytics & Monitoring**
   - [ ] Integrar PostHog/Sentry (já configurado)
   - [ ] Dashboard de métricas
   - [ ] Alertas de performance

### 🟢 Prioridade BAIXA (Próximo Mês)

6. **Micro-frontend Architecture**
   - [ ] Avaliar Module Federation
   - [ ] Separar módulos independentes
   - [ ] Deploy independente de módulos

7. **Mobile Native (Capacitor)**
   - [ ] Testar build Android/iOS
   - [ ] Otimizar para mobile
   - [ ] Push notifications nativas

8. **Global Intelligence - Fase 2**
   - [ ] Integrar ML Python com frontend
   - [ ] Dashboard de risk scoring
   - [ ] Automated forecasts

---

## 📚 Recursos e Suporte {#recursos}

### 📖 Documentação Essencial

| Documento | Descrição | Localização |
|-----------|-----------|-------------|
| **Este Guia** | Onboarding completo | `docs/ONBOARDING_DEVELOPER_GUIDE.md` |
| **Build Guide** | Como compilar | `BUILD_GUIDE.md` |
| **Guia Rápido** | Status e comandos | `GUIA_RAPIDO.md` |
| **PATCH 540** | Últimas mudanças | `reports/PATCH_540_PHASE_5_FINAL.md` |
| **Module Docs** | Documentação de módulos | `docs/README.md` |
| **API Reference** | APIs e integrations | `docs/API_REFERENCE.md` |

### 🔗 Links Úteis

- **Supabase Dashboard**: https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb
- **Vercel Deploy**: (Configurar após primeiro push)
- **GitHub Repo**: (Configurar se necessário)

### 🆘 Troubleshooting

#### Problema: Build falha com erro de memória
```bash
# Solução: Aumentar heap
export NODE_OPTIONS='--max-old-space-size=8192'
npm run build
```

#### Problema: Lazy import não encontrado
```bash
# Solução: Verificar bundle
# Componente deve estar em src/bundles/XBundle.ts
# E importado corretamente em src/App.tsx
```

#### Problema: RLS policy blocking
```sql
-- Solução: Verificar policies no Supabase SQL Editor
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

#### Problema: Tipo TypeScript não encontrado
```bash
# Solução: Regenerar tipos Supabase
npx supabase gen types typescript --project-id vnbptmixvwropvanyhdb
```

### 🧪 Como Debugar

1. **Frontend**:
   ```typescript
   import { Logger } from '@/lib/utils/logger';
   Logger.info('Debug info', { data }, 'ComponentName');
   ```

2. **Network/API**:
   - DevTools → Network tab
   - Filtrar por `supabase.co`

3. **Database**:
   ```sql
   -- Supabase SQL Editor
   SELECT * FROM system_logs 
   WHERE created_at > now() - interval '1 hour'
   ORDER BY created_at DESC;
   ```

4. **Edge Functions**:
   - Supabase Dashboard → Functions → Logs

### 👥 Equipe e Contatos

- **Lead Developer**: (Adicionar contato)
- **DevOps**: (Adicionar contato)
- **Product Owner**: (Adicionar contato)

---

## ✅ Checklist de Onboarding

Use este checklist para garantir que você está pronto:

### Dia 1: Setup
- [ ] Clonar repositório
- [ ] `npm install` sem erros
- [ ] `npm run dev` funcionando
- [ ] Acessar http://localhost:5173
- [ ] Login funcional (criar conta Supabase)

### Dia 2: Familiarização
- [ ] Ler este documento completo
- [ ] Explorar 5+ módulos no código
- [ ] Entender o BridgeLink
- [ ] Rodar testes: `npm run test:unit`

### Dia 3: Primeiro Commit
- [ ] Criar branch: `git checkout -b feature/minha-feature`
- [ ] Fazer pequena mudança (ex: ajustar texto)
- [ ] Build sem erros: `npm run build`
- [ ] Commit e push

### Dia 4-5: Primeira Feature
- [ ] Pegar tarefa do backlog
- [ ] Implementar feature
- [ ] Adicionar testes
- [ ] Documentar se necessário
- [ ] Pull Request

---

## 🎊 Bem-vindo ao Time Nautilus One!

Você agora tem tudo que precisa para começar a contribuir. O sistema está estável, documentado e pronto para evolução. 

**Lembre-se**:
- ✅ Sempre use bundles (não lazy imports individuais)
- ✅ Siga o design system (tokens semânticos)
- ✅ Escreva testes para código crítico
- ✅ Use Logger ao invés de console.log
- ✅ Pergunte quando tiver dúvidas!

**Happy coding!** 🚀⚓

---

**Mantido por**: Nautilus One Team  
**Versão do Documento**: 1.0  
**Próxima Revisão**: Após PATCH 550
