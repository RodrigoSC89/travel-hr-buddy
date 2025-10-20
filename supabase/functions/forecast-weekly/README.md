# Forecast Weekly - Real GPT-4 Intelligence

## 🎯 Overview

Automated weekly maintenance forecasting system powered by GPT-4. This Supabase Edge Function analyzes historical maintenance data and generates intelligent predictions for upcoming maintenance needs.

## ✨ Features

- **🤖 Real GPT-4 Integration**: Uses OpenAI's GPT-4 model for intelligent forecasting
- **📊 Historical Analysis**: Analyzes up to 5 previous executions per job
- **⚠️ Risk Assessment**: Evaluates risk level (baixo, moderado, alto)
- **📅 Date Prediction**: Suggests next execution date based on patterns
- **🧠 Technical Reasoning**: Provides detailed justification for predictions
- **📝 Execution Logging**: Comprehensive logging to cron_execution_logs
- **🔄 Batch Processing**: Processes up to 50 jobs per execution

## 🏗️ Architecture

### Database Tables

#### mmi_logs
Stores execution history for maintenance jobs:

```sql
CREATE TABLE mmi_logs (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES mmi_jobs(id),
  executado_em TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('executado', 'falha', 'adiado', 'cancelado')),
  observacoes TEXT,
  tecnico_responsavel TEXT,
  duracao_minutos INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE
);
```

#### mmi_jobs
Maintenance jobs being forecasted:
- Active jobs with status 'pending' or 'in_progress'
- Contains job details: title, description, component_id

## 🔧 Configuration

### Environment Variables

Required environment variables in Supabase:

```bash
OPENAI_API_KEY=sk-...        # OpenAI API key for GPT-4 access
SUPABASE_URL=https://...     # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=... # Service role key for database access
```

### Deployment

Deploy to Supabase:

```bash
supabase functions deploy forecast-weekly
```

## 📡 API Usage

### Endpoint

```
POST https://<project-ref>.supabase.co/functions/v1/forecast-weekly
```

### Request

No request body required. Can be triggered via HTTP or cron schedule.

### Response

```json
{
  "success": true,
  "message": "Weekly forecast completed successfully",
  "forecasts": [
    {
      "job_id": "uuid",
      "job_nome": "Inspeção da bomba de lastro",
      "data_sugerida": "2025-11-01",
      "risco": "alto",
      "justificativa": "Intervalo se manteve constante, mas sistema reportou falha no último ciclo",
      "historico_analisado": 3
    }
  ],
  "summary": {
    "jobs_processed": 10,
    "forecasts_generated": 10,
    "errors": 0
  }
}
```

## 🧠 GPT-4 Prompt Structure

The function sends structured prompts to GPT-4:

```
Job: [Job Name]
Descrição: [Job Description]
Status Atual: [Current Status]

Últimas execuções:
- [Date] (status)
- [Date] (status)
...

Recomende a próxima execução e avalie o risco técnico com base no histórico.
Responda no seguinte formato:
Data sugerida: YYYY-MM-DD
Risco: [baixo|moderado|alto]
Justificativa: [Análise técnica em até 200 caracteres]
```

### GPT-4 Configuration

- **Model**: `gpt-4`
- **Temperature**: `0.3` (consistent, deterministic results)
- **Role**: "Engenheiro especialista em manutenção offshore"

## 📊 Expected Results

### Example Forecast

**Input:**
- Job: Inspeção da bomba de lastro
- Last executed: 2025-08-01, 2025-05-01, 2025-02-01 (all "executado")

**Output:**
```json
{
  "data_sugerida": "2025-11-01",
  "risco": "alto",
  "justificativa": "Intervalo se manteve constante, mas sistema reportou falha no último ciclo"
}
```

## 🔄 Scheduling

### Manual Invocation

```bash
curl -X POST \
  https://<project-ref>.supabase.co/functions/v1/forecast-weekly \
  -H "Authorization: Bearer <anon-key>"
```

### Cron Schedule

Configure in Supabase Dashboard (Cron Jobs):

```sql
-- Weekly execution every Monday at 6 AM UTC
SELECT cron.schedule(
  'forecast-weekly',
  '0 6 * * 1',
  $$
    SELECT
      net.http_post(
        url:='https://<project-ref>.supabase.co/functions/v1/forecast-weekly',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer <service-role-key>"}'::jsonb
      ) as request_id;
  $$
);
```

## 🧪 Testing

Run tests:

```bash
npm test -- forecast-weekly
```

Test coverage includes:
- GPT-4 response parsing
- History analysis
- Risk level validation
- Date calculation
- Context building

## 📝 Logging

The function logs all executions to `cron_execution_logs`:

```sql
SELECT * FROM cron_execution_logs 
WHERE function_name = 'forecast-weekly'
ORDER BY created_at DESC;
```

Log levels:
- **success**: All forecasts generated successfully
- **warning**: Some jobs had errors
- **error**: Failed to fetch jobs or critical setup issue
- **critical**: Function crashed

## ⚠️ Error Handling

The function handles:
- Missing OPENAI_API_KEY
- No active jobs to forecast
- GPT-4 API failures
- Database query errors
- Individual job processing errors

Errors are logged and don't stop the entire batch.

## 🚀 Integration

### With Service Orders

Use forecasts to create work orders:

```typescript
const { data: forecast } = await supabase
  .from('forecasts')
  .select('*')
  .eq('job_id', jobId)
  .single();

await supabase
  .from('mmi_os')
  .insert({
    job_id: jobId,
    scheduled_date: forecast.data_sugerida,
    priority: forecast.risco,
    notes: forecast.justificativa
  });
```

### With Dashboard

Display forecasts in MMI dashboard:

```typescript
const { data: forecasts } = await supabase
  .from('latest_forecasts')
  .select('*')
  .eq('risco', 'alto')
  .order('data_sugerida', { ascending: true });
```

## 🔐 Security

- Uses Supabase RLS policies
- Service role key for batch operations
- Public read access to mmi_logs for forecasting
- Authenticated writes only

## 📈 Performance

- Processes up to 50 jobs per execution
- GPT-4 API call per job (~1-3 seconds each)
- Total execution time: ~2-5 minutes for 50 jobs
- Logs performance metrics to cron_execution_logs

## 🎯 Requirements Checklist

- [x] ✅ OPENAI_API_KEY configured in Supabase
- [x] ✅ mmi_logs table created with execution history
- [x] ✅ mmi_jobs table with active jobs
- [x] ✅ GPT-4 integration with structured prompts
- [x] ✅ Risk assessment (baixo/moderado/alto)
- [x] ✅ Date prediction with historical analysis
- [x] ✅ Technical justification generation
- [x] ✅ Comprehensive error handling
- [x] ✅ Execution logging to cron_execution_logs

## 🎉 Production Ready

The function is ready for production use with:
- Real GPT-4 intelligence
- Historical data analysis
- Risk-based prioritization
- Automated weekly execution
- Complete observability
