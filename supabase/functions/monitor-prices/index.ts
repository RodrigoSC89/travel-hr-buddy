/// <reference path="../deno-ambient.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PriceAlert {
  id: string;
  user_id: string;
  product_name: string;
  product_url: string;
  target_price: number;
  current_price?: number;
}

interface PriceCheckResult {
  success: boolean;
  price?: number;
}

interface AlertResult {
  alert_id: string;
  product_name: string;
  current_price?: number;
  target_price?: number;
  target_met?: boolean;
  success: boolean;
  error?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: alerts, error: alertsError } = await supabaseClient
      .from("price_alerts")
      .select("*")
      .eq("is_active", true);

    if (alertsError) {
      throw new Error(`Error fetching alerts: ${alertsError.message}`);
    }

    console.log(`Found ${alerts?.length || 0} active alerts to check`);

    const results: AlertResult[] = [];

    for (const alert of (alerts as PriceAlert[]) || []) {
      try {
        const priceCheckResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/check-price`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_name: alert.product_name,
            product_url: alert.product_url
          })
        });

        const priceData: PriceCheckResult = await priceCheckResponse.json();
        
        if (priceData.success && priceData.price) {
          const currentPrice = priceData.price;

          const { error: updateError } = await supabaseClient
            .from("price_alerts")
            .update({
              current_price: currentPrice,
              last_checked_at: new Date().toISOString()
            })
            .eq("id", alert.id);

          if (updateError) {
            console.error(`Error updating alert ${alert.id}:`, updateError);
            continue;
          }

          const { error: historyError } = await supabaseClient
            .from("price_history")
            .insert({
              alert_id: alert.id,
              price: currentPrice,
              checked_at: new Date().toISOString()
            });

          if (historyError) {
            console.error(`Error adding price history for alert ${alert.id}:`, historyError);
          }

          if (currentPrice <= alert.target_price) {
            const message = `🎉 Meta de preço atingida! ${alert.product_name} agora custa R$ ${currentPrice.toFixed(2)} (meta: R$ ${alert.target_price.toFixed(2)})`;
            
            const { error: notificationError } = await supabaseClient
              .from("price_notifications")
              .insert({
                alert_id: alert.id,
                user_id: alert.user_id,
                message: message,
                is_read: false
              });

            if (notificationError) {
              console.error(`Error creating notification for alert ${alert.id}:`, notificationError);
            }
          }

          results.push({
            alert_id: alert.id,
            product_name: alert.product_name,
            current_price: currentPrice,
            target_price: alert.target_price,
            target_met: currentPrice <= alert.target_price,
            success: true
          });

        } else {
          results.push({
            alert_id: alert.id,
            product_name: alert.product_name,
            success: false,
            error: "Failed to get price"
          });
        }

      } catch (error) {
        console.error(`Error processing alert ${alert.id}:`, error);
        results.push({
          alert_id: alert.id,
          product_name: alert.product_name,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error occurred"
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        checked_alerts: results.length,
        results: results,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );

  } catch (error) {
    console.error("Error in monitor-prices:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
