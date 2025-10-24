# PATCH 84.0 & 85.0 Implementation Guide

## Overview

This document describes the implementation of PATCH 84.0 (Real Module Usage Checklist) and PATCH 85.0 (AI Self-Correction Watchdog v2) for Nautilus One.

## PATCH 84.0 - Real Module Usage Checklist

### Purpose

Create an embedded AI system that tests each module in the registry by simulating real usage patterns, verifying:
- Basic interaction capability
- AI connectivity and responses
- UI functionality
- Log persistence
- Overall module health

### Implementation Details

#### Module Tester (`src/lib/dev/module-tester.ts`)

**Core Functions:**
1. `testModule(module)` - Tests a single module
2. `testAllModules(progressCallback)` - Tests all modules in registry
3. `generateMarkdownReport(results)` - Creates status report
4. `getModuleTestStats()` - Returns testing statistics

**Test Flow for Each Module:**
1. Check if module has a route defined
2. Execute AI context call using `runAIContext`
3. Save test log to localStorage
4. Evaluate module status based on:
   - AI call success
   - Log persistence
   - Error count
   - Warning count

**Status Classification:**
- ✅ **Ready**: All checks pass, no errors
- 🟡 **Partial**: Working but has warnings (e.g., deprecated, low AI confidence)
- 🔴 **Failed**: Critical checks fail or errors present

#### UI Component (`src/components/dev/ModuleTesterUI.tsx`)

**Features:**
- Interactive test execution with progress bar
- Real-time statistics display
- Results table with status indicators
- Report generation and download
- Copy report to clipboard

**Key UI Elements:**
- Statistics cards (total tests, modules covered, avg AI confidence, last test)
- Progress indicator during testing
- Summary with ready/partial/failed breakdown
- Detailed results table
- Report preview with markdown

#### CLI Script (`scripts/test-modules.cjs`)

**Purpose:** Run tests from command line for CI/CD integration

**Usage:**
```bash
npm run test:modules
```

**Output:**
- Console summary
- Markdown report at `dev/checklists/modules_status_table.md`

### Testing Strategy

The module tester validates:
1. **Route Accessibility**: Module has a valid route
2. **AI Integration**: `runAIContext` returns valid response
3. **Data Persistence**: Logs are saved correctly
4. **Error Detection**: Catches and reports failures

### Report Format

```markdown
# Nautilus One - Module Status Report

**Generated:** [timestamp]
**Total Modules:** [count]

## Summary
- ✅ Ready: X (Y%)
- 🟡 Partial: X (Y%)
- 🔴 Failed: X (Y%)

## Module Status Table
| Status | Module ID | Module Name | Route | AI Call | Logs | Details |
|--------|-----------|-------------|-------|---------|------|---------|
| ...    | ...       | ...         | ...   | ...     | ...  | ...     |

## Failed Modules Details
[Detailed error information]

## Partial Modules Details
[Warning information]
```

## PATCH 85.0 - AI Self-Correction Watchdog v2

### Purpose

Create an intelligent monitoring system that:
- Detects error patterns automatically
- Intervenes when errors repeat
- Suggests fixes for manual correction
- Prevents cascading failures

### Implementation Details

#### Watchdog System (`src/lib/dev/watchdog.ts`)

**Core Class: `SystemWatchdog`**

**Error Detection Types:**
1. `missing_import` - Module/file not found
2. `undefined_reference` - Variable accessed before definition
3. `blank_screen` - White screen of death (WSOD)
4. `logic_failure` - Business logic errors
5. `repeated_error` - Any error occurring multiple times

**Key Methods:**
- `start()` - Begin monitoring
- `stop()` - Stop monitoring
- `getErrorPatterns()` - Get detected error patterns
- `getPRSuggestions()` - Get fix suggestions
- `getStats()` - Get monitoring statistics

**Monitoring Mechanisms:**
1. **Console Error Interception**: Wraps `console.error`
2. **Window Error Handler**: Captures unhandled errors
3. **Periodic Checks**: Validates application state
4. **Pattern Analysis**: Identifies error types and frequencies

**Intervention Strategy:**

When error count reaches threshold (default: 3):
1. **Missing Import**: Attempt dynamic fallback
2. **Undefined Reference**: Log suggestion for null checks
3. **Blank Screen**: Reload application with state recovery
4. **Logic Failure**: Generate PR fix suggestion
5. **Repeated Error**: Generate PR fix suggestion

#### UI Component (`src/components/dev/WatchdogUI.tsx`)

**Features:**
- Real-time status monitoring
- Error pattern visualization
- PR suggestion management
- Log viewing and analysis
- Error distribution charts

**Key UI Elements:**
- Status indicator (active/inactive)
- Statistics cards (total errors, patterns, interventions)
- Error patterns list with suggested fixes
- PR suggestions with stack traces
- Recent logs with timestamps
- Error distribution breakdown

#### Configuration Options

```typescript
interface WatchdogConfig {
  enabled: boolean;           // Enable/disable monitoring
  maxErrorRepeats: number;    // Threshold for intervention
  checkInterval: number;      // Check frequency (ms)
  autoFix: boolean;          // Automatic intervention
  logToConsole: boolean;     // Console logging
  logToLocalStorage: boolean;// Persistent logging
}
```

### Error Pattern Detection

**Pattern Recognition:**
1. Normalize error messages (remove dynamic values)
2. Create unique error key
3. Track frequency and timing
4. Detect error type from message content
5. Generate suggested fix

**Pattern Cleanup:**
- Patterns inactive for 5+ minutes are removed
- Keeps system responsive
- Prevents memory bloat

### Suggested Fix Generation

For each error type, the watchdog generates context-aware suggestions:

**Missing Import:**
```
Check if module '[name]' exists and is properly exported.
Consider adding a fallback or lazy loading.
```

**Undefined Reference:**
```
Variable '[name]' is not defined.
Add null checks or initialize before use.
```

**Blank Screen:**
```
Blank screen detected. Check for unhandled errors in render cycle.
Add error boundaries.
```

**Logic Failure:**
```
Logic error detected. Review business logic and add validation.
```

### PR Fix Suggestion Format

```json
{
  "type": "PR_FIX_NEEDED",
  "errorType": "missing_import",
  "message": "Cannot find module 'example'",
  "suggestedFix": "Check if module exists...",
  "occurrences": 5,
  "stack": "...",
  "timestamp": "2025-10-24T..."
}
```

## Integration Points

### Module Registry Integration

Both patches integrate with `src/modules/registry.ts`:
- Module tester iterates through `MODULE_REGISTRY`
- Tests validate each module's configuration
- Results correlate with registry metadata

### AI Kernel Integration

Module tester uses `src/ai/kernel.ts`:
- Calls `runAIContext` for each module
- Validates AI response quality
- Tests module-specific AI patterns

### Application Router Integration

Dev tools page added to `src/AppRouter.tsx`:
```typescript
const DevTools = React.lazy(() => import("@/pages/DevTools"));
// ...
<Route path="/dev-tools" element={<DevTools />} />
```

## Usage Instructions

### Accessing Dev Tools

Navigate to: `http://localhost:5173/dev-tools`

### Running Module Tests

**Via UI:**
1. Go to Dev Tools page
2. Click "Run Tests" button
3. Monitor progress
4. View results and download report

**Via CLI:**
```bash
npm run test:modules
```

### Using Watchdog

**Via UI:**
1. Go to Dev Tools page
2. Switch to "Watchdog v2" tab
3. Toggle "Auto-fix" if desired
4. Click "Start Watchdog"
5. Monitor in real-time

**Programmatically:**
```typescript
import { startWatchdog, getWatchdog } from '@/lib/dev/watchdog';

// Start with auto-fix
startWatchdog({ autoFix: true });

// Get statistics
const watchdog = getWatchdog();
console.log(watchdog.getStats());
```

## Testing Procedures

### Test Module Tester

1. **Verify Registry Access:**
   ```typescript
   import { MODULE_REGISTRY } from '@/modules/registry';
   console.log(Object.keys(MODULE_REGISTRY).length);
   ```

2. **Run Single Module Test:**
   ```typescript
   import { testModule } from '@/lib/dev/module-tester';
   import { MODULE_REGISTRY } from '@/modules/registry';
   
   const result = await testModule(MODULE_REGISTRY['core.dashboard']);
   console.log(result);
   ```

3. **Verify Report Generation:**
   ```bash
   npm run test:modules
   cat dev/checklists/modules_status_table.md
   ```

### Test Watchdog

1. **Start Watchdog:**
   ```typescript
   import { startWatchdog } from '@/lib/dev/watchdog';
   startWatchdog({ autoFix: false, logToConsole: true });
   ```

2. **Trigger Test Errors:**
   ```typescript
   // Repeated error
   console.error('Test error 1');
   console.error('Test error 1');
   console.error('Test error 1'); // Should trigger intervention
   ```

3. **Check Pattern Detection:**
   ```typescript
   import { getWatchdog } from '@/lib/dev/watchdog';
   const patterns = getWatchdog().getErrorPatterns();
   console.log(patterns);
   ```

4. **Verify PR Suggestions:**
   ```typescript
   const suggestions = getWatchdog().getPRSuggestions();
   console.log(suggestions);
   ```

## Performance Considerations

### Module Tester
- Sequential testing with 100ms delay between modules
- Prevents overwhelming the system
- Total time: ~5-10 seconds for 52 modules

### Watchdog
- Minimal performance impact
- Error interception is lightweight
- Periodic checks every 5 seconds
- Pattern cleanup prevents memory leaks

## Security Considerations

### Data Storage
- All logs stored in localStorage (client-side only)
- No sensitive data transmitted
- User-controlled data retention

### Error Handling
- Graceful degradation if storage unavailable
- No impact on production operations
- Isolated error boundaries

## Maintenance

### Updating Module Registry
When adding new modules:
1. Add to `MODULE_REGISTRY` in `src/modules/registry.ts`
2. Include required metadata (id, name, route, etc.)
3. Re-run module tests to validate

### Configuring Watchdog
Adjust thresholds based on:
- Application stability
- Error frequency patterns
- Development vs. production environments

### Report Management
- Reports are versioned by date
- Keep recent reports for trend analysis
- Archive or delete old reports as needed

## Troubleshooting

### Module Tests Fail
**Problem**: Tests fail with "AI call failed"
**Solution**: 
- Check AI kernel is properly initialized
- Verify OpenAI API key is configured
- Test AI context manually

### Watchdog Not Detecting Errors
**Problem**: Errors occur but watchdog doesn't catch them
**Solution**:
- Verify watchdog is started
- Check console for watchdog logs
- Ensure errors aren't caught silently

### Reports Not Generated
**Problem**: CLI script fails to create report
**Solution**:
- Check dev/checklists directory exists
- Verify write permissions
- Run with verbose logging

## Future Enhancements

### Module Tester
- [ ] Add route accessibility tests (actual navigation)
- [ ] Implement UI screenshot capture
- [ ] Add performance benchmarking
- [ ] Create test scheduling system

### Watchdog
- [ ] Machine learning for pattern prediction
- [ ] Automatic PR creation via GitHub API
- [ ] Integration with error tracking services
- [ ] Alert notifications for critical errors

## Conclusion

PATCH 84.0 and 85.0 provide comprehensive tools for:
- Validating module functionality
- Monitoring application health
- Detecting and correcting errors
- Improving development workflow

These tools ensure Nautilus One maintains high reliability and provides actionable insights for continuous improvement.
