# MMI OS Learning - Quick Reference

## 🚀 Quick Start

### Call the Copilot API

```typescript
import { getCopilotSuggestion } from "@/services/mmi/jobsApi";

const suggestion = await getCopilotSuggestion(
  "Válvula de Controle Hidráulico",  // Component name
  "Falha intermitente no controle",   // Optional: problem description
  "JOB-004"                            // Optional: job ID
);

console.log(suggestion.suggestion);
```

## 📊 Database Quick Queries

### Find Similar Resolutions
```sql
SELECT * FROM get_similar_os_resolutions('Válvula de Controle', 5);
```

### Component Statistics
```sql
SELECT * FROM mmi_os_stats_by_component 
WHERE componente ILIKE '%motor%';
```

### All Effective Resolutions
```sql
SELECT * FROM mmi_os_ia_feed LIMIT 10;
```

## 🔧 Add New OS Resolution

```sql
INSERT INTO mmi_os_resolvidas (
  os_id, componente, descricao_tecnica, acao_realizada,
  resolvido_em, duracao_execucao, efetiva, causa_confirmada
) VALUES (
  'OS-123456',
  'Motor Principal',
  'Queda de pressão no sistema de lubrificação',
  'Troca de filtros e bomba auxiliar',
  NOW(),
  INTERVAL '6 hours',
  true,
  'Filtros saturados e bomba com desgaste'
);
```

## 📡 API Response Structure

```typescript
interface CopilotSuggestion {
  suggestion: string;                    // AI-generated suggestion
  has_historical_data: boolean;          // Has past data?
  similar_cases_count?: number;          // Number of similar cases
  most_effective_action?: string;        // Most effective action
  average_duration_hours?: number;       // Average duration
  success_rate?: number;                 // Success rate %
  ai_generated?: boolean;                // Used OpenAI?
  timestamp: string;                     // ISO timestamp
}
```

## 🧪 Testing

```bash
# Run all MMI tests
npm test -- mmi

# Run only Copilot tests
npm test -- mmi-copilot

# Run with coverage
npm test -- --coverage mmi
```

## 📈 Example Use Cases

### 1. Get Suggestion for New Job
```typescript
const suggestion = await getCopilotSuggestion("Sistema Hidráulico");
if (suggestion.has_historical_data) {
  alert(`Ação recomendada: ${suggestion.most_effective_action}`);
  alert(`Tempo estimado: ${suggestion.average_duration_hours}h`);
}
```

### 2. Display Statistics
```typescript
const suggestion = await getCopilotSuggestion("Motor Principal");
console.log(`Taxa de sucesso: ${suggestion.success_rate}%`);
console.log(`${suggestion.similar_cases_count} casos similares encontrados`);
```

### 3. No Historical Data
```typescript
const suggestion = await getCopilotSuggestion("Componente Novo");
if (!suggestion.has_historical_data) {
  console.log("Primeiro caso deste componente - documentar resolução!");
}
```

## 🗺️ Architecture

```
Frontend (React/TypeScript)
    ↓
jobsApi.getCopilotSuggestion()
    ↓
Supabase Edge Function (/mmi-copilot)
    ↓
Database Query (get_similar_os_resolutions)
    ↓
OpenAI GPT-4 (AI enhancement)
    ↓
Return intelligent suggestion
```

## 🔐 Environment Variables

Required in Supabase:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` (optional - falls back to data-only)

## 📝 Files to Know

| File | Purpose |
|------|---------|
| `supabase/migrations/20251015013000_create_mmi_os_learning_system.sql` | Database schema |
| `supabase/functions/mmi-copilot/index.ts` | Edge function API |
| `src/services/mmi/jobsApi.ts` | Frontend API client |
| `src/tests/mmi-copilot.test.ts` | Tests |
| `MMI_OS_LEARNING_DOCUMENTATION.md` | Full docs |

## ⚡ Performance

- Database function: ~50ms
- With OpenAI: ~2-5s
- Without OpenAI: ~500ms
- Indexes on: `componente`, `efetiva`, `resolvido_em`

## 🎯 Best Practices

1. **Always mark effectiveness**: Set `efetiva` to `true/false` after validating
2. **Record durations accurately**: Use actual execution time
3. **Document root causes**: Fill `causa_confirmada` for better learning
4. **Link to jobs**: Use `job_id` reference when possible
5. **Add evidence**: Store photos/docs in `evidencia_url`

## 🆘 Troubleshooting

### No suggestions returned?
- Check if component name exists in `mmi_os_resolvidas`
- Verify `efetiva IS NOT NULL` in database
- Check Edge Function logs in Supabase

### Low success rates?
- Review past resolutions marked as `efetiva = false`
- Analyze `causa_confirmada` patterns
- Check if actions are being documented correctly

### API errors?
- Verify Supabase credentials
- Check OpenAI API key (if using AI enhancement)
- Review Edge Function logs

---

**Version**: 1.0.0
**Last Updated**: 2025-10-15
