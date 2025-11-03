# Pre-OVID Inspection Module

## 📋 Objetivo do Módulo

O módulo **Pre-OVID Inspection** é uma implementação completa baseada no OCIMF (Oil Companies International Marine Forum) Offshore Vessel Inspection Questionnaire (OVIQ). Este sistema permite realizar inspeções prévias em embarcações offshore com suporte de inteligência artificial para análise, sugestões e geração de relatórios.

## 🎯 Funcionalidades Principais

### 1. Interface de Inspeção OVID

- Formulário estruturado baseado no OVIQ2 (3ª Edição)
- Agrupamento por categorias (Segurança, Tripulação, Documentação, etc.)
- Suporte para múltiplas versões do checklist (OVID v2, v3, customizado)
- Interface multilíngue (EN/PT)
- Registro de observações e comentários detalhados

### 2. Sistema de Evidências

- Upload de documentos (PDF, fotos, relatórios)
- Suporte para múltiplos formatos (PDF, JPG, PNG, MP4)
- Vinculação de evidências a seções específicas
- Controle de tamanho e tipo de arquivo

### 3. Assistente LLM para Apoio à Inspeção

- Análise em tempo real de respostas
- Geração automática de observações
- Sugestões de ações corretivas/preventivas
- Avaliação de risco baseada em padrões OCIMF
- Cálculo de scores de risco e conformidade

### 4. Geração de Relatórios

- Exportação em PDF com formatação profissional
- Exportação em CSV para análise de dados
- Relatórios incluem:
  - Resumo executivo da inspeção
  - Achados críticos
  - Plano de ação sugerido
  - Scores de risco e conformidade
  - Resultados detalhados do checklist

### 5. Histórico e Rastreabilidade

- Registro completo de todas as inspeções
- Evolução de conformidade ao longo do tempo
- Visualizações comparativas
- Auditoria de ações e mudanças

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### 1. `pre_ovid_inspections`
Tabela principal que armazena informações gerais da inspeção.

```sql
CREATE TABLE pre_ovid_inspections (
  id UUID PRIMARY KEY,
  vessel_id UUID REFERENCES vessels(id),
  inspector_id UUID REFERENCES profiles(id),
  inspection_date TIMESTAMPTZ,
  status TEXT CHECK (status IN ('draft', 'submitted', 'reviewed')),
  risk_rating TEXT,
  notes TEXT,
  location TEXT,
  checklist_version TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Campos:**
- `id`: Identificador único da inspeção
- `vessel_id`: Referência à embarcação inspecionada
- `inspector_id`: Referência ao inspetor responsável
- `inspection_date`: Data e hora da inspeção
- `status`: Status atual (rascunho, submetido, revisado)
- `risk_rating`: Classificação de risco geral
- `notes`: Observações gerais
- `location`: Local da inspeção (porto, ancoradouro, etc.)
- `checklist_version`: Versão do checklist utilizado

#### 2. `pre_ovid_responses`
Armazena as respostas detalhadas para cada item do questionário.

```sql
CREATE TABLE pre_ovid_responses (
  id UUID PRIMARY KEY,
  inspection_id UUID REFERENCES pre_ovid_inspections(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  question_number TEXT NOT NULL,
  question_text TEXT NOT NULL,
  response TEXT,
  comments TEXT,
  non_conformity BOOLEAN DEFAULT false,
  ai_suggestion TEXT,
  ai_risk_analysis TEXT,
  created_at TIMESTAMPTZ
);
```

**Campos:**
- `section`: Seção do questionário (ex: "Segurança", "Tripulação")
- `question_number`: Número da questão
- `question_text`: Texto completo da pergunta
- `response`: Resposta fornecida
- `comments`: Comentários adicionais
- `non_conformity`: Indica se há não conformidade
- `ai_suggestion`: Sugestão gerada pela IA
- `ai_risk_analysis`: Análise de risco da IA

#### 3. `pre_ovid_evidences`
Gerencia os arquivos de evidência coletados durante a inspeção.

```sql
CREATE TABLE pre_ovid_evidences (
  id UUID PRIMARY KEY,
  inspection_id UUID REFERENCES pre_ovid_inspections(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id),
  related_section TEXT,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ
);
```

#### 4. `pre_ovid_ai_reports`
Armazena relatórios e análises gerados pela IA.

```sql
CREATE TABLE pre_ovid_ai_reports (
  id UUID PRIMARY KEY,
  inspection_id UUID REFERENCES pre_ovid_inspections(id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ,
  summary TEXT,
  critical_findings TEXT,
  suggested_plan TEXT,
  risk_score INTEGER,
  compliance_score INTEGER,
  created_by UUID REFERENCES profiles(id)
);
```

## 📚 Referência Cruzada com OVID

### OVIQ2 - 3rd Edition (7105)

O questionário OVIQ2 é estruturado em múltiplas seções principais:

1. **General Information** (Informações Gerais)
2. **Safety Management** (Gestão de Segurança)
3. **Crew Management** (Gestão de Tripulação)
4. **Bridge/Navigation** (Ponte/Navegação)
5. **Deck Operations** (Operações de Convés)
6. **Engineering** (Engenharia)
7. **Communications** (Comunicações)
8. **Environmental** (Meio Ambiente)
9. **Safety Equipment** (Equipamentos de Segurança)
10. **Emergency Systems** (Sistemas de Emergência)

Cada seção contém múltiplas perguntas específicas que devem ser respondidas durante a inspeção.

## 🔒 Segurança e Controle de Acesso

### Row Level Security (RLS)

O módulo implementa políticas RLS para garantir:

- Inspetores só podem visualizar suas próprias inspeções
- Administradores têm acesso total a todas as inspeções
- Evidências só podem ser visualizadas por usuários autorizados
- Relatórios IA são protegidos por permissões

### Políticas Implementadas

```sql
-- Inspetores podem ver suas inspeções
CREATE POLICY "Inspector can view own inspections" 
  ON pre_ovid_inspections
  FOR SELECT USING (inspector_id = auth.uid());

-- Admins têm acesso total
CREATE POLICY "Admin full access to inspections" 
  ON pre_ovid_inspections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
```

## 🔧 API Endpoints

### POST `/api/pre-ovid/inspections`
Cria uma nova inspeção com respostas e evidências.

**Request Body:**
```typescript
{
  inspection: PreOvidInspection,
  responses: PreOvidResponse[],
  evidences: PreOvidEvidence[]
}
```

**Response:**
```typescript
{
  inspectionId: string,
  data: Inspection
}
```

### GET `/api/pre-ovid/inspections/:id`
Recupera uma inspeção específica com todos os dados relacionados.

**Response:**
```typescript
{
  data: {
    ...inspection,
    responses: Response[],
    evidences: Evidence[],
    ai_reports: AIReport[]
  }
}
```

### POST `/api/pre-ovid/inspections/:id/generate-ai-report`
Gera um relatório IA para uma inspeção específica.

**Response:**
```typescript
{
  data: {
    summary: string,
    critical_findings: string,
    suggested_plan: string,
    risk_score: number,
    compliance_score: number
  }
}
```

## 📊 Componentes UI

### PreOvidInspectionPanel

Componente principal com três abas:

1. **Inspeção**: Formulário de entrada de dados
2. **Evidências**: Upload e gestão de arquivos
3. **Relatório IA**: Visualização e geração de análises

**Localização:** `/src/components/pre-ovid/PreOvidInspectionPanel.tsx`

### Funcionalidades do Painel

- Validação de formulários
- Feedback visual de operações
- Estados de carregamento
- Mensagens de erro e sucesso
- Navegação por abas

## 📄 Exportação de Relatórios

### PDF Export

Utiliza `jsPDF` para gerar relatórios formatados incluindo:

- Cabeçalho com informações da inspeção
- Resumo executivo gerado pela IA
- Scores de risco e conformidade
- Achados críticos detalhados
- Resultados do checklist (primeiros 30 itens)
- Plano de ação sugerido
- Paginação automática

**Uso:**
```typescript
import { generatePreOvidPDF } from '@/lib/pdf/preOvidPdfGenerator';

await generatePreOvidPDF(inspectionData);
```

### CSV Export

Exporta dados tabulares do checklist para análise em Excel/Google Sheets.

**Uso:**
```typescript
import { exportInspectionToCSV } from '@/lib/pdf/preOvidPdfGenerator';

exportInspectionToCSV(inspectionData);
```

## 🧪 Validações

### Validações Obrigatórias

- [ ] Teste E2E completo do fluxo de inspeção
- [ ] Validação por engenheiro naval/inspetor em sandbox
- [ ] Exportação e reimportação de checklist sem perdas
- [ ] LLM auditável: logs das sugestões geradas
- [ ] Testes de permissões RLS
- [ ] Validação de uploads de arquivos
- [ ] Performance de geração de relatórios

## 🚀 Plano de Evolução

### Fase 1 (Atual - PATCH 650)
- ✅ Estrutura básica de inspeções
- ✅ Interface de entrada de dados
- ✅ Sistema de evidências
- ✅ Geração básica de relatórios IA
- ✅ Exportação PDF/CSV

### Fase 2 (Futuro)
- [ ] Integração com bancos de dados OCIMF
- [ ] Comparação automática com histórico
- [ ] Geração de action plans automáticos
- [ ] Benchmarking entre embarcações
- [ ] Dashboard analítico de tendências
- [ ] Notificações de não conformidades
- [ ] Sistema de workflow de aprovação

### Fase 3 (Futuro)
- [ ] Mobile app para inspeções offline
- [ ] OCR para digitalização de documentos
- [ ] Reconhecimento de imagem para evidências
- [ ] Integração com sensores IoT
- [ ] Análise preditiva de falhas
- [ ] Sistema de treinamento integrado

## 💡 Exemplos de Uso

### Criar Nova Inspeção

```typescript
import { createInspection } from '@/pages/api/pre-ovid/inspections';

const inspection = {
  inspector_id: 'user-123',
  location: 'Porto de Santos',
  checklist_version: 'ovid-v3',
  notes: 'Inspeção de rotina',
  status: 'draft'
};

const responses = [
  {
    section: 'Segurança',
    question_number: '1',
    question_text: 'Equipamentos de segurança disponíveis?',
    response: 'Sim',
    non_conformity: false
  }
];

const result = await createInspection(inspection, responses, []);
```

### Gerar Relatório IA

```typescript
import { generateAIReport } from '@/pages/api/pre-ovid/inspections';

const report = await generateAIReport(inspectionId, inspectorId);
console.log(report.data.summary);
```

### Exportar PDF

```typescript
import { generatePreOvidPDF } from '@/lib/pdf/preOvidPdfGenerator';

const inspectionData = await getInspectionById(inspectionId);
await generatePreOvidPDF(inspectionData.data);
```

## 🔗 Integrações

### Supabase
- Armazenamento de dados
- Autenticação e autorização
- Row Level Security
- Triggers e funções

### LLM Engine
- OpenAI GPT para análises
- Geração de sugestões
- Avaliação de riscos
- Síntese de relatórios

### Document Hub
- Vinculação de relatórios anteriores
- Histórico de inspeções
- Comparação temporal

## 📞 Suporte

Para questões técnicas ou sugestões de melhorias, entre em contato com a equipe de desenvolvimento.

## 📝 Licença

Este módulo faz parte do sistema Nautilus One e está sujeito às mesmas condições de licenciamento do projeto principal.

---

**Versão:** 1.0.0 (PATCH 650)  
**Data:** Novembro 2025  
**Status:** ✅ Implementação Completa
