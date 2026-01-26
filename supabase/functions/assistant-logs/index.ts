import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Profile {
  role: string;
}

interface AssistantLog {
  id: string;
  question: string;
  answer: string;
  created_at: string;
  user_id: string;
  profiles: { email: string } | null;
}

interface TransformedLog extends Omit<AssistantLog, 'profiles'> {
  user_email: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow GET requests
    if (req.method !== "GET") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { 
          status: 405, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

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

    const authenticatedUser = user;

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authenticatedUser.id)
      .maybeSingle();

    if (profileError) {
      // Profile fetch error - allow with default role
    }

    const typedProfile = profile as Profile | null;
    const isAdmin = typedProfile?.role === "admin";

    // Fetch logs with user profile information
    const { data, error } = await supabase
      .from("assistant_logs")
      .select("id, question, answer, created_at, user_id, profiles(email)")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const typedData = data as AssistantLog[] | null;

    // Filter logs based on user role
    const filtered = isAdmin
      ? typedData ?? []
      : (typedData ?? []).filter((log) => log.user_id === authenticatedUser.id);

    // Transform logs to include user email
    const logs: TransformedLog[] = filtered.map((log) => ({
      id: log.id,
      question: log.question,
      answer: log.answer,
      created_at: log.created_at,
      user_id: log.user_id,
      user_email: log.profiles?.email || "Anônimo",
    }));

    return new Response(
      JSON.stringify(logs),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
