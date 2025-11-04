# Module: maintenance-planner

## 📌 Objetivo
Gerenciar de forma inteligente as manutenções **preventivas**, **corretivas** e **preditivas** de sistemas, equipamentos e sensores embarcados no Nautilus One.

## Status

- **Active**: ✅ Yes
- **Components**: 3 Pages + Dashboard
- **Has Tests**: ✅ Yes (Playwright)
- **Has Documentation**: ✅ Yes
- **AI Integration**: ✅ Yes
- **LLM Prompts**: ✅ Registered

## 🧩 Funcionalidades
- Agendamento automático por tempo, uso ou sensor
- Geração de ordens de serviço (OS)
- Painel de criticidade e KPIs
- Histórico de manutenção por ativo
- Integração com sensores (MQTT) e alertas
- Diagnóstico por IA (via ONNX ou API externa)
- Exportação em PDF dos relatórios de manutenção

## 🗃️ Tabelas Supabase
- `maintenance_jobs` - Ordens de serviço
- `equipment` - Equipamentos e ativos
- `sensor_logs` - Dados de sensores
- `maintenance_reports` - Relatórios de manutenção
- `alerts` - Alertas automáticos

## 🔗 Integrações
- **MQTT**: Recebimento de alertas e dados de falhas
- **Supabase**: Realtime + Edge Functions
- **System Watchdog**: Para eventos críticos
- **LLM**: Classificação automática de falhas

## 🖥️ UI Pages
- `/maintenance/planner` - Planejamento de manutenções
- `/maintenance/history` - Histórico de manutenções
- `/maintenance/analytics` - Analytics e KPIs

## 🤖 LLM Prompts

### Activation Prompt
```
"Ative o módulo de planejamento de manutenção. Desejo registrar manutenções preventivas e corretivas, receber sugestões baseadas em sensores e acessar histórico completo de falhas."
```

### Query Prompts
- "Quais manutenções estão vencidas?"
- "Mostre o histórico de manutenção do equipamento X"
- "Qual equipamento precisa de atenção urgente?"
- "Gere relatório de manutenções do último mês"
- "Sugira ações preventivas baseadas nos sensores"

## Usage

```typescript
// Navigate to maintenance planner
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/maintenance/planner');
```

## Database Integration

### maintenance_jobs Table
```typescript
{
  id: UUID
  equipment_id: UUID
  maintenance_type: string       // 'preventive', 'corrective', 'predictive'
  priority: string               // 'critical', 'high', 'medium', 'low'
  status: string                 // 'scheduled', 'in_progress', 'completed', 'overdue'
  scheduled_date: timestamp
  description: text
  assigned_to: UUID
  estimated_duration: integer
  cost_estimate: decimal
  created_at: timestamp
  updated_at: timestamp
}
```

## Testing

Test file: `tests/maintenance.spec.ts`

```bash
npm run test:e2e -- tests/maintenance.spec.ts
```

## 📈 KPIs Tracked

1. **MTBF** (Mean Time Between Failures)
2. **MTTR** (Mean Time To Repair)
3. **Maintenance Completion Rate**
4. **Planned vs Unplanned Maintenance Ratio**
5. **Cost per Equipment**
6. **Equipment Availability**

## Contributing

When contributing to this module:

1. Follow the existing code structure
2. Add tests for new features
3. Update this documentation
4. Ensure TypeScript compilation passes

---

*Generated on: 2025-11-04T22:18:00.000Z*
*Generator: PATCH 650 - Maintenance Planner Implementation*
*Version: 1.0*
