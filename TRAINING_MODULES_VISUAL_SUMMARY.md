# Training Modules & Audit Export - Visual Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TRAINING MODULE SYSTEM                    │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Auditor    │────────▶│   Audit UI   │────────▶│  Edge Func   │
│  Identifies  │         │  Detects Gap │         │  generate-   │
│     Gap      │         │              │         │   training   │
└──────────────┘         └──────────────┘         └──────┬───────┘
                                                          │
                                                          ▼
                                                   ┌──────────────┐
                                                   │   OpenAI     │
                                                   │   GPT-4      │
                                                   │  Generates   │
                                                   │   Content    │
                                                   └──────┬───────┘
                                                          │
                                                          ▼
                                                   ┌──────────────┐
                                                   │  Training    │
                                                   │   Module     │
                                                   │   Created    │
                                                   └──────┬───────┘
                                                          │
                         ┌────────────────────────────────┴────────┐
                         ▼                                         ▼
                  ┌──────────────┐                        ┌──────────────┐
                  │  Crew Takes  │                        │   Database   │
                  │   Training   │                        │   Storage    │
                  │ & Quiz (3Qs) │                        │training_     │
                  └──────┬───────┘                        │  modules     │
                         │                                └──────────────┘
                         ▼
                  ┌──────────────┐
                  │   Scored     │
                  │  70% Pass    │
                  │   Recorded   │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │   training_  │
                  │ completions  │
                  │   (History)  │
                  └──────────────┘
```

## 📊 Audit Export Flow

```
┌─────────────────────────────────────────────────────────────┐
│               AUDIT EXPORT BUNDLE SYSTEM                     │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    Admin     │────────▶│  Export UI   │────────▶│  Edge Func   │
│   Selects    │         │  Vessel &    │         │  export-     │
│    Vessel    │         │    Norms     │         │audit-bundle  │
│   & Norms    │         │              │         └──────┬───────┘
└──────────────┘         └──────────────┘                │
                                                          ▼
                                                   ┌──────────────┐
                                                   │   Queries    │
                                                   │ auditorias_  │
                                                   │     imca     │
                                                   └──────┬───────┘
                                                          │
                                                          ▼
                                                   ┌──────────────┐
                                                   │  Calculates  │
                                                   │ Compliance   │
                                                   │ Statistics   │
                                                   └──────┬───────┘
                                                          │
                         ┌────────────────────────────────┴────────┐
                         ▼                                         ▼
                  ┌──────────────┐                        ┌──────────────┐
                  │  Structures  │                        │   Groups     │
                  │  Audit Data  │                        │   By Norm    │
                  │  by Vessel   │                        │              │
                  └──────┬───────┘                        └──────┬───────┘
                         │                                       │
                         └───────────────┬───────────────────────┘
                                         ▼
                                  ┌──────────────┐
                                  │  JSON Bundle │
                                  │  Downloaded  │
                                  │              │
                                  └──────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
             ┌──────────┐         ┌──────────┐         ┌──────────┐
             │  IBAMA   │         │Petrobras │         │   ANP    │
             │  Report  │         │  Report  │         │  Report  │
             └──────────┘         └──────────┘         └──────────┘
```

## 🗃️ Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                    training_modules                          │
├─────────────────────────────────────────────────────────────┤
│ • id (UUID) - Primary Key                                   │
│ • title (TEXT) - Module title                               │
│ • gap_detected (TEXT) - Failure description                 │
│ • norm_reference (TEXT) - IMCA norm ref                     │
│ • training_content (TEXT) - Markdown content                │
│ • quiz (JSONB) - Array of questions                         │
│ • vessel_id (UUID) - Optional vessel link                   │
│ • audit_id (UUID FK) - Link to audit                        │
│ • status (TEXT) - active/archived/draft                     │
│ • created_by (UUID FK) - Creator user                       │
│ • created_at, updated_at                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ (One-to-Many)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  training_completions                        │
├─────────────────────────────────────────────────────────────┤
│ • id (UUID) - Primary Key                                   │
│ • training_module_id (UUID FK) - Module reference           │
│ • user_id (UUID FK) - User who completed                    │
│ • vessel_id (UUID) - Optional vessel                        │
│ • completed_at (TIMESTAMP) - Completion time                │
│ • quiz_score (INTEGER 0-100) - Score achieved               │
│ • quiz_answers (JSONB) - Selected answers                   │
│ • passed (BOOLEAN) - True if score >= 70%                   │
│ • notes (TEXT) - Optional notes                             │
│ • created_at                                                │
│ UNIQUE(training_module_id, user_id, vessel_id)              │
└─────────────────────────────────────────────────────────────┘
```

## 🔒 Security Model

```
Row Level Security (RLS) Policies:

training_modules:
  ✓ Any authenticated user can view ACTIVE modules
  ✓ Only ADMINS can create/update/delete modules

training_completions:
  ✓ Users can view their OWN completions
  ✓ Users can create their OWN completions
  ✓ ADMINS can view ALL completions

Edge Functions:
  ✓ All endpoints require authentication
  ✓ Token validation via Supabase Auth
```

## 📝 Quiz Structure

```json
{
  "question": "Qual é o intervalo máximo para verificação do alarme?",
  "options": [
    "6 meses",
    "30 dias", 
    "Apenas antes da viagem"
  ],
  "correct_answer": 1  // Index 1 = "30 dias"
}
```

## 🎯 Training Content Format

```markdown
## Verificação de Alarmes do Sistema DP

### 💡 Contexto
O alarme de falha do DP não foi verificado durante as 
simulações mensais, o que viola as diretrizes IMCA M220 
4.3.1 e M117 6.2.4.

### ✅ O que fazer
- Realizar verificação mensal
- Registrar no log de DP
- Reportar falhas ao supervisor

### 📚 Norma de Referência
IMCA M220 4.3.1 / M117 6.2.4
```

## 📦 Export Bundle Structure

```json
{
  "metadata": {
    "vessel_name": "Navio XYZ-456",
    "report_generated_at": "2024-10-18T14:00:00.000Z",
    "generated_by": "auditor@company.com",
    "norms_covered": ["IMCA M220", "IMCA M117"]
  },
  "summary": {
    "total_audits": 45,
    "compliance_rate": "82.22%",
    "breakdown": {
      "conforme": 35,
      "nao_conforme": 5,
      "parcialmente_conforme": 3,
      "nao_aplicavel": 2
    }
  },
  "audits_by_norm": { ... },
  "audit_logs": [ ... ],
  "training_modules": [ ... ],
  "non_conformities": [ ... ]
}
```

## 🎨 UI Components

### GenerateTrainingModuleForm
```
┌─────────────────────────────────────────┐
│  📚 Gerar Módulo de Treinamento         │
├─────────────────────────────────────────┤
│  Falha/Gap Detectada: *                 │
│  [___________________________________]  │
│                                         │
│  Norma de Referência: *                 │
│  [___________________________________]  │
│                                         │
│  Embarcação (Opcional):                 │
│  [___________________________________]  │
│                                         │
│  ⓘ O sistema irá gerar:                │
│    • Conteúdo técnico                   │
│    • 3 questões de quiz                 │
│    • Ações práticas                     │
│                                         │
│  [  Gerar Módulo de Treinamento  ]     │
└─────────────────────────────────────────┘
```

### TrainingModulesList
```
┌─────────────────────────────────────────┐
│  📚 Verificação de Alarmes DP           │
│  📄 IMCA M220 4.3.1  🚢 Vessel  🕒 2h   │
├─────────────────────────────────────────┤
│  Falha Detectada:                       │
│  Alarme não verificado...               │
│                                         │
│  📝 3 questões no questionário          │
│  [  Ver Treinamento Completo  ]        │
└─────────────────────────────────────────┘
```

### ExportAuditBundleForm
```
┌─────────────────────────────────────────┐
│  ⬇️  Exportar Bundle para Auditoria     │
├─────────────────────────────────────────┤
│  Nome da Embarcação: *                  │
│  [___________________________________]  │
│                                         │
│  Normas IMCA: *                         │
│  [Selecionar normas...          ▼]     │
│  🏷️ IMCA M220 × | 🏷️ IMCA M117 ×     │
│                                         │
│  Data Inicial:        Data Final:       │
│  [___________]        [___________]     │
│                                         │
│  Formato: [JSON (Estruturado)    ▼]    │
│                                         │
│  O bundle incluirá:                     │
│  • Logs por norma                       │
│  • Taxa de conformidade                 │
│  • Não conformidades                    │
│  • Módulos de treinamento               │
│                                         │
│  [  Exportar Bundle de Auditoria  ]    │
└─────────────────────────────────────────┘
```

## 🔄 Integration Points

### In Audit Details Page
```tsx
<Tabs>
  <Tab value="audit">Audit Details</Tab>
  <Tab value="training">
    <GenerateTrainingModuleForm auditId={id} />
    <TrainingModulesList vesselId={id} />
  </Tab>
  <Tab value="export">
    <ExportAuditBundleForm />
  </Tab>
</Tabs>
```

### In Admin Dashboard
```tsx
<TrainingModulesList />  // All modules
<ExportAuditBundleForm /> // Bulk export
```

### In Crew Portal
```tsx
<TrainingModulesList vesselId={userVessel} />
// View assigned trainings
// Complete quizzes
// Track progress
```

## 📈 Metrics & Analytics

```
Training Module Stats:
├─ Total Completions: 142
├─ Pass Rate: 87%
├─ Average Score: 89%
└─ Most Common Failures: Question 2

Audit Compliance:
├─ Overall Rate: 82.22%
├─ Top Issues: DP Alarms (5)
├─ Training Generated: 12 modules
└─ Users Trained: 45
```

## 🚀 Deployment Checklist

- [x] Database migration applied
- [x] Edge Functions deployed
- [x] Environment variables configured
- [x] RLS policies enabled
- [x] Frontend components integrated
- [x] Tests passing (1514/1514)
- [x] Build successful
- [x] Documentation complete
