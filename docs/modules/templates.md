# Templates Module

## Visão Geral

O Templates é um módulo de gerenciamento de templates de documentos com recursos de IA para geração, personalização e aplicação automatizada de templates para diversos tipos de documentos operacionais.

**Categoria**: Operations / Documents  
**Rota**: `/templates`  
**Status**: Ativo  
**Versão**: 2.0

## Componentes Principais

### TemplateLibrary
- Biblioteca de templates disponíveis
- Categorização por tipo
- Search e filtering
- Preview de templates
- Template versioning

### TemplateEditor
- Editor visual de templates
- Drag-and-drop builder
- Variable insertion
- Conditional logic
- Rich text formatting

### TemplateGenerator
- AI-powered template generation
- Template from scratch
- Template from example
- Auto-complete suggestions
- Smart formatting

### TemplateApplicator
- Apply template to data
- Batch processing
- Variable substitution
- Output generation (PDF, DOCX, HTML)

## Banco de Dados Utilizado

### Tabelas Principais
```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_type VARCHAR(100) NOT NULL,
  category VARCHAR(100),
  content JSONB NOT NULL,
  variables JSONB DEFAULT '{}',
  version INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'draft',
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE template_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES templates(id),
  version_number INTEGER NOT NULL,
  content JSONB NOT NULL,
  changes_description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE template_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES templates(id),
  applied_by UUID REFERENCES auth.users(id),
  input_data JSONB,
  output_format VARCHAR(20),
  generated_document_url TEXT,
  status VARCHAR(20) DEFAULT 'completed',
  applied_at TIMESTAMP DEFAULT NOW()
);
```

## Requisições API Envolvidas

### Template Management
- **GET /api/templates** - Lista templates
- **POST /api/templates** - Cria template
- **GET /api/templates/:id** - Detalhes do template
- **PUT /api/templates/:id** - Atualiza template
- **DELETE /api/templates/:id** - Remove template
- **POST /api/templates/:id/duplicate** - Duplica template
- **GET /api/templates/categories** - Lista categorias

### Template AI Features
- **POST /api/templates/generate** - Gera template com AI
- **POST /api/templates/rewrite** - Reescreve seção com AI
- **POST /api/templates/suggest** - Sugestões de conteúdo
- **POST /api/templates/analyze** - Análise de template

### Template Application
- **POST /api/templates/:id/apply** - Aplica template
- **POST /api/templates/:id/preview** - Preview de aplicação
- **POST /api/templates/batch-apply** - Aplicação em lote
- **GET /api/templates/applications** - Histórico de aplicações

### Export
- **POST /api/templates/:id/export/pdf** - Export para PDF
- **POST /api/templates/:id/export/docx** - Export para DOCX
- **POST /api/templates/:id/export/html** - Export para HTML

## Features de IA

### Template Generation
- AI-powered template creation
- Learning from existing templates
- Best practices application
- Industry-specific templates

### Content Rewriting
- AI-assisted text improvement
- Tone adjustment
- Clarity enhancement
- Grammar and style fixes

### Smart Variables
- Auto-detection of variables
- Variable type inference
- Default value suggestions
- Validation rules

### Intelligent Formatting
- Auto-formatting based on content type
- Consistent styling
- Layout optimization
- Responsive design

## Tipos de Templates

### Operational Templates
- Work orders
- Inspection reports
- Maintenance logs
- Safety checklists

### Administrative Templates
- Contracts
- Purchase orders
- Invoices
- Correspondence

### Compliance Templates
- Audit reports
- Incident reports
- Compliance certificates
- Training records

### Technical Templates
- Technical specifications
- Procedures
- Manuals
- Diagrams

## Integrações

### Document Hub
- Template-based document creation
- Document versioning
- Document storage
- Collaboration features

### Mission Control
- Mission planning documents
- Briefing documents
- Report templates
- Debrief documents

### Crew Management
- Certification templates
- Performance review forms
- Training records
- Contracts

### Compliance Hub
- Audit templates
- Compliance forms
- Report templates
- Checklist templates

## Template Variables

### System Variables
- `{date}` - Current date
- `{time}` - Current time
- `{user.name}` - Current user name
- `{company.name}` - Company name

### Custom Variables
- User-defined variables
- Variable validation
- Default values
- Conditional logic

### Dynamic Variables
- Calculated values
- Database lookups
- API integrations
- Real-time data

## Testes

Localização: 
- `tests/templates.test.tsx`
- `e2e/templates.spec.ts`

## Última Atualização

**Data**: 2025-10-29  
**Versão**: 2.0  
**Features**: AI generation, Smart variables, Multiple export formats
