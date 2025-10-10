# API Status Feature - Quick Reference

## 📍 Locations

### Full Dashboard Page
- **File**: `src/pages/admin/api-status.tsx`
- **URL**: `/admin/api-status`
- **Access**: Admin users via sidebar navigation

### Component Widget
- **File**: `src/components/admin/APIStatus.tsx`
- **Location**: Admin Control Panel → "APIs" tab
- **URL**: `/admin/control-panel` (then select APIs tab)

---

## 🔧 Configuration

### Required Environment Variables

Add to your `.env.local` file:

```bash
# OpenAI API (GPT models)
VITE_OPENAI_API_KEY=sk-...

# Mapbox (Maps & Geocoding)
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ...
# or
VITE_MAPBOX_TOKEN=pk.eyJ...

# Amadeus (Travel APIs)
VITE_AMADEUS_API_KEY=your-client-id
VITE_AMADEUS_API_SECRET=your-client-secret

# Supabase (Backend)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

---

## 🎯 Features

### API Status Page Features

1. **Real-Time Testing**
   - Click "🔁 Retest APIs" to validate all services
   - Shows live status: Valid ✅, Invalid ❌, Checking ⏳

2. **Services Monitored**
   - OpenAI (GPT Chat & Models)
   - Mapbox (Geocoding & Maps)
   - Amadeus (Flight & Hotel APIs)
   - Supabase (Authentication & Database)

3. **History Tracking**
   - Records each test run with timestamp
   - Displays line chart showing availability over time
   - Chart appears after 2+ test runs

4. **Download Logs**
   - Click "📁 Download Log" to export JSON
   - Contains all historical test results
   - Useful for debugging and reporting

5. **Configuration Guide**
   - Built-in guide showing required env vars
   - Copy-paste template for `.env.local`

---

## 📊 Status Indicators

### Badge Colors

| Status | Badge | Color | Meaning |
|--------|-------|-------|---------|
| Valid | ✅ Valid | Green | API key works, service connected |
| Invalid | ❌ Invalid | Red | API key failed or service unreachable |
| Checking | ⏳ Checking... | Blue | Currently testing |
| Missing | ⚠️ Missing Key | Yellow | Environment variable not set |

---

## 🔍 How Validation Works

### OpenAI
```typescript
1. Check: VITE_OPENAI_API_KEY exists
2. Test: GET https://api.openai.com/v1/models
3. Header: Authorization: Bearer {apiKey}
4. Result: 200 OK = Valid ✅
```

### Mapbox
```typescript
1. Check: VITE_MAPBOX_ACCESS_TOKEN or VITE_MAPBOX_TOKEN
2. Test: GET geocoding API with test query
3. Param: access_token={apiKey}
4. Result: 200 OK = Valid ✅
```

### Amadeus
```typescript
1. Check: Both VITE_AMADEUS_API_KEY and SECRET exist
2. Test: POST oauth2/token endpoint
3. Body: client_credentials grant
4. Result: access_token received = Valid ✅
```

### Supabase
```typescript
1. Test: supabase.auth.getSession()
2. Check: No error thrown
3. Result: Session data returned = Valid ✅
```

---

## 📈 Chart Visualization

### Understanding the Chart

- **X-Axis**: Time of each test (HH:MM:SS format)
- **Y-Axis**: Status (1 = Valid ✅, 0 = Invalid ❌)
- **Lines**: One per service (color-coded)
- **Tooltip**: Hover to see exact status at each time

### Example Interpretation

```
1 ┤───✓───✓───✓    ← Service always working
  │
0.5
  │
0 ┤───✗───✗───✗    ← Service always failing
  └───────────────
    10:30  10:45  11:00
```

---

## 🎨 Component Widget vs Full Page

### When to Use Component Widget
- Quick status overview
- Embedded in Control Panel
- Summary statistics at a glance
- Link to detailed page

### When to Use Full Page
- Detailed API testing
- Historical analysis
- Download logs for reporting
- Configuration reference

---

## 🚀 Usage Tips

### Best Practices

1. **Test Regularly**
   - Test APIs after deployment
   - Verify keys after rotation
   - Check before important operations

2. **Monitor Trends**
   - Use chart to identify patterns
   - Note if services fail at specific times
   - Track response time degradation

3. **Export Logs**
   - Download logs before clearing browser
   - Keep records for compliance
   - Share with support teams

4. **Environment Setup**
   - Test in development first
   - Verify all keys in staging
   - Confirm production values

---

## 🐛 Troubleshooting

### "Missing Key" Status
**Problem**: API key environment variable not set  
**Solution**: Add to `.env.local` and restart dev server

### "Invalid" Status
**Possible Causes**:
1. API key is incorrect or expired
2. API service is down
3. Network/firewall blocking request
4. Rate limit exceeded

**Solutions**:
1. Verify key in API provider dashboard
2. Check API status page
3. Test with cURL or Postman
4. Wait and retry later

### Chart Not Appearing
**Cause**: Need 2+ test runs to show history  
**Solution**: Click "Retest APIs" multiple times

### Download Button Disabled
**Cause**: No history data yet  
**Solution**: Run at least one test

---

## 📝 Log Format

### Downloaded JSON Structure

```json
[
  {
    "timestamp": "2025-10-10T00:53:00.000Z",
    "OpenAI": "valid",
    "Mapbox": "valid",
    "Amadeus": "invalid",
    "Supabase": "valid"
  },
  {
    "timestamp": "2025-10-10T01:15:30.000Z",
    "OpenAI": "valid",
    "Mapbox": "valid",
    "Amadeus": "valid",
    "Supabase": "valid"
  }
]
```

---

## 🔐 Security Notes

### Client-Side Validation
⚠️ **Important**: API testing runs in the browser

**Implications**:
- API keys are exposed to client
- Use only public/publishable keys
- Never store secret keys in client env
- Server-side validation recommended for production

### Safe Keys for Client
- ✅ Mapbox Access Token (public)
- ✅ Supabase Publishable Key (public)
- ✅ OpenAI API Key (if acceptable per policy)
- ⚠️ Amadeus (use server-side in production)

---

## 📚 Related Files

### Core Files
```
src/pages/admin/api-status.tsx       - Main page
src/components/admin/APIStatus.tsx   - Widget
src/App.tsx                          - Routing
```

### Dependencies
```
src/components/ui/card.tsx
src/components/ui/badge.tsx
src/components/ui/button.tsx
src/components/layout/multi-tenant-wrapper.tsx
src/integrations/supabase/client.ts
```

---

## 🔄 Future Enhancements

### Planned Features
- [ ] Server-side API validation
- [ ] Persistent history storage
- [ ] Email alerts on failures
- [ ] Response time tracking
- [ ] Webhook notifications
- [ ] Rate limit monitoring
- [ ] Parallel testing

---

## 📞 Support

### For Issues
1. Check this guide
2. Review console for errors
3. Verify environment variables
4. Test APIs independently
5. Contact admin team

### For Feature Requests
- Submit via GitHub Issues
- Discuss in team meetings
- Add to roadmap

---

**Last Updated**: October 10, 2025  
**Version**: 1.0  
**Status**: ✅ Production Ready
