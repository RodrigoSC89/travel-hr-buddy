# 🚀 Quick Reference - Post-Audit Setup

## ✅ Build & Lint Commands

### Check Code Quality
```bash
# Run ESLint (should show 0 errors)
npm run lint

# Run Prettier check (should pass)
npm run format:check
```

### Fix Issues
```bash
# Auto-fix ESLint issues
npm run lint:fix

# Auto-format code with Prettier
npm run format
```

### Build & Deploy
```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

## 📊 Current Status (Post-Audit)

| Metric | Status | Notes |
|--------|--------|-------|
| ESLint Errors | ✅ 0 | Zero errors |
| ESLint Warnings | ⚠️ 4,516 | Mostly unused vars |
| Build Status | ✅ Pass | ~20 seconds |
| Prettier | ✅ Pass | All files formatted |
| TypeScript | ✅ Pass | Compiles successfully |

---

## 🔧 ESLint Configuration

### Enabled Rules (Errors)
- `quotes: "double"` - Must use double quotes
- `semi: "always"` - Semicolons required
- `indent: 2` - 2 spaces indentation

### Disabled/Warning Rules
- `react/prop-types: "off"` - Using TypeScript instead
- `@typescript-eslint/no-explicit-any: "warn"` - Warning only
- `react/no-unescaped-entities: "warn"` - Warning only
- `@typescript-eslint/no-unused-vars: "warn"` - Warning only

---

## 🐛 Common Issues & Solutions

### 1. Import Errors
```typescript
// ❌ Wrong
import { Button } from '@/components/ui/button'

// ✅ Correct
import { Button } from "@/components/ui/button";
```

### 2. Missing Semicolons
```typescript
// ❌ Wrong
const foo = "bar"

// ✅ Correct
const foo = "bar";
```

### 3. Wrong Indentation
```typescript
// ❌ Wrong (4 spaces)
function example() {
    return "hello";
}

// ✅ Correct (2 spaces)
function example() {
  return "hello";
}
```

### 4. Unescaped Entities in JSX
```tsx
// ❌ Wrong
<p>Use "quotes" here</p>

// ✅ Correct
<p>Use &quot;quotes&quot; here</p>
```

---

## 📁 Key Files Modified

### Configuration Files
- `.eslintrc.json` - Updated rules
- `.prettierrc` - Formatting config (if exists)

### Fixed Components
- `src/pages/AdvancedSettingsPage.tsx` - Removed duplicate closing tag
- `src/components/ui/command.tsx` - Fixed custom attribute warning
- `src/components/ui/floating-action-button.tsx` - Fixed case declaration
- `src/components/testing/focus-trap-example.tsx` - Fixed entities
- `src/components/voice/VoiceCommands.tsx` - Fixed entities
- `src/components/voice/VoiceIntegrations.tsx` - Fixed entities

---

## 🚦 Pre-Commit Checklist

Before committing code:

1. **Run Linter**
   ```bash
   npm run lint
   ```
   Should show: `✖ 4516 problems (0 errors, 4516 warnings)`

2. **Format Code**
   ```bash
   npm run format
   ```

3. **Test Build**
   ```bash
   npm run build
   ```
   Should complete in ~20 seconds

4. **Review Changes**
   ```bash
   git diff
   ```
   Check for unintended changes

---

## 🎯 Development Guidelines

### Code Style
1. Always use **double quotes** for strings
2. Always add **semicolons**
3. Use **2 spaces** for indentation
4. Format code with Prettier before committing

### TypeScript
1. Avoid using `any` type (use proper types)
2. Define interfaces for complex objects
3. Use TypeScript types instead of PropTypes
4. Enable strict mode in `tsconfig.json`

### React Best Practices
1. Use functional components
2. Use hooks for state management
3. Implement proper error boundaries
4. Add loading states for async operations
5. Escape special characters in JSX

### Error Handling
1. Always wrap async code in try-catch
2. Provide user-friendly error messages
3. Log errors for debugging
4. Use the logger utility (`src/utils/logger.ts`)

---

## 🔍 Code Review Checklist

When reviewing code:

- [ ] No ESLint errors (warnings are OK)
- [ ] Code is properly formatted
- [ ] No unused imports/variables (if possible)
- [ ] Proper TypeScript types (avoid `any`)
- [ ] Error handling in place
- [ ] Loading states implemented
- [ ] Accessible UI components
- [ ] No hardcoded secrets
- [ ] Environment variables used correctly

---

## 📦 Bundle Size Optimization

### Current Bundle (Production)
```
mapbox-*.js      1,624 KB  (largest)
vendor-*.js        472 KB
charts-*.js        395 KB
PEOTRAM-*.js       235 KB
supabase-*.js      124 KB
Others            ~500 KB
──────────────────────────
Total            ~3,350 KB (~782 KB gzipped)
```

### Optimization Tips
1. **Code Splitting**
   - Lazy load Mapbox: `const Mapbox = lazy(() => import('./Mapbox'))`
   - Split large routes with React.lazy()
   
2. **Bundle Analysis**
   ```bash
   npm run build -- --mode analyze
   ```

3. **Alternative Libraries**
   - Consider lighter chart library
   - Evaluate Mapbox alternatives

---

## 🧪 Testing

### Manual Testing
1. Run development server: `npm run dev`
2. Test all major features
3. Check browser console for errors
4. Test responsive design
5. Verify accessibility

### Automated Testing (Future)
```bash
# Unit tests (to be added)
npm run test

# E2E tests (to be added)
npm run test:e2e
```

---

## 🔐 Environment Variables

### Required Variables
See `.env.example` for complete list:

```env
# Supabase (Required)
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=

# OpenAI (Required for AI features)
VITE_OPENAI_API_KEY=

# Mapbox (Required for maps)
VITE_MAPBOX_ACCESS_TOKEN=

# Other APIs (Optional)
VITE_AMADEUS_API_KEY=
VITE_ELEVENLABS_API_KEY=
# ... see .env.example for complete list
```

### Setup
1. Copy `.env.example` to `.env`
2. Fill in required API keys
3. Never commit `.env` file
4. Update `.env.example` when adding new variables

---

## 📚 Additional Resources

### Documentation
- [Main README](./README.md)
- [Full Audit Report](./FULL_STACK_AUDIT_REPORT.md)
- [Changelog](./CHANGELOG.md)

### External Docs
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)

---

## 🆘 Getting Help

### Common Commands
```bash
# Install dependencies
npm install

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for outdated packages
npm outdated

# Update packages
npm update
```

### Troubleshooting

**Build fails?**
1. Clear `dist` folder: `rm -rf dist`
2. Clear cache: `npm cache clean --force`
3. Reinstall: `npm install`
4. Rebuild: `npm run build`

**Linter errors?**
1. Auto-fix: `npm run lint:fix`
2. Format: `npm run format`
3. Check ESLint config: `.eslintrc.json`

**Type errors?**
1. Check `tsconfig.json`
2. Install types: `npm i -D @types/[package]`
3. Restart IDE/TypeScript server

---

## ✅ Final Checklist

Before considering feature complete:

- [x] All ESLint errors fixed
- [x] Code formatted with Prettier
- [x] Build passes successfully
- [x] No breaking changes
- [x] Documentation updated
- [ ] Tests passing (when added)
- [ ] Performance validated
- [ ] Security scan passed
- [ ] Accessibility audit done
- [ ] Ready for production

---

**Last Updated:** 2025-01-XX  
**Maintained By:** Development Team  
**Questions?** See [FULL_STACK_AUDIT_REPORT.md](./FULL_STACK_AUDIT_REPORT.md)
