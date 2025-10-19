/**
 * Example usage of the MMI Forecast Pipeline (Etapa 2)
 * 
 * This file demonstrates how to use the new forecast pipeline
 * to generate AI predictions and save them to the database.
 */

import { runForecastPipeline, generateForecastForJob, saveForecastToDB } from "@/lib/mmi";
import type { MMIJob } from "@/types/mmi";

/**
 * Example 1: Complete Pipeline
 * Generates forecast with AI and saves to database in one call
 */
async function exampleCompletePipeline() {
  const job: MMIJob = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Manutenção preventiva - Sistema hidráulico do guindaste",
    component: {
      name: "Sistema hidráulico do guindaste",
      asset: {
        name: "Guindaste principal A1",
        vessel: "FPSO Alpha",
      },
    },
    status: "pending",
    priority: "high",
    due_date: "2025-11-30",
    component_name: "Guindaste A1",
  };

  try {
    await runForecastPipeline(job);
    console.log("✅ Forecast gerado e salvo com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao processar job:", error);
  }
}

/**
 * Example 2: Step by Step
 * Generate forecast and save separately for more control
 */
async function exampleStepByStep() {
  const job: MMIJob = {
    id: "660f9511-f3ac-52e5-b827-557766551111",
    title: "Verificação do sistema elétrico",
    component: {
      name: "Sistema elétrico principal",
      asset: {
        name: "Gerador diesel",
        vessel: "FPSO Beta",
      },
    },
    status: "pending",
    priority: "medium",
    due_date: "2025-12-15",
    component_name: "Gerador principal",
  };

  try {
    // Step 1: Generate forecast with AI
    console.log("⏳ Gerando forecast com IA...");
    const forecast = await generateForecastForJob(job);
    console.log("📊 Forecast gerado:", forecast);

    // Step 2: Save to database
    console.log("💾 Salvando no banco de dados...");
    await saveForecastToDB({
      job_id: job.id,
      system: job.component?.name || job.component_name || "Sistema não especificado",
      next_due_date: forecast.next_due_date,
      risk_level: forecast.risk_level,
      reasoning: forecast.reasoning,
    });
    console.log("✅ Forecast salvo com sucesso!");
  } catch (error) {
    console.error("❌ Erro:", error);
  }
}

/**
 * Example 3: Batch Processing
 * Process multiple jobs in sequence
 */
async function exampleBatchProcessing() {
  const jobs: MMIJob[] = [
    {
      id: "job-1",
      title: "Manutenção sistema hidráulico",
      component: {
        name: "Sistema hidráulico",
        asset: { name: "Guindaste A1", vessel: "FPSO Alpha" },
      },
      status: "pending",
      priority: "high",
      due_date: "2025-11-30",
      component_name: "Guindaste A1",
    },
    {
      id: "job-2",
      title: "Verificação sistema elétrico",
      component: {
        name: "Sistema elétrico",
        asset: { name: "Gerador", vessel: "FPSO Alpha" },
      },
      status: "pending",
      priority: "medium",
      due_date: "2025-12-05",
      component_name: "Gerador",
    },
  ];

  console.log(`📋 Processando ${jobs.length} jobs...`);

  for (const job of jobs) {
    try {
      console.log(`⏳ Processando job ${job.id}...`);
      await runForecastPipeline(job);
      console.log(`✅ Job ${job.id} processado com sucesso!`);
    } catch (error) {
      console.error(`❌ Erro ao processar job ${job.id}:`, error);
    }
  }

  console.log("🎉 Batch processing concluído!");
}

/**
 * Example 4: Error Handling
 * Demonstrates proper error handling
 */
async function exampleWithErrorHandling() {
  const job: MMIJob = {
    id: "test-job-id",
    title: "Teste de manutenção",
    component: {
      name: "Componente teste",
      asset: { name: "Asset teste", vessel: "Vessel teste" },
    },
    status: "pending",
    priority: "low",
    due_date: "2025-12-31",
    component_name: "Componente teste",
  };

  try {
    await runForecastPipeline(job);
    console.log("✅ Sucesso!");
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Erro capturado:", {
        message: error.message,
        stack: error.stack,
      });
      
      // Handle specific error types
      if (error.message.includes("IA")) {
        console.log("💡 Erro na geração de forecast pela IA");
        // Implementar lógica de retry ou fallback
      } else if (error.message.includes("salvar")) {
        console.log("💡 Erro ao salvar no banco de dados");
        // Implementar lógica de retry
      }
    }
  }
}

// Export examples for use in other files
export {
  exampleCompletePipeline,
  exampleStepByStep,
  exampleBatchProcessing,
  exampleWithErrorHandling,
};
