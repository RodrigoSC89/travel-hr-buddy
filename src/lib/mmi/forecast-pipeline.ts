import { generateForecastForJob } from './forecast-ia'
import { saveForecastToDB } from './save-forecast'
import type { MMIJob } from '@/types/mmi'

export async function runForecastPipeline(job: MMIJob) {
  const forecast = await generateForecastForJob(job)
  await saveForecastToDB({
    job_id: job.id,
    system: job.component?.name || job.component_name || 'Sistema não especificado',
    next_due_date: forecast.next_due_date,
    risk_level: forecast.risk_level,
    reasoning: forecast.reasoning,
  })
}
