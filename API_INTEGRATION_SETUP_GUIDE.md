# 🔧 API Integration Setup Guide

## Quick Start

This guide will help you set up and configure all external API integrations for the Nautilus One platform.

---

## 📋 Prerequisites

Before starting, ensure you have:
- Node.js 20+ installed
- Access to the repository
- Admin access to Supabase project (for edge function secrets)
- Accounts on required API services

---

## 🔑 Step 1: Get API Keys

### Required Services (High Priority)

#### 1. OpenAI (GPT + Whisper)
**Purpose:** AI chat, voice transcription, document analysis

1. Visit https://platform.openai.com/
2. Sign up or log in
3. Go to API Keys section
4. Click "Create new secret key"
5. Save key securely: `sk-proj-...`

**Cost:** Pay-as-you-go, ~$0.002/1K tokens

#### 2. Mapbox
**Purpose:** Maps, routing, geocoding

1. Visit https://account.mapbox.com/
2. Sign up or log in
3. Go to Tokens section
4. Copy default public token or create new one
5. Save token: `pk.eyJ1...`

**Cost:** Free tier: 50K requests/month

#### 3. OpenWeatherMap
**Purpose:** Weather forecasts, maritime conditions

1. Visit https://openweathermap.org/api
2. Sign up for account
3. Subscribe to API plan (free tier available)
4. Get API key from dashboard
5. Save key

**Cost:** Free tier: 60 calls/minute

#### 4. Amadeus
**Purpose:** Flight and hotel search

1. Visit https://developers.amadeus.com/
2. Create developer account
3. Create new app
4. Get API Key and API Secret
5. Save both credentials

**Cost:** Free test environment, production requires approval

### Recommended Services (Medium Priority)

#### 5. Windy API
**Purpose:** Advanced weather visualization

1. Visit https://api.windy.com/
2. Request API access
3. Get API key after approval
4. Save key

**Cost:** Contact for pricing

#### 6. MarineTraffic
**Purpose:** Real-time vessel tracking

1. Visit https://www.marinetraffic.com/en/ais-api-services
2. Choose API plan
3. Register and purchase plan
4. Get API key
5. Save key

**Cost:** Starts at €50/month

#### 7. Skyscanner
**Purpose:** Flight price comparison

1. Visit https://partners.skyscanner.net/
2. Apply for partnership
3. Wait for approval
4. Get API credentials
5. Save key

**Cost:** Commission-based, no upfront cost

#### 8. Booking.com
**Purpose:** Hotel search and booking

1. Visit https://www.booking.com/affiliate-program
2. Apply for Affiliate Partner Program
3. Wait for approval
4. Request API access
5. Get API credentials

**Cost:** Commission-based

### Optional Services (Low Priority)

#### 9. ElevenLabs
**Purpose:** High-quality text-to-speech

1. Visit https://elevenlabs.io/
2. Sign up for account
3. Go to Profile > API Keys
4. Generate new API key
5. Save key

**Cost:** Free tier: 10K characters/month

#### 10. Stripe
**Purpose:** Payment processing

1. Visit https://stripe.com/
2. Create account
3. Get publishable key from dashboard
4. Save key: `pk_...`

**Cost:** 2.9% + $0.30 per transaction

---

## ⚙️ Step 2: Configure Environment Variables

### Local Development (.env file)

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit the `.env` file and add your API keys:

```env
# ===================================
# CORE SERVICES (REQUIRED)
# ===================================

# Supabase
VITE_SUPABASE_URL=https://vnbptmixvwropvanyhdb.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_PROJECT_ID=vnbptmixvwropvanyhdb

# ===================================
# AI & LLM SERVICES
# ===================================

# OpenAI
VITE_OPENAI_API_KEY=sk-proj-your-key-here

# ===================================
# TRAVEL SERVICES
# ===================================

# Amadeus
VITE_AMADEUS_API_KEY=your-amadeus-key

# Skyscanner (if approved)
# VITE_SKYSCANNER_API_KEY=your-key-here

# ===================================
# MAPS & LOCATION
# ===================================

# Mapbox
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1-your-token-here
VITE_MAPBOX_TOKEN=pk.eyJ1-your-token-here

# ===================================
# WEATHER SERVICES
# ===================================

# OpenWeatherMap
VITE_OPENWEATHER_API_KEY=your-key-here

# Windy (if approved)
# VITE_WINDY_API_KEY=your-key-here

# ===================================
# FLEET TRACKING
# ===================================

# MarineTraffic (if subscribed)
# VITE_MARINETRAFFIC_API_KEY=your-key-here

# ===================================
# OPTIONAL SERVICES
# ===================================

# ElevenLabs
# VITE_ELEVENLABS_API_KEY=your-key-here

# Booking.com
# VITE_BOOKING_API_KEY=your-key-here

# Stripe
# VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-key-here

# ===================================
# FEATURE FLAGS
# ===================================

VITE_ENABLE_VOICE=true
VITE_ENABLE_AI_CHAT=true
VITE_ENABLE_TRAVEL_API=true
```

### Supabase Edge Function Secrets

Configure secrets for Supabase Edge Functions:

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref vnbptmixvwropvanyhdb

# Set secrets
supabase secrets set OPENAI_API_KEY=sk-proj-your-key-here
supabase secrets set AMADEUS_API_KEY=your-key-here
supabase secrets set AMADEUS_API_SECRET=your-secret-here
supabase secrets set OPENWEATHER_API_KEY=your-key-here
supabase secrets set ELEVENLABS_API_KEY=your-key-here
supabase secrets set WINDY_API_KEY=your-key-here
supabase secrets set MARINETRAFFIC_API_KEY=your-key-here
supabase secrets set SKYSCANNER_API_KEY=your-key-here
supabase secrets set BOOKING_API_KEY=your-key-here

# Verify secrets
supabase secrets list
```

---

## 🚀 Step 3: Deploy Edge Functions

### Deploy Windy Weather Function

```bash
supabase functions deploy windy-weather
```

### Test the Function

```bash
curl -X POST 'https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/windy-weather' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "lat": -22.9068,
    "lon": -43.1729,
    "type": "maritime"
  }'
```

---

## ✅ Step 4: Verify Integrations

### Test API Connections

```bash
npm run dev
```

1. Open browser to `http://localhost:5173`
2. Go to Settings > Integrations
3. Check status of each service:
   - ✅ Green = Connected
   - ⚠️ Yellow = Partial
   - ❌ Red = Not configured

### Run Integration Tests

```bash
# Test OpenAI
curl -X POST 'http://localhost:5173/api/test/openai' \
  -H 'Content-Type: application/json' \
  -d '{"message": "Hello"}'

# Test Mapbox
curl 'http://localhost:5173/api/test/mapbox?query=Rio+de+Janeiro'

# Test Weather
curl 'http://localhost:5173/api/test/weather?lat=-22.9&lon=-43.2'
```

---

## 🔍 Step 5: Monitor Usage

### OpenAI
- Dashboard: https://platform.openai.com/usage
- Monitor token usage
- Set spending limits

### Mapbox
- Dashboard: https://account.mapbox.com/
- View request counts
- Monitor quota usage

### OpenWeatherMap
- Dashboard: https://home.openweathermap.org/
- Check API calls
- Monitor rate limits

### Amadeus
- Dashboard: https://developers.amadeus.com/my-apps
- View API usage
- Check test vs production

---

## 🐛 Troubleshooting

### Issue: API key not working

**Solution:**
1. Verify key is correct (no extra spaces)
2. Check if key is active in provider dashboard
3. Verify spending limits not exceeded
4. Check if IP/domain is whitelisted

### Issue: CORS errors

**Solution:**
1. Ensure API calls go through Supabase Edge Functions
2. Check CORS headers in edge function
3. Verify Supabase URL is correct

### Issue: Rate limit exceeded

**Solution:**
1. Check current usage in provider dashboard
2. Implement caching for repeated requests
3. Add retry logic with exponential backoff
4. Consider upgrading plan

### Issue: Edge function deployment fails

**Solution:**
```bash
# Check Supabase CLI version
supabase --version

# Update if needed
npm install -g supabase

# Clear cache and retry
supabase functions delete windy-weather
supabase functions deploy windy-weather
```

---

## 📊 Cost Estimation

### Minimal Setup (Free Tier)
- OpenAI: $0 (first $18 credit)
- Mapbox: $0 (50K requests/month)
- OpenWeatherMap: $0 (60 calls/minute)
- Amadeus: $0 (test environment)
- **Total: $0/month**

### Recommended Setup
- OpenAI: ~$20/month (moderate usage)
- Mapbox: $0 (free tier sufficient)
- OpenWeatherMap: $0 (free tier sufficient)
- Amadeus: $0 (test) or contact for production
- Windy: Contact for pricing
- **Total: ~$20/month**

### Full Production Setup
- OpenAI: $50-200/month
- Mapbox: $5-50/month
- OpenWeatherMap: $0-40/month
- Amadeus: Contact for pricing
- Windy: €50+/month
- MarineTraffic: €50+/month
- Skyscanner: Commission-based
- Booking.com: Commission-based
- ElevenLabs: $5-99/month
- **Total: $150-500+/month**

---

## 🔐 Security Best Practices

### 1. Never Commit API Keys
- Add `.env` to `.gitignore`
- Use `.env.example` for templates only
- Never hardcode keys in source code

### 2. Use Environment Variables
- Access via `import.meta.env.VITE_*`
- Different keys for dev/staging/production
- Rotate keys regularly

### 3. Implement Rate Limiting
- Add request throttling
- Implement caching
- Use retry logic with backoff

### 4. Monitor Usage
- Set up alerts for unusual activity
- Track API costs
- Review logs regularly

### 5. Restrict Access
- Use IP whitelisting when available
- Implement API gateway
- Add authentication to edge functions

---

## 📚 Additional Resources

### Documentation Links
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Mapbox API Docs](https://docs.mapbox.com/api/)
- [OpenWeatherMap API Docs](https://openweathermap.org/api)
- [Amadeus API Docs](https://developers.amadeus.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

### Code Examples
- See `src/services/` for service wrappers
- Check `supabase/functions/` for edge function examples
- Review `API_INTEGRATION_AUDIT.md` for complete integration status

### Support
- GitHub Issues: Report bugs or request features
- Supabase Support: For edge function issues
- API Provider Support: For API-specific questions

---

## ✅ Checklist

Use this checklist to track your setup progress:

### Environment Setup
- [ ] Created `.env` file
- [ ] Added all required API keys
- [ ] Configured Supabase secrets
- [ ] Set feature flags

### Service Configuration
- [ ] OpenAI API key configured
- [ ] Mapbox token configured
- [ ] OpenWeatherMap key configured
- [ ] Amadeus credentials configured

### Deployment
- [ ] Deployed edge functions
- [ ] Tested API connections
- [ ] Verified integration status
- [ ] Monitored initial usage

### Security
- [ ] Keys not committed to git
- [ ] Different keys for dev/prod
- [ ] Set spending limits
- [ ] Configured monitoring

### Documentation
- [ ] Reviewed API documentation
- [ ] Understood rate limits
- [ ] Set up cost monitoring
- [ ] Configured alerts

---

**Need Help?** Open an issue on GitHub or contact the development team.

