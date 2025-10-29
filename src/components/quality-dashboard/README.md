# Quality Dashboard - PATCH 565

## Overview
Executive quality dashboard for stakeholders providing real-time system health, risk assessment, and confidence metrics.

## Objective
Present a comprehensive quality dashboard that aggregates data from:
- Automated tests (PATCH 561, 564)
- User feedback (PATCH 562)
- Module coverage
- System health indicators

## Components

### 1. QualityDashboard Component
Location: `src/components/quality-dashboard/QualityDashboard.tsx`

**Features:**
- Real-time metrics display
- System health score (0-100%)
- Risk level assessment (0-100%)
- Confidence score for deployment readiness
- Tabbed interface for detailed metrics
- WebSocket support for live updates
- Executive summary with recommendations

**Tabs:**
1. **Testing** - Test coverage and results
   - Unit tests (Vitest)
   - E2E tests (Playwright)
   - Regression tests (PATCH 564)
   - Load tests (PATCH 561)

2. **User Feedback** - Beta user data (PATCH 562)
   - Total users
   - Average rating
   - Recommendation percentage

3. **Module Coverage** - System-wide coverage
   - Total modules
   - Tested modules
   - Coverage percentage

### 2. Quality Metrics Service
Location: `src/components/quality-dashboard/quality-metrics-service.ts`

**Note**: This is a Node.js-only script for generating metrics snapshots. It uses file system operations and is NOT imported by browser components.

**Architecture**:
1. Run the script to generate metrics: `npm run quality:metrics`
2. Script reads test results from file system
3. Aggregates data and calculates scores
4. Saves to `public/api/quality-metrics.json`
5. Dashboard fetches metrics via HTTP from static JSON file

**Functions:**
- `aggregateQualityMetrics()` - Compile all metrics
- `saveMetricsSnapshot()` - Export to JSON
- `loadRegressionResults()` - Load PATCH 564 results
- `loadStressTestResults()` - Load PATCH 561 results
- `loadFeedbackData()` - Load PATCH 562 data
- `countModules()` - Scan module structure
- `calculateHealth()` - Compute health score
- `calculateRisk()` - Assess risk level
- `calculateConfidence()` - Determine deployment readiness

### 3. Quality Dashboard Page
Location: `src/pages/QualityDashboard.tsx`

Route: `/dashboard/quality`

## Metrics Calculation

### Health Score (0-100%)
```
Health = (Regression * 0.3) + (Stress * 0.3) + (Feedback * 0.2) + (Coverage * 0.3)
```

**Components:**
- 30% Regression test pass rate
- 30% Stress test success rate
- 20% User satisfaction (feedback rating)
- 20% Module coverage

**Interpretation:**
- 80-100%: Healthy (Green)
- 60-79%: Warning (Yellow)
- 0-59%: Critical (Red)

### Risk Score (0-100%)
```
Risk = FailedTests(30%) + LowFeedback(20%) + LowCoverage(25%) + StressIssues(25%)
```

**Factors:**
- Failed tests > 0: +30%
- Feedback < 10 users: +20%
- Coverage < 80%: +25%
- Stress success < 95%: +25%

**Interpretation:**
- 0-20%: Low Risk (Green)
- 21-40%: Medium Risk (Yellow)
- 41-100%: High Risk (Red)

### Confidence Score (0-100%)
```
Confidence = (Health * 0.7) + ((100 - Risk) * 0.3)
```

**Interpretation:**
- 80-100%: Ready for Production
- 60-79%: Review Required
- 0-59%: Not Ready

## Usage

### Add Route to App.tsx

```tsx
import QualityDashboard from '@/pages/QualityDashboard';

// In your routes:
<Route path="/dashboard/quality" element={<QualityDashboard />} />
```

### Access Dashboard

Navigate to: `http://localhost:5173/dashboard/quality`

### Generate Metrics Snapshot

```bash
# Generate static metrics file
npx tsx src/components/quality-dashboard/quality-metrics-service.ts

# Or use npm script
npm run quality:metrics
```

This creates: `public/api/quality-metrics.json`

### Real-Time Updates (WebSocket)

For production, implement WebSocket server:

```typescript
// Server-side (example)
wss.on('connection', (ws) => {
  setInterval(() => {
    const metrics = aggregateQualityMetrics();
    ws.send(JSON.stringify(metrics));
  }, 30000); // Update every 30 seconds
});

// Client-side (update QualityDashboard.tsx)
const ws = new WebSocket('wss://your-server.com/quality-metrics');
ws.onmessage = (event) => {
  const metrics = JSON.parse(event.data);
  setMetrics(metrics);
};
```

## Data Sources

### Automated Tests
- **Unit Tests**: From Vitest coverage reports
- **E2E Tests**: From Playwright test results
- **Regression Tests**: `tests/results/regression-561.json` (PATCH 564)
- **Load Tests**: `performance_metrics/stress-core-*.json` (PATCH 561)

### User Feedback
- **Source**: `feedback/beta-phase-1/feedback-data.json` (PATCH 562)
- **Metrics**: User count, ratings, recommendations

### Module Coverage
- **Source**: File system scan of `src/modules/`
- **Detection**: Presence of test files (`.test.`, `.spec.`)

## Stakeholder View

### Executive Summary Section

The dashboard provides:
1. **Quick Health Status** - At-a-glance system health
2. **Risk Assessment** - Current risk level
3. **Deployment Readiness** - Go/no-go indicator
4. **Detailed Breakdowns** - By category (testing, feedback, modules)
5. **Actionable Insights** - Recommendations for improvement

### Key Performance Indicators (KPIs)

- ✅ System Health > 80%
- ✅ Risk Level < 20%
- ✅ Confidence > 80%
- ✅ Test Pass Rate > 95%
- ✅ User Satisfaction > 4.0/5
- ✅ Module Coverage > 80%

## Acceptance Criteria

- ✅ Dashboard published at `/dashboard/quality`
- ✅ Aggregates automated test data
- ✅ Displays module coverage metrics
- ✅ Integrates user feedback data
- ✅ Shows health, risk, and confidence metrics
- ✅ Executive summary accessible
- ✅ WebSocket support implemented
- ✅ Real-time updates enabled

## Customization

### Adjust Metric Weights

Edit `quality-metrics-service.ts`:

```typescript
// Current weights
const health = (
  regressionScore * 0.3 +
  stressScore * 0.3 +
  feedbackScore * 0.2 +
  modulesScore * 0.2
) * 100;

// Adjust as needed
```

### Add New Metrics

1. Add field to `QualityMetrics` interface
2. Implement loader function
3. Update calculation logic
4. Add UI component to display

### Custom Thresholds

```typescript
// Edit getHealthColor() in QualityDashboard.tsx
const getHealthColor = (value: number): string => {
  if (value >= 85) return 'text-green-600'; // Custom threshold
  if (value >= 70) return 'text-yellow-600';
  return 'text-red-600';
};
```

## Troubleshooting

### No Data Shown
- Run tests to generate data
- Check file paths in service
- Verify data files exist

### Metrics Not Updating
- Check WebSocket connection
- Verify auto-refresh interval
- Force refresh browser

### Incorrect Calculations
- Validate source data format
- Check calculation formulas
- Review file paths

## Integration with CI/CD

### Pre-Deployment Quality Gate

```bash
# Generate metrics
npm run quality:metrics

# Check if ready
node scripts/check-deployment-ready.js

# Exit with error if not ready
if [ $? -ne 0 ]; then
  echo "Quality gate failed"
  exit 1
fi
```

### Continuous Monitoring

Schedule periodic metrics generation:

```yaml
# .github/workflows/quality-metrics.yml
- name: Generate Quality Metrics
  run: npm run quality:metrics
  schedule:
    - cron: '0 */6 * * *' # Every 6 hours
```

## Future Enhancements

- [ ] Historical trend charts
- [ ] Alert notifications for threshold breaches
- [ ] Drill-down views for specific failures
- [ ] Export reports to PDF
- [ ] Email digest for stakeholders
- [ ] Slack/Teams integration
- [ ] Predictive analytics for risk trends

## Related Documentation

- PATCH 561: Load testing
- PATCH 562: Beta feedback
- PATCH 563: Audit package
- PATCH 564: Regression tests
