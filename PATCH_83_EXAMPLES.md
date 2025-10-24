# 🎬 PATCH 83.0 - Usage Examples

## 🚀 Scenario 1: Daily Development Check

**Situation:** Developer wants to check for issues before committing code.

```bash
# Run quick scan
npm run diagnostic:scan

# Review results
cat dev/logs/diagnostic_auto_report.json | jq '.issuesByType'

# Expected output:
# {
#   "broken-import": 54,
#   "broken-useEffect": 1
# }

# If low-risk issues, apply auto-fixes
npm run diagnostic:fix

# Review changes
git diff

# Commit if satisfied
git add .
git commit -m "Applied diagnostic fixes"
```

---

## 🔄 Scenario 2: CI/CD Integration

**Situation:** Automated check on every PR.

### GitHub Actions Workflow:
```yaml
# .github/workflows/diagnostic.yml
name: Code Diagnostic Check

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  diagnose:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install Dependencies
        run: npm install
        
      - name: Run Diagnostic Scan
        run: npm run diagnostic:scan
        continue-on-error: true
        
      - name: Upload Diagnostic Report
        uses: actions/upload-artifact@v3
        with:
          name: diagnostic-report
          path: dev/logs/diagnostic_auto_report.json
          
      - name: Check Critical Issues
        run: |
          CRITICAL=$(cat dev/logs/diagnostic_auto_report.json | jq '.criticalIssues')
          echo "Critical issues found: $CRITICAL"
          if [ "$CRITICAL" -gt 10 ]; then
            echo "::error::Too many critical issues ($CRITICAL)"
            exit 1
          fi
```

---

## 🆘 Scenario 3: Emergency Production Issue

**Situation:** Production has white screen errors, need to find the cause quickly.

```bash
# Step 1: Run comprehensive scan
npm run diagnostic:scan

# Step 2: Check for critical issues
cat dev/logs/diagnostic_auto_report.json | jq '.issues[] | select(.severity=="critical")'

# Example output:
# {
#   "type": "broken-import",
#   "severity": "critical",
#   "file": "src/pages/Dashboard.tsx",
#   "line": 5,
#   "issue": "Import '@/modules/removed' points to non-existent module"
# }

# Step 3: Fix the specific file
vim src/pages/Dashboard.tsx

# Step 4: Re-scan to verify fix
npm run diagnostic:scan

# Step 5: Build and deploy
npm run build
```

---

## 🔨 Scenario 4: Refactoring Large Module

**Situation:** Developer renamed/moved a module and needs to find all broken references.

```bash
# Before refactoring - take snapshot
npm run diagnostic:scan
cp dev/logs/diagnostic_auto_report.json dev/logs/before_refactor.json

# Do your refactoring
mv src/modules/old-name src/modules/new-name

# After refactoring - scan again
npm run diagnostic:scan

# Compare results
diff <(cat dev/logs/before_refactor.json | jq '.issues | length') \
     <(cat dev/logs/diagnostic_auto_report.json | jq '.issues | length')

# Apply auto-fixes
npm run diagnostic:fix

# Review what was fixed
git diff src/modules/registry.ts
```

---

## 📊 Scenario 5: Generate Weekly Report

**Situation:** Tech lead wants weekly code health report.

```bash
# Create weekly report directory
mkdir -p reports/weekly

# Run scan
npm run diagnostic:scan

# Generate summary
cat dev/logs/diagnostic_auto_report.json | jq '{
  date: .timestamp,
  total: .totalIssues,
  critical: .criticalIssues,
  types: .issuesByType,
  modules: {
    total: .moduleRegistry.totalModules,
    active: .moduleRegistry.activeModules,
    broken: (.moduleRegistry.brokenModules | length)
  },
  routes: {
    total: .routeMap.totalRoutes,
    broken: (.routeMap.brokenRoutes | length)
  }
}' > reports/weekly/$(date +%Y-%m-%d).json

# Email or share the report
```

---

## 🏗️ Scenario 6: Pre-Deployment Checklist

**Situation:** Preparing for production deployment.

```bash
#!/bin/bash
# pre-deploy.sh

echo "🔍 Step 1: Running diagnostic scan..."
npm run diagnostic:scan || exit 1

CRITICAL=$(cat dev/logs/diagnostic_auto_report.json | jq '.criticalIssues')

if [ "$CRITICAL" -gt 0 ]; then
  echo "❌ Found $CRITICAL critical issues. Cannot deploy."
  cat dev/logs/diagnostic_auto_report.json | jq '.issues[] | select(.severity=="critical")'
  exit 1
fi

echo "✅ No critical issues found"

echo "🔧 Step 2: Running auto-fixes..."
npm run diagnostic:fix

echo "🏗️  Step 3: Building project..."
npm run build || exit 1

echo "🧪 Step 4: Running tests..."
npm test || exit 1

echo "✅ All checks passed! Ready to deploy."
```

---

## 🐛 Scenario 7: Debugging Test Failures

**Situation:** Tests are failing with mysterious import errors.

```bash
# Run diagnostic to find import issues
npm run diagnostic:scan

# Filter for test-related files
cat dev/logs/diagnostic_auto_report.json | \
  jq '.issues[] | select(.file | contains("test") or contains("spec"))'

# Example: Find all broken imports in tests
cat dev/logs/diagnostic_auto_report.json | \
  jq '.issues[] | select(.type=="broken-import" and (.file | contains("test")))'

# Apply fixes
npm run diagnostic:fix

# Re-run tests
npm test
```

---

## 🔄 Scenario 8: Module Registry Cleanup

**Situation:** Registry is cluttered with old/deprecated modules.

```bash
# Backup current registry
cp src/modules/registry.ts src/modules/registry.manual-backup.ts

# Run scan to identify issues
npm run diagnostic:scan

# Check orphaned files
cat dev/logs/diagnostic_auto_report.json | jq '.moduleRegistry.orphanedFiles'

# Check broken modules
cat dev/logs/diagnostic_auto_report.json | jq '.moduleRegistry.brokenModules'

# Regenerate registry
npm run diagnostic:fix

# Review changes
git diff src/modules/registry.ts

# If satisfied
git add src/modules/registry.ts
git commit -m "Cleaned up module registry"
```

---

## 📈 Scenario 9: Monthly Code Health Metrics

**Situation:** Generate metrics for management dashboard.

```bash
# Run scan
npm run diagnostic:scan

# Extract key metrics
cat dev/logs/diagnostic_auto_report.json | jq '{
  timestamp: .timestamp,
  codeHealth: {
    totalIssues: .totalIssues,
    criticalIssues: .criticalIssues,
    healthScore: (100 - (.criticalIssues * 2) - (.totalIssues - .criticalIssues) * 0.5)
  },
  modules: {
    totalModules: .moduleRegistry.totalModules,
    activeModules: .moduleRegistry.activeModules,
    healthRatio: (.moduleRegistry.activeModules / .moduleRegistry.totalModules * 100)
  },
  routes: {
    totalRoutes: .routeMap.totalRoutes,
    brokenRoutes: (.routeMap.brokenRoutes | length),
    reliability: (((.routeMap.totalRoutes - (.routeMap.brokenRoutes | length)) / .routeMap.totalRoutes) * 100)
  }
}' > monthly-metrics.json
```

---

## 🚨 Scenario 10: Quick Hotfix Validation

**Situation:** Need to validate a hotfix doesn't break anything.

```bash
# Create hotfix branch
git checkout -b hotfix/critical-bug

# Make your changes
vim src/pages/BrokenPage.tsx

# Quick validation before committing
npm run diagnostic:full

# Check if new issues were introduced
BEFORE_COUNT=$(git show main:dev/logs/diagnostic_auto_report.json 2>/dev/null | jq '.totalIssues' || echo 0)
AFTER_COUNT=$(cat dev/logs/diagnostic_auto_report.json | jq '.totalIssues')

if [ "$AFTER_COUNT" -gt "$BEFORE_COUNT" ]; then
  echo "⚠️  Warning: New issues introduced"
  exit 1
fi

echo "✅ No new issues. Safe to commit."

# Build and test
npm run build && npm test

# Deploy hotfix
git add .
git commit -m "hotfix: Fixed critical bug"
git push origin hotfix/critical-bug
```

---

## 💡 Tips & Tricks

### Quick Health Check:
```bash
npm run diagnostic:scan && \
cat dev/logs/diagnostic_auto_report.json | \
jq '{total: .totalIssues, critical: .criticalIssues}'
```

### Find Specific Issue Types:
```bash
# Find all broken imports
cat dev/logs/diagnostic_auto_report.json | \
jq '.issues[] | select(.type=="broken-import")'

# Find all useEffect issues
cat dev/logs/diagnostic_auto_report.json | \
jq '.issues[] | select(.type=="broken-useEffect")'
```

### Generate HTML Report:
```bash
cat dev/logs/diagnostic_auto_report.json | \
jq -r '
  "<html><body>",
  "<h1>Diagnostic Report</h1>",
  "<p>Date: \(.timestamp)</p>",
  "<p>Total Issues: \(.totalIssues)</p>",
  "<p>Critical: \(.criticalIssues)</p>",
  "</body></html>"
' > report.html
```

### Watch Mode (for development):
```bash
# Install watch tool
npm install -g nodemon

# Watch files and re-scan on changes
nodemon --watch src/ --ext ts,tsx --exec "npm run diagnostic:scan"
```

---

## 🎓 Learning Examples

### Understanding the Report Structure:
```javascript
// Sample report structure
{
  "timestamp": "2025-10-24T...",
  "totalIssues": 55,
  "criticalIssues": 54,
  "issuesByType": {
    "broken-import": 54,
    "broken-useEffect": 1
  },
  "issues": [
    {
      "type": "broken-import",
      "severity": "critical",
      "file": "path/to/file.tsx",
      "line": 5,
      "issue": "Description",
      "suggestion": "How to fix",
      "autoFixAvailable": false
    }
  ],
  "moduleRegistry": { /* ... */ },
  "routeMap": { /* ... */ }
}
```

---

**More examples and use cases in the full documentation:**
- `PATCH_83_DIAGNOSTIC_SYSTEM.md` - Complete guide
- `PATCH_83_QUICKREF.md` - Quick reference
- `PATCH_83_IMPLEMENTATION_SUMMARY.md` - Technical details
