# Codecov Configuration for Nautilus One

## Overview

This project uses Codecov to track and enforce code coverage metrics. The configuration ensures high-quality code by requiring minimum coverage thresholds and preventing merges that decrease coverage.

## Configuration Summary

### Coverage Targets

- **Global Coverage Target**: 85% (minimum for the entire project)
- **Patch Coverage Target**: 80% (minimum for new code in PRs)
- **Threshold**: 1% (allowed variance before failing)

### Key Features

✅ **Merge Protection**: PRs that drop coverage below targets will be blocked  
✅ **Automated Comments**: PRs receive automatic coverage reports with diffs  
✅ **Ignore Test Files**: Test files, mocks, and assets are excluded from coverage  
✅ **Multi-Flag Support**: Separate tracking for UI, backend, and CI components  

## Coverage Flags

The configuration defines three coverage flags to track different parts of the codebase:

### 1. UI Flag
Tracks coverage for frontend components and modules:
- `src/components/`
- `src/modules/`

### 2. Backend Flag
Tracks coverage for backend services and utilities:
- `src/services/`
- `src/integrations/`
- `src/lib/`
- `src/hooks/`

### 3. CI Flag
Tracks coverage for GitHub Actions and CI/CD:
- `.github/`

## Ignored Paths

The following paths are excluded from coverage calculations:

- `tests/` - Test files directory
- `src/tests/` - Source test files
- `src/lib/dev/mocks/` - Mock data for development
- `src/assets/` - Static assets (images, fonts, etc.)
- `**/*.spec.ts` - Spec test files
- `**/*.test.ts` - TypeScript test files
- `**/*.test.tsx` - React TypeScript test files

## How It Works

1. When tests run in CI, coverage data is generated
2. Coverage data is uploaded to Codecov
3. Codecov analyzes the coverage against the configuration
4. A status check is posted to the PR:
   - ✅ Green if coverage meets targets
   - ❌ Red if coverage drops below targets
5. Automated comments show detailed coverage changes

## Benefits

| Feature | Description |
|---------|-------------|
| 🧮 Minimum Global Coverage (85%) | Ensures the entire project maintains high test coverage |
| 📦 Patch Control (80%) | No PR can lower the overall coverage index |
| ⚙️ GitHub Integration | Compatible with existing CI/CD workflows |
| 💬 Automatic Comments | PRs receive feedback with coverage diffs |
| 🧩 Smart Ignoring | Measures only production code, not tests or mocks |

## Integration with CI/CD

This configuration works seamlessly with the existing GitHub Actions workflows:

- **run-tests.yml**: Generates and uploads coverage reports
- **code-quality-check.yml**: Runs tests and tracks coverage metrics

## Local Testing

To generate coverage reports locally:

```bash
npm run test:coverage
```

This will create a coverage report in the `coverage/` directory that you can view in your browser.

## Additional Resources

- [Codecov Documentation](https://docs.codecov.com/)
- [Codecov YAML Reference](https://docs.codecov.com/docs/codecov-yaml)
- [GitHub Actions Integration](https://docs.codecov.com/docs/github-actions-integration)

## Maintenance

The `codecov.yml` file should be reviewed and updated when:

- Project structure changes significantly
- New directories need to be tracked or ignored
- Coverage targets need adjustment
- New flags are needed for different components

---

**Note**: This configuration is part of the Nautilus One quality standards and helps maintain consistent code quality across all modules (DP, FMEA, Control Hub, BridgeLink, Forecast).
