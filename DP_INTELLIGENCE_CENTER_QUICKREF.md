# DP Intelligence Center - Quick Reference

## 🎯 What Was Created

### 1. Database Table: `dp_incidents`
**Migration:** `supabase/migrations/20251014195300_create_dp_incidents_table.sql`

Stores DP incident data from IMCA and other sources.

**Key Fields:**
- `id`: Incident identifier (e.g., "imca-2025-014")
- `title`: Brief incident description
- `incident_date`: When it occurred
- `vessel`, `location`: Where it happened
- `class_dp`: DP Class (2 or 3)
- `root_cause`: Root cause analysis
- `tags`: Searchable keywords array
- `severity`: Incident severity (Critical/High/Medium/Low)
- `status`: Analysis status (analyzed/pending)
- `ai_analysis`: JSONB field for AI analysis results

### 2. AI Analysis Function: `dp-intel-analyze`
**Function:** `supabase/functions/dp-intel-analyze/index.ts`

OpenAI GPT-4 powered analysis generating structured incident analysis with:
- Technical Summary
- Related Standards (IMCA/IMO/PEO-DP)
- Additional Root Causes
- Preventive Recommendations
- Corrective Actions

### 3. Frontend Components

**Main Component:** `src/components/dp-intelligence/dp-intelligence-center.tsx`
- Statistics Dashboard (Total, Critical, Analyzed, Pending)
- Advanced Filtering (DP class, status, search)
- Incident Cards with severity badges
- AI Analysis Modal with tabbed interface
- Real-time updates after analysis

**Page Component:** `src/pages/DPIntelligence.tsx`
- Integrated with ModulePageWrapper
- Route: `/dp-intelligence`
- Full-featured interface for incident management and AI analysis

## 🚀 Quick Start

### Deploy Migration
```bash
supabase db push
```

### Deploy Function
```bash
supabase functions deploy dp-intel-feed
```

### Test API
```bash
# Local testing
curl http://localhost:54321/functions/v1/dp-intel-feed

# Production
curl https://YOUR_PROJECT.supabase.co/functions/v1/dp-intel-feed
```

### Query Database
```sql
-- Get recent incidents
SELECT id, title, incident_date, class_dp, location
FROM public.dp_incidents
ORDER BY incident_date DESC
LIMIT 10;

-- Search by tag
SELECT * FROM public.dp_incidents
WHERE 'gyro' = ANY(tags);

-- Filter by DP class
SELECT * FROM public.dp_incidents
WHERE class_dp = 'DP Class 3';
```

## 📊 Sample Data

The API currently returns 5 mock incidents:

1. **Loss of Position Due to Gyro Drift** (Campos Basin, DP Class 2)
2. **Thruster Control Software Failure** (North Sea, DP Class 3)
3. **Reference System Failure in Heavy Weather** (Gulf of Mexico, DP Class 3)
4. **Power Management System Malfunction** (Santos Basin, DP Class 2)
5. **Wind Sensor Calibration Issue** (West Africa, DP Class 2)

## 📝 Next Steps

### Immediate (Phase 2)
- [ ] Replace mock data with real IMCA API/crawler
- [ ] Add data validation and deduplication
- [ ] Schedule automated updates

### Short-term (Phase 3)
- [ ] Build React components for visualization
- [ ] Add filtering and search UI
- [ ] Create incident timeline view

### Long-term (Phase 4-5)
- [ ] Implement AI semantic search with embeddings
- [ ] Create chatbot for incident queries
- [ ] Build predictive analytics dashboard

## 🔗 Integration Points

### Frontend Components to Create
```typescript
// Example: DP Incidents List Component
import { supabase } from '@/integrations/supabase/client';

const DPIncidentsList = () => {
  const [incidents, setIncidents] = useState([]);
  
  useEffect(() => {
    const fetchIncidents = async () => {
      const { data } = await supabase
        .from('dp_incidents')
        .select('*')
        .order('incident_date', { ascending: false });
      setIncidents(data);
    };
    fetchIncidents();
  }, []);
  
  // Render incident cards...
};
```

### API Usage
```typescript
// Fetch from Edge Function
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/dp-intel-feed`
);
const { incidents, meta } = await response.json();
```

## 📚 Documentation

**Full Documentation:** See `DP_INTELLIGENCE_CENTER_IMPLEMENTATION.md`

**Related Modules:**
- PEOTRAM (Emergency Response)
- SGSO (Safety Management)
- Maritime Checklists (DP Operations)

## 🔐 Security

- ✅ RLS enabled on `dp_incidents` table
- ✅ Authenticated users can read
- ✅ Service role can write (API ingestion)
- ✅ CORS configured for frontend access

## 📦 Files Created

```
supabase/
├── functions/
│   └── dp-intel-feed/
│       └── index.ts                          (121 lines)
└── migrations/
    └── 20251014195300_create_dp_incidents_table.sql   (61 lines)

DP_INTELLIGENCE_CENTER_IMPLEMENTATION.md      (171 lines)
DP_INTELLIGENCE_CENTER_QUICKREF.md            (this file)
```

## ✅ Status

- [x] Database schema created
- [x] API mock endpoint created
- [x] Sample data added
- [x] Documentation written
- [ ] Production deployment
- [ ] Frontend UI components
- [ ] Real data integration

---

**Version:** 1.0.0  
**Created:** October 14, 2025  
**Status:** ✅ Implementation Complete (Mock Phase)
