# Incident Reports Module

## Visão Geral

O Incident Reports é o módulo para registro, gestão e análise de incidentes operacionais, incluindo investigação, planos de ação e análise de tendências para prevenção.

**Categoria**: Operations / Safety  
**Rota**: `/incident-reports`  
**Status**: Ativo  
**Versão**: 2.0

## Componentes Principais

### IncidentList
- Lista de todos os incidentes
- Filtros por tipo, severidade, status
- Search functionality
- Export capabilities
- Quick stats dashboard

### IncidentForm
- Formulário de registro de incidente
- Wizard multi-step
- File attachments
- Witness statements
- Location mapping

### IncidentDetails
- Visualização completa do incidente
- Timeline de eventos
- Investigation details
- Root cause analysis
- Corrective actions

### AnalyticsDashboard
- Trending de incidentes
- Heat maps
- Category analysis
- Prevention metrics
- KPI tracking

## Banco de Dados Utilizado

### Tabelas Principais
```sql
CREATE TABLE incident_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_number VARCHAR(50) UNIQUE NOT NULL,
  incident_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  vessel_id UUID REFERENCES vessels(id),
  incident_date TIMESTAMP NOT NULL,
  reported_by UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'reported',
  investigation_status VARCHAR(20),
  root_cause TEXT,
  immediate_actions TEXT,
  corrective_actions TEXT,
  preventive_actions TEXT,
  attachments JSONB DEFAULT '[]',
  witnesses JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE incident_investigations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID REFERENCES incident_reports(id),
  investigator_id UUID REFERENCES auth.users(id),
  investigation_date DATE NOT NULL,
  findings TEXT,
  root_causes TEXT[],
  contributing_factors TEXT[],
  recommendations TEXT,
  status VARCHAR(20) DEFAULT 'in_progress',
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE incident_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID REFERENCES incident_reports(id),
  action_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  due_date DATE,
  status VARCHAR(20) DEFAULT 'open',
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE incident_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_category_id UUID REFERENCES incident_categories(id),
  severity_weight INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT TRUE
);
```

## Requisições API Envolvidas

### Incident Management
- **GET /api/incidents** - Lista incidentes
- **POST /api/incidents** - Registra incidente
- **GET /api/incidents/:id** - Detalhes do incidente
- **PUT /api/incidents/:id** - Atualiza incidente
- **DELETE /api/incidents/:id** - Remove incidente
- **POST /api/incidents/:id/close** - Fecha incidente

### Investigation
- **GET /api/incidents/:id/investigation** - Detalhes da investigação
- **POST /api/incidents/:id/investigation** - Inicia investigação
- **PUT /api/investigations/:id** - Atualiza investigação
- **POST /api/investigations/:id/complete** - Completa investigação

### Actions
- **GET /api/incidents/:id/actions** - Lista ações
- **POST /api/incidents/:id/actions** - Cria ação
- **PUT /api/actions/:id** - Atualiza ação
- **POST /api/actions/:id/complete** - Completa ação

### Analytics
- **GET /api/incidents/analytics** - Analytics dashboard
- **GET /api/incidents/trending** - Trending analysis
- **GET /api/incidents/heatmap** - Geographic heatmap
- **GET /api/incidents/categories** - Por categoria

## Tipos de Incidentes

### Safety Incidents
- Personal injury
- Near miss
- Equipment damage
- Environmental

### Operational Incidents
- Process deviation
- System failure
- Communication breakdown
- Resource shortage

### Security Incidents
- Unauthorized access
- Data breach
- Physical security
- Cyber security

### Quality Incidents
- Non-conformance
- Customer complaint
- Quality deviation
- Specification breach

## Severidade

- **Critical**: Perigo imediato, múltiplas fatalidades possíveis
- **High**: Fatalidade ou dano severo possível
- **Medium**: Ferimento significativo ou dano considerável
- **Low**: Ferimento menor ou dano mínimo
- **Negligible**: Sem ferimentos ou dano

## Investigation Process

### 1. Initial Response
- Immediate actions
- Scene preservation
- Evidence collection
- Witness identification

### 2. Investigation
- Root cause analysis
- Contributing factors
- Timeline reconstruction
- Expert consultation

### 3. Analysis
- 5 Whys technique
- Fishbone diagram
- Fault tree analysis
- Human factors analysis

### 4. Recommendations
- Corrective actions
- Preventive actions
- System improvements
- Training needs

### 5. Follow-up
- Action tracking
- Effectiveness verification
- Lessons learned
- Knowledge sharing

## Integrações

### Mission Control
- Mission-related incidents
- Operational context
- Resource impact
- Mission delays

### Fleet Management
- Vessel incidents
- Equipment failures
- Maintenance triggers
- Performance impact

### Crew Management
- Crew involvement
- Training needs
- Performance impact
- Medical follow-up

### Compliance Hub
- Regulatory reporting
- Compliance tracking
- Audit findings
- Corrective actions

### SGSO Module
- Safety management integration
- Risk assessment
- Safety metrics
- Performance indicators

## Reporting & Compliance

### Regulatory Reporting
- Flag state reporting
- Classification society
- Insurance reporting
- Industry databases

### Internal Reporting
- Management reports
- Board reports
- Safety committees
- Department reports

### Metrics & KPIs
- Total Recordable Incident Rate (TRIR)
- Lost Time Injury Frequency Rate (LTIFR)
- Near Miss Frequency Rate (NMFR)
- Days Away from Work Case Rate (DAFWC)

## Testes

Localização: 
- Integrado em testes de módulos relacionados

## Última Atualização

**Data**: 2025-10-29  
**Versão**: 2.0  
**Features**: Investigation workflow, Analytics, Compliance reporting
