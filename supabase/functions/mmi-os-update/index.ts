import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

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
    // Parse request body
    const { id, status, executed_at, technician_comment } = await req.json();

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Work order ID is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Updating work order:", id);

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    
    if (status !== undefined) {
      // Validate status
      const validStatuses = ['open', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return new Response(
          JSON.stringify({ 
            error: "Invalid status. Must be one of: open, in_progress, completed, cancelled" 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      updateData.status = status;
    }
    
    if (executed_at !== undefined) {
      updateData.executed_at = executed_at;
    }
    
    if (technician_comment !== undefined) {
      updateData.technician_comment = technician_comment;
    }

    // If status is completed and no executed_at is provided, use current timestamp
    if (status === 'completed' && executed_at === undefined && !updateData.executed_at) {
      updateData.executed_at = new Date().toISOString();
    }

    // Update work order
    const { data: os, error: osError } = await supabase
      .from('mmi_os')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (osError || !os) {
      console.error("Error updating work order:", osError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to update work order",
          details: osError?.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Work order updated successfully:", os.id);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Work order updated successfully",
      data: os,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in mmi-os-update function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
