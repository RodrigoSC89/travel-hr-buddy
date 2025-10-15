# MMI - Módulo de Manutenção Inteligente
## Intelligent Maintenance Module - Technical Documentation

**Version:** 2.0.0  
**Last Updated:** 2025-10-15  
**System:** Nautilus One

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Documentation](#api-documentation)
5. [Edge Functions](#edge-functions)
6. [AI Integration](#ai-integration)
7. [Frontend Components](#frontend-components)
8. [Testing Strategy](#testing-strategy)
9. [Deployment](#deployment)
10. [KPIs and Monitoring](#kpis-and-monitoring)

---

## Overview

The MMI (Módulo de Manutenção Inteligente / Intelligent Maintenance Module) is a comprehensive maintenance management system designed for maritime operations, specifically integrated into the Nautilus One platform. It provides AI-powered maintenance scheduling, work order management, and predictive maintenance capabilities.

### Key Features

- **Intelligent Job Management**: AI-powered analysis for maintenance job scheduling and postponement
- **Work Order Automation**: Automated creation and tracking of maintenance work orders (OS - Ordem de Serviço)
- **Component Tracking**: Comprehensive tracking of ship components and systems
- **Hourometer Automation**: Automatic hourometer simulation and maintenance scheduling
- **Smart Alerts**: Email notification system for critical and high-priority maintenance
- **AI-Powered Analysis**: GPT-4o integration for maintenance decision support
- **Similarity Search**: Vector-based job similarity search using embeddings
- **Compliance Tracking**: Maritime standards compliance (NORMAM, SOLAS, MARPOL)

### Business Value

- **Reduced Downtime**: Proactive maintenance scheduling minimizes unexpected failures
- **Cost Optimization**: AI-powered postponement analysis balances safety with operational costs
- **Regulatory Compliance**: Automated tracking of maritime safety standards
- **Operational Efficiency**: Streamlined work order creation and management
- **Data-Driven Decisions**: Analytics and insights for maintenance planning

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         NAUTILUS ONE                             │
│                    (React + TypeScript)                          │
├─────────────────────────────────────────────────────────────────┤
│  Frontend Components                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ MMIDashboard │  │ MMIJobsPanel │  │   JobCards   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (REST)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  GET /jobs   │  │ POST /postpone│ │ POST /os     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               SUPABASE EDGE FUNCTIONS (Deno)                     │
│  ┌────────────────────┐  ┌──────────────────┐                  │
│  │ mmi-job-postpone   │  │ mmi-os-create    │                  │
│  │ (AI Analysis)      │  │ (Work Orders)    │                  │
│  └────────────────────┘  └──────────────────┘                  │
│  ┌────────────────────┐  ┌──────────────────┐                  │
│  │ mmi-jobs-similar   │  │ simulate-hours   │                  │
│  │ (Embeddings)       │  │ (Hourometer)     │                  │
│  └────────────────────┘  └──────────────────┘                  │
│  ┌────────────────────┐  ┌──────────────────┐                  │
│  │ send-alerts        │  │ assistant-query  │                  │
│  │ (Email)            │  │ (Global AI)      │                  │
│  └────────────────────┘  └──────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE POSTGRES                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ mmi_systems  │  │mmi_components│  │  mmi_jobs    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │ mmi_os       │  │hourometer_logs│                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL INTEGRATIONS                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │  OpenAI GPT-4o │  │  Resend API    │  │   Cron Jobs    │    │
│  │  (Analysis)    │  │  (Email)       │  │  (Scheduling)  │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18.3.1
- TypeScript 5.8.3
- Vite 5.4.19
- Tailwind CSS 3.4.17
- Shadcn/ui Components
- React Query (TanStack Query)

**Backend:**
- Supabase (PostgreSQL + Edge Functions)
- Deno Runtime (Edge Functions)
- PostgreSQL 15+ with pgvector extension

**AI/ML:**
- OpenAI GPT-4o (Analysis & Recommendations)
- OpenAI text-embedding-ada-002 (Similarity Search)

**External Services:**
- Resend API (Email Delivery)
- Supabase Cron Jobs (Scheduled Tasks)

---

## Database Schema

### 1. mmi_systems

Represents major ship systems (e.g., propulsion, electrical, hydraulic).

```sql
CREATE TABLE public.mmi_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  vessel_id UUID REFERENCES vessels(id),
  criticality TEXT CHECK (criticality IN ('critical', 'high', 'medium', 'low')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX idx_mmi_systems_vessel ON mmi_systems(vessel_id);
CREATE INDEX idx_mmi_systems_criticality ON mmi_systems(criticality);
```

**Fields:**
- `id`: Unique system identifier
- `name`: System name (e.g., "Main Engine", "Hydraulic System")
- `vessel_id`: Reference to vessel
- `criticality`: System importance level
- `metadata`: Flexible JSON field for additional attributes

### 2. mmi_components

Individual components within systems.

```sql
CREATE TABLE public.mmi_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id UUID REFERENCES mmi_systems(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  component_type TEXT,
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  installation_date DATE,
  operational_hours INTEGER DEFAULT 0,
  max_hours_before_maintenance INTEGER,
  status TEXT CHECK (status IN ('operational', 'maintenance', 'failed', 'retired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX idx_mmi_components_system ON mmi_components(system_id);
CREATE INDEX idx_mmi_components_status ON mmi_components(status);
```

**Fields:**
- `operational_hours`: Current accumulated operating hours
- `max_hours_before_maintenance`: Trigger threshold for maintenance
- `status`: Current component status

### 3. mmi_jobs

Maintenance jobs/tasks with AI embeddings for similarity search.

```sql
CREATE TABLE public.mmi_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID REFERENCES mmi_components(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  job_type TEXT CHECK (job_type IN ('preventive', 'corrective', 'predictive', 'inspection')),
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'postponed', 'cancelled')),
  due_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  assigned_to UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  can_postpone BOOLEAN DEFAULT false,
  suggestion_ia TEXT,
  embedding VECTOR(1536), -- OpenAI embeddings
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX idx_mmi_jobs_component ON mmi_jobs(component_id);
CREATE INDEX idx_mmi_jobs_status ON mmi_jobs(status);
CREATE INDEX idx_mmi_jobs_priority ON mmi_jobs(priority);
CREATE INDEX idx_mmi_jobs_due_date ON mmi_jobs(due_date);
CREATE INDEX idx_mmi_jobs_embedding ON mmi_jobs USING ivfflat (embedding vector_cosine_ops);
```

**Key Fields:**
- `embedding`: Vector for similarity search using cosine distance
- `can_postpone`: Whether job can be safely postponed
- `suggestion_ia`: AI-generated suggestions for the job

### 4. mmi_work_orders (mmi_os)

Work orders (Ordem de Serviço) for executing maintenance jobs.

```sql
CREATE TABLE public.mmi_os (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES mmi_jobs(id) ON DELETE CASCADE,
  os_number TEXT UNIQUE,
  opened_by UUID REFERENCES profiles(id),
  assigned_to UUID REFERENCES profiles(id),
  status TEXT CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  parts_used JSONB DEFAULT '[]'::JSONB,
  labor_hours DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mmi_os_job ON mmi_os(job_id);
CREATE INDEX idx_mmi_os_status ON mmi_os(status);
CREATE INDEX idx_mmi_os_number ON mmi_os(os_number);
```

**Features:**
- Auto-generated OS number (e.g., "OS-2025001")
- Parts tracking via JSONB array
- Labor hours tracking

### 5. mmi_hourometer_logs

Automatic logging of component operating hours.

```sql
CREATE TABLE public.mmi_hourometer_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID REFERENCES mmi_components(id) ON DELETE CASCADE,
  hours_recorded INTEGER NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  recorded_by TEXT DEFAULT 'system',
  source TEXT CHECK (source IN ('automatic', 'manual', 'sensor')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hourometer_component ON mmi_hourometer_logs(component_id);
CREATE INDEX idx_hourometer_recorded_at ON mmi_hourometer_logs(recorded_at DESC);
```

**Purpose:**
- Audit trail for hourometer readings
- Supports automatic, manual, and sensor-based logging
- Used by `simulate-hours` edge function

### Database Functions

#### match_mmi_jobs

Find similar jobs using vector similarity search.

```sql
CREATE OR REPLACE FUNCTION match_mmi_jobs(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.78,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  status TEXT,
  similarity FLOAT,
  metadata JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mmi_jobs.id,
    mmi_jobs.title,
    mmi_jobs.description,
    mmi_jobs.status,
    1 - (mmi_jobs.embedding <=> query_embedding) AS similarity,
    mmi_jobs.metadata,
    mmi_jobs.created_at
  FROM public.mmi_jobs
  WHERE mmi_jobs.embedding IS NOT NULL
    AND 1 - (mmi_jobs.embedding <=> query_embedding) > match_threshold
  ORDER BY mmi_jobs.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## API Documentation

### REST Endpoints

#### 1. GET /api/mmi/jobs

Fetch all maintenance jobs with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by job status
- `priority` (optional): Filter by priority
- `vessel_id` (optional): Filter by vessel
- `component_id` (optional): Filter by component

**Response:**
```json
{
  "jobs": [
    {
      "id": "uuid",
      "title": "Troca de filtro hidráulico",
      "description": "Manutenção preventiva do sistema hidráulico",
      "job_type": "preventive",
      "priority": "high",
      "status": "pending",
      "due_date": "2025-11-15T10:00:00Z",
      "component": {
        "id": "uuid",
        "name": "Bomba hidráulica principal",
        "system": {
          "name": "Sistema Hidráulico",
          "vessel": "MV Nautilus One"
        }
      },
      "can_postpone": true,
      "suggestion_ia": "Recomenda-se realizar até 15/11/2025",
      "created_at": "2025-10-01T08:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "pageSize": 10
}
```

#### 2. POST /api/mmi/jobs/:id/postpone

Request AI analysis for job postponement.

**Request Body:**
```json
{
  "reason": "Embarcação em viagem crítica",
  "requested_new_date": "2025-11-30T10:00:00Z",
  "context": "Missão de emergência para transporte de carga prioritária"
}
```

**Response:**
```json
{
  "recommendation": "conditional",
  "risk_level": "medium",
  "conditions": [
    "Monitorar diariamente o sistema hidráulico",
    "Limitar operação a 80% da capacidade",
    "Ter peças de reposição disponíveis a bordo"
  ],
  "impact_assessment": {
    "safety": "Risco moderado - sistema pode operar com monitoramento",
    "operational": "Possível redução de eficiência em 10-15%",
    "financial": "Custo pode aumentar 20% se falha ocorrer",
    "compliance": "Dentro dos limites NORMAM para postponamento de 30 dias"
  },
  "max_postponement_days": 30,
  "new_recommended_date": "2025-11-25T10:00:00Z",
  "confidence_score": 0.85,
  "timestamp": "2025-10-15T03:22:29Z"
}
```

**Risk Levels:**
- `low`: Safe to postpone
- `medium`: Conditional postponement
- `high`: Not recommended
- `critical`: Must not postpone

#### 3. POST /api/mmi/os/create

Create a work order for a maintenance job.

**Request Body:**
```json
{
  "jobId": "uuid",
  "assigned_to": "uuid",
  "priority": "high",
  "notes": "Urgente - falha detectada no sistema"
}
```

**Response:**
```json
{
  "message": "OS criada com sucesso",
  "os_id": "uuid",
  "os_number": "OS-2025001",
  "job_id": "uuid",
  "status": "open",
  "assigned_to": "uuid",
  "opened_at": "2025-10-15T03:22:29Z"
}
```

#### 4. GET /api/mmi/jobs/similar

Find similar jobs using AI embeddings.

**Query Parameters:**
- `query`: Search text
- `threshold` (optional): Similarity threshold (0-1, default: 0.78)
- `limit` (optional): Number of results (default: 5)

**Response:**
```json
{
  "similar_jobs": [
    {
      "id": "uuid",
      "title": "Troca de filtro hidráulico",
      "description": "Manutenção do sistema hidráulico principal",
      "similarity": 0.92,
      "status": "completed",
      "created_at": "2025-09-15T08:00:00Z"
    }
  ],
  "query_embedding_dimensions": 1536,
  "search_time_ms": 145
}
```

---

## Edge Functions

### 1. mmi-job-postpone

**Location:** `supabase/functions/mmi-job-postpone/index.ts`

**Purpose:** Analyze whether a maintenance job can be safely postponed using AI.

**Features:**
- OpenAI GPT-4o integration
- Retry logic with exponential backoff
- Request timeout handling
- Mock data fallback for development

**Configuration:**
- `MAX_RETRIES`: 3
- `INITIAL_RETRY_DELAY`: 1000ms
- `REQUEST_TIMEOUT`: 30000ms

**Environment Variables:**
- `OPENAI_API_KEY`: OpenAI API key
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key

### 2. mmi-os-create

**Location:** `supabase/functions/mmi-os-create/index.ts`

**Purpose:** Create work orders for maintenance jobs.

**Features:**
- Automatic OS number generation
- Job validation
- Status tracking
- Assignment management

**Flow:**
1. Validate job exists
2. Generate unique OS number
3. Insert work order record
4. Return OS details

### 3. mmi-jobs-similar

**Location:** `supabase/functions/mmi-jobs-similar/index.ts`

**Purpose:** Find similar maintenance jobs using vector embeddings.

**Features:**
- OpenAI embeddings generation
- Vector similarity search
- Configurable similarity threshold
- Pagination support

**Algorithm:**
1. Convert query text to embedding vector
2. Use cosine similarity to find matches
3. Filter by threshold
4. Return top N results

### 4. simulate-hours (New)

**Location:** `supabase/functions/simulate-hours/index.ts`

**Purpose:** Automatically simulate hourometer increments for operational components.

**Schedule:** Runs hourly via Supabase Cron

**Features:**
- Batch processing of components
- Automatic maintenance detection
- Audit log creation
- Email alert triggering

**Logic:**
```typescript
for each operational_component:
  increment operational_hours by random(1, 5)
  log to hourometer_logs
  if operational_hours >= max_hours_before_maintenance:
    create maintenance_job
    trigger alert
```

### 5. send-alerts (New)

**Location:** `supabase/functions/send-alerts/index.ts`

**Purpose:** Send email alerts for critical and high-priority maintenance jobs.

**Schedule:** Daily at 08:00 via Supabase Cron

**Features:**
- Query critical/high priority jobs
- Group by vessel
- Generate HTML email templates
- Send via Resend API

**Email Template:**
- Gradient header with company branding
- Job priority color coding
- Job details table
- Call-to-action button
- Professional maritime theme

### 6. assistant-query (Enhanced)

**Location:** `supabase/functions/assistant-query/index.ts`

**Purpose:** Global Nautilus One AI assistant with MMI module integration.

**New MMI Commands:**
```
• "criar job de manutenção" - Create maintenance job
• "jobs críticos" - List critical jobs
• "postergar manutenção" - Postpone maintenance
• "horas do motor" - Check engine hours
• "criar OS" - Create work order
• "manutenções pendentes" - List pending maintenance
• "histórico de falhas" - Component failure history
```

**MMI Module Context:**
```typescript
{
  module: "#13: MMI - Manutenção Inteligente",
  capabilities: [
    "Gestão de jobs de manutenção",
    "Análise de postergação com IA",
    "Criação de OS automatizada",
    "Consulta de horímetros",
    "Histórico de falhas",
    "Conformidade com normas marítimas"
  ],
  compliance_standards: ["NORMAM", "SOLAS", "MARPOL"]
}
```

---

## AI Integration

### OpenAI GPT-4o

**Model:** `gpt-4o`  
**Use Cases:**
- Postponement risk analysis
- Maintenance recommendations
- Failure prediction
- Compliance checking

**Prompt Engineering:**

```typescript
const systemPrompt = `
Você é um engenheiro marítimo especialista em manutenção de embarcações.
Analise solicitações de postergação de manutenção considerando:
1. Segurança da tripulação e embarcação
2. Impacto operacional
3. Conformidade com NORMAM, SOLAS, MARPOL
4. Histórico de falhas do componente
5. Custo-benefício da postergação

Forneça recomendações claras e justificadas.
`;
```

**Temperature:** 0.2 (low for consistency)

### OpenAI Embeddings

**Model:** `text-embedding-ada-002`  
**Dimensions:** 1536  
**Use Cases:**
- Job similarity search
- Duplicate detection
- Historical pattern matching

**Implementation:**
```typescript
const embedding = await openai.embeddings.create({
  model: "text-embedding-ada-002",
  input: jobDescription
});

const vector = embedding.data[0].embedding;
```

---

## Frontend Components

### 1. MMIDashboard

**Location:** `src/pages/MMIDashboard.tsx`

**Purpose:** Main dashboard for MMI module with BI metrics.

**Features:**
- Failure statistics by system
- Jobs distribution by vessel
- Postponement status charts
- Quick action buttons

**Charts:**
- Bar chart: Failures by system
- Pie chart: Jobs by vessel
- Line chart: Postponement trends

### 2. MMIJobsPanel

**Location:** `src/pages/MMIJobsPanel.tsx`

**Purpose:** Central panel for viewing and managing maintenance jobs.

**Features:**
- Job listing with filters
- Quick stats (total, pending, critical)
- Responsive grid layout
- Job cards component integration

### 3. JobCards

**Location:** `src/components/mmi/JobCards.tsx`

**Purpose:** Display individual job cards with actions.

**Features:**
- Priority and status badges
- AI suggestion display
- Postponement eligibility indicator
- Action buttons (Create OS, Postpone)
- Loading states
- Toast notifications

**Visual Design:**
- Yellow left border accent
- Professional maritime theme
- Hover effects
- Responsive layout

---

## Testing Strategy

### Test Suite Structure

```
src/tests/
├── mmi/
│   ├── unit/
│   │   ├── create-job.test.ts (18 tests)
│   │   ├── postpone-analysis.test.ts (18 tests)
│   │   └── create-os.test.ts (28 tests)
│   ├── integration/
│   │   └── hourometer-edge-function.test.ts (24 tests)
│   └── e2e/
│       ├── copilot-chat.test.ts (26 tests)
│       └── critical-job-alert.test.ts (34 tests)
```

### Unit Tests (64 tests)

**create-job.test.ts:**
- Job creation validation
- Required field checks
- Enum validation (job_type, priority, status)
- Date handling
- Component relationship validation
- Error handling

**postpone-analysis.test.ts:**
- AI response format validation
- Risk level calculation
- Impact assessment structure
- Confidence score validation
- Different postponement scenarios
- Edge cases (null values, invalid dates)

**create-os.test.ts:**
- OS number generation
- Job-OS relationship
- Status transitions
- Assignment validation
- Parts tracking
- Labor hours calculation
- Duplicate prevention

### Integration Tests (24 tests)

**hourometer-edge-function.test.ts:**
- Component hour incrementation
- Log creation
- Maintenance threshold detection
- Alert triggering
- Batch processing
- Error handling
- Cron job execution

### E2E Tests (60 tests)

**copilot-chat.test.ts:**
- Natural language command recognition
- Context awareness
- MMI command execution
- Response formatting
- Error handling
- Confidence scoring

**critical-job-alert.test.ts:**
- Email generation
- HTML template rendering
- Job grouping by vessel
- Priority-based formatting
- Resend API integration
- Delivery confirmation
- Retry logic

### Test Execution

```bash
# Run all tests
npm test

# Run MMI tests only
npm test -- --grep "mmi"

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Coverage Goals

- **Unit Tests:** 90%+ coverage
- **Integration Tests:** 80%+ coverage
- **E2E Tests:** Critical paths 100% coverage

---

## Deployment

### Prerequisites

1. **Environment Variables:**
```env
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

2. **Database Setup:**
```bash
# Run migrations
supabase db push

# Verify tables
supabase db inspect
```

3. **Edge Functions:**
```bash
# Deploy all functions
supabase functions deploy mmi-job-postpone
supabase functions deploy mmi-os-create
supabase functions deploy mmi-jobs-similar
supabase functions deploy simulate-hours
supabase functions deploy send-alerts
supabase functions deploy assistant-query
```

### Cron Job Configuration

Add to Supabase Dashboard → Database → Cron Jobs:

```sql
-- Hourometer simulation (every hour)
SELECT cron.schedule(
  'simulate-hourometer',
  '0 * * * *',
  $$
    SELECT net.http_post(
      url:='https://YOUR_PROJECT.supabase.co/functions/v1/simulate-hours',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb
    ) as request_id;
  $$
);

-- Daily maintenance alerts (every day at 08:00)
SELECT cron.schedule(
  'send-maintenance-alerts',
  '0 8 * * *',
  $$
    SELECT net.http_post(
      url:='https://YOUR_PROJECT.supabase.co/functions/v1/send-alerts',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb
    ) as request_id;
  $$
);
```

### Frontend Deployment

```bash
# Build production bundle
npm run build

# Deploy to Vercel
npm run deploy:vercel

# Or deploy to Netlify
npm run deploy:netlify
```

---

## KPIs and Monitoring

### Key Performance Indicators

1. **MTBF (Mean Time Between Failures)**
```sql
SELECT 
  component_id,
  AVG(EXTRACT(EPOCH FROM (next_failure - failure_date)) / 3600) as mtbf_hours
FROM (
  SELECT 
    component_id,
    completed_date as failure_date,
    LEAD(completed_date) OVER (PARTITION BY component_id ORDER BY completed_date) as next_failure
  FROM mmi_jobs
  WHERE job_type = 'corrective'
) failures
GROUP BY component_id;
```

2. **MTTR (Mean Time To Repair)**
```sql
SELECT 
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) / 3600) as mttr_hours
FROM mmi_os
WHERE status = 'completed';
```

3. **Compliance Rate**
```sql
SELECT 
  COUNT(CASE WHEN completed_date <= due_date THEN 1 END) * 100.0 / COUNT(*) as compliance_percentage
FROM mmi_jobs
WHERE status = 'completed';
```

4. **Postponement Success Rate**
```sql
SELECT 
  COUNT(CASE WHEN status = 'completed' AND completed_date > original_due_date THEN 1 END) * 100.0 / 
  COUNT(*) as postponement_success_rate
FROM mmi_jobs
WHERE can_postpone = true;
```

### Monitoring Dashboards

**Metrics to Track:**
- Active jobs by priority
- Overdue maintenance tasks
- Component operational hours
- Work order completion rate
- AI recommendation accuracy
- Email alert delivery rate
- Edge function execution time
- API response times

### Alerts Configuration

**Critical Alerts:**
- Critical priority job overdue > 24 hours
- Component operational hours > 110% of threshold
- Edge function failure rate > 5%
- Database query time > 5 seconds

**Warning Alerts:**
- High priority job overdue > 48 hours
- Work order completion rate < 80%
- AI confidence score < 0.7
- Email bounce rate > 2%

---

## Compliance and Standards

### Maritime Regulations

**NORMAM (Normas da Autoridade Marítima):**
- NORMAM-05: Safety equipment maintenance schedules
- NORMAM-12: Crew safety and training
- NORMAM-15: Environmental protection

**SOLAS (Safety of Life at Sea):**
- Chapter II-1: Construction, subdivision, stability
- Chapter II-2: Fire protection, detection, extinction
- Chapter III: Life-saving appliances

**MARPOL (Marine Pollution):**
- Annex I: Oil pollution prevention
- Annex IV: Sewage pollution prevention
- Annex VI: Air pollution prevention

### Data Privacy

- **LGPD Compliance:** Personal data handling
- **Data Retention:** 7 years for maintenance records
- **Access Control:** Role-based permissions
- **Audit Logging:** All modifications tracked

---

## Troubleshooting

### Common Issues

**1. Edge Function Timeout**
```typescript
// Increase timeout in function
const REQUEST_TIMEOUT = 60000; // 60 seconds
```

**2. OpenAI Rate Limit**
```typescript
// Implement exponential backoff
const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
await new Promise(resolve => setTimeout(resolve, delay));
```

**3. Vector Index Not Used**
```sql
-- Recreate index with proper parameters
DROP INDEX idx_mmi_jobs_embedding;
CREATE INDEX idx_mmi_jobs_embedding ON mmi_jobs 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

**4. Cron Job Not Running**
- Check pg_cron extension is enabled
- Verify cron schedule syntax
- Check service role key permissions

---

## Future Enhancements

### Planned Features

1. **Mobile App (Capacitor):**
   - Offline job management
   - Push notifications
   - QR code scanning for components

2. **IoT Integration:**
   - Real-time sensor data
   - Automatic hourometer from ship systems
   - Vibration analysis

3. **Advanced Analytics:**
   - Predictive maintenance ML models
   - Cost optimization algorithms
   - Failure pattern recognition

4. **Collaboration Features:**
   - Team assignments
   - Comment threads on jobs
   - Document attachments

5. **API Expansion:**
   - GraphQL API
   - WebSocket real-time updates
   - Third-party integrations

---

## Support and Contact

**Project Repository:** https://github.com/RodrigoSC89/travel-hr-buddy  
**Documentation:** See individual README files in each module  
**Issues:** GitHub Issues tracker  

**Contributors:**
- Nautilus One Development Team
- AI Integration: OpenAI GPT-4o
- Infrastructure: Supabase

**Last Updated:** 2025-10-15  
**Version:** 2.0.0

---

## License

Proprietary - Nautilus One System  
© 2025 All Rights Reserved
