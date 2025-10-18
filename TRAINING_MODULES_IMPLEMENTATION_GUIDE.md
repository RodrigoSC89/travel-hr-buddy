# Training Modules & Audit Export - Implementation Guide

## 📚 Overview

This implementation provides two major features for the maritime audit system:

1. **Training Module System (Micro Treinamento)** - AI-powered micro training generation based on audit gaps
2. **Audit Export Bundle** - Structured export for external audits (IBAMA, Petrobras, ANP, etc.)

## 🎯 ETAPA 28: Training Module System

### Database Schema

The system uses two main tables:

#### `training_modules`
Stores training modules generated from audit gaps:
- `title` - Training module title
- `gap_detected` - Description of the detected gap/failure
- `norm_reference` - Reference to the norm (e.g., IMCA M220 4.3.1)
- `training_content` - Markdown formatted training content
- `quiz` - JSONB array of quiz questions
- `vessel_id` - Optional vessel association
- `audit_id` - Optional audit association
- `status` - Module status (active/archived/draft)

#### `training_completions`
Tracks training completion history per user and vessel:
- `training_module_id` - Reference to training module
- `user_id` - User who completed the training
- `vessel_id` - Optional vessel where training was completed
- `quiz_score` - Score achieved (0-100)
- `quiz_answers` - Array of selected answers
- `passed` - Boolean indicating if user passed (>= 70%)

### API Endpoints

#### Generate Training Module
**Endpoint:** `/functions/v1/generate-training-module`

**Request:**
```json
{
  "auditId": "uuid-optional",
  "gapDetected": "Falha na verificação de alarme de falha de sistema DP",
  "normReference": "IMCA M220 4.3.1 / M117 6.2.4",
  "vessel": "Navio ABC-123"
}
```

**Response:**
```json
{
  "success": true,
  "module": {
    "id": "uuid",
    "title": "Verificação de Alarmes do Sistema DP",
    "gap_detected": "...",
    "norm_reference": "...",
    "training_content": "## Title\n\n### Context\n...",
    "quiz": [
      {
        "question": "Qual é o intervalo máximo para verificação?",
        "options": ["6 meses", "30 dias", "Apenas antes da viagem"],
        "correct_answer": 1
      }
    ]
  }
}
```

### Usage Examples

#### Generate Training Module
```typescript
import { TrainingModuleService } from '@/services/training-module'

const result = await TrainingModuleService.generateTrainingModule({
  gapDetected: 'Falha na verificação de alarme de falha de sistema DP',
  normReference: 'IMCA M220 4.3.1',
  vessel: 'Navio ABC-123'
})
```

#### Using React Hook
```typescript
import { useTrainingModules } from '@/hooks/use-training-modules'

function MyComponent() {
  const { modules, generateModule, isGenerating } = useTrainingModules()
  
  const handleGenerate = async () => {
    await generateModule({
      gapDetected: 'Description of the gap',
      normReference: 'IMCA M220'
    })
  }
  
  return (
    <div>
      <button onClick={handleGenerate} disabled={isGenerating}>
        Generate Training
      </button>
      {modules.map(module => (
        <div key={module.id}>{module.title}</div>
      ))}
    </div>
  )
}
```

#### Record Training Completion
```typescript
import { useTrainingCompletions } from '@/hooks/use-training-modules'

function TrainingQuiz({ moduleId }: { moduleId: string }) {
  const { recordCompletion, isRecording } = useTrainingCompletions()
  const [answers, setAnswers] = useState([0, 1, 2]) // User's answers
  
  const handleSubmit = async () => {
    const result = await recordCompletion(
      moduleId,
      answers,
      'vessel-id-optional',
      'Optional notes'
    )
    
    console.log(`Score: ${result.quiz_score}%`)
    console.log(`Passed: ${result.passed}`)
  }
  
  return <button onClick={handleSubmit}>Submit Quiz</button>
}
```

### UI Components

#### GenerateTrainingModuleForm
Form component for generating training modules from audit gaps:

```tsx
import { GenerateTrainingModuleForm } from '@/components/training'

<GenerateTrainingModuleForm
  auditId="optional-audit-id"
  vesselId="optional-vessel-id"
  onSuccess={() => console.log('Module generated!')}
/>
```

#### TrainingModulesList
Display list of active training modules:

```tsx
import { TrainingModulesList } from '@/components/training'

<TrainingModulesList
  vesselId="optional-vessel-id"
  onModuleClick={(id) => navigate(`/training/${id}`)}
/>
```

## 📦 ETAPA 29: Audit Export Bundle

### API Endpoint

**Endpoint:** `/functions/v1/export-audit-bundle`

**Request:**
```json
{
  "vesselId": "uuid-optional",
  "vesselName": "Navio XYZ-456",
  "norms": ["IMCA M220", "IMCA M117"],
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "format": "json"
}
```

**Response:**
```json
{
  "success": true,
  "bundle": {
    "metadata": {
      "vessel_name": "Navio XYZ-456",
      "report_generated_at": "2024-10-18T14:00:00.000Z",
      "generated_by": "user@example.com",
      "norms_covered": ["IMCA M220", "IMCA M117"],
      "date_range": {
        "start": "2024-01-01",
        "end": "2024-12-31"
      }
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
    "audits_by_norm": {
      "IMCA M220": [...],
      "IMCA M117": [...]
    },
    "audit_logs": [...],
    "training_modules": [...],
    "non_conformities": [...]
  }
}
```

### Usage Examples

#### Export Audit Bundle
```typescript
import { TrainingModuleService } from '@/services/training-module'

const result = await TrainingModuleService.exportAuditBundle({
  vesselName: 'Navio XYZ-456',
  norms: ['IMCA M220', 'IMCA M117'],
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  format: 'json'
})

// Download the bundle
const blob = new Blob([JSON.stringify(result.bundle, null, 2)], {
  type: 'application/json'
})
// Create download link...
```

#### Using React Hook
```typescript
import { useAuditExport } from '@/hooks/use-training-modules'

function ExportComponent() {
  const { exportBundle, isExporting } = useAuditExport()
  
  const handleExport = async () => {
    const result = await exportBundle({
      vesselName: 'Navio XYZ-456',
      norms: ['IMCA M220', 'IMCA M117']
    })
    
    if (result.success) {
      // Handle download
    }
  }
  
  return (
    <button onClick={handleExport} disabled={isExporting}>
      Export Audit Bundle
    </button>
  )
}
```

### UI Component

#### ExportAuditBundleForm
Complete form for exporting audit bundles:

```tsx
import { ExportAuditBundleForm } from '@/components/training'

<ExportAuditBundleForm />
```

## 🔧 Setup Instructions

### 1. Database Migration

Run the migration to create the training tables:

```bash
# Apply migration in Supabase
supabase migration up
```

Or manually run the SQL file:
```
supabase/migrations/20251018140000_create_training_modules.sql
```

### 2. Deploy Edge Functions

Deploy the Edge Functions to Supabase:

```bash
# Deploy training module generation
supabase functions deploy generate-training-module

# Deploy audit export
supabase functions deploy export-audit-bundle
```

### 3. Environment Variables

Ensure the following environment variables are set in Supabase Edge Functions:

- `VITE_OPENAI_API_KEY` or `OPENAI_API_KEY` - For AI content generation
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database access

### 4. Frontend Integration

The frontend code is ready to use. Simply import the components:

```tsx
import { 
  GenerateTrainingModuleForm, 
  TrainingModulesList,
  ExportAuditBundleForm 
} from '@/components/training'
```

## 📊 Features Checklist

### Training Modules
- ✅ Database schema with RLS policies
- ✅ AI-powered content generation
- ✅ Quiz system with automatic scoring
- ✅ Completion tracking per user/vessel
- ✅ Statistics and analytics
- ✅ React hooks for easy integration
- ✅ UI components ready to use

### Audit Export
- ✅ Structured JSON export
- ✅ Filter by vessel, norms, and dates
- ✅ Compliance statistics
- ✅ Non-conformities grouping
- ✅ Training modules inclusion
- ✅ React hook for easy integration
- ✅ UI component with download

## 🔐 Security

### Row Level Security (RLS)
- Users can only view active training modules
- Users can only see their own completions
- Admins can manage all training modules
- Admins can view all completions

### Authentication
All API endpoints require authentication via Supabase Auth.

## 📈 Future Enhancements

Potential improvements for future versions:

1. **PDF Generation** - Server-side PDF generation for audit bundles
2. **Email Reports** - Automatic email delivery of audit bundles
3. **Multi-language** - Support for English and other languages
4. **Advanced Analytics** - More detailed training completion analytics
5. **Certificate Generation** - Automatic certificates for completed trainings
6. **Scheduled Exports** - Recurring audit bundle generation
7. **Template System** - Customizable report templates for different entities

## 🧪 Testing

Run the test suite:

```bash
npm test src/tests/training-module.test.ts
```

All tests should pass:
- ✅ Authentication checks
- ✅ Service method definitions
- ✅ Type safety validation

## 📝 Example Integration in Audit Page

```tsx
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  GenerateTrainingModuleForm,
  TrainingModulesList,
  ExportAuditBundleForm 
} from '@/components/training'

function AuditDetailsPage({ auditId, vesselId }) {
  const [refreshKey, setRefreshKey] = useState(0)
  
  return (
    <Tabs defaultValue="audit">
      <TabsList>
        <TabsTrigger value="audit">Auditoria</TabsTrigger>
        <TabsTrigger value="training">Treinamentos</TabsTrigger>
        <TabsTrigger value="export">Exportar</TabsTrigger>
      </TabsList>
      
      <TabsContent value="audit">
        {/* Audit details... */}
      </TabsContent>
      
      <TabsContent value="training">
        <div className="space-y-6">
          <GenerateTrainingModuleForm
            auditId={auditId}
            vesselId={vesselId}
            onSuccess={() => setRefreshKey(k => k + 1)}
          />
          
          <TrainingModulesList
            key={refreshKey}
            vesselId={vesselId}
            onModuleClick={(id) => navigate(`/training/${id}`)}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="export">
        <ExportAuditBundleForm />
      </TabsContent>
    </Tabs>
  )
}
```

## 🎓 Training Content Format

The AI generates training content in the following structure:

```markdown
## [Title]

### 💡 Contexto
[Explanation of the problem and why it's important]

### ✅ O que fazer
- [Practical action 1]
- [Practical action 2]
- [Practical action 3]

### 📚 Norma de Referência
[Norm reference]
```

Quiz format:
```json
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C"],
    "correct_answer": 1
  }
]
```

## 📞 Support

For questions or issues:
1. Check the test files for usage examples
2. Review the type definitions in `src/types/training.ts`
3. Examine the service implementation in `src/services/training-module.ts`
4. Look at the hook implementation in `src/hooks/use-training-modules.ts`
