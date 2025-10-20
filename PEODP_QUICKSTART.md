# PEO-DP Phase 2 - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Installation

No installation needed! The module is already integrated into the project.

### Basic Usage

```typescript
import { PEOdpCore } from "@/modules/peodp_ai";

// 1. Initialize
const peodp = new PEOdpCore();

// 2. Run a complete demo
peodp.executar_demo();
```

### Real-time Monitoring

```typescript
import { PEOdpCore } from "@/modules/peodp_ai";

const peodp = new PEOdpCore();

// Start monitoring
peodp.iniciar_monitoramento_tempo_real("PSV Atlantic Explorer");

// Execute monitoring cycles (or let it run automatically)
setInterval(() => {
  peodp.executar_ciclo();
}, 3000);

// Stop monitoring
peodp.parar_monitoramento();
```

### Run Manual Audit

```typescript
import { PEOdpCore } from "@/modules/peodp_ai";

const peodp = new PEOdpCore();

// Run audit against NORMAM-101
const result = peodp.iniciar_auditoria("NORMAM-101");

console.log(`Compliance: ${result.compliance_percentage}%`);
console.log(`Status: ${result.status}`);
console.log(`Violations: ${result.non_compliant_rules}`);
```

### React Component Usage

```tsx
import { PeoDpMonitoringDemo } from "@/components/peo-dp/peo-dp-monitoring-demo";

function MyPage() {
  return (
    <div>
      <h1>DP Monitoring Dashboard</h1>
      <PeoDpMonitoringDemo />
    </div>
  );
}
```

### Access Demo Page

Navigate to: `/demo/peodp`

Or import directly:
```tsx
import PeoDpDemo from "@/pages/demo/PeoDpDemo";
```

## 📊 What You Can Do

### 1. Monitor DP Events
- ✅ Track system events in real-time
- ✅ Detect compliance violations automatically
- ✅ View event statistics and trends

### 2. Run Compliance Audits
- ✅ Evaluate against NORMAM-101 (Brazilian standards)
- ✅ Evaluate against IMCA M117 (International guidelines)
- ✅ Get detailed violation reports

### 3. Generate Reports
- ✅ Session monitoring reports
- ✅ Audit comparison reports
- ✅ Executive summaries
- ✅ Export to JSON

### 4. Workflow Integration
- ✅ Automatic corrective actions
- ✅ Priority-based action plans
- ✅ Smart Workflow system integration

## 🎯 Common Use Cases

### Use Case 1: Live Monitoring Dashboard

```tsx
import React, { useEffect, useState } from "react";
import { PEOdpCore } from "@/modules/peodp_ai";

function DashboardPage() {
  const [peodp] = useState(() => new PEOdpCore());
  const [isActive, setIsActive] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      peodp.executar_ciclo();
      setStats(peodp.getRealtime().getEstatisticas());
    }, 3000);

    return () => clearInterval(interval);
  }, [isActive, peodp]);

  return (
    <div>
      <button onClick={() => {
        peodp.iniciar_monitoramento_tempo_real("My Vessel");
        setIsActive(true);
      }}>
        Start Monitoring
      </button>
      
      {stats && (
        <div>
          <p>Total Events: {stats.total}</p>
          <p>Critical: {stats.criticos}</p>
        </div>
      )}
    </div>
  );
}
```

### Use Case 2: Scheduled Audits

```typescript
import { PEOdpCore } from "@/modules/peodp_ai";

const peodp = new PEOdpCore();

// Run daily audit
setInterval(() => {
  const audit = peodp.iniciar_auditoria("NORMAM-101");
  
  if (audit.status === "red") {
    console.error("⚠️ Critical compliance issues detected!");
    // Send alert
  }
}, 24 * 60 * 60 * 1000); // Daily
```

### Use Case 3: Incident Response

```typescript
import { PEOdpCore, PEORealTime } from "@/modules/peodp_ai";

const monitor = new PEORealTime();
monitor.iniciar_monitoramento("Vessel Name");

// Monitor for critical events
const event = monitor.executar_ciclo_monitoramento();

if (event && event.evento !== "System Normal") {
  // Trigger immediate response
  console.warn(`Critical event: ${event.evento}`);
  // Automatic workflow action will be triggered
}
```

## 🧪 Testing

Run tests to verify installation:

```bash
npm test -- peodp_ai.test.ts
```

Expected output:
```
✓ 23 tests passing
✓ All modules validated
```

## 📚 Documentation

- **Quick Start**: `PEODP_QUICKSTART.md` (this file)
- **Full Implementation Guide**: `PEODP_PHASE2_IMPLEMENTATION.md`
- **Module API Reference**: `src/modules/peodp_ai/README.md`
- **Type Definitions**: `src/modules/peodp_ai/types.ts`

## 🎬 Demo Script

Run the demo script to see capabilities:

```bash
node scripts/demo-peodp.js
```

## 🆘 Troubleshooting

### Issue: Module not found
**Solution**: Check import path uses `@/modules/peodp_ai`

### Issue: Tests failing
**Solution**: Run `npm install` to ensure dependencies are installed

### Issue: TypeScript errors
**Solution**: Check type imports are correct:
```typescript
import type { DPEvent, AuditResult } from "@/modules/peodp_ai";
```

## 🔗 Quick Links

- Tests: `src/tests/peodp_ai.test.ts`
- Demo Component: `src/components/peo-dp/peo-dp-monitoring-demo.tsx`
- Demo Page: `src/pages/demo/PeoDpDemo.tsx`
- Configuration: `src/modules/peodp_ai/profiles/*.json`

## 💡 Tips

1. **Start Simple**: Use `executar_demo()` to see the complete workflow
2. **Read Logs**: Check console output for detailed operation info
3. **Use Types**: Import TypeScript types for better IDE support
4. **Check Tests**: Review test file for more usage examples
5. **Customize**: Modify JSON profiles to adjust compliance rules

## 🎓 Learning Path

1. **Day 1**: Run demo script and explore output
2. **Day 2**: Run unit tests and understand test cases
3. **Day 3**: Use React component in your application
4. **Day 4**: Customize compliance profiles
5. **Day 5**: Integrate with your workflow system

## ✅ Verification Checklist

- [ ] Module imports successfully
- [ ] Tests pass (23/23)
- [ ] Demo script runs
- [ ] React component renders
- [ ] Monitoring starts/stops correctly
- [ ] Audits generate reports
- [ ] JSON profiles load

## 🚀 Next Steps

Ready to move to Phase 3? Check the implementation guide for:
- BridgeLink API integration
- Forecast IA Global
- Real-time visual dashboard
- Offline mode

---

**Need Help?** Check the full documentation in `PEODP_PHASE2_IMPLEMENTATION.md`
