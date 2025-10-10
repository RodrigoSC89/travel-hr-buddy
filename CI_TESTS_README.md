# CI Tests Workflow

This repository includes an automated CI workflow for running tests with coverage reporting.

## Workflow Overview

The `ci-tests.yml` workflow runs automatically on:
- Push to `main` or `dev` branches
- Pull requests targeting `main` or `dev` branches

## Features

### 🧪 Automated Testing
- Runs all tests using Vitest
- Generates coverage reports with v8 provider
- Fails the build if tests fail

### 📊 Coverage Reports
- HTML coverage reports are generated in the `coverage/` directory
- Coverage artifacts are uploaded and available for download from the Actions tab
- Coverage includes text, JSON, and HTML formats

### 🚨 Slack Notifications
Optional Slack integration notifies your team when tests fail.

## Setting Up Slack Notifications

To enable Slack notifications on test failures:

1. Create a Slack webhook URL for your channel:
   - Go to https://api.slack.com/apps
   - Create a new app or select an existing one
   - Enable "Incoming Webhooks"
   - Create a new webhook URL for your desired channel

2. Add the webhook URL as a GitHub repository secret:
   - Go to your repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `SLACK_WEBHOOK_URL`
   - Value: Your Slack webhook URL (e.g., `https://hooks.slack.com/services/...`)

3. Once configured, you'll receive notifications in Slack whenever tests fail, including:
   - Repository name
   - Commit message
   - Commit author
   - Workflow information
   - Time taken

## Running Tests Locally

### Run all tests
```bash
npm test
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run tests in watch mode
```bash
npm run test:watch
```

## Coverage Reports

After running tests with coverage, you can view the HTML report by opening:
```
coverage/index.html
```

The coverage report shows:
- Statement coverage
- Branch coverage
- Function coverage
- Line coverage
- Uncovered lines for each file

## Writing Tests

Tests should be placed in files with `.test.ts` or `.spec.ts` extensions.

Example test:
```typescript
import { describe, it, expect } from 'vitest';

describe('My Feature', () => {
  it('should work correctly', () => {
    expect(true).toBe(true);
  });
});
```

For React component tests:
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Configuration

### Vitest Configuration
Test configuration is in `vite.config.ts`:
- Test environment: jsdom (for React component testing)
- Setup file: `src/test/setup.ts`
- Coverage provider: v8
- Coverage reporters: text, json, html

### Test Setup
The `src/test/setup.ts` file includes global test setup:
- Imports `@testing-library/jest-dom` for additional matchers

### Coverage Exclusions
The following are excluded from coverage reports:
- `node_modules/`
- `dist/`
- Configuration files (`**/*.config.*`)
- Type definition files (`**/*.d.ts`)
- Mock data (`**/mockData/**`)
- Test files themselves (`**/*.test.*`, `**/*.spec.*`)

## Troubleshooting

### Tests fail locally but pass in CI (or vice versa)
- Ensure you're using the same Node.js version (18.x) as the CI workflow
- Run `npm ci` instead of `npm install` to ensure exact dependency versions

### Coverage reports not generated
- Ensure `@vitest/coverage-v8` is installed: `npm install --save-dev @vitest/coverage-v8`
- Check that the `coverage` directory is not gitignored (it should be)

### Slack notifications not working
- Verify the `SLACK_WEBHOOK_URL` secret is set correctly in GitHub repository settings
- Test the webhook URL manually with a curl command
- Check the Actions logs for any error messages related to Slack notifications
