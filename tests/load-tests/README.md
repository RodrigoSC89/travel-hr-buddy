# Load Tests - PATCH 561

## Overview
Load and stress testing suite for Travel HR Buddy core modules.

## Test Files

### stress-core.ts
**PATCH 561** - Simulates 100 parallel sessions accessing core system modules.

**Routes Tested:**
- `/dashboard` - Main dashboard
- `/crew-management` - Crew management interface
- `/control-hub` - Control hub operations

**Metrics Monitored:**
- Navigation time (latency)
- DOM content loaded time
- First paint and First Contentful Paint
- Memory usage (JS heap)
- CPU load average
- System memory consumption

**Success Criteria:**
- ✅ System supports 100 sessions without fatal errors
- ✅ Performance report generated
- ✅ Logs stored in `performance_metrics/`

## Running Tests

### Prerequisites
```bash
npm install
```

### Run Stress Test
```bash
# Using tsx (recommended)
npx tsx tests/load-tests/stress-core.ts

# Or add to package.json scripts:
npm run stress:core
```

### Configuration
Edit `stress-core.ts` to modify:
- `NUM_SESSIONS`: Total number of sessions (default: 100)
- `CONCURRENT_SESSIONS`: Parallel sessions (default: 20)
- `BASE_URL`: Application URL (default: http://localhost:5173)
- `CORE_ROUTES`: Routes to test

## Output

### Console Output
Real-time progress with:
- Batch execution status
- System metrics per batch
- Final summary report

### Generated Files

#### Performance Metrics Directory
Location: `/performance_metrics/`

Files:
- `stress-core-YYYY-MM-DDTHH-MM-SS.json` - Full test report (JSON)
- `stress-core-summary-YYYY-MM-DDTHH-MM-SS.txt` - Summary report (TXT)

#### JSON Report Structure
```json
{
  "testConfig": { ... },
  "startTime": "ISO timestamp",
  "endTime": "ISO timestamp",
  "duration": 123.45,
  "totalSessions": 100,
  "successfulSessions": 100,
  "failedSessions": 0,
  "successRate": "100.00%",
  "sessions": [ ... ],
  "systemMetrics": [ ... ],
  "routeStatistics": { ... },
  "overallPerformance": { ... }
}
```

## Interpreting Results

### Success Criteria
- ✅ **100% Success Rate**: All sessions completed without errors
- ✅ **Avg Navigation < 10s**: Good performance under load
- ✅ **No Fatal Errors**: System stability maintained

### Performance Indicators
- **P50 (Median)**: Typical user experience
- **P95**: 95% of users experience better performance
- **P99**: 99% of users experience better performance
- **Max**: Worst-case scenario

### System Health
- **CPU Load**: Should remain stable
- **Memory Usage**: Should not continuously increase (no memory leaks)

## Troubleshooting

### Test Fails to Start
- Ensure Playwright is installed: `npx playwright install`
- Check if application is running at BASE_URL

### High Failure Rate
- Check application logs
- Verify routes are accessible
- Increase TIMEOUT_MS if needed

### Memory Issues
- Reduce CONCURRENT_SESSIONS
- Run on a machine with more RAM
- Enable headless mode (HEADLESS: true)

## Integration

Add to `package.json`:
```json
{
  "scripts": {
    "stress:core": "tsx tests/load-tests/stress-core.ts"
  }
}
```

## Continuous Integration

Example GitHub Actions workflow:
```yaml
- name: Run Stress Test
  run: npm run stress:core
  env:
    VITE_APP_URL: http://localhost:5173
```
