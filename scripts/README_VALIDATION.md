# Nautilus One - Validation Scripts

This directory contains validation and automation scripts for the Nautilus One system.

## 🧪 Available Scripts

### validate-nautilus-preview.sh
**Purpose:** Complete validation of the Nautilus One system including build, preview, and route testing.

**What it does:**
1. ✅ Verifies current git branch
2. 📦 Updates/installs dependencies (npm ci)
3. 🧹 Cleans cache (node_modules/.vite, dist, .vercel_cache)
4. ⚙️ Runs production build test
5. 🌐 Starts local preview server (port 5173)
6. 🔍 Installs Playwright for testing
7. 🧭 Creates and runs route tests for all main routes
8. 🧹 Cleans up preview server
9. 🚀 Simulates Vercel build (if CLI is available)

**Usage:**
```bash
bash scripts/validate-nautilus-preview.sh
```

**Routes Tested:**
- `/` - Home
- `/dashboard` - Dashboard
- `/dp-intelligence` - DP Intelligence
- `/bridgelink` - Bridge Link
- `/forecast` - Forecast
- `/control-hub` - Control Hub
- `/peo-dp` - PEO-DP
- `/peotram` - PEO-TRAM
- `/checklists` - Checklists
- `/analytics` - Analytics
- `/intelligent-documents` - Documents
- `/ai-assistant` - AI Assistant

**Requirements:**
- Node.js v20+
- npm v8+
- Git
- Bash shell
- Internet connection (for Playwright installation)

**Exit Codes:**
- 0: All validations passed
- 1: Build failed, route tests failed, or Vercel build failed

**Notes:**
- Requires adequate memory for build (uses --max-old-space-size=4096)
- Preview server runs on port 5173 (ensure it's available)
- Playwright tests timeout after 10s per route
- Creates temporary test file: `tests/preview.spec.ts`

---

## 🔧 Other Scripts

### clean-console-logs.cjs
Removes console.log statements from codebase.

### validate-api-keys.cjs
Validates API keys configuration.

### production-verification.cjs
Verifies production readiness.

### validate-contrast.sh
Validates color contrast for accessibility.

---

## 📊 Build Configuration

The validation script uses the following build settings:
- **Memory:** 4GB (NODE_OPTIONS="--max-old-space-size=4096")
- **Mode:** Production
- **Verbose:** Enabled for debugging

---

## 🧪 Testing Strategy

### Unit Tests
Run with: `npm run test`

### E2E Tests
Run with: `npm run test:e2e`

### Coverage
Run with: `npm run test:coverage`

### Validation (Full)
Run with: `bash scripts/validate-nautilus-preview.sh`

---

## 🚀 CI/CD Integration

To integrate validation in CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run Nautilus Validation
  run: bash scripts/validate-nautilus-preview.sh
  env:
    NODE_OPTIONS: --max-old-space-size=4096
```

---

## 📝 Troubleshooting

### Build fails with memory error
- Increase NODE_OPTIONS: `--max-old-space-size=8192`
- Or run: `NODE_OPTIONS="--max-old-space-size=8192" npm run build`

### Port 5173 already in use
- Kill existing process: `lsof -ti:5173 | xargs kill -9`
- Or change port in script

### Playwright installation fails
- Run manually: `npx playwright install --with-deps`
- Check internet connection

### Route tests timeout
- Increase timeout in test spec: `timeout: 20000`
- Check if server started properly

---

## 🔗 Related Files

- [Final Stabilization Report](../reports/final-stabilization-report.md)
- [Safe Lazy Import Utility](../src/utils/safeLazyImport.tsx)
- [App Routes Configuration](../src/App.tsx)
- [Build Configuration](../vite.config.ts)
