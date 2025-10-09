import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { vessel_id, message_type = "general", content, priority = "normal", coordinates } = await req.json();

    console.log("Processing real-time maritime communication:", { vessel_id, message_type, priority });

    // Insert the message into the database
    const { data: message, error: messageError } = await supabaseClient
      .from("maritime_communications")
      .insert({
        vessel_id,
        message_type,
        content,
        priority,
        coordinates,
        status: "sent",
        sent_at: new Date().toISOString()
      })
      .select()
      .single();

    if (messageError) {
      console.error("Error inserting message:", messageError);
      throw messageError;
    }

    // Create notifications for relevant parties based on message type
    const notifications = [];
    
    if (message_type === "emergency") {
      // Notify all fleet managers and coast guard
      notifications.push({
        type: "emergency_alert",
        title: "EMERGÊNCIA MARÍTIMA",
        message: `Emergência reportada pela embarcação ${vessel_id}: ${content}`,
        priority: "critical",
        metadata: { vessel_id, coordinates, message_id: message.id }
      });
    } else if (message_type === "weather_alert") {
      // Notify nearby vessels
      notifications.push({
        type: "weather_warning",
        title: "Alerta Meteorológico",
        message: `Condições meteorológicas adversas reportadas: ${content}`,
        priority: "high",
        metadata: { vessel_id, coordinates, message_id: message.id }
      });
    } else if (message_type === "maintenance") {
      // Notify maintenance team
      notifications.push({
        type: "maintenance_request",
        title: "Solicitação de Manutenção",
        message: `Manutenção solicitada pela embarcação ${vessel_id}: ${content}`,
        priority: priority,
        metadata: { vessel_id, message_id: message.id }
      });
    }

    // Insert notifications if any
    if (notifications.length > 0) {
      const { error: notificationError } = await supabaseClient
        .from("real_time_notifications")
        .insert(notifications);

      if (notificationError) {
        console.error("Error creating notifications:", notificationError);
      }
    }

    // Log communication for audit trail
    await supabaseClient
      .from("communication_logs")
      .insert({
        vessel_id,
        action: "message_sent",
        details: { message_type, priority, content_length: content.length },
        timestamp: new Date().toISOString()
      });

    console.log("Maritime communication processed successfully:", message.id);

    return new Response(
      JSON.stringify({
        success: true,
        message_id: message.id,
        status: "delivered",
        notifications_created: notifications.length
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );

  } catch (error) {
    console.error("Error in maritime communication:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});