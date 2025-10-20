# ASOG Review Module

**Activity Specific Operating Guidelines** - Maritime DP Operations Compliance

## Overview

The ASOG Review module is part of the Nautilus One maritime operations system (Module #33/33). It audits vessel Dynamic Positioning (DP) operations and validates compliance with operational safety guidelines.

## Features

### Operational Data Collection
- Wind speed monitoring (knots)
- Thruster operational status tracking
- DP system alert level monitoring
- Timestamped data collection

### Real-time Validation
- Automatic validation against configurable ASOG limits
- Immediate conformance status reporting
- Detailed non-compliance alerts

### Compliance Reporting
- Structured JSON report generation
- Conformance status with detailed alerts
- Timestamped audit trail
- Export functionality for record-keeping

## ASOG Validation Criteria

| Parameter | Limit | Description |
|-----------|-------|-------------|
| Wind Speed | 35 knots max | Maximum allowed wind speed for safe DP operations |
| Thruster Loss | 1 unit max | Maximum number of thrusters allowed to be inoperative |
| DP Alert Level | Green required | Required DP system status for safe operations |

## Usage

### Basic Usage

```typescript
import { asogService } from "@/modules/asog-review/asogService";

// Execute ASOG Review
const { dados, resultado, relatorio } = asogService.start();

// Check conformance
if (resultado.conformidade) {
  console.log("✅ CONFORME - Operation within ASOG parameters");
} else {
  console.log("❌ NÃO CONFORME - Violations detected:");
  resultado.alertas.forEach(alert => console.log(`  - ${alert}`));
}

// Download report
asogService.downloadRelatorio(relatorio);
```

### Updating ASOG Limits

```typescript
// Update operational limits
asogService.updateASOGLimits({
  wind_speed_max: 40, // Increase wind limit to 40 knots
  thruster_loss_tolerance: 2, // Allow 2 thrusters to be lost
});
```

### Resetting the Service

```typescript
// Reset service state for a new review
asogService.reset();
```

## Integration

### Route
Access the module at `/asog-review` in the application.

### Logger Integration
The module integrates with the centralized logging system for audit trail:
- Info logs: Data collection and validation steps
- Warn logs: Non-conformance detection
- Error logs: System errors during review

### Type Safety
Fully typed TypeScript implementation with no `any` types.

## Example Report Output

```json
{
  "timestamp": "2025-10-20T01:00:00.000Z",
  "dados_operacionais": {
    "wind_speed": 28,
    "thrusters_operacionais": 3,
    "dp_status": "Green",
    "timestamp": "2025-10-20T01:00:00.000Z"
  },
  "resultado": {
    "conformidade": true,
    "alertas": []
  }
}
```

## Validation Scenarios

### ✅ Scenario 1: All Systems Normal (Conforme)
- Wind: 28 knots (within 35 limit)
- Thrusters: 3/4 operational (1 lost, within tolerance)
- DP Status: Green (matches requirement)
- **Result**: CONFORME

### ❌ Scenario 2: High Wind (Não Conforme)
- Wind: 40 knots (exceeds 35 limit)
- Thrusters: 3/4 operational
- DP Status: Green
- **Result**: NÃO CONFORME
- **Alert**: "⚠️ Velocidade do vento acima do limite ASOG."

### ❌ Scenario 3: Thruster Loss (Não Conforme)
- Wind: 30 knots (within limit)
- Thrusters: 1/4 operational (3 lost, exceeds tolerance)
- DP Status: Green
- **Result**: NÃO CONFORME
- **Alert**: "⚠️ Número de thrusters inoperantes excede limite ASOG."

## Architecture

### Files
- `types.ts` - TypeScript type definitions
- `asogService.ts` - Core ASOG validation service
- `README.md` - Module documentation

### Service Pattern
Singleton service class following established Nautilus One patterns.

### Error Handling
Comprehensive error handling with user-friendly messages and logging.

## Future Enhancements

- Real-time sensor data integration
- Historical trend analysis
- Automated alert notifications
- Customizable limits per vessel/operation
- PDF report export
- Multi-language support

## Related Modules

- PEO-DP (`/peo-dp`) - Dynamic Positioning Plan
- DP Intelligence (`/dp-intelligence`) - DP monitoring
- DP Incidents (`/dp-incidents`) - Incident tracking
- SGSO (`/sgso`) - Safety management system

## Version

- **Module**: #33/33
- **Version**: 1.0.0
- **System**: Nautilus One v1.1.0
- **Status**: 🟢 OPERATIONAL
