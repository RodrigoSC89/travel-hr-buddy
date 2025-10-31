# PATCH-540 Validation Script

## Overview
This validation script performs comprehensive checks on the codebase to ensure code quality, performance, and best practices are maintained.

## Features

### 1. Memory Usage Monitoring 💾
- Monitors memory usage of the Vite development server
- Shows real-time process information (PID, memory, CPU)
- Helps identify memory leaks during development

### 2. SPA Navigation Validation 🚦
- Checks for improper use of `<a href>` tags in React components
- Validates that navigation uses React Router's `<Link>` component
- Identifies external links (which are OK to use `<a>`)
- Ensures proper SPA behavior without page reloads

### 3. Nested .map() Detection 🧬
- Detects excessive use of `.map()` in files
- Identifies files with 3 or more `.map()` calls
- Helps identify potential performance issues
- Suggests refactoring opportunities

### 4. Code Quality Checks 🔍
- Detects `console.log` statements (should be removed in production)
- Identifies TODO and FIXME comments
- Helps maintain clean, production-ready code

### 5. Lighthouse Performance Testing ⚡
- Runs Lighthouse performance audits (if available)
- Measures page load performance
- Generates performance scores
- Provides actionable recommendations

### 6. Build Verification 🏗️
- Checks if build is successful
- Reports build size
- Optionally runs a fresh build with `--build` flag

## Usage

### Basic Usage
```bash
npm run validate:patch-540
```

or directly:
```bash
./scripts/validate-patch-540.sh
```

### With Full Build
```bash
./scripts/validate-patch-540.sh --build
```

### With Dev Server Running
For best results, run the dev server in one terminal:
```bash
npm run dev
```

Then run the validation in another terminal:
```bash
npm run validate:patch-540
```

## Requirements

### Required
- Node.js >= 20.0.0
- npm >= 8.0.0
- Project dependencies installed (`npm install`)

### Optional (for full features)
- Lighthouse CLI (install with: `npm install -g lighthouse`)
- jq (for JSON parsing on Lighthouse reports)
- Running dev server (for memory monitoring and Lighthouse tests)

## Installing Optional Dependencies

### Lighthouse
```bash
npm install -g lighthouse
```

### jq (for better Lighthouse report parsing)
```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq
```

## Output

The script provides color-coded output:
- ✅ **Green**: Success / No issues found
- ⚠️ **Yellow**: Warnings / Issues found that need attention
- ❌ **Red**: Errors / Critical issues

## Interpreting Results

### SPA Navigation Validation
- **4 violations found**: Check if these are legitimate external links
- External links (target="_blank") are OK
- Skip-to-main links (#main-content) are OK for accessibility
- Internal navigation should use React Router's `<Link>` component

### Nested .map() Detection
- **480 files with 3+ .map() calls**: Consider refactoring complex data transformations
- Look for opportunities to:
  - Extract to separate functions
  - Use `reduce()` or other array methods
  - Cache computed values

### Code Quality
- **316 console.log found**: Remove before production
- **70 TODOs/FIXMEs**: Track and prioritize these issues

### Performance
- **>= 90%**: Excellent performance ✅
- **>= 50%**: Acceptable performance ⚠️
- **< 50%**: Needs improvement ❌

## Integration with CI/CD

Add to GitHub Actions workflow:
```yaml
- name: Run PATCH-540 Validation
  run: npm run validate:patch-540
```

## Monitoring Guidelines

The script suggests monitoring for 60 minutes as mentioned in the problem statement. To do this:

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. In another terminal, monitor continuously:
   ```bash
   watch -n 300 ./scripts/validate-patch-540.sh
   ```
   (This runs the validation every 5 minutes)

3. For memory-intensive monitoring:
   ```bash
   while true; do
     ./scripts/validate-patch-540.sh
     sleep 600  # Wait 10 minutes
   done
   ```

## Final Commit

After validation is complete and all issues are addressed:
```bash
git add .
git commit -m "PATCH-540-validated"
git push
```

## Troubleshooting

### Script Permission Denied
```bash
chmod +x scripts/validate-patch-540.sh
```

### Dev Server Not Running
The script will still run most checks without the dev server. For full validation:
```bash
npm run dev
# In another terminal:
npm run validate:patch-540
```

### Build Failures
Check the build output:
```bash
npm run build:ci
```

Fix any TypeScript errors or missing dependencies.

### Lighthouse Not Found
Install globally:
```bash
npm install -g lighthouse
```

Or skip Lighthouse checks (script will continue without it).

## Related Scripts

- `npm run build` - Build the project
- `npm run dev` - Start development server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run type-check` - TypeScript type checking

## Version History

- **PATCH-540**: Initial implementation
  - Memory monitoring
  - SPA navigation validation
  - Nested .map() detection
  - Code quality checks
  - Lighthouse integration
  - Build verification

## Support

For issues or questions, please refer to the main project README or create an issue in the repository.
