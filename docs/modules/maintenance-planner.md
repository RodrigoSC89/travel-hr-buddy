# maintenance-planner

**Category**: maintenance-planner
**Last Updated**: 2025-10-29

---

## 📝 Descrição

maintenance-planner module

## 🧩 Componentes

### CreateMaintenancePlanDialog

CreateMaintenancePlanDialog component

**Props:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| open | `boolean` | ✅ | - |
| onOpenChange | `(open: boolean) => void` | ✅ | - |
| onSuccess | `() => void` | ✅ | - |

### MMIIntegration

MMIIntegration component

### MaintenanceAlertsPanel

MaintenanceAlertsPanel component

**Props:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| open | `boolean` | ✅ | - |
| onOpenChange | `(open: boolean) => void` | ✅ | - |

### MaintenanceCalendarView

MaintenanceCalendarView component

### MaintenanceTasksTable

MaintenanceTasksTable component

**Props:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| onRefresh | `() => void` | ✅ | - |

### MaintenanceTimelineView

MaintenanceTimelineView component

## 📦 Dependências

**Externas:**

- `react`
- `lucide-react`

## 📁 Estrutura de Dados

```
maintenance-planner/
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