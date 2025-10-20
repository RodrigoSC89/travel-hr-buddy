# IMCA Crawler - Automatic DP Incidents Ingestion

## 🎯 Overview

The IMCA Crawler automatically fetches Dynamic Positioning (DP) incidents from the official IMCA website (https://www.imca-int.com/safety-events/) and saves them to the Supabase `dp_incidents` table.

This enables the DP Intelligence Center to stay up-to-date with the latest maritime safety incidents without manual data entry.

## 🚀 Features

### Dual Execution Modes

1. **Local Script Execution** (`scripts/imca-crawler.ts`)
   - On-demand execution via `npm run crawler:imca`
   - Node.js/TypeScript implementation with Cheerio for HTML parsing
   - Detailed console logging for debugging and monitoring
   - Ideal for testing and manual updates

2. **Automated Edge Function** (`supabase/functions/imca-crawler-cron/index.ts`)
   - Deno-based serverless function
   - Scheduled execution every Monday at 09:00 UTC (via Supabase cron)
   - JSON response with execution metrics
   - Seamless Supabase integration

### Intelligent Data Processing

- **HTML Parsing**: Extracts incident title, link, and publication date from IMCA's safety events page
- **Duplicate Prevention**: Checks `link_original` field before inserting to avoid duplicates
- **Date Handling**: Converts various date formats to ISO 8601 with fallback to current date
- **Error Resilience**: Continues processing remaining incidents even if one fails
- **Auto-tagging**: Marks incidents with `['imca', 'crawler']` tags for easy filtering

## 📦 Installation

### Dependencies

The following dependencies are required and already included in `package.json`:

```json
{
  "dependencies": {
    "axios": "^1.x.x",
    "cheerio": "^1.x.x",
    "tsx": "^4.x.x"
  }
}
```

Install them with:

```bash
npm install
```

### Database Schema

The crawler requires the following fields in the `dp_incidents` table:

```sql
-- Required fields (already exist)
- id UUID
- vessel TEXT
- incident_date TIMESTAMP
- severity TEXT
- title TEXT
- description TEXT
- tags TEXT[]

-- New fields added by migration
- link_original TEXT     -- URL of original IMCA incident
- sistema_afetado TEXT   -- Affected system (optional)
```

The migration `20251020000000_add_link_original_and_sistema_afetado_to_dp_incidents.sql` adds these fields automatically.

### Environment Variables

Create or update `.env.local` with your Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🔧 Usage

### Local Execution (Manual)

Run the crawler manually:

```bash
npm run crawler:imca
```

Expected output:

```
🚀 Starting IMCA Crawler...

🌐 Fetching IMCA safety events...
✅ Found 15 incidents on IMCA website

💾 Saving incidents to database...
🆕 New incident saved: Loss of Position Due to Gyro Drift
⏭️  Already exists: Thruster Control Software Failure
🆕 New incident saved: Reference System Failure in Heavy Weather
...

📊 Summary:
   Total found: 15
   New saved: 8
   Duplicates skipped: 7
   Errors: 0

✅ IMCA Crawler completed successfully!
```

### Automated Execution (Edge Function)

#### Deploy the Edge Function

```bash
# From the project root
supabase functions deploy imca-crawler-cron
```

#### Set up Cron Schedule

Create a cron job in Supabase Dashboard or via SQL:

```sql
-- Schedule: Every Monday at 09:00 UTC
SELECT cron.schedule(
  'imca-crawler-weekly',
  '0 9 * * 1',
  $$
    SELECT net.http_post(
      url := 'https://your-project.supabase.co/functions/v1/imca-crawler-cron',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_ANON_KEY'
      )
    ) AS request_id;
  $$
);
```

#### Test the Edge Function

```bash
curl -X POST \
  'https://your-project.supabase.co/functions/v1/imca-crawler-cron' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

Expected JSON response:

```json
{
  "success": true,
  "message": "IMCA Crawler completed successfully",
  "data": {
    "total": 15,
    "new": 8,
    "duplicates": 7,
    "errors": 0
  },
  "timestamp": "2025-10-20T10:00:00.000Z"
}
```

## 📊 Database Integration

### Table Structure

The crawler saves incidents to the `dp_incidents` table:

| Column | Type | Description | Populated by Crawler |
|--------|------|-------------|---------------------|
| `id` | UUID | Auto-generated | ✅ |
| `title` | TEXT | Incident title | ✅ |
| `link_original` | TEXT | Original IMCA URL | ✅ |
| `incident_date` | TIMESTAMP | Date of incident | ✅ |
| `description` | TEXT | Incident description | ✅ (defaults to title) |
| `sistema_afetado` | TEXT | Affected system | ⏸️ (future enhancement) |
| `tags` | TEXT[] | Tags for filtering | ✅ (adds `['imca', 'crawler']`) |
| `vessel` | TEXT | Vessel name | ⏸️ (defaults to "Unknown") |
| `severity` | TEXT | Severity level | ⏸️ (defaults to "Média") |
| `status` | TEXT | Status | ✅ (set to "pending") |

### Duplicate Prevention

The crawler checks for existing incidents using the `link_original` field:

```typescript
const { data: existing } = await supabase
  .from('dp_incidents')
  .select('id')
  .eq('link_original', incident.link_original)
  .maybeSingle();

if (existing) {
  console.log('⏭️  Already exists: ${incident.title}');
  continue;
}
```

## 🔍 Viewing Results

After running the crawler, view the incidents in the DP Intelligence Center:

1. Navigate to `/dp-intelligence` in the application
2. Click the "Incidents" tab
3. Filter by tags: `imca` or `crawler`
4. Each incident includes a link back to the original IMCA source

## 🛠️ Troubleshooting

### Common Issues

**Issue**: `Error: Missing Supabase credentials`
**Solution**: Ensure `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in `.env.local`

**Issue**: `Error fetching IMCA incidents: timeout`
**Solution**: Check your internet connection and firewall settings. The crawler needs access to `https://www.imca-int.com`

**Issue**: No incidents found
**Solution**: The IMCA website structure may have changed. Update the selectors in the `fetchIMCAIncidents()` function

**Issue**: Duplicate incidents being saved
**Solution**: Ensure the `idx_dp_incidents_link_original` index exists on the `link_original` column

## 📝 Development

### Customizing Selectors

The crawler uses CSS selectors to extract data from the IMCA website. If the website structure changes, update these selectors in both files:

**Local Script** (`scripts/imca-crawler.ts`):
```typescript
$('.news-list__item, .event-item, article.post').each((_, element) => {
  // Update these selectors as needed
  const title = $el.find('.news-list__title, .event-title, h2, h3').first().text().trim();
  const linkHref = $el.find('a').first().attr('href');
  const dateText = $el.find('.news-list__date, .event-date, time').first().text().trim();
});
```

**Edge Function** (`supabase/functions/imca-crawler-cron/index.ts`):
```typescript
// Same selectors, update in both places
```

### Testing Locally

1. Set environment variables in `.env.local`
2. Run the script: `npm run crawler:imca`
3. Check the console output for errors
4. Verify data in Supabase dashboard

## 🔐 Security

- The crawler uses the **Service Role Key** to bypass RLS policies
- Never expose the Service Role Key in client-side code
- Store credentials in environment variables only
- Use Supabase's built-in authentication for user-facing features

## 📚 Related Documentation

- [DP Intelligence Center Implementation](./DP_INTELLIGENCE_CENTER_IMPLEMENTATION.md)
- [DP Incidents Table Guide](./DP_INCIDENTS_TABLE_GUIDE.md)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)

## 🎯 Future Enhancements

- [ ] Add AI-powered system classification (`sistema_afetado`)
- [ ] Implement severity detection based on keywords
- [ ] Extract vessel name from incident description
- [ ] Add support for other maritime safety sources (MAIB, USCG, etc.)
- [ ] Implement full-text search on incident descriptions
- [ ] Add email notifications for critical incidents

## 📞 Support

For issues or questions:
1. Check the [troubleshooting section](#troubleshooting)
2. Review the console logs for error details
3. Contact the development team

---

**Last Updated**: 2025-10-20
**Version**: 1.0.0
