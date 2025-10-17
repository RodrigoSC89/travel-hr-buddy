# Fix CI Test Failures - Workflow Module Implementation

## Problem Statement

The CI pipeline was failing with test import errors for two test suites:
- `src/tests/workflows/exampleIntegration.test.ts`
- `src/tests/workflows/suggestionTemplates.test.ts`

### Error Messages
```
Failed to resolve import "../../../lib/workflows/exampleIntegration" from "src/tests/workflows/exampleIntegration.test.ts". Does the file exist?
Failed to resolve import "../../../lib/workflows/suggestionTemplates" from "src/tests/workflows/suggestionTemplates.test.ts". Does the file exist?
```

## Root Cause Analysis

1. **Missing Source Files**: The test files were importing from modules that didn't exist in the repository:
   - `../../../lib/workflows/exampleIntegration`
   - `../../../lib/workflows/suggestionTemplates`

2. **Incorrect Import Path**: The path `../../../lib` from `src/tests/workflows/` resolves to the repository root at `/lib/workflows/`, not `/src/lib/workflows/` where source files should be located.

3. **Path Resolution**:
   - Test location: `/src/tests/workflows/`
   - `../` → `/src/tests/`
   - `../../` → `/src/`
   - `../../../` → `/` (repository root)
   - Therefore `../../../lib` → `/lib` (not `/src/lib`)

## Solution

### 1. Created Missing Source Files

#### `src/lib/workflows/suggestionTemplates.ts`
Created the template data structure and type definitions:
- **Interface**: `WorkflowSuggestionTemplate` with 6 required fields
- **Data**: Array of 3 workflow suggestion templates
- **Templates**:
  1. Sensor redundancy verification (Alta criticidade, Oficial de Náutica)
  2. FMEA document update (Média criticidade, Engenharia Onshore)
  3. Incomplete checklist review (Alta criticidade, Supervisor de DP)

```typescript
export interface WorkflowSuggestionTemplate {
  etapa: string;
  tipo_sugestao: string;
  conteudo: string;
  criticidade: "Alta" | "Média" | "Baixa";
  responsavel_sugerido: string;
  origem: string;
}
```

#### `src/lib/workflows/exampleIntegration.ts`
Implemented utility functions and interfaces:
- **Interfaces**: `SmartWorkflow`, `FormattedTemplate`, `TemplateSummary`
- **9 Utility Functions**:
  1. `convertTemplateToWorkflowFormat()` - Convert template to SmartWorkflow
  2. `getTemplatesByCriticidade()` - Filter by criticidade level
  3. `getHighPriorityTemplates()` - Get Alta criticidade only
  4. `getTemplatesByResponsavel()` - Filter by responsible person
  5. `getTemplatesBySuggestionType()` - Filter by suggestion type
  6. `searchTemplates()` - Search by keyword
  7. `createWorkflowFromTemplate()` - Create workflow from index
  8. `getAllTemplatesFormatted()` - Format all templates
  9. `getTemplateSummary()` - Get template statistics

### 2. Fixed Test Imports

Changed the relative import paths in both test files:
- **From**: `../../../lib/workflows/` (incorrect - resolves to repo root)
- **To**: `../../lib/workflows/` (correct - resolves to src/lib/)

This makes tests import directly from TypeScript source files, eliminating the need for a build step before running tests.

## Implementation Details

### Type Definitions
All types properly defined with TypeScript interfaces:
- No `any` types used
- Proper union types for criticidade levels
- Clear interface definitions for all data structures

### Function Implementations
All functions follow best practices:
- Immutable operations (filter, map, etc.)
- Case-insensitive search/filtering where appropriate
- Null safety with proper return types
- Support for partial overrides in conversion function

### Test Coverage
All 56 tests now pass:
- 17 tests for `suggestionTemplates.test.ts`
- 39 tests for `exampleIntegration.test.ts`
- Covers all functions and edge cases
- Validates data structure and types

## Results

### Before
❌ **Test Failures**: 2 test suites failing
❌ **Tests Passing**: 1404 out of 1460
❌ **Import Errors**: Files not found

### After
✅ **Test Success**: All 96 test suites passing
✅ **Tests Passing**: 1460 out of 1460 (100%)
✅ **Import Resolution**: All imports resolve correctly
✅ **TypeScript**: No compilation errors
✅ **Build**: Production build successful (57.78s)
✅ **Linting**: No errors in new files

## Files Changed

| File | Type | Lines | Description |
|------|------|-------|-------------|
| `src/lib/workflows/suggestionTemplates.ts` | Created | 35 | Template data and type definition |
| `src/lib/workflows/exampleIntegration.ts` | Created | 171 | Utility functions and interfaces |
| `src/tests/workflows/exampleIntegration.test.ts` | Modified | 2 | Fixed import paths |
| `src/tests/workflows/suggestionTemplates.test.ts` | Modified | 1 | Fixed import paths |

**Total**: 209 lines added, 3 lines modified

## CI/CD Impact

This fix resolves the failing GitHub Actions workflow jobs:
- Job 52975589805 ✅
- Job 52975589718 ✅
- Job 52975589761 ✅

The code quality check workflow will now pass without requiring:
- A build step before tests
- Compiled output in the `lib/` directory
- Any workflow configuration changes

## Recommendations

### For Future Development
1. **Import from Source**: Tests should always import from source files (`src/`) not compiled output
2. **Path Aliases**: Consider adding Vite/TypeScript path aliases to simplify imports
3. **Module Organization**: Keep related modules in `src/lib/` following existing structure

### Alternative Approaches Considered
1. **Build before test**: Add build step to CI workflow (rejected - unnecessary overhead)
2. **Path aliases**: Configure Vite to map `lib/` to `src/lib/` (rejected - import path fix is clearer)
3. **Move source to root**: Create `/lib/workflows/` at root (rejected - breaks existing structure)

## Testing Instructions

To verify the fix locally:

```bash
# Install dependencies
npm ci

# Run workflow tests specifically
npm test -- src/tests/workflows/

# Run full test suite
npm test

# Verify build
npm run build

# Check TypeScript
npx tsc --noEmit
```

All commands should complete successfully with no errors.

## Conclusion

This fix implements the minimal changes needed to resolve the test failures:
- Created the missing source files with proper implementation
- Fixed import paths to point to source files
- All tests now pass without requiring build artifacts
- No changes needed to CI/CD workflows
- No impact on existing functionality

The solution follows Option B from the problem statement: "Update tests to import from source (no build required)" with the correct path resolution.
