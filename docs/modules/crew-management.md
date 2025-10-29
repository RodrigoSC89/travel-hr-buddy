# Crew Management Module

## Visão Geral

O Crew Management é o módulo consolidado para gestão completa de tripulação, incluindo dados pessoais, certificações, rotações, performance e compliance.

**Categoria**: Operations / HR  
**Rota**: `/crew-management` ou `/crew`  
**Status**: Ativo  
**Versão**: 446.0 (consolidado)

## Componentes Principais

### CrewRoster
- Lista completa de tripulação
- Status (onboard, onshore, leave, training)
- Quick filters e search
- Export capabilities

### CrewProfile
- Dados pessoais e documentos
- Certificações e qualificações
- Histórico de embarques
- Performance reviews
- Medical records

### CertificationTracker
- Tracking de certificações
- Alertas de vencimento
- Renewal management
- Training requirements
- Compliance status

### RotationPlanner
- Planejamento de rotações
- On/off schedule management
- Travel arrangements
- Relief crew coordination

### PerformanceMonitor
- Performance evaluations
- KPI tracking
- Skills assessment
- Career development
- Incident history

## Banco de Dados Utilizado

### Tabelas Principais
```sql
CREATE TABLE crew_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  position VARCHAR(100) NOT NULL,
  rank VARCHAR(50),
  department VARCHAR(100),
  nationality VARCHAR(50),
  date_of_birth DATE,
  date_joined DATE,
  status VARCHAR(20) DEFAULT 'active',
  onboard BOOLEAN DEFAULT FALSE,
  current_vessel_id UUID REFERENCES vessels(id),
  contact_info JSONB,
  emergency_contact JSONB,
  documents JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE crew_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crew_member_id UUID REFERENCES crew_members(id),
  certification_type VARCHAR(100) NOT NULL,
  certification_number VARCHAR(100),
  issuing_authority VARCHAR(255),
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'valid',
  document_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE crew_rotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crew_member_id UUID REFERENCES crew_members(id),
  vessel_id UUID REFERENCES vessels(id),
  rotation_type VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  position VARCHAR(100),
  status VARCHAR(20) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE crew_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crew_member_id UUID REFERENCES crew_members(id),
  evaluation_date DATE NOT NULL,
  evaluator_id UUID REFERENCES auth.users(id),
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  technical_skills INTEGER,
  leadership INTEGER,
  teamwork INTEGER,
  safety_awareness INTEGER,
  comments TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Requisições API Envolvidas

### Crew Management
- **GET /api/crew** - Lista tripulação
- **POST /api/crew** - Adiciona membro
- **GET /api/crew/:id** - Detalhes do membro
- **PUT /api/crew/:id** - Atualiza membro
- **DELETE /api/crew/:id** - Remove membro
- **GET /api/crew/onboard** - Lista crew onboard
- **GET /api/crew/available** - Lista crew disponível

### Certifications
- **GET /api/crew/:id/certifications** - Certificações do membro
- **POST /api/crew/:id/certifications** - Adiciona certificação
- **PUT /api/certifications/:id** - Atualiza certificação
- **GET /api/certifications/expiring** - Certificações vencendo
- **POST /api/certifications/renew/:id** - Renova certificação

### Rotations
- **GET /api/crew/rotations** - Lista rotações
- **POST /api/crew/rotations** - Agenda rotação
- **PUT /api/crew/rotations/:id** - Atualiza rotação
- **POST /api/crew/rotations/:id/complete** - Completa rotação
- **GET /api/crew/rotation-calendar** - Calendário de rotações

### Performance
- **GET /api/crew/:id/performance** - Avaliações do membro
- **POST /api/crew/:id/performance** - Cria avaliação
- **GET /api/crew/performance/reports** - Relatórios de performance

## Integrações

### Fleet Management
- Crew assignment para vessels
- Onboard status tracking
- Vessel-crew relationship

### Mission Control
- Crew allocation para missões
- Skill matching
- Availability checking

### Compliance Hub
- Certification compliance
- Training compliance
- Medical compliance
- Document compliance

### Document Hub
- Personal documents
- Certification documents
- Medical certificates
- Training records

## Alertas e Notificações

- Certificações vencendo (30/60/90 dias)
- Rotações upcoming
- Performance reviews due
- Medical exams due
- Training requirements
- Document renewals

## Compliance Features

### STCW Compliance
- Standards of Training, Certification and Watchkeeping
- Mandatory certifications
- Rest hour compliance
- Training requirements

### MLC Compliance
- Maritime Labour Convention
- Working conditions
- Wage compliance
- Repatriation rights
- Health and welfare

### Company Policies
- Internal policies compliance
- Drug and alcohol testing
- Security clearances
- Background checks

## Testes

Localização: 
- `tests/crew-management.test.ts`
- `tests/e2e-crew-management.spec.ts`

## Consolidação

**PATCH 446**: Consolidou crew modules em crew-management

Redirects configurados:
- `/crew` → `/crew-management`
- `/operations/crew` → `/crew-management`

## Última Atualização

**Data**: 2025-10-29  
**Versão**: 446.0  
**Status**: Consolidado e Ativo
