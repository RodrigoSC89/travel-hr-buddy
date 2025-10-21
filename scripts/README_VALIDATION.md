# Validation Scripts Guide

## Overview

This guide documents the validation scripts available in the Nautilus One project and how to use them for automated testing and validation.

## Available Scripts

### 1. validate-nautilus-preview.sh

**Purpose**: Comprehensive end-to-end validation of the Nautilus One system

**Location**: `scripts/validate-nautilus-preview.sh`

**What it does**:
1. Verifies current git branch
2. Installs/updates dependencies
3. Cleans build cache
4. Runs production build
5. Starts preview server on port 5173
6. Installs Playwright for E2E testing
7. Creates and runs route validation tests
8. Tests all 12 main routes
9. Optionally simulates Vercel deployment build

**Usage**:
```bash
# Run full validation
bash scripts/validate-nautilus-preview.sh

# Or make it executable and run
chmod +x scripts/validate-nautilus-preview.sh
./scripts/validate-nautilus-preview.sh
```

**Routes Tested** (12 total):
- `/` - Home/Index
- `/dashboard` - Main Dashboard
- `/dp-intelligence` - DP Intelligence Center
- `/bridgelink` - Bridge Link
- `/forecast` - Forecast Page
- `/control-hub` - Control Hub
- `/peo-dp` - PEO-DP
- `/peotram` - PEO-TRAM
- `/checklists` - Intelligent Checklists
- `/analytics` - Analytics
- `/intelligent-documents` - Intelligent Documents
- `/ai-assistant` - AI Assistant

**Expected Output**:
```
⚙️ Iniciando Validação Completa do Nautilus One (Lovable Preview + Build + Routes)
-------------------------------------------------------------
📦 Verificando branch...
🔄 Atualizando dependências...
🧹 Limpando cache anterior...
⚙️ Rodando build de teste (Vite + PWA)...
✓ built in 57.54s
🌐 Iniciando preview local (porta 5173)...
⏳ Aguardando inicialização do servidor...
🔍 Instalando Playwright...
🧭 Executando testes de rotas com Playwright...
✅ All tests passed (12/12)
🧹 Encerrando servidor local...
✅ Validação completa do Lovable Preview concluída com sucesso!
```

**Exit Codes**:
- `0`: All validations passed
- `1`: Build failed or one or more routes failed to render

### 2. build-validation.sh

**Purpose**: Quick build validation without E2E testing

**Location**: `scripts/build-validation.sh`

**What it does**:
- Runs TypeScript type checking
- Runs ESLint
- Executes production build

**Usage**:
```bash
bash scripts/build-validation.sh
```

### 3. Other Validation Scripts

#### status-check.sh
Quick health check for the application

#### validate-contrast.sh
Validates accessibility color contrast ratios

#### validate-api-keys.cjs
Validates that required API keys are configured

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/validate.yml`:

```yaml
name: Nautilus Validation

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  validate:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run validation script
      run: bash scripts/validate-nautilus-preview.sh
      env:
        CI: true
    
    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: test-results
        path: tests/preview.spec.ts
```

### Vercel Integration

Add to `vercel.json`:

```json
{
  "buildCommand": "NODE_OPTIONS='--max-old-space-size=4096' npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "framework": "vite",
  "checks": {
    "script": "bash scripts/validate-nautilus-preview.sh"
  }
}
```

## Manual Testing

### Quick Build Test

```bash
# Clean build
rm -rf dist node_modules/.vite

# Build with proper memory allocation
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Preview Server Test

```bash
# Start preview server
npm run preview -- --port 5173

# In another terminal, test routes manually
curl http://localhost:5173/
curl http://localhost:5173/dashboard
curl http://localhost:5173/dp-intelligence
# ... etc
```

### Route-by-Route Testing

```bash
# Install Playwright
npx playwright install --with-deps

# Create a simple test file
cat > test-single-route.spec.ts << 'EOF'
import { test, expect } from '@playwright/test';

test('Test specific route', async ({ page }) => {
  await page.goto('http://localhost:5173/dashboard');
  await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
});
EOF

# Run the test
npx playwright test test-single-route.spec.ts
```

## Troubleshooting

### Script Fails: Permission Denied

```bash
chmod +x scripts/validate-nautilus-preview.sh
```

### Script Fails: Port Already in Use

```bash
# Find and kill process using port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run preview -- --port 5174
```

### Script Fails: Memory Issues

```bash
# Increase Node.js memory allocation
export NODE_OPTIONS="--max-old-space-size=8192"
bash scripts/validate-nautilus-preview.sh
```

### Playwright Installation Fails

```bash
# Install system dependencies
npx playwright install-deps

# Then install browsers
npx playwright install
```

### Build Fails with Module Errors

```bash
# Clear all caches
rm -rf node_modules dist .vite node_modules/.vite .vercel_cache

# Reinstall dependencies
npm ci

# Rebuild
npm run build
```

## Best Practices

### Before Committing

1. Run validation script locally
2. Fix any errors or warnings
3. Commit with descriptive message
4. Push to remote

```bash
bash scripts/validate-nautilus-preview.sh
git add .
git commit -m "feat: description of changes"
git push
```

### Before Deploying

1. Ensure main branch passes validation
2. Run full E2E test suite
3. Check bundle sizes
4. Verify environment variables

```bash
# Full validation
bash scripts/validate-nautilus-preview.sh

# Check bundle sizes
npm run build -- --mode analyze

# Verify env vars
npm run validate-api-keys
```

### Regular Maintenance

- Run validation weekly on main branch
- Monitor build times (should be < 60s)
- Check bundle sizes for growth
- Update dependencies monthly
- Review and update validation criteria

## Integration with Development Workflow

### Pre-commit Hook

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
echo "Running validation before commit..."
npm run lint || exit 1
npm run type-check || exit 1
echo "✅ Validation passed"
```

### Pre-push Hook

Create `.git/hooks/pre-push`:

```bash
#!/bin/bash
echo "Running full validation before push..."
bash scripts/validate-nautilus-preview.sh || exit 1
echo "✅ All validations passed"
```

## Metrics and Monitoring

### Build Metrics

Track these metrics over time:
- Build time (target: < 60s)
- Bundle size (target: < 10 MB)
- Number of chunks (current: 188)
- Gzip size (current: varies by chunk)

### Route Performance

Monitor route load times:
- Initial page load: < 3s
- Route navigation: < 1s
- Time to interactive: < 5s

## Support

For issues or questions about validation scripts:

1. Check troubleshooting section above
2. Review error messages in console
3. Check logs in `tests/` directory
4. Consult implementation summary: `IMPLEMENTATION_SUMMARY.md`
5. Review stabilization report: `reports/final-stabilization-report.md`

---

**Last Updated**: 2025-10-21  
**Version**: 1.0.0  
**Maintainer**: Nautilus One Team

🌊 _"Mais do que navegar, aprender e adaptar."_
