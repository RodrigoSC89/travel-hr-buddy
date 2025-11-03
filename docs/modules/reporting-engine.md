# Reporting Engine

## Objetivo
Motor avançado de geração de relatórios com IA, suportando múltiplos formatos, exportação automatizada e análises inteligentes.

## Estrutura de Arquivos
- `ReportingDashboard.tsx` - Painel de gestão de relatórios
- `ReportBuilder.tsx` - Construtor visual de relatórios
- `TemplateEditor.tsx` - Editor de templates
- `reportBuilder.ts` - Motor de construção de relatórios
- `dataAggregator.ts` - Agregador de dados
- `aiInsights.ts` - Insights gerados por IA
- `exportEngine.ts` - Motor de exportação

## Componentes Principais

### ReportingDashboard
Interface central para visualização, criação e gestão de relatórios. Inclui biblioteca de templates e histórico de relatórios gerados.

### ReportBuilder
Construtor visual drag-and-drop para criação de relatórios personalizados sem código.

### TemplateEditor
Editor avançado para criação e customização de templates de relatórios com suporte a variáveis dinâmicas.

### reportBuilder
Core engine que processa dados, aplica templates e gera relatórios em múltiplos formatos.

## Integrações

### Supabase
- Tabela `reports` - Catálogo de relatórios
- Tabela `report_templates` - Templates salvos
- Tabela `report_schedules` - Agendamentos
- Tabela `report_subscriptions` - Assinaturas de usuários
- Tabela `report_exports` - Histórico de exportações

### Módulos Conectados
- **Analytics Core** - Dados analíticos
- **Fleet Manager** - Dados de frota
- **Compliance Hub** - Dados de conformidade
- **Financial Hub** - Dados financeiros
- **Crew Management** - Dados de tripulação
- **Maintenance Planner** - Dados de manutenção
- **Risk Operations** - Dados de risco

### Sistema de Agendamento
- Geração automática periódica
- Envio por email automático
- Integração com calendário

### AI Insights
- Análise automática de tendências
- Detecção de anomalias
- Geração de recomendações
- Narrativa em linguagem natural

## Funcionalidades

### Tipos de Relatórios

#### Operacionais
- Relatório diário de navegação
- Consumo de combustível
- Performance de motores
- Horas de trabalho

#### Compliance e Segurança
- PSC inspection reports
- ISM audit reports
- MLC compliance reports
- Incident reports
- Near-miss reports

#### Financeiros
- Bunker cost analysis
- Port expenses
- Crew costs
- Maintenance costs
- Budget vs. Actual

#### Gestão de Pessoas
- Crew roster reports
- Training completion
- Certification status
- Performance reviews

#### Ambiental
- Emissions reporting
- Ballast water management
- Waste management
- Energy efficiency (EEXI/CII)

### Formatos de Exportação

#### Documentos
- **PDF**: Relatórios formatados prontos para impressão
- **Word**: Documentos editáveis (.docx)
- **Excel**: Planilhas com dados brutos (.xlsx)

#### Web
- **HTML**: Relatórios interativos
- **JSON**: Dados estruturados para APIs
- **CSV**: Dados tabulares

#### Gráficos
- **PNG/JPG**: Imagens de gráficos
- **SVG**: Gráficos vetoriais
- **PowerPoint**: Apresentações (.pptx)

### Report Builder

#### Seções Disponíveis
- Cabeçalho personalizado
- Resumo executivo
- Tabelas de dados
- Gráficos e visualizações
- Análise de tendências
- Insights de IA
- Recomendações
- Assinaturas e aprovações

#### Visualizações
- Line charts
- Bar charts
- Pie charts
- Scatter plots
- Heat maps
- Gauges
- KPI cards
- Tables

### Templates Predefinidos

#### Executive Summary
- KPIs principais
- Highlights do período
- Alertas críticos

#### Detailed Operational
- Métricas detalhadas
- Drill-down por categoria
- Comparativos históricos

#### Regulatory Compliance
- Status de conformidade
- Ações pendentes
- Prazo de vencimento

#### Custom
- Templates personalizados
- White-label branding
- Campos dinâmicos

### Agendamento Automático

#### Frequências
- Diário
- Semanal
- Mensal
- Trimestral
- Anual
- Sob demanda

#### Distribuição
- Email automático
- Upload para cloud storage
- Integração com sistemas externos
- Notificações push

### IA Features

#### Auto-Summary
Geração automática de resumo executivo em linguagem natural.

#### Anomaly Detection
Identificação e destaque de valores fora do padrão.

#### Trend Analysis
Análise de tendências com predições futuras.

#### Smart Recommendations
Sugestões contextuais baseadas nos dados.

#### Natural Language Queries
"Gerar relatório de consumo de combustível do último mês"

## Performance

### Otimizações
- Caching de dados frequentes
- Geração paralela de seções
- Lazy loading de gráficos
- Compression de PDFs

### Escalabilidade
- Suporte para datasets grandes (1M+ registros)
- Processamento distribuído
- Queue system para geração assíncrona

## Status
✅ Produção (desde PATCH 601)

## Roadmap Futuro

### Fase 1 (Q1 2025)
- Dashboards interativos embeddable
- API pública para geração de relatórios

### Fase 2 (Q2 2025)
- Mobile app para relatórios offline
- Narração de relatórios por voz (text-to-speech)

### Fase 3 (Q3 2025)
- IA generativa para criação automática de templates
- Integração com Power BI e Tableau

## Métricas de Sucesso
- 500+ relatórios gerados por semana
- Tempo médio de geração < 30 segundos
- 4.8/5 de satisfação dos usuários
- 70% de redução em tempo de criação de relatórios

## Documentação Técnica
- Ver `/src/modules/reporting/` para código-fonte (a criar)
- Ver `/tests/e2e/patch601_reports.cy.ts` para testes E2E
- Ver `/tests/unit/reportBuilder.test.ts` para testes unitários
