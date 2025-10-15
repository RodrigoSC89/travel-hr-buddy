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

### 2. API Endpoint: `dp-intel-feed`
**Function:** `supabase/functions/dp-intel-feed/index.ts`

Queries the `dp_incidents` database table with filtering support.

**Query Parameters:**
- `limit`: Maximum number of results (default: 50)
- `class_dp`: Filter by DP class (e.g., "DP Class 2")
- `source`: Filter by source organization (e.g., "IMCA")
- `tag`: Filter by tag (e.g., "gyro", "thruster")

### 3. Analysis Storage: `incident_analysis`
**Migration:** `supabase/migrations/20251014195400_create_incident_analysis_table.sql`

Stores AI-powered analysis results from the `dp-intel-analyze` function.

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

# With filters
curl "http://localhost:54321/functions/v1/dp-intel-feed?class_dp=DP%20Class%202&limit=10"

# Production
curl https://YOUR_PROJECT.supabase.co/functions/v1/dp-intel-feed

# Production with filters
curl "https://YOUR_PROJECT.supabase.co/functions/v1/dp-intel-feed?tag=gyro&limit=5"
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

The migration includes 5 sample incidents in the database:

1. **Loss of Position Due to Gyro Drift** (Campos Basin, DP Class 2)
2. **Thruster Control Software Failure** (North Sea, DP Class 3)
3. **Reference System Failure in Heavy Weather** (Gulf of Mexico, DP Class 3)
4. **Power Management System Malfunction** (Santos Basin, DP Class 2)
5. **Wind Sensor Calibration Issue** (West Africa, DP Class 2)

These are automatically inserted during migration and can be queried via the API.

## 📝 Next Steps

### Immediate (Phase 2)
- [ ] Implement real IMCA API/crawler integration
- [ ] Add data validation and deduplication
- [ ] Schedule automated updates via cron jobs

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
