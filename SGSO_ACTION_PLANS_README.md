# SGSO Action Plans - Approval, Export & AI Trends

## 📋 Visão Geral

Sistema completo para gestão de planos de ação SGSO (Sistema de Gestão de Segurança Operacional) gerados automaticamente a partir de incidentes de Dynamic Positioning (DP), incluindo workflow de aprovação QSMS, exportação de relatórios e análise de tendências com IA.

## 🎯 Funcionalidades

### 1. Workflow de Aprovação QSMS

Permite que o time QSMS (Qualidade, Segurança, Meio Ambiente e Saúde) revise, aprove ou rejeite planos de ação antes de sua execução.

**Características:**
- ✅ Aprovação/rejeição de planos com notas opcionais
- 📊 Dashboard com estatísticas de aprovações
- 🔍 Visualização detalhada de cada plano
- 🔔 Filtros por status (pendente, aprovado, recusado)

**Acesso:** `/admin/sgso/approvals`

### 2. Exportação de Relatórios

Exportação de planos de ação em formatos CSV e PDF para análise externa e compartilhamento.

**Formatos Suportados:**
- **CSV**: Formato tabular para análise em Excel/Google Sheets
- **PDF**: Relatório formatado com cabeçalho e rodapé

**Campos Exportados:**
- Data do plano
- Incidente relacionado
- Embarcação
- Local do incidente
- Causa raiz
- Ação corretiva
- Ação preventiva
- Recomendação
- Status de aprovação
- Nota de aprovação

### 3. Análise de Tendências com IA (GPT-4)

Análise inteligente de padrões e tendências nos planos de ação aprovados usando GPT-4.

**Insights Gerados:**
- 📊 Top 3 categorias mais frequentes (com percentuais)
- 🔍 Principais causas raiz (top 5)
- 🛡️ Medidas sistêmicas recomendadas (5 sugestões)
- ⚠️ Riscos emergentes detectados (3-5 riscos)
- 📝 Resumo executivo

**Fallback:** Análise básica automática quando OpenAI não está disponível

## 🗄️ Estrutura de Dados

### Tabela: `sgso_action_plans`

```sql
CREATE TABLE sgso_action_plans (
  id UUID PRIMARY KEY,
  incident_id TEXT NOT NULL REFERENCES dp_incidents(id),
  organization_id UUID REFERENCES organizations(id),
  corrective_action TEXT NOT NULL,
  preventive_action TEXT NOT NULL,
  recommendation TEXT,
  status TEXT DEFAULT 'draft',
  status_approval TEXT DEFAULT 'pendente', -- pendente, aprovado, recusado
  approval_note TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## 📁 Arquitetura

### Frontend Components

```
src/
├── components/sgso/approvals/
│   └── SGSOApprovalsTable.tsx       # Tabela de aprovação
├── pages/admin/sgso/
│   └── approvals.tsx                # Página principal de aprovações
└── lib/sgso/
    ├── export-utils.ts              # Funções de exportação CSV/PDF
    └── ai-trends.ts                 # Análise de tendências com IA
```

### Backend APIs

```
pages/api/sgso/
└── export.ts                        # API de exportação
```

### Supabase Edge Functions

```
supabase/functions/
└── sgso-trends-analysis/
    └── index.ts                     # Análise de tendências server-side
```

### Migrations

```
supabase/migrations/
└── 20251018000001_create_sgso_action_plans.sql
```

## 🚀 Como Usar

### Aprovação de Planos

1. Acesse `/admin/sgso/approvals`
2. Visualize planos pendentes na aba "Pendentes"
3. Clique em "Ver Detalhes" para revisar o plano
4. Clique em "Aprovar" ou "Rejeitar"
5. Adicione nota opcional explicando a decisão
6. Confirme a ação

### Exportação de Relatórios

**Via Interface:**
```typescript
import { downloadFile, generateCSVFromPlans, generatePDFFromPlans } from "@/lib/sgso/export-utils";

// Exportar CSV
const csv = generateCSVFromPlans(plans);
downloadFile(csv, "planos_sgso.csv", "text/csv");

// Exportar PDF
const pdf = await generatePDFFromPlans(plans);
downloadFile(pdf, "planos_sgso.pdf", "application/pdf");
```

**Via API:**
```bash
# Exportar CSV
curl -X POST http://localhost:3000/api/sgso/export \
  -H "Content-Type: application/json" \
  -d '{"format": "csv", "vesselId": "PSV-001"}'

# Exportar PDF
curl -X POST http://localhost:3000/api/sgso/export \
  -H "Content-Type: application/json" \
  -d '{"format": "pdf", "status": "aprovado"}'
```

### Análise de Tendências

**Via Interface:**
1. Acesse `/admin/sgso/approvals`
2. Clique na aba "Tendências"
3. Clique em "Gerar Análise de Tendências"
4. Aguarde processamento (15-30 segundos)
5. Visualize resultados estruturados

**Via Código:**
```typescript
import { summarizeSGSOTendenciesWithAI } from "@/lib/sgso/ai-trends";

const analysis = await summarizeSGSOTendenciesWithAI(approvedPlans);
console.log(analysis.topCategories);
console.log(analysis.mainRootCauses);
console.log(analysis.systemicMeasures);
```

**Via Supabase Function:**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/sgso-trends-analysis \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vesselId": "PSV-001",
    "startDate": "2025-01-01",
    "endDate": "2025-12-31"
  }'
```

## 🔐 Permissões

As políticas RLS (Row Level Security) garantem que:
- Usuários só podem visualizar planos de sua organização
- Apenas usuários autenticados podem aprovar/rejeitar planos
- Logs de aprovação são mantidos (approved_by, approved_at)

## 🧪 Testes

```bash
# Testar exportação
npm test -- src/tests/sgso-export-utils.test.ts

# Testar análise de tendências
npm test -- src/tests/sgso-ai-trends.test.ts

# Testar todos
npm test
```

**Cobertura:**
- ✅ Geração de CSV com formatação correta
- ✅ Escape de campos com vírgulas
- ✅ Validação de estrutura de dados
- ✅ Análise de tendências com múltiplos cenários
- ✅ Edge cases (dados faltantes, arrays vazios)

## 📊 Métricas e Monitoramento

**Dashboard de Estatísticas:**
- Total de planos
- Planos pendentes
- Planos aprovados
- Planos recusados

**Análise de Tendências:**
- Categorias mais frequentes
- Causas raiz recorrentes
- Medidas preventivas sugeridas
- Riscos emergentes

## 🔗 Integração com Módulos Existentes

### DP Intelligence Center
- Planos de ação são gerados automaticamente a partir de incidentes DP
- Análise GPT-4 dos incidentes alimenta os planos

### SGSO Compliance
- Planos aprovados contribuem para métricas de compliance ANP 43/2007
- Integração com sistema de auditorias IMCA

### Relatórios Automatizados
- Exportações podem ser agendadas via cron jobs
- Integração com sistema de email para distribuição

## 🛠️ Configuração

### Variáveis de Ambiente

```bash
# OpenAI para análise de tendências
VITE_OPENAI_API_KEY=sk-...
OPENAI_API_KEY=sk-...  # Para Supabase Functions

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Dependências

```json
{
  "jspdf": "^3.0.3",
  "jspdf-autotable": "^5.0.2",
  "openai": "^6.3.0"
}
```

## 📚 Próximos Passos

- [ ] Envio automático de relatórios por email
- [ ] Dashboard executivo com Power BI
- [ ] Integração com sistema de notificações
- [ ] Workflow de edição de planos antes da aprovação
- [ ] Histórico de versões de planos
- [ ] Comentários e discussões em planos

## 🤝 Contribuindo

Para adicionar novas funcionalidades ou melhorias:

1. Atualize os tipos em `src/lib/sgso/export-utils.ts` e `src/lib/sgso/ai-trends.ts`
2. Adicione testes em `src/tests/sgso-*.test.ts`
3. Atualize documentação
4. Execute testes: `npm test`
5. Build: `npm run build`

## 📖 Referências

- [ANP Resolução 43/2007](https://www.gov.br/anp/pt-br)
- [IMCA Guidelines](https://www.imca-int.com/)
- [OpenAI GPT-4 API](https://platform.openai.com/docs/)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)

---

**Desenvolvido para Travel HR Buddy - Sistema de Gestão Marítima**
