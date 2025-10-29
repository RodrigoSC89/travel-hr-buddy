# Incident reports

## Descrição

PATCH 491 - Consolidated Incident Reports Module

## Localização

- **Caminho**: `src/modules/incident-reports`
- **Tipo**: Módulo com UI

## Rotas

- `/admin/incident-reports-v2/validation`
- `/incident-reports`

## Componentes

- **CreateIncidentDialog**
- **IncidentClosure**
- **IncidentDetailDialog**
- **IncidentDetection**
- **IncidentDocumentation**
- **IncidentMetricsDashboard**
- **IncidentReplay**
- **IncidentWorkflow**
- **SignatureDialog**

## Serviços

- `ai-incident-replay`
- `incident-service`
- `incidentReplayService`

## Banco de Dados

### Tabelas

- `dp_incidents`
- `security_incidents`
- `carbon_reports`

## Integração

Para usar este módulo:

```typescript
import { /* componentes */ } from '@/modules/incident-reports';
```

## Referências Cruzadas

- [Índice de Módulos](./README.md)
- [Arquitetura do Sistema](../architecture.md)

---
*Documentação gerada automaticamente em 2025-10-29T18:32:24.946Z*
