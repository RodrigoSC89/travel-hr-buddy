# ASOG Review Module

## Overview

The ASOG Review module provides Activity Specific Operating Guidelines validation for Dynamic Positioning (DP) operations in maritime vessels. It monitors critical operational parameters and validates them against configurable safety thresholds to ensure compliance with ASOG standards.

## Module Information

- **Module Number**: 33/33 (Final module in Nautilus One system)
- **Version**: 1.0.0
- **Route**: `/asog-review`
- **Integration**: Nautilus One v1.1.0

## Features

### Operational Data Collection
- Wind speed monitoring (knots)
- Thruster operational status tracking
- DP system alert level monitoring
- Timestamped data capture

### Real-time Validation
- Automatic validation against ASOG limits
- Detailed non-compliance alerting
- Color-coded status indicators

### Compliance Reporting
- Structured JSON report generation
- Timestamped compliance records
- Downloadable reports for audit trail

### ASOG Validation Criteria

| Parameter | Default Limit | Description |
|-----------|---------------|-------------|
| Wind Speed | 35 knots max | Maximum allowed wind speed for safe DP operations |
| Thruster Loss | 1 unit max | Maximum number of thrusters allowed to be inoperative |
| DP Alert Level | Green required | Required DP system status for safe operations |

## Usage

### Execute ASOG Review

```typescript
import { asogService } from "@/modules/asog-review/asogService";

// Execute review
const { dados, resultado, relatorio } = asogService.start();

// Check conformance
if (resultado.conformidade) {
  console.log("✅ CONFORME - Operation within ASOG parameters");
} else {
  console.log("❌ NÃO CONFORME - Violations detected:");
  resultado.alertas.forEach(alert => console.log(`  - ${alert}`));
}
```

### Download Report

```typescript
// Download report as JSON file
asogService.downloadRelatorio(relatorio);
```

### Configure Limits

```typescript
// Update ASOG limits
asogService.setLimits({
  max_wind_speed: 40,
  max_thruster_loss: 2,
  required_dp_status: "Yellow"
});

// Get current limits
const limits = asogService.getLimits();
```

## Example Report

```json
{
  "timestamp": "2025-10-20T11:15:00.361Z",
  "dados_operacionais": {
    "wind_speed": 28,
    "thrusters_operacionais": 3,
    "dp_status": "Green",
    "timestamp": "2025-10-20T11:15:00.360Z"
  },
  "resultado": {
    "conformidade": true,
    "alertas": []
  }
}
```

## Module Structure

```
src/modules/asog-review/
├── types.ts           # TypeScript type definitions
├── asogService.ts     # Core ASOG validation service
└── README.md          # Module documentation

src/pages/
└── ASOGReview.tsx     # Main UI component
```

## Integration Points

- **Logger**: Integrated with centralized logger (`@/lib/logger`)
- **UI Components**: Uses shadcn/ui component library
- **Routing**: Accessible at `/asog-review` route
- **Related Modules**: 
  - PEO-DP (`/peo-dp`) - Dynamic Positioning Plan
  - DP Intelligence (`/dp-intelligence`) - DP monitoring
  - DP Incidents (`/dp-incidents`) - Incident tracking
  - SGSO (`/sgso`) - Safety management system

## Technical Details

- **Pattern**: Singleton service class
- **Type Safety**: Fully typed TypeScript with no `any` types
- **Error Handling**: Comprehensive error handling with logging
- **Accessibility**: WCAG compliant UI
- **Dark Mode**: Full theme support
- **Responsive**: Optimized for mobile, tablet, and desktop

## Future Enhancements

- Real-time sensor data integration
- Historical trend analysis
- Automated alert notifications
- Customizable limits per vessel/operation
- PDF report export
- Multi-language support
