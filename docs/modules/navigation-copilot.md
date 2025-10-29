# Navigation copilot

## Descrição

Module for navigation copilot functionality

## Localização

- **Caminho**: `src/modules/navigation-copilot`
- **Tipo**: Módulo com UI

## Rotas

- `/admin/navigation-copilot/validation`
- `/admin/navigation-copilot-v2`
- `/admin/patch-514-navigation-copilot`

## Componentes

- **NavigationCopilotPanel**
- **NavigationMap**

## Serviços

- `enhancedNavigationService`
- `navigationAILogsService`
- `routeSuggestionService`

## Banco de Dados

### Tabelas

- `copilot_sessions`
- `navigation_ai_logs`
- `navigation_weather_alerts`

## Integração

Para usar este módulo:

```typescript
import { /* componentes */ } from '@/modules/navigation-copilot';
```

## Referências Cruzadas

- [Índice de Módulos](./README.md)
- [Arquitetura do Sistema](../architecture.md)

---
*Documentação gerada automaticamente em 2025-10-29T18:32:24.961Z*
