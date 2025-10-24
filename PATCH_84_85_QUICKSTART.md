# PATCH 84.0 & 85.0 - Quick Start Guide

## 🚀 Quick Access

**URL:** [http://localhost:5173/dev-tools](http://localhost:5173/dev-tools)

## ✅ PATCH 84.0 - Module Tester

### One-Click Testing

1. Navigate to `/dev-tools`
2. Click **"Run Tests"**
3. Wait for completion (~10 seconds)
4. Review results and download report

### Command Line

```bash
npm run test:modules
```

Report saved to: `dev/checklists/modules_status_table.md`

### Quick API Usage

```typescript
import { testAllModules, generateMarkdownReport } from '@/lib/dev/module-tester';

// Test all modules
const results = await testAllModules();

// Generate report
const report = generateMarkdownReport(results);
console.log(report);
```

## 🛡️ PATCH 85.0 - Watchdog v2

### Start Monitoring

1. Navigate to `/dev-tools`
2. Switch to **"Watchdog v2"** tab
3. Toggle **"Auto-fix"** (recommended)
4. Click **"Start Watchdog"**

### Quick API Usage

```typescript
import { startWatchdog } from '@/lib/dev/watchdog';

// Start with auto-fix enabled
startWatchdog({ autoFix: true });
```

### Test Error Detection

```typescript
// Trigger repeated error (for testing)
console.error('Test error');
console.error('Test error');
console.error('Test error'); // Watchdog intervenes
```

## 📊 Understanding Results

### Module Status Icons

- ✅ **Ready** - Fully functional
- 🟡 **Partial** - Working with warnings
- 🔴 **Failed** - Critical issues

### Error Types

- 📦 **Missing Import** - Module not found
- ❓ **Undefined Reference** - Variable not defined
- ⬜ **Blank Screen** - WSOD detected
- 🔧 **Logic Failure** - Business logic error
- 🔁 **Repeated Error** - Multiple occurrences

## 🔧 Configuration

### Module Tester (No config needed)

Just run tests and review results!

### Watchdog Settings

```typescript
startWatchdog({
  maxErrorRepeats: 3,    // Trigger after 3 errors
  autoFix: true,         // Auto-intervene
  checkInterval: 5000,   // Check every 5 seconds
});
```

## 📈 Monitoring Tips

1. **Run module tests** after major changes
2. **Keep watchdog active** during development
3. **Review PR suggestions** weekly
4. **Download reports** for documentation

## 🆘 Common Issues

### Tests Don't Run
- Check browser console for errors
- Verify localStorage is enabled
- Try refreshing the page

### Watchdog Doesn't Start
- Check if already running (stop first)
- Verify console permissions
- Clear localStorage if needed

## 📚 Full Documentation

- Implementation Guide: `PATCH_84_85_IMPLEMENTATION_GUIDE.md`
- Dev Tools Docs: `src/lib/dev/DEV_TOOLS.md`
- Module Registry: `src/modules/registry.ts`

## 🎯 Best Practices

1. ✅ Run tests before committing code
2. ✅ Monitor watchdog during development
3. ✅ Review and act on PR suggestions
4. ✅ Keep module registry updated
5. ✅ Archive old reports periodically

## 🚢 Ready to Deploy!

Both patches are production-ready and can be used immediately. Start testing and monitoring your Nautilus One modules now!
