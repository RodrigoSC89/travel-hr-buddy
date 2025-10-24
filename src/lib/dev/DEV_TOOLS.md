# Developer Tools - PATCH 84.0 & 85.0

This directory contains development and testing tools for Nautilus One.

## PATCH 84.0 - Real Module Usage Checklist

Automated testing system that validates each module in the registry by simulating real crew usage.

### Features

- **Route Navigation Testing**: Verifies that module routes are accessible
- **AI Context Execution**: Tests AI integration by calling `runAIContext` for each module
- **Log Validation**: Ensures logs are saved correctly
- **Module Classification**: Categorizes modules as:
  - ✅ **Ready**: Fully functional with no issues
  - 🟡 **Partial**: Working but with warnings
  - 🔴 **Failed**: Critical issues detected

### Usage

#### Via UI

Navigate to `/dev-tools` in the application to access the Module Tester interface.

#### Via Command Line

```bash
npm run test:modules
```

This generates a report at `dev/checklists/modules_status_table.md`.

### Module Tester API

```typescript
import { testAllModules, generateMarkdownReport } from '@/lib/dev/module-tester';

// Run tests on all modules
const results = await testAllModules((progress, total, moduleName) => {
  console.log(`Testing ${moduleName} (${progress}/${total})`);
});

// Generate markdown report
const report = generateMarkdownReport(results);
console.log(report);
```

### Report Format

The generated report includes:
- Summary statistics (ready/partial/failed counts)
- Module status table with:
  - Status icon
  - Module ID and name
  - Route path
  - AI call status
  - Log status
  - Error/warning details
- Detailed sections for failed and partial modules

## PATCH 85.0 - AI Self-Correction Watchdog v2

Real-time error monitoring system that automatically detects and corrects issues.

### Features

- **Error Pattern Detection**: Identifies repeated errors, blank screens, missing imports, and logic failures
- **Automatic Intervention**: Applies fixes when errors exceed threshold
- **Dynamic Import Correction**: Attempts to fix missing module imports
- **PR Fix Suggestions**: Generates actionable suggestions for manual fixes
- **Real-time Monitoring**: Continuously monitors application health

### Usage

#### Via UI

Navigate to `/dev-tools` and switch to the "Watchdog v2" tab.

#### Programmatic Usage

```typescript
import { startWatchdog, stopWatchdog, getWatchdog } from '@/lib/dev/watchdog';

// Start monitoring with auto-fix enabled
startWatchdog({ autoFix: true });

// Get watchdog statistics
const watchdog = getWatchdog();
const stats = watchdog.getStats();
console.log(stats);

// Get PR suggestions
const suggestions = watchdog.getPRSuggestions();

// Stop monitoring
stopWatchdog();
```

### Error Types Detected

1. **Missing Import**: Module or file not found errors
2. **Undefined Reference**: Variables or objects accessed before definition
3. **Blank Screen**: White screen of death (WSOD)
4. **Logic Failure**: Business logic errors and assertions
5. **Repeated Error**: Any error occurring multiple times

### Configuration

```typescript
import { startWatchdog } from '@/lib/dev/watchdog';

startWatchdog({
  enabled: true,              // Enable/disable watchdog
  maxErrorRepeats: 3,         // Trigger intervention after N repeats
  checkInterval: 5000,        // Check every N milliseconds
  autoFix: true,              // Automatically apply fixes
  logToConsole: true,         // Log to console
  logToLocalStorage: true,    // Store logs in localStorage
});
```

### Automatic Interventions

When an error pattern reaches the threshold, the watchdog will:

1. **Missing Import**: Attempt dynamic import fallback
2. **Undefined Reference**: Add runtime null checks (conceptual)
3. **Blank Screen**: Reload application after storing error context
4. **Logic Failure**: Generate PR fix suggestion
5. **Repeated Error**: Generate PR fix suggestion

### PR Fix Suggestions

The watchdog generates detailed fix suggestions including:
- Error type and message
- Number of occurrences
- Stack trace
- Actionable fix recommendation
- Timestamp

Access suggestions via:
```typescript
const watchdog = getWatchdog();
const suggestions = watchdog.getPRSuggestions();
```

## Directory Structure

```
src/lib/dev/
├── module-tester.ts      # Module testing logic
├── watchdog.ts           # Error monitoring system
├── index.ts              # Exports
├── README.md             # Forecast mock API docs
└── DEV_TOOLS.md          # This file

src/components/dev/
├── ModuleTesterUI.tsx    # UI for module testing
├── WatchdogUI.tsx        # UI for watchdog monitoring
└── index.ts              # Exports

src/pages/
└── DevTools.tsx          # Combined dev tools page

dev/checklists/
└── modules_status_table.md  # Generated test reports

scripts/
└── test-modules.cjs      # CLI script for module testing
```

## Best Practices

1. **Regular Testing**: Run module tests after major changes
2. **Monitor Watchdog**: Keep watchdog active during development
3. **Review PR Suggestions**: Act on fix suggestions promptly
4. **Update Registry**: Keep module registry in sync with actual modules
5. **Document Fixes**: Document interventions and manual fixes

## API Reference

### Module Tester

```typescript
// Test all modules
testAllModules(progressCallback?: (progress, total, current) => void): Promise<ModuleTestResult[]>

// Generate markdown report
generateMarkdownReport(results: ModuleTestResult[]): string

// Get test logs
getModuleTestLogs(moduleId?: string): any[]

// Clear test logs
clearModuleTestLogs(): void

// Get test statistics
getModuleTestStats(): { totalTests, modulesCovered, avgAIConfidence, lastTestTime }
```

### Watchdog

```typescript
// Start watchdog
startWatchdog(config?: Partial<WatchdogConfig>): void

// Stop watchdog
stopWatchdog(): void

// Get watchdog instance
getWatchdog(config?: Partial<WatchdogConfig>): SystemWatchdog

// Watchdog instance methods
watchdog.start(): void
watchdog.stop(): void
watchdog.getErrorPatterns(): ErrorPattern[]
watchdog.getPRSuggestions(): any[]
watchdog.clearPRSuggestions(): void
watchdog.getLogs(): any[]
watchdog.clearLogs(): void
watchdog.getStats(): { totalErrors, errorsByType, activePatterns, interventionCount }
```
