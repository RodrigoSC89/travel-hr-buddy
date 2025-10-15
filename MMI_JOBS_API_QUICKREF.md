# MMI Jobs API - Quick Reference

## 🚀 Quick Start

### Deploy Database
```bash
# Run migrations in Supabase
supabase db push
```

### Deploy Edge Functions
```bash
# Deploy both functions
supabase functions deploy mmi-job-postpone
supabase functions deploy mmi-os-create
```

### Set Environment Variables
```bash
# In Supabase Dashboard > Settings > Edge Functions
OPENAI_API_KEY=sk-...
```

## 📡 API Endpoints

### 1. Evaluate Job Postponement

**Endpoint:** `POST /mmi-job-postpone/{jobId}/postpone`

**cURL:**
```bash
curl -X POST \
  "https://your-project.supabase.co/functions/v1/mmi-job-postpone/YOUR_JOB_ID/postpone" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**JavaScript:**
```javascript
const response = await fetch(
  `${supabaseUrl}/functions/v1/mmi-job-postpone/${jobId}/postpone`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${anonKey}` }
  }
);
const { message } = await response.json();
```

**Response:**
```json
{
  "message": "✅ Pode postergar com risco baixo",
  "jobId": "uuid",
  "timestamp": "2025-10-14T21:53:00.000Z"
}
```

### 2. Create Work Order

**Endpoint:** `POST /mmi-os-create`

**cURL:**
```bash
curl -X POST \
  "https://your-project.supabase.co/functions/v1/mmi-os-create" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jobId":"YOUR_JOB_ID"}'
```

**JavaScript:**
```javascript
const response = await fetch(
  `${supabaseUrl}/functions/v1/mmi-os-create`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ jobId })
  }
);
const { os_id, message } = await response.json();
```

**Response:**
```json
{
  "message": "OS criada com sucesso",
  "os_id": "new-uuid",
  "job_id": "uuid",
  "status": "open",
  "timestamp": "2025-10-14T21:53:00.000Z"
}
```

## 🗄️ Database Queries

### Create Job
```sql
INSERT INTO mmi_jobs (
  title, 
  component, 
  usage_hours, 
  avg_usage, 
  stock, 
  mission_active, 
  history
) VALUES (
  'Troca de filtro hidráulico',
  'Bomba hidráulica popa',
  241,
  260,
  true,
  true,
  '3 trocas nos últimos 90 dias'
);
```

### Query Jobs
```sql
-- All jobs
SELECT * FROM mmi_jobs ORDER BY created_at DESC;

-- Jobs needing attention (usage > average)
SELECT * FROM mmi_jobs WHERE usage_hours > avg_usage;

-- Jobs with active missions
SELECT * FROM mmi_jobs WHERE mission_active = true;
```

### Query Work Orders
```sql
-- All open work orders
SELECT * FROM mmi_os WHERE status = 'open';

-- Work orders with job details
SELECT 
  os.*,
  job.title,
  job.component
FROM mmi_os os
JOIN mmi_jobs job ON os.job_id = job.id
ORDER BY os.created_at DESC;
```

## 🔑 Using with Supabase Client

### TypeScript Example
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create a job
async function createMaintenanceJob() {
  const { data, error } = await supabase
    .from('mmi_jobs')
    .insert({
      title: 'Troca de filtro hidráulico',
      component: 'Bomba hidráulica popa',
      usage_hours: 241,
      avg_usage: 260,
      stock: true,
      mission_active: true,
      history: '3 trocas nos últimos 90 dias',
    })
    .select()
    .single();
  
  return data;
}

// Evaluate postponement
async function evaluatePostponement(jobId: string) {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/mmi-job-postpone/${jobId}/postpone`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );
  
  return response.json();
}

// Create work order
async function createWorkOrder(jobId: string) {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/mmi-os-create`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobId }),
    }
  );
  
  return response.json();
}
```

## 🧪 Testing

### Test Postpone Endpoint
```bash
# Using mock data (no job ID needed - uses fallback)
curl -X POST \
  "https://your-project.supabase.co/functions/v1/mmi-job-postpone/test-id/postpone" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Test OS Creation
```bash
# 1. Create a test job first
JOB_ID=$(curl -X POST \
  "https://your-project.supabase.co/rest/v1/mmi_jobs" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "title": "Test Job",
    "component": "Test Component",
    "usage_hours": 100,
    "avg_usage": 200,
    "stock": true,
    "mission_active": false
  }' | jq -r '.[0].id')

# 2. Create OS for the job
curl -X POST \
  "https://your-project.supabase.co/functions/v1/mmi-os-create" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"jobId\":\"$JOB_ID\"}"
```

## 📊 Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (missing parameters) |
| 404 | Job Not Found |
| 500 | Server Error |

## ⚡ Features

- ✅ AI-powered maintenance evaluation with GPT-4
- ✅ Automatic retry logic (3 attempts)
- ✅ 30-second request timeout
- ✅ CORS support
- ✅ Row Level Security
- ✅ Exponential backoff on errors
- ✅ Comprehensive error handling

## 📁 Files

```
supabase/
├── migrations/
│   ├── 20251014215400_create_mmi_jobs_table.sql
│   └── 20251014215500_create_mmi_os_table.sql
└── functions/
    ├── mmi-job-postpone/
    │   └── index.ts
    └── mmi-os-create/
        └── index.ts
```

## 🆘 Troubleshooting

### OpenAI API Key Not Set
```
Error: "OPENAI_API_KEY is not configured"
Solution: Set in Supabase Dashboard > Settings > Edge Functions
```

### Job Not Found
```
Error: "Job não encontrado"
Solution: Verify job ID exists in mmi_jobs table
```

### Rate Limit
```
Solution: Wait and retry, or increase OpenAI API limits
```

## 🔗 Links

- Full Documentation: `MMI_JOBS_API_IMPLEMENTATION.md`
- Supabase Dashboard: https://app.supabase.com
- OpenAI API: https://platform.openai.com

---

*Quick Reference for MMI Jobs API*
*Updated: 2025-10-14*
