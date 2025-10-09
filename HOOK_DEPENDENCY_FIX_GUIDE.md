# React Hook Dependency Fix Guide

## Summary

This guide provides a systematic approach to fix the remaining React Hook dependency warnings in the codebase.

### Current Status
- **Total Warnings Initially:** 120
- **Fixed:** 27 (22%)
- **Remaining:** 99 (78%)

### Files Fixed (27 warnings):

#### Admin Components (3 files, 3 warnings)
- ✅ `src/components/admin/organization-selector.tsx`
- ✅ `src/components/admin/super-admin-dashboard.tsx`
- ✅ `src/components/admin/user-management-multi-tenant.tsx`

#### Analytics Components (3 files, 3 warnings)
- ✅ `src/components/analytics/PredictiveAnalytics.tsx`
- ✅ `src/components/analytics/advanced-fleet-analytics.tsx`
- ✅ `src/components/analytics/advanced-metrics-dashboard.tsx`

#### Auth Components (1 file, 1 warning)
- ✅ `src/components/auth/mfa-prompt.tsx`

#### Automation Components (4 files, 5 warnings)
- ✅ `src/components/automation/ai-suggestions-panel.tsx`
- ✅ `src/components/automation/automated-reports-manager.tsx`
- ✅ `src/components/automation/automation-workflows-manager.tsx`
- ✅ `src/components/automation/smart-onboarding-wizard.tsx`

#### Checklists (1 file, 1 warning)
- ✅ `src/components/checklists/intelligent-checklist-manager.tsx`

#### Collaboration (1 file, 1 warning)
- ✅ `src/components/collaboration/real-time-workspace.tsx`

#### Communication (2 files, 3 warnings)
- ✅ `src/components/communication/channel-manager.tsx` (3 functions)
- ✅ `src/components/communication/chat-interface.tsx` (2 useEffects)

#### Hooks (5 files, 6 warnings)
- ✅ `src/hooks/use-enhanced-notifications.ts` (2 warnings)
- ✅ `src/hooks/use-keyboard-shortcuts.ts`
- ✅ `src/hooks/use-maritime-checklists.ts`
- ✅ `src/hooks/use-offline-storage.ts` (2 warnings)
- ✅ `src/hooks/useExpenses.ts`

#### Pages (2 files, 2 warnings)
- ✅ `src/pages/MaritimeChecklists.tsx`
- ✅ `src/pages/Voice.tsx`

---

## The Fix Pattern

### Step 1: Import useCallback

```typescript
// Before
import React, { useState, useEffect } from 'react';

// After
import React, { useState, useEffect, useCallback } from 'react';
```

### Step 2: Wrap Function in useCallback

```typescript
// Before
const loadData = async () => {
  try {
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .eq('user_id', user?.id);
    
    if (error) throw error;
    setData(data);
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to load data"
    });
  }
};

// After
const loadData = useCallback(async () => {
  try {
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .eq('user_id', user?.id);
    
    if (error) throw error;
    setData(data);
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to load data"
    });
  }
}, [user?.id, toast]); // Add all external dependencies here
```

### Step 3: Add Function to useEffect Dependencies

```typescript
// Before
useEffect(() => {
  loadData();
}, []);

// After
useEffect(() => {
  loadData();
}, [loadData]);
```

---

## Common Dependencies to Include

### Always Include:
- `toast` - from `useToast()` hook
- `user` or `user?.id` - from `useAuth()` context
- `currentOrganization?.id` - from `useOrganization()` context

### Conditionally Include:
- Props passed to the component
- State variables used in the function
- Other functions called within the function
- Context values accessed in the function

### Don't Include:
- Setter functions from `useState` (e.g., `setData`, `setLoading`)
- `useRef` values
- Constants defined outside the component

---

## Examples from Fixed Files

### Example 1: Simple Function Wrapping

**File:** `src/components/admin/organization-selector.tsx`

```typescript
const loadUserOrganizations = useCallback(async () => {
  try {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('organization_users')
      .select('...')
      .eq('user_id', user?.id);
    // ... rest of logic
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setIsLoading(false);
  }
}, [user]); // user is used in the function

useEffect(() => {
  if (user) {
    loadUserOrganizations();
  }
}, [user, loadUserOrganizations]); // Both user and function
```

### Example 2: Multiple Functions

**File:** `src/components/communication/channel-manager.tsx`

```typescript
// Function 1
const loadChannels = useCallback(async () => {
  // ... implementation
}, [toast]);

// Function 2
const setupRealTimeSubscription = useCallback(() => {
  const channel = supabase
    .channel('channels-changes')
    .on('postgres_changes', {...}, () => {
      loadChannels(); // Calls function 1
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
}, [loadChannels]); // Depends on function 1

// Function 3
const filterChannels = useCallback(() => {
  // ... implementation
}, [channels, searchTerm, selectedType]);

// useEffect uses functions
useEffect(() => {
  loadChannels();
  setupRealTimeSubscription();
}, [loadChannels, setupRealTimeSubscription]);

useEffect(() => {
  filterChannels();
}, [filterChannels]);
```

### Example 3: Adding Simple Dependencies

**File:** `src/components/checklists/intelligent-checklist-manager.tsx`

```typescript
// Before
useEffect(() => {
  setChecklists(mockChecklists);
}, []);

// After
useEffect(() => {
  setChecklists(mockChecklists);
}, [mockChecklists]); // Add constant array to deps
```

---

## Remaining Files by Category

### Communication Components (~5 files)
- `src/components/communication/enhanced-communication-center.tsx`
- `src/components/communication/inbox-manager.tsx`
- `src/components/communication/integrated-communication-system.tsx`
- `src/components/communication/maritime-communication-center.tsx`
- `src/components/communication/notification-center.tsx`

### Dashboard Components (~6 files)
- `src/components/dashboard/business-kpi-dashboard.tsx`
- `src/components/dashboard/dashboard-analytics.tsx`
- `src/components/dashboard/enhanced-unified-dashboard.tsx`
- `src/components/dashboard/organization-health-check.tsx`
- `src/components/dashboard/strategic-dashboard.tsx`
- `src/components/dashboard/unified-dashboard.tsx`

### Document Management (~2 files)
- `src/components/documents/document-management-center.tsx`
- `src/components/documents/document-management.tsx`

### Fleet Management (~7 files)
- `src/components/fleet/intelligent-alerts.tsx`
- `src/components/fleet/notification-center.tsx`
- `src/components/fleet/vessel-management-system.tsx`
- `src/components/fleet/vessel-management.tsx`
- `src/components/fleet/vessel-performance-monitor.tsx`
- `src/components/fleet/vessel-tracking-map.tsx`
- `src/components/fleet/vessel-tracking.tsx`

### And 60+ more component files...

---

## Tips for Efficient Fixing

1. **Start with simpler files** - Files with just one warning are quickest
2. **Batch similar files** - Fix all communication files together, then dashboards, etc.
3. **Copy-paste the pattern** - Use the examples above as templates
4. **Test after batches** - Run `npm run lint` after fixing 5-10 files
5. **Watch for circular dependencies** - If a function depends on itself, refactor

---

## Common Pitfalls to Avoid

❌ **Don't do this:**
```typescript
// Infinite loop - function recreated every render
const loadData = async () => { ... };
useEffect(() => {
  loadData();
}, [loadData]); // Will cause infinite loop!
```

✅ **Do this instead:**
```typescript
// Properly memoized
const loadData = useCallback(async () => { ... }, [deps]);
useEffect(() => {
  loadData();
}, [loadData]); // Safe!
```

---

## Verification

After fixing, run:
```bash
npm run lint 2>&1 | grep "react-hooks/exhaustive-deps" | wc -l
```

Target: 0 warnings

---

## Notes

- All fixes follow the same pattern
- No complex refactoring needed
- Dependencies are already imported in most files
- Most warnings can be fixed in < 2 minutes per file
- Total estimated time for remaining 99 warnings: ~3-4 hours

Good luck! 🚀
