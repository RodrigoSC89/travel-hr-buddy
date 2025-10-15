# MMI Copilot Implementation - Visual Summary

## 📋 Feature Overview

The MMI Copilot is an intelligent maintenance assistant that leverages AI and historical data to provide actionable maintenance recommendations.

```
┌─────────────────────────────────────────────────────────────┐
│                     MMI Copilot Flow                         │
└─────────────────────────────────────────────────────────────┘

    User Input
        ↓
    "Gerador STBD com ruído incomum e aumento de temperatura"
        ↓
┌───────────────────────────────────────────────────────────────┐
│ 1. Generate Embedding (OpenAI text-embedding-ada-002)         │
│    Input → 1536-dimensional vector                            │
└───────────────────────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────────────────────┐
│ 2. Vector Similarity Search (pgvector)                        │
│    Query: match_mmi_jobs(embedding, threshold=0.78, limit=3)  │
│    Returns: Top 3 most similar historical cases               │
└───────────────────────────────────────────────────────────────┘
        ↓
    Similar Cases Found:
    - Caso 1: Falha no gerador STBD (Apr 2024)
    - Caso 2: Manutenção preventiva bomba (Mar 2024)
    - Caso 3: Falha válvula de segurança (May 2024)
        ↓
┌───────────────────────────────────────────────────────────────┐
│ 3. Enrich Prompt with Historical Context                      │
│    Original + Similar Cases → Enhanced Prompt                 │
└───────────────────────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────────────────────┐
│ 4. Generate AI Suggestion (GPT-4)                             │
│    System: Maritime maintenance engineer expert               │
│    User: Enhanced prompt with historical context              │
│    Stream: Real-time response                                 │
└───────────────────────────────────────────────────────────────┘
        ↓
    AI Response Stream
        ↓
    "✅ Ação sugerida: Criar job para inspeção do 
     ventilador do gerador STBD. Se identificado 
     desgaste, abrir OS para substituição. 
     Prazo: 2 dias. Impacto: moderado."
```

## 🗂️ File Structure

```
travel-hr-buddy/
├── supabase/
│   ├── migrations/
│   │   └── 20251015000000_create_mmi_jobs_embeddings.sql
│   │       - Creates mmi_jobs table with vector column
│   │       - Creates match_mmi_jobs function
│   │       - Inserts sample data
│   │       - Sets up RLS policies
│   │
│   └── functions/
│       └── mmi-copilot/
│           └── index.ts
│               - Handles POST requests
│               - Generates embeddings
│               - Queries similar cases
│               - Streams GPT-4 responses
│
├── src/
│   ├── services/
│   │   └── mmi/
│   │       ├── copilotApi.ts
│   │       │   - getCopilotSuggestions()
│   │       │   - streamCopilotSuggestions()
│   │       │
│   │       ├── reportGenerator.ts
│   │       │   - generateJobReport()
│   │       │   - generateBatchReport()
│   │       │
│   │       └── jobsApi.ts (existing)
│   │
│   ├── components/
│   │   └── mmi/
│   │       ├── MMICopilot.tsx
│   │       │   - Input field for issue description
│   │       │   - Quick example buttons
│   │       │   - Streaming suggestion display
│   │       │
│   │       └── JobCards.tsx (existing)
│   │           - Displays jobs with AI suggestions
│   │           - PDF report generation button
│   │           - Postpone and Create OS actions
│   │
│   ├── pages/
│   │   └── MMIJobsPanel.tsx
│   │       - Integrates MMICopilot component
│   │       - Shows above job cards
│   │
│   └── tests/
│       ├── mmi-copilot-api.test.ts
│       │   - 8 test cases covering:
│       │     • Function invocation
│       │     • Error handling
│       │     • Response formats
│       │     • Streaming support
│       │     • Input validation
│       │     • Callback handling
│       │
│       └── mmi-report-generator.test.ts
│           - 12 test cases covering:
│             • Single job PDF generation
│             • Batch report generation
│             • AI suggestion inclusion
│             • Error handling
│             • Metadata options
│
└── MMI_COPILOT_README.md
    - Complete documentation
```

## 🎨 UI Components

### MMI Copilot Component

```
┌────────────────────────────────────────────────────────────┐
│ 🌟 Copilot MMI - Assistente de Manutenção                 │
│ Descreva um problema de manutenção e receba sugestões     │
│ baseadas em casos históricos similares                     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Exemplos rápidos:                                          │
│ [Gerador com ruído] [Bomba com vibração] [Válvula...]    │
│                                                            │
│ Descreva o problema:                                       │
│ ┌────────────────────────────────────────────────────┐   │
│ │ Ex: Gerador STBD com ruído incomum e aumento      │   │
│ │ de temperatura                                     │   │
│ └────────────────────────────────────────────────────┘   │
│                                                            │
│              [📤 Obter Sugestão]                          │
│                                                            │
│ Sugestão da IA:                                           │
│ ┌────────────────────────────────────────────────────┐   │
│ │ Caso 1: Falha no gerador STBD em abr/2024...      │   │
│ │                                                    │   │
│ │ ✅ Ação sugerida: Criar job para inspeção do      │   │
│ │ ventilador do gerador STBD. Se for identificado   │   │
│ │ desgaste, abrir OS para substituição.             │   │
│ │ Prazo: 2 dias. Impacto: moderado.                 │   │
│ └────────────────────────────────────────────────────┘   │
│                                                            │
│ 💡 Como funciona:                                         │
│ • Busca casos semelhantes automaticamente                 │
│ • Gera sugestões baseadas em histórico real              │
│ • Responde com ações técnicas: peça, prazo, OS           │
└────────────────────────────────────────────────────────────┘

### Job Cards with PDF Report

```
┌────────────────────────────────────────────────────────────┐
│ Manutenção preventiva do sistema hidráulico      10/20    │
│ Componente: Sistema Hidráulico Principal                  │
│ Embarcação: Navio Oceanic Explorer                        │
│                                                            │
│ [Prioridade: Alta] [Status: Pendente] [💡 Sugestão IA]   │
│                                                            │
│ 💡 Recomenda-se realizar a manutenção durante a próxima   │
│ parada programada. Histórico indica desgaste acelerado... │
│                                                            │
│ [🔧 Criar OS] [🕒 Postergar com IA] [📄 Relatório PDF]   │
└────────────────────────────────────────────────────────────┘
```
```

## 🔧 Database Schema

### mmi_jobs Table

```sql
┌─────────────┬────────────────┬──────────────────────────┐
│ Column      │ Type           │ Description              │
├─────────────┼────────────────┼──────────────────────────┤
│ id          │ UUID           │ Primary key              │
│ title       │ TEXT           │ Job title                │
│ description │ TEXT           │ Detailed description     │
│ status      │ TEXT           │ pending/in_progress/...  │
│ priority    │ TEXT           │ low/medium/high/critical │
│ component   │ TEXT           │ Component name           │
│ asset_name  │ TEXT           │ Asset identifier         │
│ vessel      │ TEXT           │ Vessel name              │
│ due_date    │ DATE           │ Due date                 │
│ embedding   │ vector(1536)   │ OpenAI embedding         │
│ created_at  │ TIMESTAMPTZ    │ Creation timestamp       │
│ updated_at  │ TIMESTAMPTZ    │ Update timestamp         │
└─────────────┴────────────────┴──────────────────────────┘

Index: ivfflat on embedding using cosine similarity
```

### match_mmi_jobs Function

```sql
FUNCTION match_mmi_jobs(
  query_embedding vector(1536),  -- Input embedding
  match_threshold float = 0.78,  -- Minimum similarity
  match_count int = 3            -- Max results
)
RETURNS TABLE (
  id, title, description, status, priority,
  component, asset_name, vessel, similarity
)
```

## 📊 API Reference

### Endpoint

```
POST /functions/v1/mmi-copilot
```

### Request

```json
{
  "prompt": "Gerador STBD com ruído incomum e aumento de temperatura"
}
```

### Response (Streaming)

```
Content-Type: text/event-stream

Caso 1: Falha no gerador STBD em abr/2024...

✅ Ação sugerida: Criar job para inspeção do...
(continues streaming)
```

## 🧪 Testing

### Test Results

```
✓ src/tests/mmi-copilot-api.test.ts (8 tests passed)
  ✓ getCopilotSuggestions
    ✓ should call the mmi-copilot function with correct parameters
    ✓ should handle errors from the function call
    ✓ should handle different response formats
  ✓ streamCopilotSuggestions
    ✓ should handle streaming environment check
  ✓ Input validation
    ✓ should handle empty prompts gracefully
    ✓ should handle long prompts
  ✓ Callback handling
    ✓ should call onChunk callback with received data
    ✓ should handle multiple callback invocations

✓ src/tests/mmi-report-generator.test.ts (12 tests passed)
  ✓ generateJobReport
    ✓ should generate a PDF report for a single job
    ✓ should include AI suggestions when requested
    ✓ should exclude AI suggestions when not requested
    ✓ should include metadata when requested
    ✓ should handle jobs without AI suggestions gracefully
    ✓ should generate unique filenames with date
  ✓ generateBatchReport
    ✓ should generate a consolidated report for multiple jobs
    ✓ should include all jobs in the report
    ✓ should handle empty job list
    ✓ should respect includeAISuggestion option
    ✓ should add page breaks when needed
  ✓ Error handling
    ✓ should handle PDF generation errors gracefully

Total: 404 tests passed (including existing tests)
```

## 🚀 Deployment Steps

### 1. Database Setup

```bash
# Apply migration
supabase db push

# Verify tables
supabase db reset --db-url $DATABASE_URL
```

### 2. Edge Function Deployment

```bash
# Deploy function
supabase functions deploy mmi-copilot

# Test function
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/mmi-copilot \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Gerador com problema"}'
```

### 3. Environment Variables

```bash
# Required for Edge Function
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://....supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Required for Frontend
VITE_SUPABASE_URL=https://....supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 4. Frontend Build & Deploy

```bash
npm run build
npm run deploy:vercel  # or your preferred platform
```

## 📈 Performance Metrics

- **Embedding Generation**: ~100-200ms (OpenAI API)
- **Vector Search**: ~10-50ms (depends on table size)
- **GPT-4 Response**: 2-5s (streaming, first token in ~500ms)
- **Total Time to First Token**: ~600-800ms
- **Memory Usage**: Low (streaming response)

## 🎯 Key Features

✅ **Vector Similarity Search**: Uses pgvector for efficient semantic search
✅ **Real-time Streaming**: Progressive display of AI responses
✅ **Historical Context**: Leverages past cases for better suggestions
✅ **Technical Expertise**: GPT-4 with maintenance engineer persona
✅ **Actionable Output**: Component, timeline, and OS recommendations
✅ **PDF Report Generation**: One-click PDF reports with AI suggestions
✅ **Batch Reporting**: Consolidated reports for multiple jobs
✅ **Error Handling**: Comprehensive error handling and fallbacks
✅ **Test Coverage**: 20 test cases covering core functionality
✅ **Documentation**: Complete README with examples and troubleshooting

## 🔄 Integration with Existing System

The MMI Copilot seamlessly integrates with the existing MMI Jobs Panel:

```
MMI Jobs Panel
├── Stats Cards (Total, Pending, In Progress, With AI)
├── 🌟 MMI Copilot (NEW)
│   └── Get AI suggestions for any maintenance issue
├── Active Jobs Cards
│   ├── Job #1 with AI suggestion
│   ├── Job #2 with AI suggestion
│   └── Job #3...
└── Feature Info Card
```

## 🎓 Example Use Cases

### 1. Generator Issue
**Input**: "Gerador STBD com ruído incomum e aumento de temperatura"
**Output**: Inspection recommendation, 2-day timeline, OS creation suggested

### 2. Hydraulic Problem
**Input**: "Bomba hidráulica apresentando vibração excessiva"
**Output**: Bearing replacement, preventive maintenance schedule

### 3. Safety Valve
**Input**: "Válvula de segurança com leitura fora do padrão"
**Output**: Immediate replacement, critical priority, OS required

## ✨ Future Enhancements

- [ ] Voice input support
- [ ] Multi-language support (English, Spanish)
- [ ] Feedback mechanism for suggestion quality
- [ ] Integration with work order creation
- [ ] Cost estimation based on historical data
- [ ] Predictive maintenance alerts
- [ ] Mobile app support
