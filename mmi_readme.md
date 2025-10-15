# MMI - Módulo de Manutenção Inteligente (Intelligent Maintenance Module)

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Edge Functions](#edge-functions)
- [AI Integration](#ai-integration)
- [Deployment](#deployment)
- [KPIs and Monitoring](#kpis-and-monitoring)
- [Maritime Compliance](#maritime-compliance)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)

## Overview

The MMI (Módulo de Manutenção Inteligente) is a comprehensive intelligent maintenance management system for maritime operations. It provides AI-powered maintenance scheduling, predictive analysis, and automated workflow management for vessel maintenance operations.

### Key Features

- **AI-Powered Analysis**: Uses OpenAI GPT-4o for intelligent maintenance recommendations
- **Vector Similarity Search**: 1536-dimensional embeddings with cosine distance for finding similar maintenance jobs
- **Intelligent Hourometer System**: Automatic tracking and maintenance scheduling
- **Smart Alert System**: HTML emails with priority-based formatting
- **Enhanced AI Assistant**: Real-time queries and MMI commands
- **Maritime Compliance**: NORMAM, SOLAS, MARPOL integration
- **Comprehensive Testing**: Full unit, integration, and e2e test coverage

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ JobCards.tsx │  │Dashboard.tsx │  │MMICopilot.tsx│         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  jobsApi.ts  │  │copilotApi.ts │  │   various    │         │
│  └──────────────┘  └──────────────┘  │   services   │         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER (Edge Functions)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │mmi-copilot   │  │mmi-job-      │  │mmi-os-create │         │
│  │              │  │postpone      │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │simulate-hours│  │send-alerts   │  │assistant-    │         │
│  │              │  │              │  │query         │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  mmi_jobs    │  │   mmi_os     │  │mmi_components│         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐                           │
│  │ mmi_systems  │  │mmi_hourometer│                           │
│  │              │  │    _logs     │                           │
│  └──────────────┘  └──────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      INTEGRATION LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  OpenAI API  │  │  Resend API  │  │  Supabase    │         │
│  │  (GPT-4o)    │  │  (Emails)    │  │  (Storage)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Core Tables

#### 1. mmi_systems
Ship systems with criticality tracking.

```sql
CREATE TABLE mmi_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  criticality TEXT CHECK (criticality IN ('low', 'medium', 'high', 'critical')),
  vessel_id UUID REFERENCES vessels(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 2. mmi_components
Component tracking with hourometers.

```sql
CREATE TABLE mmi_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  system_id UUID REFERENCES mmi_systems(id),
  current_hours DECIMAL DEFAULT 0,
  maintenance_interval_hours DECIMAL,
  last_maintenance_date DATE,
  status TEXT CHECK (status IN ('operational', 'maintenance', 'failed', 'decommissioned')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 3. mmi_jobs
Enhanced with AI embeddings.

```sql
CREATE TABLE mmi_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  component_id UUID REFERENCES mmi_components(id),
  due_date DATE,
  can_postpone BOOLEAN DEFAULT true,
  suggestion_ia TEXT,
  embedding vector(1536), -- OpenAI ada-002 embeddings
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 4. mmi_os (Work Orders)
Work orders with auto-generated OS numbers.

```sql
CREATE TABLE mmi_os (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_number TEXT UNIQUE NOT NULL, -- Format: OS-YYYYNNNN
  job_id UUID REFERENCES mmi_jobs(id),
  status TEXT CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  opened_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  parts_used JSONB,
  labor_hours DECIMAL,
  total_cost DECIMAL,
  completion_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

#### 5. mmi_hourometer_logs
Audit trail for operating hours.

```sql
CREATE TABLE mmi_hourometer_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID REFERENCES mmi_components(id),
  hours_before DECIMAL NOT NULL,
  hours_after DECIMAL NOT NULL,
  hours_increment DECIMAL GENERATED ALWAYS AS (hours_after - hours_before) STORED,
  source TEXT CHECK (source IN ('manual', 'automatic', 'sensor')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Database Functions

#### match_mmi_jobs()
Vector similarity search for finding similar maintenance jobs.

```sql
CREATE OR REPLACE FUNCTION match_mmi_jobs(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  similarity float
)
```

#### generate_os_number()
Automatic OS number generation in format OS-YYYYNNNN.

```sql
CREATE OR REPLACE FUNCTION generate_os_number()
RETURNS TEXT
AS $$
DECLARE
  year TEXT := TO_CHAR(CURRENT_DATE, 'YYYY');
  sequence_num INT;
  os_num TEXT;
BEGIN
  -- Get next sequence number for the year
  SELECT COALESCE(MAX(SUBSTRING(os_number FROM 8)::INT), 0) + 1
  INTO sequence_num
  FROM mmi_os
  WHERE os_number LIKE 'OS-' || year || '%';
  
  -- Format as OS-YYYYNNNN
  os_num := 'OS-' || year || LPAD(sequence_num::TEXT, 4, '0');
  RETURN os_num;
END;
$$ LANGUAGE plpgsql;
```

### Indexes

- **Vector indexes**: ivfflat indexes for embedding similarity search
- **Standard indexes**: On foreign keys, status fields, dates
- **Unique indexes**: On os_number

### RLS Policies

- Read access: All authenticated users
- Write access: Role-based permissions
- Admin override: Service role bypass

## API Documentation

### 1. Create Job
**Endpoint**: `POST /api/mmi/jobs`

**Request**:
```json
{
  "title": "Manutenção preventiva bomba hidráulica",
  "description": "Inspeção e lubrificação",
  "priority": "high",
  "component_id": "uuid",
  "due_date": "2025-11-15"
}
```

**Response**:
```json
{
  "job_id": "uuid",
  "message": "Job criado com sucesso",
  "timestamp": "2025-10-15T10:00:00Z"
}
```

### 2. Postpone Job
**Endpoint**: `POST /api/mmi/jobs/:id/postpone`

**Request**:
```json
{
  "reason": "Embarcação em viagem crítica",
  "requested_new_date": "2025-11-15T10:00:00Z"
}
```

**Response**:
```json
{
  "recommendation": "conditional",
  "risk_assessment": {
    "level": "low",
    "factors": ["historical_performance", "current_condition"],
    "confidence": 0.85
  },
  "new_date": "2025-11-15T10:00:00Z",
  "message": "Postergamento aprovado com restrições"
}
```

### 3. Create Work Order (OS)
**Endpoint**: `POST /api/mmi/os`

**Request**:
```json
{
  "job_id": "uuid",
  "assigned_to": "uuid"
}
```

**Response**:
```json
{
  "os_id": "uuid",
  "os_number": "OS-20250001",
  "status": "open",
  "message": "OS criada com sucesso"
}
```

### 4. Find Similar Jobs
**Endpoint**: `POST /api/mmi/jobs/similar`

**Request**:
```json
{
  "query": "falha no gerador diesel",
  "match_count": 5
}
```

**Response**:
```json
{
  "similar_jobs": [
    {
      "id": "uuid",
      "title": "Falha no gerador STBD",
      "similarity": 0.92,
      "resolution": "Troca de ventilador"
    }
  ]
}
```

## Edge Functions

### 1. simulate-hours
**Purpose**: Automatic hourometer simulation for operational components

**Features**:
- Batch processing with random hour increments (0.5-2.0 hours)
- Automatic maintenance job creation at thresholds
- Audit log creation
- Scheduled hourly via cron

**Cron Schedule**: `0 * * * *` (every hour)

**Environment Variables**:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2. send-alerts
**Purpose**: Email notification system for critical/high-priority jobs

**Features**:
- Professional HTML templates with gradient design
- Job grouping by vessel
- Priority color coding (critical=red, high=orange)
- Resend API integration
- Scheduled daily at 08:00

**Cron Schedule**: `0 8 * * *` (daily at 8 AM)

**Environment Variables**:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `ALERT_EMAIL_TO`

**Email Template**:
```html
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
  <h1>🔔 Alertas de Manutenção MMI</h1>
  <div style="background: white;">
    <!-- Job cards grouped by vessel -->
  </div>
</div>
```

### 3. assistant-query (Enhanced)
**Purpose**: AI assistant with MMI module context

**New MMI Commands**:
1. `mmi jobs críticos` - List critical jobs
2. `mmi criar job` - Navigate to job creation
3. `mmi dashboard` - Open MMI dashboard
4. `mmi alertas` - View maintenance alerts
5. `mmi componentes` - List components
6. `mmi postergar [job_id]` - Postpone job with AI analysis
7. `mmi criar os [job_id]` - Create work order
8. `mmi histórico [component_id]` - Component history
9. `mmi compliance` - Check compliance status

**Maritime Compliance Context**:
- NORMAM (Normas da Autoridade Marítima)
- SOLAS (Safety of Life at Sea)
- MARPOL (Marine Pollution)

## AI Integration

### OpenAI GPT-4o

**Model**: `gpt-4o`  
**Use Cases**:
- Postponement risk analysis
- Maintenance recommendations
- Natural language query processing

**Example Prompt**:
```
Analyze postponement request for maintenance job:
Title: {title}
Priority: {priority}
Current Date: {current_date}
Requested Date: {requested_date}
Reason: {reason}
Historical Data: {similar_jobs}

Provide risk assessment and recommendation.
```

### Vector Embeddings

**Model**: `text-embedding-ada-002`  
**Dimensions**: 1536  
**Similarity**: Cosine distance  
**Index**: ivfflat with 100 lists

**Workflow**:
1. Generate embedding for job description
2. Store in `mmi_jobs.embedding`
3. Query similar jobs using `match_mmi_jobs()`
4. Return top N similar jobs with resolution notes

## Deployment

### Prerequisites

1. Supabase project with:
   - PostgreSQL 15+
   - pgvector extension
   - Edge Functions enabled

2. Environment Variables:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
ALERT_EMAIL_TO=alerts@example.com
```

### Database Migration

```bash
# Run the complete schema migration
supabase db push supabase/migrations/20251015032230_mmi_complete_schema.sql
```

### Edge Functions Deployment

```bash
# Deploy all MMI edge functions
supabase functions deploy simulate-hours
supabase functions deploy send-alerts
supabase functions deploy assistant-query
supabase functions deploy mmi-copilot
supabase functions deploy mmi-job-postpone
supabase functions deploy mmi-os-create
```

### Cron Jobs Configuration

Add to Supabase Dashboard → Edge Functions → Cron Jobs:

```yaml
- name: simulate-hours
  schedule: "0 * * * *"  # Every hour
  function: simulate-hours

- name: send-alerts
  schedule: "0 8 * * *"  # Daily at 8 AM
  function: send-alerts
```

## KPIs and Monitoring

### Key Performance Indicators

1. **MTBF (Mean Time Between Failures)**
   - Formula: Total operational hours / Number of failures
   - Target: > 2000 hours

2. **MTTR (Mean Time To Repair)**
   - Formula: Total repair time / Number of repairs
   - Target: < 24 hours

3. **Compliance Rate**
   - Formula: (Completed on-time / Total jobs) × 100%
   - Target: > 95%

4. **Postponement Rate**
   - Formula: (Postponed jobs / Total jobs) × 100%
   - Target: < 10%

5. **AI Accuracy**
   - Formula: (Correct recommendations / Total recommendations) × 100%
   - Target: > 85%

### Monitoring Queries

```sql
-- Active critical jobs
SELECT COUNT(*) FROM mmi_jobs 
WHERE status = 'pending' AND priority = 'critical';

-- Overdue jobs
SELECT COUNT(*) FROM mmi_jobs 
WHERE status = 'pending' AND due_date < CURRENT_DATE;

-- Average completion time
SELECT AVG(completed_at - created_at) FROM mmi_os 
WHERE status = 'completed';

-- Components near maintenance
SELECT c.name, c.current_hours, c.maintenance_interval_hours
FROM mmi_components c
WHERE c.current_hours >= (c.maintenance_interval_hours * 0.9);
```

## Maritime Compliance

### NORMAM (Normas da Autoridade Marítima)

- NORMAM-01: Embarcações Empregadas na Navegação de Mar Aberto
- NORMAM-03: Amadores, Embarcações de Esporte e/ou Recreio
- NORMAM-08: Tráfego e Permanência de Embarcações em Águas Jurisdicionais

**Compliance Checks**:
- Safety equipment inspection schedules
- Crew certification tracking
- Emergency drill documentation

### SOLAS (Safety of Life at Sea)

**Relevant Chapters**:
- Chapter II-1: Construction
- Chapter II-2: Fire Protection
- Chapter III: Life-Saving Appliances
- Chapter V: Safety of Navigation

**MMI Integration**:
- Automated safety equipment maintenance tracking
- Critical system prioritization
- Emergency response equipment monitoring

### MARPOL (Marine Pollution)

**Annexes**:
- Annex I: Oil Pollution
- Annex IV: Sewage
- Annex V: Garbage
- Annex VI: Air Pollution

**Compliance Features**:
- Environmental system maintenance
- Waste management tracking
- Emission control monitoring

## Troubleshooting

### Common Issues

#### 1. Vector Search Not Working

**Problem**: `match_mmi_jobs()` returns no results

**Solution**:
```sql
-- Check if embeddings are populated
SELECT COUNT(*) FROM mmi_jobs WHERE embedding IS NOT NULL;

-- Rebuild vector index
DROP INDEX IF EXISTS mmi_jobs_embedding_idx;
CREATE INDEX mmi_jobs_embedding_idx ON mmi_jobs 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

#### 2. Cron Jobs Not Running

**Problem**: Edge functions not executing on schedule

**Solution**:
1. Check Supabase Dashboard → Edge Functions → Logs
2. Verify cron schedule format
3. Check function deployment status
4. Verify environment variables

#### 3. Email Alerts Not Sending

**Problem**: send-alerts function succeeds but no emails received

**Solution**:
1. Verify Resend API key: `RESEND_API_KEY`
2. Check email configuration: `ALERT_EMAIL_TO`
3. Review Resend dashboard for delivery status
4. Check spam folder

#### 4. OS Number Generation Fails

**Problem**: Duplicate OS numbers or generation errors

**Solution**:
```sql
-- Check for duplicate OS numbers
SELECT os_number, COUNT(*) 
FROM mmi_os 
GROUP BY os_number 
HAVING COUNT(*) > 1;

-- Reset sequence if needed
-- (Handle manually based on current max)
```

### Debug Mode

Enable debug logging in edge functions:

```typescript
const DEBUG = Deno.env.get("DEBUG") === "true";
if (DEBUG) console.log("Debug info:", data);
```

Set environment variable:
```bash
DEBUG=true
```

## Future Enhancements

### Phase 2 Features

1. **Mobile App Integration**
   - Push notifications for critical jobs
   - Offline mode support
   - QR code scanning for components

2. **IoT Sensor Integration**
   - Real-time sensor data ingestion
   - Automatic hourometer updates from sensors
   - Predictive failure detection

3. **Advanced Analytics Dashboard**
   - Interactive charts and graphs
   - Predictive maintenance trends
   - Cost analysis and budgeting

4. **Multi-Language Support**
   - English, Spanish, Portuguese
   - Localized compliance standards
   - Regional maritime regulations

5. **Integration with ERP Systems**
   - SAP integration
   - Parts inventory synchronization
   - Purchase order automation

### Phase 3 Features

1. **Machine Learning Models**
   - Custom failure prediction models
   - Anomaly detection in sensor data
   - Optimal maintenance scheduling

2. **AR/VR Maintenance Assistance**
   - Augmented reality repair guides
   - Virtual training environments
   - Remote expert assistance

3. **Blockchain Integration**
   - Immutable maintenance records
   - Parts provenance tracking
   - Compliance audit trail

## Conclusion

The MMI module provides a comprehensive, AI-powered maintenance management solution for maritime operations. With intelligent automation, predictive analytics, and maritime compliance integration, it ensures vessels maintain optimal operational status while adhering to international safety standards.

For support or questions, contact the development team or refer to the implementation documentation.

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-15  
**Authors**: Nautilus One Development Team
