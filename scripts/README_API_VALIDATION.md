# API Keys Validation Script

Automated validation tool for testing all external API integrations in the Nautilus One Travel HR Buddy application.

## Overview

This script validates API keys and integrations by making actual API calls to verify:
- ✅ Key validity (not expired or revoked)
- ✅ Authentication and authorization
- ✅ API accessibility and response times
- ✅ Rate limits and quota status

## Usage

```bash
# Run validation
npm run validate:api-keys

# Or directly
node scripts/validate-api-keys.js
```

## What Gets Validated

### Core Services (Recommended)

1. **OpenAI** - AI Chat and Analysis
   - Endpoint: `https://api.openai.com/v1/models`
   - Tests: List available models
   - Expected: 200 + model list

2. **Mapbox** - Interactive Maps
   - Endpoint: `https://api.mapbox.com/geocoding/v5/mapbox.places/test.json`
   - Tests: Geocoding API
   - Expected: 200 + geocoded results

3. **Supabase** - Backend & Database
   - Endpoint: Supabase REST API
   - Tests: Instance connectivity
   - Expected: 200 or 404 (both indicate accessible instance)

4. **OpenWeather** - Weather Data
   - Endpoint: `https://api.openweathermap.org/data/2.5/weather`
   - Tests: Current weather data
   - Expected: 200 + weather data

### Optional Services

5. **Amadeus** - Travel & Flights
   - Endpoint: `https://test.api.amadeus.com/v1/security/oauth2/token`
   - Tests: OAuth token generation
   - Expected: 200 + access token

6. **ElevenLabs** - Voice Services
   - Endpoint: `https://api.elevenlabs.io/v1/user`
   - Tests: User account access
   - Expected: 200 + user info

7. **Windy** - Advanced Weather (Future)
   - Tests: Key configuration only
   - Note: No test endpoint available

8. **MarineTraffic** - Vessel Tracking
   - Tests: Key configuration only
   - Note: Requires specific vessel ID

9. **Skyscanner** - Flight Search
   - Tests: Key configuration only
   - Note: Requires RapidAPI setup

10. **Booking.com** - Hotel Reservations
    - Tests: Key configuration only
    - Note: Requires affiliate credentials

## Output Examples

### All APIs Valid
```
🔍 API KEYS VALIDATION REPORT - NAUTILUS ONE

Testing: OpenAI API...
  ✅ Valid API key - 50 models available (234ms)

Testing: Mapbox API...
  ✅ Valid access token - Geocoding API working (156ms)

Testing: Supabase...
  ✅ Valid Supabase configuration - Instance accessible (89ms)

Testing: OpenWeather API...
  ✅ Valid API key - Weather data accessible (201ms)

================================================================================
VALIDATION SUMMARY
================================================================================

Total APIs Checked: 4
✅ Passed: 4
❌ Failed: 0
⊘  Skipped: 6

Success Rate: 100% (4/4 tested)

✅ All configured APIs are working correctly!
```

### With Failures
```
Testing: OpenAI API...
  ❌ Invalid or expired API key
     Error: HTTP 401 Unauthorized

Failed Tests:

  ❌ OpenAI
     Error: HTTP 401 Unauthorized
     💡 Recommendation: The API key is invalid or has expired. Generate a new key at https://platform.openai.com/api-keys
```

### Not Configured
```
Testing: Windy API...
  ⊘  Windy API key not configured (WINDY_API_KEY) - Optional integration

Skipped Tests (Not Configured):

  ⊘  Windy
     💡 Set WINDY_API_KEY in .env file if you want this integration. Get your key from https://api.windy.com/
```

## Error Handling

The script detects and reports:

- **401 Unauthorized**: Invalid or expired API key
- **403 Forbidden**: Insufficient permissions
- **429 Too Many Requests**: Rate limit exceeded
- **Timeout**: No response within 15 seconds
- **Connection Failed**: Network or DNS issues

Each error includes:
- Clear error message
- HTTP status code
- Specific recommendation for fixing the issue
- Link to provider's dashboard

## Exit Codes

- `0`: All tested APIs passed (or no APIs configured)
- `1`: One or more APIs failed validation

This makes the script suitable for CI/CD pipelines:

```bash
# In CI/CD
npm run validate:api-keys || echo "API validation failed!"
```

## Environment Variables

The script reads from `.env` file or environment variables. All variables from `.env.example` are supported:

**Required (Core Functionality):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Recommended (Enhanced Features):**
- `VITE_OPENAI_API_KEY`
- `VITE_MAPBOX_ACCESS_TOKEN` or `VITE_MAPBOX_TOKEN`
- `VITE_OPENWEATHER_API_KEY` or `OPENWEATHER_API_KEY`

**Optional (Additional Features):**
- `VITE_AMADEUS_API_KEY` + `AMADEUS_API_SECRET`
- `VITE_ELEVENLABS_API_KEY`
- `WINDY_API_KEY`
- `MARINE_TRAFFIC_API_KEY`
- `VITE_SKYSCANNER_API_KEY`
- `BOOKING_API_KEY`
- And more...

## Best Practices

1. **Before Deployment**: Always run validation before deploying to production
   ```bash
   npm run validate:api-keys && npm run build
   ```

2. **After Key Rotation**: Verify new keys work immediately
   ```bash
   # Update .env with new keys
   npm run validate:api-keys
   ```

3. **Regular Checks**: Schedule periodic validation to catch expired keys
   ```bash
   # Add to cron or CI/CD schedule
   0 9 * * 1 cd /path/to/project && npm run validate:api-keys
   ```

4. **Debugging**: Use validation to diagnose integration issues
   ```bash
   # When feature isn't working
   npm run validate:api-keys | grep -A 5 "Service Name"
   ```

## Timeout Settings

- Default timeout: **15 seconds** per API
- Configurable in script: `makeRequest()` function
- Prevents hanging on unresponsive APIs

## Security Notes

⚠️ **Important:**
- Never commit `.env` files to version control
- Keep API keys secure and rotate regularly
- Use separate keys for development and production
- Set usage limits on provider dashboards
- Monitor API usage for anomalies

## Adding New APIs

To add validation for a new API:

1. Create validation function following the pattern:
   ```javascript
   async function validateNewAPI() {
     logTest('New API');
     const apiKey = process.env.NEW_API_KEY;
     
     if (!apiKey) {
       logSkipped('...');
       recordResult('NewAPI', 'skipped', '...', null, 'recommendation');
       return;
     }
     
     try {
       const response = await makeRequest('https://api.example.com/test', {
         headers: { 'Authorization': `Bearer ${apiKey}` }
       });
       
       if (!response.ok) {
         logError('...');
         recordResult('NewAPI', 'failed', '...', '...', 'recommendation');
         return;
       }
       
       logSuccess('...');
       recordResult('NewAPI', 'passed', '...');
     } catch (error) {
       logError('...');
       recordResult('NewAPI', 'failed', '...', error.message, 'recommendation');
     }
   }
   ```

2. Add to `validateAllAPIs()`:
   ```javascript
   await validateNewAPI();
   console.log('');
   ```

3. Update this README with the new API details

## Troubleshooting

**Script fails to run:**
```bash
# Install dependencies
npm install

# Ensure Node.js version 18+
node --version
```

**"No .env file found" warning:**
- This is normal if using environment variables
- Create `.env` file from `.env.example` if needed

**False positives/negatives:**
- Check your internet connection
- Verify firewall isn't blocking API requests
- Try running with individual API tests
- Check provider's status page

## License

This script is part of the Nautilus One Travel HR Buddy application.

## Support

For issues with the validation script:
1. Check the troubleshooting section above
2. Review API provider documentation
3. Open an issue in the repository
4. Contact the development team
