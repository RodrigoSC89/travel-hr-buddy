# UI Tests

This directory contains Playwright-based UI tests for the Travel HR Buddy application.

## Test Files

### buttons.spec.ts
Tests for button components ensuring:
- No suspended/disabled buttons without proper state
- Minimum touch target size (44x44px for WCAG AAA compliance)
- Proper focus states for keyboard navigation
- State consistency between disabled attribute and visual appearance
- Proper loading states
- Keyboard accessibility
- ARIA labels for icon-only buttons

### accessibility.spec.ts
Comprehensive accessibility tests ensuring:
- WCAG 2.1 AA compliance across critical routes
- Proper color contrast (4.5:1 for normal text)
- Heading hierarchy
- Form label accessibility
- Keyboard-accessible interactive elements
- Proper landmark regions
- No duplicate IDs
- Alt text for images

## Running Tests

```bash
# Run all UI tests
npx playwright test tests/ui/

# Run button tests only
npx playwright test tests/ui/buttons.spec.ts

# Run accessibility tests only
npx playwright test tests/ui/accessibility.spec.ts

# Run with specific browser
npx playwright test tests/ui/ --project=chromium

# Run in headed mode (see the browser)
npx playwright test tests/ui/ --headed

# Run in debug mode
npx playwright test tests/ui/ --debug
```

## CI/CD Integration

These tests are automatically run on every push and pull request via the GitHub Actions workflow:
`.github/workflows/test-ui-buttons.yml`

The workflow:
1. Sets up Node.js 20
2. Installs dependencies
3. Builds the project
4. Installs Playwright browsers
5. Runs button tests
6. Runs accessibility tests
7. Uploads test reports as artifacts

## Test Reports

After tests run in CI, you can download the test report artifact from the Actions tab to view detailed results, including screenshots and traces for failed tests.
