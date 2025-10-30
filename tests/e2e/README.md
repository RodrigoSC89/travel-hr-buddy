# E2E Tests for Nautilus One System

This directory contains comprehensive end-to-end tests using Playwright for critical system modules.

## 📋 Test Suites

### 1. Mission Engine Tests (`mission-engine.spec.ts`)
Tests the mission-engine module for orchestrating multi-agent missions.

**Coverage:**
- ✅ Page loading without errors
- ✅ Mission execution interface display
- ✅ Mission execution with visual feedback
- ✅ Status updates display
- ✅ Network error handling (no 403/500 errors)
- ✅ Mission steps visualization
- ✅ Performance (no timeouts)
- ✅ Mission logs/history display

### 2. Drone Commander Tests (`drone-commander.spec.ts`)
Tests the drone-commander module for autonomous drone fleet control.

**Coverage:**
- ✅ Page loading without errors
- ✅ Drone fleet overview display
- ✅ Drone status indicators
- ✅ Command execution with visual feedback
- ✅ Real-time monitoring interface
- ✅ WebSocket connection status
- ✅ Drone metrics (battery, signal)
- ✅ Network error handling (no 403/500 errors)
- ✅ Performance (no timeouts)
- ✅ Fleet statistics display
- ✅ Emergency stop command handling
- ✅ Drone logs/activity display

### 3. Authentication Tests (`authentication.spec.ts`)
Tests secure authentication with Supabase.

**Coverage:**
- ✅ Login page display
- ✅ Email format validation
- ✅ Login attempt handling
- ✅ Mock authentication
- ✅ Logout functionality
- ✅ Authentication persistence across reloads
- ✅ Authentication error handling (401/403)
- ✅ Performance (no timeouts)
- ✅ User profile display after authentication

### 4. Dashboard Stability Tests (`dashboard-stability.spec.ts`)
Tests the main dashboard loading and stability.

**Coverage:**
- ✅ Dashboard loading without errors
- ✅ No freezing/hanging
- ✅ Performance (load within timeout)
- ✅ Dashboard widgets display
- ✅ Data loading handling
- ✅ Network error handling
- ✅ Chart rendering
- ✅ Page scrolling
- ✅ Mobile responsiveness
- ✅ Real-time updates without crashing
- ✅ Navigation display
- ✅ Memory leak detection

## 🚀 Running the Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Run All Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug
```

### Run Specific Test Suites
```bash
# Run only mission-engine tests
npx playwright test tests/e2e/mission-engine.spec.ts

# Run only drone-commander tests
npx playwright test tests/e2e/drone-commander.spec.ts

# Run only authentication tests
npx playwright test tests/e2e/authentication.spec.ts

# Run only dashboard stability tests
npx playwright test tests/e2e/dashboard-stability.spec.ts
```

### Run on Specific Browser
```bash
# Chromium only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# WebKit only
npx playwright test --project=webkit
```

## 📸 Screenshots

All tests are configured to automatically capture screenshots:
- Location: `./screenshots/`
- Naming convention: `{module}-{test-case}.png`
- Full page screenshots for better visibility
- Captured at key test points

Examples:
- `mission-engine-loaded.png`
- `mission-engine-executing.png`
- `drone-commander-overview.png`
- `drone-commander-command-sent.png`
- `auth-authenticated.png`
- `dashboard-loaded.png`

## ✅ Success Criteria

According to the requirements, all tests should:
1. ✅ Pass without timeout (< 30 seconds per test)
2. ✅ Have no network errors (403 / 500)
3. ✅ Capture screenshots with UI fully loaded
4. ✅ Verify visual feedback is present

## 🔧 Configuration

The Playwright configuration is in `playwright.config.ts`:
- **Test directory**: `./tests/e2e`
- **Base URL**: `http://localhost:4173` (preview server)
- **Retries**: 2 on CI, 0 locally
- **Timeout**: 30 seconds per test
- **Screenshot**: On failure
- **Trace**: On first retry

## 🐛 Troubleshooting

### Tests timing out
- Increase timeout in test or config
- Check if application is running (`npm run preview`)
- Verify network connectivity

### Screenshots not generated
- Ensure `screenshots/` directory exists
- Check file permissions
- Review test logs for errors

### Authentication failures
- Verify Supabase configuration
- Check environment variables
- Review mock authentication logic

### Browser not launching
- Run `npx playwright install` to install browsers
- Check system dependencies
- Try headed mode: `npm run test:e2e:headed`

## 📊 CI/CD Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run E2E Tests
  run: |
    npm ci
    npx playwright install --with-deps
    npm run build
    npm run test:e2e
```

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Test Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [CI Configuration](https://playwright.dev/docs/ci)

## 🤝 Contributing

When adding new E2E tests:
1. Follow existing naming conventions
2. Add descriptive test names
3. Capture screenshots at key points
4. Include network error checks
5. Add timeout expectations
6. Update this README

## 📝 Notes

- Tests use mock authentication for Supabase
- Real WebSocket/MQTT connections may need mocking in CI
- Screenshot directory is in `.gitignore`
- Tests are cross-browser compatible (Chromium, Firefox, WebKit)

---

*Last updated: 2025-10-30*
