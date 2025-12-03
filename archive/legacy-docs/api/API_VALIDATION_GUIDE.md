# API Key Validation System

## Overview

This system provides comprehensive validation and testing for all external API integrations configured in the Nautilus One Travel HR Buddy application.

## Features

### 1. Command-Line Validation Script
- **File**: `scripts/validate-api-keys.cjs`
- **Command**: `npm run validate:api-keys`
- **Purpose**: Quickly check which API keys are configured in your `.env` file without making actual API calls

**Example Output**:
```
🔑 API Key Validation Utility
Nautilus One Travel HR Buddy

OpenAI - 🟡 OPTIONAL
  Status: ✅ CONFIGURED
  Keys: VITE_OPENAI_API_KEY: sk-p...xyz

Mapbox - 🔴 REQUIRED
  Status: ✅ CONFIGURED
  Keys: VITE_MAPBOX_TOKEN: pk.e...abc

Required APIs: 2/2 configured
Optional APIs: 5/7 configured
✅ SUCCESS: All required APIs are configured!
```

### 2. Live API Validation Utility
- **File**: `src/utils/api-key-validator.ts`
- **Purpose**: Programmatically test all API endpoints with real HTTP requests

**Usage**:
```typescript
import { validateAllAPIKeys, printValidationReport } from '@/utils/api-key-validator';

// Run validation
const report = await validateAllAPIKeys();

// Print report
printValidationReport(report);

// Or get JSON
const json = exportReportAsJSON(report);
```

**Features**:
- Makes actual HTTP requests to verify API keys
- Detects specific error types (unauthorized, expired, rate limited)
- Measures response times
- Provides actionable recommendations

### 3. API Tester Page (Admin UI)
- **File**: `src/pages/admin/api-tester.tsx`
- **Route**: `/admin/api-tester`
- **Purpose**: Visual interface for testing APIs

**Features**:
- Test individual APIs or all at once
- Visual status indicators
- Response time tracking
- Detailed error messages
- Success/failure statistics

### 4. Individual API Test Services

Each external service has a dedicated test module in `src/services/`:

#### Implemented Services:
1. **OpenAI** (`openai.ts`)
   - Tests: Chat completion API
   - Endpoint: `https://api.openai.com/v1/chat/completions`
   - Detects: Invalid key, model access, rate limits

2. **Mapbox** (`mapbox.ts`)
   - Tests: Geocoding API
   - Endpoint: `https://api.mapbox.com/geocoding/v5/`
   - Detects: Invalid token, unauthorized access

3. **Amadeus** (`amadeus.ts`) ⭐ NEW
   - Tests: OAuth2 token generation
   - Endpoint: `https://test.api.amadeus.com/v1/security/oauth2/token`
   - Detects: Invalid credentials, expired keys, unauthorized

4. **Supabase** (`supabase.ts`) ⭐ NEW
   - Tests: Session validation and database connectivity
   - Detects: Invalid URL, expired anon key, database connection issues

5. **Weather/Windy** (`windy.ts`)
   - Tests: OpenWeatherMap API
   - Endpoint: `https://api.openweathermap.org/data/2.5/weather`
   - Detects: Invalid API key, unauthorized

6. **Skyscanner** (`skyscanner.ts`)
   - Tests: RapidAPI markets endpoint
   - Endpoint: `https://skyscanner-api.p.rapidapi.com/v3/markets`
   - Detects: Invalid RapidAPI key, subscription status

7. **Booking.com** (`booking.ts`)
   - Tests: Countries endpoint via RapidAPI
   - Endpoint: `https://booking-com.p.rapidapi.com/v1/static/countries`
   - Detects: Invalid RapidAPI key, subscription issues

8. **MarineTraffic** (`marinetraffic.ts`)
   - Tests: Vessel export endpoint
   - Endpoint: `https://services.marinetraffic.com/api/exportvessel/`
   - Detects: Invalid key, subscription status

9. **Whisper** (`whisper.ts`)
   - Tests: Model availability (uses OpenAI key)
   - Endpoint: `https://api.openai.com/v1/models/whisper-1`
   - Detects: Invalid OpenAI key, model access

## API Keys Tracked

### Required (Core Functionality)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_MAPBOX_ACCESS_TOKEN` or `VITE_MAPBOX_TOKEN`

### Optional (Enhanced Features)
- `VITE_OPENAI_API_KEY` - AI chat and Whisper
- `VITE_AMADEUS_API_KEY` + `VITE_AMADEUS_API_SECRET` - Travel booking
- `VITE_OPENWEATHER_API_KEY` or `VITE_WINDY_API_KEY` - Weather data
- `VITE_SKYSCANNER_API_KEY` or `VITE_RAPIDAPI_KEY` - Flight search
- `VITE_BOOKING_API_KEY` or `VITE_RAPIDAPI_KEY` - Hotel booking
- `VITE_MARINETRAFFIC_API_KEY` - Vessel tracking
- `VITE_ELEVENLABS_API_KEY` - Text-to-speech

## Status Types

The validation system categorizes API keys into the following statuses:

- **valid** ✅ - API key is working correctly
- **invalid** ❌ - API call failed (generic error)
- **unauthorized** 🚫 - Invalid credentials (401 error)
- **expired** 🔴 - API key has expired (403 error)
- **rate_limited** ⏱️ - Rate limit exceeded (429 error)
- **not_configured** ⚠️ - API key not set in environment
- **unknown** ❓ - Unexpected error occurred

## Recommendations by Status

Each status comes with an actionable recommendation:

| Status | Recommendation |
|--------|----------------|
| valid | API key is active and working correctly |
| not_configured | Configure API key in environment variables |
| unauthorized | Invalid API key - verify credentials and rotate if necessary |
| expired | API key has expired - rotate immediately |
| rate_limited | Rate limit reached - consider upgrading plan or reducing usage |
| invalid | API connection failed - check credentials and network connectivity |

## Usage Examples

### Quick Configuration Check
```bash
npm run validate:api-keys
```

### Live API Testing (in code)
```typescript
import { validateAllAPIKeys } from '@/utils/api-key-validator';

async function checkAPIs() {
  const report = await validateAllAPIKeys();
  
  console.log(`Total APIs: ${report.totalAPIs}`);
  console.log(`Valid: ${report.validCount}`);
  console.log(`Invalid: ${report.invalidCount}`);
  
  // Check specific API
  const openai = report.results.find(r => r.name === 'OpenAI');
  if (openai?.status === 'valid') {
    console.log('OpenAI is ready!');
  }
}
```

### Testing Individual APIs
```typescript
import { testOpenAIConnection } from '@/services/openai';

const result = await testOpenAIConnection();
if (result.success) {
  console.log(`OpenAI responded in ${result.responseTime}ms`);
} else {
  console.error(`Error: ${result.error}`);
}
```

## Integration with Existing Components

The validation system integrates with:

1. **API Health Monitor** (`src/utils/api-health-monitor.ts`)
   - Circuit breaker pattern
   - Failure tracking
   - Automatic retry logic

2. **API Manager** (`src/lib/api-manager.ts`)
   - Centralized API request handling
   - Retry mechanisms
   - Error handling

3. **API Status Component** (`src/components/admin/APIStatus.tsx`)
   - Visual status dashboard
   - Real-time monitoring

## Error Detection

The system detects and categorizes errors based on:

1. **HTTP Status Codes**
   - 401: Unauthorized (invalid credentials)
   - 403: Forbidden (expired/insufficient permissions)
   - 429: Rate limit exceeded
   - 5xx: Server errors (triggers retry)

2. **Error Messages**
   - "not configured" / "missing" → not_configured
   - "unauthorized" / "invalid" / "401" → unauthorized
   - "expired" / "forbidden" / "403" → expired
   - "rate limit" / "429" → rate_limited

3. **Response Validation**
   - Checks for expected response structure
   - Validates required fields (e.g., access_token for Amadeus)
   - Verifies data integrity

## Running Tests

### Configuration Check Only
```bash
npm run validate:api-keys
```

### Full API Testing (via UI)
1. Start the dev server: `npm run dev`
2. Navigate to `/admin/api-tester`
3. Click "Test All APIs"

### Programmatic Testing
```typescript
// In your code or console
import { validateAllAPIKeys } from '@/utils/api-key-validator';
const report = await validateAllAPIKeys();
console.log(report.summary);
```

## Best Practices

1. **Regular Validation**
   - Run `npm run validate:api-keys` before deployment
   - Use the API Tester page periodically to verify live connectivity

2. **Key Rotation**
   - Monitor for expired or unauthorized keys
   - Follow the recommendations provided in the reports

3. **Rate Limiting**
   - Don't run validation too frequently
   - Space out individual API tests when using "Test All"

4. **Security**
   - Never commit `.env` files
   - Use separate keys for development and production
   - Monitor usage on API provider dashboards

## Troubleshooting

### "API key not configured"
- Check if the key exists in your `.env` file
- Ensure the key name matches exactly (including `VITE_` prefix)
- Restart dev server after changing environment variables

### "Unauthorized" or "Invalid credentials"
- Verify the API key is correct (copy/paste from provider)
- Check if the key has necessary permissions
- Ensure the key hasn't been revoked or rotated

### "Expired" or "Forbidden"
- Check API key expiration date on provider dashboard
- Generate a new key and update `.env`
- Verify subscription is active (for paid APIs)

### "Rate limited"
- Wait for rate limit window to reset
- Consider upgrading API plan
- Reduce testing frequency

## Future Enhancements

Potential improvements for the validation system:

1. **Scheduled Monitoring**
   - Automatic periodic validation
   - Email/Slack notifications for failures

2. **Historical Tracking**
   - Store validation results in database
   - Visualize API health over time

3. **Additional APIs**
   - VesselFinder
   - Airbnb
   - TripAdvisor
   - Google Flights

4. **Enhanced Reporting**
   - Export to CSV/PDF
   - Integration with monitoring services
   - Slack/Teams webhooks

## Support

For issues or questions:
1. Check the API provider's documentation
2. Review error messages in the validation report
3. Consult the API_KEYS_SETUP_GUIDE.md
4. Check Supabase Edge Function logs for backend APIs

---

**Last Updated**: $(date)
**Version**: 1.0.0
