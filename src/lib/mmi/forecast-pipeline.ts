/**
 * MMI Forecast Pipeline
 * Complete pipeline orchestrating AI forecast generation and database persistence
 */

import { generateForecastForJob, type MMIJob } from "./forecast-ia";
import { saveForecastToDB } from "./save-forecast";

/**
 * Run complete forecast pipeline for a maintenance job
 * Generates AI forecast and saves it to the database
 * @param job - MMI job data
 * @returns Forecast result
 * @throws Error if generation or save fails
 */
export async function runForecastPipeline(job: MMIJob) {
  // Step 1: Generate AI forecast
  const forecast = await generateForecastForJob(job);

  // Step 2: Save forecast to database
  await saveForecastToDB({
    job_id: job.id,
    system: job.component.name,
    next_due_date: forecast.next_due_date,
    risk_level: forecast.risk_level,
    reasoning: forecast.reasoning,
  });

  return forecast;
}
