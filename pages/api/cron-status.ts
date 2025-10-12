import type { NextApiRequest, NextApiResponse } from "./next-types";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with service role for admin access
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""
);

interface CronStatusResponse {
  status: "ok" | "warning";
  message: string;
  lastExecution?: string;
  details?: {
    restoreReports?: {
      status: string;
      lastRun?: string;
    };
    assistantReports?: {
      status: string;
      lastRun?: string;
    };
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CronStatusResponse>
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    res.status(405).json({
      status: "warning",
      message: "Method not allowed",
    });
    return;
  }

  try {
    // Check restore report logs - get the most recent execution in the last 24 hours
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const { data: restoreReports, error: restoreError } = await supabase
      .from("restore_report_logs")
      .select("*")
      .gte("executed_at", yesterday.toISOString())
      .order("executed_at", { ascending: false })
      .limit(1);

    // Check assistant report logs - get the most recent execution in the last 24 hours
    const { data: assistantReports, error: assistantError } = await supabase
      .from("assistant_report_logs")
      .select("*")
      .gte("sent_at", yesterday.toISOString())
      .order("sent_at", { ascending: false })
      .limit(1);

    // Determine overall status
    let status: "ok" | "warning" = "ok";
    let message = "Cron diário executado com sucesso nas últimas 24h";
    
    const hasRestoreSuccess = restoreReports && restoreReports.length > 0 && restoreReports[0].status === "success";
    const hasAssistantSuccess = assistantReports && assistantReports.length > 0 && assistantReports[0].status === "success";
    
    // If either job hasn't run or failed, mark as warning
    if (!hasRestoreSuccess || !hasAssistantSuccess) {
      status = "warning";
      
      if (!restoreReports || restoreReports.length === 0) {
        message = "⚠️ Cron de restore não executado nas últimas 24h";
      } else if (restoreReports[0].status !== "success") {
        message = `⚠️ Cron de restore falhou: ${restoreReports[0].message || "Erro desconhecido"}`;
      } else if (!assistantReports || assistantReports.length === 0) {
        message = "⚠️ Cron de relatórios do assistente não executado nas últimas 24h";
      } else if (assistantReports[0].status !== "success") {
        message = `⚠️ Cron de relatórios do assistente falhou: ${assistantReports[0].message || "Erro desconhecido"}`;
      }
    }

    // Get the most recent execution time
    let lastExecution: string | undefined;
    if (restoreReports && restoreReports.length > 0) {
      lastExecution = restoreReports[0].executed_at;
    }
    if (assistantReports && assistantReports.length > 0) {
      const assistantTime = new Date(assistantReports[0].sent_at);
      if (!lastExecution || assistantTime > new Date(lastExecution)) {
        lastExecution = assistantReports[0].sent_at;
      }
    }

    res.status(200).json({
      status,
      message,
      lastExecution,
      details: {
        restoreReports: {
          status: restoreReports && restoreReports.length > 0 ? restoreReports[0].status : "not_run",
          lastRun: restoreReports && restoreReports.length > 0 ? restoreReports[0].executed_at : undefined,
        },
        assistantReports: {
          status: assistantReports && assistantReports.length > 0 ? assistantReports[0].status : "not_run",
          lastRun: assistantReports && assistantReports.length > 0 ? assistantReports[0].sent_at : undefined,
        },
      },
    });
  } catch (error) {
    console.error("Error checking cron status:", error);
    res.status(500).json({
      status: "warning",
      message: "Erro ao verificar status do cron",
    });
  }
}
