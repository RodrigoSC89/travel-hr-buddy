# IMCA Crawler - Quick Reference

## 🚀 Quick Start

### Run Manually
```bash
npm run crawler:imca
```

### Environment Setup
```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📁 Files

| File | Purpose |
|------|---------|
| `scripts/imca-crawler.ts` | Local crawler script (Node.js) |
| `supabase/functions/imca-crawler-cron/index.ts` | Edge Function for automation |
| `supabase/migrations/20251020000000_add_link_original_and_sistema_afetado_to_dp_incidents.sql` | Database migration |

## 🔧 Commands

```bash
# Install dependencies
npm install

# Run crawler locally
npm run crawler:imca

# Deploy Edge Function
supabase functions deploy imca-crawler-cron

# Test Edge Function
curl -X POST 'https://your-project.supabase.co/functions/v1/imca-crawler-cron' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

## 📊 Data Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | TEXT | Incident title |
| `link_original` | TEXT | Original IMCA URL |
| `incident_date` | TIMESTAMP | Date of incident |
| `description` | TEXT | Incident description |
| `sistema_afetado` | TEXT | Affected system (optional) |
| `tags` | TEXT[] | `['imca', 'crawler']` |
| `vessel` | TEXT | Vessel name (default: "Unknown") |
| `severity` | TEXT | Severity (default: "Média") |
| `status` | TEXT | Status (default: "pending") |

## 🔄 Cron Schedule

```sql
-- Every Monday at 09:00 UTC
'0 9 * * 1'
```

## 🎯 Key Features

- ✅ Automatic duplicate detection via `link_original`
- ✅ Error resilience - continues on failure
- ✅ Auto-tagging with `['imca', 'crawler']`
- ✅ Date parsing with fallback
- ✅ Detailed logging

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Missing credentials | Set `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` |
| Timeout | Check internet connection and firewall |
| No incidents found | IMCA website structure may have changed |
| Duplicates | Ensure `idx_dp_incidents_link_original` index exists |

## 📍 URLs

- **IMCA Source**: https://www.imca-int.com/safety-events/
- **View Results**: `/dp-intelligence` (Incidents tab)

## 📝 Output Example

```
🚀 Starting IMCA Crawler...
🌐 Fetching IMCA safety events...
✅ Found 15 incidents on IMCA website
💾 Saving incidents to database...
🆕 New incident saved: Loss of Position Due to Gyro Drift
⏭️  Already exists: Thruster Control Software Failure

📊 Summary:
   Total found: 15
   New saved: 8
   Duplicates skipped: 7
   Errors: 0

✅ IMCA Crawler completed successfully!
```

## 🔐 Security Notes

- Use Service Role Key for crawler (server-side only)
- Never expose Service Role Key in client code
- Store credentials in environment variables

---

**Quick Access**: `npm run crawler:imca`
