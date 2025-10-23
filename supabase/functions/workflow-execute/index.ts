// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { workflow_id, action, step_index, approval } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("Lovable AI API key not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get workflow
    const { data: workflow, error: workflowError } = await supabase
      .from("nautilus_workflows")
      .select("*")
      .eq("id", workflow_id)
      .single();

    if (workflowError || !workflow) {
      throw new Error("Workflow not found");
    }

    if (action === "execute") {
      // Start workflow execution
      const execution_id = crypto.randomUUID();
      const steps = workflow.steps || [];
      
      await supabase.from("workflow_executions").insert({
        id: execution_id,
        workflow_id: workflow_id,
        status: "running",
        current_step: 0,
        total_steps: steps.length,
        started_at: new Date().toISOString(),
      });

      // Execute first step
      const firstStep = steps[0];
      const stepResult = await executeStep(firstStep, supabase, LOVABLE_API_KEY);

      await supabase.from("workflow_execution_logs").insert({
        execution_id: execution_id,
        step_index: 0,
        step_name: firstStep.name,
        status: stepResult.success ? "completed" : "failed",
        input: firstStep,
        output: stepResult,
        timestamp: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          success: true,
          execution_id: execution_id,
          step_result: stepResult,
          requires_approval: firstStep.requires_approval,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "approve") {
      // Continue execution after approval
      const { data: execution } = await supabase
        .from("workflow_executions")
        .select("*")
        .eq("id", workflow_id)
        .single();

      if (!execution) {
        throw new Error("Execution not found");
      }

      const steps = workflow.steps || [];
      const nextStepIndex = execution.current_step + 1;

      if (nextStepIndex >= steps.length) {
        // Workflow completed
        await supabase
          .from("workflow_executions")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", workflow_id);

        return new Response(
          JSON.stringify({ success: true, status: "completed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const nextStep = steps[nextStepIndex];
      const stepResult = await executeStep(nextStep, supabase, LOVABLE_API_KEY);

      await supabase.from("workflow_execution_logs").insert({
        execution_id: workflow_id,
        step_index: nextStepIndex,
        step_name: nextStep.name,
        status: stepResult.success ? "completed" : "failed",
        input: nextStep,
        output: stepResult,
        timestamp: new Date().toISOString(),
      });

      await supabase
        .from("workflow_executions")
        .update({ current_step: nextStepIndex })
        .eq("id", workflow_id);

      return new Response(
        JSON.stringify({
          success: true,
          step_result: stepResult,
          requires_approval: nextStep.requires_approval,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "rollback") {
      // Rollback workflow
      await supabase
        .from("workflow_executions")
        .update({
          status: "rolled_back",
          completed_at: new Date().toISOString(),
        })
        .eq("id", workflow_id);

      return new Response(
        JSON.stringify({ success: true, status: "rolled_back" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Invalid action");
  } catch (error) {
    console.error("Error in workflow execution:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function executeStep(step: any, supabase: any, apiKey: string) {
  try {
    if (step.type === "ai_analysis") {
      // Execute AI analysis step
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are an intelligent workflow executor." },
            { role: "user", content: step.prompt || step.description }
          ],
        }),
      });

      const data = await response.json();
      return {
        success: true,
        result: data.choices[0].message.content,
        type: "ai_analysis",
      };
    }

    if (step.type === "database_query") {
      // Execute database query
      const { data, error } = await supabase
        .from(step.table)
        .select(step.select || "*");

      return {
        success: !error,
        result: data,
        error: error?.message,
        type: "database_query",
      };
    }

    if (step.type === "notification") {
      // Send notification (placeholder)
      return {
        success: true,
        result: "Notification sent",
        type: "notification",
      };
    }

    return {
      success: false,
      error: "Unknown step type",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
