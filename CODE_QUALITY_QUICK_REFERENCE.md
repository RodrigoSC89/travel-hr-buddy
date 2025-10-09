# 🔧 Code Quality Quick Reference

## Common Issues & Fixes

### 1. Unused Variables (1,940 instances)

**Quick Fix:**
```bash
npm run lint:fix
```

**Manual Fix Example:**
```typescript
// ❌ Before
import { useState, useEffect } from 'react';
const [data, setData] = useState([]);  // 'data' is never used

// ✅ After
import { useState, useEffect } from 'react';
const [loading, setLoading] = useState(false);
```

---

### 2. Console.log Statements (475 instances)

**Replace with Logger:**
```typescript
// ❌ Before
console.log('Debug info:', data);
console.error('Error occurred:', error);

// ✅ After
import { logger } from '@/utils/logger';

logger.log('Debug info:', data);      // Only in development
logger.error('Error occurred:', error); // Always shown
```

**Logger Features:**
- `logger.log()` - Development only
- `logger.info()` - Development only
- `logger.debug()` - Development only
- `logger.warn()` - Always shown
- `logger.error()` - Always shown
- `logger.table()` - Development only

---

### 3. Explicit Any Types (554 instances)

**Before:**
```typescript
const data: any = await fetchData();
function handleClick(event: any) { }
```

**After:**
```typescript
import { SomeType } from '@/types';

const data: SomeType = await fetchData();
function handleClick(event: React.MouseEvent<HTMLButtonElement>) { }
```

**Common TypeScript Types:**
- `React.MouseEvent<HTMLButtonElement>`
- `React.ChangeEvent<HTMLInputElement>`
- `React.FormEvent<HTMLFormElement>`
- Custom types from `@/types`

---

### 4. React Hook Dependencies (100 instances)

**Pattern:**
```typescript
// ❌ Before
const loadData = async () => {
  const result = await fetchData(userId);
  setData(result);
};

useEffect(() => {
  loadData();
}, []); // Missing dependency: loadData

// ✅ After
import { useCallback } from 'react';

const loadData = useCallback(async () => {
  const result = await fetchData(userId);
  setData(result);
}, [userId]); // Include all dependencies

useEffect(() => {
  loadData();
}, [loadData]); // Now safe
```

---

### 5. React Unescaped Entities (97 instances)

**Before:**
```tsx
<p>User's name: {name}</p>
<div>The company's policy...</div>
```

**After:**
```tsx
<p>User&apos;s name: {name}</p>
<div>The company&apos;s policy...</div>

// Or use curly braces
<p>{"User's name:"} {name}</p>
```

**Common Entities:**
- `'` → `&apos;` or `{'`}
- `"` → `&quot;` or `{'"'}`
- `&` → `&amp;`
- `<` → `&lt;`
- `>` → `&gt;`

---

### 6. Missing ARIA Labels (25 instances)

**Before:**
```tsx
<button onClick={handleClose}>
  <X />
</button>
```

**After:**
```tsx
<button 
  onClick={handleClose}
  aria-label="Close dialog"
>
  <X />
</button>
```

---

### 7. Missing Alt Text (9 instances)

**Before:**
```tsx
<img src={logo} />
```

**After:**
```tsx
<img src={logo} alt="Company logo" />

// For decorative images
<img src={decorative} alt="" />
```

---

## 🚀 Quick Commands

### Run All Fixes
```bash
# Fix all auto-fixable issues
npm run lint:fix

# Format all files
npm run format

# Build to check for TypeScript errors
npm run build
```

### Check Issues
```bash
# Check ESLint issues
npm run lint

# Check formatting
npm run format:check
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit with your keys
nano .env
```

---

## 📋 Checklist Before Commit

- [ ] Run `npm run lint:fix`
- [ ] Run `npm run format`
- [ ] Run `npm run build` to verify
- [ ] Remove unnecessary console.logs
- [ ] Add proper TypeScript types
- [ ] Test changed components
- [ ] Update relevant documentation

---

## 🔍 Finding Specific Issues

### Find all console.logs
```bash
grep -r "console\." src/ --include="*.tsx" --include="*.ts"
```

### Find all any types
```bash
grep -r ": any" src/ --include="*.tsx" --include="*.ts"
```

### Find TODOs
```bash
grep -r "TODO\|FIXME" src/ --include="*.tsx" --include="*.ts"
```

### Find components without types
```bash
grep -r "props)" src/components --include="*.tsx"
```

---

## 🎯 Priority Order

1. **Critical (Fix Now)**
   - ESLint errors ✅ (Already fixed)
   - Build errors ✅ (None found)
   - Security issues ✅ (None found)

2. **High Priority (Fix Soon)**
   - Production console.logs (475 instances)
   - Missing error handling
   - Accessibility issues (ARIA, alt text)

3. **Medium Priority (Improve)**
   - TypeScript any types (554 instances)
   - Unused variables (1,940 instances)
   - React hook dependencies (100 instances)

4. **Low Priority (Optimize)**
   - Code organization
   - Performance optimizations
   - Documentation updates

---

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Hooks Rules](https://react.dev/reference/rules/rules-of-hooks)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ESLint Rules](https://eslint.org/docs/rules/)

---

**Last Updated:** January 2025
