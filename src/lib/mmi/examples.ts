/**
 * MMI Forecast IA - Usage Example
 * 
 * This example demonstrates how to use the intelligent forecast
 * generation with GPT-4 for maintenance jobs.
 */

import { generateForecastForJob } from "@/lib/mmi/forecast-ia";
import type { MMIJob, ForecastResult } from "@/lib/mmi/forecast-ia";

/**
 * Example 1: Basic forecast generation
 */
async function example1_basicForecast() {
  console.log("=== Example 1: Basic Forecast ===\n");

  const job: MMIJob = {
    id: "job123",
    title: "Inspeção de bombas hidráulicas",
    system: "Hidráulico",
    lastExecuted: "2025-09-01",
    frequencyDays: 30,
    observations: "Ocorreram falhas intermitentes no alarme",
  };

  const forecast: ForecastResult = await generateForecastForJob(job);

  console.log("Job:", job.title);
  console.log("System:", job.system);
  console.log("Last Executed:", job.lastExecuted);
  console.log("\nForecast Results:");
  console.log("- Next Due Date:", forecast.next_due_date);
  console.log("- Risk Level:", forecast.risk_level);
  console.log("- Reasoning:", forecast.reasoning);
  console.log("\n");

  return forecast;
}

/**
 * Example 2: Job without execution history
 */
async function example2_newJob() {
  console.log("=== Example 2: New Job (No History) ===\n");

  const job: MMIJob = {
    id: "job456",
    title: "Verificação de sistema elétrico",
    system: "Elétrico",
    lastExecuted: null,
    frequencyDays: 60,
  };

  const forecast = await generateForecastForJob(job);

  console.log("Job:", job.title);
  console.log("System:", job.system);
  console.log("Last Executed:", job.lastExecuted || "Never");
  console.log("\nForecast Results:");
  console.log("- Next Due Date:", forecast.next_due_date);
  console.log("- Risk Level:", forecast.risk_level);
  console.log("- Reasoning:", forecast.reasoning);
  console.log("\n");

  return forecast;
}

/**
 * Example 3: High priority maintenance with detailed observations
 */
async function example3_highPriority() {
  console.log("=== Example 3: High Priority Maintenance ===\n");

  const job: MMIJob = {
    id: "job789",
    title: "Manutenção de propulsão principal",
    system: "Propulsão",
    lastExecuted: "2025-08-15",
    frequencyDays: 90,
    observations: "Sistema funcionando com vibrações acima do normal. Temperatura do óleo elevada.",
  };

  const forecast = await generateForecastForJob(job);

  console.log("Job:", job.title);
  console.log("System:", job.system);
  console.log("Last Executed:", job.lastExecuted);
  console.log("Observations:", job.observations);
  console.log("\nForecast Results:");
  console.log("- Next Due Date:", forecast.next_due_date);
  console.log("- Risk Level:", forecast.risk_level);
  console.log("- Reasoning:", forecast.reasoning);
  console.log("\n");

  return forecast;
}

/**
 * Example 4: Batch processing multiple jobs
 */
async function example4_batchProcessing() {
  console.log("=== Example 4: Batch Processing ===\n");

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
        console.error(`Failed to generate forecast for job ${job.id}:`, error);
        return { job, forecast: null, success: false };
      }
    })
  );

  forecasts.forEach(({ job, forecast, success }) => {
    if (success && forecast) {
      console.log(`✓ ${job.title}`);
      console.log(`  Risk: ${forecast.risk_level} | Due: ${forecast.next_due_date}`);
    } else {
      console.log(`✗ ${job.title} - Failed to generate forecast`);
    }
  });
  console.log("\n");

  return forecasts;
}

/**
 * Main function to run all examples
 */
async function runExamples() {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("MMI Forecast IA - Usage Examples");
    console.log("=".repeat(60) + "\n");

    await example1_basicForecast();
    await example2_newJob();
    await example3_highPriority();
    await example4_batchProcessing();

    console.log("=".repeat(60));
    console.log("All examples completed successfully!");
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("Error running examples:", error);
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
