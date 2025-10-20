# PEO-DP Intelligent System - Quick Start Guide

## 🚀 5-Minute Quick Start

### Installation

The PEO-DP AI module is already integrated into the Travel HR Buddy system. No additional installation is required.

### Basic Usage

#### 1. Run Compliance Audit

```typescript
import { peodpCore } from "@/modules/peodp_ai";

// Run a simple audit
const auditoria = await peodpCore.iniciarAuditoria({
  vesselName: "PSV Ocean Explorer",
  dpClass: "DP2"
});

console.log(`Compliance Score: ${auditoria.score}%`);
```

#### 2. Start Real-Time Monitoring

```typescript
// Start monitoring
const sessionId = peodpCore.iniciar_monitoramento_tempo_real("PSV Ocean Explorer");

// Execute monitoring cycles (can be done manually or in a loop)
const evento = peodpCore.executar_ciclo();

// Or start continuous monitoring
peodpCore.iniciar_loop_continuo(3); // Check every 3 seconds
```

#### 3. Stop and Get Report

```typescript
// Stop monitoring and get report
const report = peodpCore.parar_monitoramento();

console.log(`Total Events: ${report.statistics.totalEvents}`);
console.log(`Violations: ${report.violations.length}`);
```

#### 4. Generate Executive Summary

```typescript
// Generate executive summary with all sessions
const summary = peodpCore.gerar_sumario_executivo();

console.log(`Status: ${summary.complianceStatus}`);
console.log(`Overall Score: ${summary.overallScore}`);
```

### Complete Demo

Run the complete demonstration:

```typescript
peodpCore.executar_demo();
```

This will automatically:
1. Execute a compliance audit
2. Start real-time monitoring for 30 seconds
3. Generate session report
4. Create executive summary

## 📊 Common Use Cases

### Use Case 1: Pre-Operation Audit

```typescript
// Before starting DP operations
const auditoria = await peodpCore.iniciarAuditoria({
  vesselName: "FPSO Cidade de São Paulo",
  dpClass: "DP3",
  autoDownload: true,
  format: "pdf"
});

if (auditoria.score < 75) {
  console.error("⚠️ Compliance score too low for operation");
  // Take corrective actions
}
```

### Use Case 2: Continuous Operations Monitoring

```typescript
// During operations
peodpCore.iniciar_monitoramento_tempo_real("PSV Atlantic Explorer");
peodpCore.iniciar_loop_continuo(5); // Check every 5 seconds

// Monitor will automatically trigger workflow actions
// when critical events are detected
```

### Use Case 3: Post-Operation Analysis

```typescript
// After operations
const comparison = peodpCore.gerar_relatorio_comparacao();

console.log("Violation Trend:", comparison.trends.violationTrend);
console.log("Event Trend:", comparison.trends.eventTrend);

comparison.insights.forEach(insight => {
  console.log(insight);
});
```

## 🎯 Monitored Events

The system monitors these DP events:

| Event Type | Severity | Automatic Action |
|------------|----------|------------------|
| Loss of DP Reference | Critical | Verify sensors, activate GPS/DGNSS backup |
| Power Failure | Critical | Activate emergency system, verify UPS |
| Thruster Fault | High | Engage machinery team, run MMI self-test |
| UPS Alarm | High | Check power bus and battery integrity |
| Position Drift | Medium | Verify sensor integrity, check environmental conditions |
| Manual Override | Medium | Confirm DPO intention and log justification |
| System Normal | Info | No action required |

## 📈 Understanding Scores

### Compliance Score (0-100%)

- **90-100%**: 🌟 Excellent - Conformidade total
- **75-89%**: ✅ Good - Conformidade aceitável com pequenos ajustes
- **60-74%**: ⚠️ Acceptable - Necessita melhorias
- **0-59%**: 🚨 Critical - Ação imediata requerida

### Violation Rate

- **< 5%**: ✅ Acceptable
- **5-15%**: ⚡ Moderate - Continuous monitoring needed
- **15-30%**: ⚠️ High - Review operational procedures
- **> 30%**: 🚨 Critical - Immediate inspection required

## 🔧 Integration with Workflow System

The PEO-DP system automatically integrates with the Smart Workflow:

```typescript
// Workflow actions are triggered automatically
const workflowManager = peodpCore.workflowManager;

// Get all predefined actions
const actions = workflowManager.obter_todas_acoes();

// Get action history
const history = workflowManager.historico_acoes;

// Get statistics
const stats = workflowManager.obter_estatisticas();
console.log(`${stats.sucessos}/${stats.total} actions successful`);
```

## 📝 Accessing Current Session

```typescript
// Get current monitoring session
const session = peodpCore.sessao_atual;

if (session) {
  console.log(`Vessel: ${session.vesselName}`);
  console.log(`Active: ${session.isActive}`);
  console.log(`Events: ${session.eventos.length}`);
  console.log(`Violations: ${session.violations}`);
}
```

## 🔗 API Integration

### REST API Endpoints (Future Phase 3)

```
POST /api/peodp/audit
GET  /api/peodp/sessions
POST /api/peodp/monitoring/start
POST /api/peodp/monitoring/stop
GET  /api/peodp/summary
```

## 📚 Additional Resources

- [Complete Implementation Guide](./PEODP_PHASE2_IMPLEMENTATION.md)
- [Module README](./src/modules/peodp_ai/README.md)
- [NORMAM-101 Documentation](https://www.marinha.mil.br/dpc/normam)
- [IMCA M117 Guidelines](https://www.imca-int.com/product/the-training-and-experience-of-key-dp-personnel-imca-m-117/)

## 🤝 Support

For issues or questions, contact the development team or check the module tests for additional examples:

- `src/tests/modules/peodp-engine.test.ts`
- `src/tests/modules/peodp-realtime.test.ts`
- `src/tests/modules/peodp-workflow.test.ts`
- `src/tests/modules/peodp-core-phase2.test.ts`
