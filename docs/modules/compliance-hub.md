# Compliance Hub Module

## Visão Geral

O Compliance Hub centraliza todas as funcionalidades relacionadas a conformidade regulatória, auditorias IMCA, SGSO (Sistema de Gestão de Segurança Operacional), e métricas de risco.

**Categoria**: Core / Compliance  
**Rota**: `/compliance`  
**Status**: Ativo  
**Versão**: 2.5

## Componentes Principais

### ComplianceOverview
- Status geral de compliance
- Próximas auditorias e deadlines
- Não conformidades abertas
- Score de compliance consolidado

### AuditManager
- Gerenciamento de auditorias IMCA
- Checklist de auditoria
- Comentários e observações
- Plano de ação corretiva

### SGSOPanel
- Sistema de Gestão de Segurança Operacional
- Indicadores de performance
- Análise de incidentes
- Ações preventivas e corretivas

### RiskMetrics
- Métricas de risco em tempo real
- Heatmap de riscos
- Análise de tendências
- Alertas de risco crítico

## Banco de Dados Utilizado

### Tabelas Principais
- `auditorias_imca` - Auditorias IMCA
- `auditoria_comentarios` - Comentários de auditoria
- `auditoria_resumo` - Resumos e métricas
- `sgso_metrics` - Métricas SGSO
- `sgso_incidents` - Incidentes SGSO
- `risk_metrics` - Métricas de risco
- `compliance_status` - Status de compliance

### Schema Exemplo
```sql
CREATE TABLE auditorias_imca (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id UUID REFERENCES vessels(id),
  audit_date DATE NOT NULL,
  auditor_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  score INTEGER CHECK (score >= 0 AND score <= 100),
  findings_count INTEGER DEFAULT 0,
  critical_findings INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sgso_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  description TEXT,
  vessel_id UUID REFERENCES vessels(id),
  action_plan TEXT,
  status VARCHAR(50) DEFAULT 'open',
  reported_at TIMESTAMP NOT NULL,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Requisições API Envolvidas

### Auditorias IMCA
- **GET /api/auditorias/imca** - Lista auditorias
- **POST /api/auditorias/imca** - Cria nova auditoria
- **GET /api/auditorias/imca/:id** - Detalhes da auditoria
- **PUT /api/auditorias/imca/:id** - Atualiza auditoria
- **GET /api/auditorias/comentarios** - Comentários de auditoria
- **POST /api/auditorias/comentarios** - Adiciona comentário

### SGSO
- **GET /api/admin/sgso/metrics** - Métricas SGSO
- **GET /api/admin/sgso/incidents** - Lista incidentes
- **POST /api/admin/sgso/incidents** - Registra incidente
- **GET /api/admin/sgso/action-plans** - Planos de ação

### Risk Metrics
- **GET /api/auditoria/metricas-risco** - Métricas de risco
- **GET /api/auditoria/alertas** - Alertas de auditoria

### Compliance Status
- **GET /api/compliance/status** - Status geral
- **GET /api/compliance/dashboard** - Dashboard consolidado

## Integrações

- **Fleet Management**: Dados de embarcações para auditoria
- **Crew Management**: Certificações e compliance de tripulação
- **Mission Control**: Análise de risco de missões
- **Logs Center**: Logs de auditoria e compliance
- **Document Hub**: Documentos de compliance

## Recursos de Compliance

### IMCA Standards
- Compliance com padrões IMCA
- Checklist automatizados
- Scoring system
- Geração de relatórios

### SGSO (SMS)
- Safety Management System
- Incident reporting
- Risk assessment
- Corrective actions

### Regulatory Compliance
- ISM Code compliance
- ISPS Code compliance
- MLC compliance
- Flag state requirements

## Alertas e Notificações

- Auditorias vencendo
- Não conformidades críticas
- Certificações expirando
- Métricas de risco elevadas
- Incidentes críticos

## Testes

Localização: 
- `tests/audit.test.tsx`
- `e2e/audit.spec.ts`

## Última Atualização

**Data**: 2025-10-29  
**Versão**: 2.5  
**Features**: IMCA, SGSO, Risk Metrics
