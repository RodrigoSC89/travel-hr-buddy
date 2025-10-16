# IMCA Crawler - Quick Reference

## 🚀 Quick Start

### Deploy the Function
```bash
cd /home/runner/work/travel-hr-buddy/travel-hr-buddy
supabase functions deploy imca-crawler
```

### Run Manually
```bash
# Via Supabase CLI
supabase functions invoke imca-crawler

# Via HTTP
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/imca-crawler \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Check Logs
```bash
supabase functions logs imca-crawler
```

## 📂 Files

```
supabase/
├── functions/
│   └── imca-crawler/
│       ├── index.ts          # Main crawler implementation
│       └── README.md         # Detailed documentation
├── migrations/
│   └── 20251016030754_add_unique_link_dp_incidents.sql
└── config.toml               # Function config + cron schedule
```

## 🔄 What It Does

1. Fetches `https://www.imca-int.com/safety-events/feed/`
2. Parses XML for incident data
3. Stores in `dp_incidents` table
4. Prevents duplicates via unique `link` constraint
5. Returns statistics

## ⚙️ Configuration

**Cron Schedule:** Every 6 hours (`0 */6 * * *`)  
**JWT Verification:** Disabled  
**CORS:** Enabled  

## 📊 Response Format

```json
{
  "success": true,
  "message": "Ingestão concluída",
  "stats": {
    "total": 25,
    "inserted": 3,
    "updated": 22,
    "errors": 0
  }
}
```

## 🗄️ Database

**Table:** `dp_incidents`  
**Key Fields:** `id`, `title`, `link` (unique), `summary`, `source`, `date`  
**Migration:** `20251016030754_add_unique_link_dp_incidents.sql`  

## ✅ Status

✅ Implementation Complete  
✅ Migration Added  
✅ Cron Scheduled  
✅ Documented  
✅ Ready for Production  

## 📚 Documentation

- **Detailed Guide:** `/supabase/functions/imca-crawler/README.md`
- **Implementation Summary:** `/IMCA_CRAWLER_IMPLEMENTATION_COMPLETE.md`
- **DP Intelligence Center:** `/DP_INTELLIGENCE_CENTER_IMPLEMENTATION_COMPLETE.md`

## 🔗 Related Functions

- `dp-intel-feed` - Serves incident data to frontend
- `dp-intel-analyze` - AI analysis of incidents

## 🛠️ Troubleshooting

**No data appearing?**
- Check function logs for errors
- Verify unique constraint exists on `link` column
- Test RSS feed URL manually

**Duplicates being created?**
- Run migration if not applied: `20251016030754_add_unique_link_dp_incidents.sql`
- Verify `onConflict: "link"` in upsert call

**Cron not running?**
- Check Supabase dashboard → Edge Functions → Cron Jobs
- Verify config.toml is deployed with cron entry
