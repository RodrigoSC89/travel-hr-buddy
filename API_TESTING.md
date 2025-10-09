# API Testing Documentation

## Overview

This documentation describes the API testing functionality implemented in the Nautilus One system.

## Purpose

The API Test Panel provides a centralized interface to test and validate all external API integrations used in the Nautilus One platform. This ensures that:

1. All APIs are properly configured with valid credentials
2. Network connectivity to external services is functioning
3. API keys and tokens are correctly authenticated
4. Services are ready for production use

## Available APIs

The system includes test functions for the following external services:

### 1. **Mapbox** - Maps and Location Services
- **Test Function**: `testMapbox()`
- **Environment Variable**: `VITE_MAPBOX_ACCESS_TOKEN` or `VITE_MAPBOX_TOKEN`
- **Use Case**: Geocoding, mapping, location services

### 2. **OpenAI** - AI Chat and Assistant
- **Test Function**: `testOpenAI()`
- **Environment Variable**: `VITE_OPENAI_API_KEY`
- **Use Case**: AI chat, assistant features, natural language processing

### 3. **Amadeus** - Travel Booking
- **Test Function**: `testAmadeus()`
- **Environment Variables**: 
  - `VITE_AMADEUS_API_KEY`
  - `VITE_AMADEUS_API_SECRET`
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
- **Test Function**: `testWindy()`
- **Environment Variable**: `VITE_WINDY_API_KEY`
- **Use Case**: Wind forecasts, marine weather, detailed meteorological data

### 7. **Skyscanner** - Flight Search
- **Test Function**: `testSkyscanner()`
- **Environment Variable**: `VITE_SKYSCANNER_API_KEY`
- **Use Case**: Flight search, price comparison, travel deals

### 8. **Stripe** - Payment Processing
- **Test Function**: `testStripe()`
- **Environment Variables**:
  - `VITE_STRIPE_PUBLISHABLE_KEY` (client-side)
  - `VITE_STRIPE_SECRET_KEY` (server-side)
- **Use Case**: Payment processing, subscriptions, invoicing

### 9. **Supabase** - Database and Auth
- **Test Function**: `testSupabase()`
- **Environment Variables**:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- **Use Case**: Database operations, authentication, real-time data

## Usage

### Via UI

1. Navigate to **Settings** → **Integrações** tab
2. The existing integration settings page shows API configuration
3. Or access the Advanced Integrations Hub (when available in routes)
4. Click on the **Testing** tab
5. Select **APIs Externas** tab
6. Click "Test All APIs" to test all services at once
7. Or click individual "Run Test" buttons for specific services

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
├── supabase.ts        # Supabase API tests
└── ocr-service.ts     # Existing OCR service
```

## Test Response Format

All test functions return a consistent response format:

```typescript
interface TestResponse {
  success: boolean;
  message?: string;    // Success message
  error?: string;      // Error message if failed
  data?: any;          // Additional response data
}
```

## Configuration

### Environment Variables

Add the following to your `.env` file:

```bash
# Mapbox
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ...
VITE_MAPBOX_TOKEN=pk.eyJ...

# OpenAI
VITE_OPENAI_API_KEY=sk-proj-...

# Amadeus
VITE_AMADEUS_API_KEY=your-key
VITE_AMADEUS_API_SECRET=your-secret

# OpenWeather
VITE_OPENWEATHER_API_KEY=your-key

# ElevenLabs
VITE_ELEVENLABS_API_KEY=your-key

# Windy
VITE_WINDY_API_KEY=your-key

# Skyscanner
VITE_SKYSCANNER_API_KEY=your-key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_SECRET_KEY=sk_test_...

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Features

### API Test Panel

The `APITestPanel` component (`src/components/testing/api-test-panel.tsx`) provides:

- **Visual Status Indicators**: Shows connection status for each API
- **Individual Testing**: Test APIs one at a time
- **Batch Testing**: Test all APIs simultaneously
- **Configuration Status**: Shows which APIs are configured
- **Response Details**: Displays API response data
- **Error Reporting**: Clear error messages for debugging
- **Last Test Time**: Tracks when each API was last tested

### Test Results

Each test provides:
- Success/failure status
- Response time
- Configuration status
- Detailed error messages (if any)
- Sample response data
- Timestamp of test execution

## Integration with Existing Components

The API Test Panel is integrated into the existing testing infrastructure:

- Added to `IntegrationTesting` component as a new "APIs Externas" tab
- Accessible through the Advanced Integrations Hub
- Can be accessed from Settings → Integrações

## Best Practices

1. **Test Before Production**: Always test APIs before deploying to production
2. **Secure Credentials**: Never commit API keys to version control
3. **Monitor Regularly**: Run tests periodically to ensure service availability
4. **Handle Failures Gracefully**: Implement fallbacks for API failures
5. **Rate Limiting**: Be aware of API rate limits when running tests

## Troubleshooting

### API Not Configured
- Check that environment variables are set correctly
- Verify `.env` file is present and loaded
- Restart dev server after changing environment variables

### Authentication Errors
- Verify API keys are valid and not expired
- Check that keys have necessary permissions
- Ensure keys are for the correct environment (test vs production)

### Network Errors
- Check internet connectivity
- Verify firewall/proxy settings
- Ensure API endpoints are accessible

### CORS Errors
- Some APIs may not allow browser requests
- Consider using server-side proxies for sensitive operations
- Check API documentation for CORS policies

## Future Enhancements

- Add automated scheduled testing
- Implement API health monitoring dashboard
- Add performance metrics tracking
- Create notification system for API failures
- Add historical test result storage
- Implement API usage analytics
