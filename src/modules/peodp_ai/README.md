# PEO-DP AI Module - Phase 2

## Overview

The **PEO-DP Intelligent System** is a comprehensive Dynamic Positioning compliance monitoring and evaluation platform. Phase 2 introduces real-time monitoring capabilities with automatic corrective actions.

## Features

### 🧩 Core Features
- **Real-time DP Event Monitoring**: Continuous monitoring of DP systems, MMI, and ASOG logs
- **Compliance Evaluation**: Automatic evaluation against NORMAM-101 and IMCA M117 standards
- **Smart Workflow Integration**: Automatic triggering of corrective actions
- **Comprehensive Reporting**: Detailed audit reports and monitoring statistics
- **Multi-Profile Support**: Support for multiple compliance standards

### 📡 Real-time Monitoring
- Continuous event detection from DP logs
- Automatic violation detection
- Configurable tolerance limits
- Live compliance status updates

### 🔧 Corrective Actions
- Automatic workflow triggering for critical events
- Predefined action plans for common scenarios
- Priority-based action execution
- Integration with Smart Workflow system

## Module Structure

```
src/modules/peodp_ai/
├── peodp_core.ts          # Main orchestration and menu system
├── peodp_engine.ts        # Compliance evaluation engine
├── peodp_rules.ts         # Rules engine (NORMAM-101, IMCA M117)
├── peodp_realtime.ts      # Real-time monitoring system
├── peodp_workflow.ts      # Smart workflow integration
├── peodp_report.ts        # Report generation system
├── types.ts               # TypeScript type definitions
├── index.ts               # Module exports
└── profiles/              # Compliance profile configurations
    ├── normam_101.json    # Brazilian maritime authority standards
    ├── imca_m117.json     # IMCA guidelines for DP operations
    └── vessel_profile.json # Vessel configuration templates
```

## Usage

### Basic Usage

```typescript
import { PEOdpCore } from "@/modules/peodp_ai";

// Initialize the system
const peodp = new PEOdpCore();

// Run manual audit
const auditResult = peodp.iniciar_auditoria("NORMAM-101");

// Start real-time monitoring
peodp.iniciar_monitoramento_tempo_real("PSV Atlantic Explorer");

// Execute monitoring cycles
peodp.executar_ciclo();

// Stop monitoring and generate report
peodp.parar_monitoramento();

// Generate executive summary
peodp.gerar_sumario_executivo();
```

### Demo Mode

```typescript
import { PEOdpCore } from "@/modules/peodp_ai";

const peodp = new PEOdpCore();
peodp.executar_demo(); // Runs complete workflow demonstration
```

### Menu-Driven Interface

```typescript
const peodp = new PEOdpCore();

// Display main menu
peodp.menu();

// Options:
// 1. Manual Audit
// 2. Real-time Monitoring
// 3. Reports and Analysis
// 4. Configuration
// 5. Exit
```

## Compliance Profiles

### NORMAM-101 (Brazilian Maritime Authority)
- System redundancy requirements
- DPO certification validation
- DP alarm auditing
- Periodic testing requirements
- Manual override procedures
- Position sensor requirements
- UPS and power supply standards
- Training requirements

### IMCA M117 (International Marine Contractors Association)
- DP Operations Manual (DPOM)
- FMEA analysis requirements
- Annual DP trials
- Position reference systems
- Thruster redundancy
- Power management
- Watch keeping requirements
- Environmental limits
- DP incident reporting
- Software update validation

## Event Types

The system monitors the following DP events:

- **Loss of DP Reference**: Position reference system failure
- **Thruster Fault**: Propulsion system malfunction
- **UPS Alarm**: Uninterruptible power supply issues
- **Manual Override**: Manual intervention in DP system
- **Position Drift**: Excessive position deviation
- **Power Failure**: Electrical power system issues
- **System Normal**: Normal operation status

## Workflow Actions

Each event type triggers predefined corrective actions:

### Critical Events
- **Loss of DP Reference**: Verify sensors and activate GPS/DGNSS backup
- **Thruster Fault**: Engage machinery team and run MMI self-test
- **UPS Alarm**: Check power bus and battery integrity
- **Power Failure**: Activate emergency generators

### Important Events
- **Manual Override**: Confirm DPO intention and log justification
- **Position Drift**: Verify capability plot against environmental conditions

## Reports

### Session Report
- Total events count
- Critical events breakdown
- Compliance score
- Event distribution by type
- Recommendations

### Audit Report
- Compliance percentage
- Violated rules
- Recommendations by priority
- Status indicator (Green/Yellow/Red)

### Executive Summary
- Overall compliance trends
- Active monitoring sessions
- Total events processed
- Key recommendations

## Configuration

### Tolerance Limit
Configure the maximum number of critical events before automatic escalation:

```typescript
peodp.configurar_tolerancia(5); // Set to 5 critical events
```

### Custom Vessel State
Provide custom vessel configuration for audits:

```typescript
const vesselState = {
  vessel_name: "Custom Vessel",
  dp_class: "DP3",
  thrusters_operational: 6,
  generators_operational: 4,
  position_references: 3
};

peodp.iniciar_auditoria("IMCA M117", vesselState);
```

## Integration Points

### Logger Integration
All events are logged using the centralized logger system:
- Debug logs in development
- Error tracking with Sentry in production
- Structured logging with context

### Smart Workflow Integration
Automatic corrective actions are sent to the Smart Workflow system for:
- Task creation
- Assignment to responsible personnel
- Progress tracking
- Completion verification

## Next Steps (Phase 3)

### 3.1 BridgeLink API Integration
- Send logs and audits to SGSO Petrobras
- Real-time data synchronization
- Incident reporting integration

### 3.2 Forecast IA Global
- Predict non-compliance risk by vessel
- Machine learning-based trend analysis
- Preventive maintenance scheduling

### 3.3 Real-time Dashboard
- Live compliance monitoring panel
- Visual alarm system
- Multi-vessel monitoring

### 3.4 Offline Mode
- Autonomous onboard operation
- Automatic synchronization when online
- Local data persistence

## Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test peodp_ai
```

## API Reference

See inline documentation in each module file for detailed API information.

## Contributing

When contributing to this module:
1. Follow TypeScript best practices
2. Add comprehensive JSDoc comments
3. Write unit tests for new features
4. Update this README with new functionality
5. Ensure compliance with existing logging patterns

## License

Internal use only - Travel HR Buddy System

## Authors

- Implementation: PEO-DP AI Team
- Based on: NORMAM-101 and IMCA M117 standards
- Version: 2.0 (Phase 2 - Real-time Monitoring)
