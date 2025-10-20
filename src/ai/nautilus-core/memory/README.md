# Nautilus Memory Engine

## Overview

The **Nautilus Memory Engine** is an intelligent learning module for the Nautilus One Intelligence Core. It enables the system to learn from past behavior by storing historical failure and correction data, detecting recurrent patterns, and providing preventive insights.

## Features

✅ **Persistent History** - Records logs, failures, and applied solutions  
✅ **Self-Learning** - Recognizes error patterns and acts preventively  
✅ **Intelligent Reports** - Shows recurrence of technical failures (>2 occurrences)  
✅ **Native Integration** - No external dependencies, only Node.js built-in modules  
✅ **Compliance** - Maintains correction history for PEO-DP / NORMAM-101 audits

## Architecture

```
src/ai/nautilus-core/memory/
├── memoryEngine.ts   # Memory engine implementation
└── memoryDB.json     # Database (auto-generated, gitignored)
```

## Usage

### Basic Usage

```typescript
import { MemoryEngine } from './memory/memoryEngine';

const memory = new MemoryEngine();

// Store failures and corrections
memory.store(
  ['❌ Build failed in CI/CD', '⚠️ TypeScript error'],
  'fix: correct TypeScript types'
);

// Detect recurrent patterns
const patterns = memory.getRecurrentPatterns();
// Returns: [{ pattern: "buildfailedincicd", occurrences: 3 }]

// Query complete history
const history = memory.getHistory();
```

### API Reference

#### `store(findings: string[], fixSummary: string): void`

Stores a new record of failure and correction.

**Parameters:**
- `findings` - Array of detected issues/findings
- `fixSummary` - Summary of the fix applied

**Example:**
```typescript
memory.store(
  ['Build error: Missing dependency', 'Test timeout'],
  'fix: add missing dependencies and increase timeout'
);
```

#### `getRecurrentPatterns(): RecurrentPattern[]`

Analyzes and returns recurrent failure patterns that occurred more than 2 times.

**Returns:**
```typescript
interface RecurrentPattern {
  pattern: string;      // Normalized pattern key
  occurrences: number;  // Number of times the pattern appeared
}
```

**Example:**
```typescript
const patterns = memory.getRecurrentPatterns();
patterns.forEach(p => {
  console.log(`Pattern: ${p.pattern}, Occurrences: ${p.occurrences}`);
});
```

#### `getHistory(): MemoryEntry[]`

Returns the complete history, sorted by most recent first.

**Returns:**
```typescript
interface MemoryEntry {
  id: number;
  timestamp: string;
  findings: string[];
  fixSummary: string;
}
```

#### `getEntryCount(): number`

Gets the total number of entries in memory.

#### `clear(): void`

Clears all memory. Use with caution!

## Integration with Nautilus Intelligence Core

The Memory Engine is automatically integrated into the main Nautilus Intelligence Core workflow:

1. When issues are detected, the system generates fix suggestions
2. If a PR is created successfully, the findings and fix are stored in memory
3. The system checks for recurrent patterns and displays them
4. Over time, the system learns which types of failures are most common

Example output:
```
🧠 Storing learning in Memory Engine...
📊 Recurrent patterns detected:
   🔁 buildfailedincicd → 3 occurrences
   🔁 typescripterror → 5 occurrences
```

## Data Storage

The memory database (`memoryDB.json`) is:
- Automatically created on first use
- Excluded from version control (via `.gitignore`)
- Stored in `src/ai/nautilus-core/memory/memoryDB.json`
- Human-readable JSON format for transparency

## Security & Compliance

- ✅ Sensitive data is **not** stored
- ✅ Audit trail maintained for NORMAM-101 and PEO-DP compliance
- ✅ Transparent and traceable logs
- ✅ No external dependencies or network calls

## Pattern Detection

The Memory Engine normalizes patterns by:
1. Removing all non-alphanumeric characters
2. Converting to lowercase
3. Counting occurrences across all stored entries

This allows it to detect patterns like:
- "Build failed in CI/CD" → `buildfailedincicd`
- "TypeScript error in component" → `typescripterrorincomponent`

Patterns with more than 2 occurrences are flagged as recurrent.

## Benefits

### 📘 Historical Knowledge
The system accumulates knowledge about:
- Types of failures most common in your codebase
- Solutions that were successfully applied
- Temporal patterns of problems
- Correlations between different types of errors

### 🔁 Continuous Improvement
With each CI/CD execution, the system:
- Learns from new failures
- Refines pattern detection
- Builds predictive capabilities
- Enables proactive issue prevention

### 📊 Actionable Insights
Teams can:
- Identify recurring technical debt
- Prioritize refactoring efforts
- Understand failure trends
- Make data-driven decisions

## Example Scenario

```typescript
// Day 1: First build failure
memory.store(['Build failed: Module not found'], 'fix: add missing import');

// Day 3: Similar issue
memory.store(['Build failed: Module not found'], 'fix: correct import path');

// Day 7: Another occurrence
memory.store(['Build failed: Module not found'], 'fix: update tsconfig paths');

// Day 10: Pattern detected!
const patterns = memory.getRecurrentPatterns();
// Returns: [{ pattern: "buildfailedmodulenotfound", occurrences: 3 }]

// Team realizes: We need to improve our module resolution configuration
```

## Roadmap

Future enhancements planned:
- [ ] Time-based pattern analysis
- [ ] Correlation detection between different failure types
- [ ] Automatic suggestion prioritization based on history
- [ ] Export capabilities for external analysis
- [ ] Machine learning integration for predictive insights

## License

Part of the Travel HR Buddy system.
