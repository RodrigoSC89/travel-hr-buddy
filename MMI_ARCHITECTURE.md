# MMI Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MMI - MÓDULO DE                             │
│                    MANUTENÇÃO INTELIGENTE                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND LAYER                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────┐ │
│  │  MMI Page          │  │ Central Jobs       │  │ Maintenance  │ │
│  │  /mmi              │  │ Dashboard          │  │ Copilot      │ │
│  │                    │  │                    │  │              │ │
│  │ • Overview         │  │ • Stats Cards      │  │ • Chat UI    │ │
│  │ • Feature Cards    │  │ • Filter Panel     │  │ • Quick Acts │ │
│  │ • Tabs (3)         │  │ • Jobs List        │  │ • AI Suggest │ │
│  │ • Navigation       │  │ • Search           │  │ • Voice In   │ │
│  └────────────────────┘  └────────────────────┘  └──────────────┘ │
│                                                                      │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               │ React Components
                               │ TypeScript
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐  ┌────────────┐  ┌─────────┐  ┌──────────────────┐ │
│  │ Assets   │  │ Components │  │  Jobs   │  │ Service Orders   │ │
│  │ Service  │  │  Service   │  │ Service │  │    Service       │ │
│  └──────────┘  └────────────┘  └─────────┘  └──────────────────┘ │
│                                                                      │
│  ┌──────────┐  ┌────────────┐  ┌─────────────────────────────────┐ │
│  │ History  │  │ Hour Meters│  │      Dashboard                  │ │
│  │ Service  │  │  Service   │  │      Service                    │ │
│  └──────────┘  └────────────┘  └─────────────────────────────────┘ │
│                                                                      │
│  • CRUD Operations            • Filtering & Sorting                │
│  • Data Aggregation           • Statistics Computation             │
│  • Relationship Queries       • Type-safe API                      │
│                                                                      │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               │ Supabase Client
                               │ REST API / RLS
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER (Supabase)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐         ┌──────────────────┐                     │
│  │  mmi_assets  │────────▶│ mmi_components   │                     │
│  │              │         │                  │                     │
│  │ • id         │         │ • id             │                     │
│  │ • name       │         │ • asset_id (FK)  │                     │
│  │ • code       │         │ • name           │                     │
│  │ • vessel     │         │ • type           │                     │
│  │ • critical   │         │ • serial_number  │                     │
│  └──────────────┘         └─────────┬────────┘                     │
│                                     │                               │
│                                     │                               │
│                           ┌─────────▼──────────┐                   │
│                           │    mmi_jobs        │                   │
│                           │                    │                   │
│                           │ • id               │                   │
│                           │ • component_id(FK) │                   │
│                           │ • title            │                   │
│                           │ • status           │                   │
│                           │ • priority         │                   │
│                           │ • suggestion_ia    │                   │
│                           └─────┬──────────────┘                   │
│                                 │                                   │
│                    ┌────────────┼────────────┐                     │
│                    │            │            │                     │
│         ┌──────────▼────┐  ┌───▼──────┐  ┌─▼──────────┐          │
│         │  mmi_os       │  │ mmi_hist │  │ mmi_hours  │          │
│         │               │  │          │  │            │          │
│         │ • id          │  │ • id     │  │ • id       │          │
│         │ • job_id (FK) │  │ • comp_id│  │ • comp_id  │          │
│         │ • status      │  │ • event  │  │ • value    │          │
│         │ • opened_by   │  │ • desc   │  │ • source   │          │
│         └───────────────┘  └──────────┘  └────────────┘          │
│                                                                      │
│  Features:                                                          │
│  • Row Level Security (RLS) on all tables                          │
│  • Automatic timestamps with triggers                              │
│  • Indexes for performance                                         │
│  • Foreign key relationships                                       │
│  • Cascade delete and set null policies                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         TYPE LAYER                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  TypeScript Definitions (src/types/mmi/index.ts)                   │
│                                                                      │
│  • MMIAsset              • MMIComponent        • MMIJob            │
│  • MMIServiceOrder       • MMIHistory          • MMIHourMeter      │
│  • MMIJobExtended        • MMIDashboardStats   • MMIJobFilters     │
│  • MMIAISuggestion       • MMIAssetHealth                          │
│                                                                      │
│  Enums:                                                             │
│  • JobStatus             • JobPriority         • ServiceOrderStatus│
│  • EventType             • HourMeterSource     • ComponentType     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    INTEGRATION POINTS                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ IoT Sensors  │  │ Fleet Mgmt   │  │  Checklists  │             │
│  │              │  │              │  │              │             │
│  │ • Real-time  │  │ • Vessels    │  │ • Procedures │             │
│  │ • Telemetry  │  │ • Assets     │  │ • Inspections│             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  Inventory   │  │     OCR      │  │  Mobile App  │             │
│  │              │  │              │  │              │             │
│  │ • Parts      │  │ • Hour Meters│  │ • Technicians│             │
│  │ • Materials  │  │ • Documents  │  │ • Offline    │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. User Access → /mmi route                                        │
│  2. Page renders → Loads MMI components                             │
│  3. Components call → Service layer                                 │
│  4. Services query → Supabase (with RLS)                            │
│  5. Data returns → Through services to components                   │
│  6. UI updates → Real-time display                                  │
│                                                                      │
│  AI Copilot Flow:                                                   │
│  1. User message → Copilot component                                │
│  2. Process input → Generate response                               │
│  3. Query services → Get relevant data                              │
│  4. AI suggestions → Display with actions                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      MODULE STRUCTURE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  src/                                                               │
│  ├── modules/mmi/                                                   │
│  │   ├── components/                                                │
│  │   │   ├── MMICentralJobsDashboard.tsx  (11KB)                   │
│  │   │   └── MMIMaintenanceCopilot.tsx    (12KB)                   │
│  │   ├── services/                                                  │
│  │   │   └── mmiService.ts                (12KB)                   │
│  │   ├── hooks/                           (ready)                  │
│  │   ├── index.ts                         (exports)                │
│  │   └── README.md                        (6KB)                    │
│  │                                                                   │
│  ├── types/mmi/                                                     │
│  │   └── index.ts                         (4KB)                    │
│  │                                                                   │
│  └── pages/                                                         │
│      └── MMI.tsx                          (18KB)                   │
│                                                                      │
│  supabase/migrations/                                               │
│  └── 20251014214016_create_mmi_schema.sql (8KB)                    │
│                                                                      │
│  Documentation:                                                     │
│  ├── MMI_IMPLEMENTATION_COMPLETE.md      (12KB)                    │
│  └── MMI_QUICKREF.md                     (2KB)                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        KEY FEATURES                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ✅ Central Jobs Management     ✅ AI-Powered Copilot               │
│  ✅ Service Order Workflow      ✅ Technical History                │
│  ✅ Hour Meter Tracking         ✅ Predictive Analysis (ready)      │
│  ✅ Dashboard Statistics        ✅ Filtering & Search               │
│  ✅ Priority Management         ✅ Status Tracking                  │
│  ✅ Component Relationships     ✅ Asset Management                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         SECURITY                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  • All tables have RLS enabled                                      │
│  • Authenticated users only                                         │
│  • View, Insert, Update policies configured                         │
│  • Audit trails with created_by and timestamps                      │
│  • Foreign key constraints enforce referential integrity            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

Status: ✅ Production Ready
Version: 1.0.0
Route: /mmi
```
