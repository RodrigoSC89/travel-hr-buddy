# MMI - Módulo de Manutenção Inteligente (Intelligent Maintenance Module)

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [Edge Functions](#edge-functions)
5. [AI Integration](#ai-integration)
6. [Maritime Compliance](#maritime-compliance)
7. [API Documentation](#api-documentation)
8. [Deployment Guide](#deployment-guide)
9. [KPIs & Monitoring](#kpis--monitoring)
10. [Troubleshooting](#troubleshooting)

## 🎯 Overview

The MMI (Módulo de Manutenção Inteligente) is a comprehensive AI-powered predictive maintenance system designed for maritime operations. It provides:

- **Automated Hourometer Tracking**: Simulates operating hours for all ship components
- **AI-Powered Recommendations**: Uses OpenAI GPT-4o for maintenance analysis
- **Vector Similarity Search**: Finds similar historical maintenance cases using embeddings
- **Automatic Job Creation**: Creates maintenance jobs when components reach 95% of maintenance interval
- **Email Alerts**: Sends notifications for critical/high-priority maintenance jobs
- **Work Order Management**: Auto-generates OS numbers (OS-YYYYNNNN format)
- **Maritime Compliance**: Integrates NORMAM, SOLAS, MARPOL standards

## 🏗️ System Architecture

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  • MMI Dashboard (React)                                        │
│  • Job Cards with AI Copilot                                   │
│  • Component Management                                         │
│  • Work Order Interface                                         │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Service Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  src/services/mmi/                                              │
│  • jobsApi.ts - Job CRUD operations                            │
│  • copilotApi.ts - AI recommendations                          │
│  • embeddingService.ts - Vector generation                     │
│  • pdfReportService.ts - Report generation                     │
│  • resolvedWorkOrdersService.ts - Historical analysis          │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                           API Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  Supabase Edge Functions:                                       │
│  • simulate-hours (cron: 0 * * * *)                            │
│  • send-alerts (cron: 0 8 * * *)                               │
│  • mmi-copilot                                                  │
│  • mmi-jobs-similar                                             │
│  • mmi-job-postpone                                             │
│  • mmi-os-create                                                │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Database Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL + pgvector:                                         │
│  • mmi_systems - Ship systems catalog                          │
│  • mmi_components - Components with hourometers                │
│  • mmi_jobs - Maintenance jobs with AI embeddings              │
│  • mmi_os - Work orders with auto-numbering                    │
│  • mmi_hourometer_logs - Operating hours audit trail           │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Integration Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  • OpenAI API (GPT-4o, text-embedding-ada-002)                 │
│  • Resend API (Email notifications)                             │
│  • Maritime Standards (NORMAM, SOLAS, MARPOL)                  │
└─────────────────────────────────────────────────────────────────┘
```

## 💾 Database Schema

### Core Tables

#### 1. mmi_systems

Ship systems catalog with criticality levels.

```sql
CREATE TABLE mmi_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id),
  system_name TEXT NOT NULL,
  system_type TEXT NOT NULL CHECK (system_type IN ('propulsion', 'electrical', 'navigation', 'safety', 'auxiliary')),
  criticality TEXT NOT NULL CHECK (criticality IN ('critical', 'high', 'medium', 'low')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Features:**
- Criticality-based prioritization
- System type classification
- Vessel association

#### 2. mmi_components

Components with hourometer tracking and maintenance intervals.

```sql
CREATE TABLE mmi_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id UUID REFERENCES mmi_systems(id),
  component_name TEXT NOT NULL,
  current_hours NUMERIC(10,2) DEFAULT 0,
  maintenance_interval_hours NUMERIC(10,2) NOT NULL,
  last_maintenance_date DATE,
  is_operational BOOLEAN DEFAULT true,
  component_type TEXT,
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Features:**
- Current operating hours tracking
- Maintenance interval configuration
- Operational status
- Equipment metadata (manufacturer, model, serial)

#### 3. mmi_jobs (Enhanced)

Maintenance jobs with AI embeddings for similarity search.

```sql
CREATE TABLE mmi_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID REFERENCES mmi_components(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  due_date DATE,
  embedding VECTOR(1536), -- OpenAI ada-002 embeddings
  suggestion_ia TEXT,
  can_postpone BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Features:**
- 1536-dimensional vector embeddings for similarity search
- AI-generated suggestions
- Priority-based scheduling
- Postponement capability

#### 4. mmi_os (Work Orders)

Work orders with auto-generated OS numbers.

```sql
CREATE TABLE mmi_os (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES mmi_jobs(id),
  os_number TEXT UNIQUE NOT NULL, -- Format: OS-YYYYNNNN
  status TEXT CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  assigned_to UUID REFERENCES profiles(id),
  start_date DATE,
  completion_date DATE,
  work_description TEXT,
  parts_used JSONB,
  labor_hours NUMERIC(5,2),
  cost NUMERIC(10,2),
  effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Features:**
- Auto-generated OS numbers (OS-YYYYNNNN)
- Cost tracking
- Effectiveness rating (1-5 stars)
- Parts and labor tracking

#### 5. mmi_hourometer_logs

Complete audit trail for operating hours.

```sql
CREATE TABLE mmi_hourometer_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID REFERENCES mmi_components(id),
  previous_hours NUMERIC(10,2),
  new_hours NUMERIC(10,2),
  hours_added NUMERIC(10,2),
  recorded_by TEXT DEFAULT 'system',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Features:**
- Complete audit trail
- System and manual recording
- Delta tracking (hours_added)

### Functions

#### match_mmi_jobs()

Vector similarity search for finding similar maintenance jobs.

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
  created_at TIMESTAMPTZ
)
```

**Performance:** Uses ivfflat indexes for fast cosine similarity search (<0.5s)

#### generate_os_number()

Auto-generates work order numbers in format OS-YYYYNNNN.

```sql
CREATE OR REPLACE FUNCTION generate_os_number()
RETURNS TEXT
```

**Format:** OS-YYYYNNNN (e.g., OS-20250001)

### Indexes

```sql
-- Vector similarity search
CREATE INDEX idx_mmi_jobs_embedding ON mmi_jobs 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Performance indexes
CREATE INDEX idx_mmi_components_hours ON mmi_components(current_hours);
CREATE INDEX idx_mmi_jobs_priority ON mmi_jobs(priority, status);
CREATE INDEX idx_mmi_os_number ON mmi_os(os_number);
CREATE INDEX idx_hourometer_logs_component ON mmi_hourometer_logs(component_id, created_at DESC);
```

## ⚡ Edge Functions

### 1. simulate-hours

**Purpose:** Automatically simulates hourometer progression for operational components.

**Schedule:** Runs hourly via cron: `0 * * * *`

**Process:**
1. Fetches all operational components (`is_operational = true`)
2. Adds random hours (0.5-2.0 hours) to each component
3. Creates maintenance jobs when components reach 95% of maintenance interval
4. Records all changes in `mmi_hourometer_logs`
5. Sends summary with critical/high/medium alerts

**Example Output:**
```json
{
  "success": true,
  "processed": 45,
  "hours_added": 67.3,
  "jobs_created": 3,
  "alerts": {
    "critical": 1,
    "high": 2,
    "medium": 0
  }
}
```

### 2. send-alerts

**Purpose:** Sends email notifications for critical and high-priority maintenance jobs.

**Schedule:** Runs daily at 8 AM via cron: `0 8 * * *`

**Features:**
- Professional HTML templates with gradient design
- Priority-based color coding (🔴 critical, 🟠 high, 🟡 medium)
- Groups jobs by vessel for organized notifications
- Includes component details, due dates, and AI suggestions
- Responsive layout for mobile devices

**Email Template:**
```html
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
  <h1>🚢 Manutenção Nautilus - Alerta de Trabalhos Prioritários</h1>
  <div class="job-card critical">
    <span class="priority">🔴 CRÍTICO</span>
    <h3>Motor Principal - Substituição de filtros</h3>
    <p>Componente: ME-4500 (1850.0 horas)</p>
    <p>Prazo: 2025-10-20</p>
  </div>
</div>
```

**Integrations:**
- Resend API for reliable email delivery
- Supports batch processing for multiple vessels
- Failure handling and retry logic

## 🤖 AI Integration

### OpenAI Services

#### 1. Embeddings (text-embedding-ada-002)

**Purpose:** Converts maintenance job descriptions into 1536-dimensional vectors for similarity search.

**Implementation:**
```typescript
// src/services/mmi/embeddingService.ts
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return response.data[0].embedding;
}
```

**Use Cases:**
- Finding similar historical maintenance cases
- Pattern recognition across vessels
- Risk assessment based on past failures

#### 2. GPT-4o Recommendations

**Purpose:** Provides contextual maintenance recommendations based on job description and historical data.

**Implementation:**
```typescript
// src/services/mmi/copilotApi.ts
export async function getAIRecommendation(
  jobDescription: string,
  jobId?: string
): Promise<AIRecommendation>
```

**Response Structure:**
```typescript
interface AIRecommendation {
  technical_action: string;      // Recommended action
  component: string;              // Affected component
  deadline: string;               // Suggested deadline
  requires_work_order: boolean;   // Whether OS is needed
  reasoning: string;              // Detailed explanation
  similar_cases: SimilarCase[];   // Top 5 similar historical cases
}
```

**Prompt Engineering:**
The system uses a specialized prompt that includes:
- Current job context
- Similar historical cases (from vector search)
- Maritime compliance requirements
- Component specifications

### Vector Similarity Search

**Threshold:** 0.78 (78% similarity) - default configurable
**Algorithm:** Cosine similarity using pgvector
**Performance:** <0.5s for searches across 10,000+ jobs

**Example Query:**
```typescript
const { data, error } = await supabase.rpc('match_mmi_jobs', {
  query_embedding: embedding,
  match_threshold: 0.78,
  match_count: 5
});
```

## ⚓ Maritime Compliance

The MMI system integrates key maritime regulatory standards:

### NORMAM (Normas da Autoridade Marítima)

- **NORMAM-05**: Safety equipment maintenance
- **NORMAM-13**: Environmental protection
- Automatic compliance checking for Brazilian vessels

### SOLAS (Safety of Life at Sea)

- **Chapter II-1**: Construction - Machinery installations
- **Chapter II-2**: Fire protection, detection, and extinction
- **Chapter V**: Safety of navigation equipment
- Maintenance interval validation against SOLAS requirements

### MARPOL (Marine Pollution)

- **Annex I**: Oil pollution prevention equipment
- **Annex VI**: Air pollution (engine maintenance)
- Automatic flagging of environmentally critical components

**Implementation:**
```typescript
// Compliance metadata stored in mmi_systems
{
  "compliance": {
    "normam": ["NORMAM-05", "NORMAM-13"],
    "solas": ["II-1"],
    "marpol": ["Annex VI"],
    "inspection_required": true,
    "next_inspection": "2025-12-31"
  }
}
```

## 📡 API Documentation

### Endpoints

#### POST /functions/v1/mmi-copilot

Get AI-powered maintenance recommendations.

**Request:**
```json
{
  "jobDescription": "Motor principal apresentando ruído anormal",
  "jobId": "uuid"
}
```

**Response:**
```json
{
  "technical_action": "Inspeção imediata dos rolamentos",
  "component": "Motor Principal - ME-4500",
  "deadline": "2025-10-18",
  "requires_work_order": true,
  "reasoning": "Baseado em 3 casos similares...",
  "similar_cases": [...]
}
```

#### GET /functions/v1/mmi-jobs-similar?jobId=uuid

Find similar historical maintenance jobs.

**Response:**
```json
{
  "success": true,
  "job_id": "uuid",
  "job_title": "Motor principal - Ruído anormal",
  "similar_jobs": [
    {
      "id": "uuid",
      "title": "Motor STBD - Ruído em operação",
      "similarity": 0.89,
      "status": "completed"
    }
  ],
  "count": 5
}
```

#### POST /functions/v1/mmi-os-create

Create a work order for a maintenance job.

**Request:**
```json
{
  "jobId": "uuid",
  "assignedTo": "uuid",
  "workDescription": "Substituir rolamentos do motor"
}
```

**Response:**
```json
{
  "success": true,
  "os_number": "OS-20250015",
  "id": "uuid"
}
```

#### POST /functions/v1/mmi-job-postpone

Postpone a maintenance job (if allowed).

**Request:**
```json
{
  "jobId": "uuid",
  "newDueDate": "2025-10-25",
  "reason": "Aguardando peças"
}
```

**Response:**
```json
{
  "success": true,
  "new_due_date": "2025-10-25"
}
```

## 🚀 Deployment Guide

### Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
VITE_OPENAI_API_KEY=sk-...
OPENAI_API_KEY=sk-...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=alertas@nautilus.ai
ADMIN_EMAIL=admin@nautilus.ai
```

### Database Migration

Run the complete schema migration:

```bash
# Apply migration
supabase migration up 20251015032230_mmi_complete_schema.sql

# Verify tables
psql -c "\dt mmi_*"
```

### Edge Functions Deployment

```bash
# Deploy simulate-hours (hourly cron)
supabase functions deploy simulate-hours

# Deploy send-alerts (daily cron at 8 AM)
supabase functions deploy send-alerts

# Deploy other MMI functions
supabase functions deploy mmi-copilot
supabase functions deploy mmi-jobs-similar
supabase functions deploy mmi-os-create
supabase functions deploy mmi-job-postpone
```

### Cron Configuration

Add to `supabase/config.toml`:

```toml
[functions.simulate-hours]
verify_jwt = false

[functions.simulate-hours.cron]
schedule = "0 * * * *"  # Every hour
timezone = "America/Sao_Paulo"

[functions.send-alerts]
verify_jwt = false

[functions.send-alerts.cron]
schedule = "0 8 * * *"  # Daily at 8 AM
timezone = "America/Sao_Paulo"
```

### Frontend Build

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 KPIs & Monitoring

### Key Performance Indicators

#### 1. MTBF (Mean Time Between Failures)

```sql
SELECT 
  component_id,
  AVG(EXTRACT(EPOCH FROM (next_failure - previous_failure)) / 3600) as mtbf_hours
FROM (
  SELECT 
    component_id,
    created_at as previous_failure,
    LEAD(created_at) OVER (PARTITION BY component_id ORDER BY created_at) as next_failure
  FROM mmi_jobs
  WHERE status = 'completed'
) t
GROUP BY component_id;
```

#### 2. MTTR (Mean Time To Repair)

```sql
SELECT 
  AVG(EXTRACT(EPOCH FROM (completion_date - start_date)) / 3600) as mttr_hours
FROM mmi_os
WHERE status = 'completed';
```

#### 3. Compliance Rate

```sql
SELECT 
  COUNT(CASE WHEN due_date >= CURRENT_DATE THEN 1 END) * 100.0 / COUNT(*) as compliance_rate
FROM mmi_jobs
WHERE status IN ('pending', 'in_progress');
```

#### 4. Preventive vs. Corrective Maintenance

```sql
SELECT 
  CASE 
    WHEN priority IN ('critical', 'high') THEN 'corrective'
    ELSE 'preventive'
  END as maintenance_type,
  COUNT(*) as count
FROM mmi_jobs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY maintenance_type;
```

### Monitoring Dashboard

Track system health with these metrics:

- **Components Monitored**: Total operational components
- **Active Jobs**: Pending + In Progress
- **Critical Jobs**: Priority = critical
- **Average Response Time**: Time from job creation to assignment
- **AI Recommendation Usage**: Percentage of jobs with AI suggestions
- **Email Delivery Rate**: Successful email alerts / Total alerts

## 🔧 Troubleshooting

### Common Issues

#### 1. Edge Function Not Running (Cron)

**Symptom:** simulate-hours or send-alerts not executing on schedule

**Solution:**
```bash
# Check cron configuration
supabase functions list

# View function logs
supabase functions logs simulate-hours

# Manually trigger for testing
curl -X POST https://your-project.supabase.co/functions/v1/simulate-hours \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

#### 2. Vector Similarity Search Slow

**Symptom:** match_mmi_jobs() takes >5 seconds

**Solution:**
```sql
-- Rebuild ivfflat index
DROP INDEX idx_mmi_jobs_embedding;
CREATE INDEX idx_mmi_jobs_embedding ON mmi_jobs 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);

-- Analyze table
ANALYZE mmi_jobs;
```

#### 3. Email Alerts Not Sending

**Symptom:** send-alerts function succeeds but no emails received

**Solution:**
```bash
# Check Resend API key
echo $RESEND_API_KEY

# Test email API directly
curl https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"test@nautilus.ai","to":"admin@nautilus.ai","subject":"Test","html":"Test"}'

# Check function logs for errors
supabase functions logs send-alerts --tail
```

#### 4. Hourometer Not Incrementing

**Symptom:** Component hours stuck at same value

**Solution:**
```sql
-- Check if component is operational
SELECT id, component_name, is_operational, current_hours
FROM mmi_components
WHERE is_operational = false;

-- Enable operational status
UPDATE mmi_components
SET is_operational = true
WHERE id = 'uuid';

-- Verify hourometer logs
SELECT * FROM mmi_hourometer_logs
WHERE component_id = 'uuid'
ORDER BY created_at DESC
LIMIT 10;
```

#### 5. AI Embeddings Missing

**Symptom:** match_mmi_jobs() returns no results

**Solution:**
```sql
-- Check for jobs with embeddings
SELECT COUNT(*) as total, 
       COUNT(embedding) as with_embeddings
FROM mmi_jobs;

-- Generate embeddings for jobs without them
-- (Run from application code, not SQL)
```

```typescript
// Backfill embeddings
const { data: jobs } = await supabase
  .from('mmi_jobs')
  .select('*')
  .is('embedding', null);

for (const job of jobs) {
  const embedding = await generateEmbedding(job.title + ' ' + job.description);
  await supabase
    .from('mmi_jobs')
    .update({ embedding })
    .eq('id', job.id);
}
```

### Performance Optimization

#### Database Tuning

```sql
-- Increase shared_buffers for better caching
ALTER SYSTEM SET shared_buffers = '256MB';

-- Optimize vector search
ALTER SYSTEM SET effective_cache_size = '1GB';

-- Reload configuration
SELECT pg_reload_conf();
```

#### Application-Level Caching

```typescript
// Cache AI recommendations for 1 hour
const cache = new Map();

async function getCachedRecommendation(jobId: string) {
  const cached = cache.get(jobId);
  if (cached && Date.now() - cached.timestamp < 3600000) {
    return cached.data;
  }
  
  const recommendation = await getAIRecommendation(jobId);
  cache.set(jobId, { data: recommendation, timestamp: Date.now() });
  return recommendation;
}
```

### Support

For additional support:
- **Documentation**: https://github.com/RodrigoSC89/travel-hr-buddy/wiki
- **Issues**: https://github.com/RodrigoSC89/travel-hr-buddy/issues
- **Email**: support@nautilus.ai

---

**Version**: 1.0.0  
**Last Updated**: October 15, 2025  
**Maintained by**: Nautilus AI Team
