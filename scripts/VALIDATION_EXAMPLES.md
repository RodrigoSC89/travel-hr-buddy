# API Keys Validation - Quick Start Examples

This guide shows common usage scenarios for the API keys validation script.

## 🚀 Basic Usage

### Check All APIs
```bash
npm run validate:api-keys
```

This will check all configured API keys and show their status.

## 📋 Common Scenarios

### Scenario 1: First Time Setup

You've just cloned the repository and want to configure your API keys:

```bash
# 1. Copy the example environment file
cp .env.example .env

# 2. Edit .env and add your keys
nano .env

# 3. Validate your configuration
npm run validate:api-keys
```

**Expected Output:**
```
Testing: OpenAI API...
  ✅ Valid API key - 50 models available (234ms)

Testing: Mapbox API...
  ✅ Valid access token - Geocoding API working (156ms)

Testing: Supabase...
  ✅ Valid Supabase configuration - Instance accessible (89ms)

Success Rate: 100% (3/3 tested)
✅ All configured APIs are working correctly!
```

### Scenario 2: Before Deployment

You want to ensure all API keys are valid before deploying to production:

```bash
# Validate keys and build only if validation passes
npm run validate:api-keys && npm run build
```

**Expected Output (with issues):**
```
Testing: OpenAI API...
  ❌ Invalid or expired API key
     Error: HTTP 401 Unauthorized

Failed Tests:

  ❌ OpenAI
     Error: HTTP 401 Unauthorized
     💡 Recommendation: The API key is invalid or has expired. 
        Generate a new key at https://platform.openai.com/api-keys

⚠️  Some APIs need attention. Please review the failures above.
```

### Scenario 3: Debugging Integration Issues

A feature isn't working and you suspect an API key problem:

```bash
# Run validation to check all integrations
npm run validate:api-keys

# Check specific API by grepping the output
npm run validate:api-keys 2>&1 | grep -A 5 "Mapbox"
```

**Expected Output:**
```
Testing: Mapbox API...
  ✅ Valid access token - Geocoding API working (156ms)
```

### Scenario 4: After Key Rotation

You've rotated your API keys for security and want to verify the new ones work:

```bash
# Update keys in .env
nano .env

# Verify new keys immediately
npm run validate:api-keys

# If validation passes, deploy
npm run validate:api-keys && npm run deploy:vercel
```

### Scenario 5: Setting Up Optional Integrations

You want to add optional features like MarineTraffic:

```bash
# Add the key to .env
echo "MARINE_TRAFFIC_API_KEY=your-key-here" >> .env

# Validate it works
npm run validate:api-keys 2>&1 | grep -A 3 "MarineTraffic"
```

**Expected Output:**
```
Testing: MarineTraffic API...
  ✅ API key configured (endpoint test not available)
     Note: MarineTraffic API validation requires specific vessel ID - key is configured
```

### Scenario 6: CI/CD Pipeline Integration

Add validation to your CI/CD pipeline:

**GitHub Actions:**
```yaml
# .github/workflows/deploy.yml
- name: Validate API Keys
  run: npm run validate:api-keys
  env:
    VITE_OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    VITE_MAPBOX_TOKEN: ${{ secrets.MAPBOX_TOKEN }}
    # ... other keys from GitHub Secrets

- name: Build
  if: success()
  run: npm run build
```

**GitLab CI:**
```yaml
# .gitlab-ci.yml
validate:
  stage: test
  script:
    - npm install
    - npm run validate:api-keys
  only:
    - main
    - staging
```

### Scenario 7: Scheduled Health Checks

Set up a cron job to regularly check API keys:

```bash
# Add to crontab (crontab -e)
# Check every Monday at 9 AM
0 9 * * 1 cd /path/to/project && npm run validate:api-keys | mail -s "API Keys Health Report" admin@example.com
```

### Scenario 8: Partial Configuration

You only have some API keys configured and want to see what's missing:

```bash
npm run validate:api-keys
```

**Expected Output:**
```
Testing: OpenAI API...
  ✅ Valid API key - 50 models available (234ms)

Testing: Mapbox API...
  ⊘  Mapbox API key not configured

Testing: Amadeus API...
  ⊘  Amadeus API credentials not configured

Skipped Tests (Not Configured):

  ⊘  Mapbox
     💡 Set VITE_MAPBOX_ACCESS_TOKEN in .env file. 
        Get your token from https://account.mapbox.com/

  ⊘  Amadeus
     💡 Set VITE_AMADEUS_API_KEY and AMADEUS_API_SECRET in .env file.
        Get credentials from https://developers.amadeus.com/
```

## 🎯 Understanding the Output

### Status Icons

- ✅ **Passed**: API key is valid and working
- ❌ **Failed**: API key has issues (expired, invalid, etc.)
- ⊘ **Skipped**: API key not configured

### Response Time

Numbers in parentheses (e.g., `(234ms)`) show how long the API took to respond:
- **< 200ms**: Excellent
- **200-500ms**: Good
- **500-1000ms**: Acceptable
- **> 1000ms**: Slow, may need investigation

### Exit Codes

- `0`: Success (all tested APIs passed or no APIs configured)
- `1`: Failure (one or more APIs failed)

Use in scripts:
```bash
if npm run validate:api-keys; then
  echo "All APIs working!"
  npm run deploy
else
  echo "Fix API keys before deploying"
  exit 1
fi
```

## 🔧 Troubleshooting Tips

### "fetch failed" Errors

**Problem:** Network connectivity issues

**Solution:**
```bash
# Check internet connection
ping api.openai.com

# Check DNS resolution
nslookup api.openai.com

# Check firewall/proxy settings
curl -I https://api.openai.com/v1/models
```

### "Invalid API key" for Valid Keys

**Problem:** Key might be for wrong environment (test vs production)

**Solution:**
- Verify you're using production keys for production
- Check the key format matches the provider's documentation
- Ensure no extra spaces or characters in .env file

### Timeouts

**Problem:** Slow network or API

**Solution:**
```bash
# Run with verbose output (if implemented)
DEBUG=* npm run validate:api-keys

# Or check individual APIs manually
curl -w "@curl-format.txt" https://api.openai.com/v1/models \
  -H "Authorization: Bearer $VITE_OPENAI_API_KEY"
```

### Rate Limiting

**Problem:** Too many validation attempts

**Solution:**
- Wait before re-running validation
- Check your API quota on provider's dashboard
- Consider implementing delays between checks in the script

## 📚 Additional Resources

- [Full Validation Documentation](./README_API_VALIDATION.md)
- [API Keys Setup Guide](../API_KEYS_SETUP_GUIDE.md)
- [Environment Variables Guide](../.env.example)
- [Main README](../README.md)

## 💡 Pro Tips

1. **Add to pre-commit hook**: Ensure keys are valid before committing
   ```bash
   # .husky/pre-commit
   npm run validate:api-keys
   ```

2. **Monitor regularly**: Set up monitoring to catch expired keys early

3. **Document failures**: Keep track of validation failures for security audits

4. **Test in staging**: Always validate in staging environment first

5. **Use separate keys**: Different keys for dev, staging, and production

6. **Set alerts**: Configure alerts when validation fails in production
