# SGSO Audit Service Implementation

## Overview

This PR implements two key functions for managing SGSO (Safety Management System) audits as specified in issue #1002.

## Implementation Details

### Files Created

1. **`src/services/sgso-audit-service.ts`** - Core service implementation
2. **`src/tests/sgso-audit-service.test.ts`** - Comprehensive test suite (21 tests)

### Functions Implemented

#### 1. `submitSGSOAudit`

Creates a new SGSO audit with associated audit items.

**Signature:**
```typescript
export async function submitSGSOAudit(
  vesselId: string,
  auditorId: string,
  items: AuditItem[]
): Promise<string>
```

**Parameters:**
- `vesselId` - UUID of the vessel being audited
- `auditorId` - UUID of the auditor conducting the audit
- `items` - Array of audit items with compliance data

**Returns:** The ID of the created audit

**Behavior:**
1. Inserts a new record into `sgso_audits` table with `vessel_id` and `auditor_id`
2. Maps each item to include the `audit_id`
3. Inserts all items into `sgso_audit_items` table
4. Returns the audit ID on success
5. Throws descriptive errors on failure

#### 2. `loadSGSOAudit`

Retrieves all SGSO audits for a specific vessel with nested audit items.

**Signature:**
```typescript
export async function loadSGSOAudit(vesselId: string): Promise<SGSOAudit[]>
```

**Parameters:**
- `vesselId` - UUID of the vessel

**Returns:** Array of audits with nested items, ordered by date (newest first)

**Behavior:**
1. Queries `sgso_audits` table with nested `sgso_audit_items`
2. Filters by `vessel_id`
3. Orders results by `audit_date` descending
4. Returns array of audits with full item details
5. Throws descriptive errors on failure

### Type Definitions

```typescript
export type AuditItem = {
  requirement_number: number;
  requirement_title: string;
  compliance_status: 'compliant' | 'partial' | 'non-compliant';
  evidence: string;
  comment: string;
};

export type SGSOAudit = {
  id: string;
  audit_date: string;
  auditor_id: string;
  sgso_audit_items: AuditItem[];
};
```

## Testing

### Test Coverage

- **21 tests** covering all aspects of the implementation
- Tests validate function signatures, parameters, and return types
- Tests verify error handling for both database operations
- Tests confirm proper data transformation and mapping
- Tests validate TypeScript type definitions

### Running Tests

```bash
npm test -- sgso-audit-service.test.ts
```

**Result:** ✅ All 21 tests passing

## Quality Checks

### Build
```bash
npm run build
```
**Result:** ✅ Build successful with no TypeScript errors

### Linting
```bash
npm run lint
```
**Result:** ✅ No linting errors or warnings in new files

### Full Test Suite
```bash
npm test
```
**Result:** ✅ All 1797 tests passing (including 21 new tests)

## Usage Example

```typescript
import { submitSGSOAudit, loadSGSOAudit } from '@/services/sgso-audit-service';

// Submit a new audit
const items = [
  {
    requirement_number: 1,
    requirement_title: 'Safety Management System',
    compliance_status: 'compliant',
    evidence: 'Certificate on file',
    comment: 'All requirements met'
  },
  {
    requirement_number: 2,
    requirement_title: 'Emergency Response',
    compliance_status: 'partial',
    evidence: 'Training records incomplete',
    comment: 'Need to update training'
  }
];

const auditId = await submitSGSOAudit(vesselId, auditorId, items);
console.log('Audit created:', auditId);

// Load audits for a vessel
const audits = await loadSGSOAudit(vesselId);
console.log('Found audits:', audits.length);
```

## Database Schema Requirements

The implementation assumes the following database tables exist:

### `sgso_audits`
- `id` (UUID, primary key)
- `vessel_id` (UUID, foreign key)
- `auditor_id` (UUID)
- `audit_date` (timestamp with timezone)

### `sgso_audit_items`
- `id` (UUID, primary key)
- `audit_id` (UUID, foreign key to sgso_audits)
- `requirement_number` (integer)
- `requirement_title` (text)
- `compliance_status` (text with check constraint)
- `evidence` (text)
- `comment` (text)

## Error Handling

Both functions provide clear, localized error messages in Portuguese:

- **Audit creation failure:** `"Erro ao criar auditoria: {error message}"`
- **Items insertion failure:** `"Erro ao salvar itens: {error message}"`
- **Load failure:** `"Erro ao carregar auditorias: {error message}"`

## Integration

This service follows the existing patterns in the codebase:

- Uses `@/integrations/supabase/client` for database access
- Follows naming conventions similar to `imca-audit-service.ts`
- Provides TypeScript types for all data structures
- Includes comprehensive error handling
- Uses async/await for asynchronous operations

## Next Steps

To use these functions in the application:

1. Ensure database tables `sgso_audits` and `sgso_audit_items` are created with the required schema
2. Import the functions where needed in your React components or API routes
3. Handle the returned promises with proper error handling
4. Display the audit data using the returned types

## Summary

✅ **Implementation Complete**
- 2 functions implemented as specified
- 21 comprehensive tests written and passing
- Full TypeScript support with proper types
- Error handling with descriptive messages
- Follows existing codebase patterns
- All quality checks passing (build, lint, tests)
