# 🔑 API Keys Quick Reference

## Quick Commands

```bash
# Check which API keys are configured (fast, no API calls)
npm run validate:api-keys

# See a demo of how validation works
npm run demo:api-validation

# Start dev server and access UI tester
npm run dev
# Then navigate to: http://localhost:5173/admin/api-tester
```

## Required API Keys

These are **required** for core functionality:

```bash
# Supabase (Database & Auth)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...

# Mapbox (Maps & Geolocation)
VITE_MAPBOX_TOKEN=pk.eyJ...
```

## Optional API Keys

These enable **enhanced features**:

```bash
# OpenAI (AI Chat & Whisper)
VITE_OPENAI_API_KEY=sk-proj-...

# Amadeus (Travel Booking)
VITE_AMADEUS_API_KEY=your-key
VITE_AMADEUS_API_SECRET=your-secret

# Weather (OpenWeather or Windy)
VITE_OPENWEATHER_API_KEY=your-key

# Flights (Skyscanner via RapidAPI)
VITE_RAPIDAPI_KEY=your-key

# Hotels (Booking.com via RapidAPI)
VITE_RAPIDAPI_KEY=your-key  # Same key as above

# Maritime (MarineTraffic)
VITE_MARINETRAFFIC_API_KEY=your-key

# Voice (ElevenLabs)
VITE_ELEVENLABS_API_KEY=your-key
```

## API Status Icons

| Icon | Status | Meaning |
|------|--------|---------|
| ✅ | valid | Working correctly |
| ❌ | invalid | Connection failed |
| 🚫 | unauthorized | Invalid credentials (401) |
| 🔴 | expired | Key expired (403) |
| ⏱️ | rate_limited | Too many requests (429) |
| ⚠️ | not_configured | Missing from .env |

## Quick Troubleshooting

### API key not configured
1. Check `.env` file exists
2. Verify key name matches exactly
3. Restart dev server

### Unauthorized (401)
1. Verify API key is correct
2. Check for typos
3. Regenerate key if needed

### Expired (403)
1. Generate new API key
2. Update `.env`
3. Redeploy

### Rate limited (429)
1. Wait for reset
2. Reduce frequency
3. Upgrade plan

## Get API Keys

### Supabase (Required)
1. Visit https://supabase.com
2. Create project
3. Copy URL and anon key from Settings → API

### Mapbox (Required)
1. Visit https://account.mapbox.com
2. Create token
3. Copy public token

### OpenAI (Optional)
1. Visit https://platform.openai.com/api-keys
2. Create new key
3. Copy and secure it

### Amadeus (Optional)
1. Visit https://developers.amadeus.com
2. Register application
3. Copy API key and secret

### RapidAPI (Optional - for multiple services)
1. Visit https://rapidapi.com
2. Subscribe to desired APIs (Skyscanner, Booking.com)
3. Copy RapidAPI key

## More Information

- **Full Documentation**: See `API_VALIDATION_GUIDE.md`
- **Setup Guide**: See `API_KEYS_SETUP_GUIDE.md`
- **Validation Report**: See `API_VALIDATION_REPORT.md`
- **UI Tester**: Navigate to `/admin/api-tester` in the app

## Code Examples

### Test Single API
```typescript
import { testOpenAIConnection } from '@/services/openai';

const result = await testOpenAIConnection();
if (result.success) {
  console.log('OpenAI is ready!');
}
```

### Test All APIs
```typescript
import { validateAllAPIKeys } from '@/utils/api-key-validator';

const report = await validateAllAPIKeys();
console.log(`Valid: ${report.validCount}/${report.totalAPIs}`);
```

### Use in Component
```typescript
import { useEffect } from 'react';
import { validateAllAPIKeys } from '@/utils/api-key-validator';

function MyComponent() {
  useEffect(() => {
    validateAllAPIKeys().then(report => {
      // Handle validation results
    });
  }, []);
}
```
