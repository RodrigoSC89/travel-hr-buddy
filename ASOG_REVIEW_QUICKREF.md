# 🚢 ASOG Review Module - Quick Reference

## 🎯 What is ASOG Review?

**ASOG** (Activity Specific Operating Guidelines) Review is a maritime safety module that audits Dynamic Positioning (DP) vessel operations to ensure compliance with operational guidelines.

---

## 🚀 Quick Start

### Access the Module
```
URL: /asog-review
```

### Execute Review
1. Click **"Executar ASOG Review"**
2. View operational status
3. Check conformance results
4. Download report if needed

---

## 📊 ASOG Limits

| Parameter | Limit | Description |
|-----------|-------|-------------|
| **Wind Speed** | 35 knots | Maximum allowed wind speed |
| **Thruster Loss** | 1 unit | Maximum thrusters allowed to be inoperative |
| **DP Status** | Green | Required DP alert level |

---

## ✅ Conformance Validation

The module checks three critical parameters:

### 1. Wind Speed
```
✅ Conforme: wind_speed ≤ 35 knots
❌ Não Conforme: wind_speed > 35 knots
```

### 2. Thruster Status
```
✅ Conforme: (4 - thrusters_operacionais) ≤ 1
❌ Não Conforme: (4 - thrusters_operacionais) > 1
```

### 3. DP Alert Level
```
✅ Conforme: dp_status = "Green"
❌ Não Conforme: dp_status ≠ "Green"
```

---

## 📄 Report Structure

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

---

## 🎨 UI Features

### Control Panel
- ▶️ **Execute Review** - Run ASOG compliance check
- 💾 **Download Report** - Export JSON report
- 🔄 **Reset** - Clear current data

### Data Display
- 📊 **ASOG Limits** - Configured operational limits
- 📈 **Operational Data** - Real-time status display
- ✅/❌ **Validation Results** - Conformance status with alerts
- 📝 **JSON Preview** - Report visualization

---

## 🔔 Alert Types

| Alert | Triggered When |
|-------|----------------|
| ⚠️ Velocidade do vento acima do limite ASOG | Wind speed > 35 knots |
| ⚠️ Número de thrusters inoperantes excede limite ASOG | More than 1 thruster inoperative |
| ⚠️ Sistema DP fora do nível de alerta ASOG | DP status is not "Green" |

---

## 🛠️ Technical Implementation

### Files Created
```
src/modules/asog-review/
├── types.ts              # Type definitions
├── asogService.ts        # Core service logic
└── README.md             # Module docs

src/pages/
└── ASOGReview.tsx        # Main UI component
```

### Route
```typescript
/asog-review → <ASOGReview />
```

### Service Usage
```typescript
import { asogService } from "@/modules/asog-review/asogService";

// Execute complete workflow
const { dados, resultado, relatorio } = asogService.start();

// Download report
asogService.downloadRelatorio(relatorio);

// Update limits
asogService.atualizarLimites({ wind_speed_max: 40 });
```

---

## 📱 Module Badges

- 🛡️ **Compliance ASOG**
- 🌬️ **Monitoramento Ambiental**
- ⚙️ **Status de Thrusters**
- 🎯 **Validação Automática**

---

## 🔗 Related Modules

- **PEO-DP** (`/peo-dp`) - Dynamic Positioning Plan
- **DP Intelligence** (`/dp-intelligence`) - DP monitoring
- **DP Incidents** (`/dp-incidents`) - Incident tracking
- **SGSO** (`/sgso`) - Safety management

---

## 🎯 Example Scenarios

### Scenario 1: All Systems Normal ✅
```
Wind: 28 knots
Thrusters: 3/4 operational
DP Status: Green
Result: ✅ CONFORME
```

### Scenario 2: High Wind ❌
```
Wind: 40 knots (exceeds 35)
Thrusters: 3/4 operational
DP Status: Green
Result: ❌ NÃO CONFORME
Alert: "Velocidade do vento acima do limite ASOG"
```

### Scenario 3: Multiple Thruster Loss ❌
```
Wind: 30 knots
Thrusters: 1/4 operational (3 lost)
DP Status: Green
Result: ❌ NÃO CONFORME
Alert: "Número de thrusters inoperantes excede limite ASOG"
```

---

## 📚 Integration

### Logger
```typescript
import { logger } from "@/lib/logger";
logger.info("Status: CONFORME ao ASOG ✅");
logger.warn("Status: NÃO CONFORME ❌", { alertas });
```

### Toast Notifications
```typescript
toast({
  title: "✅ Operação Conforme",
  description: "A operação está dentro dos parâmetros ASOG."
});
```

---

## ✅ Status

**Current Version**: 1.0.0  
**Module Status**: 🟢 Operational  
**Code Quality**: ✅ ESLint Passed  
**Documentation**: ✅ Complete

---

## 🎉 Ready to Use!

The ASOG Review module is fully implemented and integrated into Nautilus One. Navigate to `/asog-review` to start auditing DP operations.

---

**Last Updated**: 2025-10-20  
**Module ID**: asog-review  
**Module #**: 33/33
