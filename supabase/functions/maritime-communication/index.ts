import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CommunicationRequest {
  vessel_id: string;
  message_type?: "general" | "emergency" | "weather_alert" | "maintenance";
  content: string;
  priority?: "normal" | "high" | "critical";
  coordinates?: { lat: number; lng: number };
}

interface MaritimeMessage {
  id: string;
  vessel_id: string;
  message_type: string;
  content: string;
  priority: string;
  coordinates: { lat: number; lng: number } | null;
  status: string;
  sent_at: string;
}

interface Notification {
  type: string;
  title: string;
  message: string;
  priority: string;
  metadata: Record<string, unknown>;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    const { 
      vessel_id, 
      message_type = "general", 
      content, 
      priority = "normal", 
      coordinates 
    }: CommunicationRequest = await req.json();

    // Processing real-time maritime communication

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
      throw messageError;
    }

    const typedMessage = message as MaritimeMessage;

    // Create notifications for relevant parties based on message type
    const notifications: Notification[] = [];
    
    if (message_type === "emergency") {
      // Notify all fleet managers and coast guard
      notifications.push({
        type: "emergency_alert",
        title: "EMERGÊNCIA MARÍTIMA",
        message: `Emergência reportada pela embarcação ${vessel_id}: ${content}`,
        priority: "critical",
        metadata: { vessel_id, coordinates, message_id: typedMessage.id }
      });
    } else if (message_type === "weather_alert") {
      // Notify nearby vessels
      notifications.push({
        type: "weather_warning",
        title: "Alerta Meteorológico",
        message: `Condições meteorológicas adversas reportadas: ${content}`,
        priority: "high",
        metadata: { vessel_id, coordinates, message_id: typedMessage.id }
      });
    } else if (message_type === "maintenance") {
      // Notify maintenance team
      notifications.push({
        type: "maintenance_request",
        title: "Solicitação de Manutenção",
        message: `Manutenção solicitada pela embarcação ${vessel_id}: ${content}`,
        priority: priority,
        metadata: { vessel_id, message_id: typedMessage.id }
      });
    }

    // Insert notifications if any
    if (notifications.length > 0) {
      const { error: notificationError } = await supabaseClient
        .from("real_time_notifications")
        .insert(notifications);

      // Note: Notification errors are non-critical, message was sent successfully
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

    // Maritime communication processed successfully

    return new Response(
      JSON.stringify({
        success: true,
        message_id: typedMessage.id,
        status: "delivered",
        notifications_created: notifications.length
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );

  } catch (error) {

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
