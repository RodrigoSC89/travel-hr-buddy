# External API Test Functions - Documentation

## Overview

This implementation provides comprehensive test functions for all external APIs integrated in the Nautilus One system. Each API has a dedicated service file with test functions and utility methods.

## 🗂️ Service Files

### 1. Mapbox Service (`src/services/mapbox-service.ts`)

**Test Function:** `testMapbox()`
- Tests API connection with a sample geocoding request
- Returns success/failure status with sample data

**Additional Functions:**
- `geocodeLocation(query: string)` - Forward geocoding
- `reverseGeocode(longitude, latitude)` - Reverse geocoding

**Environment Variable:** `VITE_MAPBOX_ACCESS_TOKEN` or `VITE_MAPBOX_TOKEN`

```typescript
import { testMapbox, geocodeLocation } from '@/services/mapbox-service';

// Test connection
const result = await testMapbox();
// Returns: { success: boolean, message?: string, error?: string, data?: any }

// Geocode a location
const locations = await geocodeLocation('Rio de Janeiro, Brazil');
```

---

### 2. OpenAI Service (`src/services/openai-service.ts`)

**Test Function:** `testOpenAI()`
- Tests API authentication via models endpoint
- Lists available models

**Additional Functions:**
- `chatCompletion(message: string, model?: string)` - Send chat completions

**Environment Variable:** `VITE_OPENAI_API_KEY`

```typescript
import { testOpenAI, chatCompletion } from '@/services/openai-service';

// Test connection
const result = await testOpenAI();

// Send a chat message
const response = await chatCompletion('Hello, how are you?');
```

---

### 3. Amadeus Service (`src/services/amadeus-service.ts`)

**Test Function:** `testAmadeus()`
- Tests OAuth token generation and API access
- Searches for airports as validation

**Additional Functions:**
- `searchAirports(keyword: string, limit?: number)` - Search airports

**Environment Variables:** 
- `VITE_AMADEUS_API_KEY`
- `VITE_AMADEUS_API_SECRET`

**Note:** This service includes automatic OAuth token management with caching.

```typescript
import { testAmadeus, searchAirports } from '@/services/amadeus-service';

// Test connection
const result = await testAmadeus();

// Search for airports
const airports = await searchAirports('RIO');
```

---

### 4. OpenWeather Service (`src/services/openweather-service.ts`)

**Test Function:** `testOpenWeather()`
- Tests API with a known location (Rio de Janeiro)
- Returns current weather data

**Additional Functions:**
- `getCurrentWeather(city: string)` - Get weather by city name
- `getWeatherByCoordinates(latitude, longitude)` - Get weather by coordinates

**Environment Variable:** `VITE_OPENWEATHER_API_KEY`

```typescript
import { testOpenWeather, getCurrentWeather } from '@/services/openweather-service';

// Test connection
const result = await testOpenWeather();

// Get weather for a city
const weather = await getCurrentWeather('São Paulo');
```

---

### 5. ElevenLabs Service (`src/services/elevenlabs-service.ts`)

**Test Function:** `testElevenLabs()`
- Tests API authentication via user endpoint
- Returns subscription info and usage stats

**Additional Functions:**
- `getVoices()` - List available voices
- `textToSpeech(text: string, voiceId?: string)` - Convert text to speech

**Environment Variable:** `VITE_ELEVENLABS_API_KEY`

```typescript
import { testElevenLabs, textToSpeech } from '@/services/elevenlabs-service';

// Test connection
const result = await testElevenLabs();

// Convert text to speech
const audioBlob = await textToSpeech('Hello world');
```

---

### 6. Windy Service (`src/services/windy-service.ts`)

**Test Function:** `testWindy()`
- Validates API key format
- Returns embed URL information

**Additional Functions:**
- `getWindyEmbedUrl(latitude, longitude, zoom?)` - Get map embed URL
- `getWindyWidgetConfig(latitude, longitude)` - Get widget configuration

**Environment Variable:** `VITE_WINDY_API_KEY`

**Note:** Windy primarily provides map embedding functionality rather than REST API endpoints.

```typescript
import { testWindy, getWindyEmbedUrl } from '@/services/windy-service';

// Test connection
const result = await testWindy();

// Get embed URL
const embedUrl = getWindyEmbedUrl(-22.9068, -43.1729, 8);
```

---

### 7. Skyscanner Service (`src/services/skyscanner-service.ts`)

**Test Function:** `testSkyscanner()`
- Tests API via RapidAPI integration
- Fetches available markets

**Additional Functions:**
- `searchFlights(origin, destination, departDate)` - Search flights

**Environment Variables:** 
- `VITE_SKYSCANNER_API_KEY` or `VITE_RAPIDAPI_KEY`

**Note:** Skyscanner is typically accessed through RapidAPI.

```typescript
import { testSkyscanner, searchFlights } from '@/services/skyscanner-service';

// Test connection
const result = await testSkyscanner();

// Search flights (basic implementation)
const flights = await searchFlights('GRU', 'JFK', '2024-12-01');
```

---

## 🧪 API Test Center UI

### Location
The External API Test Center is integrated into the **Testing Dashboard** page.

**Access:** Navigate to Testing Dashboard → APIs Externas tab

### Features

1. **Category Tabs:**
   - All - View all APIs at once
   - Maps - Mapbox
   - Weather - OpenWeather, Windy
   - Travel - Amadeus, Skyscanner
   - AI - OpenAI
   - Voice - ElevenLabs

2. **Individual Tests:**
   - Click "Test Connection" on any API card
   - See real-time loading state
   - View success/failure results

3. **Bulk Testing:**
   - Click "Test All APIs" to test all services sequentially
   - Automatic delay between tests to avoid rate limiting

4. **Test Results:**
   - Success/failure badge
   - Response time in milliseconds
   - Detailed error messages
   - JSON response data display
   - Timestamp for each test

### Example Test Results

```
✓ Mapbox - Success (234ms)
  "Mapbox API is connected and working properly"
  Data: { testQuery: "Rio de Janeiro, Brazil", resultCount: 1 }

✗ OpenAI - Failed (102ms)
  "OpenAI API key not configured"

✓ OpenWeather - Success (456ms)
  "OpenWeather API is connected and working properly"
  Data: { location: "Rio de Janeiro", temperature: "28°C" }
```

---

## 📋 Setup Instructions

### 1. Configure Environment Variables

Copy `.env.example` to `.env` and add your API keys:

```bash
# Mapbox
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ...

# OpenAI
VITE_OPENAI_API_KEY=sk-proj-...

# Amadeus
VITE_AMADEUS_API_KEY=your_amadeus_key
VITE_AMADEUS_API_SECRET=your_amadeus_secret

# OpenWeather
VITE_OPENWEATHER_API_KEY=your_openweather_key

# ElevenLabs
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key

# Windy
VITE_WINDY_API_KEY=your_windy_key

# Skyscanner (via RapidAPI)
VITE_RAPIDAPI_KEY=your_rapidapi_key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Application

```bash
npm run dev
```

### 4. Access the Test Center

1. Navigate to the Testing Dashboard page
2. Click on the "APIs Externas" tab
3. Test individual APIs or use "Test All APIs"

---

## 🔒 Security Notes

- API keys are loaded from environment variables via `import.meta.env`
- Keys are never exposed in the frontend code or committed to git
- All API calls are made directly from the browser (client-side)
- Consider using a backend proxy for production to secure API keys

---

## 🎯 Use Cases

### Development
- Quickly verify API connectivity during development
- Debug authentication issues
- Test rate limits and response times

### QA/Testing
- Validate all integrations before deployment
- Check API health in staging environments
- Document API behavior and responses

### Production Monitoring
- Health check dashboard for API status
- Quick troubleshooting when integrations fail
- Verify environment variable configuration

---

## 🚀 Next Steps

### Planned Enhancements
1. Add automated scheduled tests
2. Store test history in database
3. Email/Slack notifications for failures
4. Performance benchmarking over time
5. API response caching for common requests
6. Rate limit tracking and warnings

### Integration with Existing Systems
- Connect to `integration-manager.ts` for centralized status
- Add to health monitoring dashboard
- Include in CI/CD pipeline checks
- Integrate with logging and alerting systems

---

## 📚 Related Files

- `src/lib/integration-manager.ts` - Integration management
- `src/lib/api-manager.ts` - Generic API client
- `src/components/integration/connection-test-panel.tsx` - Supabase/API tests
- `src/components/integration/service-status-panel.tsx` - Service status display

---

## 🤝 Contributing

When adding new API integrations:

1. Create a new service file in `src/services/[api-name]-service.ts`
2. Implement a `test[APIName]()` function that returns `{ success, message?, error?, data? }`
3. Add the service to `services` array in `external-api-test-center.tsx`
4. Update this documentation
5. Add environment variable to `.env.example`

---

## 📝 License

This implementation is part of the Nautilus One system. All rights reserved.
