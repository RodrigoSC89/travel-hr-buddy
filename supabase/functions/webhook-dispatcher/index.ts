import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookPayload {
  action: "create" | "update" | "delete" | "list" | "test" | "dispatch";
  webhook_id?: string;
  name?: string;
  url?: string;
  event_types?: string[];
  is_active?: boolean;
  headers?: Record<string, string>;
  event_type?: string;
  event_data?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload: WebhookPayload = await req.json();
    const { action } = payload;

    switch (action) {
      case "create": {
        const { name, url, event_types, headers } = payload;

        const { data, error } = await supabase
          .from("webhook_configurations")
          .insert({
            name,
            url,
            event_types: event_types || [],
            headers: headers || {},
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;

        await supabase.from("security_audit_logs").insert({
          event_type: "webhook_created",
          severity: "info",
          description: `Webhook created: ${name}`,
          metadata: { webhook_id: data.id, url },
        });

        return new Response(JSON.stringify({ success: true, webhook: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update": {
        const { webhook_id, name, url, event_types, headers, is_active } = payload;

        const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (name !== undefined) updateData.name = name;
        if (url !== undefined) updateData.url = url;
        if (event_types !== undefined) updateData.event_types = event_types;
        if (headers !== undefined) updateData.headers = headers;
        if (is_active !== undefined) updateData.is_active = is_active;

        const { data, error } = await supabase
          .from("webhook_configurations")
          .update(updateData)
          .eq("id", webhook_id)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, webhook: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete": {
        const { webhook_id } = payload;

        const { error } = await supabase
          .from("webhook_configurations")
          .delete()
          .eq("id", webhook_id);

        if (error) throw error;

        await supabase.from("security_audit_logs").insert({
          event_type: "webhook_deleted",
          severity: "warning",
          description: `Webhook deleted: ${webhook_id}`,
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "list": {
        const { data, error } = await supabase
          .from("webhook_configurations")
          .select("*, webhook_logs(id, status, created_at)")
          .order("created_at", { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, webhooks: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "test": {
        const { webhook_id } = payload;

        const { data: webhook, error: fetchError } = await supabase
          .from("webhook_configurations")
          .select("*")
          .eq("id", webhook_id)
          .single();

        if (fetchError) throw fetchError;

        try {
          const testPayload = {
            event: "test",
            message: "This is a test webhook from Nautilus One",
            timestamp: new Date().toISOString(),
          };

          const response = await fetch(webhook.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...webhook.headers,
            },
            body: JSON.stringify(testPayload),
          });

          const status = response.ok ? "success" : "failed";

          await supabase.from("webhook_logs").insert({
            webhook_id: webhook.id,
            event_type: "test",
            status,
            request_payload: testPayload,
            response_status: response.status,
          });

          return new Response(JSON.stringify({ 
            success: response.ok, 
            status_code: response.status,
            message: response.ok ? "Webhook test successful" : "Webhook test failed",
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (testError) {
          await supabase.from("webhook_logs").insert({
            webhook_id: webhook.id,
            event_type: "test",
            status: "failed",
            error_message: testError instanceof Error ? testError.message : "Unknown error",
          });

          return new Response(JSON.stringify({ 
            success: false, 
            error: testError instanceof Error ? testError.message : "Unknown error",
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      case "dispatch": {
        const { event_type, event_data } = payload;

        // Find all active webhooks that match this event type
        const { data: webhooks, error: fetchError } = await supabase
          .from("webhook_configurations")
          .select("*")
          .eq("is_active", true)
          .contains("event_types", [event_type]);

        if (fetchError) throw fetchError;

        const results = [];

        for (const webhook of webhooks || []) {
          try {
            const webhookPayload = {
              event: event_type,
              data: event_data,
              timestamp: new Date().toISOString(),
            };

            const response = await fetch(webhook.url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...webhook.headers,
              },
              body: JSON.stringify(webhookPayload),
            });

            await supabase.from("webhook_logs").insert({
              webhook_id: webhook.id,
              event_type,
              status: response.ok ? "success" : "failed",
              request_payload: webhookPayload,
              response_status: response.status,
            });

            results.push({
              webhook_id: webhook.id,
              name: webhook.name,
              success: response.ok,
              status_code: response.status,
            });
          } catch (dispatchError) {
            await supabase.from("webhook_logs").insert({
              webhook_id: webhook.id,
              event_type,
              status: "failed",
              error_message: dispatchError instanceof Error ? dispatchError.message : "Unknown error",
            });

            results.push({
              webhook_id: webhook.id,
              name: webhook.name,
              success: false,
              error: dispatchError instanceof Error ? dispatchError.message : "Unknown error",
            });
          }
        }

        return new Response(JSON.stringify({ 
          success: true, 
          dispatched: results.length,
          results,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("Webhook dispatcher error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
