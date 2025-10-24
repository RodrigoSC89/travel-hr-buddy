/**
 * MMI Forecast IA - Usage Example
 * 
 * This example demonstrates how to use the intelligent forecast
 * generation with GPT-4 for maintenance jobs.
 */

import { generateForecastForJob } from "@/lib/mmi/forecast-ia";
import type { MMIJob, ForecastResult } from "@/lib/mmi/forecast-ia";
import { logger } from "@/lib/logger";

/**
 * Example 1: Basic forecast generation
 */
async function example1_basicForecast() {
  logger.info("=== Example 1: Basic Forecast ===\n");

  const job: MMIJob = {
    id: "job123",
    title: "Inspeção de bombas hidráulicas",
    system: "Hidráulico",
    lastExecuted: "2025-09-01",
    frequencyDays: 30,
    observations: "Ocorreram falhas intermitentes no alarme",
  };

  const forecast: ForecastResult = await generateForecastForJob(job);

  logger.info("Job:", job.title);
  logger.info("System:", job.system);
  logger.info("Last Executed:", job.lastExecuted);
  logger.info("\nForecast Results:");
  logger.info("- Next Due Date:", forecast.next_due_date);
  logger.info("- Risk Level:", forecast.risk_level);
  logger.info("- Reasoning:", forecast.reasoning);
  logger.info("\n");

  return forecast;
}

/**
 * Example 2: Job without execution history
 */
async function example2_newJob() {
  logger.info("=== Example 2: New Job (No History) ===\n");

  const job: MMIJob = {
    id: "job456",
    title: "Verificação de sistema elétrico",
    system: "Elétrico",
    lastExecuted: null,
    frequencyDays: 60,
  };

  const forecast = await generateForecastForJob(job);

  logger.info("Job:", job.title);
  logger.info("System:", job.system);
  logger.info("Last Executed:", job.lastExecuted || "Never");
  logger.info("\nForecast Results:");
  logger.info("- Next Due Date:", forecast.next_due_date);
  logger.info("- Risk Level:", forecast.risk_level);
  logger.info("- Reasoning:", forecast.reasoning);
  logger.info("\n");

  return forecast;
}

/**
 * Example 3: High priority maintenance with detailed observations
 */
async function example3_highPriority() {
  logger.info("=== Example 3: High Priority Maintenance ===\n");

  const job: MMIJob = {
    id: "job789",
    title: "Manutenção de propulsão principal",
    system: "Propulsão",
    lastExecuted: "2025-08-15",
    frequencyDays: 90,
    observations: "Sistema funcionando com vibrações acima do normal. Temperatura do óleo elevada.",
  };

  const forecast = await generateForecastForJob(job);

  logger.info("Job:", job.title);
  logger.info("System:", job.system);
  logger.info("Last Executed:", job.lastExecuted);
  logger.info("Observations:", job.observations);
  logger.info("\nForecast Results:");
  logger.info("- Next Due Date:", forecast.next_due_date);
  logger.info("- Risk Level:", forecast.risk_level);
  logger.info("- Reasoning:", forecast.reasoning);
  logger.info("\n");

  return forecast;
}

/**
 * Example 4: Batch processing multiple jobs
 */
async function example4_batchProcessing() {
  logger.info("=== Example 4: Batch Processing ===\n");

  const jobs: MMIJob[] = [
    {
      id: "job001",
      title: "Troca de filtros de ar",
      system: "HVAC",
      lastExecuted: "2025-09-15",
      frequencyDays: 30,
    },
    {
      id: "job002",
      title: "Calibração de instrumentos",
      system: "Instrumentação",
      lastExecuted: "2025-08-01",
      frequencyDays: 60,
    },
    {
      id: "job003",
      title: "Inspeção de sistema de combate a incêndio",
      system: "Segurança",
      lastExecuted: "2025-07-01",
      frequencyDays: 90,
    },
  ];

  const forecasts = await Promise.all(
    jobs.map(async (job) => {
      try {
        const forecast = await generateForecastForJob(job);
        return { job, forecast, success: true };
      } catch (error) {
        logger.error(`Failed to generate forecast for job ${job.id}:`, error);
        return { job, forecast: null, success: false };
      }
    })
  );

  forecasts.forEach(({ job, forecast, success }) => {
    if (success && forecast) {
      logger.info(`✓ ${job.title}`);
      logger.info(`  Risk: ${forecast.risk_level} | Due: ${forecast.next_due_date}`);
    } else {
      logger.info(`✗ ${job.title} - Failed to generate forecast`);
    }
  });
  logger.info("\n");

  return forecasts;
}

/**
 * Main function to run all examples
 */
async function runExamples() {
  try {
    logger.info("\n" + "=".repeat(60));
    logger.info("MMI Forecast IA - Usage Examples");
    logger.info("=".repeat(60) + "\n");

    await example1_basicForecast();
    await example2_newJob();
    await example3_highPriority();
    await example4_batchProcessing();

    logger.info("=".repeat(60));
    logger.info("All examples completed successfully!");
    logger.info("=".repeat(60) + "\n");
  } catch (error) {
    logger.error("Error running examples:", error);
  }
}

// Export examples for use in other contexts
export {
  example1_basicForecast,
  example2_newJob,
  example3_highPriority,
  example4_batchProcessing,
  runExamples,
};

// Run examples if this file is executed directly
// Uncomment to run:
// runExamples();
