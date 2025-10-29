# Dashboard Module

## Visão Geral

O Dashboard é o módulo central do sistema Travel HR Buddy, fornecendo uma visão consolidada de todas as operações, métricas e status do sistema em tempo real.

**Categoria**: Core  
**Rota**: `/` ou `/dashboard`  
**Status**: Ativo  
**Versão**: 2.0

## Componentes Principais

### DashboardGrid
- Layout responsivo com cards de métricas
- Suporte a múltiplos tamanhos de tela (mobile, tablet, desktop)
- Atualização em tempo real via WebSocket

### MetricsCards
- Total de embarcações ativas
- Tripulação embarcada
- Missões em andamento
- Alertas críticos

### QuickActions
- Acesso rápido a funcionalidades frequentes
- Criação de novas missões
- Visualização de relatórios
- Gestão de crew

### RecentActivity
- Feed de atividades recentes
- Histórico de ações importantes
- Notificações do sistema

## Banco de Dados Utilizado

### Tabelas Principais
- `vessels` - Status e informações das embarcações
- `crew_members` - Dados da tripulação
- `missions` - Missões ativas e planejadas
- `system_alerts` - Alertas e notificações
- `activity_logs` - Log de atividades do sistema

### Queries Otimizadas
```sql
-- Dashboard summary query
SELECT 
  (SELECT COUNT(*) FROM vessels WHERE status = 'active') as active_vessels,
  (SELECT COUNT(*) FROM crew_members WHERE onboard = true) as onboard_crew,
  (SELECT COUNT(*) FROM missions WHERE status IN ('active', 'in_progress')) as active_missions,
  (SELECT COUNT(*) FROM system_alerts WHERE severity = 'critical' AND resolved = false) as critical_alerts;
```

## Requisições API Envolvidas

### GET /api/dashboard/summary
Retorna dados consolidados do dashboard
- **Response**: DashboardSummary object
- **Cache**: 30 segundos
- **Rate Limit**: 60/minuto

### GET /api/dashboard/recent-activity
Retorna atividades recentes do sistema
- **Query Params**: limit (default: 10), offset
- **Response**: Array de ActivityLog
- **Real-time**: Via WebSocket em `/ws/activity`

### GET /api/dashboard/metrics
Retorna métricas em tempo real
- **Response**: Metrics object com KPIs
- **Update Frequency**: 10 segundos

## Integrações

- **Fleet Management**: Status de embarcações
- **Crew Management**: Dados de tripulação
- **Mission Control**: Missões ativas
- **Logs Center**: Alertas e notificações
- **Performance Analytics**: Métricas e KPIs

## Recursos de Acessibilidade

- ARIA labels em todos os componentes
- Navegação por teclado completa
- Suporte a leitores de tela
- Contraste WCAG AA compliant
- Textos alternativos em todos os gráficos

## Última Atualização

**Data**: 2025-10-29  
**Versão**: 2.0  
**Autor**: Sistema de Documentação Automática
