import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SiscomexPayload {
  vessel_id: string;
  voyage_id?: string;
  transmission_type: "entry" | "exit" | "manifest" | "crew_list" | "cargo_declaration";
  data: {
    imo_number?: string;
    mmsi?: string;
    vessel_name?: string;
    flag_state?: string;
    gross_tonnage?: number;
    port_code?: string;
    arrival_date?: string;
    departure_date?: string;
    crew_list?: Array<{
      name: string;
      nationality: string;
      passport_number: string;
      position: string;
    }>;
    cargo_manifest?: Array<{
      description: string;
      quantity: number;
      unit: string;
      ncm_code: string;
    }>;
  };
}

// SISCOMEX API endpoint simulation (would be real in production)
const SISCOMEX_SANDBOX_URL = "https://siscomex-sandbox.gov.br/api/v1";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization required");
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Invalid authentication");
    }

    const { operation, payload, transmission_id } = await req.json();
    // Silent logging - operation tracked via audit_log

    // Get user's organization
    const { data: orgUser } = await supabase
      .from("organization_users")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (!orgUser) {
      throw new Error("User not associated with any organization");
    }

    const organizationId = orgUser.organization_id;

    switch (operation) {
      case "create_transmission": {
        const siscomexPayload = payload as SiscomexPayload;
        
        // Validate required fields
        if (!siscomexPayload.vessel_id || !siscomexPayload.transmission_type) {
          throw new Error("vessel_id and transmission_type are required");
        }

        // Get vessel data
        const { data: vessel } = await supabase
          .from("vessels")
          .select("*")
          .eq("id", siscomexPayload.vessel_id)
          .maybeSingle();

        if (!vessel) {
          throw new Error("Vessel not found");
        }

        // Build SISCOMEX payload
        const siscomexData = {
          header: {
            tipo_operacao: siscomexPayload.transmission_type.toUpperCase(),
            data_transmissao: new Date().toISOString(),
            versao_sistema: "NAUTI-ONE-1.0",
          },
          embarcacao: {
            imo: vessel.imo_number || siscomexPayload.data.imo_number,
            mmsi: vessel.mmsi || siscomexPayload.data.mmsi,
            nome: vessel.name || siscomexPayload.data.vessel_name,
            bandeira: vessel.flag || siscomexPayload.data.flag_state,
            arqueacao_bruta: vessel.gross_tonnage || siscomexPayload.data.gross_tonnage,
          },
          operacao: {
            porto_codigo: siscomexPayload.data.port_code,
            data_chegada: siscomexPayload.data.arrival_date,
            data_partida: siscomexPayload.data.departure_date,
          },
          tripulacao: siscomexPayload.data.crew_list || [],
          manifesto_carga: siscomexPayload.data.cargo_manifest || [],
        };

        // Create transmission record
        const { data: transmission, error: insertError } = await supabase
          .from("siscomex_transmissions")
          .insert({
            organization_id: organizationId,
            vessel_id: siscomexPayload.vessel_id,
            voyage_id: siscomexPayload.voyage_id,
            transmission_type: siscomexPayload.transmission_type,
            payload: siscomexData,
            status: "pending",
            created_by: user.id,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Log audit
        await supabase.from("siscomex_audit_log").insert({
          transmission_id: transmission.id,
          action: "CREATED",
          actor_id: user.id,
          details: { transmission_type: siscomexPayload.transmission_type },
        });

        console.log(`[siscomex-api] Transmission created: ${transmission.id}`);

        return new Response(
          JSON.stringify({
            success: true,
            transmission_id: transmission.id,
            status: "pending",
            message: "Transmission created and queued for processing",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "send_transmission": {
        if (!transmission_id) {
          throw new Error("transmission_id is required");
        }

        // Get transmission
        const { data: transmission, error: fetchError } = await supabase
          .from("siscomex_transmissions")
          .select("*")
          .eq("id", transmission_id)
          .eq("organization_id", organizationId)
          .single();

        if (fetchError || !transmission) {
          throw new Error("Transmission not found");
        }

        if (transmission.status !== "pending") {
          throw new Error(`Cannot send transmission with status: ${transmission.status}`);
        }

        // Update status to processing
        await supabase
          .from("siscomex_transmissions")
          .update({ status: "processing" })
          .eq("id", transmission_id);

        // Simulate SISCOMEX API call (in production, this would be real)
        // For MVP, we simulate success after validation
        const simulatedResponse = {
          protocolo: `SISCOMEX-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          status: "RECEBIDO",
          data_processamento: new Date().toISOString(),
          mensagem: "Transmissão recebida com sucesso",
        };

        // Update with response
        const { error: updateError } = await supabase
          .from("siscomex_transmissions")
          .update({
            status: "sent",
            siscomex_protocol: simulatedResponse.protocolo,
            siscomex_response: simulatedResponse,
            sent_at: new Date().toISOString(),
          })
          .eq("id", transmission_id);

        if (updateError) throw updateError;

        // Log audit
        await supabase.from("siscomex_audit_log").insert({
          transmission_id,
          action: "SENT",
          actor_id: user.id,
          details: { protocol: simulatedResponse.protocolo },
        });

        console.log(`[siscomex-api] Transmission sent: ${transmission_id}`);

        return new Response(
          JSON.stringify({
            success: true,
            transmission_id,
            protocol: simulatedResponse.protocolo,
            status: "sent",
            message: "Transmission sent to SISCOMEX",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "check_status": {
        if (!transmission_id) {
          throw new Error("transmission_id is required");
        }

        const { data: transmission, error: fetchError } = await supabase
          .from("siscomex_transmissions")
          .select("*")
          .eq("id", transmission_id)
          .eq("organization_id", organizationId)
          .single();

        if (fetchError || !transmission) {
          throw new Error("Transmission not found");
        }

        // Simulate status check (in production, query SISCOMEX API)
        if (transmission.status === "sent" && transmission.siscomex_protocol) {
          // Simulate acknowledgment after some time
          const sentTime = new Date(transmission.sent_at).getTime();
          const now = Date.now();
          const elapsed = now - sentTime;

          // Auto-acknowledge after 5 seconds (simulation)
          if (elapsed > 5000 && transmission.status !== "acknowledged") {
            await supabase
              .from("siscomex_transmissions")
              .update({
                status: "acknowledged",
                acknowledged_at: new Date().toISOString(),
                siscomex_response: {
                  ...transmission.siscomex_response,
                  status: "CONFIRMADO",
                  confirmacao: {
                    data: new Date().toISOString(),
                    mensagem: "Transmissão processada com sucesso",
                  },
                },
              })
              .eq("id", transmission_id);

            await supabase.from("siscomex_audit_log").insert({
              transmission_id,
              action: "ACKNOWLEDGED",
              actor_id: user.id,
              details: { auto_checked: true },
            });

            transmission.status = "acknowledged";
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            transmission_id,
            status: transmission.status,
            protocol: transmission.siscomex_protocol,
            sent_at: transmission.sent_at,
            acknowledged_at: transmission.acknowledged_at,
            response: transmission.siscomex_response,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "list_transmissions": {
        const { status, vessel_id, limit = 50 } = payload || {};

        let query = supabase
          .from("siscomex_transmissions")
          .select("*")
          .eq("organization_id", organizationId)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (status) query = query.eq("status", status);
        if (vessel_id) query = query.eq("vessel_id", vessel_id);

        const { data: transmissions, error: listError } = await query;

        if (listError) throw listError;

        return new Response(
          JSON.stringify({
            success: true,
            transmissions,
            count: transmissions?.length || 0,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "cancel_transmission": {
        if (!transmission_id) {
          throw new Error("transmission_id is required");
        }

        const { data: transmission } = await supabase
          .from("siscomex_transmissions")
          .select("status")
          .eq("id", transmission_id)
          .eq("organization_id", organizationId)
          .single();

        if (!transmission) {
          throw new Error("Transmission not found");
        }

        if (!["pending", "error"].includes(transmission.status)) {
          throw new Error(`Cannot cancel transmission with status: ${transmission.status}`);
        }

        await supabase
          .from("siscomex_transmissions")
          .update({ status: "cancelled" })
          .eq("id", transmission_id);

        await supabase.from("siscomex_audit_log").insert({
          transmission_id,
          action: "CANCELLED",
          actor_id: user.id,
          details: { reason: payload?.reason || "User cancelled" },
        });

        return new Response(
          JSON.stringify({
            success: true,
            transmission_id,
            status: "cancelled",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[siscomex-api] Error:", errorMessage);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
