# 🧭 Nautilus One - Preview Scan Quick Reference

## 🚀 Quick Commands

### Status & Validation
```bash
npm run status                # Quick status check
npm run validate:build        # Build validation (no browser)
./scripts/preview-scan.sh     # Full automated scan (with browser)
```

### Individual Operations
```bash
npm run build                 # Build the application
npm run type-check            # TypeScript type checking
npm run preview               # Start preview server
npm run preview:scan          # Run Playwright tests
npm run preview:initial-report # Generate build validation report
npm run preview:scan:report   # Generate full validation report
```

## 📋 Scripts Overview

| Script | Purpose | Requirements |
|--------|---------|--------------|
| `npm run status` | Check current validation status | None |
| `npm run validate:build` | Build + type check + report | None |
| `npm run preview:scan` | Run route tests with Playwright | Playwright browsers |
| `./scripts/preview-scan.sh` | Complete automated validation | Playwright browsers |

## 📂 Output Locations

### Reports
- `reports/preview-validation-report.md` - Main validation report
- `reports/build-output.log` - Build logs
- `reports/type-check.log` - TypeScript check logs
- `reports/preview-errors.log` - Dynamic import errors (if any)
- `reports/preview-test-results.json` - Raw test results
- `reports/performance-data.json` - Performance metrics

### Build Artifacts
- `dist/` - Production build output

### Screenshots
- `tests/screenshots/preview/` - Visual validation screenshots
  - `00-home.png`
  - `01-dashboard.png`
  - `02-maritime.png`
  - etc.

## 🎯 Common Workflows

### Before Deployment
```bash
# Quick validation
npm run validate:build

# Or full validation
./scripts/preview-scan.sh
```

### Check Status
```bash
npm run status
```

### After Code Changes
```bash
# Rebuild
npm run build

# Generate report
npm run preview:initial-report

# Check status
npm run status
```

### Full E2E Testing
```bash
# Install browsers (first time only)
npx playwright install chromium

# Run full scan
./scripts/preview-scan.sh
```

## 🔧 Troubleshooting

### Build Fails
```bash
# Check logs
cat reports/build-output.log

# Clean and rebuild
rm -rf dist/
npm run build
```

### Playwright Issues
```bash
# Install/reinstall browsers
npx playwright install chromium --with-deps

# Run tests with debug
npx playwright test --config=preview-scan.config.ts --debug
```

### Missing Reports
```bash
# Generate initial report
npm run preview:initial-report
```

## 📊 Success Criteria

A successful validation shows:
- ✅ Build: Successful
- ✅ Type Check: Passed
- ✅ Routes: 12 configured
- ✅ No dynamic import errors
- ✅ All artifacts generated

## 🔗 More Information

- Full Documentation: `PREVIEW_SCAN_README.md`
- Implementation Details: `PREVIEW_SCAN_IMPLEMENTATION_SUMMARY.md`
- Validation Report: `reports/preview-validation-report.md`

## 💡 Tips

1. **Quick Check**: Use `npm run status` anytime to see current state
2. **Fast Validation**: Use `npm run validate:build` for build-only checks
3. **Full Testing**: Use `./scripts/preview-scan.sh` before major releases
4. **CI/CD**: Add `npm run validate:build` to your pipeline

## 🆘 Need Help?

Check the validation report for detailed status:
```bash
cat reports/preview-validation-report.md
```

Or view logs:
```bash
cat reports/build-output.log
cat reports/type-check.log
```
