#!/usr/bin/env node

/**
 * Accessibility Analysis Script
 * Analyzes Pa11y results and generates report
 */

const fs = require('fs');
const path = require('path');

const resultsPath = path.join(__dirname, '../a11y-results.json');

if (!fs.existsSync(resultsPath)) {
  console.error('❌ Accessibility results not found');
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

// Categorize issues
const issuesByType = {
  error: [],
  warning: [],
  notice: []
};

results.forEach(page => {
  page.issues.forEach(issue => {
    issuesByType[issue.type].push({
      page: page.pageUrl,
      code: issue.code,
      message: issue.message,
      selector: issue.selector,
      context: issue.context
    });
  });
});

// Generate HTML report
const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; margin: 2rem; }
    h1 { color: #1a202c; }
    .summary { display: flex; gap: 1rem; margin: 2rem 0; }
    .card { padding: 1rem; border-radius: 8px; flex: 1; }
    .error { background: #fed7d7; border: 2px solid #fc8181; }
    .warning { background: #feebc8; border: 2px solid #f6ad55; }
    .notice { background: #bee3f8; border: 2px solid #63b3ed; }
    .count { font-size: 2rem; font-weight: bold; }
    .issues { margin-top: 2rem; }
    .issue { padding: 1rem; margin: 1rem 0; border-left: 4px solid #cbd5e0; background: #f7fafc; }
    .issue-error { border-left-color: #fc8181; }
    .issue-warning { border-left-color: #f6ad55; }
    .code { font-family: monospace; background: #2d3748; color: #f7fafc; padding: 0.25rem 0.5rem; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>♿ Accessibility Report</h1>
  
  <div class="summary">
    <div class="card error">
      <div class="count">${issuesByType.error.length}</div>
      <div>Critical Errors</div>
    </div>
    <div class="card warning">
      <div class="count">${issuesByType.warning.length}</div>
      <div>Warnings</div>
    </div>
    <div class="card notice">
      <div class="count">${issuesByType.notice.length}</div>
      <div>Notices</div>
    </div>
  </div>
  
  ${Object.entries(issuesByType).map(([type, issues]) => {
    if (issues.length === 0) return '';
    return `
      <div class="issues">
        <h2>${type.charAt(0).toUpperCase() + type.slice(1)}s (${issues.length})</h2>
        ${issues.map(issue => `
          <div class="issue issue-${type}">
            <div><strong>Page:</strong> ${issue.page}</div>
            <div><strong>Code:</strong> <span class="code">${issue.code}</span></div>
            <div><strong>Message:</strong> ${issue.message}</div>
            <div><strong>Selector:</strong> <code>${issue.selector}</code></div>
            ${issue.context ? `<div><strong>Context:</strong> <pre>${issue.context}</pre></div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }).join('')}
</body>
</html>
`;

const reportPath = path.join(__dirname, '../a11y-report.html');
fs.writeFileSync(reportPath, htmlReport);

console.log('\n♿ Accessibility Analysis Complete\n');
console.log(`🔴 Critical Errors: ${issuesByType.error.length}`);
console.log(`🟡 Warnings: ${issuesByType.warning.length}`);
console.log(`🔵 Notices: ${issuesByType.notice.length}`);
console.log(`\n📄 Report generated: ${reportPath}`);

if (issuesByType.error.length > 0) {
  console.log('\n⚠️  Critical accessibility issues found!');
  process.exit(1);
}

process.exit(0);
