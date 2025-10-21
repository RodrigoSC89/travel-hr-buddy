# AI Incident Response & Resilience Integration - Implementation Guide

## Overview

Patch 18 adds automated incident detection and response capabilities to the Nautilus One Control Hub system. This enhancement provides:

- **Automated Incident Detection**: Real-time detection of operational and compliance incidents
- **AI-Powered Analysis**: Compliance audits using AI and heuristics
- **Real-time Reporting**: Incident reports via Supabase and MQTT
- **Visual Dashboard**: Integration with Control Hub for incident monitoring

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Control Hub UI                         │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │ ResilienceMonitor│  │ComplianceDashboard│  │IncidentPanel│ │
│  └─────────────────┘  └──────────────────┘  └──────┬──────┘ │
└────────────────────────────────────────────────────┼────────┘
                                                      │
                                                      ▼
                              ┌────────────────────────────────┐
                              │  AI Incident Response Handler   │
                              │  - handleIncident()             │
                              └──────┬──────────────┬───────────┘
                                     │              │
                    ┌────────────────▼───┐      ┌───▼──────────┐
                    │ AI Compliance      │      │   Supabase   │
                    │ Engine             │      │ incident_    │
                    │ - runCompliance    │      │ reports      │
                    │   Audit()          │      └───┬──────────┘
                    └────────────────────┘          │
                                                    │
                                         ┌──────────▼──────────┐
                                         │  MQTT Broker        │
                                         │  nautilus/incidents │
                                         └─────────────────────┘
```

## Files Created

### 1. AI Compliance Engine
**Location**: `src/lib/compliance/ai-compliance-engine.ts`

Performs compliance audits on incident data, checking for:
- DP (Dynamic Positioning) loss
- Sensor misalignment
- ISM (International Safety Management) non-compliance
- ISPS (International Ship and Port Facility Security) non-compliance
- ASOG (Annual Standing Orders Guide) deviations
- FMEA (Failure Mode and Effects Analysis) deviations

Returns a compliance result with:
- Compliance level: "Conforme", "Risco", or "Não Conforme"
- Score: 0.0 (non-compliant) to 1.0 (fully compliant)
- Issues detected
- Recommendations

### 2. AI Incident Response Handler
**Location**: `src/lib/incidents/ai-incident-response.ts`

Main handler for processing incidents:
- Runs compliance audit on incident data
- Creates structured incident report
- Stores report in Supabase
- Publishes alert to MQTT broker (if configured)
- Generates appropriate recommendations

### 3. React Components

#### IncidentResponsePanel
**Location**: `src/components/resilience/IncidentResponsePanel.tsx`

Real-time incident monitoring panel:
- Displays all incident reports
- Color-coded by severity (green/yellow/red)
- Real-time updates via Supabase subscriptions
- Shows compliance level, score, and recommendations

#### ResilienceMonitor
**Location**: `src/components/resilience/ResilienceMonitor.tsx`

System resilience monitoring:
- Shows operational status
- Displays uptime metrics
- Monitors active systems

#### ComplianceDashboard
**Location**: `src/components/resilience/ComplianceDashboard.tsx`

Compliance status overview:
- ISM compliance percentage
- ISPS compliance percentage
- ASOG status

### 4. Control Hub Integration
**Location**: `src/pages/ControlHub.tsx`

Updated to include new resilience and incident components in a 2-column grid layout.

## Database Setup

See [AI_INCIDENT_RESPONSE_DATABASE_SCHEMA.md](./AI_INCIDENT_RESPONSE_DATABASE_SCHEMA.md) for complete database setup instructions.

## Environment Configuration

Required environment variables:

```env
# Supabase (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# MQTT (Optional, for alerting)
VITE_MQTT_URL=wss://broker.emqx.io:8084/mqtt
```

## Usage Examples

### Detecting and Handling an Incident

```typescript
import { handleIncident } from "@/lib/incidents/ai-incident-response";

// Report a DP loss incident
const report = await handleIncident({
  type: "DP Loss",
  description: "Dynamic positioning system lost GPS reference",
  data: {
    dpLoss: true,
    sensorMisalignment: false,
    ismNonCompliance: false,
  }
});

console.log(report);
// {
//   id: "uuid",
//   timestamp: "2025-10-21T17:58:39.000Z",
//   type: "DP Loss",
//   description: "Dynamic positioning system lost GPS reference",
//   level: "Risco",
//   score: 0.6,
//   recommendation: "Verificar sistemas de suporte (DP Loss). Reavaliar ASOG."
// }
```

### Running a Compliance Audit

```typescript
import { runComplianceAudit } from "@/lib/compliance/ai-compliance-engine";

const result = await runComplianceAudit({
  dpLoss: false,
  sensorMisalignment: true,
  ismNonCompliance: false,
  ispsNonCompliance: false,
  asogDeviation: false,
  fmeaDeviation: false,
});

console.log(result);
// {
//   complianceLevel: "Risco",
//   score: 0.8,
//   issues: ["Desalinhamento de sensores"],
//   recommendations: ["Realizar calibração de sensores"]
// }
```

## Integration Points

### 1. MQTT Publishing
When an incident is detected, it's automatically published to the MQTT topic:
- **Topic**: `nautilus/incidents/alert`
- **Payload**: JSON incident report

### 2. Supabase Real-time
The IncidentResponsePanel subscribes to Supabase real-time updates:
- **Channel**: `incident_watch`
- **Event**: `INSERT` on `incident_reports` table

### 3. Control Hub UI
Three new components integrated into the Control Hub:
- ResilienceMonitor (system status)
- ComplianceDashboard (compliance metrics)
- IncidentResponsePanel (incident alerts)

## Testing

### Unit Testing
Test the compliance engine and incident handler:

```typescript
import { runComplianceAudit } from "@/lib/compliance/ai-compliance-engine";
import { handleIncident } from "@/lib/incidents/ai-incident-response";

// Test compliance audit
test("compliance audit detects DP loss", async () => {
  const result = await runComplianceAudit({ dpLoss: true });
  expect(result.complianceLevel).toBe("Risco");
  expect(result.score).toBeLessThan(0.7);
});

// Test incident handling
test("incident handler creates report", async () => {
  const report = await handleIncident({
    type: "Test",
    description: "Test incident",
    data: {}
  });
  expect(report.id).toBeDefined();
  expect(report.timestamp).toBeDefined();
});
```

### Manual Testing
1. Navigate to `/control-hub` in the application
2. Verify all three new panels are visible
3. Check that IncidentResponsePanel shows "Nenhum incidente detectado" initially
4. Use the usage examples to create test incidents
5. Verify incidents appear in real-time on the panel

## Future Enhancements

### Planned Features
- [ ] ONNX model integration for advanced anomaly detection
- [ ] Integration with vessel sensor data streams
- [ ] Automated corrective action triggers
- [ ] Historical incident analytics
- [ ] Export incident reports to PDF
- [ ] Email/SMS notifications for critical incidents
- [ ] Machine learning for incident pattern recognition

### Extensibility
The system is designed to be easily extended:
- Add new compliance checks in `ai-compliance-engine.ts`
- Add new incident types in `ai-incident-response.ts`
- Create custom dashboards by extending the component library

## Troubleshooting

### Incidents not appearing in panel
1. Check Supabase table exists: `incident_reports`
2. Verify environment variables are set correctly
3. Check browser console for errors
4. Ensure RLS policies allow authenticated users to read

### MQTT alerts not working
1. Verify `VITE_MQTT_URL` is configured
2. Check MQTT broker is accessible
3. Review browser console for connection errors
4. Note: MQTT is optional and won't prevent incident reporting

### Build errors
1. Ensure all dependencies are installed: `npm install`
2. Check TypeScript configuration
3. Verify all imports are correct
4. Run type check: `npx tsc --noEmit`

## Version History

- **v1.3.0** (Patch 18): Initial release of AI Incident Response & Resilience Integration
- Adds automated incident detection and response
- Integrates with Control Hub UI
- Implements compliance auditing engine

## Support

For issues or questions, please refer to:
- [Database Schema Documentation](./AI_INCIDENT_RESPONSE_DATABASE_SCHEMA.md)
- Main README.md
- Repository issues tracker
