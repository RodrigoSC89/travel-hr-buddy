# 🧪 IMCA Crawler - Testing Guide

## 📋 Overview

This guide walks you through testing the IMCA crawler implementation to ensure it's working correctly.

## 🔧 Prerequisites

Before testing, ensure you have:

1. ✅ A Supabase project with the `dp_incidents` table
2. ✅ The migration `20251020000000_add_crawler_fields_to_dp_incidents.sql` applied
3. ✅ Environment variables configured in `.env.local`:
   - `VITE_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## 🚀 Testing Methods

### Method 1: Local Script Execution

#### Step 1: Set up environment

Create `.env.local` file in the project root:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key
```

#### Step 2: Run the crawler

```bash
npm run crawler:imca
```

#### Expected Output

```
🚀 Starting IMCA Crawler...

🌐 Fetching IMCA safety events from: https://www.imca-int.com/safety-events/
✅ Found 15 incidents on IMCA website

🆕 New incident saved: Loss of Position Due to Gyro Drift
🆕 New incident saved: Thruster Control Software Failure
⏭️  Already exists: Reference System Failure
...

📊 Summary:
   Total incidents found: 15
   New incidents saved: 8
   Duplicates skipped: 7

✅ IMCA Crawler completed successfully!
```

#### Troubleshooting

**Error: Missing environment variables**
```
❌ Error: Missing required environment variables
   Required: VITE_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY
```
**Solution**: Check that `.env.local` exists and has the correct variables.

**Error: 401 Unauthorized**
```
❌ Error checking for duplicate: ... { code: '401', ... }
```
**Solution**: Verify the `SUPABASE_SERVICE_ROLE_KEY` is correct (not the anon key).

**No incidents found**
```
⚠️  No incidents found on IMCA website
```
**Solution**: The IMCA website structure may have changed. Check the HTML selectors in the code.

### Method 2: Supabase Edge Function Testing

#### Step 1: Deploy the Edge Function

```bash
# Login to Supabase CLI
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy imca-crawler-cron
```

#### Step 2: Test via curl

```bash
curl -X POST "https://your-project.supabase.co/functions/v1/imca-crawler-cron" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

#### Expected Response

```json
{
  "success": true,
  "total_found": 15,
  "new_incidents": 8,
  "duplicates": 7,
  "details": "Successfully processed 15 incidents. 8 new, 7 duplicates."
}
```

#### Step 3: Verify logs

```bash
# View function logs
supabase functions logs imca-crawler-cron
```

### Method 3: Automated Testing (Cron)

The Edge Function is configured to run automatically every Monday at 09:00 UTC.

#### Verify Cron Configuration

Check `supabase/functions/cron.yaml`:

```yaml
imca-crawler-cron:
  schedule: '0 9 * * 1' # Every Monday at 09:00 UTC
  endpoint: '/imca-crawler-cron'
  method: POST
```

#### Monitor Executions

1. Go to Supabase Dashboard
2. Navigate to **Edge Functions**
3. Select `imca-crawler-cron`
4. View **Logs** and **Invocations** tabs

## ✅ Verification Checklist

After running the crawler, verify the following:

### 1. Database Records

```sql
-- Check if new incidents were inserted
SELECT 
  id, 
  title, 
  link_original, 
  incident_date,
  tags,
  created_at
FROM dp_incidents
WHERE 'crawler' = ANY(tags)
ORDER BY created_at DESC
LIMIT 10;
```

### 2. No Duplicate URLs

```sql
-- Verify no duplicate link_original entries
SELECT 
  link_original, 
  COUNT(*) as count
FROM dp_incidents
WHERE link_original IS NOT NULL
GROUP BY link_original
HAVING COUNT(*) > 1;
```

**Expected Result**: 0 rows (no duplicates)

### 3. Field Population

```sql
-- Check field population
SELECT 
  COUNT(*) as total,
  COUNT(link_original) as with_link,
  COUNT(sistema_afetado) as with_system,
  COUNT(severity) as with_severity
FROM dp_incidents
WHERE 'crawler' = ANY(tags);
```

**Expected Results**:
- `total` = `with_link` (all should have link_original)
- `with_severity` > 0 (most should have severity)
- `with_system` >= 0 (optional field)

### 4. UI Verification

1. Navigate to `/dp-intelligence` in your browser
2. Click on the **"Incidentes"** tab
3. Look for incidents with tag "crawler" or "imca"
4. Click on an incident to view details
5. Verify the `link_original` field contains a valid IMCA URL

#### Expected UI Elements

- ✅ Incident list displays all incidents including new ones
- ✅ Incident cards show title, date, severity
- ✅ Clicking an incident shows full details
- ✅ Link to original IMCA source is present and functional
- ✅ Dashboard tab shows updated statistics

### 5. Analytics Dashboard

1. Navigate to `/dp-intelligence`
2. Click on the **"Dashboard Analítico"** tab
3. Verify the charts are updated with new incidents:
   - Incidents by Vessel
   - Incidents by Severity
   - Incidents by Month

## 🧪 Test Scenarios

### Scenario 1: First Run (Empty Database)

**Given**: No incidents in database
**When**: Crawler runs
**Expected**: All incidents from IMCA website are inserted

### Scenario 2: Duplicate Detection

**Given**: Database already contains incidents from previous run
**When**: Crawler runs again
**Expected**: 
- Existing incidents are skipped (duplicates count increases)
- Only new incidents since last run are inserted

### Scenario 3: IMCA Website Down

**Given**: IMCA website is unreachable
**When**: Crawler runs
**Expected**: Error is caught and logged gracefully, no database corruption

### Scenario 4: Invalid Date Format

**Given**: IMCA website changes date format
**When**: Crawler runs
**Expected**: 
- Warning logged for invalid dates
- Current date used as fallback
- Incident still inserted

## 📊 Performance Benchmarks

Expected performance metrics:

- **Fetch Time**: 2-5 seconds (depends on IMCA website response)
- **Processing Time**: ~100ms per incident
- **Total Execution**: < 30 seconds for typical batch (15-20 incidents)
- **Database Queries**: 2 per incident (SELECT for duplicate check + INSERT if new)

## 🐛 Common Issues and Solutions

### Issue 1: Cheerio selector doesn't find elements

**Symptom**: `Found 0 incidents on IMCA website`

**Diagnosis**:
```bash
# Download the page and inspect HTML structure
curl -s "https://www.imca-int.com/safety-events/" > imca_page.html
# Open in browser and inspect element classes
```

**Solution**: Update selectors in `scripts/imca-crawler.ts`:
```typescript
$('.news-list__item')       // Container
$('.news-list__title')      // Title
$('.news-list__date')       // Date
```

### Issue 2: RLS (Row Level Security) blocks inserts

**Symptom**: `Error inserting incident: ... row-level security policy`

**Solution**: Ensure using `SUPABASE_SERVICE_ROLE_KEY` (not anon key) which bypasses RLS.

### Issue 3: Date parsing fails

**Symptom**: `Invalid date format: "..." for incident: ...`

**Solution**: Update date parsing logic in crawler to handle new format.

## 📝 Manual Smoke Test Script

Run this quick test to verify basic functionality:

```bash
# 1. Check environment
echo "Testing environment variables..."
node -e "console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing')"
node -e "console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing')"

# 2. Test IMCA website accessibility
echo "\nTesting IMCA website access..."
curl -s -o /dev/null -w "%{http_code}" "https://www.imca-int.com/safety-events/"

# 3. Run crawler
echo "\nRunning crawler..."
npm run crawler:imca

# 4. Query database
echo "\nQuerying recent incidents..."
# Use your Supabase CLI or psql to query
```

## 🎯 Success Criteria

The crawler implementation is successful if:

1. ✅ Crawler fetches incidents from IMCA website without errors
2. ✅ New incidents are inserted into `dp_incidents` table
3. ✅ Duplicate incidents are correctly detected and skipped
4. ✅ All required fields are populated correctly
5. ✅ Incidents appear in the `/dp-intelligence` UI
6. ✅ Dashboard statistics reflect the new incidents
7. ✅ Edge Function executes successfully via cron
8. ✅ No database errors or RLS violations occur

## 📚 Next Steps After Testing

Once testing is complete and successful:

1. ✅ Enable the cron job in production
2. ✅ Set up monitoring alerts for crawler failures
3. ✅ Document any IMCA website structure changes
4. ✅ Consider adding email notifications for new critical incidents
5. ✅ Implement AI analysis for newly crawled incidents

---

**Need Help?** Check the main [IMCA_CRAWLER_README.md](./IMCA_CRAWLER_README.md) for more details.
