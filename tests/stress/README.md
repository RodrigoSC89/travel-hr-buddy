# Stress Testing & Load Simulation
**PATCH 156.0 - Nautilus One**

Automated stress testing suite for measuring system performance under load.

## 🎯 Overview

This suite provides comprehensive stress testing for:
- Supabase database operations
- AI API calls (OpenAI with batching)
- Dashboard rendering and responsiveness

## 📋 Prerequisites

### For K6 Tests (Supabase)
```bash
# Install k6
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6
```

### For AI & Dashboard Tests
```bash
npm install
```

## 🚀 Running Tests

### 1. Supabase Load Test
Tests database operations under load:
```bash
# Set environment variables
export VITE_SUPABASE_URL="your-supabase-url"
export VITE_SUPABASE_KEY="your-anon-key"

# Run test
k6 run tests/stress/k6-supabase-stress.js

# Run with custom VUs (Virtual Users)
k6 run --vus 100 --duration 5m tests/stress/k6-supabase-stress.js
```

### 2. AI API Stress Test
Tests OpenAI API with batching:
```bash
# Set environment variable
export VITE_OPENAI_API_KEY="your-openai-key"

# Run test
node tests/stress/ai-api-stress.js
```

### 3. Dashboard Stress Test
Tests UI rendering and responsiveness:
```bash
# For local testing
export VITE_APP_URL="http://localhost:5173"

# For production
export VITE_APP_URL="https://your-app.vercel.app"

# Run test
node tests/stress/dashboard-stress.js
```

### 4. Run All Tests
```bash
npm run stress:all
```

## 📊 Metrics Collected

### Latency
- Average response time
- P50, P95, P99 percentiles
- Maximum latency
- Request distribution

### Failure Rate
- Total requests
- Failed requests
- Success rate percentage
- Error types and distribution

### Resource Consumption
- Memory usage (JavaScript heap)
- CPU usage (via system monitor)
- Network bandwidth
- Request throughput

### Dashboard-Specific
- Page load time
- First Contentful Paint (FCP)
- Time to Interactive (TTI)
- DOM Content Loaded
- Console errors

## 📈 Reports

All test results are saved to the `reports/` directory:

- `reports/stress-test-supabase.json` - Supabase load test results
- `reports/stress-test-ai-api.json` - AI API stress test results
- `reports/stress-test-dashboard.json` - Dashboard stress test results
- `reports/stress-screenshots/` - Dashboard screenshots during tests

## 🎛️ Configuration

### K6 Test Configuration
Edit `tests/stress/k6-supabase-stress.js`:
```javascript
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up
    { duration: '1m', target: 50 },   // Increase load
    { duration: '2m', target: 100 },  // Peak load
    { duration: '1m', target: 50 },   // Ramp down
    { duration: '30s', target: 0 },   // Cool down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'],
    'failed_requests': ['rate<0.1'],
  },
};
```

### AI Test Configuration
Edit `tests/stress/ai-api-stress.js`:
```javascript
const CONFIG = {
  CONCURRENT_REQUESTS: 10,
  TOTAL_REQUESTS: 50,
  BATCH_SIZE: 5,
  TIMEOUT_MS: 30000,
};
```

### Dashboard Test Configuration
Edit `tests/stress/dashboard-stress.js`:
```javascript
const CONFIG = {
  NUM_ITERATIONS: 20,
  DASHBOARDS: [
    '/analytics',
    '/dashboard',
    '/bi-jobs',
  ],
};
```

## 🎯 Performance Targets

### Supabase
- ✅ P95 latency < 2000ms
- ✅ Failure rate < 10%
- ✅ Throughput > 50 req/s

### AI API
- ✅ Average latency < 3000ms
- ✅ P95 latency < 5000ms
- ✅ Failure rate < 5%
- ✅ Token efficiency > 100 tokens/request

### Dashboards
- ✅ Page load < 3000ms
- ✅ First Contentful Paint < 1500ms
- ✅ Zero console errors
- ✅ Memory usage < 100MB

## 🔧 Troubleshooting

### K6 Not Found
```bash
# Verify installation
k6 version

# If not installed, follow installation steps above
```

### Rate Limiting
If you hit rate limits:
- Reduce concurrent requests
- Increase delays between batches
- Use API keys with higher limits
- Implement exponential backoff

### Memory Issues
For dashboard tests with memory errors:
- Reduce NUM_ITERATIONS
- Close other applications
- Increase Node.js memory limit:
```bash
NODE_OPTIONS="--max-old-space-size=4096" node tests/stress/dashboard-stress.js
```

## 📝 CI/CD Integration

Add to your GitHub Actions workflow:
```yaml
- name: Run Stress Tests
  run: |
    npm run stress:all
  env:
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_KEY: ${{ secrets.VITE_SUPABASE_KEY }}
    VITE_OPENAI_API_KEY: ${{ secrets.VITE_OPENAI_API_KEY }}
```

## 🚀 Next Steps

1. Run baseline tests before major deployments
2. Compare metrics across releases
3. Set up automated alerts for performance degradation
4. Integrate with monitoring dashboards
5. Schedule regular stress tests in CI/CD

## 📖 Related Documentation

- [K6 Documentation](https://k6.io/docs/)
- [OpenAI API Limits](https://platform.openai.com/docs/guides/rate-limits)
- [Supabase Performance](https://supabase.com/docs/guides/platform/performance)
- [Playwright Testing](https://playwright.dev/docs/intro)
