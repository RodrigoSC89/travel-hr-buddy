# IMCA Crawler - Testing Guide

## 🧪 Overview

This guide covers testing procedures for the IMCA Crawler implementation, including local script testing, Edge Function testing, and verification of data integrity.

## 📋 Prerequisites

Before testing, ensure:

- ✅ Dependencies installed (`npm install`)
- ✅ Environment variables set in `.env.local`
- ✅ Database migration applied
- ✅ Supabase project accessible

## 🔧 Local Script Testing

### 1. Verify Environment Setup

```bash
# Check if environment variables are set
echo $VITE_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Or check .env.local file
cat .env.local | grep -E "(SUPABASE_URL|SERVICE_ROLE_KEY)"
```

### 2. Run the Crawler

```bash
npm run crawler:imca
```

### 3. Expected Output

```
🚀 Starting IMCA Crawler...

🌐 Fetching IMCA safety events...
✅ Found 15 incidents on IMCA website

💾 Saving incidents to database...
🆕 New incident saved: Loss of Position Due to Gyro Drift
⏭️  Already exists: Thruster Control Software Failure
🆕 New incident saved: Reference System Failure in Heavy Weather
🆕 New incident saved: Wind Sensor Calibration Error
⏭️  Already exists: Power Management System Malfunction
🆕 New incident saved: Automatic Transfer Switch Failure
🆕 New incident saved: UPS Battery Degradation
⏭️  Already exists: Minor Thruster Performance Degradation

📊 Summary:
   Total found: 15
   New saved: 8
   Duplicates skipped: 7
   Errors: 0

✅ IMCA Crawler completed successfully!
```

### 4. Verify Data in Supabase

```sql
-- Check latest incidents from crawler
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

## 🌐 Edge Function Testing

### 1. Deploy the Edge Function

```bash
supabase functions deploy imca-crawler-cron
```

Expected output:
```
Deploying function imca-crawler-cron...
✓ Function deployed successfully
Function URL: https://your-project.supabase.co/functions/v1/imca-crawler-cron
```

### 2. Test via cURL

```bash
curl -X POST \
  'https://your-project.supabase.co/functions/v1/imca-crawler-cron' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -w '\n%{http_code}\n'
```

Expected response (200):
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
200
```

### 3. Test via Supabase Dashboard

1. Navigate to **Edge Functions** in Supabase Dashboard
2. Select `imca-crawler-cron`
3. Click **Invoke Function**
4. Verify JSON response

### 4. Monitor Logs

```bash
# View function logs
supabase functions logs imca-crawler-cron

# Or in Supabase Dashboard:
# Edge Functions → imca-crawler-cron → Logs
```

## 🔍 Data Verification

### Check Incident Count

```sql
-- Total incidents
SELECT COUNT(*) as total_incidents 
FROM dp_incidents;

-- Incidents from crawler
SELECT COUNT(*) as crawler_incidents 
FROM dp_incidents 
WHERE 'crawler' = ANY(tags);

-- Incidents from IMCA
SELECT COUNT(*) as imca_incidents 
FROM dp_incidents 
WHERE 'imca' = ANY(tags);
```

### Verify Required Fields

```sql
-- Check for missing required fields
SELECT 
  id,
  title,
  link_original,
  incident_date,
  vessel,
  severity,
  CASE 
    WHEN title IS NULL THEN 'Missing title'
    WHEN link_original IS NULL THEN 'Missing link_original'
    WHEN incident_date IS NULL THEN 'Missing incident_date'
    ELSE 'OK'
  END as validation
FROM dp_incidents
WHERE 'crawler' = ANY(tags)
  AND (title IS NULL OR link_original IS NULL OR incident_date IS NULL);
```

### Check for Duplicates

```sql
-- Should return 0 rows if duplicate prevention is working
SELECT 
  link_original, 
  COUNT(*) as count
FROM dp_incidents
WHERE link_original IS NOT NULL
GROUP BY link_original
HAVING COUNT(*) > 1;
```

### Verify Date Format

```sql
-- Check incident_date format
SELECT 
  id,
  title,
  incident_date,
  TO_CHAR(incident_date, 'YYYY-MM-DD HH24:MI:SS') as formatted_date
FROM dp_incidents
WHERE 'crawler' = ANY(tags)
ORDER BY incident_date DESC
LIMIT 10;
```

## 🎯 UI Verification

### 1. Navigate to DP Intelligence Center

- URL: `http://localhost:5173/dp-intelligence` (dev) or `https://your-app.com/dp-intelligence` (prod)

### 2. Check Incidents Tab

- Verify incidents are displayed
- Check that crawler incidents have the `imca` and `crawler` tags
- Verify incident details (title, date, link)

### 3. Verify Links

- Click on incident title or link
- Should navigate to original IMCA source

### 4. Test Filtering

- Filter by tag: `imca`
- Filter by tag: `crawler`
- Verify only relevant incidents are shown

## 🐛 Error Testing

### Test Network Failures

```typescript
// Temporarily modify scripts/imca-crawler.ts
const { data: html } = await axios.get('https://invalid-url.com/safety-events/');
```

Expected output:
```
❌ Error fetching IMCA incidents: getaddrinfo ENOTFOUND invalid-url.com
❌ IMCA Crawler failed: Error: getaddrinfo ENOTFOUND invalid-url.com
```

### Test Database Errors

```bash
# Test with invalid Supabase credentials
VITE_SUPABASE_URL=invalid npm run crawler:imca
```

Expected output:
```
❌ Error: Missing Supabase credentials
Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment
```

### Test Empty Results

Modify selectors to match non-existent elements:

```typescript
$('.non-existent-class').each((_, element) => {
  // ...
});
```

Expected output:
```
✅ Found 0 incidents on IMCA website
⚠️  No incidents found on IMCA website
```

## 📊 Performance Testing

### Measure Execution Time

```bash
time npm run crawler:imca
```

Expected:
- Local script: < 10 seconds
- Edge Function: < 30 seconds

### Monitor Database Performance

```sql
-- Check query performance
EXPLAIN ANALYZE
SELECT * FROM dp_incidents
WHERE link_original = 'https://www.imca-int.com/safety-events/example';
```

Should use index `idx_dp_incidents_link_original`

## 🔄 Integration Testing

### Test Full Workflow

1. **Clear test data**
```sql
DELETE FROM dp_incidents WHERE 'crawler' = ANY(tags);
```

2. **Run crawler**
```bash
npm run crawler:imca
```

3. **Verify data saved**
```sql
SELECT COUNT(*) FROM dp_incidents WHERE 'crawler' = ANY(tags);
```

4. **Run crawler again (test duplicate prevention)**
```bash
npm run crawler:imca
```

5. **Verify no duplicates created**
```sql
-- Count should be same as step 3
SELECT COUNT(*) FROM dp_incidents WHERE 'crawler' = ANY(tags);
```

## 🎯 Acceptance Criteria

- ✅ Local script runs without errors
- ✅ Edge Function deploys successfully
- ✅ Incidents are fetched from IMCA website
- ✅ Data is saved to `dp_incidents` table
- ✅ Duplicate incidents are skipped
- ✅ All required fields are populated
- ✅ Incidents appear in DP Intelligence Center
- ✅ Links navigate to original IMCA source
- ✅ Error handling works correctly
- ✅ Performance is acceptable (< 30 seconds)

## 🚨 Troubleshooting

### Issue: No incidents found

**Possible causes:**
- IMCA website structure changed
- Network connectivity issues
- Incorrect CSS selectors

**Solution:**
1. Visit https://www.imca-int.com/safety-events/ in browser
2. Inspect HTML structure
3. Update selectors in crawler code

### Issue: Duplicate incidents created

**Possible causes:**
- Index not created on `link_original`
- Null values in `link_original`

**Solution:**
```sql
-- Create index if missing
CREATE INDEX IF NOT EXISTS idx_dp_incidents_link_original 
ON dp_incidents(link_original);

-- Check for null values
SELECT COUNT(*) FROM dp_incidents WHERE link_original IS NULL;
```

### Issue: Edge Function timeout

**Possible causes:**
- Network latency
- Large number of incidents
- Database connection issues

**Solution:**
- Increase function timeout in Supabase settings
- Add pagination to crawler
- Optimize database queries

## 📝 Test Checklist

- [ ] Local script executes successfully
- [ ] Environment variables are set correctly
- [ ] Database migration is applied
- [ ] Edge Function deploys without errors
- [ ] Edge Function responds with 200 status
- [ ] Incidents are fetched from IMCA
- [ ] Data is saved to database
- [ ] Duplicate prevention works
- [ ] Required fields are populated
- [ ] Dates are in correct format
- [ ] Incidents appear in UI
- [ ] Links work correctly
- [ ] Tags are applied correctly
- [ ] Error handling works
- [ ] Performance is acceptable

---

**Testing Completed**: ___________
**Tested By**: ___________
**Issues Found**: ___________
