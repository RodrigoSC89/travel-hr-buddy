# SGSO Audit Auto-Load Implementation

## Overview
This document describes the implementation of automatic loading of previous SGSO audits when a vessel is selected in the SGSOAuditPage component.

## Problem Statement
Previously, auditors had to manually fill all 17 SGSO requirements from scratch for every audit, even when auditing the same vessel multiple times. This resulted in:
- Significant time wasted on repetitive data entry
- Potential inconsistencies between audits of the same vessel
- Inability to easily continue in-progress audits
- No quick way to view previous audit data

## Solution

### Implementation Details

#### 1. Import Addition
```typescript
import { loadSGSOAudit } from "@/services/sgso-audit-service";
```

#### 2. UseEffect Hook
A new useEffect hook was added that triggers whenever `selectedVessel` changes:

```typescript
useEffect(() => {
  const fetchAudit = async () => {
    if (!selectedVessel) return;

    try {
      const audits = await loadSGSOAudit(selectedVessel);
      if (audits && audits.length > 0) {
        const latest = audits[0];
        
        // Map audit items to form fields by requirement_number
        const updatedData = requisitosSGSO.map(req => {
          const match = latest.sgso_audit_items.find(
            (item: { requirement_number: number }) => item.requirement_number === req.num
          );

          return {
            ...req,
            compliance: match?.compliance_status || "compliant",
            evidence: match?.evidence || "",
            comment: match?.comment || ""
          };
        });

        setAuditData(updatedData);
        toast.success("✅ Última auditoria carregada.");
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(`Erro ao carregar auditoria: ${error.message}`);
    }
  };

  fetchAudit();
}, [selectedVessel]);
```

#### 3. Key Features
- **Automatic Trigger**: Loads audit data automatically when a vessel is selected
- **Most Recent Audit**: Uses `loadSGSOAudit` which returns audits sorted by date (descending)
- **Smart Mapping**: Maps audit items by `requirement_number` to preserve form structure
- **Graceful Fallback**: Uses default values if no previous data exists for a requirement
- **User Feedback**: Toast notifications for success/error scenarios
- **No Spam**: No notification shown when no historical audits exist

## User Experience Flow

1. User opens SGSOAuditPage
2. User selects a vessel from the dropdown
3. System automatically fetches the most recent audit for that vessel
4. If audit exists:
   - All 17 requirement fields are populated with previous data
   - Success toast is displayed: "✅ Última auditoria carregada."
   - User can review, edit, or submit the audit
5. If no audit exists:
   - Form remains with default values (all "compliant", empty evidence/comments)
   - No notification is shown (clean UX)
6. If error occurs:
   - Error toast is displayed with descriptive message
   - Form remains with default values

## Testing

### Test Coverage
Added 4 comprehensive test cases:

1. **No Vessel Selected**: Verifies loadSGSOAudit is not called when no vessel is selected
2. **Successful Load**: Tests that audit data is loaded and form is populated correctly
3. **Error Handling**: Validates error toast is displayed when loading fails
4. **Empty Audits**: Confirms no notification when no historical audits exist

### Test Results
```
✓ SGSOAuditPage (13 tests)
  ✓ should render the page title
  ✓ should render vessel selector
  ✓ should render all 17 SGSO requirements
  ✓ should render export PDF button
  ✓ should render submit button
  ✓ should call html2pdf when export PDF button is clicked
  ✓ should have hidden PDF container with correct id
  ✓ should update audit data when evidence is entered
  ✓ should update audit data when comment is entered
  ✓ should not load audit data when no vessel is selected
  ✓ should load and populate audit data when vessel is selected
  ✓ should display error toast when loading audit fails
  ✓ should not display toast when no historical audits exist
```

## Technical Details

### Service Used
The implementation leverages the existing `loadSGSOAudit` service from `@/services/sgso-audit-service.ts`:
- Returns audits ordered by `audit_date` descending (most recent first)
- Includes nested `sgso_audit_items` with requirement details
- Properly typed with TypeScript for type safety

### Data Mapping
```typescript
const updatedData = requisitosSGSO.map(req => {
  const match = latest.sgso_audit_items.find(
    (item: { requirement_number: number }) => item.requirement_number === req.num
  );

  return {
    ...req,
    compliance: match?.compliance_status || "compliant",
    evidence: match?.evidence || "",
    comment: match?.comment || ""
  };
});
```

### Error Handling
- Proper TypeScript error handling without using `any` type
- User-friendly error messages
- No crashes on failure
- Clean error boundaries

## Benefits

### For Auditors
- **Time Savings**: Eliminates redundant data entry for all 17 SGSO requirements
- **Consistency**: Maintains continuity across audits for the same vessel
- **Easy Review**: Quickly access and review previous audit data
- **Flexibility**: Can edit loaded data or use as baseline for new audits

### For the System
- **Reusability**: Leverages existing `loadSGSOAudit` service
- **Type Safety**: Properly typed with TypeScript
- **Error Handling**: Robust error boundaries prevent crashes
- **Clean Code**: Separation of concerns with service layer

## Files Changed
1. `src/pages/SGSOAuditPage.tsx` - Added auto-load functionality
2. `src/tests/pages/SGSOAuditPage.test.tsx` - Added comprehensive test coverage

## Build & Test Results
- ✅ All 121 test files pass (1829 total tests)
- ✅ Build successful with no errors
- ✅ No lint errors in changed files
- ✅ TypeScript compilation successful

## Related PRs
- PR #1030: Fix deployment error and add automatic loading of previous SGSO audits by vessel selection
- PR #1028: Add automatic loading of previous SGSO audits by vessel selection
