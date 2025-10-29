# Crew

## Descrição

PATCH 466: Consolidated Crew Management Module

## Localização

- **Caminho**: `src/modules/crew`
- **Tipo**: Módulo com UI

## Rotas

- `/crew-dossier`
- `/hr/crew`
- `/admin/crew/consolidation-validation`
- `/admin/crew-consolidation/validation`
- `/crew-wellbeing`
- `/crew-management`
- `/crew`
- `/admin/crew-consolidation/validation`

## Componentes

- **ConsentScreen**
- **CrewCertifications**
- **CrewMembers**
- **CrewOverview**
- **CrewPerformance**
- **CrewRotations**
- **SyncStatus**

## Hooks

- `useSync`

## Banco de Dados

### Tabelas

- `crew_members`
- `crew_assignments`
- `crew_rotations`
- `crew_rotation_logs`
- `crew_messages`
- `crew_voice_messages`
- `crew_health_records`
- `crew_health_metrics`

## Integração

Para usar este módulo:

```typescript
import { /* componentes */ } from '@/modules/crew';
```

## Referências Cruzadas

- [Índice de Módulos](./README.md)
- [Arquitetura do Sistema](../architecture.md)

---
*Documentação gerada automaticamente em 2025-10-29T18:32:24.834Z*
