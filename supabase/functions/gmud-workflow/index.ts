import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SIGNATURE_WORKFLOW = [
  { role: "safety_officer", title: "Oficial de Segurança", deadline_days: 2 },
  { role: "chief_engineer", title: "Chefe de Máquinas", deadline_days: 2 },
  { role: "captain", title: "Capitão", deadline_days: 1 },
  { role: "shipowner", title: "Armador", deadline_days: 1 },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, gmud_request, current_step, approver_data, webhook_url } = await req.json();

    if (action === "create_workflow") {
      // Criar workflow de assinaturas para novo GMUD
      const signatures = SIGNATURE_WORKFLOW.map((step, index) => ({
        step_number: index + 1,
        role: step.role,
        title: step.title,
        status: index === 0 ? "pending" : "waiting",
        deadline: new Date(Date.now() + step.deadline_days * 24 * 60 * 60 * 1000).toISOString(),
        notified_at: null,
        signed_at: null,
        comments: null
      }));

      // Notificar primeiro aprovador via webhook (Zapier)
      if (webhook_url) {
        await sendWebhookNotification(webhook_url, {
          type: "gmud_approval_required",
          gmud_id: gmud_request.id,
          gmud_description: gmud_request.description,
          approver_role: SIGNATURE_WORKFLOW[0].title,
          deadline: signatures[0].deadline,
          vessel_name: gmud_request.vessel_name
        });
      }

      return new Response(JSON.stringify({
        success: true,
        workflow: signatures,
        current_step: 1,
        next_approver: SIGNATURE_WORKFLOW[0]
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "approve") {
      const stepIndex = current_step - 1;
      const nextStep = current_step + 1;
      const isLastStep = nextStep > SIGNATURE_WORKFLOW.length;

      // Notificar próximo aprovador ou finalizar
      if (webhook_url && !isLastStep) {
        await sendWebhookNotification(webhook_url, {
          type: "gmud_approval_required",
          gmud_id: gmud_request.id,
          gmud_description: gmud_request.description,
          approver_role: SIGNATURE_WORKFLOW[nextStep - 1].title,
          deadline: new Date(Date.now() + SIGNATURE_WORKFLOW[nextStep - 1].deadline_days * 24 * 60 * 60 * 1000).toISOString(),
          vessel_name: gmud_request.vessel_name,
          previous_approver: SIGNATURE_WORKFLOW[stepIndex].title
        });
      }

      if (isLastStep && webhook_url) {
        await sendWebhookNotification(webhook_url, {
          type: "gmud_fully_approved",
          gmud_id: gmud_request.id,
          gmud_description: gmud_request.description,
          vessel_name: gmud_request.vessel_name,
          approved_at: new Date().toISOString()
        });
      }

      return new Response(JSON.stringify({
        success: true,
        approved_step: current_step,
        next_step: isLastStep ? null : nextStep,
        is_complete: isLastStep,
        approver: approver_data,
        approved_at: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "reject") {
      if (webhook_url) {
        await sendWebhookNotification(webhook_url, {
          type: "gmud_rejected",
          gmud_id: gmud_request.id,
          gmud_description: gmud_request.description,
          rejected_by: SIGNATURE_WORKFLOW[current_step - 1].title,
          rejection_reason: approver_data.comments,
          vessel_name: gmud_request.vessel_name
        });
      }

      return new Response(JSON.stringify({
        success: true,
        rejected_at_step: current_step,
        rejected_by: approver_data,
        rejection_reason: approver_data.comments
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "send_reminder") {
      if (webhook_url) {
        await sendWebhookNotification(webhook_url, {
          type: "gmud_reminder",
          gmud_id: gmud_request.id,
          gmud_description: gmud_request.description,
          approver_role: SIGNATURE_WORKFLOW[current_step - 1].title,
          deadline: gmud_request.deadline,
          is_overdue: new Date(gmud_request.deadline) < new Date()
        });
      }

      return new Response(JSON.stringify({
        success: true,
        reminder_sent: true,
        step: current_step
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in gmud-workflow:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function sendWebhookNotification(webhookUrl: string, payload: any) {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
        source: "nautilus-gmud"
      })
    });
    console.log("Webhook notification sent:", payload.type, "Status:", response.status);
    return response.ok;
  } catch (error) {
    console.error("Webhook notification failed:", error);
    return false;
  }
}
