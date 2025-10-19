/**
 * MMI Forecast IA - Usage Example
 * 
 * This example demonstrates how to use the intelligent forecast
 * generation with GPT-4 for maintenance jobs.
 */

import { generateForecastForJob, runForecastPipeline } from "@/lib/mmi";
import type { MMIJob, ForecastResult } from "@/lib/mmi";

/**
 * Example 1: Basic forecast generation
 */
async function example1_basicForecast() {
  console.log("=== Example 1: Basic Forecast ===\n");

  const job: MMIJob = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Inspeção de bombas hidráulicas",
    component: {
      name: "Sistema hidráulico do guindaste",
      current_hours: 1200,
      maintenance_interval_hours: 500,
      asset: {
        name: "Guindaste A1",
        vessel: "FPSO Alpha",
      },
    },
    status: "pending",
    priority: "high",
    due_date: "2025-11-30",
  };

  const forecast: ForecastResult = await generateForecastForJob(job);

  console.log("Job:", job.title);
  console.log("Component:", job.component.name);
  console.log("Asset:", job.component.asset?.name);
  console.log("Vessel:", job.component.asset?.vessel);
  console.log("\nForecast Results:");
  console.log("- Next Due Date:", forecast.next_due_date);
  console.log("- Risk Level:", forecast.risk_level);
  console.log("- Reasoning:", forecast.reasoning);
  console.log("\n");

  return forecast;
}

/**
 * Example 2: Complete pipeline with database save
 */
async function example2_completePipeline() {
  console.log("=== Example 2: Complete Pipeline ===\n");

  const job: MMIJob = {
    id: "660e8400-e29b-41d4-a716-446655440001",
    title: "Verificação de sistema elétrico",
    description: "Inspeção periódica do quadro elétrico principal",
    component: {
      name: "Quadro elétrico principal",
      current_hours: 2400,
      maintenance_interval_hours: 1000,
      asset: {
        name: "Gerador 2",
        vessel: "FPSO Beta",
      },
    },
    status: "pending",
    priority: "medium",
    due_date: "2025-12-15",
  };

  // Run complete pipeline: generate forecast AND save to database
  const forecast = await runForecastPipeline(job);

  console.log("Job:", job.title);
  console.log("Component:", job.component.name);
  console.log("\nForecast Results (saved to database):");
  console.log("- Next Due Date:", forecast.next_due_date);
  console.log("- Risk Level:", forecast.risk_level);
  console.log("- Reasoning:", forecast.reasoning);
  console.log("\n");

  return forecast;
}

/**
 * Example 3: High priority critical maintenance
 */
async function example3_highPriority() {
  console.log("=== Example 3: Critical Priority Maintenance ===\n");

  const job: MMIJob = {
    id: "770e8400-e29b-41d4-a716-446655440002",
    title: "Manutenção de propulsão principal",
    description: "Revisão urgente do motor principal com sintomas anormais",
    component: {
      name: "Motor diesel principal",
      current_hours: 4800,
      maintenance_interval_hours: 2000,
      asset: {
        name: "Motor Principal 1",
        vessel: "FPSO Gamma",
      },
    },
    status: "pending",
    priority: "critical",
    due_date: "2025-11-01",
    metadata: {
      observations: "Sistema funcionando com vibrações acima do normal. Temperatura do óleo elevada.",
      last_inspection: "2025-08-15",
      alarm_triggered: true,
    },
  };

  const forecast = await generateForecastForJob(job);

  console.log("Job:", job.title);
  console.log("Component:", job.component.name);
  console.log("Priority:", job.priority);
  console.log("Observations:", job.metadata?.observations);
  console.log("\nForecast Results:");
  console.log("- Next Due Date:", forecast.next_due_date);
  console.log("- Risk Level:", forecast.risk_level);
  console.log("- Reasoning:", forecast.reasoning);
  console.log("\n");

  return forecast;
}

/**
 * Example 4: Batch processing multiple jobs with pipeline
 */
async function example4_batchProcessing() {
  console.log("=== Example 4: Batch Processing with Pipeline ===\n");

  const jobs: MMIJob[] = [
    {
      id: "880e8400-e29b-41d4-a716-446655440003",
      title: "Troca de filtros de ar",
      component: {
        name: "Sistema HVAC - Filtros",
        current_hours: 720,
        maintenance_interval_hours: 720,
        asset: {
          name: "HVAC Central",
          vessel: "FPSO Alpha",
        },
      },
      status: "pending",
      priority: "low",
      due_date: "2025-12-01",
    },
    {
      id: "990e8400-e29b-41d4-a716-446655440004",
      title: "Calibração de instrumentos",
      component: {
        name: "Instrumentação - Sensores de pressão",
        current_hours: 1440,
        maintenance_interval_hours: 1440,
        asset: {
          name: "Painel de controle",
          vessel: "FPSO Beta",
        },
      },
      status: "pending",
      priority: "medium",
      due_date: "2025-11-20",
    },
    {
      id: "aa0e8400-e29b-41d4-a716-446655440005",
      title: "Inspeção de sistema de combate a incêndio",
      component: {
        name: "Sistema de combate a incêndio",
        maintenance_interval_hours: 2160,
        asset: {
          name: "Rede de incêndio",
          vessel: "FPSO Gamma",
        },
      },
      status: "pending",
      priority: "high",
      due_date: "2025-11-15",
    },
  ];

  const forecasts = await Promise.all(
    jobs.map(async (job) => {
      try {
        const forecast = await runForecastPipeline(job);
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
      console.log(`  Component: ${job.component.name}`);
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
    console.log("MMI Forecast Pipeline - Usage Examples");
    console.log("=".repeat(60) + "\n");

    await example1_basicForecast();
    await example2_completePipeline();
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
  example2_completePipeline,
  example3_highPriority,
  example4_batchProcessing,
  runExamples,
};

// Run examples if this file is executed directly
// Uncomment to run:
// runExamples();
