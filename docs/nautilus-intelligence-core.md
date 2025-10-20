# Nautilus Intelligence Core 🌊

## Overview

The **Nautilus Intelligence Core** is an AI-powered CI/CD monitoring and auto-fix system that automatically detects failures in GitHub Actions workflows and generates intelligent fix suggestions.

## Features

✨ **Automated Failure Detection**
- Monitors GitHub Actions workflows for failures
- Analyzes logs to identify common patterns:
  - Missing files or import paths (ENOENT)
  - Low contrast accessibility issues
  - Reference errors (undefined variables/imports)
  - Test coverage below threshold (< 85%)
  - Build failures
  - Suspended buttons reappearing
  - Vercel deployment failures

🤖 **AI-Powered Fix Suggestions**
- Uses OpenAI GPT-4o to generate intelligent fix recommendations
- Provides specific, actionable guidance
- Estimates impact and priority of fixes
- Falls back to rule-based suggestions when AI is unavailable

🚀 **Automated PR Creation** (Optional)
- Creates pull requests with detailed analysis
- Includes context from failed workflows
- Suggests specific code changes
- Links to relevant documentation

## Architecture

```
src/ai/nautilus-core/
├── analyzer.ts       # Log analysis and anomaly detection
├── suggestFix.ts     # LLM-based fix suggestions
├── createPR.ts       # Automated PR creation via GitHub API
└── index.ts          # Main orchestrator
```

## Configuration

### Environment Variables

The following environment variables are required or optional:

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `OPENAI_API_KEY` | Optional | OpenAI API key for GPT-4o | Falls back to rule-based suggestions |
| `GITHUB_TOKEN` | Required* | GitHub token for API access | Provided by Actions |
| `GITHUB_WORKFLOW` | Auto | Name of the workflow | Provided by Actions |
| `GITHUB_RUN_ID` | Auto | Workflow run ID | Provided by Actions |
| `LOG_SOURCES` | Optional | Comma-separated log file paths | `workflow.log` |
| `CREATE_PR` | Optional | Enable/disable PR creation | `false` |
| `ANALYSIS_OUTPUT` | Optional | Path for analysis JSON output | `analysis.json` |

*Required only for PR creation

### GitHub Secrets

Add these secrets to your repository:

1. **`OPENAI_API_KEY`** (Optional but recommended)
   - Get your API key from https://platform.openai.com/api-keys
   - Navigate to: Repository Settings → Secrets and variables → Actions → New repository secret
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key

2. **`GITHUB_TOKEN`**
   - Automatically provided by GitHub Actions
   - No manual setup required

## Usage

### Automatic Workflow Monitoring

The system automatically monitors these workflows when they fail:
- Build Nautilus One
- Test Coverage & Summary
- Validate Buttons and Accessibility

When a failure is detected:
1. Logs are downloaded and analyzed
2. Issues are identified and categorized
3. Analysis results are saved as artifacts
4. If configured, a PR with fix suggestions is created

### Manual Execution

You can also run the analyzer manually:

```bash
# Install dependencies
npm ci

# Run in demo mode (uses sample logs)
npx tsx src/ai/nautilus-core/index.ts --demo

# Run with specific log files
export LOG_SOURCES="build.log,test.log"
export GITHUB_WORKFLOW="Manual Run"
export GITHUB_RUN_ID="12345"
npx tsx src/ai/nautilus-core/index.ts
```

### Testing Locally

```bash
# Create a test log file
cat > test-error.log << 'EOF'
Build failed with errors:
error TS2304: Cannot find name 'invalidVariable'.
Coverage: 78% (below 85% threshold)
EOF

# Run analyzer
export LOG_SOURCES="test-error.log"
npx tsx src/ai/nautilus-core/index.ts
```

## Detection Patterns

### 1. Missing Files (CRITICAL)
**Pattern:** `ENOENT`, `Cannot find module`
```
ERROR: Cannot find module '@/components/InvalidComponent'
```

### 2. Reference Errors (CRITICAL)
**Pattern:** `ReferenceError`, `is not defined`
```
ReferenceError: someVariable is not defined
```

### 3. Build Failures (CRITICAL)
**Pattern:** `Build failed`, `error TS`
```
error TS2304: Cannot find name 'Component'.
Build failed with 1 error.
```

### 4. Low Coverage (HIGH)
**Pattern:** `coverage <`, `below threshold`
```
Coverage: 78% (threshold: 85%)
```

### 5. Low Contrast (MEDIUM)
**Pattern:** `contrast ratio below`
```
WCAG Violation: contrast ratio below 4.5:1
```

### 6. Test Failures (HIGH)
**Pattern:** `FAIL`, `test failed`, `✕`
```
FAIL src/tests/component.test.ts
  ✕ should render correctly
```

### 7. Vercel Deployment (HIGH)
**Pattern:** `Vercel` + `failed`/`error`
```
Vercel deployment failed: Build exceeded time limit
```

### 8. Suspended Buttons (MEDIUM)
**Pattern:** `suspended button`, `disabled button`
```
⚠️ WCAG: suspended button detected in DOM
```

## Output

### Analysis JSON
```json
{
  "timestamp": "2025-10-20T21:49:04.287Z",
  "workflowName": "Build Nautilus One",
  "workflowRun": 12345,
  "findings": [
    {
      "type": "reference_error",
      "severity": "critical",
      "message": "❌ Undefined variable or import detected",
      "pattern": "ReferenceError / is not defined",
      "context": "error TS2304: Cannot find name 'Component'..."
    }
  ],
  "hasIssues": true
}
```

### Fix Suggestion
```json
{
  "title": "Fix undefined references in build",
  "description": "Build failed due to missing import for Component...",
  "suggestedChanges": "1. Add import statement...",
  "priority": "critical",
  "estimatedImpact": "Resolves build failure, enables deployment"
}
```

## Workflow Integration

The system is triggered automatically via `.github/workflows/ai-autofix.yml`:

```yaml
on:
  workflow_run:
    workflows: ["Build Nautilus One", "Test Coverage & Summary", ...]
    types:
      - completed
```

## Troubleshooting

### No logs available
- The workflow may not have generated log files
- Check that log download permissions are correct
- Verify `GITHUB_TOKEN` has appropriate permissions

### AI suggestions not generated
- Verify `OPENAI_API_KEY` is set correctly
- Check API quota and rate limits
- System will fall back to rule-based suggestions

### PR creation failed
- Ensure `GITHUB_TOKEN` has write permissions
- Check that branch names don't conflict
- Verify repository settings allow PR creation

## Permissions

The workflow requires these permissions:
```yaml
permissions:
  contents: write        # To create branches
  pull-requests: write   # To create PRs
  issues: write          # To comment on PRs
```

## Cost Considerations

- **OpenAI API**: ~$0.01-0.03 per analysis (using GPT-4o)
- **GitHub Actions**: Included in standard minutes
- **Storage**: Artifacts stored for 30 days

## Future Enhancements

- [ ] Support for more failure patterns
- [ ] Automatic code fixes (not just suggestions)
- [ ] Integration with Sentry for runtime errors
- [ ] Learning from past fixes to improve accuracy
- [ ] Support for multiple AI models
- [ ] Slack/Discord notifications
- [ ] Custom pattern configuration

## Contributing

To add new detection patterns:

1. Edit `src/ai/nautilus-core/analyzer.ts`
2. Add pattern matching logic
3. Define severity and message
4. Add corresponding fix suggestion in `suggestFix.ts`

## License

Part of the Nautilus One / Travel HR Buddy project.

---

*Powered by Nautilus Intelligence Core 🌊*
