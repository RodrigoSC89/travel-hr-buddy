# crew

**Category**: crew
**Last Updated**: 2025-10-29

---

## 📝 Descrição

crew module

## 🧩 Componentes

### ConsentScreen

ConsentScreen component

**Props:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| userId | `string` | ✅ | - |
| userName | `string` | ✅ | - |
| onConsentGiven | `() => void` | ✅ | - |
| onOptOut | `() => void` | ✅ | - |

### CrewCertifications

CrewCertifications component

### CrewMembers

CrewMembers component

### CrewOverview

CrewOverview component

### CrewPerformance

CrewPerformance component

### CrewRotations

CrewRotations component

### SyncStatus

SyncStatus component

**Props:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| pendingCount | `number` | ✅ | - |
| isSyncing | `boolean` | ✅ | - |
| lastSyncTime | `string | null` | ✅ | - |
| isOnline | `boolean` | ✅ | - |
| onSync | `() => void` | ❌ | - |
| onClear | `() => void` | ❌ | - |

## 🪝 Custom Hooks

- `useSync`

## 📦 Dependências

**Externas:**

- `react`
- `lucide-react`

## 📁 Estrutura de Dados

```
crew/
├── components/       # Componentes React
├── hooks/            # Custom hooks
├── services/         # Lógica de negócio e API
├── types/            # Definições TypeScript
├── validation/       # Validações
└── index.tsx         # Exportação principal
```

---

**Gerado automaticamente por**: `scripts/generateModuleDocs.ts`  
**Data**: 10/29/2025, 7:01:05 PM