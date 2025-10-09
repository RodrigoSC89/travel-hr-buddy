# 🔑 API Validation System - README Addition

## Add this section to README.md after "Common Scripts"

---

## 🔐 API Key Validation

Nautilus One includes a comprehensive API validation system to test and verify all external API integrations.

### Quick Start

```bash
# Check which API keys are configured (fast, no API calls)
npm run validate:api-keys

# See an interactive demo of the validation system
npm run demo:api-validation

# Start the app and access the visual API tester
npm run dev
# Navigate to: http://localhost:5173/admin/api-tester
```

### Supported APIs

The system validates **9 API integrations**:

**Required** (Core functionality):
- ✅ **Supabase** - Database + Authentication
- ✅ **Mapbox** - Maps + Geolocation

**Optional** (Enhanced features):
- ✅ **OpenAI** - AI Chat + Whisper transcription
- ✅ **Amadeus** - Travel booking and flight data
- ✅ **Weather** - OpenWeather or Windy forecasts
- ✅ **Skyscanner** - Flight search
- ✅ **Booking.com** - Hotel search
- ✅ **MarineTraffic** - Vessel tracking
- ✅ **Whisper** - Audio transcription (uses OpenAI key)

### Validation Features

The validation system provides:

- 🔍 **Configuration Checker** - Fast check of which keys are in `.env`
- 🌐 **Live API Testing** - Real HTTP requests to verify connectivity
- 🎨 **Visual Admin UI** - Beautiful interface at `/admin/api-tester`
- 📊 **Smart Error Detection** - Categorizes errors (unauthorized, expired, rate limited, etc.)
- 💡 **Actionable Recommendations** - Tells you exactly what to do to fix issues
- ⚡ **Response Time Tracking** - Monitors API performance

### API Status Types

| Icon | Status | Meaning | Action |
|------|--------|---------|--------|
| ✅ | `valid` | Working correctly | None needed |
| 🚫 | `unauthorized` | Invalid credentials (401) | Verify and rotate key |
| 🔴 | `expired` | Key expired (403) | Rotate immediately |
| ⏱️ | `rate_limited` | Too many requests (429) | Wait or upgrade plan |
| ⚠️ | `not_configured` | Missing from .env | Add to configuration |
| ❌ | `invalid` | Generic failure | Check credentials and network |

### Usage Examples

**1. Quick Configuration Check (CLI)**
```bash
$ npm run validate:api-keys

╔═══════════════════════════════════════════════╗
║    🔑 API Key Validation Utility              ║
╚═══════════════════════════════════════════════╝

OpenAI - 🟡 OPTIONAL
  Status: ✅ CONFIGURED
  Keys: VITE_OPENAI_API_KEY: sk-p...xyz

Mapbox - 🔴 REQUIRED
  Status: ✅ CONFIGURED
  Keys: VITE_MAPBOX_TOKEN: pk.e...abc

Required APIs: 2/2 configured ✅
Optional APIs: 5/7 configured
```

**2. Visual Testing (Admin UI)**

Navigate to `/admin/api-tester` to:
- Test individual APIs or all at once
- See real-time status updates
- View response times and error messages
- Get detailed success/failure statistics

**3. Programmatic Testing (Code)**
```typescript
import { validateAllAPIKeys } from '@/utils/api-key-validator';

const report = await validateAllAPIKeys();
console.log(`Valid: ${report.validCount}/${report.totalAPIs}`);

// Check specific API
const openai = report.results.find(r => r.name === 'OpenAI');
if (openai?.status === 'valid') {
  console.log('OpenAI is ready!');
}
```

### Pre-Deployment Checklist

Before deploying to production:

```bash
# 1. Validate all API keys
npm run validate:api-keys

# 2. Run live tests
npm run dev
# Visit: http://localhost:5173/admin/api-tester
# Click "Test All APIs"

# 3. Check for any failures
# - Rotate expired keys
# - Fix unauthorized credentials
# - Configure missing required APIs

# 4. Build and deploy
npm run build
```

### Documentation

Comprehensive documentation is available:

- **[API_KEYS_QUICKREF.md](./API_KEYS_QUICKREF.md)** - Quick reference guide
- **[API_VALIDATION_GUIDE.md](./API_VALIDATION_GUIDE.md)** - Complete feature documentation
- **[API_VALIDATION_REPORT.md](./API_VALIDATION_REPORT.md)** - Implementation details
- **[API_KEYS_SETUP_GUIDE.md](./API_KEYS_SETUP_GUIDE.md)** - How to get API keys

### Security

The validation system follows security best practices:

- ✅ Never logs full API keys (only masked: `sk-p...xyz`)
- ✅ Keys stored in `.env` (gitignored)
- ✅ Validates keys before making requests
- ✅ Provides rotation recommendations
- ✅ Detects expired and unauthorized keys

### Troubleshooting

**"API key not configured"**
1. Check `.env` file exists
2. Verify key name matches exactly
3. Restart dev server

**"Unauthorized" (401)**
1. Verify API key is correct
2. Check for typos
3. Regenerate key if needed

**"Expired" (403)**
1. Generate new API key
2. Update `.env`
3. Redeploy

**"Rate limited" (429)**
1. Wait for rate limit reset
2. Reduce testing frequency
3. Consider upgrading API plan

### CI/CD Integration

Add validation to your deployment pipeline:

```yaml
# .github/workflows/deploy.yml
- name: Validate API Keys
  run: npm run validate:api-keys
```

Exit codes:
- `0` - All required APIs configured ✅
- `1` - Missing required APIs ❌

---

For more details, see the comprehensive documentation in the repository.
