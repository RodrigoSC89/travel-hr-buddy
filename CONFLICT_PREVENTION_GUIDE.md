# Conflict Prevention Guide for TenantContext.tsx

## Overview
This guide documents strategies to prevent merge conflicts in `src/contexts/TenantContext.tsx` and other critical files.

## Why TenantContext is Conflict-Prone

The `TenantContext.tsx` file is frequently edited because it:
- Contains core business logic for multi-tenant functionality
- Has numerous interfaces and type definitions
- Includes multiple async functions
- Is imported by many components across the application

## Changes Made to Improve Maintainability

### 1. Fixed Naming Inconsistency
**Issue:** Function name was inconsistent with naming convention
```typescript
// Before
downgradeplan: (planId: string) => Promise<void>; // incorrect camelCase

// After
downgradePlan: (planId: string) => Promise<void>; // correct camelCase
```

### 2. Replaced All `any` Types
**Total:** 11 `any` types replaced with proper TypeScript types

**Interfaces Updated:**
- `TenantBranding`: 7 properties (header_style, sidebar_style, button_style, enabled_modules, module_settings, custom_fields, business_rules)
- `TenantUser`: 2 properties (permissions, metadata)
- `SaasPlan`: 1 property (features)
- `TenantUsage`: 1 property (metadata)

**Type Replacements in Code:**
```typescript
// Before
as any

// After
as { data: TenantBranding | null; error: unknown }
as { data: TenantUser | null; error: unknown }
as { data: TenantUsage | null; error: unknown }
as { data: SaasPlan[] | null; error: unknown }
as Array<{ saas_tenants: SaasTenant }>
as Record<string, unknown>
```

### 3. Code Quality Improvements
- Removed useless try/catch wrappers that only re-throw errors
- Fixed unused parameter warnings by prefixing with underscore
- Improved type inference for Promise.race operations

## Conflict Prevention Best Practices

### 1. Always Pull Before Making Changes
```bash
git pull origin main
```

### 2. Make Small, Focused Changes
- Change one interface or function at a time
- Commit frequently with clear messages
- Use feature branches for larger changes

### 3. Follow Consistent Patterns

#### Interface Definitions
Always place interfaces at the top of the file in this order:
1. Core domain interfaces (SaasTenant, TenantBranding)
2. Related entities (TenantUser, SaasPlan, TenantUsage)
3. Context interface (TenantContextType)

#### Function Organization
Group functions logically:
1. Data loading functions (loadTenantData, loadPlans, etc.)
2. CRUD operations (updateBranding, updateTenantSettings)
3. User management functions
4. Permission checking functions
5. Utility functions (formatCurrency, formatDate)

### 4. Use Proper TypeScript Types

#### DO ✅
```typescript
interface MyInterface {
  data: Record<string, unknown>;  // flexible but typed
  metadata: Record<string, string>; // when you know the value type
  features: Array<string>;  // when you know the array content
}
```

#### DON'T ❌
```typescript
interface MyInterface {
  data: any;  // loses all type safety
  metadata: any;  // makes refactoring dangerous
  features: any;  // hides bugs
}
```

### 5. Naming Conventions

**Variables and Functions:**
- Use camelCase: `downgradePlan`, `loadTenantData`
- Be descriptive: `currentTenant` not `tenant`
- Boolean prefixes: `isLoading`, `hasPermission`

**Interfaces:**
- Use PascalCase: `TenantContextType`, `SaasTenant`
- Descriptive names: `TenantBranding` not `Branding`

**Constants:**
- Use UPPER_SNAKE_CASE for true constants: `MAX_RETRIES`
- Use camelCase for configuration objects: `defaultBranding`

### 6. Resolving Conflicts When They Occur

If you encounter a merge conflict in TenantContext.tsx:

#### Step 1: Understand Both Changes
```bash
git diff HEAD...origin/main src/contexts/TenantContext.tsx
```

#### Step 2: Identify Conflict Type
- **Interface changes:** Usually safe to merge both additions
- **Function implementations:** May need careful integration
- **Type changes:** Ensure consistency across the file

#### Step 3: Resolve Systematically
1. Accept both changes for interface additions
2. For function modifications, preserve the more complete implementation
3. For type changes, choose the most specific type
4. Test immediately after resolving

#### Step 4: Verify After Resolution
```bash
npm run lint
npm run build
npm run test
```

### 7. Communication

When working on TenantContext:
1. **Check open PRs** that might touch the same file
2. **Comment in PR** if you're making significant changes
3. **Coordinate with team** on major refactors
4. **Update this guide** when you learn new patterns

## Code Review Checklist for TenantContext Changes

- [ ] All types are properly defined (no `any`)
- [ ] Function names follow camelCase convention
- [ ] Interfaces are complete and well-documented
- [ ] Error handling is consistent
- [ ] No useless try/catch wrappers
- [ ] Build passes: `npm run build`
- [ ] Linter passes: `npm run lint`
- [ ] Tests pass (when available)

## Git Workflow for TenantContext

```bash
# 1. Create feature branch
git checkout -b feature/tenant-context-improvement

# 2. Make small changes
# ... edit file ...

# 3. Test changes
npm run build && npm run lint

# 4. Commit with clear message
git add src/contexts/TenantContext.tsx
git commit -m "feat(tenant): Add new tenant feature X"

# 5. Push frequently
git push origin feature/tenant-context-improvement

# 6. Keep branch updated
git fetch origin main
git rebase origin/main

# 7. Resolve any conflicts immediately
# ... resolve conflicts ...
git add src/contexts/TenantContext.tsx
git rebase --continue

# 8. Final validation
npm run build && npm run lint
```

## Common Conflict Scenarios

### Scenario 1: Interface Property Addition
**Conflict:** Both branches add a new property to an interface

**Resolution:**
```typescript
interface TenantBranding {
  // ... existing properties ...
  
  // Add both new properties
  new_property_from_branch_a: string;  // from branch A
  new_property_from_branch_b: number;  // from branch B
}
```

### Scenario 2: Function Implementation Change
**Conflict:** Same function modified in both branches

**Resolution:**
1. Compare the changes side by side
2. If both add different features, merge both
3. If both fix the same bug, keep the better fix
4. Test thoroughly after merging

### Scenario 3: Type Definition Change
**Conflict:** Same type changed differently

**Resolution:**
1. Choose the more specific/strict type
2. Ensure consistency throughout the file
3. Update all usages of the type
4. Run type checker: `npx tsc --noEmit`

## Automated Conflict Prevention

The project uses these tools to prevent issues:

### 1. Pre-commit Hooks (Husky)
Automatically runs before commits:
- ESLint with auto-fix
- Prettier formatting
- Type checking

### 2. ESLint Rules
Enforces:
- No `any` types (error)
- No empty catch blocks (error)
- No unused variables (warning)
- Consistent naming (warning)

### 3. CI/CD Checks
Runs on every PR:
- Build validation
- Lint checks
- Type checking
- Test suite (when available)

## Maintenance Schedule

### Weekly
- [ ] Review open PRs touching TenantContext
- [ ] Update this guide with new patterns

### Monthly
- [ ] Refactor large functions (>50 lines)
- [ ] Review and update interface documentation
- [ ] Check for unused code

### Quarterly
- [ ] Major refactoring if needed
- [ ] Update type definitions to match database schema
- [ ] Performance optimization review

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Context Best Practices](https://react.dev/learn/passing-data-deeply-with-context)
- [Git Conflict Resolution](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-using-the-command-line)

## Questions?

If you encounter a conflict pattern not covered here, please:
1. Document it in this guide
2. Share in team chat
3. Add to code review checklist

---

**Last Updated:** 2025-10-10
**Maintained By:** Development Team
**Version:** 1.0.0
