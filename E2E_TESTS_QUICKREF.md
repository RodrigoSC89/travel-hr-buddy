# E2E Tests Quick Reference - Nautilus One

## 🚀 Quick Start

### First Time Setup
```bash
# Install Playwright browsers (required only once)
npx playwright install
```

### Running Tests

```bash
# Run all E2E tests (headless mode)
npm run test:e2e

# Run with visible browser window
npm run test:e2e:headed

# Interactive UI mode (recommended for development)
npm run test:e2e:ui

# View last test report
npm run test:e2e:report
```

## 📍 Routes Tested

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/documents` | Documents management |
| `/checklists` | Intelligent checklists |
| `/ai-assistant` | AI Assistant interface |
| `/dashboard` | Main dashboard |
| `/admin/reports/logs` | System logs |
| `/admin/workflows` | Smart workflows |
| `/admin/templates` | Template management |
| `/mmi/bi` | MMI Business Intelligence |

Plus additional admin and MMI routes!

## 🎯 Common Commands

```bash
# Run specific test file
npx playwright test routes.spec.ts

# Run specific test by name
npx playwright test -g "should load Home page"

# Debug mode with Playwright Inspector
npx playwright test --debug

# Run only on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run with custom base URL
PLAYWRIGHT_BASE_URL=https://staging.nautilus.com npm run test:e2e
```

## 📁 File Locations

- **Test Files**: `tests/e2e/routes.spec.ts`
- **Configuration**: `playwright.config.ts`
- **Documentation**: `tests/e2e/README.md`
- **Reports**: `playwright-report/` (generated after test run)

## 🐛 Debugging Failed Tests

1. View HTML report: `npm run test:e2e:report`
2. Check screenshots in `test-results/` folder
3. Use UI mode: `npm run test:e2e:ui`
4. Debug specific test: `npx playwright test --debug -g "test name"`

## 📊 Test Results

After running tests, you'll see:
- ✅ Number of tests passed
- ❌ Number of tests failed
- ⏱️ Total execution time
- 📸 Screenshots for failed tests
- 📹 Traces for debugging

## 💡 Tips

- Use `test:e2e:ui` for the best development experience
- Run tests before committing changes
- View reports for detailed failure information
- Test runs automatically start the dev server on `localhost:8080`

## 🔗 More Information

See full documentation: `tests/e2e/README.md`

---
**Nautilus One E2E Testing with Playwright** 🧪✨
