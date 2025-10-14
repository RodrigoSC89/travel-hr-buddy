import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
    // Get Supabase client with auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing authorization header" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid session" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Parse URL to get workflow ID
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const workflowId = pathParts[pathParts.length - 1];

    // Handle different HTTP methods
    switch (req.method) {
      case "GET": {
        // Get all steps for a workflow
        const { data, error } = await supabase
          .from('smart_workflow_steps')
          .select('*')
          .eq('workflow_id', workflowId)
          .order('position', { ascending: true });

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
          );
        }

        return new Response(
          JSON.stringify(data),
          { 
            status: 200, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      case "POST": {
        // Create a new step
        const body = await req.json();
        
        const { error } = await supabase
          .from('smart_workflow_steps')
          .insert({
            workflow_id: workflowId,
            title: body.title,
            description: body.description,
            status: body.status || 'pendente',
            position: body.position || 0,
            assigned_to: body.assigned_to,
            due_date: body.due_date,
            priority: body.priority || 'medium',
            created_by: user.id,
            tags: body.tags,
            metadata: body.metadata || {}
          });

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
          );
        }

        return new Response(null, { 
          status: 204, 
          headers: corsHeaders 
        });
      }

      case "PATCH": {
        // Update a step
        const body = await req.json();
        
        if (!body.id) {
          return new Response(
            JSON.stringify({ error: "Step ID is required" }),
            { 
              status: 400, 
              headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
          );
        }

        const { error } = await supabase
          .from('smart_workflow_steps')
          .update(body.values)
          .eq('id', body.id);

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
          );
        }

        return new Response(null, { 
          status: 204, 
          headers: corsHeaders 
        });
      }

      case "DELETE": {
        // Delete a step
        const body = await req.json();
        
        if (!body.id) {
          return new Response(
            JSON.stringify({ error: "Step ID is required" }),
            { 
              status: 400, 
              headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
          );
        }

        const { error } = await supabase
          .from('smart_workflow_steps')
          .delete()
          .eq('id', body.id);

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
          );
        }

        return new Response(null, { 
          status: 204, 
          headers: corsHeaders 
        });
      }

      default: {
        return new Response(
          JSON.stringify({ error: "Method not allowed" }),
          { 
            status: 405, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    }

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
