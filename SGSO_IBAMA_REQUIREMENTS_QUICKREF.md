# SGSO IBAMA Requirements - Quick Reference

## 🚀 Quick Start

### Import and Use

```typescript
import { 
  getAllIbamaRequirements,
  getIbamaRequirementByNumber,
  searchIbamaRequirements 
} from '@/services/sgso-ibama-service';

import type { SGSOIbamaRequirement } from '@/types/sgso-ibama';
```

## 📋 The 17 Requirements

| # | Title | Focus |
|---|-------|-------|
| 1 | Política de SMS | Management policy |
| 2 | Planejamento Operacional | Operational planning |
| 3 | Treinamento e Capacitação | Training programs |
| 4 | Comunicação e Acesso à Informação | Communication |
| 5 | Gestão de Riscos | Risk management |
| 6 | Equipamentos Críticos | Critical equipment |
| 7 | Procedimentos de Emergência | Emergency procedures |
| 8 | Manutenção Preventiva | Preventive maintenance |
| 9 | Inspeções e Verificações | Inspections |
| 10 | Auditorias Internas | Internal audits |
| 11 | Gestão de Mudanças | Change management |
| 12 | Registro de Incidentes | Incident records |
| 13 | Análise de Causa Raiz | Root cause analysis |
| 14 | Monitoramento de Desempenho | Performance monitoring |
| 15 | Análise Crítica pela Direção | Management review |
| 16 | Melhoria Contínua | Continuous improvement |
| 17 | Conformidade Legal e Regulatória | Legal compliance |

## 🔧 Common Operations

### Get All Requirements
```typescript
const requirements = await getAllIbamaRequirements();
// Returns array of 17 requirements
```

### Get Specific Requirement
```typescript
const req = await getIbamaRequirementByNumber(5);
// Returns requirement #5 (Gestão de Riscos)
```

### Search Requirements
```typescript
const results = await searchIbamaRequirements('auditoria');
// Searches in title and description
```

### Get Summary
```typescript
const summary = await getIbamaRequirementsSummary();
// Returns: { total_requirements: 17, categories: {...} }
```

### Export as JSON
```typescript
const json = await exportIbamaRequirementsAsJSON();
// Returns formatted JSON string
```

## 📊 Categories

```typescript
const categories = {
  management: [1, 11, 15, 16, 17],        // 5 requirements
  risk_safety: [5, 7, 9, 12, 13, 14],     // 6 requirements
  operations: [2, 6, 8],                   // 3 requirements
  training_communication: [3, 4],          // 2 requirements
  auditing: [10]                           // 1 requirement
};
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `supabase/migrations/20251018190000_create_sgso_ibama_requirements.sql` | Database table & data |
| `src/types/sgso-ibama.ts` | TypeScript types |
| `src/services/sgso-ibama-service.ts` | Service layer |
| `src/tests/sgso-ibama-service.test.ts` | Tests (29 passing) |

## 🎨 React Component Example

```typescript
import { useEffect, useState } from 'react';
import { getAllIbamaRequirements } from '@/services/sgso-ibama-service';
import type { SGSOIbamaRequirement } from '@/types/sgso-ibama';

export function RequirementsList() {
  const [requirements, setRequirements] = useState<SGSOIbamaRequirement[]>([]);

  useEffect(() => {
    getAllIbamaRequirements().then(setRequirements);
  }, []);

  return (
    <div>
      {requirements.map(req => (
        <div key={req.id}>
          <strong>{req.requirement_number}. {req.requirement_title}</strong>
          <p>{req.description}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🔐 Security

- ✅ Row Level Security (RLS) enabled
- ✅ Read-only for authenticated users
- ✅ No direct modification allowed
- ✅ System-managed data

## 🧪 Testing

```bash
# Run tests
npm test -- src/tests/sgso-ibama-service.test.ts

# Expected: ✅ 29/29 tests passing
```

## 📊 Database Query Examples

### Direct Supabase Query
```typescript
const { data } = await supabase
  .from('sgso_ibama_requirements')
  .select('*')
  .order('requirement_number');
```

### Get Single Requirement
```typescript
const { data } = await supabase
  .from('sgso_ibama_requirements')
  .select('*')
  .eq('requirement_number', 10)
  .single();
```

### Search
```typescript
const { data } = await supabase
  .from('sgso_ibama_requirements')
  .select('*')
  .or('requirement_title.ilike.%gestão%,description.ilike.%gestão%');
```

## 🎯 Use Cases

1. **Compliance Dashboard**: Display all requirements with status
2. **Checklist UI**: Interactive compliance verification
3. **AI Explainer**: Generate detailed explanations
4. **Audit Reports**: Export requirements for inspections
5. **Training Materials**: Use as educational content
6. **Gap Analysis**: Compare against current practices

## 🚀 Quick Commands

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build project
npm run build

# Check types
npx tsc --noEmit
```

## 📞 Related Tables

- `sgso_practices` - 17 ANP practices
- `safety_incidents` - Incident tracking
- `sgso_audits` - Audit management
- `non_conformities` - Compliance issues

## 💡 Tips

1. **Use TypeScript types** for type safety
2. **Cache requirements** in state - they don't change
3. **Group by category** for better UX
4. **Add search/filter** for large lists
5. **Link to evidence** when tracking compliance
6. **Integrate with AI** for explanations

## ✅ Checklist

- [x] Database migration applied
- [x] Types defined
- [x] Service layer created
- [x] Tests passing (29/29)
- [x] Documentation complete
- [ ] UI components created (future)
- [ ] Compliance tracking added (future)
- [ ] AI integration added (future)

## 📚 Resources

- IBAMA Official Guidelines
- ANP Resolution 43/2007
- Maritime Safety Management (SMS)
- ISM Code

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: October 18, 2025
