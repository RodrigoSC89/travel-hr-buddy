# IMCA Crawler - DP Intelligence Center

## 📋 Overview

The IMCA Crawler is a Supabase Edge Function that automatically fetches Dynamic Positioning (DP) incidents from the IMCA (International Marine Contractors Association) RSS feed and stores them in the `dp_incidents` database table.

## 🎯 Features

- **Automated RSS Feed Crawling**: Fetches incident data from `https://www.imca-int.com/safety-events/feed/`
- **XML Parsing**: Extracts title, link, description, and publication date from RSS items
- **Duplicate Prevention**: Uses upsert with unique constraint on `link` to prevent duplicate entries
- **Error Handling**: Comprehensive error handling and logging for debugging
- **CORS Support**: CORS headers configured for API access
- **Statistics Reporting**: Returns detailed stats about inserted, updated, and error counts

## 🗂️ File Structure

```
supabase/
├── functions/
│   └── imca-crawler/
│       └── index.ts          # Main crawler function
├── migrations/
│   └── 20251016030754_add_unique_link_dp_incidents.sql  # Adds unique constraint
└── config.toml               # Function configuration and cron schedule
```

## 📊 Database Schema

The crawler stores data in the `dp_incidents` table with the following structure:

```sql
CREATE TABLE public.dp_incidents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  vessel TEXT,
  location TEXT,
  root_cause TEXT,
  class_dp TEXT,
  source TEXT,
  link TEXT UNIQUE,  -- Unique constraint added by migration
  summary TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## 🔄 How It Works

1. **Fetch RSS Feed**: Downloads the IMCA safety events RSS feed
2. **Parse XML**: Extracts incident data using regex patterns:
   - `<title>`: Incident title
   - `<link>`: URL to the incident report
   - `<pubDate>`: Publication date
   - `<description>`: Incident description/summary
3. **Generate ID**: Creates unique ID from the link (e.g., `imca-42-25`)
4. **Upsert Data**: Inserts or updates records in `dp_incidents` table
5. **Return Stats**: Returns JSON with statistics about the operation

## ⚙️ Configuration

### Manual Invocation

Call the function via HTTP POST:

```bash
curl -X POST https://YOUR_SUPABASE_URL/functions/v1/imca-crawler \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### Automated Cron Schedule

The function is configured to run automatically every 6 hours:

```toml
[[edge_runtime.cron]]
name = "imca-crawler"
function_name = "imca-crawler"
schedule = "0 */6 * * *"  # Every 6 hours
description = "DP Intelligence: Crawl IMCA RSS feed for new DP incidents"
```

## 📥 Response Format

### Success Response

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

### Error Response

```json
{
  "success": false,
  "error": "Failed to fetch RSS feed: 404 Not Found"
}
```

## 🔐 Environment Variables

The function requires the following environment variables (automatically provided by Supabase):

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database access

## 🛠️ Maintenance

### Monitoring

Check the function logs in the Supabase dashboard to monitor:
- Number of incidents fetched
- Insertion/update counts
- Any errors during processing

### Troubleshooting

**Issue**: Function returns 500 error
- **Solution**: Check the function logs for detailed error messages
- **Common causes**: RSS feed unavailable, database connection issues

**Issue**: Duplicate incidents
- **Solution**: Verify the unique constraint on the `link` column exists:
  ```sql
  SELECT constraint_name, constraint_type 
  FROM information_schema.table_constraints 
  WHERE table_name = 'dp_incidents' AND constraint_type = 'UNIQUE';
  ```

**Issue**: No new incidents being added
- **Solution**: Check if the IMCA RSS feed has new content
- Verify the cron job is running (check `edge_runtime.cron` logs)

## 🚀 Integration with DP Intelligence Center

The crawled incidents are displayed in the DP Intelligence Center UI at `/dp-intelligence`, where users can:
- View all incidents with filtering by DP class and status
- Search incidents by title, vessel, location, or tags
- Analyze incidents with AI-powered insights
- Access original IMCA reports via links

## 📝 Notes

- The crawler preserves the original IMCA link for reference
- The `summary` field stores the RSS description
- Additional metadata (vessel, location, root_cause, etc.) can be added manually or through AI analysis
- The function is designed to be idempotent - running it multiple times won't create duplicates

## 🔗 Related Documentation

- [DP Intelligence Center Implementation](../../../DP_INTELLIGENCE_CENTER_IMPLEMENTATION_COMPLETE.md)
- [DP Incidents Table Guide](../../../DP_INCIDENTS_TABLE_GUIDE.md)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
