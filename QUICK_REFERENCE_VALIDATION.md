# API Keys Validation - Quick Reference Card

## 🚀 Quick Start

```bash
# Run validation
npm run validate:api-keys
```

## 📊 What It Does

✅ Tests 10+ external API integrations  
✅ Verifies keys are valid and not expired  
✅ Shows response times  
✅ Provides fix recommendations  

## 🎯 Common Commands

```bash
# Basic validation
npm run validate:api-keys

# Before deployment
npm run validate:api-keys && npm run build

# Check specific API
npm run validate:api-keys 2>&1 | grep -A 5 "OpenAI"

# Use in CI/CD
npm run validate:api-keys || exit 1
```

## 📝 Supported APIs

| API | Required Env Vars | Status |
|-----|------------------|--------|
| OpenAI | `VITE_OPENAI_API_KEY` | ✅ Full test |
| Mapbox | `VITE_MAPBOX_ACCESS_TOKEN` | ✅ Full test |
| Amadeus | `VITE_AMADEUS_API_KEY` + `AMADEUS_API_SECRET` | ✅ Full test |
| Supabase | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` | ✅ Full test |
| OpenWeather | `VITE_OPENWEATHER_API_KEY` | ✅ Full test |
| ElevenLabs | `VITE_ELEVENLABS_API_KEY` | ✅ Full test |
| Windy | `WINDY_API_KEY` | ⚠️ Config check |
| MarineTraffic | `MARINE_TRAFFIC_API_KEY` | ⚠️ Config check |
| Skyscanner | `VITE_SKYSCANNER_API_KEY` | ⚠️ Config check |
| Booking.com | `BOOKING_API_KEY` | ⚠️ Config check |

## 🎨 Output Symbols

- ✅ = Test passed
- ❌ = Test failed
- ⊘ = Not configured (skipped)

## 🔍 Exit Codes

- `0` = All tests passed or no tests run
- `1` = One or more tests failed

## 🆘 Common Issues

### All APIs Skipped?
→ Create `.env` file from `.env.example` and add your keys

### 401 Unauthorized?
→ API key is invalid or expired - generate new key

### 429 Rate Limit?
→ Too many requests - wait and retry

### Timeout?
→ Check internet connection and firewall

## 📚 Documentation

- **Technical Details**: `scripts/README_API_VALIDATION.md`
- **Usage Examples**: `scripts/VALIDATION_EXAMPLES.md`
- **Implementation**: `IMPLEMENTATION_SUMMARY.md`
- **API Setup**: `API_KEYS_SETUP_GUIDE.md`

## 💡 Pro Tips

1. **Run before deployment**: `npm run validate:api-keys && npm run build`
2. **Add to pre-commit**: Validates keys before committing
3. **Use in CI/CD**: Catch issues before they reach production
4. **Check regularly**: Set up cron jobs for periodic validation
5. **Monitor response times**: High times may indicate API issues

## 🔗 Quick Links

- Get OpenAI key: https://platform.openai.com/api-keys
- Get Mapbox token: https://account.mapbox.com/
- Get Amadeus keys: https://developers.amadeus.com/
- Get Supabase keys: https://supabase.com/dashboard
- Get OpenWeather key: https://openweathermap.org/api

## 🎓 Example Output

```
Testing: OpenAI API...
  ✅ Valid API key - 50 models available (234ms)

Testing: Mapbox API...
  ✅ Valid access token - Geocoding API working (156ms)

Success Rate: 100% (2/2 tested)
✅ All configured APIs are working correctly!
```

---

**Need Help?** See full documentation in `scripts/README_API_VALIDATION.md`
