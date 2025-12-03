# 🏗️ Arquitetura do Sistema - Nautilus One v3.2+

Documentação completa da arquitetura técnica do sistema Nautilus One.

---

## 📊 Visão Geral

O Nautilus One é um sistema modular de 5 camadas com arquitetura serverless e edge computing.

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                         │
│                    (React/Next.js/TypeScript)                   │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYER                             │
│          (Middleware + Validation + Rate Limiting)              │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                        │
│                (Edge Functions + AI/OpenAI)                     │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION LAYER                            │
│               (StarFix API + Terrastar API + Mocks)             │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                │
│               (Supabase PostgreSQL + RLS + Audit)               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Camadas da Arquitetura

### **1. Presentation Layer (Frontend)**

**Tecnologias:**
- React 18+
- Next.js (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- Shadcn/UI components

**Responsabilidades:**
- Interface do usuário
- Gerenciamento de estado (React Query)
- Navegação e roteamento
- Validação de formulários
- Error boundaries

**Estrutura:**
```
src/
├── components/          # Componentes React reutilizáveis
│   ├── ui/             # Componentes de UI (shadcn)
│   ├── forms/          # Formulários
│   ├── charts/         # Gráficos e visualizações
│   └── ErrorBoundary.tsx
├── pages/              # Páginas (Next.js routing)
│   ├── dashboard/
│   ├── vessels/
│   ├── reports/
│   └── admin/
├── hooks/              # Custom React hooks
└── lib/                # Utilities frontend
```

**Fluxo de dados:**
```
User Action → Component → Hook → Service → API Call
              ↓
         State Update → Re-render
```

---

### **2. Security Layer (Middleware)**

**Tecnologias:**
- Next.js Middleware
- Custom security library
- JWT validation
- Rate limiting (in-memory)

**Responsabilidades:**
- Aplicação automática de security headers
- Rate limiting por IP e endpoint
- Validação de input (SQL injection, XSS)
- CORS validation
- Request/response logging
- Security audit trail

**Security Headers Aplicados:**
```typescript
{
  'Content-Security-Policy': "default-src 'self'; ...",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'X-XSS-Protection': '1; mode=block'
}
```

**Rate Limits:**
| Endpoint Type | Max Requests | Window |
|--------------|-------------|--------|
| API | 100 | 15min |
| Auth | 5 | 15min |
| Edge Functions | 50 | 1min |
| Upload | 10 | 1min |

**Fluxo:**
```
Request → getClientIP()
        → handleCORS()
        → detectSuspiciousPatterns()
        → checkRateLimit()
        → applySecurityHeaders()
        → Response
```

---

### **3. Business Logic Layer (Edge Functions)**

**Tecnologias:**
- Supabase Edge Functions (Deno)
- OpenAI GPT-4o-mini
- TypeScript
- Deno standard library

**Edge Functions Implementadas:**

#### **3.1 AI Engine**
```typescript
POST /functions/v1/ai-engine
Body: { prompt, context, model }
Returns: { response, tokens, model }
```
- Orquestrador central de IA
- Wrapper para OpenAI API
- Token usage tracking
- Error handling e retry logic

#### **3.2 Compliance Analyzer**
```typescript
POST /functions/v1/compliance-analyzer
Body: { vessel_id, inspection_data }
Returns: { compliance_score, issues, recommendations }
```
- Análise automática de conformidade PSC/ISM/ISPS
- Score calculation (0-100)
- Identificação de deficiências
- Recomendações de ação

#### **3.3 Incident Response**
```typescript
POST /functions/v1/incident-response
Body: { incident_type, vessel_id, description }
Returns: { action_plan, priority, escalation }
```
- Geração automática de planos de resposta
- Classificação de prioridade
- Escalonamento automático
- Notificação de stakeholders

#### **3.4 Insight Reporter**
```typescript
POST /functions/v1/insight-reporter
Body: { vessel_id, period }
Returns: { insights, trends, predictions }
```
- Análise de tendências
- Insights preditivos
- Relatórios automáticos
- Anomaly detection

#### **3.5 Maintenance Orchestrator**
```typescript
POST /functions/v1/maintenance-orchestrator
Body: { vessel_id, maintenance_data }
Returns: { schedule, priority, cost_estimate }
```
- Otimização de manutenção
- Scheduling inteligente
- Estimativa de custos
- Preventive maintenance suggestions

#### **3.6 Strategic Decision**
```typescript
POST /functions/v1/strategic-decision
Body: { scenario, options, constraints }
Returns: { recommendation, analysis, risk_assessment }
```
- Análise de cenários
- Recomendações estratégicas
- Risk assessment
- Cost-benefit analysis

**Arquitetura Interna de Edge Function:**
```typescript
// Padrão comum
export async function handler(req: Request): Promise<Response> {
  // 1. Security validation
  const auth = await validateAuth(req);
  
  // 2. Input validation
  const data = await validateInput(req);
  
  // 3. Business logic
  const result = await processRequest(data);
  
  // 4. Audit logging
  await logEvent(result);
  
  // 5. Response
  return new Response(JSON.stringify(result));
}
```

---

### **4. Integration Layer (API Services)**

**Responsabilidades:**
- Integração com APIs externas
- Abstração de APIs (mock vs real)
- Error handling e retry logic
- Response transformation
- Caching (opcional)

#### **4.1 StarFix API Integration**

**Real API:**
```typescript
interface StarFixAPI {
  getVesselCompliance(imo: string): Promise<ComplianceData>;
  getInspectionHistory(imo: string): Promise<Inspection[]>;
  getDeficiencies(inspection_id: string): Promise<Deficiency[]>;
  getPerformanceMetrics(imo: string): Promise<Metrics>;
}
```

**Mock Implementation:**
```typescript
class StarFixMockAPI implements StarFixAPI {
  private storage: Map<string, any>;
  
  async getVesselCompliance(imo: string): Promise<ComplianceData> {
    // Simulate API delay
    await delay(300);
    
    // Generate realistic data
    return generateMockCompliance(imo);
  }
  
  // ... outras funções
}
```

**Feature Flag:**
```typescript
const api = import.meta.env.VITE_USE_MOCK_STARFIX 
  ? new StarFixMockAPI()
  : new StarFixRealAPI();
```

#### **4.2 Terrastar API Integration**

**Real API:**
```typescript
interface TerrastarAPI {
  getIonosphereData(lat, lon): Promise<IonosphereData>;
  getCorrection(lat, lon, service_level): Promise<Correction>;
  getAlerts(region): Promise<Alert[]>;
  getForecast(lat, lon, hours): Promise<Forecast>;
}
```

**Mock Implementation:**
```typescript
class TerrastarMockAPI implements TerrastarAPI {
  async getIonosphereData(lat, lon): Promise<IonosphereData> {
    // Variação realística por latitude
    const vtec = calculateVTEC(lat, getCurrentHour());
    const stec = vtec * randomVariance(0.8, 1.2);
    
    return {
      vtec,
      stec,
      delay: calculateDelay(stec),
      timestamp: new Date().toISOString(),
    };
  }
  
  // ... outras funções
}
```

**Características dos Mocks:**
- Latência de rede simulada (100-1000ms)
- Dados variam por localização geográfica
- Variação temporal (hora do dia)
- Persistência em memória (durante sessão)
- Eventos aleatórios (30% chance de alertas)

---

### **5. Data Layer (Database)**

**Tecnologias:**
- Supabase PostgreSQL 15+
- Row Level Security (RLS)
- Triggers e functions (PL/pgSQL)
- Indexes otimizados

**Schema Principal:**

#### **Core Tables:**
```sql
-- Vessels (embarcações)
CREATE TABLE vessels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  imo_number VARCHAR(7) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  flag VARCHAR(3),
  vessel_type VARCHAR(50),
  gross_tonnage INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inspections (inspeções)
CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id UUID REFERENCES vessels(id),
  inspection_type VARCHAR(50), -- PSC, ISM, ISPS, FSI
  inspector_name VARCHAR(255),
  inspection_date DATE NOT NULL,
  port VARCHAR(100),
  deficiencies_count INTEGER DEFAULT 0,
  detention BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deficiencies (deficiências)
CREATE TABLE deficiencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID REFERENCES inspections(id),
  code VARCHAR(20),
  convention VARCHAR(50),
  severity VARCHAR(20), -- low, medium, high, critical
  description TEXT,
  corrective_action TEXT,
  status VARCHAR(20) DEFAULT 'open', -- open, closed, pending
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports (relatórios de IA)
CREATE TABLE ai_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id UUID REFERENCES vessels(id),
  report_type VARCHAR(50),
  content JSONB,
  generated_by VARCHAR(50), -- edge function name
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **Security/Audit Tables:**
```sql
-- Security audit logs
CREATE TABLE security_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(50),
  user_id UUID,
  ip_address VARCHAR(45),
  endpoint VARCHAR(255),
  method VARCHAR(10),
  status_code INTEGER,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security events (anomalias)
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50), -- AUTH_FAILURE, RATE_LIMIT, SQL_INJECTION, etc
  severity VARCHAR(20), -- low, medium, high, critical
  user_id UUID,
  ip_address VARCHAR(45),
  details JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- API keys management
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_hash VARCHAR(64) NOT NULL, -- SHA-256
  name VARCHAR(100),
  user_id UUID,
  permissions JSONB,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User sessions
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate limit tracking
CREATE TABLE rate_limit_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address VARCHAR(45) NOT NULL,
  endpoint VARCHAR(255),
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL,
  blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security anomalies
CREATE TABLE security_anomalies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anomaly_type VARCHAR(50),
  description TEXT,
  severity VARCHAR(20),
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ
);
```

**Row Level Security (RLS):**
```sql
-- Exemplo: Vessels table
ALTER TABLE vessels ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários só veem vessels da sua organização
CREATE POLICY "Users see own org vessels"
  ON vessels
  FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
    )
  );

-- Policy: Admins veem todos
CREATE POLICY "Admins see all vessels"
  ON vessels
  FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );
```

**Indexes:**
```sql
-- Performance optimization
CREATE INDEX idx_vessels_imo ON vessels(imo_number);
CREATE INDEX idx_inspections_vessel ON inspections(vessel_id);
CREATE INDEX idx_inspections_date ON inspections(inspection_date DESC);
CREATE INDEX idx_deficiencies_inspection ON deficiencies(inspection_id);
CREATE INDEX idx_security_logs_created ON security_audit_logs(created_at DESC);
CREATE INDEX idx_security_events_severity ON security_events(severity, timestamp DESC);
```

---

## 🔄 Fluxos de Dados

### **Fluxo 1: Autenticação de Usuário**

```
1. User → Login Form
         ↓
2. Frontend → POST /auth/login (Supabase Auth)
         ↓
3. Supabase Auth → Validate credentials
         ↓
4. Generate JWT token
         ↓
5. Return token to frontend
         ↓
6. Frontend → Store token (httpOnly cookie)
         ↓
7. Middleware → Validate JWT on every request
```

### **Fluxo 2: Análise de Conformidade com IA**

```
1. User → Solicita análise de vessel
         ↓
2. Frontend → GET /api/vessels/:imo/compliance
         ↓
3. Security Middleware → Validate + Rate limit
         ↓
4. Frontend Service → Fetch vessel data from DB
         ↓
5. StarFix Integration → Get inspection history
         ↓  (Mock ou Real API)
6. Edge Function (compliance-analyzer) → OpenAI analysis
         ↓
7. AI Engine → Process with GPT-4o
         ↓
8. Edge Function → Generate compliance report
         ↓
9. Database → Save report (ai_reports table)
         ↓
10. Frontend → Display results + charts
```

### **Fluxo 3: Correção GPS/GNSS (Terrastar)**

```
1. User → Request GPS correction
         ↓
2. Frontend → POST /api/gps/correction
         ↓
3. Security Middleware → Validate
         ↓
4. Terrastar Integration → getCorrection(lat, lon, level)
         ↓  (Mock: simulate | Real: API call)
5. Mock/Real API → Return correction data
         ↓
6. Frontend → Apply correction to map
         ↓
7. Database (optional) → Log correction request
```

---

## 🔐 Modelo de Segurança

### **Defesa em Profundidade (Defense in Depth)**

```
Layer 1: Network (HTTPS, TLS 1.3)
         ↓
Layer 2: Application (WAF, Rate Limiting)
         ↓
Layer 3: Authentication (JWT, Session)
         ↓
Layer 4: Authorization (RLS, RBAC)
         ↓
Layer 5: Data (Encryption at rest)
```

### **Princípios de Segurança:**

1. **Least Privilege**: RLS garante acesso mínimo
2. **Zero Trust**: Validação em cada camada
3. **Audit Everything**: Todas as ações logadas
4. **Fail Secure**: Erros não expõem dados
5. **Defense in Depth**: Múltiplas camadas de proteção

---

## ⚡ Performance e Escalabilidade

### **Estratégias de Performance:**

1. **Edge Computing**: Functions executam próximo ao usuário
2. **Serverless**: Auto-scaling automático
3. **Database Indexes**: Queries otimizadas
4. **React Query**: Caching inteligente no frontend
5. **Code Splitting**: Lazy loading de componentes

### **Limites de Escalabilidade:**

| Componente | Limite | Estratégia |
|-----------|--------|-----------|
| Edge Functions | 50 req/min | Rate limiting + queue |
| Database | 1000 connections | Connection pooling |
| OpenAI API | 10k tokens/min | Token budgeting |
| Frontend | Ilimitado | CDN (Vercel/Netlify) |

---

## 🧪 Estratégia de Testes

### **Pirâmide de Testes:**

```
     /\
    /  \    E2E (Playwright)
   /────\
  /      \  Integration (Vitest + Supertest)
 /────────\
/          \ Unit (Vitest + React Testing Library)
────────────
```

### **Cobertura Alvo:**
- Unit: > 80%
- Integration: > 60%
- E2E: Fluxos críticos (login, compliance, reports)

---

## 📊 Monitoramento e Observabilidade

### **Métricas Coletadas:**

**Frontend:**
- Page load time
- Core Web Vitals (LCP, FID, CLS)
- Error rate
- API response time

**Backend:**
- Edge function latency
- Database query time
- API call success rate
- Security events

**Business:**
- Vessels analyzed
- Reports generated
- AI tokens used
- Compliance scores

### **Alertas:**

| Alerta | Threshold | Ação |
|--------|-----------|------|
| API Error Rate | > 5% | Notificar DevOps |
| Response Time | > 3s | Investigar |
| Security Event | Severity: critical | Notificar Security Team |
| Database CPU | > 80% | Scale up |

---

## 🔧 Tecnologias e Versões

```yaml
Frontend:
  - React: 18.2+
  - Next.js: 14+
  - TypeScript: 5.3+
  - Tailwind: 3.4+

Backend:
  - Supabase: Latest
  - Deno: 1.40+
  - PostgreSQL: 15+

AI/ML:
  - OpenAI: GPT-4o-mini

APIs:
  - StarFix: Mock v1.0
  - Terrastar: Mock v1.0

Security:
  - JWT: RS256
  - HTTPS: TLS 1.3
  - Hashing: SHA-256
```

---

## 📈 Roadmap Técnico

### **Q1 2025:**
- [ ] Migração para OpenAI GPT-4 Turbo
- [ ] Implementação de cache Redis
- [ ] Websockets para real-time updates

### **Q2 2025:**
- [ ] APIs reais StarFix/Terrastar
- [ ] Machine Learning local (vessel prediction)
- [ ] Mobile app (React Native)

### **Q3 2025:**
- [ ] Multi-tenancy completo
- [ ] GraphQL API
- [ ] Blockchain para audit trail

---

## 📞 Contato Técnico

- **Arquitetura**: [Tech Lead]
- **Segurança**: [Security Team]
- **DevOps**: [DevOps Team]

---

**Nautilus One v3.2+** - Arquitetura Enterprise Maritime System 🚢⚓

*Última atualização: Dezembro 2024*
