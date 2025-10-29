# emergency

**Category**: emergency
**Last Updated**: 2025-10-29

---

## 📝 Descrição

emergency module

## 🧩 Componentes

### EmergencyContacts

EmergencyContacts component

**Props:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| contacts | `EmergencyContact[]` | ✅ | - |

### IncidentList

IncidentList component

**Props:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| incidents | `EmergencyIncident[]` | ✅ | - |
| onSelectIncident | `(incident: EmergencyIncident) => void` | ✅ | - |

### ResponseProtocol

ResponseProtocol component

**Props:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| emergencyType | `string` | ✅ | - |
| steps | `ProtocolStep[]` | ✅ | - |
| onStepComplete | `(stepId: string) => void` | ✅ | - |

## 📁 Estrutura de Dados

```
emergency/
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