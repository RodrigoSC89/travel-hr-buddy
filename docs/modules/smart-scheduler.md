# Smart Scheduler

## Objetivo
Agendar automaticamente inspeções e tarefas com base em risco, histórico e pontuação de conformidade.

## Estrutura de Arquivos
- `SmartSchedulerDashboard.tsx` - Painel principal de visualização
- `CalendarView.tsx` - Visualização de calendário
- `llmTaskEngine.ts` - Motor de tarefas com IA

## Componentes Principais

### SmartSchedulerDashboard
Painel principal que exibe todas as tarefas agendadas, permite criar novas tarefas e visualizar o calendário de eventos.

### CalendarView
Componente de calendário interativo que mostra as tarefas agendadas em uma visualização temporal.

### llmTaskEngine
Motor de IA que analisa dados históricos, conformidade e risco para sugerir agendamentos inteligentes.

## Integrações

### Supabase
- Tabela `scheduled_tasks` - Armazena todas as tarefas agendadas
- Queries com RLS (Row Level Security)
- Sincronização em tempo real

### Módulos Conectados
- **PSC (Port State Control)** - Integração com inspeções portuárias
- **MLC (Maritime Labour Convention)** - Conformidade trabalhista
- **OVID** - Verificação de documentos
- **LSA/FFA (Life Saving Appliances/Fire Fighting Appliances)** - Equipamentos de segurança

### Sistema de Notificações
- Alertas automáticos para tarefas próximas
- Notificações push e email
- Lembretes configuráveis

### Watchdog
- Monitoramento contínuo de tarefas
- Detecção de atrasos
- Alertas de não conformidade

## Funcionalidades

### Agendamento Automático
- Análise de histórico de conformidade
- Priorização por nível de risco
- Sugestões inteligentes baseadas em IA

### Gestão de Tarefas
- Criação manual e automática de tarefas
- Atribuição a embarcações e tripulantes
- Rastreamento de status

### Análise Preditiva
- Identificação de padrões de falha
- Previsão de necessidades de inspeção
- Otimização de recursos

## Status
✅ Produção (desde PATCH 597)

## Roadmap Futuro

### Fase 1 (Q1 2025)
- IA preditiva avançada com aprendizado de máquina
- Análise multi-embarcação para otimização de frota

### Fase 2 (Q2 2025)
- Integração com sistemas externos de manutenção
- API pública para integrações de terceiros

### Fase 3 (Q3 2025)
- Agendamento baseado em condições climáticas
- Otimização de rotas considerando disponibilidade de portos

## Métricas de Sucesso
- Redução de 40% em atrasos de inspeção
- Aumento de 35% na conformidade preventiva
- 90% de precisão nas sugestões de agendamento

## Documentação Técnica
- Ver `/src/modules/smart-scheduler/` para código-fonte
- Ver `/tests/e2e/patch597_scheduler.cy.ts` para testes E2E
- Ver `/tests/unit/llmTaskEngine.test.ts` para testes unitários
