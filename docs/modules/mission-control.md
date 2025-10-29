# mission-control

**Category**: mission-control
**Last Updated**: 2025-10-29

---

## 📝 Descrição

## 📋 Overview

## 🧩 Componentes

### AICommander

AICommander component

### KPIDashboard

KPIDashboard component

**Props:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| modules | `ModuleStatus[]` | ✅ | - |

### MissionControlConsolidation

MissionControlConsolidation component

### MissionExecution

MissionExecution component

**Props:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| missions | `Mission[]` | ✅ | - |
| tasks | `MissionTask[]` | ✅ | - |
| onRefresh | `() => void` | ✅ | - |

### MissionLogs

MissionLogs component

**Props:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| logs | `MissionLog[]` | ✅ | - |
| onRefresh | `() => void` | ✅ | - |

### MissionManager

MissionManager component

### MissionPlanner

MissionPlanner component

### MissionPlanning

MissionPlanning component

**Props:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| missions | `Mission[]` | ✅ | - |
| onRefresh | `() => void` | ✅ | - |

### RealTimeMissionDashboard

RealTimeMissionDashboard component

### SystemLogs

SystemLogs component

## 📐 Tipos TypeScript

### Mission

```typescript
export interface Mission {
  id: string;
  code: string;
  name: string;
  type: "operation" | "maintenance" | "inspection" | "emergency" | "training";
  status: "planned" | "in-progress" | "completed" | "cancelled" | "paused";
  priority: "low" | "medium" | "high" | "critical";
  description: string;
  objectives: string[];
  startDate: string;
  endDate: string;
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  metadata: Record<string, any>;
}
```

### MissionTask

```typescript
export interface MissionTask {
  id: string;
  missionId: string;
  name: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  priority: "low" | "medium" | "high";
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
  metadata: Record<string, any>;
}
```

### MissionLog

```typescript
export interface MissionLog {
  id: string;
  missionId: string;
  eventType: string;
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  timestamp: string;
  metadata: Record<string, any>;
}
```

## 📦 Dependências

**Externas:**

- `react`

## 📁 Estrutura de Dados

```
mission-control/
├── components/       # Componentes React
├── hooks/            # Custom hooks
├── services/         # Lógica de negócio e API
├── types/            # Definições TypeScript
├── validation/       # Validações
└── index.tsx         # Exportação principal
```

---

**Gerado automaticamente por**: `scripts/generateModuleDocs.ts`  
**Data**: 10/29/2025, 6:06:24 PM