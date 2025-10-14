# MMI (Manutenção Inteligente) Jobs API Implementation

## 📋 Overview

The **MMI (Manutenção Inteligente / Intelligent Maintenance)** module provides intelligent maintenance management for maritime equipment with AI-powered decision support.

## 🎯 Features Implemented

### ✅ Database Structure

#### 1. `mmi_jobs` Table
Stores maintenance jobs with the following fields:
- `id` (UUID) - Primary key
- `title` (TEXT) - Job title
- `component` (TEXT) - Equipment component name
- `usage_hours` (INTEGER) - Current usage hours
- `avg_usage` (INTEGER) - Historical average usage
- `stock` (BOOLEAN) - Whether replacement parts are in stock
- `mission_active` (BOOLEAN) - Whether a mission is currently active
- `history` (TEXT) - Maintenance history notes
- `created_by` (UUID) - Reference to auth.users
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

**RLS Policies:**
- All users can view jobs
- Authenticated users can insert jobs
- Users can update their own jobs

#### 2. `mmi_os` Table
Stores work orders (Ordem de Serviço) linked to jobs:
- `id` (UUID) - Primary key
- `job_id` (UUID) - Foreign key to mmi_jobs
- `opened_by` (UUID) - Reference to auth.users
- `status` (TEXT) - Status: open, in_progress, completed, cancelled
- `notes` (TEXT) - Optional notes
- `completed_at` (TIMESTAMP) - Completion timestamp
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

**RLS Policies:**
- All users can view work orders
- Authenticated users can insert work orders
- Users can update their own work orders

### ✅ API Endpoints (Supabase Edge Functions)

#### 1. POST `/mmi-job-postpone/{jobId}/postpone`

**Purpose:** AI-powered evaluation of whether a maintenance job can be safely postponed.

**Request:**
```bash
curl -X POST \
  'https://your-project.supabase.co/functions/v1/mmi-job-postpone/{jobId}/postpone' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

**Response:**
```json
{
  "message": "✅ Pode postergar com risco baixo",
  "jobId": "uuid-here",
  "timestamp": "2025-10-14T21:53:00.000Z"
}
```

**Features:**
- OpenAI GPT-4 integration for intelligent analysis
- Evaluates usage hours, stock availability, and mission status
- Retry logic with exponential backoff
- 30-second request timeout
- Fallback to mock data for testing

**AI Evaluation Criteria:**
- Current vs. average usage hours
- Parts availability in stock
- Active mission status
- Historical maintenance patterns

#### 2. POST `/mmi-os-create`

**Purpose:** Create a new work order (OS) linked to a maintenance job.

**Request:**
```bash
curl -X POST \
  'https://your-project.supabase.co/functions/v1/mmi-os-create' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"jobId": "uuid-here"}'
```

**Response:**
```json
{
  "message": "OS criada com sucesso",
  "os_id": "new-uuid-here",
  "job_id": "uuid-here",
  "status": "open",
  "timestamp": "2025-10-14T21:53:00.000Z"
}
```

**Features:**
- Validates job exists before creating OS
- Automatically links OS to job creator
- Returns complete OS details
- Error handling for missing jobs

## 🚀 Deployment

### Database Migrations

The migrations are automatically applied when deploying to Supabase:

1. `20251014215400_create_mmi_jobs_table.sql` - Creates mmi_jobs table
2. `20251014215500_create_mmi_os_table.sql` - Creates mmi_os table

### Edge Functions

Deploy the edge functions to Supabase:

```bash
# Deploy postpone job function
supabase functions deploy mmi-job-postpone

# Deploy OS creation function
supabase functions deploy mmi-os-create
```

### Environment Variables

Required environment variables in Supabase:

```env
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📊 Usage Examples

### Example 1: Check if Job Can Be Postponed

```typescript
const response = await fetch(
  `https://your-project.supabase.co/functions/v1/mmi-job-postpone/${jobId}/postpone`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
  }
);

const data = await response.json();
console.log(data.message); // "✅ Pode postergar com risco baixo" or "❌ Não é recomendável postergar"
```

### Example 2: Create Work Order

```typescript
const response = await fetch(
  'https://your-project.supabase.co/functions/v1/mmi-os-create',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jobId: 'uuid-here' }),
  }
);

const data = await response.json();
console.log(`OS created with ID: ${data.os_id}`);
```

### Example 3: Create and Evaluate Job

```typescript
// 1. Create a maintenance job
const { data: job } = await supabase
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

// 2. Check if it can be postponed
const postponeResponse = await fetch(
  `https://your-project.supabase.co/functions/v1/mmi-job-postpone/${job.id}/postpone`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
  }
);

const evaluation = await postponeResponse.json();

// 3. If cannot be postponed, create work order
if (evaluation.message.includes('❌')) {
  const osResponse = await fetch(
    'https://your-project.supabase.co/functions/v1/mmi-os-create',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobId: job.id }),
    }
  );
  
  const workOrder = await osResponse.json();
  console.log(`Work order created: ${workOrder.os_id}`);
}
```

## 🔧 Technical Details

### Retry Logic

Both edge functions implement retry logic with exponential backoff:
- Maximum 3 retries
- Initial delay: 1 second
- Maximum delay: 10 seconds
- Jitter: 0-30% of delay
- Request timeout: 30 seconds

### Error Handling

Comprehensive error handling:
- 400: Bad request (missing parameters)
- 404: Job not found
- 500: Server error (OpenAI API failure, database error)
- CORS support for cross-origin requests

### Security

- Row Level Security (RLS) enabled on all tables
- User-based access control
- Service role key for backend operations
- API key validation

## 📈 Status Summary

| Item | Status |
|------|--------|
| Database structure (mmi_jobs) | ✅ |
| Database structure (mmi_os) | ✅ |
| Postpone job API | ✅ |
| Create OS API | ✅ |
| OpenAI GPT-4 integration | ✅ |
| Error handling | ✅ |
| Retry logic | ✅ |
| CORS support | ✅ |
| RLS policies | ✅ |

## 🔗 Related Files

- `supabase/migrations/20251014215400_create_mmi_jobs_table.sql`
- `supabase/migrations/20251014215500_create_mmi_os_table.sql`
- `supabase/functions/mmi-job-postpone/index.ts`
- `supabase/functions/mmi-os-create/index.ts`

## 🎓 Architecture Notes

This implementation uses:
- **Supabase Edge Functions** instead of Next.js API routes (as the project uses Vite/React)
- **Deno runtime** for edge functions
- **PostgreSQL** for data storage
- **OpenAI GPT-4** for AI-powered maintenance evaluation
- **Row Level Security** for data protection

The API endpoints follow REST principles and can be called from any client that can make HTTP requests.

---

*Generated: 2025-10-14*
*Module: MMI (Manutenção Inteligente)*
