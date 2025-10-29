# Performance

## Descrição

The Performance Dashboard is a comprehensive operational analytics module that provides real-time KPI monitoring, AI-powered insights, and performance tracking for maritime operations. This module integrates with Supabase for data storage and the AI Kernel for intelligent analysis.

## Localização

- **Caminho**: `src/modules/performance`
- **Tipo**: Módulo com UI

## Rotas

- `/admin/performance-analysis`
- `/performance`

## Componentes

- **AlertsSystem**

## Hooks

- `usePerformanceData`

## Banco de Dados

### Tabelas

- `performance_scores`
- `agent_performance_metrics`
- `agent_performance_metrics_`

## Integração

Para usar este módulo:

```typescript
import { /* componentes */ } from '@/modules/performance';
```

## Referências Cruzadas

- [Índice de Módulos](./README.md)
- [Arquitetura do Sistema](../architecture.md)

---
*Documentação gerada automaticamente em 2025-10-29T18:32:24.968Z*
