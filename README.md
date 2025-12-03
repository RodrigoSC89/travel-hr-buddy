# Nautilus One v3.2+ 🚢

Sistema completo de gerenciamento marítimo com IA, integração de APIs e segurança enterprise.

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [docs/INDEX.md](./docs/INDEX.md) | **Índice da documentação** |
| [docs/getting-started.md](./docs/getting-started.md) | Guia de início rápido |
| [docs/STRUCTURE.md](./docs/STRUCTURE.md) | **Estrutura do repositório** |
| [docs/architecture.md](./docs/architecture.md) | Arquitetura do sistema |
| [docs/api/](./docs/api/) | APIs e Edge Functions |
| [docs/features/](./docs/features/) | Funcionalidades |
| [docs/deployment/](./docs/deployment/) | Guia de deploy |
| [docs/development/](./docs/development/) | Guia para devs |
| [docs/SECURITY.md](./docs/SECURITY.md) | Práticas de segurança |

> 📦 **Novo desenvolvedor?** Comece por [docs/getting-started.md](./docs/getting-started.md)  
> 📁 Documentação legada: `archive/legacy-docs/`

---

## 📋 Visão Geral

**Nautilus One** é uma plataforma moderna de gestão marítima que combina:

- 🤖 **Inteligência Artificial** - OpenAI GPT-4o para análise e insights
- 🛡️ **Segurança Enterprise** - 7 headers, 4 rate limits, 6 tabelas de auditoria
- 🌐 **Integração de APIs** - StarFix (FSP) e Terrastar (ionosfera)
- 📊 **Sistema de Mocks** - Teste completo sem credenciais reais
- ⚡ **Edge Functions** - Processamento rápido com Supabase/Deno
- 🔒 **TypeScript 100%** - Type-safe em produção

---

## 🚀 Quick Start

### 1. **Clone e Configure**

```bash
# Clone o repositório
git clone <seu-repositorio>
cd travel-hr-buddy

# Instale dependências
npm install
```

### 2. **Configure Variáveis de Ambiente**

Crie arquivo `.env`:

```env
# Supabase (OBRIGATÓRIO)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_key

# OpenAI (OBRIGATÓRIO para IA)
OPENAI_API_KEY=sk-...

# APIs de Integração (OPCIONAL - usa mocks se não configurar)
VITE_STARFIX_API_URL=https://api.starfix.maritime.org
VITE_STARFIX_API_KEY=sua_chave_starfix
VITE_TERRASTAR_API_URL=https://api.terrastar.hexagon.com
VITE_TERRASTAR_API_KEY=sua_chave_terrastar

# Sistema de Mocks (DEFAULT: true)
VITE_USE_MOCK_STARFIX=true
VITE_USE_MOCK_TERRASTAR=true

# Segurança
VITE_SECURITY_ENABLED=true
VITE_RATE_LIMIT_ENABLED=true
VITE_AUDIT_LOGGING=true

# Ambiente
NODE_ENV=development
```

### 3. **Execute o Sistema**

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Build para produção
npm run build

# Preview de produção
npm run preview
```

Sistema estará disponível em: `http://localhost:5173`

---

## 📚 Documentação Completa

### **Guias de Implementação**

| Documento | Descrição |
|-----------|-----------|
| [MOCK_USAGE_GUIDE.md](./MOCK_USAGE_GUIDE.md) | **Sistema de Mocks** - Como testar sem APIs reais |
| [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) | **APIs Reais** - Ativar StarFix e Terrastar |
| [IMPROVEMENTS_SUMMARY.md](./IMPROVEMENTS_SUMMARY.md) | **Resumo Técnico** - Todas as melhorias implementadas |
| [README_MELHORIAS.md](./README_MELHORIAS.md) | **Resumo Visual** - Para não-programadores |

### **Documentação de APIs**

| API | Mock | Guide |
|-----|------|-------|
| **StarFix** (FSP) | [starfix.mock.ts](./src/services/mocks/starfix.mock.ts) | FSP Support System |
| **Terrastar** (ionosfera) | [terrastar.mock.ts](./src/services/mocks/terrastar.mock.ts) | GPS/GNSS Corrections |

### **Segurança**

| Componente | Arquivo |
|-----------|---------|
| Security Middleware | [security.middleware.ts](./src/middleware/security.middleware.ts) |
| Security Library | [security.ts](./src/lib/security.ts) |
| Environment Config | [env-config.ts](./src/lib/env-config.ts) |
| Error Handling | [ErrorBoundary.tsx](./src/components/ErrorBoundary.tsx) |

---

## 🎯 Funcionalidades

### **✅ IA e Automação**
- **6 Edge Functions com OpenAI**
  - Análise de conformidade marítima
  - Geração de relatórios
  - Resposta a incidentes
  - Insights preditivos
  - Otimização de manutenção
  - Decisões estratégicas

### **✅ Integrações de APIs**

#### **StarFix API (FSP Support)**
- ✅ Compliance marítimo (PSC/ISM/ISPS)
- ✅ Histórico de inspeções
- ✅ Gestão de deficiências
- ✅ Performance metrics
- ✅ **Mock completo** para testes

#### **Terrastar API (Ionosphere)**
- ✅ Correções ionosféricas GPS/GNSS
- ✅ Dados VTEC/STEC em tempo real
- ✅ Alertas de tempestades solares
- ✅ Previsões de 24 horas
- ✅ **Mock completo** para testes

### **✅ Segurança Enterprise**

| Camada | Proteções |
|--------|-----------|
| **Headers** | CSP, HSTS, X-Frame-Options, X-Content-Type, Referrer-Policy, Permissions-Policy, X-XSS-Protection |
| **Rate Limiting** | 4 níveis (API, Auth, Edge, Upload) |
| **Validação** | Input sanitization, SQL injection, XSS, path traversal |
| **Auditoria** | 6 tabelas (logs, security_events, api_keys, sessions, rate_limits, anomalies) |
| **Autenticação** | JWT validation, session security |

### **✅ Sistema de Mocks**

**Por que mocks?**
- ❌ URLs de APIs no código são **placeholders** (não funcionam)
- ✅ Permite testar **100% do sistema** agora
- ✅ Dados realistas baseados em especificações reais
- ✅ Fácil trocar para APIs reais depois

**Como funciona:**
```typescript
// No código
import { getTerrastarData } from '@/services/terrastar';

// Sistema detecta automaticamente:
// - VITE_USE_MOCK_TERRASTAR=true → usa mock
// - VITE_USE_MOCK_TERRASTAR=false → usa API real
```

**Características dos Mocks:**
- ⚡ Simula latência de rede (100-1000ms)
- 📊 Dados variam por localização/hora
- 🎲 Resultados randomizados (realísticos)
- 💾 Persistência em memória (durante sessão)
- 🔄 Zero mudanças de código necessárias

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Next.js)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Dashboard  │  │   Vessels    │  │   Reports    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  SECURITY MIDDLEWARE                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Rate Limit   │  │  Validation  │  │  CORS/CSP    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────┬───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│               EDGE FUNCTIONS (Supabase/Deno)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  AI Engine   │  │ Compliance   │  │   Insights   │      │
│  │  (OpenAI)    │  │  Analyzer    │  │   Reporter   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    API INTEGRATIONS                          │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ StarFix API  │  │Terrastar API │                         │
│  │   (Mock)     │  │   (Mock)     │                         │
│  └──────┬───────┘  └──────┬───────┘                         │
└─────────┼──────────────────┼─────────────────────────────────┘
          │                  │
          ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│             DATABASE (Supabase PostgreSQL)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Vessels    │  │ Inspections  │  │  Security    │      │
│  │   Reports    │  │  Incidents   │  │  Audit Logs  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testando o Sistema

### **1. Teste com Mocks (Recomendado para começar)**

```env
# .env
VITE_USE_MOCK_STARFIX=true
VITE_USE_MOCK_TERRASTAR=true
```

✅ **Funciona imediatamente** - sem credenciais de API  
✅ **Dados realistas** - baseados em specs reais  
✅ **Sem custos** - nenhuma chamada externa

### **2. Teste com APIs Reais**

```env
# .env
VITE_USE_MOCK_STARFIX=false
VITE_USE_MOCK_TERRASTAR=false

# Configure credenciais reais
VITE_STARFIX_API_URL=https://api.starfix.real.com
VITE_STARFIX_API_KEY=sua_chave_real
```

⚠️ **Requer credenciais válidas**  
⚠️ **URLs placeholders não funcionarão**

---

## 📦 Deploy em Produção

### **Pré-requisitos**

- ✅ Conta Supabase (grátis ou pago)
- ✅ Chave OpenAI (para IA)
- ✅ Credenciais StarFix/Terrastar (se usar APIs reais)
- ✅ Node.js 18+ e npm/yarn

### **Passos de Deploy**

Veja: [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)

**Resumo:**
1. Configure todas as variáveis de ambiente
2. Execute `npm run build`
3. Deploy edge functions no Supabase
4. Deploy frontend (Vercel/Netlify/etc)
5. Configure DNS e SSL
6. Ative monitoramento

---

## 🔧 Desenvolvimento

### **Estrutura de Pastas**

```
travel-hr-buddy/
├── src/
│   ├── components/          # Componentes React
│   │   └── ErrorBoundary.tsx
│   ├── lib/                 # Bibliotecas core
│   │   ├── security.ts      # Security utilities
│   │   └── env-config.ts    # Environment validation
│   ├── middleware/          # Middleware
│   │   └── security.middleware.ts
│   ├── services/            # Serviços de integração
│   │   ├── mocks/
│   │   │   ├── starfix.mock.ts
│   │   │   └── terrastar.mock.ts
│   │   ├── starfix.ts
│   │   └── terrastar.ts
│   └── supabase/
│       └── functions/       # Edge Functions
│           ├── ai-engine/
│           ├── compliance-analyzer/
│           ├── incident-response/
│           ├── insight-reporter/
│           ├── maintenance-orchestrator/
│           └── strategic-decision/
├── MOCK_USAGE_GUIDE.md      # Guia de mocks
├── API_INTEGRATION_GUIDE.md # Guia de APIs reais
└── README.md                # Este arquivo
```

### **Scripts Disponíveis**

```bash
# Desenvolvimento
npm run dev              # Inicia dev server
npm run build            # Build produção
npm run preview          # Preview build

# Supabase
npx supabase start       # Inicia Supabase local
npx supabase stop        # Para Supabase local
npx supabase functions deploy  # Deploy functions

# Testes
npm run test             # Execute testes
npm run lint             # Verifica código
```

---

## 📊 Status do Projeto

### **Completude**

| Componente | Status | Erros TypeScript |
|-----------|--------|------------------|
| Frontend Services | ✅ 100% | 0 |
| Edge Functions | ✅ 100% | 0 |
| Security | ✅ 100% | 0 |
| Middleware | ✅ 100% | 0 |
| API Mocks | ✅ 100% | 0 |
| Documentation | ✅ 100% | - |

### **Próximos Passos**

1. ✅ **Sistema 100% funcional com mocks**
2. ⏳ Obter credenciais StarFix/Terrastar reais
3. ⏳ Trocar mocks para APIs reais
4. ⏳ Deploy em produção
5. ⏳ Monitoramento e otimização

---

## 🆘 Suporte

### **Problemas Comuns**

**❓ "APIs não funcionam"**
- ✅ Use mocks: `VITE_USE_MOCK_*=true`
- ✅ URLs no código são placeholders
- ✅ Veja [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)

**❓ "Erros de TypeScript"**
- ✅ Execute `npm install`
- ✅ Verifique versão Node.js (18+)
- ✅ Delete `node_modules` e reinstale

**❓ "Supabase não conecta"**
- ✅ Verifique `.env` (URL e keys corretas)
- ✅ Inicie Supabase local: `npx supabase start`

### **Documentação Adicional**

- 📖 [README Original](./README_ORIGINAL.md) - Informações de módulos legados
- 📖 [MOCK_USAGE_GUIDE.md](./MOCK_USAGE_GUIDE.md) - Sistema de mocks
- 📖 [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) - APIs reais
- 📖 [IMPROVEMENTS_SUMMARY.md](./IMPROVEMENTS_SUMMARY.md) - Melhorias técnicas

---

## 📝 Licença

[Sua licença aqui]

---

## 🙏 Agradecimentos

- **Supabase** - Backend e Edge Functions
- **OpenAI** - Inteligência Artificial
- **StarFix** - Compliance marítimo
- **Terrastar** - Correções ionosféricas

---

**Nautilus One v3.2+** - Sistema Marítimo Completo com IA 🚢⚓

*Última atualização: Dezembro 2024*
