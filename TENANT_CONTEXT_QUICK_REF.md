# TenantContext Quick Reference

## 🚨 Before Editing TenantContext.tsx

```bash
# 1. Pull latest changes
git pull origin main

# 2. Check for open PRs
gh pr list --search "TenantContext"

# 3. Create feature branch
git checkout -b feature/your-change-name
```

## ✅ Type Safety Rules

### DO ✅
```typescript
// Use specific types
Record<string, unknown>
Array<string>
SaasTenant | null
{ data: TenantBranding; error: unknown }

// Prefix unused params with underscore
async function myFunc(_unusedParam: string) { }
```

### DON'T ❌
```typescript
// Never use any
any
: any
as any

// Don't leave useless try/catch
try {
  // code
} catch (err) {
  throw err;  // ❌ useless
}
```

## 🔧 After Making Changes

```bash
# 1. Build
npm run build

# 2. Lint
npm run lint

# 3. Commit
git add src/contexts/TenantContext.tsx
git commit -m "feat(tenant): Your change description"

# 4. Push
git push origin feature/your-change-name
```

## 📝 Naming Convention

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `currentTenant` |
| Functions | camelCase | `loadTenantData` |
| Interfaces | PascalCase | `TenantContextType` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Booleans | is/has prefix | `isLoading`, `hasPermission` |

## 🔍 Common Patterns

### Loading Data with Timeout
```typescript
const timeoutPromise = new Promise<null>((_, reject) => 
  setTimeout(() => reject(new Error("Timeout")), 3000)
);

const fetchPromise = supabase.from("table").select("*");

const { data, error } = await Promise.race([
  fetchPromise,
  timeoutPromise
]).catch(() => ({ data: null, error: null })) as { 
  data: YourType | null; 
  error: unknown 
};
```

### Updating with Error Handling
```typescript
const { data, error } = await supabase
  .from("table")
  .update(updates)
  .eq("id", id)
  .select()
  .single();

if (error) throw error;
// Use data here
```

## 🐛 Conflict Resolution

If you get merge conflicts:

```bash
# 1. Fetch latest
git fetch origin main

# 2. Try to rebase
git rebase origin/main

# 3. If conflicts, resolve in editor
# Look for <<<<<<< HEAD markers

# 4. After fixing conflicts
git add src/contexts/TenantContext.tsx
git rebase --continue

# 5. Verify
npm run build && npm run lint

# 6. Force push (if needed after rebase)
git push --force-with-lease
```

## 📦 Interface Structure Order

```typescript
// 1. Core interfaces (top of file)
interface SaasTenant { }
interface TenantBranding { }

// 2. Related entities
interface TenantUser { }
interface SaasPlan { }
interface TenantUsage { }

// 3. Context type (last)
interface TenantContextType { }
```

## 🎯 Function Organization

```typescript
// 1. Data loading
const loadTenantData = async () => { }
const loadPlans = async () => { }

// 2. CRUD operations
const updateBranding = async () => { }
const updateTenantSettings = async () => { }

// 3. User management
const inviteTenantUser = async () => { }
const updateUserRole = async () => { }

// 4. Permissions
const checkPermission = () => { }
const checkFeatureAccess = () => { }

// 5. Utilities
const formatCurrency = () => { }
const formatDate = () => { }
```

## ⚠️ Watch Out For

- ❌ Using `any` type
- ❌ Inconsistent naming (downgradeplan vs downgradePlan)
- ❌ Useless try/catch wrappers
- ❌ Unused parameters without `_` prefix
- ❌ Missing type annotations on Promise.race
- ❌ Empty function implementations without TODO comment

## 🎓 Type Safety Quick Wins

```typescript
// Before (BAD)
const data: any = await fetchData();

// After (GOOD)
const data: TenantBranding | null = await fetchData();

// Before (BAD)
settings: any

// After (GOOD)
settings: Record<string, unknown>

// Before (BAD)
(userTenants as any[]).map((ut: any) => ut.saas_tenants)

// After (GOOD)
(userTenants as Array<{ saas_tenants: SaasTenant }>)
  .map((ut) => ut.saas_tenants)
```

## 🚀 CI/CD Quick Check

Before pushing:
```bash
npm run lint && npm run build
```

If lint fails:
```bash
npm run lint:fix
```

## 📞 Need Help?

1. Check [CONFLICT_PREVENTION_GUIDE.md](./CONFLICT_PREVENTION_GUIDE.md)
2. Review [CODE_QUALITY_IMPROVEMENTS_SUMMARY.md](./CODE_QUALITY_IMPROVEMENTS_SUMMARY.md)
3. Ask in team chat
4. Tag experienced developers in PR

---

**Quick Tip:** Bookmark this file! You'll need it often when working with TenantContext.
