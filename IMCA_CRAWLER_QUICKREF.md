# 🕸️ IMCA Crawler - Quick Reference

## 🚀 Quick Start

```bash
# 1. Install dependencies (already done)
npm install

# 2. Set environment variables in .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# 3. Run crawler
npm run crawler:imca
```

## 📝 Commands

| Command | Description |
|---------|-------------|
| `npm run crawler:imca` | Run crawler locally |
| `npx tsx scripts/imca-crawler.ts` | Alternative local run |
| `supabase functions deploy imca-crawler-cron` | Deploy Edge Function |
| `supabase functions logs imca-crawler-cron` | View function logs |

## 📁 Key Files

| File | Purpose |
|------|---------|
| `scripts/imca-crawler.ts` | Node.js crawler script |
| `supabase/functions/imca-crawler-cron/index.ts` | Deno Edge Function |
| `supabase/functions/cron.yaml` | Cron schedule config |
| `supabase/migrations/20251020000000_add_crawler_fields_to_dp_incidents.sql` | Database migration |
| `IMCA_CRAWLER_README.md` | Full documentation |
| `IMCA_CRAWLER_TESTING_GUIDE.md` | Testing guide |
| `IMCA_CRAWLER_VISUAL_SUMMARY.md` | Visual architecture |

## 🔧 Environment Variables

```bash
# Local Script (.env.local)
VITE_SUPABASE_URL=https://project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Edge Function (Supabase Dashboard → Settings → Edge Functions → Secrets)
SUPABASE_URL=https://project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## 🗂️ Database Schema

```sql
-- New fields added by migration
ALTER TABLE dp_incidents ADD COLUMN link_original TEXT;
ALTER TABLE dp_incidents ADD COLUMN sistema_afetado TEXT;

-- Existing fields used
- title (titulo)
- description (descricao)
- incident_date (data_incidente)
- severity (gravidade)
- vessel
- status
- tags
```

## ⏱️ Cron Schedule

```yaml
schedule: '0 9 * * 1'  # Every Monday at 09:00 UTC
```

**Timezone**: UTC  
**Frequency**: Weekly (Mondays)  
**Time**: 09:00 (9:00 AM)

## 🎯 Expected Output

### Local Script

```
🚀 Starting IMCA Crawler...
🌐 Fetching IMCA safety events...
✅ Found 15 incidents
🆕 New incident saved: Loss of Position...
⏭️  Already exists: Thruster Control...
📊 Summary: 15 found, 8 new, 7 duplicates
✅ IMCA Crawler completed successfully!
```

### Edge Function Response

```json
{
  "success": true,
  "total_found": 15,
  "new_incidents": 8,
  "duplicates": 7,
  "details": "Successfully processed 15 incidents..."
}
```

## 🔍 Verification

```sql
-- Check recent incidents
SELECT title, link_original, incident_date, tags
FROM dp_incidents
WHERE 'crawler' = ANY(tags)
ORDER BY created_at DESC
LIMIT 10;

-- Count by tag
SELECT COUNT(*) as crawler_incidents
FROM dp_incidents
WHERE 'imca' = ANY(tags);
```

## 🎨 UI Access

1. Navigate to: **`/dp-intelligence`**
2. Tab: **"Incidentes"** - View all incidents
3. Tab: **"Dashboard Analítico"** - View statistics

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| Missing env vars | Check `.env.local` exists with correct values |
| 401 Unauthorized | Use `SUPABASE_SERVICE_ROLE_KEY`, not anon key |
| No incidents found | IMCA website may have changed structure |
| RLS policy error | Ensure using service role key (bypasses RLS) |
| Duplicate key error | Should not happen (duplicate check in place) |

## 📊 Success Criteria

- ✅ Crawler runs without errors
- ✅ New incidents inserted into database
- ✅ Duplicates correctly skipped
- ✅ Incidents visible in `/dp-intelligence` UI
- ✅ Dashboard statistics updated
- ✅ Edge Function executes on schedule

## 🔗 Useful Links

- **IMCA Source**: https://www.imca-int.com/safety-events/
- **UI Dashboard**: `/dp-intelligence`
- **Supabase Console**: https://app.supabase.com
- **Edge Functions Docs**: https://supabase.com/docs/guides/functions

## 📞 Support

For issues or questions:
1. Check `IMCA_CRAWLER_README.md` for detailed docs
2. Review `IMCA_CRAWLER_TESTING_GUIDE.md` for testing steps
3. Check `IMCA_CRAWLER_VISUAL_SUMMARY.md` for architecture

---

**⚡ Quick Test Command**

```bash
# Full test cycle
npm run crawler:imca && \
echo "✅ Crawler completed!" || \
echo "❌ Crawler failed!"
```

---

**🚢 Travel HR Buddy - Sistema Náutico Inteligente**
