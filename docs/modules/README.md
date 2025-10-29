# Travel HR Buddy - Módulos do Sistema

## Índice de Módulos Documentados

Este diretório contém a documentação técnica detalhada dos 20 principais módulos operacionais do sistema Travel HR Buddy.

## Módulos Core (5)

### [Dashboard](./dashboard.md)
Módulo central com visão consolidada de todas as operações, métricas e status do sistema em tempo real.
- **Rota**: `/` ou `/dashboard`
- **Status**: Ativo
- **Features**: Real-time metrics, Quick actions, Activity feed

### [Logs Center](./logs-center.md)
Módulo centralizado para visualização, busca e análise de logs de todas as operações do sistema.
- **Rota**: `/logs-center`
- **Status**: Ativo
- **Features**: Real-time logs, Advanced filtering, Alerts

### [Compliance Hub](./compliance-hub.md)
Centraliza funcionalidades de conformidade regulatória, auditorias IMCA, SGSO e métricas de risco.
- **Rota**: `/compliance`
- **Status**: Ativo
- **Features**: IMCA audits, SGSO, Risk metrics

### [Mission Control](./mission-control.md)
Módulo unificado para planejamento, execução e monitoramento de missões operacionais com IA.
- **Rota**: `/mission-control` ou `/mission-engine`
- **Status**: Ativo
- **Features**: Mission planning, AI coordination, Tactical execution

### [Fleet Management](./fleet.md)
Gerenciamento completo de embarcações, incluindo tracking, manutenção, performance e operações.
- **Rota**: `/fleet`
- **Status**: Ativo
- **Features**: Real-time tracking, Maintenance, AIS integration

---

## Módulos de IA (5)

### [AI Coordination](./ai-coordination.md)
Orquestração de inteligência artificial que coordena múltiplos agentes AI e otimiza recursos.
- **Rota**: `/coordination-ai`
- **Status**: Ativo
- **Features**: Multi-agent orchestration, Task distribution, ML models

### [Deep Risk AI](./deep-risk-ai.md)
Análise preditiva de riscos usando machine learning e deep learning para operações marítimas.
- **Rota**: `/deep-risk-ai`
- **Status**: Ativo
- **Features**: Anomaly detection, Predictive analytics, Risk mitigation

### [Sonar AI](./sonar-ai.md)
Análise inteligente de dados de sonar submarino com detecção e classificação de objetos.
- **Rota**: `/sonar-ai`
- **Status**: Ativo (v448)
- **Features**: Object detection, Pattern recognition, AI classification

### [Navigation Copilot](./navigation-copilot.md)
Assistente de navegação com IA integrando dados meteorológicos e rotas otimizadas.
- **Rota**: `/navigation-copilot`
- **Status**: Ativo (v447)
- **Features**: AI optimization, Weather integration, Safety advisor

### [Vault AI](./vault-ai.md)
Armazenamento seguro e inteligente de documentos com análise AI e controle de acesso.
- **Rota**: `/vault_ai`
- **Status**: Ativo
- **Features**: AI classification, Secure storage, Smart search

---

## Módulos Operacionais (5)

### [Crew Management](./crew-management.md)
Gestão completa de tripulação, certificações, rotações, performance e compliance.
- **Rota**: `/crew-management`
- **Status**: Ativo (v446 - consolidado)
- **Features**: Certification tracking, Rotations, Performance

### [Finance Hub](./finance-hub.md)
Gestão financeira completa com controle de custos, budgets, faturamento e análise.
- **Rota**: `/finance-hub`
- **Status**: Ativo (v192)
- **Features**: Real-time data, Multi-currency, Forecasting

### [Templates](./templates.md)
Gerenciamento de templates de documentos com recursos de IA para geração e personalização.
- **Rota**: `/templates`
- **Status**: Ativo
- **Features**: AI generation, Smart variables, Multiple formats

### [Incident Reports](./incident-reports.md)
Registro e gestão de incidentes operacionais com investigação e análise de tendências.
- **Rota**: `/incident-reports`
- **Status**: Ativo
- **Features**: Investigation workflow, Analytics, Compliance

### [System Watchdog](./system-watchdog.md)
Monitoramento de saúde do sistema com observabilidade, alertas e diagnósticos automatizados.
- **Rota**: `/system-watchdog`
- **Status**: Ativo
- **Features**: Health monitoring, Auto-diagnostics, SLA tracking

---

## Módulos Especializados (5)

### [Underwater Drone](./underwater-drone.md)
Controle de ROVs e AUVs com planejamento de missões e telemetria.
- **Rota**: `/underwater-drone`
- **Status**: Ativo (v450)
- **Features**: ROV/AUV control, Mission planning, Telemetry

### [Drone Commander](./drone-commander.md)
Controle e coordenação de frotas de drones aéreos para inspeção e vigilância.
- **Rota**: `/drone-commander`
- **Status**: Ativo
- **Features**: Fleet control, Flight planning, Video streaming

### [Route Planner](./route-planner.md)
Planejamento avançado de rotas marítimas com ETA dinâmico e integração meteorológica.
- **Rota**: `/route-planner`
- **Status**: Ativo (v449)
- **Features**: Dynamic ETA, Weather integration, Optimization

### [Weather Dashboard](./weather-dashboard.md)
Dados meteorológicos em tempo real, previsões e alertas para operações marítimas.
- **Rota**: `/weather-dashboard`
- **Status**: Ativo
- **Features**: Real-time data, Marine forecast, Alerts

### [Price Alerts](./price-alerts.md)
Monitoramento de preços de commodities e combustível com análise de tendências.
- **Rota**: `/price-alerts`
- **Status**: Ativo
- **Features**: Price tracking, Smart alerts, Trend analysis

---

## Estrutura da Documentação

Cada módulo documentado contém:

- **Visão Geral**: Descrição, categoria, rota e status
- **Componentes Principais**: Componentes UI e funcionalidades
- **Banco de Dados Utilizado**: Schemas e estruturas de dados
- **Requisições API Envolvidas**: Endpoints e suas especificações
- **Integrações**: Módulos e serviços integrados
- **Recursos Avançados**: Features específicas e diferenciais
- **Testes**: Localização dos testes automatizados
- **Última Atualização**: Data e versão

## Como Usar Esta Documentação

1. **Desenvolvimento**: Use como referência para entender a arquitetura de cada módulo
2. **Integração**: Consulte as APIs e integrações disponíveis
3. **Manutenção**: Identifique componentes e dependências
4. **Testes**: Localize testes existentes e padrões
5. **Onboarding**: Material para novos desenvolvedores

## Convenções

- **Rota**: URL path do módulo na aplicação
- **Status**: `Ativo`, `Deprecated`, `Em Desenvolvimento`
- **Versão**: Número da versão ou PATCH relacionado
- **Features**: Principais funcionalidades do módulo

## Documentação Relacionada

- [Module Map](../MODULE_MAP.md) - Mapa completo de módulos
- [API Reference](../API-REFERENCE.md) - Documentação de APIs
- [Integration Guide](../INTEGRATION-GUIDE.md) - Guia de integrações
- [Best Practices](../BEST-PRACTICES.md) - Melhores práticas

---

**Última Atualização**: 2025-10-29  
**Total de Módulos Documentados**: 20  
**Categorias**: Core (5), AI (5), Operations (5), Specialized (5)  
**PATCH**: 497 - Documentação Técnica Base
