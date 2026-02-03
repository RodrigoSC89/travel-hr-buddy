import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ListCrewsRequest {
  organization_id: string;
  vessel_id?: string;
  status?: string;
  position?: string;
  search?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await userSupabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Parse query params
    const url = new URL(req.url);
    const params: ListCrewsRequest = {
      organization_id: url.searchParams.get("organization_id") || "",
      vessel_id: url.searchParams.get("vessel_id") || undefined,
      status: url.searchParams.get("status") || undefined,
      position: url.searchParams.get("position") || undefined,
      search: url.searchParams.get("search") || undefined,
      page: parseInt(url.searchParams.get("page") || "1"),
      page_size: parseInt(url.searchParams.get("page_size") || "20"),
      sort_by: url.searchParams.get("sort_by") || "name",
      sort_order: (url.searchParams.get("sort_order") as "asc" | "desc") || "asc",
    };

    if (!params.organization_id) {
      return new Response(
        JSON.stringify({ error: "organization_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check user has access - try organization_members first
    let { data: userOrg } = await adminSupabase
      .from("organization_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", params.organization_id)
      .single();
    
    if (!userOrg) {
      const { data: legacyOrg } = await adminSupabase
        .from("organization_users")
        .select("role")
        .eq("user_id", user.id)
        .eq("organization_id", params.organization_id)
        .single();
      userOrg = legacyOrg;
    }

    if (!userOrg) {
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build query
    let query = adminSupabase
      .from("crew_members")
      .select("*, vessel:vessels(id, name), certifications:maritime_certificates(count)", { count: "exact" })
      .eq("organization_id", params.organization_id);

    // Apply filters
    if (params.vessel_id) {
      query = query.eq("vessel_id", params.vessel_id);
    }
    if (params.status) {
      query = query.eq("status", params.status);
    }
    if (params.position) {
      query = query.eq("position", params.position);
    }
    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
    }

    // Apply pagination with defaults
    const page = params.page ?? 1;
    const pageSize = params.page_size ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Apply sorting
    query = query.order(params.sort_by, { ascending: params.sort_order === "asc" });

    const { data: crews, error: queryError, count } = await query;

    if (queryError) {
      console.error("List crews error:", queryError);
      return new Response(
        JSON.stringify({ error: queryError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const finalPage = page;
    const finalPageSize = pageSize;

    return new Response(
      JSON.stringify({
        success: true,
        data: crews,
        pagination: {
          page: finalPage,
          page_size: finalPageSize,
          total: count,
          total_pages: Math.ceil((count || 0) / finalPageSize),
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("list-crews error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
