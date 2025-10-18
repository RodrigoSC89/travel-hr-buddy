# SGSO History Panel - Visual Guide & Quick Reference

## 🎯 Quick Access

**Admin Page URL:** `/admin/sgso/history/{vesselId}`  
**API Endpoint:** `/api/sgso/history/{vesselId}`

## 📊 Database Schema

### sgso_action_plans Table
```
┌─────────────────────┬──────────────────────┬─────────────────────────────────┐
│ Column              │ Type                 │ Description                     │
├─────────────────────┼──────────────────────┼─────────────────────────────────┤
│ id                  │ UUID                 │ Primary key                     │
│ vessel_id           │ UUID (FK)            │ → vessels(id)                   │
│ incident_id         │ TEXT (FK)            │ → dp_incidents(id)              │
│ corrective_action   │ TEXT                 │ Ação corretiva                  │
│ preventive_action   │ TEXT                 │ Ação preventiva                 │
│ recommendation      │ TEXT                 │ Recomendação (IA/manual)        │
│ status              │ TEXT                 │ aberto/em_andamento/resolvido   │
│ approved_by         │ TEXT                 │ Nome do aprovador               │
│ approved_at         │ TIMESTAMP            │ Data/hora da aprovação          │
│ created_at          │ TIMESTAMP            │ Data/hora de criação            │
│ updated_at          │ TIMESTAMP            │ Última atualização              │
└─────────────────────┴──────────────────────┴─────────────────────────────────┘
```

### dp_incidents (New Fields)
```
┌─────────────────────┬──────────────────────┬─────────────────────────────────┐
│ Column              │ Type                 │ Description                     │
├─────────────────────┼──────────────────────┼─────────────────────────────────┤
│ description         │ TEXT                 │ Descrição detalhada             │
│ sgso_category       │ TEXT                 │ Categoria SGSO                  │
│ sgso_risk_level     │ TEXT                 │ Nível de risco                  │
│ updated_at          │ TIMESTAMP            │ Última atualização              │
└─────────────────────┴──────────────────────┴─────────────────────────────────┘
```

## 🎨 UI Components

### Status Badges
```
┌──────────────────────────────────────────────────────────────┐
│  Aberto          🔴 bg-red-500                               │
│  Em Andamento    🟡 bg-yellow-500                            │
│  Resolvido       🟢 bg-green-600                             │
└──────────────────────────────────────────────────────────────┘
```

### Table Structure
```
┌────────┬─────────────┬───────────┬────────┬──────────────┬─────────┬──────────┬────────┐
│ Data   │ Incidente   │ Categoria │ Risco  │ Plano Ação   │ Status  │ Aprovador│ Ações  │
├────────┼─────────────┼───────────┼────────┼──────────────┼─────────┼──────────┼────────┤
│ 09/10  │ Thruster    │ Equipam.  │ Alto   │ Ver detalhes │ 🟡 Em   │ João     │ ✏️ Edi│
│        │ Failure     │           │        │              │ Andamen │ Silva    │ tar    │
│        │             │           │        │              │ to      │          │        │
├────────┼─────────────┼───────────┼────────┼──────────────┼─────────┼──────────┼────────┤
│ 07/10  │ Sensor      │ Sistema   │ Médio  │ Ver detalhes │ 🟢 Resol│ Maria    │ ✏️ Edi│
│        │ Malfunction │           │        │              │ vido    │ Santos   │ tar    │
└────────┴─────────────┴───────────┴────────┴──────────────┴─────────┴──────────┴────────┘
```

### Expandable Details
```
┌──────────────────────────────────────────────────────────────┐
│ ▼ Ver detalhes                                               │
│                                                              │
│   ✅ Correção: Realizar manutenção no thruster              │
│   🔁 Prevenção: Implementar checklist preventivo            │
│   🧠 Recomendação: Aumentar frequência de inspeções         │
└──────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

```
┌─────────────┐
│  Browser    │
│  Request    │
└──────┬──────┘
       │
       │ GET /admin/sgso/history/{vesselId}
       │
       ▼
┌─────────────────┐
│  React Page     │
│  [vesselId].tsx │
└──────┬──────────┘
       │
       │ fetch(/api/sgso/history/{vesselId})
       │
       ▼
┌─────────────────┐
│  API Endpoint   │
│  [vesselId].ts  │
└──────┬──────────┘
       │
       │ Supabase Query
       │
       ▼
┌─────────────────────────────────────────┐
│  PostgreSQL Database                    │
│                                         │
│  SELECT * FROM sgso_action_plans        │
│    JOIN dp_incidents                    │
│    WHERE vessel_id = {vesselId}         │
│    ORDER BY created_at DESC             │
└──────┬──────────────────────────────────┘
       │
       │ JSON Response
       │
       ▼
┌─────────────────┐
│ SGSOHistoryTable│
│   Component     │
└─────────────────┘
```

## 📝 API Response Example

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "vessel_id": "123e4567-e89b-12d3-a456-426614174000",
    "incident_id": "imca-2025-014",
    "corrective_action": "Realizar manutenção no thruster",
    "preventive_action": "Implementar checklist preventivo",
    "recommendation": "Aumentar frequência de inspeções",
    "status": "em_andamento",
    "approved_by": "João Silva - Gerente QSMS",
    "approved_at": "2025-10-15T10:00:00.000Z",
    "created_at": "2025-10-10T08:00:00.000Z",
    "updated_at": "2025-10-15T10:00:00.000Z",
    "dp_incidents": {
      "description": "Falha no thruster principal durante operação",
      "updated_at": "2025-10-10T09:00:00.000Z",
      "sgso_category": "Equipamento",
      "sgso_risk_level": "Alto",
      "title": "Thruster Failure",
      "date": "2025-10-09"
    }
  }
]
```

## 🚀 Usage Examples

### Navigate to History Page (React)
```typescript
import { useNavigate } from 'react-router-dom';

function VesselList() {
  const navigate = useNavigate();
  
  const viewHistory = (vesselId: string) => {
    navigate(`/admin/sgso/history/${vesselId}`);
  };
  
  return (
    <button onClick={() => viewHistory("vessel-uuid-here")}>
      View History
    </button>
  );
}
```

### Fetch Data (API)
```typescript
async function fetchActionPlans(vesselId: string) {
  const response = await fetch(`/api/sgso/history/${vesselId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch action plans');
  }
  
  const plans = await response.json();
  return plans;
}
```

### Use Component
```typescript
import { SGSOHistoryTable } from '@/components/sgso';

function MyPage() {
  const [plans, setPlans] = useState([]);
  
  const handleEdit = (planId: string) => {
    console.log('Edit plan:', planId);
    // Implement edit logic
  };
  
  return (
    <SGSOHistoryTable 
      plans={plans} 
      onEdit={handleEdit}
    />
  );
}
```

## 🎯 Status Workflow

```
   ┌─────────┐
   │ Aberto  │ ← Initial state when action plan created
   └────┬────┘
        │
        │ Start working
        ▼
┌───────────────┐
│ Em Andamento  │ ← Work in progress
└──────┬────────┘
       │
       │ Complete and approve
       ▼
  ┌──────────┐
  │ Resolvido│ ← Final state
  └──────────┘
```

## 📋 Checklist for Implementation

- [x] Database migration created
- [x] API endpoint implemented
- [x] React component created
- [x] Admin page created
- [x] Route added to App.tsx
- [x] Component exported
- [x] API tests written
- [x] Component tests written
- [x] All tests passing
- [x] Build successful
- [x] Documentation created

## 🔐 Security & Compliance

### Row Level Security (RLS)
```sql
-- Users must be authenticated to read
CREATE POLICY "Allow read access to authenticated users"
  ON sgso_action_plans FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users must be authenticated to insert
CREATE POLICY "Allow insert access to authenticated users"
  ON sgso_action_plans FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users must be authenticated to update
CREATE POLICY "Allow update access to authenticated users"
  ON sgso_action_plans FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

### Audit Trail Fields
- `created_at` - When action plan was created
- `updated_at` - Last modification timestamp
- `approved_at` - When approval was given
- `approved_by` - Who approved the plan

## 🎓 Benefits

### Operacional
✅ Rastreabilidade completa por incidente  
✅ Acompanhamento do ciclo de correção  
✅ Histórico de ações tomadas  

### Compliance
✅ Conformidade com QSMS  
✅ Documentação para auditorias IBAMA/IMCA  
✅ Trilha de aprovações documentada  

### Técnico
✅ TypeScript para type safety  
✅ Testes automatizados (141 casos)  
✅ Performance otimizada com índices  

## 📞 Support

For questions or issues:
- Check the main documentation: `SGSO_HISTORY_PANEL_IMPLEMENTATION.md`
- Review test files for usage examples
- Check API response format above

## 🔄 Version History

**v1.0.0** - Initial Implementation
- Database schema created
- API endpoint implemented  
- UI components created
- Tests added (141 test cases)
- Documentation completed
