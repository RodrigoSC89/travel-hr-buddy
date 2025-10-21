# AI Maintenance Orchestrator - Visual Summary

## 🎯 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    NAUTILUS ONE CONTROL HUB                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │  Control Hub Panel   │  │   System Alerts      │            │
│  │  ─────────────────   │  │  ──────────────      │            │
│  │  • Potência Total    │  │  • Real-time alerts  │            │
│  │  • Heading           │  │  • System status     │            │
│  │  • Previsão Oceânica │  │  • Notifications     │            │
│  │  • Thrusters Ativos  │  │                      │            │
│  └──────────────────────┘  └──────────────────────┘            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │   🔧 Maintenance Orchestrator — Previsão de Falhas      │  │
│  │   ────────────────────────────────────────────────────  │  │
│  │                                                          │  │
│  │                      ✅ CheckCircle                      │  │
│  │         (or ⚠️  AlertTriangle or 🔧 Wrench)            │  │
│  │                                                          │  │
│  │       Equipamentos operando dentro dos parâmetros.       │  │
│  │                     Status: Normal                       │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              AI Insight Reporter                         │  │
│  │              ──────────────────                          │  │
│  │              (Existing component)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Component States

### Normal State ✅
```
┌─────────────────────────────────────────────────┐
│ 🔧 Maintenance Orchestrator — Previsão de Falhas│
├─────────────────────────────────────────────────┤
│                                                  │
│                ✅ CheckCircle                   │
│              (text-green-400)                   │
│                                                  │
│    Equipamentos operando dentro dos parâmetros. │
│              Status: Normal                      │
│                                                  │
└─────────────────────────────────────────────────┘
Background: bg-gray-950
Border: border-cyan-900
Text: text-cyan-400 (title), text-gray-300 (message)
```

### Attention State ⚠️
```
┌─────────────────────────────────────────────────┐
│ 🔧 Maintenance Orchestrator — Previsão de Falhas│
├─────────────────────────────────────────────────┤
│                                                  │
│              ⚠️  AlertTriangle                  │
│             (text-yellow-400)                   │
│                                                  │
│  Tendência de desgaste identificada.            │
│       Programar inspeção.                       │
│           Status: Atenção                       │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Critical State 🔧
```
┌─────────────────────────────────────────────────┐
│ 🔧 Maintenance Orchestrator — Previsão de Falhas│
├─────────────────────────────────────────────────┤
│                                                  │
│                  🔧 Wrench                      │
│               (text-red-500)                    │
│                                                  │
│     Falha iminente detectada — iniciar          │
│   procedimento de reparo preventivo IMCA M254.  │
│            Status: Crítico                      │
│                                                  │
└─────────────────────────────────────────────────┘
```

## 🔄 Data Flow Diagram

```
┌─────────────────────┐
│  Telemetry Sources  │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌─────────┐  ┌──────────┐
│   DP    │  │ Control  │
│Telemetry│  │Telemetry │
└────┬────┘  └────┬─────┘
     │            │
     │   Every    │
     │  60 sec    │
     │            │
     └────┬───────┘
          │
          ▼
  ┌───────────────┐
  │MaintenanceDash│
  │   board.tsx   │
  └───────┬───────┘
          │
          ▼
┌─────────────────────┐
│ maintenance-        │
│ orchestrator.ts     │
│                     │
│ • Collect 5 params  │
│ • Create tensor     │
│ • Run ONNX model    │
│ • Classify risk     │
└──────┬──────────────┘
       │
   ┌───┴────┐
   │        │
   ▼        ▼
┌──────┐ ┌─────┐
│MQTT  │ │Supa-│
│Broker│ │base │
└──────┘ └─────┘
```

## 🎨 Color Scheme

```
Component Background: bg-gray-950 (#030712)
Border: border-cyan-900 (#164e63)
Title: text-cyan-400 (#22d3ee)
Message: text-gray-300 (#d1d5db)
Status: text-gray-500 (#6b7280)

Icon Colors:
├─ Normal:    text-green-400  (#4ade80)
├─ Atenção:   text-yellow-400 (#facc15)
└─ Crítico:   text-red-500    (#ef4444)
```

## 📐 Layout Structure

```
Control Hub Page (container mx-auto p-6)
│
├─ Header (flex items-center justify-between)
│   ├─ Title: "⚓ Control Hub – Observability & AI Insights"
│   └─ Description: "Monitoramento em tempo real..."
│
├─ Main Grid (grid grid-cols-1 lg:grid-cols-2 gap-6)
│   ├─ ControlHubPanel (Suspense + lazy load)
│   ├─ SystemAlerts (Suspense + lazy load)
│   └─ MaintenanceDashboard (Suspense + lazy load) ← NEW
│
└─ AI Insights Section
    └─ AIInsightReporter (Suspense + lazy load)
```

## 🧩 Component Hierarchy

```
ControlHub.tsx
│
├─ Suspense (ControlHubPanel)
│   └─ ControlHubPanel.tsx
│       └─ Card
│           ├─ CardHeader → CardTitle
│           └─ CardContent → Metrics grid
│
├─ Suspense (SystemAlerts)
│   └─ SystemAlerts.tsx
│       └─ Card with alerts
│
├─ Suspense (MaintenanceDashboard) ← NEW
│   └─ MaintenanceDashboard.tsx
│       └─ Card (border-cyan-900 bg-gray-950)
│           ├─ CardHeader
│           │   └─ CardTitle (text-cyan-400)
│           └─ CardContent (flex flex-col items-center)
│               ├─ Icon (w-8 h-8, conditional color)
│               ├─ Message (mt-2 text-center text-sm text-gray-300)
│               └─ Status (text-xs text-gray-500 mt-1)
│
└─ Suspense (AIInsightReporter)
    └─ AIInsightReporter.tsx
```

## 🔢 Risk Calculation Flow

```
Input Tensor [1, 5]:
┌──────────────────┬──────────────────┐
│  Index 0         │  generatorLoad   │
│  Index 1         │  positionError   │
│  Index 2         │  vibration       │
│  Index 3         │  temperature     │
│  Index 4         │  powerFluctuation│
└──────────────────┴──────────────────┘
          │
          ▼
  ┌────────────────┐
  │  ONNX Model    │
  │  Inference     │
  └────────┬───────┘
          │
          ▼
    Risk Score (0.0 - 1.0)
          │
          ▼
  ┌───────────────────┐
  │  Classification   │
  ├───────────────────┤
  │ < 0.3  → Normal   │
  │ < 0.7  → Atenção  │
  │ ≥ 0.7  → Crítico  │
  └───────────────────┘
          │
          ▼
  { level, message }
```

## 📱 Responsive Behavior

```
Mobile (< 1024px):
┌────────────────┐
│ ControlHubPanel│
├────────────────┤
│ SystemAlerts   │
├────────────────┤
│ Maintenance    │
│ Dashboard      │
├────────────────┤
│ AIInsight      │
│ Reporter       │
└────────────────┘

Desktop (≥ 1024px):
┌──────────────┬──────────────┐
│ControlHub    │SystemAlerts  │
│Panel         │              │
├──────────────┴──────────────┤
│ MaintenanceDashboard        │
├─────────────────────────────┤
│ AIInsightReporter           │
└─────────────────────────────┘
```

## 🔔 Alert Flow

```
MQTT Topic: nautilus/maintenance/alert

Message Payload:
{
  "level": "Crítico",
  "message": "Falha iminente detectada — iniciar procedimento de reparo preventivo IMCA M254."
}

┌──────────────────┐
│  MQTT Broker     │
│  (configured in  │
│  VITE_MQTT_URL)  │
└────────┬─────────┘
         │
    Publishes to
         │
         ▼
┌──────────────────────┐
│ nautilus/maintenance │
│      /alert          │
└──────────────────────┘
         │
    Subscribers
         │
    ┌────┴─────┐
    ▼          ▼
┌────────┐ ┌────────┐
│Monitor │ │ Other  │
│Systems │ │Clients │
└────────┘ └────────┘
```

## 💾 Database Structure

```
maintenance_logs Table
┌─────────────┬──────────────┬───────────┐
│   Column    │     Type     │   Notes   │
├─────────────┼──────────────┼───────────┤
│ id          │ uuid         │ PK        │
│ timestamp   │ timestamptz  │ NOT NULL  │
│ level       │ text         │ CHECK IN  │
│ message     │ text         │ NOT NULL  │
│ created_at  │ timestamptz  │ NOT NULL  │
└─────────────┴──────────────┴───────────┘

Indexes:
├─ idx_maintenance_logs_timestamp (timestamp DESC)
└─ idx_maintenance_logs_level (level)

RLS Policies:
├─ Read: authenticated users
└─ Insert: authenticated users
```

## 🎬 Lifecycle Events

```
Component Mount:
1. useState initializes with "Carregando" status
2. useEffect sets up 60-second interval
3. First telemetry fetch after mount
4. Process through orchestrator
5. Update state with result

Every 60 Seconds:
1. Fetch /api/dp/telemetry
2. Fetch /api/control/telemetry
3. Call runMaintenanceOrchestrator()
4. ONNX inference
5. Risk classification
6. Insert to Supabase
7. Publish to MQTT
8. Return result
9. Update UI state

Component Unmount:
1. clearInterval cleanup
2. Stop polling
```

## 🛡️ Error Handling

```
Try-Catch Scenarios:
├─ ONNX model loading failure
├─ Telemetry API fetch errors
├─ Supabase insert failures
├─ MQTT connection issues
└─ Invalid data format

Fallback Behaviors:
├─ Display "Carregando" state
├─ Log errors to console
├─ Continue polling (resilient)
└─ Graceful degradation
```

---

**Visual Design Philosophy:**
- Dark theme for maritime control room aesthetics
- Cyan accents for high-tech feel
- Color-coded alerts for quick status recognition
- Minimal, focused information display
- Responsive grid layout for all devices

**Compliance Integration:**
- IMCA M109: Real-time monitoring ✅
- IMCA M140: Failure prevention ✅
- IMCA M254: Repair procedures ✅
- ISM Code: Audit trail ✅
- NORMAM 101: Equipment standards ✅
