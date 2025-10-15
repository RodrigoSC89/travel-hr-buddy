# MMI Jobs API - Visual Summary

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     MMI Jobs API Architecture                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌────────────────────────────────────────┐
│              │         │     Supabase Edge Functions            │
│   Client     │────────▶│                                        │
│  (Browser/   │         │  ┌──────────────────────────────────┐  │
│   Mobile)    │         │  │  mmi-job-postpone                │  │
│              │         │  │  - Evaluate postponement         │  │
└──────────────┘         │  │  - OpenAI GPT-4 integration      │  │
                         │  │  - Retry logic                    │  │
                         │  └──────────────────────────────────┘  │
                         │                                        │
                         │  ┌──────────────────────────────────┐  │
                         │  │  mmi-os-create                   │  │
                         │  │  - Create work orders            │  │
                         │  │  - Link to jobs                  │  │
                         │  │  - Validate data                 │  │
                         │  └──────────────────────────────────┘  │
                         └────────────────────────────────────────┘
                                        │
                                        ▼
                         ┌────────────────────────────────────────┐
                         │       PostgreSQL Database              │
                         │                                        │
                         │  ┌──────────────┐  ┌──────────────┐   │
                         │  │  mmi_jobs    │  │   mmi_os     │   │
                         │  │              │  │              │   │
                         │  │ - title      │──│ - job_id     │   │
                         │  │ - component  │  │ - opened_by  │   │
                         │  │ - usage_hrs  │  │ - status     │   │
                         │  │ - avg_usage  │  │ - notes      │   │
                         │  │ - stock      │  │              │   │
                         │  │ - mission_   │  │              │   │
                         │  │   active     │  │              │   │
                         │  └──────────────┘  └──────────────┘   │
                         └────────────────────────────────────────┘
                                        │
                                        ▼
                         ┌────────────────────────────────────────┐
                         │         OpenAI GPT-4 API               │
                         │   (Maintenance Risk Evaluation)        │
                         └────────────────────────────────────────┘
```

## 🗂️ Database Schema

### mmi_jobs Table
```sql
┌─────────────────┬──────────────┬─────────────────────────────┐
│ Column          │ Type         │ Description                 │
├─────────────────┼──────────────┼─────────────────────────────┤
│ id              │ UUID         │ Primary key                 │
│ title           │ TEXT         │ Job title                   │
│ component       │ TEXT         │ Equipment component         │
│ usage_hours     │ INTEGER      │ Current usage (hours)       │
│ avg_usage       │ INTEGER      │ Historical average          │
│ stock           │ BOOLEAN      │ Parts in stock              │
│ mission_active  │ BOOLEAN      │ Active mission flag         │
│ history         │ TEXT         │ Maintenance notes           │
│ created_by      │ UUID (FK)    │ User reference              │
│ created_at      │ TIMESTAMP    │ Creation time               │
│ updated_at      │ TIMESTAMP    │ Last update time            │
└─────────────────┴──────────────┴─────────────────────────────┘
```

### mmi_os Table
```sql
┌─────────────────┬──────────────┬─────────────────────────────┐
│ Column          │ Type         │ Description                 │
├─────────────────┼──────────────┼─────────────────────────────┤
│ id              │ UUID         │ Primary key                 │
│ job_id          │ UUID (FK)    │ Links to mmi_jobs           │
│ opened_by       │ UUID (FK)    │ User reference              │
│ status          │ TEXT         │ open/in_progress/completed  │
│ notes           │ TEXT         │ Optional notes              │
│ completed_at    │ TIMESTAMP    │ Completion timestamp        │
│ created_at      │ TIMESTAMP    │ Creation time               │
│ updated_at      │ TIMESTAMP    │ Last update time            │
└─────────────────┴──────────────┴─────────────────────────────┘
```

## 🔄 API Flow Diagrams

### Flow 1: Evaluate Job Postponement

```
Client                Edge Function           OpenAI API          Database
  │                         │                      │                 │
  │  POST /postpone/{id}    │                      │                 │
  ├────────────────────────▶│                      │                 │
  │                         │                      │                 │
  │                         │  Query job           │                 │
  │                         ├──────────────────────┼────────────────▶│
  │                         │                      │                 │
  │                         │◀─────────────────────┼─────────────────┤
  │                         │  Job data (or mock)  │                 │
  │                         │                      │                 │
  │                         │  Evaluate risk       │                 │
  │                         ├─────────────────────▶│                 │
  │                         │                      │                 │
  │                         │◀─────────────────────┤                 │
  │                         │  AI recommendation   │                 │
  │                         │                      │                 │
  │  ✅/❌ Result           │                      │                 │
  │◀────────────────────────┤                      │                 │
  │                         │                      │                 │
```

### Flow 2: Create Work Order

```
Client                Edge Function                    Database
  │                         │                              │
  │  POST /os/create        │                              │
  ├────────────────────────▶│                              │
  │  { jobId: "..." }       │                              │
  │                         │                              │
  │                         │  Validate job exists         │
  │                         ├─────────────────────────────▶│
  │                         │                              │
  │                         │◀─────────────────────────────┤
  │                         │  Job data                    │
  │                         │                              │
  │                         │  Insert work order (OS)      │
  │                         ├─────────────────────────────▶│
  │                         │                              │
  │                         │◀─────────────────────────────┤
  │                         │  OS created                  │
  │                         │                              │
  │  { os_id, status }      │                              │
  │◀────────────────────────┤                              │
  │                         │                              │
```

## 📋 Implementation Checklist

### ✅ Database Layer
- [x] Create `mmi_jobs` table with all required fields
- [x] Create `mmi_os` table with foreign key relationship
- [x] Add Row Level Security policies
- [x] Create indexes for performance
- [x] Add auto-update triggers for `updated_at`

### ✅ Edge Functions
- [x] `mmi-job-postpone` with OpenAI integration
- [x] `mmi-os-create` with database operations
- [x] CORS support
- [x] Error handling
- [x] Retry logic with exponential backoff
- [x] Request timeout (30 seconds)

### ✅ Documentation
- [x] Full implementation guide
- [x] Quick reference
- [x] Visual summary
- [x] API examples
- [x] Testing instructions

## 🎯 Key Features

```
┌────────────────────────────────────────────────────────────────┐
│                     Feature Highlights                          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🤖 AI-Powered Risk Evaluation                                 │
│     → GPT-4 analyzes maintenance data                          │
│     → Considers usage, stock, and mission status               │
│     → Returns clear ✅/❌ recommendation                        │
│                                                                 │
│  🔄 Robust Retry Logic                                         │
│     → Max 3 retry attempts                                     │
│     → Exponential backoff with jitter                          │
│     → Handles rate limits & network errors                     │
│                                                                 │
│  🔒 Security First                                             │
│     → Row Level Security enabled                               │
│     → User-based access control                                │
│     → Protected by Supabase Auth                               │
│                                                                 │
│  ⚡ Performance Optimized                                      │
│     → Database indexes on key fields                           │
│     → 30-second request timeout                                │
│     → Efficient query patterns                                 │
│                                                                 │
│  📊 Complete Workflow                                          │
│     → Create maintenance jobs                                  │
│     → Evaluate postponement risk                               │
│     → Auto-create work orders                                  │
│     → Track completion status                                  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

## 🚀 Example Workflow

```
Step 1: Create Maintenance Job
┌────────────────────────────────────────────────────────────────┐
│ POST /rest/v1/mmi_jobs                                         │
│                                                                 │
│ {                                                               │
│   "title": "Troca de filtro hidráulico",                      │
│   "component": "Bomba hidráulica popa",                       │
│   "usage_hours": 241,                                          │
│   "avg_usage": 260,                                            │
│   "stock": true,                                               │
│   "mission_active": true,                                      │
│   "history": "3 trocas nos últimos 90 dias"                   │
│ }                                                               │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
Step 2: Evaluate Postponement
┌────────────────────────────────────────────────────────────────┐
│ POST /functions/v1/mmi-job-postpone/{jobId}/postpone          │
│                                                                 │
│ Response:                                                       │
│ {                                                               │
│   "message": "❌ Não é recomendável postergar",               │
│   "jobId": "uuid-here",                                        │
│   "timestamp": "2025-10-14T21:53:00.000Z"                     │
│ }                                                               │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
Step 3: Create Work Order
┌────────────────────────────────────────────────────────────────┐
│ POST /functions/v1/mmi-os-create                              │
│                                                                 │
│ { "jobId": "uuid-here" }                                       │
│                                                                 │
│ Response:                                                       │
│ {                                                               │
│   "message": "OS criada com sucesso",                         │
│   "os_id": "new-uuid",                                         │
│   "job_id": "uuid-here",                                       │
│   "status": "open"                                             │
│ }                                                               │
└────────────────────────────────────────────────────────────────┘
```

## 📈 Benefits

| Benefit | Description |
|---------|-------------|
| 🎯 **Intelligent Decision Making** | AI-powered risk assessment for maintenance postponement |
| ⚡ **Fast Response** | Edge functions provide low-latency responses |
| 🔒 **Secure** | RLS policies ensure data protection |
| 🔄 **Reliable** | Automatic retries handle transient failures |
| 📊 **Trackable** | Complete audit trail of jobs and work orders |
| 🌐 **Scalable** | Serverless architecture scales automatically |
| 🛠️ **Maintainable** | Clear separation of concerns |

## 📁 File Structure

```
supabase/
├── migrations/
│   ├── 20251014215400_create_mmi_jobs_table.sql
│   │   ├── Creates mmi_jobs table
│   │   ├── Adds RLS policies
│   │   ├── Creates indexes
│   │   └── Adds update trigger
│   │
│   └── 20251014215500_create_mmi_os_table.sql
│       ├── Creates mmi_os table
│       ├── Adds foreign key to mmi_jobs
│       ├── Adds RLS policies
│       ├── Creates indexes
│       └── Adds update trigger
│
└── functions/
    ├── mmi-job-postpone/
    │   └── index.ts
    │       ├── OpenAI GPT-4 integration
    │       ├── Retry logic
    │       ├── Error handling
    │       └── Mock data fallback
    │
    └── mmi-os-create/
        └── index.ts
            ├── Database operations
            ├── Job validation
            ├── Work order creation
            └── Error handling
```

## 🎉 Success Metrics

✅ **2 Database Tables** created with complete schema
✅ **2 Edge Functions** deployed with AI integration
✅ **8 RLS Policies** protecting data access
✅ **6 Database Indexes** optimizing queries
✅ **2 Update Triggers** maintaining timestamps
✅ **3 Documentation Files** for reference

---

*Visual Summary - MMI Jobs API*
*Implementation Date: 2025-10-14*
*Status: ✅ Complete*
