# Module: peo-dp

## 📌 Objetivo
Gerenciar o plano de emergência operacional dinâmico (PEO-DP) para embarcações com DP (Dynamic Positioning).

## Status

- **Active**: ✅ Yes
- **Components**: 3 Pages + Wizard
- **Has Tests**: ✅ Yes (Playwright)
- **Has Documentation**: ✅ Yes
- **AI Integration**: ✅ Yes
- **LLM Prompts**: ✅ Registered

## 🧩 Funcionalidades
- Cadastro e revisão de planos de resposta
- Simulador de cenários (fogo, alagamento, falha de DP)
- Logs de incidentes e treinamentos simulados
- Histórico e versão de planos
- Visualização gráfica do plano embarcado
- IA para sugerir respostas e avaliar conformidade

## 🗃️ Tabelas Supabase
- `peo_dp_plans` - Planos PEO-DP por embarcação
- `peo_dp_simulations` - Simulações e exercícios
- `peo_dp_logs` - Histórico de eventos

## 🔗 Integrações
- **BridgeLink** - Dados do sistema DP
- **System Watchdog** - Eventos reais
- **LLM** - Avaliação e simulação de respostas
- **SGSO** - Integração com sistema de segurança

## 🖥️ UI Pages
- `/safety/peo-dp` - Dashboard principal PEO-DP
- `/safety/peo-dp/simulation` - Simulador de emergências
- `/safety/peo-dp/logs` - Histórico de eventos

## 🔧 Database Schema

### peo_dp_plans Table
```typescript
{
  id: UUID
  vessel_id: UUID
  plan_version: string
  status: string                 // 'active', 'draft', 'archived'
  emergency_scenarios: JSONB     // Array of scenarios
  response_procedures: JSONB
  contact_list: JSONB
  equipment_inventory: JSONB
  training_requirements: JSONB
  last_reviewed: timestamp
  next_review: timestamp
  approved_by: UUID
  approved_at: timestamp
  created_at: timestamp
  updated_at: timestamp
}
```

### peo_dp_simulations Table
```typescript
{
  id: UUID
  plan_id: UUID
  simulation_type: string        // 'fire', 'flooding', 'dp_failure', 'blackout'
  scheduled_date: timestamp
  actual_date: timestamp
  duration: integer              // minutes
  participants: JSONB
  scenario_details: JSONB
  performance_score: decimal
  findings: text
  corrective_actions: text
  ai_evaluation: JSONB
  created_by: UUID
  created_at: timestamp
}
```

## 🚀 Usage Examples

### Create PEO-DP Plan
```typescript
import { supabase } from '@/integrations/supabase/client';

const plan = await supabase
  .from('peo_dp_plans')
  .insert({
    vessel_id: vesselId,
    plan_version: '2.0',
    status: 'draft',
    emergency_scenarios: [
      {
        type: 'dp_failure',
        severity: 'critical',
        response_time: 5  // minutes
      }
    ]
  })
  .select()
  .single();
```

### Schedule Simulation
```typescript
const simulation = await supabase
  .from('peo_dp_simulations')
  .insert({
    plan_id: planId,
    simulation_type: 'fire',
    scheduled_date: '2025-11-20T10:00:00',
    scenario_details: {
      location: 'Engine Room',
      initial_response: 'Activate fire suppression'
    }
  });
```

## 🤖 LLM Prompts

### Activation Prompt
```
"Ative o módulo PEO-DP. Preciso gerenciar planos de emergência para operações com DP, realizar simulações e treinar a equipe."
```

### Query Prompts
- "Gerar plano PEO-DP para emergência X"
- "Quando foi o último exercício de falha de DP?"
- "Avaliar conformidade do plano atual"
- "Sugerir melhorias baseadas em simulações anteriores"
- "Listar treinamentos obrigatórios vencidos"

## 📊 Dashboard Components

### Status Cards
- Plano ativo e versão
- Próxima simulação agendada
- Treinamentos pendentes
- Conformidade IMCA

### Simulador
- Seleção de cenário
- Configuração de parâmetros
- Execução e cronômetro
- Avaliação de performance

### Histórico
- Linha do tempo de eventos
- Resultados de simulações
- Comparativo de performance
- Ações corretivas

## 🔐 Permissions

### Role-Based Access
- **Admin**: Full access
- **Safety Officer**: Manage plans, conduct simulations
- **Master**: Approve plans, review simulations
- **Crew**: Participate in drills, view procedures
- **Viewer**: Read-only access

## 🧪 Testing

Test file: `tests/peo-dp.spec.ts`

```bash
npm run test:e2e -- tests/peo-dp.spec.ts
```

### Test Cases
1. Plan creation and versioning
2. Simulation scheduling
3. Emergency procedure lookup
4. AI evaluation of responses
5. Compliance checking

## 📈 KPIs Tracked

1. **Response Time**: Average emergency response time
2. **Simulation Frequency**: Drills per quarter
3. **Compliance Score**: IMCA M103 compliance
4. **Training Completion**: Crew training status
5. **Performance Score**: Simulation performance average

## 🔄 Integration with Other Modules

- **SGSO**: Safety management system
- **BridgeLink**: DP system status
- **Crew Management**: Training records
- **Documents**: Emergency procedures
- **System Watchdog**: Real-time monitoring

## 🎯 Best Practices

1. Review plans quarterly or after incidents
2. Conduct monthly emergency drills
3. Document all findings and actions
4. Keep emergency contacts updated
5. Use AI insights for continuous improvement
6. Ensure all crew members are trained

## 🔮 Future Enhancements

- [ ] VR-based emergency simulations
- [ ] Integration with vessel sensors
- [ ] Real-time incident detection
- [ ] Multi-language support for international crews
- [ ] Mobile app for field access

## 📞 Support

For PEO-DP module support:
- Review simulation logs
- Check AI evaluation reports
- Contact safety officer

---

*Module: peo-dp*  
*Status: Active*  
*Last Updated: 2025-11-04*  
*Version: 1.0*  
*PATCH: 651*
