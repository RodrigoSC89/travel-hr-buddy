import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      action_item,
      assigned_to,
      notification_channels,
      webhook_url
    } = await req.json();

    const notifications_sent: string[] = [];
    const errors: string[] = [];

    // Enviar via Zapier webhook (para SMS/WhatsApp via Twilio, Email, etc)
    if (webhook_url && notification_channels.includes("zapier")) {
      try {
        const response = await fetch(webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action_type: "new_action_item",
            action_id: action_item.id,
            title: action_item.title,
            description: action_item.description,
            priority: action_item.priority,
            due_date: action_item.due_date,
            assigned_to_name: assigned_to.name,
            assigned_to_email: assigned_to.email,
            assigned_to_phone: assigned_to.phone,
            vessel_name: action_item.vessel_name,
            source_module: action_item.source_module,
            action_url: `https://nautilus.app/actions/${action_item.id}`,
            timestamp: new Date().toISOString()
          })
        });
        
        if (response.ok) {
          notifications_sent.push("zapier");
          console.log("Zapier webhook triggered for action:", action_item.id);
        } else {
          errors.push("Zapier webhook failed");
        }
      } catch (error: unknown) {
        errors.push(`Zapier error: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    // Notificação in-app (simular - em produção seria via Supabase realtime)
    if (notification_channels.includes("in_app")) {
      notifications_sent.push("in_app");
      console.log("In-app notification queued for:", assigned_to.name);
    }

    // Log da ação criada
    console.log("Action item dispatched:", {
      id: action_item.id,
      title: action_item.title,
      assigned_to: assigned_to.name,
      channels: notifications_sent
    });

    return new Response(JSON.stringify({
      success: true,
      action_id: action_item.id,
      notifications_sent,
      errors: errors.length > 0 ? errors : null,
      dispatched_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in responsibility-matrix-dispatch:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
