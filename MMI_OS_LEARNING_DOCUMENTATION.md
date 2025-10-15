# MMI OS Learning System - Documentation

## 📋 Overview

The **MMI OS Learning System** is an AI-powered solution that analyzes historical resolved work orders (OS - Ordens de Serviço) to provide intelligent maintenance suggestions for maritime equipment. The system learns from past successful actions and recommends the most effective solutions based on component type and historical effectiveness data.

## 🎯 Key Features

### 1. **Historical OS Tracking**
- Stores detailed information about resolved work orders
- Tracks action effectiveness (efetiva: true/false/null)
- Records execution duration for each action
- Links OS to original maintenance jobs

### 2. **AI-Powered Suggestions**
- Analyzes historical data to recommend actions
- Provides time estimates based on past executions
- Calculates success rates per component
- Identifies most effective solutions

### 3. **Component-Based Learning**
- Groups resolutions by component type
- Tracks effectiveness statistics per component
- Provides comparative analysis across similar cases

### 4. **Intelligent Queries**
- Optimized views for AI feed consumption
- Statistical aggregation functions
- Similar OS resolution search function

## 🗄️ Database Schema

### Tables

#### `mmi_jobs`
Base table for maintenance jobs.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| job_id | TEXT | External job identifier (e.g., JOB-001) |
| title | TEXT | Job title/description |
| status | TEXT | Current status |
| priority | TEXT | Priority level |
| component_name | TEXT | Component requiring maintenance |
| vessel_name | TEXT | Vessel/ship name |

#### `mmi_os_resolvidas`
Historical resolved work orders for AI learning.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| job_id | UUID | Reference to mmi_jobs |
| os_id | TEXT | Unique OS identifier (e.g., OS-123456) |
| componente | TEXT | Component worked on |
| descricao_tecnica | TEXT | Technical problem description |
| acao_realizada | TEXT | Action/procedure performed |
| efetiva | BOOLEAN | Was the action effective? (null=not evaluated) |
| duracao_execucao | INTERVAL | Execution duration |
| causa_confirmada | TEXT | Confirmed root cause |
| resolvido_em | TIMESTAMP | Resolution timestamp |

### Views

#### `mmi_os_ia_feed`
Optimized feed for AI queries - only evaluated OS.

```sql
SELECT * FROM mmi_os_ia_feed;
```

#### `mmi_os_stats_by_component`
Aggregated statistics per component.

```sql
SELECT * FROM mmi_os_stats_by_component 
WHERE componente ILIKE '%válvula%';
```

### Functions

#### `get_similar_os_resolutions(p_componente, p_limit)`
Search for similar resolved OS by component.

```sql
SELECT * FROM get_similar_os_resolutions('Válvula de Controle', 5);
```

## 🚀 API Usage

### Endpoint: `/mmi-copilot`

**Method:** POST

**Request Body:**
```json
{
  "componente": "Válvula de Controle Hidráulico",
  "job_description": "Válvula apresentando resposta lenta aos comandos",
  "job_id": "JOB-004"
}
```

**Response (with historical data):**
```json
{
  "suggestion": "Com base no histórico de 4 resoluções efetivas para o componente 'Válvula de Controle Hidráulico', a ação mais recomendada é: substituição da válvula e recalibração da linha hidráulica. Tempo médio de execução: 3h20. Confirmada como efetiva em 4 registros anteriores.\n\nPontos de atenção:\n- Verificar contaminação no óleo hidráulico\n- Realizar limpeza do circuito antes da instalação\n- Testar calibração após substituição",
  "has_historical_data": true,
  "similar_cases_count": 4,
  "most_effective_action": "Substituição da válvula e recalibração da linha hidráulica",
  "average_duration_hours": 3.33,
  "success_rate": 80.0,
  "ai_generated": true,
  "timestamp": "2025-10-15T01:30:00.000Z"
}
```

**Response (no historical data):**
```json
{
  "message": "Não há histórico de resoluções anteriores para este componente. Recomenda-se seguir o manual de manutenção padrão e documentar a resolução para futuros casos.",
  "has_historical_data": false,
  "componente": "Novo Componente",
  "timestamp": "2025-10-15T01:30:00.000Z"
}
```

## 💻 Frontend Integration

### Using the Copilot API

```typescript
import { getCopilotSuggestion } from "@/services/mmi/jobsApi";

// Get AI suggestion for a maintenance job
const suggestion = await getCopilotSuggestion(
  "Válvula de Controle Hidráulico",
  "Falha intermitente no controle de posição",
  "JOB-004"
);

if (suggestion.has_historical_data) {
  console.log("AI Suggestion:", suggestion.suggestion);
  console.log("Similar cases:", suggestion.similar_cases_count);
  console.log("Success rate:", suggestion.success_rate + "%");
  console.log("Estimated time:", suggestion.average_duration_hours + "h");
}
```

## 📊 Example AI Response

```
🧠 Sugestão da IA Copilot:

Com base no histórico de resoluções para "Válvula de Controle Hidráulico":

✅ AÇÃO MAIS EFICAZ:
Substituição da válvula e recalibração da linha hidráulica.
Verificação de contaminação no óleo.

⏱️ TEMPO ESTIMADO:
3h20 (baseado em 4 casos anteriores)

📈 TAXA DE EFICÁCIA:
80% (4 de 5 tentativas bem-sucedidas)

🔍 CAUSA MAIS COMUM:
Contaminação no óleo hidráulico causando travamento do spool da válvula

⚠️ PONTOS DE ATENÇÃO:
1. Realizar limpeza completa do circuito antes da instalação
2. Verificar qualidade do óleo hidráulico
3. Testar calibração após substituição
4. Documentar leituras de pressão antes e depois

💡 DICA PRÁTICA:
Em casos similares, técnicos reportaram que a limpeza preventiva 
do circuito reduziu reincidências em 60%.
```

## 🧪 Testing

Run the test suite:

```bash
npm test -- mmi-copilot
```

Test files:
- `src/tests/mmi-copilot.test.ts` - Copilot API tests
- `src/tests/mmi-jobs-api.test.ts` - Jobs API tests

## 📈 Statistics and Analytics

### Query Component Statistics

```sql
-- Get effectiveness stats for a component
SELECT * FROM mmi_os_stats_by_component 
WHERE componente = 'Válvula de Controle Hidráulico';

-- Results:
-- componente: "Válvula de Controle Hidráulico"
-- total_ocorrencias: 5
-- resolucoes_efetivas: 4
-- resolucoes_inefetivas: 1
-- taxa_eficacia_pct: 80.00
-- media_duracao_horas_efetivas: 3.33
-- min_duracao_horas: 3.15
-- max_duracao_horas: 4.15
```

### Find Best Practices

```sql
-- Find most effective actions for a component type
SELECT 
  acao_realizada,
  COUNT(*) as vezes_utilizada,
  AVG(EXTRACT(EPOCH FROM duracao_execucao)/3600) as media_horas
FROM mmi_os_resolvidas
WHERE 
  componente ILIKE '%motor%'
  AND efetiva = true
GROUP BY acao_realizada
ORDER BY vezes_utilizada DESC, media_horas ASC;
```

## 🔄 Workflow

1. **Job Creation**: Maintenance job is created in `mmi_jobs`
2. **OS Creation**: Work order (OS) is created when action starts
3. **Action Execution**: Technician performs the maintenance action
4. **Resolution Recording**: OS is marked as resolved in `mmi_os_resolvidas`
5. **Effectiveness Evaluation**: Technician marks if action was effective
6. **AI Learning**: System uses historical data for future suggestions

## 🎓 Machine Learning Approach

The system uses a **retrieval-based learning** approach:

1. **Similarity Search**: Finds past cases with similar components
2. **Statistical Analysis**: Calculates success rates and average durations
3. **Context Building**: Aggregates historical context for AI
4. **AI Enhancement**: Uses GPT-4 to generate actionable suggestions
5. **Continuous Learning**: Each new resolved OS improves future suggestions

## 🔐 Security

- **Row Level Security (RLS)**: Enabled on all tables
- **Authentication Required**: Only authenticated users can access data
- **API Key Protection**: Supabase functions use service role key
- **CORS Headers**: Properly configured for frontend access

## 🚢 Real-World Example

**Scenario**: Hydraulic valve failure on vessel "Atlantic Star"

1. Job created: "Reparo em válvula de controle hidráulico"
2. AI Copilot consulted:
   - Found 4 similar cases
   - Success rate: 80%
   - Recommended action: "Valve replacement + line recalibration"
   - Estimated time: 3h20
3. Technician follows suggestion
4. Action completed in 3h45
5. Marked as effective
6. System learns: New data point improves future suggestions

## 📚 Migration

The schema is created in:
```
supabase/migrations/20251015013000_create_mmi_os_learning_system.sql
```

Apply migration:
```bash
supabase db push
```

## 🤝 Contributing

To add new sample data:

```sql
INSERT INTO mmi_os_resolvidas (
  os_id, componente, descricao_tecnica, acao_realizada,
  resolvido_em, duracao_execucao, efetiva, causa_confirmada
) VALUES (
  'OS-999999',
  'Your Component',
  'Technical description',
  'Action performed',
  NOW(),
  INTERVAL '4 hours',
  true,
  'Root cause'
);
```

## 📞 Support

For issues or questions about the MMI OS Learning System:
- Check the database views and functions
- Review the AI Copilot API logs
- Test with sample data provided in migration

---

**Last Updated**: 2025-10-15
**Version**: 1.0.0
