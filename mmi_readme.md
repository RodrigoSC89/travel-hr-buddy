# 📦 MMI - Módulo de Manutenção Inteligente

**Versão:** v1.0.0-beta-mmi  
**Data:** 2025-10-14  
**Responsável:** Equipe de Engenharia / Nautilus One

## 📋 Descrição do Módulo

O MMI (Módulo de Manutenção Inteligente) é um sistema integrado de gestão de manutenção embarcada com inteligência artificial. Ele permite o gerenciamento completo de jobs de manutenção, ordens de serviço (OS), componentes e sistemas embarcados, oferecendo análises preditivas e recomendações baseadas em IA.

### Principais Funcionalidades

- **Gestão de Jobs de Manutenção**: Criação, rastreamento e análise de jobs de manutenção preventiva e corretiva
- **Análise IA para Postergação**: Avaliação inteligente para decisões de postergação de manutenções
- **Criação Automática de OS**: Geração automática de ordens de serviço vinculadas a jobs
- **Copilot IA**: Assistente conversacional para comandos e consultas relacionadas à manutenção
- **Simulação de Horímetro**: Monitoramento e simulação de horas de operação por componente
- **Alertas Críticos**: Sistema automático de notificação para jobs críticos via e-mail
- **Integração com SGSO**: Criação de eventos de risco baseados em análise de jobs críticos

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React/TypeScript)              │
├─────────────────────────────────────────────────────────────┤
│  MMI Dashboard  │  Job Manager  │  OS Manager  │  Analytics │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    REST API Layer                           │
├─────────────────────────────────────────────────────────────┤
│  /api/mmi/jobs/:id/postpone  │  /api/mmi/os/create         │
│  /api/mmi/copilot            │  /api/mmi/jobs              │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                         │
├─────────────────────────────────────────────────────────────┤
│  Edge Functions:                                            │
│  - simulate-hours       (Simulação de horímetro)           │
│  - send-alerts          (Envio de alertas críticos)        │
│  - mmi-copilot          (Assistente IA)                    │
│  - mmi-postpone-analysis (Análise de postergação)          │
│  - mmi-create-os        (Criação de OS)                    │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Integrações                              │
├─────────────────────────────────────────────────────────────┤
│  OpenAI GPT-4  │  Assistente Global  │  SGSO  │  BI/Reports │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Estrutura de Dados

### Tabela: mmi_jobs

Armazena informações sobre jobs de manutenção.

```sql
CREATE TABLE mmi_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  component_id UUID REFERENCES mmi_components(id),
  system_id UUID REFERENCES mmi_systems(id),
  job_type VARCHAR(50) NOT NULL, -- 'preventive', 'corrective', 'predictive'
  priority VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
  status VARCHAR(20) NOT NULL, -- 'pending', 'in_progress', 'completed', 'postponed', 'cancelled'
  scheduled_date TIMESTAMP,
  completed_date TIMESTAMP,
  estimated_hours DECIMAL(10,2),
  actual_hours DECIMAL(10,2),
  postpone_count INTEGER DEFAULT 0,
  last_postpone_reason TEXT,
  last_postpone_date TIMESTAMP,
  ai_analysis JSONB, -- Análise IA da última avaliação
  vessel_id UUID,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: mmi_work_orders (OS)

Armazena ordens de serviço vinculadas a jobs.

```sql
CREATE TABLE mmi_work_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wo_number VARCHAR(50) UNIQUE NOT NULL,
  job_id UUID REFERENCES mmi_jobs(id),
  title TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL, -- 'draft', 'approved', 'in_progress', 'completed', 'cancelled'
  assigned_to UUID,
  priority VARCHAR(20) NOT NULL,
  estimated_cost DECIMAL(12,2),
  actual_cost DECIMAL(12,2),
  parts_required JSONB,
  start_date TIMESTAMP,
  completion_date TIMESTAMP,
  approval_status VARCHAR(20), -- 'pending', 'approved', 'rejected'
  approved_by UUID,
  approved_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: mmi_components

Armazena informações sobre componentes embarcados.

```sql
CREATE TABLE mmi_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  system_id UUID REFERENCES mmi_systems(id),
  component_type VARCHAR(100),
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  installation_date DATE,
  expected_lifetime_hours INTEGER,
  current_hours DECIMAL(10,2) DEFAULT 0,
  last_maintenance_date TIMESTAMP,
  next_maintenance_hours DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'operational', -- 'operational', 'maintenance', 'failed', 'decommissioned'
  vessel_id UUID,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: mmi_systems

Armazena informações sobre sistemas embarcados.

```sql
CREATE TABLE mmi_systems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100), -- 'propulsion', 'electrical', 'navigation', 'safety', etc.
  vessel_id UUID,
  criticality VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
  status VARCHAR(20) DEFAULT 'operational',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: mmi_hourometer_logs

Registra histórico de horas de operação.

```sql
CREATE TABLE mmi_hourometer_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id UUID REFERENCES mmi_components(id),
  hours_recorded DECIMAL(10,2) NOT NULL,
  recording_type VARCHAR(20), -- 'automatic', 'manual', 'simulated'
  recorded_by UUID,
  notes TEXT,
  recorded_at TIMESTAMP DEFAULT NOW()
);
```

## 🔌 APIs Implementadas

### 1. POST /api/mmi/jobs/:id/postpone

**Descrição:** Análise IA para postergação de job de manutenção.

**Endpoint:** `POST /api/mmi/jobs/:id/postpone`

**Request Body:**
```json
{
  "reason": "string",
  "requested_new_date": "2025-11-15T10:00:00Z",
  "context": {
    "vessel_status": "string",
    "crew_availability": "string",
    "parts_availability": "string"
  }
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "recommendation": "approve|reject|conditional",
    "risk_level": "low|medium|high|critical",
    "reasoning": "string",
    "conditions": ["string"],
    "alternative_dates": ["2025-11-10T10:00:00Z"],
    "impact_assessment": {
      "safety": "string",
      "operational": "string",
      "financial": "string"
    }
  },
  "job_updated": true
}
```

### 2. POST /api/mmi/os/create

**Descrição:** Criação automática de Ordem de Serviço vinculada a um job.

**Endpoint:** `POST /api/mmi/os/create`

**Request Body:**
```json
{
  "job_id": "uuid",
  "assigned_to": "uuid",
  "priority": "low|medium|high|critical",
  "estimated_cost": 1500.00,
  "parts_required": [
    {
      "part_code": "string",
      "quantity": 2,
      "description": "string"
    }
  ],
  "notes": "string"
}
```

**Response:**
```json
{
  "success": true,
  "work_order": {
    "id": "uuid",
    "wo_number": "WO-2025-001",
    "job_id": "uuid",
    "status": "draft",
    "created_at": "2025-10-14T10:00:00Z"
  }
}
```

### 3. POST /api/mmi/copilot

**Descrição:** Comando IA via chat (Copilot) para interações relacionadas à manutenção.

**Endpoint:** `POST /api/mmi/copilot`

**Request Body:**
```json
{
  "message": "string",
  "context": {
    "vessel_id": "uuid",
    "user_role": "string",
    "current_view": "string"
  }
}
```

**Response:**
```json
{
  "success": true,
  "response": "string",
  "actions": [
    {
      "type": "create_job|update_job|create_os",
      "data": {},
      "confidence": 0.95
    }
  ],
  "suggestions": ["string"]
}
```

### 4. GET /api/mmi/jobs

**Descrição:** Lista jobs de manutenção com filtros.

**Endpoint:** `GET /api/mmi/jobs?status=pending&priority=high&vessel_id=uuid`

**Response:**
```json
{
  "success": true,
  "jobs": [
    {
      "id": "uuid",
      "title": "string",
      "priority": "high",
      "status": "pending",
      "scheduled_date": "2025-10-20T10:00:00Z",
      "component": {
        "name": "string",
        "current_hours": 1250.5
      }
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "per_page": 20
  }
}
```

## ⚡ Edge Functions

### 1. simulate-hours

**Arquivo:** `supabase/functions/simulate-hours/index.ts`

**Descrição:** Simula horímetro por componente baseado em padrões de operação.

**Trigger:** Cron job (executado a cada hora)

**Funcionalidade:**
- Calcula horas de operação baseado em status do componente
- Atualiza `mmi_components.current_hours`
- Registra em `mmi_hourometer_logs`
- Verifica se está próximo de manutenção programada
- Dispara alertas quando necessário

### 2. send-alerts

**Arquivo:** `supabase/functions/send-alerts/index.ts`

**Descrição:** Envia e-mail com jobs críticos que requerem atenção.

**Trigger:** Cron job (executado diariamente às 08:00)

**Funcionalidade:**
- Busca jobs com prioridade crítica ou alta
- Identifica jobs atrasados
- Agrupa alertas por embarcação e sistema
- Envia e-mail via Resend com template dinâmico
- Registra envio em log

**Template de E-mail:**
```html
<h2>🚨 Alertas de Manutenção - [Vessel Name]</h2>
<p>Os seguintes jobs requerem atenção imediata:</p>
<table>
  <tr>
    <th>Job</th>
    <th>Sistema</th>
    <th>Prioridade</th>
    <th>Data Agendada</th>
    <th>Status</th>
  </tr>
  <!-- Jobs críticos -->
</table>
```

### 3. mmi-copilot

**Arquivo:** `supabase/functions/mmi-copilot/index.ts`

**Descrição:** Processamento de comandos do assistente IA para manutenção.

**Integração:** OpenAI GPT-4o via Supabase

**Exemplos de Comandos:**
- "Crie um job de manutenção preventiva para o motor principal"
- "Quais são os jobs críticos para a embarcação X?"
- "Gere uma OS para o job #123"
- "Qual o status da manutenção do sistema elétrico?"

## 🤖 Integração com IA (GPT-4 via OpenAI)

### Configuração

```typescript
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const MODEL = "gpt-4o-mini"; // ou "gpt-4o" para tarefas mais complexas
```

### System Prompt para MMI

```typescript
const systemPrompt = `
Você é um especialista em manutenção naval e engenharia marítima integrado ao sistema MMI (Módulo de Manutenção Inteligente) do Nautilus One.

Suas responsabilidades incluem:
- Análise de viabilidade de postergação de manutenções
- Avaliação de riscos operacionais e de segurança
- Recomendações baseadas em histórico de falhas
- Sugestões de otimização de recursos
- Interpretação de dados de horímetro e desgaste
- Criação e gestão de jobs e ordens de serviço

Você deve considerar:
- Normas NORMAM (Marinha do Brasil)
- Convenções internacionais (SOLAS, MARPOL)
- Regulamentações de classe (Lloyd's, ABS, etc.)
- Segurança operacional
- Custos de manutenção diferida
- Impacto na disponibilidade da embarcação

Responda de forma técnica, precisa e orientada à ação.
`;
```

### Exemplo de Análise de Postergação

**Input:**
```json
{
  "job": {
    "title": "Manutenção preventiva - Motor Principal",
    "scheduled_date": "2025-10-20",
    "current_hours": 8500,
    "next_maintenance_hours": 8000,
    "last_maintenance": "2024-08-15"
  },
  "reason": "Embarcação em viagem crítica para cliente importante",
  "requested_new_date": "2025-11-15"
}
```

**Output da IA:**
```json
{
  "recommendation": "conditional",
  "risk_level": "medium",
  "reasoning": "O motor ultrapassou em 500 horas o intervalo recomendado. A postergação por mais 25 dias adiciona risco moderado, mas é viável com monitoramento rigoroso.",
  "conditions": [
    "Realizar inspeção visual diária do motor",
    "Monitorar temperatura e vibração a cada 4 horas",
    "Preparar equipe para manutenção de emergência se necessário",
    "Limitar RPM a 85% da capacidade"
  ],
  "alternative_dates": ["2025-11-01", "2025-11-08"],
  "impact_assessment": {
    "safety": "Risco moderado de falha se não monitorado adequadamente",
    "operational": "Possível redução de performance e aumento de consumo",
    "financial": "Custo de manutenção diferida pode aumentar em 15-20% se houver dano adicional"
  }
}
```

## 🔗 Integrações Internas

### Assistente Global Nautilus One

O MMI é integrado ao assistente IA global do sistema, permitindo que usuários façam consultas e comandos de manutenção através do chat principal.

**Atualização no System Prompt:**
```typescript
// Adicionado ao assistant-query/index.ts
const systemPrompt = `
...
13. **MMI - Manutenção Inteligente** (/mmi) - Gestão de manutenção embarcada
    - Criar e gerenciar jobs de manutenção
    - Gerar ordens de serviço (OS)
    - Análise IA para postergação
    - Monitoramento de horímetro
    - Alertas de manutenção crítica

Quando o usuário fizer perguntas sobre:
- Manutenção, jobs, ordens de serviço
- Componentes e sistemas embarcados
- Horímetro e horas de operação
- Postergação de manutenções
- Falhas e histórico

Utilize o contexto do módulo MMI e oriente as respostas para ações práticas dentro do sistema.
`;
```

### SGSO (Sistema de Gestão de Saúde e Segurança Ocupacional)

**API de Integração:**

```typescript
// POST /api/sgso/events/create-from-job
interface SGSOEventFromJob {
  job_id: string;
  event_type: 'risk' | 'incident' | 'near_miss';
  risk_level: string;
  description: string;
  ai_suggestion: {
    event_category: string;
    recommended_actions: string[];
    related_norms: string[];
  };
}
```

**Fluxo de Integração:**
1. Job crítico detectado pelo MMI
2. Sistema avalia se há risco de segurança
3. IA sugere criação de evento SGSO
4. Evento é criado automaticamente ou sugere ao usuário
5. Vínculo entre job ↔ evento SGSO é estabelecido

### BI / Dashboards

**Feed de Dados para Analytics:**

```typescript
interface MMIAnalyticsData {
  tempo_medio_por_job: {
    preventivo: number;
    corretivo: number;
    preditivo: number;
  };
  taxa_postergacao: {
    total: number;
    aprovadas: number;
    rejeitadas: number;
    taxa_percentual: number;
  };
  falhas_recorrentes: Array<{
    component_id: string;
    component_name: string;
    failure_count: number;
    last_failure: string;
    mtbf: number; // Mean Time Between Failures
  }>;
  horímetro_por_sistema: Array<{
    system_name: string;
    total_hours: number;
    components_count: number;
    avg_hours_per_component: number;
  }>;
}
```

**Dashboard por Sistema/Componentes:**
- Visualização de horas de operação
- Status de manutenção
- Jobs pendentes e concluídos
- Tendências de falhas
- Custos de manutenção

## 🧪 Testes Automatizados

### Estrutura de Testes

```
src/tests/mmi/
├── unit/
│   ├── create-job.test.ts
│   ├── postpone-analysis.test.ts
│   ├── create-os.test.ts
│   └── hourometer-calculation.test.ts
├── integration/
│   ├── job-to-os-flow.test.ts
│   ├── hourometer-edge-function.test.ts
│   └── sgso-integration.test.ts
└── e2e/
    ├── copilot-chat.test.ts
    ├── critical-job-alert.test.ts
    └── postpone-workflow.test.ts
```

### Testes Unitários

#### 1. Criar Job via API

```typescript
describe('MMI - Create Job API', () => {
  it('should create a new maintenance job with valid data', async () => {
    const jobData = {
      title: 'Manutenção Preventiva - Motor Principal',
      component_id: 'component-uuid',
      job_type: 'preventive',
      priority: 'high',
      scheduled_date: '2025-11-01T10:00:00Z'
    };
    
    const response = await fetch('/api/mmi/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    });
    
    expect(response.status).toBe(201);
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.job.id).toBeDefined();
    expect(result.job.title).toBe(jobData.title);
  });
  
  it('should validate required fields', async () => {
    const invalidData = { title: 'Test' }; // Missing required fields
    
    const response = await fetch('/api/mmi/jobs', {
      method: 'POST',
      body: JSON.stringify(invalidData)
    });
    
    expect(response.status).toBe(400);
  });
});
```

#### 2. Postergar via IA (com Mock)

```typescript
describe('MMI - Postpone Analysis', () => {
  it('should analyze postponement request and return recommendation', async () => {
    // Mock OpenAI response
    const mockAIResponse = {
      recommendation: 'conditional',
      risk_level: 'medium',
      reasoning: 'Análise detalhada...',
      conditions: ['Monitorar diariamente']
    };
    
    // Mock the AI call
    vi.mock('openai', () => ({
      generateAnalysis: vi.fn().mockResolvedValue(mockAIResponse)
    }));
    
    const response = await fetch('/api/mmi/jobs/job-123/postpone', {
      method: 'POST',
      body: JSON.stringify({
        reason: 'Viagem crítica',
        requested_new_date: '2025-11-15T10:00:00Z'
      })
    });
    
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.analysis.recommendation).toBe('conditional');
    expect(result.analysis.conditions.length).toBeGreaterThan(0);
  });
});
```

#### 3. Criar OS Vinculada

```typescript
describe('MMI - Create Work Order', () => {
  it('should create OS linked to job', async () => {
    const osData = {
      job_id: 'job-uuid-123',
      assigned_to: 'user-uuid',
      priority: 'high',
      estimated_cost: 2500.00
    };
    
    const response = await fetch('/api/mmi/os/create', {
      method: 'POST',
      body: JSON.stringify(osData)
    });
    
    expect(response.status).toBe(201);
    const result = await response.json();
    expect(result.work_order.job_id).toBe(osData.job_id);
    expect(result.work_order.wo_number).toMatch(/^WO-\d{4}-\d{3}$/);
  });
});
```

### Testes E2E

#### 4. Chat Copilot

```typescript
describe('MMI - Copilot Chat E2E', () => {
  it('should handle maintenance job creation via chat', async () => {
    const message = 'Crie um job de manutenção preventiva para o motor principal da embarcação Alpha';
    
    const response = await fetch('/api/mmi/copilot', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
    
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.actions[0].type).toBe('create_job');
    expect(result.actions[0].data.title).toContain('Motor Principal');
  });
});
```

#### 5. Horímetro Edge Function

```typescript
describe('MMI - Hourometer Edge Function', () => {
  it('should simulate and update component hours', async () => {
    const componentId = 'component-uuid-123';
    
    // Trigger the edge function
    await fetch('/functions/v1/simulate-hours', {
      method: 'POST',
      body: JSON.stringify({ component_id: componentId })
    });
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify component hours were updated
    const component = await fetchComponent(componentId);
    expect(component.current_hours).toBeGreaterThan(0);
    
    // Verify log was created
    const logs = await fetchHourometerLogs(componentId);
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].recording_type).toBe('simulated');
  });
});
```

#### 6. Alerta de Job Crítico

```typescript
describe('MMI - Critical Job Alert E2E', () => {
  it('should send email alert for critical jobs', async () => {
    // Create critical job
    const criticalJob = await createJob({
      priority: 'critical',
      status: 'overdue',
      scheduled_date: '2025-10-10T10:00:00Z'
    });
    
    // Trigger send-alerts function
    await fetch('/functions/v1/send-alerts', {
      method: 'POST'
    });
    
    // Wait for email processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verify email was sent (check logs or mock email service)
    const emailLogs = await fetchEmailLogs();
    const relevantLog = emailLogs.find(log => 
      log.subject.includes('Alerta') && log.content.includes(criticalJob.id)
    );
    
    expect(relevantLog).toBeDefined();
    expect(relevantLog.status).toBe('sent');
  });
});
```

### Framework de Testes

- **Vitest**: Framework principal de testes
- **@testing-library/react**: Testes de componentes React
- **Supabase CLI**: Testes locais de Edge Functions
- **Playwright**: Testes E2E completos

## 🚀 Deploy e Configuração

### Variáveis de Ambiente

```bash
# .env
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=re_...
```

### Deploy de Edge Functions

```bash
# Deploy all MMI functions
supabase functions deploy simulate-hours
supabase functions deploy send-alerts
supabase functions deploy mmi-copilot
supabase functions deploy mmi-postpone-analysis
supabase functions deploy mmi-create-os
```

### Cron Jobs

```yaml
# supabase/functions/_jobs/cron.yaml
- name: simulate-hours
  schedule: "0 * * * *"  # A cada hora
  function: simulate-hours

- name: send-alerts
  schedule: "0 8 * * *"  # Diariamente às 08:00
  function: send-alerts
```

## 📈 Métricas e Monitoramento

### KPIs do MMI

- **MTBF** (Mean Time Between Failures): Tempo médio entre falhas
- **MTTR** (Mean Time To Repair): Tempo médio de reparo
- **Taxa de Postergação**: % de manutenções postergadas vs programadas
- **Compliance Rate**: % de manutenções realizadas no prazo
- **Custo Médio por Job**: Valor médio gasto em manutenções
- **Disponibilidade de Componentes**: % de tempo operacional

### Dashboard de Monitoramento

```typescript
interface MMIDashboardMetrics {
  total_jobs: number;
  jobs_by_status: Record<string, number>;
  critical_jobs: number;
  overdue_jobs: number;
  avg_completion_time_hours: number;
  total_maintenance_cost: number;
  component_availability_rate: number;
  ai_analysis_accuracy: number;
}
```

## 🧠 Considerações Finais

### Status do Módulo

✅ **Estável e Operacional**
- Todas as APIs implementadas e testadas
- Edge Functions funcionando corretamente
- Integração com IA validada
- Testes automatizados cobrindo funcionalidades críticas

### Recomendações

1. **Deploy Controlado**: Implementar primeiro em ambiente de homologação
2. **Validação por Especialistas**: Engenheiros de bordo e técnicos embarcados devem validar as recomendações da IA
3. **Monitoramento Contínuo**: Acompanhar métricas e ajustar parâmetros conforme necessário
4. **Feedback Loop**: Coletar feedback dos usuários para melhorias contínuas

### Próximos Passos (Roadmap)

#### Fase 2 - Aprendizado Contínuo
- [ ] Implementar aprendizado baseado em jobs fechados
- [ ] Vetorização de histórico de falhas por embarcação
- [ ] Análise preditiva avançada com ML
- [ ] Recomendações personalizadas por tipo de embarcação

#### Fase 3 - Offline First
- [ ] Suporte a dados offline via PWA
- [ ] Sincronização automática quando online
- [ ] Cache inteligente de dados críticos
- [ ] Modo de operação em áreas sem conectividade

#### Fase 4 - Expansão
- [ ] Integração com sensores IoT embarcados
- [ ] Realidade aumentada para manutenção guiada
- [ ] Biblioteca de procedimentos de manutenção
- [ ] Treinamento e certificação de equipe

## 📞 Suporte e Documentação

- **Documentação Técnica**: `/docs/mmi/`
- **API Reference**: `/docs/api/mmi/`
- **Guias de Uso**: `/docs/guides/mmi/`
- **Suporte**: suporte@nautilusone.com

---

**Nautilus One — Manutenção Inteligente embarcada com IA real. 🌊**
