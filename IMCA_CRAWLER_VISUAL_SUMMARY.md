# 🕸️ IMCA Crawler - Visual Summary

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      IMCA CRAWLER SYSTEM                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐      ┌──────────────────┐      ┌─────────────┐
│  IMCA Website    │      │  Crawler Script  │      │  Supabase   │
│  safety-events/  │─────▶│  (Node.js/Deno)  │─────▶│  Database   │
│                  │      │                  │      │ dp_incidents│
└──────────────────┘      └──────────────────┘      └─────────────┘
                                   │
                                   │
                                   ▼
                          ┌─────────────────┐
                          │  DP Intelligence│
                          │  Dashboard UI   │
                          │  /dp-intelligence│
                          └─────────────────┘
```

## 🔄 Execution Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. FETCH INCIDENTS                                          │
├─────────────────────────────────────────────────────────────┤
│  • GET https://www.imca-int.com/safety-events/             │
│  • Parse HTML with Cheerio                                  │
│  • Extract: title, link, date                               │
│  • Convert date to ISO format                               │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CHECK FOR DUPLICATES                                     │
├─────────────────────────────────────────────────────────────┤
│  • Query dp_incidents by link_original                      │
│  • If exists → Skip (duplicate)                             │
│  • If not exists → Continue to insert                       │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. INSERT NEW INCIDENTS                                     │
├─────────────────────────────────────────────────────────────┤
│  • Insert into dp_incidents table                           │
│  • Fields: title, description, link_original,               │
│            incident_date, severity, vessel, tags            │
│  • Tag with ['imca', 'crawler']                             │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. REPORT RESULTS                                           │
├─────────────────────────────────────────────────────────────┤
│  • Log summary: total found, new, duplicates                │
│  • Return JSON response (Edge Function)                     │
│  • Display in console (Local Script)                        │
└─────────────────────────────────────────────────────────────┘
```

## 🗂️ Database Schema

```sql
TABLE: dp_incidents
├── id (UUID, PRIMARY KEY)
├── title (TEXT) ◀──────────────┐
├── description (TEXT)          │
├── link_original (TEXT) ◀──────┼── NEW FIELDS (Etapa 11)
├── sistema_afetado (TEXT)      │
├── incident_date (TIMESTAMP) ◀─┘
├── severity (TEXT) ── Alta, Média, Baixa
├── vessel (TEXT)
├── status (TEXT) ── pending, analyzed
├── tags (TEXT[]) ── ['imca', 'crawler']
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## 📁 Project Structure

```
travel-hr-buddy/
│
├── scripts/
│   └── imca-crawler.ts ◀───────── Node.js crawler script
│
├── supabase/
│   ├── migrations/
│   │   └── 20251020000000_add_crawler_fields_to_dp_incidents.sql
│   │
│   └── functions/
│       ├── cron.yaml ◀────────── Cron schedule configuration
│       └── imca-crawler-cron/
│           └── index.ts ◀──────── Deno Edge Function
│
├── src/
│   ├── pages/
│   │   └── DPIntelligence.tsx ◀─ UI Page
│   │
│   └── components/
│       └── dp-intelligence/
│           ├── dp-intelligence-center.tsx ◀─ Incidents List
│           └── DPIntelligenceDashboard.tsx ◀ Analytics Charts
│
├── .env.example ◀──────────────── Environment variables template
├── IMCA_CRAWLER_README.md ◀────── Main documentation
└── IMCA_CRAWLER_TESTING_GUIDE.md ◀ Testing guide
```

## 🚀 Execution Options

### Option 1: Manual Local Execution

```bash
npm run crawler:imca
```

**When to use**: 
- Manual testing
- On-demand updates
- Development/debugging

**Requirements**:
- Node.js 22.x
- `.env.local` file with credentials

---

### Option 2: Automated Cron (Edge Function)

```yaml
schedule: '0 9 * * 1'  # Every Monday at 09:00 UTC
```

**When to use**:
- Production environment
- Automated weekly updates
- Scheduled maintenance

**Requirements**:
- Supabase project with Edge Functions enabled
- Function deployed: `supabase functions deploy imca-crawler-cron`

---

### Option 3: Manual Edge Function Trigger

```bash
curl -X POST "https://project.supabase.co/functions/v1/imca-crawler-cron"
```

**When to use**:
- Testing in production
- Immediate update needed
- Debugging deployed function

## 🎯 Key Features

### ✅ Duplicate Prevention

```typescript
// Check before insert
const { data: existing } = await supabase
  .from('dp_incidents')
  .select('id')
  .eq('link_original', incident.link_original)
  .maybeSingle();

if (existing) {
  console.log(`⏭️  Already exists: ${incident.title}`);
  continue; // Skip insertion
}
```

### ✅ Error Handling

```typescript
try {
  // Crawl and insert
} catch (error) {
  console.error('❌ Error:', error);
  // Continue processing other incidents
}
```

### ✅ Date Parsing with Fallback

```typescript
try {
  incidentDate = new Date(dateText);
  if (isNaN(incidentDate.getTime())) {
    incidentDate = new Date(); // Fallback to current date
  }
} catch (error) {
  incidentDate = new Date(); // Fallback
}
```

## 📊 Data Flow Example

### Input (IMCA Website)

```html
<div class="news-list__item">
  <h3 class="news-list__title">Loss of Position Due to Gyro Drift</h3>
  <a href="/safety-events/2024/loss-of-position">View details</a>
  <span class="news-list__date">15 October 2024</span>
</div>
```

### Processing (Crawler)

```typescript
{
  title: "Loss of Position Due to Gyro Drift",
  link_original: "https://www.imca-int.com/safety-events/2024/loss-of-position",
  incident_date: "2024-10-15T00:00:00.000Z"
}
```

### Output (Database)

```sql
INSERT INTO dp_incidents (
  title,
  link_original,
  incident_date,
  severity,
  vessel,
  status,
  tags
) VALUES (
  'Loss of Position Due to Gyro Drift',
  'https://www.imca-int.com/safety-events/2024/loss-of-position',
  '2024-10-15T00:00:00.000Z',
  'Média',
  'Unknown',
  'pending',
  ARRAY['imca', 'crawler']
);
```

### Display (UI)

```
┌──────────────────────────────────────────────────────────┐
│ 🚨 Loss of Position Due to Gyro Drift                   │
├──────────────────────────────────────────────────────────┤
│ 📅 Date: 15/10/2024                                      │
│ ⚠️  Severity: Média                                      │
│ 🚢 Vessel: Unknown                                       │
│ 🏷️  Tags: imca, crawler                                  │
│                                                          │
│ 🔗 Source: https://www.imca-int.com/safety-events/...   │
│                                                          │
│ [View Details] [AI Analysis] [Create Action Plan]       │
└──────────────────────────────────────────────────────────┘
```

## ⏱️ Cron Schedule Visualization

```
Monday     Tuesday    Wednesday  Thursday   Friday     Saturday   Sunday
  09:00
  ⬇️ RUN
  crawler
```

**Rationale**: 
- Weekly execution to capture new incidents
- Monday morning allows review of weekend updates
- 09:00 UTC = Early morning in most time zones

## 🔐 Security Model

```
┌──────────────────────────────────────────────────────┐
│ AUTHENTICATION                                       │
├──────────────────────────────────────────────────────┤
│ • Local Script: Uses SUPABASE_SERVICE_ROLE_KEY      │
│ • Edge Function: Automatic (Supabase internal)      │
│ • Bypasses RLS for server-side operations           │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ AUTHORIZATION                                        │
├──────────────────────────────────────────────────────┤
│ • Service Role Key has full database access          │
│ • Only server-side components should use it          │
│ • Never expose in client-side code                   │
└──────────────────────────────────────────────────────┘
```

## 📈 Success Metrics

```
┌─────────────────────────────────────────────────────┐
│ CRAWLER EXECUTION SUMMARY                           │
├─────────────────────────────────────────────────────┤
│ Total Incidents Found:    15 ████████████████████   │
│ New Incidents Saved:       8 ████████░░░░░░░░░░░   │
│ Duplicates Skipped:        7 ███████░░░░░░░░░░░░   │
│                                                     │
│ Execution Time:         12.3s ████████████░░░░░░   │
│ Success Rate:            100% ████████████████████  │
└─────────────────────────────────────────────────────┘
```

## 🎨 UI Integration

### Before Crawler

```
┌────────────────────────────────────┐
│ DP Intelligence Center             │
├────────────────────────────────────┤
│ Incidents (6)                      │
│ └─ Manual entries only             │
│                                    │
│ Last Update: 2 weeks ago           │
└────────────────────────────────────┘
```

### After Crawler

```
┌────────────────────────────────────┐
│ DP Intelligence Center             │
├────────────────────────────────────┤
│ Incidents (14) ← 8 new!            │
│ ├─ Manual entries (6)              │
│ └─ IMCA crawler (8) 🆕             │
│                                    │
│ Last Update: Today 09:00 UTC       │
│ Auto-update: Weekly (Monday)       │
└────────────────────────────────────┘
```

## 🔧 Environment Variables

```bash
# Required for Local Script
VITE_SUPABASE_URL=https://project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Required for Edge Function (set via Supabase Dashboard)
SUPABASE_URL=https://project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## 🚦 Status Indicators

| Indicator | Meaning | Action Required |
|-----------|---------|-----------------|
| 🆕 | New incident saved | ✅ None |
| ⏭️ | Duplicate skipped | ✅ None |
| ⚠️ | Warning (date parse) | ⚠️ Review logs |
| ❌ | Error occurred | 🔴 Investigate |

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Run crawler locally | `npm run crawler:imca` |
| Deploy Edge Function | `supabase functions deploy imca-crawler-cron` |
| View function logs | `supabase functions logs imca-crawler-cron` |
| Test Edge Function | `curl -X POST "https://...supabase.co/functions/v1/imca-crawler-cron"` |
| View incidents in UI | Navigate to `/dp-intelligence` |
| Query database | `SELECT * FROM dp_incidents WHERE 'crawler' = ANY(tags)` |

---

**🚢 Developed for Travel HR Buddy - Sistema Náutico Inteligente**
