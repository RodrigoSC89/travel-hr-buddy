# 🌊 Nautilus Intelligence Core

## Overview

The Nautilus Intelligence Core is an AI-powered automated CI/CD monitoring and self-healing system for the Travel HR Buddy project. It analyzes workflow failures, generates intelligent fix suggestions, and can automatically create Pull Requests to resolve issues.

## Features

### 🧠 Intelligent Analysis
- **Automated Log Analysis**: Scans CI/CD logs for known failure patterns
- **8 Detection Patterns**: Identifies missing files, reference errors, contrast issues, coverage problems, build failures, test failures, suspended buttons, and Vercel deployment issues
- **Context Extraction**: Captures relevant context around detected issues for better debugging
- **Severity Classification**: Categorizes issues as critical, high, medium, or low priority

### 🔧 AI-Powered Fix Suggestions
- **OpenAI Integration**: Uses GPT-4o to generate intelligent fix suggestions
- **Fallback Mode**: Provides rule-based suggestions when AI is unavailable
- **Structured Recommendations**: Generates actionable PR titles, descriptions, and suggested changes
- **Priority-Based**: Determines fix priority based on issue severity

### 🚀 Automated PR Creation
- **GitHub API Integration**: Creates Pull Requests automatically via Octokit
- **Detailed PR Body**: Includes analysis results, detected issues, suggested changes, and expected impact
- **Smart Commenting**: Posts analysis results as comments on existing PRs
- **Configurable**: Can be enabled/disabled via environment variables

### 📊 Comprehensive Reporting
- **JSON Analysis Output**: Generates structured analysis.json for programmatic access
- **Markdown Summaries**: Creates human-readable reports
- **GitHub Actions Integration**: Uploads artifacts and generates step summaries
- **Artifact Retention**: Stores analysis and logs for 30 days

## Architecture

```
.github/workflows/
  └── ai-autofix.yml          # GitHub Actions workflow

src/ai/nautilus-core/
  ├── index.ts                # Main orchestrator
  ├── analyzer.ts             # Log analysis and pattern detection
  ├── suggestFix.ts           # AI-powered fix suggestion generation
  └── createPR.ts             # Automated PR creation and commenting
```

## Workflow Trigger

The Nautilus Intelligence Core runs automatically when these workflows complete with a **failure** status:
- Build Nautilus One
- Test Coverage & Summary
- Validate Buttons and Accessibility

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | No* | - | OpenAI API key for GPT-4o access |
| `GITHUB_TOKEN` | Yes | Auto-provided | GitHub Actions token for API access |
| `GITHUB_WORKFLOW` | Auto | - | Name of the failed workflow |
| `GITHUB_RUN_ID` | Auto | - | Run ID of the failed workflow |
| `LOG_SOURCES` | No | See below | Comma-separated list of log file paths |
| `CREATE_PR` | No | `true` | Whether to create automated PRs |
| `ANALYSIS_OUTPUT` | No | `analysis.json` | Path for analysis output |

*Required for AI-powered suggestions; fallback mode available without it

**Default Log Sources** (when `LOG_SOURCES` not set):
- `ci-build.log`
- `test-output.log`
- `workflow.log`

### GitHub Secrets

Add these secrets to your repository settings:

1. **`OPENAI_API_KEY`** (Optional but recommended)
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Navigate to: Repository → Settings → Secrets and variables → Actions → New repository secret

## Usage

### Automatic Mode (GitHub Actions)

The Nautilus Intelligence Core runs automatically when triggered. No manual intervention required!

1. A workflow fails (e.g., Build, Test, or Accessibility check)
2. Nautilus Intelligence Core workflow is triggered
3. Logs are downloaded and analyzed
4. If issues are detected:
   - Analysis artifact is uploaded
   - PR comment is posted (if the failure is on a PR)
   - Summary is generated in workflow output
5. If `CREATE_PR=true` and OpenAI is configured:
   - AI generates fix suggestions
   - Automated PR is created with recommended fixes

### Manual Testing (Demo Mode)

Test the analyzer locally without CI/CD:

```bash
# Install dependencies
npm ci

# Run in demo mode
npx tsx src/ai/nautilus-core/index.ts --demo

# Run with custom log file
LOG_SOURCES="path/to/your.log" \
CREATE_PR="false" \
ANALYSIS_OUTPUT="my-analysis.json" \
npx tsx src/ai/nautilus-core/index.ts
```

## Detection Patterns

### 1. Missing Files (Critical)
**Pattern**: `ENOENT`, `Cannot find module`
**Example**: Module import path doesn't exist
**Suggested Fix**: Verify file paths and imports

### 2. Reference Errors (Critical)
**Pattern**: `ReferenceError`, `is not defined`
**Example**: Variable or function not imported
**Suggested Fix**: Add missing imports or declarations

### 3. Build Failures (Critical)
**Pattern**: `Build failed`, `error TS`, `ERROR`
**Example**: TypeScript compilation errors
**Suggested Fix**: Fix type errors and ensure dependencies are installed

### 4. Test Failures (High)
**Pattern**: `FAIL`, `test failed`, `✕`
**Example**: Unit or integration test failures
**Suggested Fix**: Review and fix failing tests

### 5. Low Coverage (High)
**Pattern**: `coverage <`, coverage below threshold
**Example**: Test coverage below 85%
**Suggested Fix**: Add unit tests to improve coverage

### 6. Low Contrast (Medium)
**Pattern**: `contrast ratio below`
**Example**: Color contrast doesn't meet WCAG standards
**Suggested Fix**: Update colors to meet accessibility requirements

### 7. Suspended Buttons (Medium)
**Pattern**: `suspended button`, `disabled button`
**Example**: Accessibility violations with disabled buttons
**Suggested Fix**: Review button states and accessibility

### 8. Vercel Deployment Failures (High)
**Pattern**: `Vercel` + `failed`/`error`
**Example**: Deployment to Vercel fails
**Suggested Fix**: Check build configuration and environment variables

## Output Format

### Analysis JSON Structure

```json
{
  "timestamp": "2025-10-20T22:35:17.531Z",
  "workflowName": "Build Nautilus One",
  "workflowRun": 12345,
  "findings": [
    {
      "type": "build_failure",
      "severity": "critical",
      "message": "❌ Build failure detected",
      "pattern": "Build failed / TypeScript error",
      "context": "error TS2304: Cannot find name 'InvalidVariable'..."
    }
  ],
  "hasIssues": true
}
```

### Severity Levels

- 🔴 **Critical**: Build failures, missing files, reference errors
- 🟠 **High**: Test failures, low coverage, Vercel deployment issues
- 🟡 **Medium**: Contrast issues, suspended buttons
- 🟢 **Low**: Other minor issues

## GitHub Actions Artifacts

After each run, the following artifacts are uploaded:

- **`nautilus-analysis`** (30 days retention)
  - `analysis.json` - Structured analysis results
  - `workflow.log` - Combined workflow logs

Access artifacts from: Actions → Workflow run → Artifacts section

## Automated PR Format

When an automated PR is created, it includes:

- **Title**: AI-generated concise title (max 60 chars)
- **Labels**: None (can be added manually or via automation)
- **Body Sections**:
  - 🤖 Header with metadata (workflow, run ID, timestamp, priority)
  - 📋 Problem analysis and explanation
  - 🔍 List of detected issues with severity and context
  - 🔧 Suggested changes and fixes
  - 📊 Expected impact and benefits
  - ⚠️ Important notes for reviewers
  - 📚 Links to relevant documentation

## Troubleshooting

### No Analysis Generated

**Possible Causes**:
- Workflow didn't fail (only runs on failures)
- No log files found
- Logs don't contain recognized patterns

**Solution**: Check workflow logs and ensure triggers are correct

### AI Suggestions Not Generated

**Possible Causes**:
- `OPENAI_API_KEY` not set
- OpenAI API rate limit or error
- `CREATE_PR` set to `false`

**Solution**: Check secrets configuration and OpenAI API status. Fallback suggestions should still be generated.

### PR Creation Failed

**Possible Causes**:
- `GITHUB_TOKEN` lacks permissions
- Branch already exists
- Network issues

**Solution**: Verify permissions in workflow file and check GitHub Actions logs

## Development

### Running Tests

```bash
# Run in demo mode to test analyzer
npx tsx src/ai/nautilus-core/index.ts --demo

# Test with custom log
echo "Build failed with error TS2304" > test.log
LOG_SOURCES="test.log" CREATE_PR="false" npx tsx src/ai/nautilus-core/index.ts
```

### Adding New Detection Patterns

Edit `src/ai/nautilus-core/analyzer.ts`:

```typescript
// Add pattern detection in analyzeLogs()
if (logs.includes('your-pattern')) {
  findings.push({
    type: 'your_issue_type',
    severity: 'critical', // or 'high', 'medium', 'low'
    message: '❌ Your issue description',
    pattern: 'your-pattern',
    context: extractContext(logs, ['your-pattern'])
  });
}
```

### Modifying AI Prompts

Edit `src/ai/nautilus-core/suggestFix.ts` in the `buildPrompt()` function.

## Best Practices

1. **Review Automated PRs**: Always review AI-generated suggestions before merging
2. **Run Tests**: Ensure automated fixes don't introduce new issues
3. **Monitor OpenAI Usage**: Track API usage to manage costs
4. **Keep Patterns Updated**: Add new detection patterns as issues arise
5. **Use Demo Mode**: Test changes locally before deploying

## Comparison with Original PR #1226

The current implementation significantly enhances the original proposal:

| Feature | Original | Current |
|---------|----------|---------|
| Language | JavaScript | TypeScript with full type safety |
| Log Collection | Static file paths | Dynamic GitHub API + fallback |
| Issue Detection | 5 patterns | 8 patterns with context extraction |
| AI Model | GPT-5 (non-existent) | GPT-4o (actual model) |
| Error Handling | Basic | Comprehensive with fallbacks |
| PR Features | Creation only | Creation + commenting |
| Testing | None | Demo mode included |
| Artifacts | analysis.json only | analysis.json + workflow.log |

## Contributing

To improve Nautilus Intelligence Core:

1. Add new detection patterns in `analyzer.ts`
2. Enhance AI prompts in `suggestFix.ts`
3. Improve PR formatting in `createPR.ts`
4. Add tests and documentation
5. Submit a PR with your changes

## License

This module is part of the Travel HR Buddy project and follows the same license.

## Support

For issues or questions:
1. Check workflow logs in GitHub Actions
2. Review analysis artifacts
3. Open an issue on GitHub
4. Contact the development team

---

**Powered by Nautilus Intelligence Core 🌊**

*Self-healing CI/CD for the modern development workflow*
