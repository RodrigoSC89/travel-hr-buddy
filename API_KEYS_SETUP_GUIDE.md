# 🔑 API Keys Setup Guide

This guide explains how to configure API keys for the Nautilus One Travel HR Buddy application.

## Overview

The application uses environment variables to securely store API keys for various external services. These are split between:
- **Frontend (Vite)**: Variables prefixed with `VITE_` that are bundled into the client-side app
- **Backend (Supabase Edge Functions)**: Variables configured in Supabase Dashboard

## Environment Variables Structure

### Maps & Weather APIs

#### Mapbox (Interactive Maps)
**Frontend:**
- `VITE_MAPBOX_TOKEN` - Primary Mapbox token for map rendering
- `VITE_MAPBOX_ACCESS_TOKEN` - Secondary Mapbox token for API access

**Backend (Supabase Functions):**
- `MAPBOX_PUBLIC_TOKEN` - Token used by `mapbox-token` Edge Function

**Where to get:** https://account.mapbox.com/

#### OpenWeather (Weather Data)
**Frontend:**
- `VITE_OPENWEATHER_API_KEY` - Optional, for client-side weather data

**Backend (Supabase Functions):**
- `OPENWEATHER_API_KEY` - **Required** for `maritime-weather` and `weather-integration` functions

**Where to get:** https://openweathermap.org/api

#### Windy (Future Integration)
- `WINDY_API_KEY` - Advanced weather visualization (not yet implemented)

**Where to get:** https://api.windy.com/

### Other External APIs

#### OpenAI (AI Features)
- `VITE_OPENAI_API_KEY` - For AI chat and analysis features

#### Amadeus (Travel Data)
- `VITE_AMADEUS_API_KEY` - For flight and travel information

#### ElevenLabs (Voice Services)
- `VITE_ELEVENLABS_API_KEY` - For text-to-speech functionality

## Setup Instructions

### Local Development

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API keys:
   ```bash
   nano .env
   ```

3. Add the required Supabase configuration (minimum required):
   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Add optional API keys for enhanced features:
   ```env
   VITE_MAPBOX_TOKEN=pk.eyJ1...
   VITE_OPENWEATHER_API_KEY=your-key
   ```

### Supabase Edge Functions

To configure environment variables for Supabase Edge Functions:

1. Go to your Supabase Dashboard
2. Navigate to **Edge Functions** → **Settings** → **Secrets**
3. Add the following secrets:
   - `MAPBOX_PUBLIC_TOKEN` - For mapbox-token function
   - `OPENWEATHER_API_KEY` - For weather-integration and maritime-weather functions

### Production Deployment (Vercel/Netlify)

1. Go to your hosting platform's dashboard (Vercel/Netlify)
2. Navigate to **Environment Variables** settings
3. Add all required `VITE_*` prefixed variables
4. Redeploy the application

**Note:** Remember to also configure Supabase Edge Function secrets as described above.

## Required vs Optional Variables

### ✅ Required (Minimum to run)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### ⭐ Recommended (Core features)
- `VITE_MAPBOX_TOKEN` - For map functionality
- `VITE_OPENWEATHER_API_KEY` - For weather features
- `OPENWEATHER_API_KEY` - For Supabase weather functions

### 🎁 Optional (Enhanced features)
- `VITE_OPENAI_API_KEY` - AI chat and analysis
- `VITE_AMADEUS_API_KEY` - Travel booking features
- `VITE_ELEVENLABS_API_KEY` - Voice interactions
- `WINDY_API_KEY` - Future weather visualization

## Affected Features by API Key

### MAPBOX_* Keys
- Interactive vessel tracking maps
- Route visualization
- Port location displays
- Geographic data visualization

### OPENWEATHER_API_KEY
- Maritime weather forecasts
- Current weather conditions
- Weather alerts for vessels
- Marine conditions (waves, wind, etc.)

### WINDY_API_KEY (Future)
- Advanced weather map overlays
- Wind pattern visualization
- Detailed meteorological data

## Troubleshooting

### Maps not loading?
1. Check `VITE_MAPBOX_TOKEN` is set correctly
2. Verify token is valid on Mapbox dashboard
3. Check browser console for API errors

### Weather data not available?
1. Verify `OPENWEATHER_API_KEY` is set in Supabase Dashboard
2. Check Supabase Edge Function logs
3. Ensure API key has necessary permissions

### Environment variables not taking effect?
1. Restart development server after changing `.env`
2. Clear build cache: `rm -rf dist node_modules/.vite`
3. Rebuild: `npm run build`
4. For production: Redeploy after changing environment variables

## Security Best Practices

1. ✅ **Never commit** `.env` file to Git (it's in `.gitignore`)
2. ✅ **Use separate keys** for development and production
3. ✅ **Rotate keys** periodically
4. ✅ **Set usage limits** on your API provider dashboards
5. ✅ **Monitor usage** to detect anomalies
6. ❌ **Don't share** API keys in public channels

## Additional Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Mapbox Token Management](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/)
- [OpenWeather API Documentation](https://openweathermap.org/api)

---

For more information, see:
- `.env.example` - Complete list of all environment variables
- `QUICK_DEPLOY.md` - Deployment guide
- `DOCUMENTACAO_TECNICA_FUNCIONAL_NAUTILUS_ONE.md` - Full technical documentation
