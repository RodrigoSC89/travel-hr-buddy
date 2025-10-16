# E2E Tests with Playwright - Nautilus One

This directory contains End-to-End (E2E) tests using Playwright for the Nautilus One system.

## 📋 Overview

The E2E tests validate that the main application routes load correctly and function as expected. These tests ensure:

- Routes load without 404 errors
- Pages have visible content
- Navigation structure is accessible
- No critical JavaScript errors occur during page load

## 🚀 Getting Started

### Installation

Playwright is already installed as a dev dependency. To install browsers for testing:

```bash
npx playwright install
```

This will install Chromium, Firefox, and WebKit browsers for cross-browser testing.

### Running Tests

#### Run all E2E tests
```bash
npm run test:e2e
```

#### Run tests with browser UI (headed mode)
```bash
npm run test:e2e:headed
```

#### Run tests with Playwright UI mode
```bash
npm run test:e2e:ui
```

#### View test report
```bash
npm run test:e2e:report
```

## 📁 Test Structure

```
tests/
  └── e2e/
      └── routes.spec.ts    # Main routes validation tests
```

## 🧪 Test Suites

### 1. Main Routes Validation

Tests the core application routes:
- `/` - Home page
- `/documents` - Documents management
- `/checklists` - Intelligent checklists
- `/ai-assistant` - AI Assistant interface
- `/dashboard` - Main dashboard
- `/admin/reports/logs` - System logs
- `/admin/workflows` - Smart workflows
- `/admin/templates` - Template management
- `/mmi/bi` - MMI Business Intelligence

### 2. Navigation and Accessibility

Tests for:
- Valid page titles
- No critical JavaScript errors
- Accessible navigation structure

### 3. Admin Routes Validation

Tests admin panel routes:
- `/admin` - Admin main page
- `/admin/dashboard` - Admin dashboard
- `/admin/documents` - Document management
- `/admin/workflows` - Workflow management
- `/admin/templates` - Template editor

### 4. MMI Routes Validation

Tests MMI (Maritime Management Intelligence) routes:
- `/mmi/jobs` - Jobs panel
- `/mmi/bi` - Business Intelligence dashboard

## ⚙️ Configuration

The Playwright configuration is in `playwright.config.ts` at the project root. Key settings:

- **Base URL**: `http://localhost:8080` (configurable via `PLAYWRIGHT_BASE_URL` env var)
- **Browsers**: Chromium, Firefox, WebKit
- **Test Directory**: `./tests/e2e`
- **Web Server**: Automatically starts dev server before tests
- **Retries**: 2 retries on CI, 0 locally
- **Trace**: Enabled on first retry for debugging

## 🎯 Best Practices

1. **Wait for stable state**: Tests use `waitForLoadState('networkidle')` to ensure pages are fully loaded
2. **No hardcoded delays**: Tests rely on Playwright's auto-waiting instead of `setTimeout`
3. **Cross-browser testing**: Tests run on Chromium, Firefox, and WebKit by default
4. **Error handling**: Tests capture and report JavaScript errors during page load

## 🔧 Customization

### Testing Against Different Environments

Set the `PLAYWRIGHT_BASE_URL` environment variable:

```bash
# Test against staging
PLAYWRIGHT_BASE_URL=https://staging.nautilus.com npm run test:e2e

# Test against production
PLAYWRIGHT_BASE_URL=https://nautilus.com npm run test:e2e
```

### Running Specific Tests

```bash
# Run only route validation tests
npx playwright test routes

# Run tests in a specific file
npx playwright test tests/e2e/routes.spec.ts

# Run a specific test by name
npx playwright test -g "should load Home page"
```

### Debug Mode

```bash
# Run in debug mode with Playwright Inspector
npx playwright test --debug

# Run specific test in debug mode
npx playwright test --debug -g "should load Home page"
```

## 📊 Test Reports

After running tests, view the HTML report:

```bash
npm run test:e2e:report
```

The report includes:
- Test results for each browser
- Screenshots on failure
- Traces for failed tests (viewable in Trace Viewer)
- Test duration and performance metrics

## 🐛 Debugging Failed Tests

1. **View test report**: `npm run test:e2e:report`
2. **Check screenshots**: Failed tests automatically capture screenshots
3. **View traces**: Click on a failed test in the report to view its trace
4. **Run in UI mode**: `npm run test:e2e:ui` for interactive debugging

## 📝 Adding New Tests

To add new route tests, edit `tests/e2e/routes.spec.ts`:

```typescript
test('should load new page', async ({ page }) => {
  await page.goto('/new-route');
  await page.waitForLoadState('networkidle');
  
  // Add assertions
  await expect(page.locator('body')).toBeVisible();
});
```

## 🔗 Useful Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Playwright Assertions](https://playwright.dev/docs/test-assertions)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

## 🤝 Contributing

When adding new features or routes to Nautilus One, please:

1. Add corresponding E2E tests in `tests/e2e/`
2. Ensure all tests pass before committing
3. Update this README if adding new test categories

## 🎉 Summary

E2E tests with Playwright ensure the Nautilus One application works correctly across different browsers and scenarios. These tests provide confidence in deployments and catch regressions early in the development process.
