# PATCH 536: Scripts & Commands Quick Reference
## Diagnostic Tools, Fixes & Optimization Commands

**Last Updated:** October 30, 2025  
**For:** PATCH 536 - Complete Diagnostic Audit

---

## 🚀 Quick Start

### Run Complete Diagnostic
```bash
# Full diagnostic scan
npm run diagnostic:scan

# Auto-fix safe issues
npm run diagnostic:fix

# Complete diagnostic + fixes
npm run diagnostic:full
```

### Verify System Health
```bash
# Check build (2-3 minutes)
npm run build

# Check TypeScript (30 seconds)
npm run type-check

# Check code quality (45 seconds)
npm run lint
```

---

## 📊 Analysis Scripts

### 1. Count @ts-nocheck Files
```bash
# Total count
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "@ts-nocheck" | wc -l

# List all files with @ts-nocheck
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "@ts-nocheck" > ts-nocheck-files.txt

# Group by directory
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "@ts-nocheck" | \
  sed 's|/[^/]*$||' | sort | uniq -c | sort -rn
```

**Expected Output:**
```
487 total files with @ts-nocheck
~180 in src/ai/
~120 in src/services/
~90 in src/components/
```

### 2. Find Infinite Loops
```bash
# Find while(true) loops
grep -rn "while\s*(true)" src --include="*.ts" --include="*.tsx"

# Find for(;;) loops
grep -rn "for\s*(;;)" src --include="*.ts" --include="*.tsx"

# Check for proper break conditions
grep -A 10 "while\s*(true)" src --include="*.ts" --include="*.tsx" | grep "break"
```

**Expected Output:**
```
2 while(true) loops found:
- src/services/workflow-copilot.ts (line 60) - SAFE ✅
- src/pages/MMIForecastPage.tsx (line 145) - SAFE ✅
```

### 3. Analyze React Hooks
```bash
# Count total useEffect instances
grep -r "useEffect" src --include="*.tsx" --include="*.ts" | wc -l

# Find useEffect without cleanup
grep -A 10 "useEffect" src/**/*.tsx | grep -B 10 -v "return () =>"

# Check for missing dependencies
npm run lint -- --rule "react-hooks/exhaustive-deps: error"

# Find useEffect with empty dependencies
grep -A 3 "useEffect" src/**/*.tsx | grep "\[\]"
```

**Expected Output:**
```
~1,429 useEffect instances
677 files with useEffect
Average 2.1 hooks per file
95%+ have proper cleanup
```

### 4. Bundle Size Analysis
```bash
# Build and analyze
npm run build

# Check bundle sizes
ls -lh dist/assets/*.js | sort -k5 -hr | head -20

# Get vendor chunk size
ls -lh dist/assets/vendors-*.js

# Check total dist size
du -sh dist/
```

**Expected Output:**
```
vendors-*.js: 4.4MB
map-*.js: 1.6MB
pages-main-*.js: 1.6MB
Total dist: ~25MB
```

### 5. ESLint Issue Breakdown
```bash
# Count warnings by type
npm run lint 2>&1 | grep "warning" | wc -l

# Count errors by type
npm run lint 2>&1 | grep "error" | wc -l

# Find quote issues
npm run lint 2>&1 | grep "quotes" | wc -l

# Find unused variables
npm run lint 2>&1 | grep "no-unused-vars" | wc -l

# Find any types
npm run lint 2>&1 | grep "no-explicit-any" | wc -l
```

**Expected Output:**
```
~9,530 total warnings
~2,150 errors (mostly formatting)
~4,289 quote issues
~2,383 unused variable warnings
~1,906 any type warnings
```

---

## 🔧 Fix Commands

### High Priority Fixes

#### 1. Auto-Fix ESLint Issues (Safe)
```bash
# Fix all auto-fixable issues
npm run lint:fix

# Fix only quotes
npx eslint . --fix --rule 'quotes: ["error", "double"]'

# Fix only indentation
npx eslint . --fix --rule 'indent: ["error", 2]'

# Preview fixes without applying
npm run lint:fix -- --dry-run
```

**Impact:** Fixes ~6,000 issues in seconds

#### 2. Format with Prettier
```bash
# Format all files
npm run format

# Check formatting without fixing
npm run format:check

# Format specific directories
npx prettier --write "src/components/**/*.{ts,tsx}"
npx prettier --write "src/services/**/*.{ts,tsx}"
```

**Impact:** Consistent formatting across codebase

#### 3. Remove Unused Variables
```bash
# Find unused variables
npm run lint 2>&1 | grep "no-unused-vars" > unused-vars.txt

# Remove unused imports (careful!)
npx eslint . --fix --rule 'no-unused-vars: error'
```

**Warning:** Review changes before committing!

#### 4. Add TypeScript Types (Manual)
```bash
# Find files with @ts-nocheck
find src/services -name "*.ts" | xargs grep -l "@ts-nocheck"

# Template for fixing:
# 1. Remove @ts-nocheck comment
# 2. Add proper types
# 3. Run type-check: npm run type-check
```

**Example Fix:**
```typescript
// Before
// @ts-nocheck
export const getData = async (id) => {
  return await fetch(`/api/${id}`);
};

// After
export const getData = async (id: string): Promise<Response> => {
  return await fetch(`/api/${id}`);
};
```

### Medium Priority Fixes

#### 5. Lazy Load Libraries
```bash
# Template for lazy loading
# Before: import * as tf from '@tensorflow/tfjs';
# After: const tf = await import('@tensorflow/tfjs');
```

**Files to Update:**
- `src/ai/index.ts` - TensorFlow
- `src/components/maps/index.ts` - Mapbox
- `src/services/mqtt-publisher.ts` - MQTT

**Implementation:**
```typescript
// Before
import * as tf from '@tensorflow/tfjs';

export const initAI = () => {
  return tf.ready();
};

// After
export const initAI = async () => {
  const tf = await import('@tensorflow/tfjs');
  return tf.ready();
};
```

#### 6. Code Splitting by Route
```bash
# Add lazy loading to routes
# Edit: src/App.tsx
```

**Implementation:**
```typescript
// Before
import AdminDashboard from './pages/admin/dashboard';

// After
const AdminDashboard = lazy(() => import('./pages/admin/dashboard'));
```

#### 7. Tree Shaking Optimization
```bash
# Find unused exports
npx ts-prune | tee unused-exports.txt

# Remove unused exports manually
# Check before removing: grep -r "exportName" src/
```

---

## 🧪 Testing & Verification

### Build Verification
```bash
# Clean build
npm run clean
npm install
npm run build

# Expected: SUCCESS in ~2 minutes
# Expected: 0 TypeScript errors
```

### Type Check Verification
```bash
# Full type check
npm run type-check

# Type check specific directory
npx tsc --noEmit src/services/**/*.ts
```

### Runtime Verification
```bash
# Start dev server
npm run dev

# Test critical paths:
# 1. Open http://localhost:5173/
# 2. Navigate to /admin
# 3. Navigate to /forecast
# 4. Check browser console for errors
```

### Performance Check
```bash
# Build and preview
npm run build
npm run preview

# Test on slow connection (Chrome DevTools):
# 1. Open DevTools (F12)
# 2. Network tab → Throttling → Slow 3G
# 3. Hard reload (Ctrl+Shift+R)
# 4. Check load time (<8s acceptable)
```

---

## 📦 Optimization Configs

### 1. Vite Config - Code Splitting
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          'vendor-maps': ['mapbox-gl'],
          'vendor-ai': ['@tensorflow/tfjs', 'onnxruntime-web'],
        }
      }
    },
    chunkSizeWarningLimit: 1000, // 1MB
  }
});
```

### 2. ESLint Config - Auto-Fix Safe Rules
```json
// .eslintrc.json
{
  "rules": {
    "quotes": ["error", "double"],
    "indent": ["error", 2],
    "semi": ["error", "always"],
    "no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### 3. TypeScript Config - Strict Mode (Progressive)
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": false,  // Currently off
    "noImplicitAny": true,  // Enable first
    "strictNullChecks": true,  // Enable second
    "strictFunctionTypes": true  // Enable third
  }
}
```

---

## 🐛 Troubleshooting

### Issue: Build Fails
```bash
# Clear cache and rebuild
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Type Check Fails
```bash
# Check specific error
npm run type-check 2>&1 | grep "error TS"

# Bypass with @ts-ignore (temporary)
// @ts-ignore - TODO: Fix type
const data = problematicCode();
```

### Issue: ESLint Takes Too Long
```bash
# Lint specific directory
npx eslint src/components --fix

# Skip specific rules
npx eslint . --fix --rule 'no-explicit-any: off'

# Use cache
npx eslint . --cache --fix
```

### Issue: Bundle Too Large
```bash
# Analyze bundle
npm install -D rollup-plugin-visualizer
# Add to vite.config.ts: visualizer()
npm run build
# Open: dist/stats.html
```

### Issue: Memory Errors During Build
```bash
# Increase Node memory
export NODE_OPTIONS="--max-old-space-size=8192"
npm run build

# Or use build script
npm run build:ci
```

---

## 📋 Checklist Templates

### Pre-Deployment Checklist
```bash
# [ ] Build succeeds
npm run build

# [ ] Type check passes
npm run type-check

# [ ] Tests pass
npm run test

# [ ] No console errors
npm run dev
# (check browser console)

# [ ] Bundle size acceptable
ls -lh dist/assets/vendors-*.js
# (should be <5MB)

# [ ] Performance acceptable
npm run preview
# (check page load <3s on 4G)
```

### Code Quality Checklist
```bash
# [ ] ESLint errors < 100
npm run lint 2>&1 | grep "error" | wc -l

# [ ] No @ts-nocheck in new files
find src -name "*.ts" -newer .git/HEAD | xargs grep "@ts-nocheck"

# [ ] Prettier formatted
npm run format:check

# [ ] No unused imports
npm run lint 2>&1 | grep "no-unused-vars"
```

---

## 🎯 Quick Wins (5 Minutes Each)

### 1. Fix Quote Consistency
```bash
npx eslint . --fix --rule 'quotes: ["error", "double"]'
```

### 2. Remove Console Logs
```bash
npm run clean:logs
```

### 3. Format All Files
```bash
npm run format
```

### 4. Update Dependencies (patch only)
```bash
npm update
```

### 5. Clear Build Cache
```bash
npm run clean
```

---

## 📊 Monitoring Commands

### Build Time Tracking
```bash
# Time the build
time npm run build

# Track over time
echo "$(date),$(time npm run build 2>&1 | grep real)" >> build-times.log
```

### Bundle Size Tracking
```bash
# Track vendor chunk size
ls -lh dist/assets/vendors-*.js | awk '{print $5}' >> bundle-sizes.log

# Graph over time (requires gnuplot)
gnuplot -e "plot 'bundle-sizes.log' with lines"
```

### Code Quality Tracking
```bash
# Track ESLint warnings over time
echo "$(date),$(npm run lint 2>&1 | grep "warning" | wc -l)" >> quality-metrics.log
```

---

## 🔗 Useful Links

**Documentation:**
- Full Diagnostic Report: `PATCH_536_DIAGNOSTIC_REPORT.md`
- Executive Summary: `PATCH_536_EXECUTIVE_SUMMARY.md`

**Tools:**
- Vite Docs: https://vitejs.dev/guide/
- ESLint Rules: https://eslint.org/docs/rules/
- TypeScript Handbook: https://www.typescriptlang.org/docs/

**Scripts:**
- Diagnostic Scanner: `scripts/diagnostic-scanner.ts`
- Auto-Fix Tool: `scripts/auto-fix.ts`

---

## 💡 Pro Tips

1. **Always test after auto-fix** - Run `npm run dev` and click around
2. **Commit before bulk changes** - Easy to revert if something breaks
3. **Fix one category at a time** - Easier to track what broke
4. **Use CI/CD for checks** - Automate lint and type-check in GitHub Actions
5. **Monitor bundle size** - Set up size tracking in CI

---

## 🆘 Emergency Rollback

If something breaks after fixes:

```bash
# Rollback last commit
git reset --hard HEAD~1

# Or cherry-pick specific files
git checkout HEAD~1 -- path/to/file.ts

# Rebuild
npm run clean
npm install
npm run build
```

---

**Quick Reference Version:** 1.0  
**Compatible With:** PATCH 536 Diagnostic System  
**Maintenance:** Update after each audit cycle

---

*For full analysis, see PATCH_536_DIAGNOSTIC_REPORT.md*  
*For decision matrix, see PATCH_536_EXECUTIVE_SUMMARY.md*
