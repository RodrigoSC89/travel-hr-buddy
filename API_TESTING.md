# API Testing Documentation

## Overview

This documentation describes the API testing functionality implemented in the Nautilus One system for validating external API integrations.

## Purpose

The API Test Panel provides a centralized interface to:
- Validate API credentials are correctly configured
- Test connectivity to external services
- Verify APIs are ready for production use
- Debug authentication and configuration issues

## Available APIs

### 1. **Mapbox** - Maps and Location Services
- **Test Functions**: `testMapbox()`, `testMapboxConnection()`
- **Environment Variables**: `VITE_MAPBOX_ACCESS_TOKEN` or `VITE_MAPBOX_TOKEN`
- **Use Case**: Geocoding, mapping, location services

### 2. **OpenAI** - AI Chat and Assistant
- **Test Functions**: `testOpenAI()`, `testOpenAIConnection()`
- **Environment Variable**: `VITE_OPENAI_API_KEY`
- **Use Case**: AI chat, assistant features, natural language processing

### 3. **Amadeus** - Travel Booking
- **Test Function**: `testAmadeus()`
- **Environment Variables**: `VITE_AMADEUS_API_KEY`, `VITE_AMADEUS_API_SECRET`
- **Use Case**: Flight information, travel bookings, hotel searches

### 4. **OpenWeather** - Weather Data
- **Test Function**: `testOpenWeather()`
- **Environment Variable**: `VITE_OPENWEATHER_API_KEY`
- **Use Case**: Weather data, forecasts, maritime weather

### 5. **ElevenLabs** - Text-to-Speech
- **Test Function**: `testElevenLabs()`
- **Environment Variable**: `VITE_ELEVENLABS_API_KEY`
- **Use Case**: Voice synthesis, text-to-speech, voice interfaces

### 6. **Windy** - Weather and Marine Forecasts
- **Test Functions**: `testWindy()`, `testWindyConnection()`
- **Environment Variables**: `VITE_WINDY_API_KEY`, `VITE_OPENWEATHER_API_KEY`
- **Use Case**: Wind forecasts, marine weather, detailed meteorological data

### 7. **Skyscanner** - Flight Search
- **Test Functions**: `testSkyscanner()`, `testSkyscannerConnection()`
- **Environment Variables**: `VITE_SKYSCANNER_API_KEY`, `VITE_RAPIDAPI_KEY`
- **Use Case**: Flight search, price comparison, travel deals

### 8. **Stripe** - Payment Processing
- **Test Function**: `testStripe()`
- **Environment Variables**: `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_STRIPE_SECRET_KEY`
- **Use Case**: Payment processing, subscriptions, invoicing

### 9. **Supabase** - Database and Auth
- **Test Function**: `testSupabase()`
- **Environment Variables**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Use Case**: Database operations, authentication, real-time data

## Usage

### Via UI

1. Navigate to **Advanced Integrations Hub** → **Testing** tab
2. Select **APIs Externas** tab
3. Click "Test All APIs" to test all services at once
4. Or click individual "Run Test" buttons for specific services
5. View results with status, response data, and errors

### Programmatic Usage

```typescript
import { testMapbox, testOpenAI } from '@/services';

// Test a single API
const result = await testMapbox();
if (result.success) {
  console.log('Mapbox is working:', result.message);
  console.log('Response data:', result.data);
} else {
  console.error('Mapbox error:', result.error);
}

// Test multiple APIs
const apis = [testMapbox, testOpenAI, testAmadeus];
const results = await Promise.all(apis.map(fn => fn()));
```

## Service Files Structure

All API test functions are located in the `src/services/` directory:

```
src/services/
├── index.ts           # Central exports
├── mapbox.ts          # Mapbox API tests
├── openai.ts          # OpenAI API tests
├── amadeus.ts         # Amadeus API tests
├── openweather.ts     # OpenWeather API tests
├── elevenlabs.ts      # ElevenLabs API tests
├── windy.ts           # Windy API tests
├── skyscanner.ts      # Skyscanner API tests
├── stripe.ts          # Stripe API tests
└── supabase.ts        # Supabase API tests
```

## Test Response Format

Test functions return consistent response formats:

```typescript
// Simplified version for API Test Panel
interface TestResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

// Detailed version with metrics
interface TestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  data?: any;
  error?: string;
}
```

## Configuration

Add the following to your `.env` file:

```bash
# External APIs
VITE_AMADEUS_API_KEY=your-key
VITE_AMADEUS_API_SECRET=your-secret
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ...
VITE_OPENAI_API_KEY=sk-proj-...
VITE_OPENWEATHER_API_KEY=your-key
VITE_ELEVENLABS_API_KEY=your-key
VITE_WINDY_API_KEY=your-key
VITE_SKYSCANNER_API_KEY=your-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_SECRET_KEY=sk_test_...
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Features

### API Test Panel

The `APITestPanel` component provides:
- **Visual Status Indicators**: Connection status for each API
- **Individual Testing**: Test APIs one at a time
- **Batch Testing**: Test all APIs simultaneously
- **Configuration Status**: Shows which APIs are configured
- **Response Details**: Displays API response data
- **Error Reporting**: Clear error messages for debugging
- **Last Test Time**: Tracks when each API was last tested

## Best Practices

1. **Test Before Production**: Always test APIs before deploying
2. **Secure Credentials**: Never commit API keys to version control
3. **Monitor Regularly**: Run tests periodically to ensure availability
4. **Handle Failures**: Implement fallbacks for API failures
5. **Rate Limiting**: Be aware of API rate limits when testing

## Troubleshooting

### API Not Configured
- Check environment variables are set correctly
- Verify `.env` file is present and loaded
- Restart dev server after changing environment variables

### Authentication Errors
- Verify API keys are valid and not expired
- Check keys have necessary permissions
- Ensure keys are for correct environment (test vs production)

### Network Errors
- Check internet connectivity
- Verify firewall/proxy settings
- Ensure API endpoints are accessible

## Integration

The API Test Panel is integrated into:
- `IntegrationTesting` component as "APIs Externas" tab
- Accessible through Advanced Integrations Hub → Testing
- Available from Settings → Integrações
