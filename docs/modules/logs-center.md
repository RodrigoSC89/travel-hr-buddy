# Logs Center Module

## Visão Geral

O Logs Center é o módulo centralizado para visualização, busca e análise de logs de todas as operações do sistema, com capacidades avançadas de filtragem e alertas em tempo real.

**Categoria**: Core  
**Rota**: `/logs-center`  
**Status**: Ativo  
**Versão**: 2.0

## Componentes Principais

### LogViewer
- Visualização em tempo real de logs
- Filtros por tipo, severidade e módulo de origem
- Busca full-text nos logs
- Export para CSV/JSON

### LogFilters
- Filtros por data/hora
- Filtros por severity (info, warning, error, critical)
- Filtros por tipo de log (system, mission, audit, security)
- Filtros por módulo de origem

### LogDetails
- Visualização detalhada de um log específico
- Metadata e context information
- Stack traces para erros
- Related logs (correlação automática)

### AlertsPanel
- Alertas críticos não resolvidos
- Configuração de regras de alerta
- Notificações em tempo real
- Escalação automática

## Banco de Dados Utilizado

### Tabelas Principais
- `system_logs` - Logs gerais do sistema
- `mission_logs` - Logs relacionados a missões
- `audit_logs` - Logs de auditoria e compliance
- `security_logs` - Logs de segurança e acesso
- `log_alerts` - Alertas baseados em logs

### Schema Exemplo
```sql
CREATE TABLE system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(100),
  source_module VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  event_timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_logs_timestamp ON system_logs(event_timestamp DESC);
CREATE INDEX idx_logs_severity ON system_logs(severity);
CREATE INDEX idx_logs_source ON system_logs(source_module);
```

## Requisições API Envolvidas

### GET /api/logs
Lista logs com paginação e filtros
- **Query Params**: 
  - type, severity, source_module
  - start_date, end_date
  - limit (default: 50), offset
  - search (full-text search)
- **Response**: Array de Log objects + pagination metadata
- **Cache**: Sem cache (dados em tempo real)

### GET /api/logs/:id
Retorna detalhes de um log específico
- **Response**: Log object completo com metadata

### POST /api/logs
Cria novo log (usado por outros módulos)
- **Body**: LogCreateInput
- **Response**: Log object criado

### GET /api/logs/alerts
Lista alertas ativos
- **Query Params**: resolved (boolean), severity
- **Response**: Array de Alert objects

### WebSocket: /ws/logs
Stream de logs em tempo real
- **Events**: 
  - new_log: Novo log criado
  - log_updated: Log atualizado
  - new_alert: Novo alerta criado

## Integrações

- **Mission Engine**: Logs de missões
- **Security Module**: Logs de segurança
- **Audit Center**: Logs de auditoria
- **Performance Monitor**: Logs de performance
- **All Modules**: Todos os módulos enviam logs

## Recursos Avançados

### Log Correlation
- Agrupa logs relacionados automaticamente
- Identifica padrões e anomalias
- Rastreamento distribuído (distributed tracing)

### Alerting Rules
- Regras configuráveis de alerta
- Threshold-based alerts
- Pattern matching
- Rate-based alerting

### Log Retention
- Retention policy configurável (padrão: 90 dias)
- Archive para cold storage
- Compliance com regulamentações

## Testes

Localização: `tests/patch-408-logs-center.test.tsx`

## Última Atualização

**Data**: 2025-10-29  
**Versão**: 2.0  
**Patch**: PATCH 408
