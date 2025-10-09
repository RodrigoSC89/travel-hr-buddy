# 🔑 API Keys Validation System

> **Quick Start:** Run `npm run validate:api-keys` to test all your API integrations!

## 📋 Overview

This system provides automated validation for all external API integrations in the Nautilus One Travel HR Buddy application. It tests each configured API key by making actual API calls to verify they are valid, not expired, and properly authorized.

## 🚀 Getting Started

### Installation

The validation system is already set up! Just make sure dependencies are installed:

```bash
npm install
```

### Basic Usage

```bash
# Validate all configured APIs
npm run validate:api-keys
```

### Setup Your API Keys

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API keys:
   ```bash
   nano .env
   ```

3. Validate your configuration:
   ```bash
   npm run validate:api-keys
   ```

## ✨ Features

### ✅ What Gets Validated

| API | Endpoint | Test Type | Status |
|-----|----------|-----------|--------|
| **OpenAI** | `/v1/models` | Full API call | ✅ |
| **Mapbox** | `/geocoding/v5` | Full API call | ✅ |
| **Amadeus** | `/oauth2/token` | Full API call | ✅ |
| **Supabase** | `/rest/v1` | Full API call | ✅ |
| **OpenWeather** | `/data/2.5/weather` | Full API call | ✅ |
| **ElevenLabs** | `/v1/user` | Full API call | ✅ |
| **Windy** | N/A | Config check | ⚠️ |
| **MarineTraffic** | N/A | Config check | ⚠️ |
| **Skyscanner** | N/A | Config check | ⚠️ |
| **Booking.com** | N/A | Config check | ⚠️ |

### 🎯 Error Detection

The system detects and reports:
- ✅ **Valid keys** - Working and authorized
- ❌ **Invalid keys** - Expired or incorrect
- ⚠️ **Rate limits** - Quota exceeded
- 🔌 **Connection issues** - Network or timeout problems
- ⊘ **Not configured** - Keys not set

### 📊 Detailed Reports

Each validation provides:
- Status (Passed/Failed/Skipped)
- Response time in milliseconds
- Specific error messages
- Actionable recommendations with links
- Success/failure statistics

## 📖 Documentation

Comprehensive documentation is available:

### Quick References
- **[Quick Reference Card](./QUICK_REFERENCE_VALIDATION.md)** - One-page cheat sheet
- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Complete overview

### Detailed Guides
- **[Technical Documentation](./scripts/README_API_VALIDATION.md)** - API details and implementation
- **[Usage Examples](./scripts/VALIDATION_EXAMPLES.md)** - Common scenarios and workflows
- **[API Setup Guide](./API_KEYS_SETUP_GUIDE.md)** - How to configure API keys

## 💻 Usage Scenarios

### Before Deployment
```bash
npm run validate:api-keys && npm run build
```

### In CI/CD Pipeline
```yaml
# GitHub Actions
- name: Validate API Keys
  run: npm run validate:api-keys
```

### Debugging Integration Issues
```bash
npm run validate:api-keys 2>&1 | grep -A 5 "OpenAI"
```

### After Key Rotation
```bash
# Update .env with new keys
npm run validate:api-keys
```

## 🎨 Output Examples

### All APIs Valid
```
Testing: OpenAI API...
  ✅ Valid API key - 50 models available (234ms)

Testing: Mapbox API...
  ✅ Valid access token - Geocoding API working (156ms)

Success Rate: 100% (2/2 tested)
✅ All configured APIs are working correctly!
```

### API Issues Detected
```
Testing: OpenAI API...
  ❌ Invalid or expired API key
     Error: HTTP 401 Unauthorized

Failed Tests:

  ❌ OpenAI
     Error: HTTP 401 Unauthorized
     💡 Recommendation: Generate a new key at https://platform.openai.com/api-keys
```

## 🛠️ Configuration

### Required Environment Variables

**Core Services:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

**Recommended:**
- `VITE_OPENAI_API_KEY` - OpenAI API key
- `VITE_MAPBOX_ACCESS_TOKEN` - Mapbox access token
- `VITE_OPENWEATHER_API_KEY` - OpenWeather API key

**Optional:**
- `VITE_AMADEUS_API_KEY` + `AMADEUS_API_SECRET` - Amadeus credentials
- `VITE_ELEVENLABS_API_KEY` - ElevenLabs API key
- `WINDY_API_KEY` - Windy API key
- `MARINE_TRAFFIC_API_KEY` - Marine Traffic API key
- And more...

See `.env.example` for complete list.

## 🔍 Exit Codes

- `0` - Success (all tested APIs passed or no APIs configured)
- `1` - Failure (one or more APIs failed validation)

Perfect for automation:
```bash
if npm run validate:api-keys; then
  echo "✅ All APIs validated!"
  npm run deploy
else
  echo "❌ Fix API keys before deploying"
  exit 1
fi
```

## 🆘 Troubleshooting

### "No .env file found"
This is normal if using environment variables. Create `.env` from `.env.example` if needed.

### All APIs Skipped
Add your API keys to `.env` file. See [API_KEYS_SETUP_GUIDE.md](./API_KEYS_SETUP_GUIDE.md).

### 401 Unauthorized
API key is invalid or expired. Generate a new key from the provider's dashboard.

### 429 Rate Limit
Too many requests. Wait and retry, or check your quota.

### Timeout Errors
Check internet connection and firewall settings.

## 🔗 Quick Links

### Get API Keys
- [OpenAI](https://platform.openai.com/api-keys)
- [Mapbox](https://account.mapbox.com/)
- [Amadeus](https://developers.amadeus.com/)
- [Supabase](https://supabase.com/dashboard)
- [OpenWeather](https://openweathermap.org/api)
- [ElevenLabs](https://elevenlabs.io/)

### Documentation
- [Main README](./README.md)
- [API Setup Guide](./API_KEYS_SETUP_GUIDE.md)
- [Quick Reference](./QUICK_REFERENCE_VALIDATION.md)
- [Technical Docs](./scripts/README_API_VALIDATION.md)
- [Usage Examples](./scripts/VALIDATION_EXAMPLES.md)

## 📦 Files Structure

```
Project Root:
├── scripts/
│   ├── validate-api-keys.js           # Main validation script
│   ├── README_API_VALIDATION.md       # Technical documentation
│   └── VALIDATION_EXAMPLES.md         # Usage scenarios
├── API_KEYS_SETUP_GUIDE.md           # API setup guide
├── IMPLEMENTATION_SUMMARY.md          # Implementation details
├── QUICK_REFERENCE_VALIDATION.md     # Quick reference card
└── API_VALIDATION_README.md          # This file
```

## 🎓 Best Practices

1. **Validate before deployment**
   ```bash
   npm run validate:api-keys && npm run build
   ```

2. **Add to pre-commit hooks**
   ```bash
   # .husky/pre-commit
   npm run validate:api-keys
   ```

3. **Use in CI/CD pipelines**
   - Catches issues before production
   - Prevents deployment with invalid keys

4. **Regular health checks**
   - Schedule periodic validation
   - Monitor for expired keys

5. **Separate keys for environments**
   - Different keys for dev/staging/production
   - Rotate keys regularly

## 🔐 Security Notes

⚠️ **Important:**
- Never commit `.env` files to version control
- Keep API keys secure and confidential
- Rotate keys regularly
- Set usage limits on provider dashboards
- Monitor API usage for anomalies

## 🎉 Summary

The API validation system makes it easy to:
- ✅ Test all API integrations with one command
- ✅ Catch expired or invalid keys before deployment
- ✅ Get actionable recommendations for issues
- ✅ Integrate with CI/CD pipelines
- ✅ Monitor API health and performance

**Start using it now:**
```bash
npm run validate:api-keys
```

---

For detailed usage instructions, see [VALIDATION_EXAMPLES.md](./scripts/VALIDATION_EXAMPLES.md)

For implementation details, see [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
