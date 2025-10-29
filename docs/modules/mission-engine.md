# Mission engine

## Descrição

**Category**: Operations

## Localização

- **Caminho**: `src/modules/mission-engine`
- **Tipo**: Módulo com UI

## Rotas

- `/admin/mission-engine/validation`
- `/admin/mission-engine-validation/validation`

## Componentes

- **MissionCreator**
- **MissionDashboard**
- **MissionExecutionPanel**
- **MissionExecutor**
- **MissionLogs**

## Serviços

- `execution-service`
- `mission-service`

## Banco de Dados

### Tabelas

- `missions`
- `mission_agents`
- `mission_logs`
- `mission_vessels`
- `mission_coordination_plans`
- `mission_checkpoints`
- `mission_resources`
- `mission_activities`
- `simulated_missions`
- `joint_mission_log`
- `emission_records`
- `emission_targets`
- `mission_timeline`
- `mission_notifications`
- `mission_events`
- `mission_state_history`
- `mission_integrations`
- `satellite_mission_links`
- `underwater_missions`
- `mission_alerts`
- `mission_ai_insights`
- `joint_missions`
- `mission_participants`
- `mission_status_updates`
- `mission_chat`
- `mission_activity_log`

## Integração

Para usar este módulo:

```typescript
import { /* componentes */ } from '@/modules/mission-engine';
```

## Referências Cruzadas

- [Índice de Módulos](./README.md)
- [Arquitetura do Sistema](../architecture.md)

---
*Documentação gerada automaticamente em 2025-10-29T18:32:24.864Z*
