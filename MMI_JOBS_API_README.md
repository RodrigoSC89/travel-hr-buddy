# 🔧 MMI (Manutenção Inteligente) Jobs API - README

## Overview

This implementation adds intelligent maintenance management capabilities to the Travel HR Buddy platform, specifically designed for maritime equipment maintenance scheduling with AI-powered decision support.

## 🎯 What This Feature Does

The MMI Jobs API provides:

1. **Intelligent Maintenance Scheduling** - Track maintenance jobs for maritime equipment
2. **AI-Powered Risk Assessment** - Use GPT-4 to evaluate whether maintenance can be safely postponed
3. **Automated Work Order Creation** - Automatically create work orders (OS) linked to maintenance jobs
4. **Complete Audit Trail** - Track all maintenance activities with timestamps and user attribution

## 🏗️ Architecture

This implementation uses:
- **PostgreSQL** for data storage (via Supabase)
- **Supabase Edge Functions** (Deno runtime) for API endpoints
- **OpenAI GPT-4** for intelligent maintenance risk evaluation
- **Row Level Security** for data protection

### Why Supabase Edge Functions Instead of Next.js API Routes?

The problem statement referenced Next.js API routes (`/app/api/`), but this project uses **Vite + React**, not Next.js. Supabase Edge Functions are the appropriate equivalent and offer several advantages:

- ✅ Serverless and auto-scaling
- ✅ No server management required
- ✅ Built-in authentication
- ✅ Lower latency (closer to database)
- ✅ Free tier available

## 📦 What's Included

### Database Migrations (2 files)

1. **`20251014215400_create_mmi_jobs_table.sql`**
   - Creates `mmi_jobs` table
   - Adds RLS policies
   - Creates performance indexes
   - Adds auto-update trigger

2. **`20251014215500_create_mmi_os_table.sql`**
   - Creates `mmi_os` (work orders) table
   - Links to `mmi_jobs` via foreign key
   - Adds RLS policies
   - Creates performance indexes
   - Adds auto-update trigger

### Edge Functions (2 functions)

1. **`mmi-job-postpone`** - AI-powered maintenance risk evaluation
   - Evaluates whether maintenance can be postponed
   - Uses OpenAI GPT-4 for analysis
   - Considers usage hours, stock availability, mission status
   - Returns clear ✅/❌ recommendation

2. **`mmi-os-create`** - Automated work order creation
   - Creates work orders linked to maintenance jobs
   - Validates job existence
   - Links OS to job creator
   - Returns complete OS details

### Documentation (4 files)

1. **`MMI_JOBS_API_IMPLEMENTATION.md`** - Complete implementation guide
2. **`MMI_JOBS_API_QUICKREF.md`** - Quick reference for developers
3. **`MMI_JOBS_API_VISUAL_SUMMARY.md`** - Visual diagrams and flows
4. **`MMI_JOBS_API_COMPLETE.md`** - Comprehensive summary

## 🚀 Quick Start

### Prerequisites

- Supabase project set up
- OpenAI API key
- Supabase CLI installed (optional, for local development)

### Deployment Steps

#### 1. Apply Database Migrations

**Option A: Supabase Dashboard**
1. Go to your Supabase project
2. Navigate to Database → Migrations
3. Copy and run the migrations in order:
   - `20251014215400_create_mmi_jobs_table.sql`
   - `20251014215500_create_mmi_os_table.sql`

**Option B: Supabase CLI**
```bash
supabase db push
```

#### 2. Deploy Edge Functions

```bash
# Deploy postpone job function
supabase functions deploy mmi-job-postpone

# Deploy OS creation function
supabase functions deploy mmi-os-create
```

#### 3. Configure Environment Variables

In Supabase Dashboard → Settings → Edge Functions, add:
```
OPENAI_API_KEY=sk-your-openai-key-here
```

#### 4. Test the Endpoints

```bash
# Get your project URL and anon key from Supabase Dashboard
export SUPABASE_URL="https://your-project.supabase.co"
export ANON_KEY="your-anon-key"

# Test postpone endpoint (uses mock data)
curl -X POST "$SUPABASE_URL/functions/v1/mmi-job-postpone/test-id/postpone" \
  -H "Authorization: Bearer $ANON_KEY"

# Create a test job first
JOB_ID=$(curl -X POST "$SUPABASE_URL/rest/v1/mmi_jobs" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "title": "Test Maintenance Job",
    "component": "Test Component",
    "usage_hours": 100,
    "avg_usage": 200,
    "stock": true,
    "mission_active": false
  }' | jq -r '.[0].id')

# Test OS creation
curl -X POST "$SUPABASE_URL/functions/v1/mmi-os-create" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"jobId\":\"$JOB_ID\"}"
```

## 📡 API Reference

### Endpoint 1: Evaluate Job Postponement

**URL:** `POST /functions/v1/mmi-job-postpone/{jobId}/postpone`

**Description:** Uses AI to evaluate whether a maintenance job can be safely postponed.

**Request:**
```bash
curl -X POST \
  "https://your-project.supabase.co/functions/v1/mmi-job-postpone/{jobId}/postpone" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Response:**
```json
{
  "message": "✅ Pode postergar com risco baixo",
  "jobId": "uuid-here",
  "timestamp": "2025-10-14T21:53:00.000Z"
}
```

**Possible Messages:**
- `✅ Pode postergar com risco baixo` - Safe to postpone
- `❌ Não é recomendável postergar` - Not recommended to postpone

### Endpoint 2: Create Work Order

**URL:** `POST /functions/v1/mmi-os-create`

**Description:** Creates a work order (OS) linked to a maintenance job.

**Request:**
```bash
curl -X POST \
  "https://your-project.supabase.co/functions/v1/mmi-os-create" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jobId":"uuid-here"}'
```

**Response:**
```json
{
  "message": "OS criada com sucesso",
  "os_id": "new-uuid",
  "job_id": "uuid-here",
  "status": "open",
  "timestamp": "2025-10-14T21:53:00.000Z"
}
```

## 🗄️ Database Schema

### `mmi_jobs` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Maintenance job title |
| component | TEXT | Equipment component name |
| usage_hours | INTEGER | Current usage in hours |
| avg_usage | INTEGER | Historical average usage |
| stock | BOOLEAN | Parts available in stock |
| mission_active | BOOLEAN | Whether mission is active |
| history | TEXT | Maintenance history notes |
| created_by | UUID | User who created the job |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### `mmi_os` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| job_id | UUID | Foreign key to mmi_jobs |
| opened_by | UUID | User who opened the OS |
| status | TEXT | open/in_progress/completed/cancelled |
| notes | TEXT | Optional notes |
| completed_at | TIMESTAMP | Completion timestamp |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## 💡 Usage Examples

### Example 1: Complete Workflow

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// 2. Evaluate if it can be postponed
const postponeResponse = await fetch(
  `${SUPABASE_URL}/functions/v1/mmi-job-postpone/${job.id}/postpone`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  }
);
const evaluation = await postponeResponse.json();

// 3. If cannot be postponed, create work order
if (evaluation.message.includes('❌')) {
  const osResponse = await fetch(
    `${SUPABASE_URL}/functions/v1/mmi-os-create`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobId: job.id }),
    }
  );
  
  const workOrder = await osResponse.json();
  console.log(`Work order created: ${workOrder.os_id}`);
}
```

### Example 2: Query Jobs and Work Orders

```typescript
// Get all pending maintenance jobs
const { data: pendingJobs } = await supabase
  .from('mmi_jobs')
  .select('*')
  .order('created_at', { ascending: false });

// Get open work orders with job details
const { data: openWorkOrders } = await supabase
  .from('mmi_os')
  .select(`
    *,
    job:mmi_jobs(*)
  `)
  .eq('status', 'open');

// Get jobs needing attention (usage > average)
const { data: urgentJobs } = await supabase
  .from('mmi_jobs')
  .select('*')
  .gt('usage_hours', 'avg_usage');
```

## 🔒 Security

- **Row Level Security (RLS)** is enabled on all tables
- Users can view all jobs and work orders
- Only authenticated users can create jobs/work orders
- Users can only update their own jobs/work orders
- Service role key is used in edge functions for elevated access

## ⚡ Performance

- Database indexes on frequently queried columns
- Edge functions deploy globally for low latency
- Retry logic handles transient failures
- 30-second timeout prevents hanging requests

## 🧪 Testing

See `MMI_JOBS_API_QUICKREF.md` for detailed testing instructions.

## 📚 Additional Documentation

- **Full Guide:** `MMI_JOBS_API_IMPLEMENTATION.md`
- **Quick Reference:** `MMI_JOBS_API_QUICKREF.md`
- **Visual Summary:** `MMI_JOBS_API_VISUAL_SUMMARY.md`
- **Complete Summary:** `MMI_JOBS_API_COMPLETE.md`

## 🐛 Troubleshooting

### OpenAI API Key Not Set
**Error:** `OPENAI_API_KEY is not configured`

**Solution:** Add the environment variable in Supabase Dashboard → Settings → Edge Functions

### Job Not Found
**Error:** `Job não encontrado`

**Solution:** Verify the job ID exists in the `mmi_jobs` table

### Permission Denied
**Error:** `new row violates row-level security policy`

**Solution:** Ensure the user is authenticated and has proper permissions

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Review the error messages in Supabase logs
3. Verify environment variables are set correctly
4. Test with mock data first

## 🎉 Summary

This implementation provides a complete, production-ready intelligent maintenance management system with:
- ✅ 2 database tables with RLS
- ✅ 2 Supabase Edge Functions
- ✅ AI-powered decision support
- ✅ Comprehensive documentation
- ✅ Security and performance optimizations

---

**Version:** 1.0.0  
**Last Updated:** October 14, 2025  
**Status:** Production Ready ✅
