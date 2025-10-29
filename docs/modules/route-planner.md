# Route planner

## Descrição

Route Planner Module - PATCH 431

## Localização

- **Caminho**: `src/modules/route-planner`
- **Tipo**: Módulo com UI

## Rotas

- `/admin/route-planner/validation`

## Componentes

- **RoutePlannerMap**

## Serviços

- `plannedRoutesService`
- `routeAIService`
- `routePlannerService`

## Banco de Dados

### Tabelas

- `routes`
- `route_forecasts`
- `route_consumption`
- `fuel_routes`
- `api_routes`
- `planned_routes`
- `route_optimization_history`

## Integração

Para usar este módulo:

```typescript
import { /* componentes */ } from '@/modules/route-planner';
```

## Referências Cruzadas

- [Índice de Módulos](./README.md)
- [Arquitetura do Sistema](../architecture.md)

---
*Documentação gerada automaticamente em 2025-10-29T18:32:24.982Z*
