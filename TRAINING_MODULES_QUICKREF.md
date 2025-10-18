# Training Modules & Audit Export - Quick Reference

## 🚀 Quick Start

### Generate Training Module
```typescript
import { useTrainingModules } from '@/hooks/use-training-modules'

const { generateModule } = useTrainingModules()

await generateModule({
  gapDetected: 'Falha na verificação de alarme de falha de sistema DP',
  normReference: 'IMCA M220 4.3.1'
})
```

### List Training Modules
```tsx
import { TrainingModulesList } from '@/components/training'

<TrainingModulesList vesselId="optional-vessel-id" />
```

### Export Audit Bundle
```tsx
import { ExportAuditBundleForm } from '@/components/training'

<ExportAuditBundleForm />
```

## 📋 Database Tables

### `training_modules`
- Stores AI-generated training content
- Quiz questions with correct answers
- Linked to audits and vessels

### `training_completions`
- Tracks user completions
- Quiz scores and pass/fail status
- Per-vessel tracking

## 🔌 API Endpoints

### `/functions/v1/generate-training-module`
Generate training content from audit gaps using AI

### `/functions/v1/export-audit-bundle`
Export structured audit data for external entities

## 📦 Components

### `<GenerateTrainingModuleForm />`
Form to generate training modules

### `<TrainingModulesList />`
Display active training modules

### `<ExportAuditBundleForm />`
Form to export audit bundles

## 🔑 Key Features

✅ AI-powered training content generation
✅ Automatic quiz creation (3 questions)
✅ Score calculation (70% to pass)
✅ Per-vessel completion tracking
✅ Structured audit export (JSON)
✅ Compliance statistics
✅ Row Level Security (RLS)

## 📖 Full Documentation
See `TRAINING_MODULES_IMPLEMENTATION_GUIDE.md` for complete details.
