# 🧭 Nautilus One - Preview Scan Automation

## Overview

This automated preview scan system validates all modules of the Nautilus One system after the final integration. It ensures the Preview Lovable and Vercel deployment are stable without dynamic loading failures.

## Features

✅ **Complete Build Validation** - Verifies the application builds without errors  
✅ **Route Testing** - Validates HTTP 200 and content rendering for all routes  
✅ **Dynamic Import Detection** - Identifies failed dynamic module loads  
✅ **Type Checking** - Ensures full TypeScript type coverage  
✅ **Visual Validation** - Captures screenshots for visual regression testing  
✅ **Performance Metrics** - Measures average page load times  
✅ **Automated Reporting** - Generates comprehensive validation reports  

## Quick Start

### Full Automated Scan

Run the complete preview validation:

```bash
./scripts/preview-scan.sh
```

This will:
1. Build the application
2. Run TypeScript type checking
3. Start the preview server
4. Test all routes with Playwright
5. Capture screenshots
6. Generate validation report

### Individual Commands

```bash
# Build the application
npm run build

# Run type checking
npm run type-check

# Run preview scan tests
npm run preview:scan

# Generate report
npm run preview:scan:report

# Full validation (build + scan + report)
npm run preview:validate
```

## Routes Tested

The following routes are validated:

### Core Routes
- `/` - Home page
- `/dashboard` - Dashboard
- `/maritime` - Maritime System
- `/forecast` - Forecast Module
- `/optimization` - Optimization Module

### Specialized Modules
- `/peo-dp` - PEO-DP Module
- `/peotram` - PEO-TRAM Module
- `/checklists` - Smart Checklists
- `/control-hub` - Control Hub
- `/ai-assistant` - AI Center
- `/bridgelink` - Bridge Link

### Optional Routes
- `/forecast-global` - Global Forecast Console (if available)

## Validation Criteria

| Verification | Expected Result |
|--------------|----------------|
| Build | Completes without errors |
| Preview | All routes load with HTTP 200 |
| Dynamic Imports | No missing module errors |
| Contexts/Hooks | 100% typed (no @ts-nocheck) |
| Console | No network or import errors |
| Visuals | All pages render correctly |
| Performance | Load time < 5000ms average |

## Output Files

After running the validation, the following files are generated:

### Reports Directory (`reports/`)
- `preview-validation-report.md` - Main validation report
- `preview-test-results.json` - Raw test results
- `performance-data.json` - Performance metrics
- `preview-errors.log` - Dynamic import errors (if any)
- `build-output.log` - Build output
- `type-check.log` - TypeScript type check results

### Screenshots Directory (`tests/screenshots/preview/`)
- `00-home.png`
- `01-dashboard.png`
- `02-maritime.png`
- `03-forecast.png`
- `04-optimization.png`
- `05-peodp.png`
- `06-peotram.png`
- `07-checklistsinteligentes.png`
- `08-controlhub.png`
- `09-ai-center.png`
- `10-bridge-link.png`
- `11-forecast-global.png` (if route exists)

### Test Reports
- `playwright-report-preview/` - HTML test report
- `test-results/` - Detailed test results

## Configuration

### Playwright Configuration

The preview scan uses a custom Playwright configuration (`preview-scan.config.ts`) with:
- Base URL: `http://localhost:4173` (Vite preview server)
- Browser: Chromium (Desktop Chrome)
- Workers: 1 (sequential testing for consistency)
- Timeout: 60 seconds per test
- Screenshots: Enabled for all tests
- Video: Retained on failure

### Build Configuration

The build uses increased Node.js heap size to handle large applications:
- Heap size: 4096MB
- Target: ES2020
- Minification: esbuild
- Source maps: Enabled in production

## Troubleshooting

### Build Fails with "Out of Memory"

The build script automatically uses increased heap size. If issues persist:

```bash
NODE_OPTIONS='--max-old-space-size=8192' npm run build
```

### Tests Timeout

Increase the timeout in `preview-scan.config.ts`:

```typescript
timeout: 120000, // 120 seconds
```

### Dynamic Import Errors

Check the error log:

```bash
cat reports/preview-errors.log
```

Common causes:
- Missing module files
- Incorrect import paths
- Build chunk issues

### Preview Server Won't Start

Ensure the build completed:

```bash
npm run build
ls -la dist/
```

## CI/CD Integration

### GitHub Actions

Add to your workflow:

```yaml
- name: Run Preview Scan
  run: |
    npm install
    ./scripts/preview-scan.sh
    
- name: Upload Reports
  uses: actions/upload-artifact@v3
  with:
    name: preview-validation-report
    path: |
      reports/
      tests/screenshots/preview/
```

### Vercel

The system validates the preview before deployment:

```bash
npm run preview:validate
```

## Development

### Adding New Routes

Edit `e2e/preview/routes.spec.ts` and add to the `routes` array:

```typescript
{ path: "/new-route", name: "12-new-route", title: /New Route|Nautilus/i }
```

### Custom Validations

Add custom tests in `e2e/preview/routes.spec.ts`:

```typescript
test("custom validation", async ({ page }) => {
  await page.goto("/my-route");
  // Your custom assertions
});
```

## Support

For issues or questions:
1. Check the validation report: `reports/preview-validation-report.md`
2. Review test results: `playwright-report-preview/index.html`
3. Check error logs: `reports/preview-errors.log`

## License

Part of the Nautilus One system.
