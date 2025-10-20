# CI UI/Accessibility Validation - Quick Reference

## 🚀 Quick Commands

### Run Tests Locally
```bash
# Install and build
npm ci
npm run build

# Install Playwright browsers
npx playwright install chromium --with-deps

# Run button tests
npx playwright test tests/ui/buttons.spec.ts --project=chromium

# Run UI accessibility tests
npx playwright test tests/ui/accessibility.spec.ts --project=chromium

# Run e2e accessibility tests
npm run test:accessibility

# Run all e2e tests
npm run test:e2e
```

### View Test Results
```bash
# Open Playwright report (after running tests)
npx playwright show-report

# Run tests with UI mode (interactive debugging)
npx playwright test --ui

# Run tests in headed mode (see browser)
npx playwright test --headed
```

## 📋 What This Workflow Tests

### 1. Button Validation (`tests/ui/buttons.spec.ts`)
- ✅ No suspended/disabled buttons without proper state
- ✅ Minimum touch target size (44x44px for maritime use)
- ✅ Proper focus states with visible indicators
- ✅ State consistency (disabled buttons show visual state)
- ✅ Loading state validation
- ✅ Keyboard accessibility
- ✅ ARIA labels for icon-only buttons

### 2. UI Accessibility (`tests/ui/accessibility.spec.ts`)
- ✅ WCAG 2.1 AA compliance for critical routes
- ✅ Color contrast (4.5:1 for normal, 3:1 for large text)
- ✅ Heading hierarchy
- ✅ Form labels
- ✅ UI component colors (primary, secondary, status)
- ✅ Maritime color variants
- ✅ Keyboard-accessible elements
- ✅ Landmark regions
- ✅ No duplicate IDs
- ✅ Image alt text

### 3. E2E Accessibility (`e2e/accessibility.spec.ts`)
- ✅ Contrast validation (minimum 4.5:1)
- ✅ Custom color token validation
- ✅ WCAG compliance on actual routes

## ⚠️ Common Issues and Fixes

### Issue: Accessibility test fails with contrast error
**Fix:** Check color combinations in your components. Use browser DevTools > Accessibility panel to test contrast.

### Issue: Button too small error
**Fix:** Ensure all buttons are at least 44x44px (40x40px minimum). Maritime/offshore requirement for glove use.

### Issue: Missing ARIA label
**Fix:** Add `aria-label` attribute to icon-only buttons.

### Issue: Focus indicator not visible
**Fix:** Ensure buttons have visible outline or ring on focus.

## 🎯 What Changed in This PR

| Before | After |
|--------|-------|
| Accessibility tests were warnings only | ✅ Now mandatory - blocks merge |
| Missing timeout protection | ✅ 15-minute timeout |
| Missing permissions config | ✅ Added `contents: read` |
| Only e2e tests | ✅ Now runs UI + e2e tests |
| No artifact retention | ✅ 30-day retention |

## 🔧 NPM Scripts Reference

```json
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:headed": "playwright test --headed",
  "test:e2e:debug": "playwright test --debug",
  "test:axe": "playwright test --grep @a11y",
  "test:accessibility": "playwright test e2e/accessibility.spec.ts"
}
```

## 📊 Workflow Triggers

The workflow runs on:
- ✅ All pull requests
- ✅ Pushes to `main`
- ✅ Pushes to `develop`
- ✅ Pushes to `feature/**` branches
- ✅ Pushes to `fix/**` branches

## 🎓 Best Practices

1. **Always test locally before pushing**
2. **Fix accessibility issues immediately** - don't bypass them
3. **Use semantic HTML** - helps with accessibility
4. **Test keyboard navigation** - press Tab to navigate
5. **Check color contrast** - use DevTools accessibility panel
6. **Add ARIA labels** - especially for icon-only buttons
7. **Maintain 44x44px touch targets** - maritime requirement

## 🚨 When Tests Fail

1. **Check GitHub Actions artifacts** - Download `ui-test-report`
2. **Run tests locally** - Get detailed error messages
3. **Use Playwright UI mode** - Visual debugging
4. **Check accessibility panel** - Browser DevTools
5. **Review test output** - Contains violation details

## 📚 Related Documentation

- `CI_UI_VALIDATION_SUMMARY.md` - Complete implementation details
- `CI_WORKFLOW_FIX_COMPARISON.md` - Before/after comparison
- `tests/ui/README.md` - UI test documentation

## 🔍 Debug Tips

### View detailed accessibility violations:
```bash
# Run with reporter output
npx playwright test tests/ui/accessibility.spec.ts --reporter=line

# Run specific test
npx playwright test tests/ui/accessibility.spec.ts -g "Dashboard"

# Debug mode
npx playwright test tests/ui/accessibility.spec.ts --debug
```

### Check specific routes:
Edit the test files to focus on specific routes or skip others temporarily during development.

## ✅ Success Criteria

Your PR is ready to merge when:
- ✅ All button validation tests pass
- ✅ All UI accessibility tests pass
- ✅ All e2e accessibility tests pass
- ✅ Build completes successfully
- ✅ No blocking accessibility violations

## 🆘 Getting Help

1. Check test artifacts in GitHub Actions
2. Review error messages in test output
3. Use browser DevTools accessibility panel
4. Consult WCAG 2.1 AA guidelines
5. Test with keyboard navigation (Tab, Enter, Esc)

---

**Remember**: These tests protect users and ensure quality. Don't try to bypass them - fix the underlying issues instead.
