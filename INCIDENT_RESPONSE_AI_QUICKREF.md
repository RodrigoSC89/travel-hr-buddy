# Incident Response AI & Maritime Compliance - Quick Reference

## 🔗 Quick Links

- **Route**: `/compliance`
- **Components**: ComplianceReporter, ISMChecklist
- **Core Logic**: `src/lib/ai/incident-response-core.ts`
- **Database**: `incident_reports` table

## 📊 Usage Examples

### Report an Incident

```typescript
import { handleIncidentReport } from "@/lib/ai/incident-response-core";

// Example 1: DP Failure
await handleIncidentReport({
  type: "DP Failure",
  severity: "Critical",
  message: "DP system lost position reference - GPS failure",
  module: "DP Advisor"
});
// Returns: { riskScore: 0.9, compliance: ["IMCA M109", "IMCA M254", "ISM Code 10.2"] }

// Example 2: Cyber Security Event
await handleIncidentReport({
  type: "Cyber Breach",
  severity: "Major",
  message: "Unauthorized access attempt detected on vessel network",
  module: "Control Hub"
});
// Returns: { riskScore: 0.7, compliance: ["ISPS Code Part B-16", "IMO MSC.428(98)"] }

// Example 3: Maintenance Issue
await handleIncidentReport({
  type: "Maintenance Delay",
  severity: "Moderate",
  message: "Preventive maintenance delayed by 48 hours due to parts shortage",
  module: "Maintenance Orchestrator"
});
// Returns: { riskScore: 0.4, compliance: ["IMCA M140", "NORMAM 101", "ISM Code 10.3"] }
```

## 🗄️ Database Setup

```sql
-- Run this in Supabase SQL Editor
create table incident_reports (
  id uuid primary key default uuid_generate_v4(),
  timestamp timestamptz not null,
  module text,
  type text,
  severity text,
  message text,
  riskScore numeric,
  compliance text[]
);

-- Optional: Add RLS policies if needed
alter table incident_reports enable row level security;

-- Optional: Create indexes for better query performance
create index idx_incident_reports_timestamp on incident_reports(timestamp desc);
create index idx_incident_reports_type on incident_reports(type);
create index idx_incident_reports_severity on incident_reports(severity);
```

## 🎨 Component Integration

### Add ComplianceReporter to Any Page

```tsx
import ComplianceReporter from "@/components/compliance/ComplianceReporter";

function MyPage() {
  return (
    <div>
      <h1>My Dashboard</h1>
      <ComplianceReporter />
    </div>
  );
}
```

### Add ISMChecklist to Any Page

```tsx
import ISMChecklist from "@/components/compliance/ISMChecklist";

function MyPage() {
  return (
    <div>
      <h1>Compliance Requirements</h1>
      <ISMChecklist />
    </div>
  );
}
```

## 🔔 MQTT Integration

### Subscribe to Incident Alerts

```typescript
import mqtt from "mqtt";

const client = mqtt.connect(import.meta.env.VITE_MQTT_URL);

client.on("connect", () => {
  client.subscribe("nautilus/incidents/alert", (err) => {
    if (!err) {
      console.log("Subscribed to incident alerts");
    }
  });
});

client.on("message", (topic, message) => {
  if (topic === "nautilus/incidents/alert") {
    const incident = JSON.parse(message.toString());
    console.log("New incident:", incident);
    // Handle incident alert (show notification, update UI, etc.)
  }
});
```

## 📋 Risk Score Reference

| Severity | Risk Score | Action Required |
|----------|------------|-----------------|
| Critical | 0.9 | Immediate action required |
| Major | 0.7 | Action required within 24h |
| Moderate | 0.4 | Action required within 1 week |
| Minor | 0.2 | Monitor and schedule |
| Default | 0.1 | Low priority |

## 🏛️ Compliance Standards Reference

### DP Failure
- IMCA M109: Guidelines for DP Operations
- IMCA M254: DP Vessel Design Philosophy Guidelines
- ISM Code 10.2: Maintenance of Ship and Equipment

### Cyber Breach
- ISPS Code Part B-16: Ship Security Plan
- IMO MSC.428(98): Maritime Cyber Risk Management

### Maintenance Delay
- IMCA M140: Planned Maintenance System
- NORMAM 101: Brazilian Maritime Safety Standards
- ISM Code 10.3: Documentation of Maintenance

### Safety Alert
- IMCA M103: Safety Flash System
- IMCA M166: Safety Observations
- ISM Code 9.1: Reports and Analysis of Non-conformities

## 🔧 Environment Variables

```env
# Required
VITE_MQTT_URL=wss://your-mqtt-broker.com:8883/mqtt

# Already configured (from existing setup)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

## 🚦 Status Indicators

The system uses color coding for severity levels:
- 🔴 **Critical**: Red - Immediate attention required
- 🟠 **Major**: Orange - High priority
- 🟡 **Moderate**: Yellow - Medium priority
- 🔵 **Minor**: Blue - Low priority

## 📱 Responsive Design

- **Desktop**: 2-column grid layout
- **Tablet**: 2-column grid layout
- **Mobile**: Single column, stacked layout

## 🔐 Security Considerations

1. **RLS Policies**: Consider implementing Row Level Security in Supabase
2. **Authentication**: Ensure only authorized users can create incidents
3. **Data Retention**: Implement data retention policies as required by regulations
4. **Audit Trail**: All incidents are timestamped and traceable

## 📞 Support & Integration

For integration with other modules:
1. Import the `handleIncidentReport` function
2. Call it when incidents occur in your module
3. The system handles the rest (database, MQTT, compliance mapping)

Example integration in existing code:
```typescript
try {
  // Your existing code
  await performDPOperation();
} catch (error) {
  // Report incident automatically
  await handleIncidentReport({
    type: "DP Failure",
    severity: "Critical",
    message: error.message,
    module: "DP Operations"
  });
  throw error;
}
```

## 📊 Monitoring

Access the Compliance Hub at `/compliance` to:
- View all incident reports
- Monitor real-time updates
- Review compliance requirements
- Track incident trends (future enhancement)

---

**Last Updated**: October 2025 | **Version**: 1.0 (Patch 22)
