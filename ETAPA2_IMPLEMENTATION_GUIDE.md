# MMI Forecast Pipeline - Etapa 2

## 📦 Supabase: Tabela mmi_forecasts

A tabela `mmi_forecasts` foi atualizada para suportar os novos campos necessários para a integração com IA:

```sql
ALTER TABLE public.mmi_forecasts 
  ADD COLUMN job_id UUID REFERENCES public.mmi_jobs(id),
  ADD COLUMN system TEXT,
  ADD COLUMN next_due_date DATE,
  ADD COLUMN risk_level TEXT CHECK (risk_level IN ('baixo', 'médio', 'alto')),
  ADD COLUMN reasoning TEXT;
```

### Campos da Tabela

- `id`: UUID primário
- `job_id`: Referência para o job de manutenção (mmi_jobs)
- `system`: Nome do sistema (copiado do job)
- `next_due_date`: Data prevista para próxima manutenção (gerada pela IA)
- `risk_level`: Nível de risco ('baixo', 'médio', 'alto')
- `reasoning`: Justificativa técnica da IA para a previsão
- `created_at`: Data de criação
- `updated_at`: Data de atualização

## ✅ Função /lib/mmi/save-forecast.ts

Salva uma previsão no banco de dados Supabase.

```typescript
import { saveForecastToDB } from '@/lib/mmi'

type Forecast = {
  job_id: string
  system: string
  next_due_date: string
  risk_level: 'baixo' | 'médio' | 'alto'
  reasoning: string
}

// Exemplo de uso
await saveForecastToDB({
  job_id: 'uuid-do-job',
  system: 'Sistema hidráulico',
  next_due_date: '2025-12-15',
  risk_level: 'médio',
  reasoning: 'Baseado no histórico de manutenção...'
})
```

## ✅ Função /lib/mmi/forecast-ia.ts

Gera previsão usando GPT-4 com base nos dados do job.

```typescript
import { generateForecastForJob } from '@/lib/mmi'
import type { MMIJob } from '@/types/mmi'

// Exemplo de uso
const job: MMIJob = {
  id: 'job-uuid',
  title: 'Manutenção preventiva do guindaste',
  component: {
    name: 'Sistema hidráulico',
    asset: {
      name: 'Guindaste A1',
      vessel: 'FPSO Alpha'
    }
  },
  status: 'pending',
  priority: 'high',
  due_date: '2025-11-30'
}

const forecast = await generateForecastForJob(job)
// Retorna:
// {
//   next_due_date: '2025-12-15',
//   risk_level: 'médio',
//   reasoning: 'Justificativa técnica da IA...'
// }
```

### Características da IA

- Usa GPT-4 (modelo `gpt-4o`)
- Análise de risco baseada em dados do job
- Linguagem técnica apropriada em português brasileiro
- Fallback automático em caso de erro

## ✅ Pipeline Completo

Combina geração de forecast com IA e salvamento no banco:

```typescript
import { runForecastPipeline } from '@/lib/mmi'

// Executa o pipeline completo
await runForecastPipeline(job)
```

Isso irá:
1. Gerar previsão com IA usando `generateForecastForJob()`
2. Salvar a previsão no banco usando `saveForecastToDB()`

## 🔄 Fluxo de Integração

```
MMIJob → generateForecastForJob() → AIForecast → saveForecastToDB() → Database
```

1. **Input**: Job de manutenção com informações do componente e vessel
2. **Processamento IA**: GPT-4 analisa e gera previsão
3. **Output**: Forecast salvo no banco com job_id, system, next_due_date, risk_level e reasoning

## 📋 Exemplo Completo

```typescript
import { runForecastPipeline } from '@/lib/mmi'
import type { MMIJob } from '@/types/mmi'

async function processMaintenanceJob(job: MMIJob) {
  try {
    await runForecastPipeline(job)
    console.log('Forecast gerado e salvo com sucesso!')
  } catch (error) {
    console.error('Erro ao processar job:', error)
  }
}

// Usar em um job específico
const job: MMIJob = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Manutenção preventiva - Sistema hidráulico',
  component: {
    name: 'Sistema hidráulico do guindaste',
    asset: {
      name: 'Guindaste principal A1',
      vessel: 'FPSO Alpha'
    }
  },
  status: 'pending',
  priority: 'high',
  due_date: '2025-11-30',
  component_name: 'Guindaste A1'
}

await processMaintenanceJob(job)
```

## 🔐 Variáveis de Ambiente

Certifique-se de configurar as seguintes variáveis:

```env
VITE_OPENAI_API_KEY=sk-...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

## 🧪 Testes

Os testes estão em `src/tests/mmi-forecast-pipeline.test.ts` e validam:

- Estrutura de dados do forecast
- Valores válidos para risk_level
- Formato de datas
- Mapeamento de dados do job para forecast
- Tratamento de erros

Execute os testes com:
```bash
npm run test
```

## 🧩 Próxima Etapa

Com a Etapa 2 completa, temos:

✅ Geração de previsão com IA (GPT-4)
✅ Salvamento de previsão no banco

🧭 **Próxima Etapa**: Gerar OS (Ordem de Serviço) automaticamente
