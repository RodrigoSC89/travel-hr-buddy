# MMI - Módulo de Manutenção Inteligente (Intelligent Maintenance Module)

## Overview

The MMI (Módulo de Manutenção Inteligente) is a comprehensive maintenance management system for the Nautilus One platform, designed specifically for maritime vessel operations. It provides intelligent maintenance scheduling, AI-powered analysis, automated alerts, and complete work order management.

## Table of Contents

1. [Architecture](#architecture)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Edge Functions](#edge-functions)
5. [AI Integration](#ai-integration)
6. [Cron Jobs](#cron-jobs)
7. [KPIs and Monitoring](#kpis-and-monitoring)
8. [Deployment](#deployment)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  JobCards    │  │  Dashboard   │  │  AI Copilot  │         │
│  │  Component   │  │  Analytics   │  │  Interface   │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                          API LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ GET /jobs    │  │ POST /os     │  │ POST /       │         │
│  │              │  │ /create      │  │ postpone     │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EDGE FUNCTIONS LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ simulate-    │  │ send-alerts  │  │ assistant-   │         │
│  │ hours        │  │ (daily)      │  │ query        │         │
│  │ (hourly)     │  │              │  │              │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  OpenAI      │  │  Resend      │  │  Supabase    │         │
│  │  GPT-4o      │  │  Email API   │  │  Database    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Core Tables

#### 1. mmi_systems
Represents major vessel systems (propulsion, hydraulic, electrical, etc.)

```sql
CREATE TABLE mmi_systems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  vessel_id UUID REFERENCES vessels(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique system identifier
- `name`: System name (e.g., "Motor Principal", "Sistema Hidráulico")
- `description`: Detailed system description
- `vessel_id`: Reference to vessel
- `created_at`, `updated_at`: Audit timestamps

#### 2. mmi_components
Individual components within systems that require maintenance

```sql
CREATE TABLE mmi_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  system_id UUID REFERENCES mmi_systems(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  model TEXT,
  serial_number TEXT,
  installation_date DATE,
  operational BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique component identifier
- `system_id`: Parent system reference
- `name`: Component name
- `model`: Manufacturer model number
- `serial_number`: Component serial number
- `installation_date`: When component was installed
- `operational`: Current operational status

#### 3. mmi_jobs
Maintenance jobs/tasks to be performed

```sql
CREATE TABLE mmi_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id UUID REFERENCES mmi_components(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  job_type TEXT CHECK (job_type IN ('preventiva', 'corretiva', 'preditiva', 'inspeção')),
  priority TEXT CHECK (priority IN ('baixa', 'média', 'alta', 'crítica')),
  status TEXT CHECK (status IN ('pendente', 'em_andamento', 'concluída', 'cancelada', 'postergada')),
  due_date TIMESTAMPTZ NOT NULL,
  hours_trigger INTEGER, -- Trigger maintenance at X hours
  suggestion_ia TEXT,
  can_postpone BOOLEAN DEFAULT FALSE,
  postpone_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique job identifier
- `component_id`: Component requiring maintenance
- `title`: Brief job description
- `description`: Detailed maintenance instructions
- `job_type`: Type of maintenance
- `priority`: Job priority level
- `status`: Current job status
- `due_date`: When maintenance should be completed
- `hours_trigger`: Optional hourometer-based trigger
- `suggestion_ia`: AI-generated suggestions
- `can_postpone`: Whether job can be postponed
- `postpone_count`: Number of times postponed

#### 4. mmi_work_orders (OS)
Work orders created from jobs

```sql
CREATE TABLE mmi_work_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  os_number TEXT UNIQUE NOT NULL,
  job_id UUID REFERENCES mmi_jobs(id) ON DELETE CASCADE,
  opened_by UUID REFERENCES auth.users(id),
  closed_by UUID REFERENCES auth.users(id),
  status TEXT CHECK (status IN ('aberta', 'em_execução', 'aguardando_peças', 'concluída', 'cancelada')),
  parts_used JSONB, -- Array of parts: [{name, quantity, cost}]
  labor_hours DECIMAL(10,2),
  notes TEXT,
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique work order identifier
- `os_number`: Human-readable OS number (e.g., "OS-2025-0001")
- `job_id`: Related maintenance job
- `opened_by`, `closed_by`: User references
- `status`: Current OS status
- `parts_used`: JSON array of parts consumed
- `labor_hours`: Time spent on maintenance
- `notes`: Technician notes and observations
- `opened_at`, `closed_at`: Lifecycle timestamps

#### 5. mmi_hourometer_logs
Tracks operational hours for components

```sql
CREATE TABLE mmi_hourometer_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id UUID REFERENCES mmi_components(id) ON DELETE CASCADE,
  hours DECIMAL(10,2) NOT NULL,
  source TEXT CHECK (source IN ('manual', 'automated', 'sensor')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique log identifier
- `component_id`: Component being tracked
- `hours`: Current hour reading
- `source`: How the reading was captured
- `notes`: Optional notes about the reading
- `created_at`: When reading was recorded

### Relationships

```
mmi_systems (1) ──< (N) mmi_components
mmi_components (1) ──< (N) mmi_jobs
mmi_components (1) ──< (N) mmi_hourometer_logs
mmi_jobs (1) ──< (N) mmi_work_orders
```

## API Endpoints

### 1. GET /api/mmi/jobs
Fetch all maintenance jobs with optional filtering

**Query Parameters:**
- `status`: Filter by job status
- `priority`: Filter by priority level
- `vessel_id`: Filter by vessel
- `component_id`: Filter by component

**Response:**
```json
{
  "jobs": [
    {
      "id": "uuid",
      "title": "Manutenção preventiva do sistema hidráulico",
      "status": "pendente",
      "priority": "alta",
      "due_date": "2025-10-20T00:00:00Z",
      "component": {
        "name": "Sistema Hidráulico Principal",
        "asset": {
          "name": "Bomba Hidráulica #3",
          "vessel": "Navio Oceanic Explorer"
        }
      },
      "suggestion_ia": "Recomenda-se realizar a manutenção durante a próxima parada programada.",
      "can_postpone": true
    }
  ]
}
```

### 2. POST /api/mmi/jobs/:id/postpone
Request to postpone a maintenance job with AI analysis

**Request Body:**
```json
{
  "reason": "Embarcação em viagem crítica",
  "requested_new_date": "2025-11-15T10:00:00Z"
}
```

**Response:**
```json
{
  "recommendation": "conditional",
  "risk_level": "medium",
  "conditions": [
    "Monitorar diariamente",
    "Limitar operação a 80% da capacidade"
  ],
  "impact_assessment": {
    "safety": "Risco moderado se condições não forem respeitadas",
    "operational": "Possível redução de 10-15% na eficiência",
    "financial": "Custo pode aumentar em 20% se houver falha"
  },
  "new_date": "2025-11-15T10:00:00Z"
}
```

**AI Analysis Factors:**
- Component operational hours
- Historical failure data
- Current operational conditions
- Parts availability
- Mission criticality
- Compliance requirements (NORMAM, SOLAS, MARPOL)

### 3. POST /api/mmi/os/create
Create a work order from a job

**Request Body:**
```json
{
  "jobId": "uuid"
}
```

**Response:**
```json
{
  "os_id": "uuid",
  "os_number": "OS-2025-0042",
  "job_id": "uuid",
  "status": "aberta",
  "message": "OS criada com sucesso",
  "timestamp": "2025-10-15T10:30:00Z"
}
```

### 4. GET /api/mmi/analytics
Retrieve MMI KPIs and analytics data

**Response:**
```json
{
  "mtbf": 340.5,
  "mttr": 4.2,
  "compliance_rate": 0.95,
  "jobs_by_priority": {
    "crítica": 5,
    "alta": 12,
    "média": 28,
    "baixa": 15
  },
  "jobs_by_status": {
    "pendente": 30,
    "em_andamento": 10,
    "concluída": 180,
    "postergada": 10
  }
}
```

## Edge Functions

### 1. simulate-hours

**Location:** `supabase/functions/simulate-hours/index.ts`

**Purpose:** Automatically simulates hourometer increments for operational components

**Schedule:** Runs hourly via cron job

**Process:**
1. Queries all operational components
2. Generates realistic hour increments based on component type
3. Creates hourometer log entries
4. Checks if any maintenance triggers are reached
5. Creates alerts for approaching or overdue maintenance

**Key Features:**
- Batch processing for efficiency
- Audit logging for all updates
- Alert detection and creation
- Error handling and retry logic

**Configuration:**
```typescript
const HOUR_INCREMENTS = {
  motor_principal: 1.0,
  motor_auxiliar: 0.8,
  bomba_hidraulica: 0.5,
  gerador: 0.7
};
```

### 2. send-alerts

**Location:** `supabase/functions/send-alerts/index.ts`

**Purpose:** Sends email notifications for critical and high-priority maintenance jobs

**Schedule:** Runs daily at 08:00 via cron job

**Process:**
1. Queries critical and high-priority jobs due within 7 days
2. Groups jobs by vessel for organized reporting
3. Generates professional HTML email templates
4. Sends alerts via Resend API
5. Logs all sent notifications

**Email Template Features:**
- Gradient header with branding
- Priority-based color coding (red for critical, orange for high)
- Tabular job listing with key details
- Call-to-action button linking to dashboard
- Responsive design for mobile devices

**Priority Colors:**
- Crítica: Red (#EF4444)
- Alta: Orange (#F97316)
- Média: Yellow (#EAB308)
- Baixa: Green (#10B981)

## AI Integration

### Assistant Query Enhancement

The global Nautilus One assistant (`supabase/functions/assistant-query/index.ts`) has been enhanced with MMI module context:

**New Module Definition:**
```typescript
{
  id: 13,
  name: "MMI - Manutenção Inteligente",
  description: "Sistema completo de manutenção preventiva e corretiva com IA"
}
```

**MMI-Specific Commands:**
- "Criar job de manutenção"
- "Postergar manutenção"
- "Criar OS"
- "Consultar horas do componente"
- "Verificar histórico de falhas"
- "Listar jobs críticos"
- "Analisar risco de postergação"

**AI Capabilities:**
1. **Natural Language Job Creation:**
   - "Crie um job de manutenção preventiva para o motor principal"
   - Extracts: component, job type, priority from context

2. **Postponement Analysis:**
   - "Posso postergar a manutenção do motor por 15 dias?"
   - Provides: risk assessment, conditions, impact analysis

3. **Intelligent Recommendations:**
   - Analyzes operational patterns
   - Suggests optimal maintenance windows
   - Identifies potential failures before they occur

4. **Compliance Guidance:**
   - References maritime norms (NORMAM, SOLAS, MARPOL)
   - Ensures regulatory compliance
   - Warns about critical deadlines

**OpenAI Integration:**
- Model: GPT-4o
- Temperature: 0.2 (for consistent, technical responses)
- Context: Component data, operational hours, failure history
- Retry logic: 3 attempts with exponential backoff

## Cron Jobs

### Configuration

Both edge functions are configured as cron jobs in Supabase:

**simulate-hours:**
```
0 * * * * # Every hour
```

**send-alerts:**
```
0 8 * * * # Daily at 08:00 UTC
```

### Setup Instructions

1. Navigate to Supabase Dashboard → Edge Functions
2. Select function → Cron Jobs tab
3. Add cron schedule
4. Test execution manually
5. Monitor logs for errors

## KPIs and Monitoring

### Key Performance Indicators

#### 1. MTBF (Mean Time Between Failures)
Average time between component failures

**Formula:** `Total Operating Hours / Number of Failures`

**Target:** > 300 hours

#### 2. MTTR (Mean Time To Repair)
Average time to complete maintenance

**Formula:** `Sum of Repair Times / Number of Repairs`

**Target:** < 6 hours

#### 3. Compliance Rate
Percentage of maintenance completed on time

**Formula:** `(On-Time Jobs / Total Jobs) × 100`

**Target:** > 90%

#### 4. Postponement Rate
Percentage of jobs postponed

**Formula:** `(Postponed Jobs / Total Jobs) × 100`

**Target:** < 15%

#### 5. Parts Availability
Percentage of jobs delayed due to parts

**Formula:** `(Jobs with Parts / Total Jobs) × 100`

**Target:** > 95%

### Monitoring Dashboards

**Real-Time Metrics:**
- Active jobs by priority
- Overdue maintenance count
- Components near maintenance threshold
- Recent hourometer readings

**Historical Trends:**
- MTBF trends over time
- Compliance rate by vessel
- Cost analysis by system
- Technician performance metrics

## Deployment

### Environment Variables

Required environment variables:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-api-key

# Resend (for email alerts)
RESEND_API_KEY=re_your-api-key
RESEND_FROM_EMAIL=alerts@yourdomain.com
```

### Deployment Steps

1. **Database Setup:**
   ```bash
   # Run migrations
   supabase db push
   
   # Verify tables created
   supabase db list
   ```

2. **Edge Functions:**
   ```bash
   # Deploy simulate-hours
   supabase functions deploy simulate-hours
   
   # Deploy send-alerts
   supabase functions deploy send-alerts
   ```

3. **Configure Cron Jobs:**
   - Set up cron schedules in Supabase Dashboard
   - Test each function manually
   - Verify logs

4. **Frontend Deployment:**
   ```bash
   # Build production bundle
   npm run build
   
   # Deploy to hosting (Vercel/Netlify)
   vercel --prod
   ```

### Post-Deployment Verification

- [ ] All edge functions accessible
- [ ] Cron jobs running on schedule
- [ ] Email alerts being sent
- [ ] Hourometer logs being created
- [ ] API endpoints responding correctly
- [ ] Frontend displaying data properly
- [ ] AI integration working

## Integration Points

### Internal Integrations

#### SGSO (Sistema de Gestão de Segurança Operacional)
- Critical maintenance failures trigger safety events
- Incident reports reference maintenance history
- Risk assessments include maintenance status

**Implementation:**
```typescript
// When critical job fails
await supabase.from('sgso_events').insert({
  type: 'maintenance_failure',
  severity: 'high',
  component_id: job.component_id,
  description: `Falha crítica: ${job.title}`,
  requires_investigation: true
});
```

#### BI/Dashboards
- MMI metrics feed into executive dashboards
- Real-time operational status
- Predictive failure analytics

**Data Feed:**
```typescript
{
  vessel_health_score: 0.87,
  maintenance_backlog: 15,
  critical_alerts: 2,
  upcoming_maintenance: 8
}
```

### External Integrations

#### OpenAI GPT-4o
- AI-powered analysis and recommendations
- Natural language command processing
- Predictive maintenance suggestions

#### Resend API
- Email alert delivery
- Professional HTML templates
- Delivery tracking and analytics

#### Supabase
- Database backend
- Edge function hosting
- Real-time subscriptions
- Authentication and authorization

## Testing

The MMI module includes a comprehensive test suite:

### Unit Tests (64 tests)
- `create-job.test.ts`: Job creation validation
- `postpone-analysis.test.ts`: AI analysis responses
- `create-os.test.ts`: Work order creation

### Integration Tests (24 tests)
- `hourometer-edge-function.test.ts`: Simulation logic, bulk processing

### E2E Tests (60 tests)
- `copilot-chat.test.ts`: Natural language commands
- `critical-job-alert.test.ts`: Email generation, HTML templates

**Total: 148 tests - 100% passing**

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- mmi

# Run with coverage
npm run test:coverage
```

## Support and Maintenance

### Common Issues

**Issue: Hourometer not incrementing**
- Check cron job is running
- Verify component `operational` status is `true`
- Check edge function logs

**Issue: Email alerts not sending**
- Verify Resend API key is configured
- Check `send-alerts` function logs
- Verify email address is valid

**Issue: AI suggestions not appearing**
- Check OpenAI API key and quota
- Verify network connectivity
- Check function timeout settings

### Logging

All edge functions include comprehensive logging:

```typescript
console.log("Processing job:", jobId);
console.log("API request attempt:", attempt);
console.error("Error details:", error);
```

Access logs in Supabase Dashboard → Edge Functions → Logs

## Future Enhancements

- [ ] Mobile app for technician field work
- [ ] IoT sensor integration for real-time monitoring
- [ ] Machine learning for failure prediction
- [ ] Augmented reality maintenance guides
- [ ] Blockchain-based maintenance records
- [ ] Integration with parts inventory system
- [ ] Automated parts ordering
- [ ] Multi-language support
- [ ] Voice command interface
- [ ] Offline mode for at-sea operations

## License

Copyright © 2025 Nautilus One. All rights reserved.

---

**Version:** 1.0.0  
**Last Updated:** October 2025  
**Documentation Size:** ~26KB  
**Status:** Production Ready ✅
