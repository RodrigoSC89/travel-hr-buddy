/**
 * Public API v1 - Complete REST API with SHA-256 Key Validation
 * PATCH: Enhanced security + expanded endpoints
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface ApiKeyData {
  id: string;
  organization_id: string;
  scopes: string[];
  rate_limit: number;
  is_active: boolean;
}

/**
 * SHA-256 hash function using Web Crypto API
 */
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Validate API key against database using SHA-256 hash
 */
async function validateApiKey(apiKey: string, supabase: ReturnType<typeof createClient>): Promise<ApiKeyData | null> {
  const keyHash = await hashApiKey(apiKey);
  
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, organization_id, scopes, rate_limit, is_active, expires_at")
    .eq("key_hash", keyHash)
    .eq("is_active", true)
    .maybeSingle();
  
  if (error || !data) {
    console.log("API key validation failed:", error?.message || "Key not found");
    return null;
  }
  
  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    console.log("API key expired");
    return null;
  }
  
  // Update last used
  await supabase
    .from("api_keys")
    .update({ 
      last_used_at: new Date().toISOString(),
      usage_count: supabase.rpc ? undefined : undefined // Increment handled separately
    })
    .eq("id", data.id);
  
  return {
    id: data.id,
    organization_id: data.organization_id,
    scopes: data.scopes || ["read:*"],
    rate_limit: data.rate_limit || 1000,
    is_active: data.is_active
  };
}

/**
 * Check if key has required scope
 */
function hasScope(keyData: ApiKeyData, requiredScope: string): boolean {
  if (keyData.scopes.includes("admin:*") || keyData.scopes.includes("*")) return true;
  if (keyData.scopes.includes(requiredScope)) return true;
  
  const [resource, action] = requiredScope.split(":");
  if (keyData.scopes.includes(`${resource}:*`)) return true;
  if (keyData.scopes.includes(`read:*`) && action === "read") return true;
  if (keyData.scopes.includes(`write:*`) && ["write", "create", "update", "delete"].includes(action)) return true;
  
  return false;
}

/**
 * Rate limiting check
 */
function checkRateLimit(keyId: string, limit: number): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  
  const current = rateLimitStore.get(keyId);
  
  if (!current || now >= current.resetTime) {
    rateLimitStore.set(keyId, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
  }
  
  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
  }
  
  current.count++;
  return { allowed: true, remaining: limit - current.count, resetTime: current.resetTime };
}

/**
 * Log API usage
 */
async function logApiUsage(
  supabase: ReturnType<typeof createClient>,
  keyId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTimeMs: number,
  req: Request
) {
  try {
    await supabase.from("api_key_usage").insert({
      api_key_id: keyId,
      endpoint,
      method,
      status_code: statusCode,
      response_time_ms: responseTimeMs,
      ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown",
      user_agent: req.headers.get("user-agent"),
      request_id: crypto.randomUUID()
    });
  } catch (error) {
    console.error("Failed to log API usage:", error);
  }
}

/**
 * JSON response helper
 */
function jsonResponse(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders }
  });
}

serve(async (req) => {
  const startTime = Date.now();
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/public-api/, "");
  const method = req.method;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Extract API key
    const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
    
    // Public endpoints (no auth required)
    if (path === "/v1/status" || path === "/v1/health") {
      return jsonResponse({
        status: "healthy",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        endpoints: [
          "GET /v1/vessels",
          "GET /v1/crew",
          "GET /v1/documents", 
          "GET /v1/maintenance",
          "GET /v1/certificates",
          "POST /v1/webhooks/dispatch"
        ]
      });
    }
    
    if (path === "/v1/docs" || path === "/v1/openapi") {
      return jsonResponse({
        openapi: "3.0.0",
        info: {
          title: "Nauti One API",
          version: "1.0.0",
          description: "Complete Maritime Management API"
        },
        servers: [{ url: `${supabaseUrl}/functions/v1/public-api` }],
        security: [{ ApiKeyAuth: [] }],
        paths: {
          "/v1/vessels": { get: { summary: "List vessels", tags: ["Vessels"] } },
          "/v1/vessels/{id}": { get: { summary: "Get vessel" }, put: { summary: "Update vessel" } },
          "/v1/crew": { get: { summary: "List crew" }, post: { summary: "Create crew member" } },
          "/v1/documents": { get: { summary: "List documents" } },
          "/v1/maintenance": { get: { summary: "List maintenance tasks" } },
          "/v1/certificates": { get: { summary: "List certificates" } }
        }
      });
    }
    
    // Require API key for all other endpoints
    if (!apiKey) {
      return jsonResponse({ error: "API key required", code: "UNAUTHORIZED" }, 401);
    }
    
    // Validate API key with SHA-256 hash
    const keyData = await validateApiKey(apiKey, supabase);
    if (!keyData) {
      return jsonResponse({ error: "Invalid or expired API key", code: "INVALID_KEY" }, 401);
    }
    
    // Rate limiting
    const rateLimit = checkRateLimit(keyData.id, keyData.rate_limit);
    if (!rateLimit.allowed) {
      await logApiUsage(supabase, keyData.id, path, method, 429, Date.now() - startTime, req);
      return jsonResponse(
        { error: "Rate limit exceeded", code: "RATE_LIMITED" },
        429,
        {
          "X-RateLimit-Limit": keyData.rate_limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": rateLimit.resetTime.toString()
        }
      );
    }
    
    const rateLimitHeaders = {
      "X-RateLimit-Limit": keyData.rate_limit.toString(),
      "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      "X-RateLimit-Reset": rateLimit.resetTime.toString()
    };
    
    // Route handlers
    let response: Response;
    
    // VESSELS
    if (path === "/v1/vessels" && method === "GET") {
      if (!hasScope(keyData, "read:vessels")) {
        return jsonResponse({ error: "Insufficient permissions", code: "FORBIDDEN" }, 403);
      }
      
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const offset = parseInt(url.searchParams.get("offset") || "0");
      
      const { data, error, count } = await supabase
        .from("vessels")
        .select("id, name, type, imo_number, flag, built_year, gross_tonnage, status, current_location, created_at", { count: "exact" })
        .eq("organization_id", keyData.organization_id)
        .is("deleted_at", null)
        .range(offset, offset + limit - 1)
        .order("name");
      
      if (error) throw error;
      
      response = jsonResponse({ data, meta: { total: count, limit, offset } }, 200, rateLimitHeaders);
    }
    
    else if (path.match(/^\/v1\/vessels\/[^\/]+$/) && method === "GET") {
      if (!hasScope(keyData, "read:vessels")) {
        return jsonResponse({ error: "Insufficient permissions" }, 403);
      }
      
      const vesselId = path.split("/")[3];
      const { data, error } = await supabase
        .from("vessels")
        .select("*, vessel_parts(id, name, status), vessel_manuals(id, title)")
        .eq("id", vesselId)
        .eq("organization_id", keyData.organization_id)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return jsonResponse({ error: "Vessel not found" }, 404);
      
      response = jsonResponse({ data }, 200, rateLimitHeaders);
    }
    
    // CREW
    else if (path === "/v1/crew" && method === "GET") {
      if (!hasScope(keyData, "read:crew")) {
        return jsonResponse({ error: "Insufficient permissions" }, 403);
      }
      
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const offset = parseInt(url.searchParams.get("offset") || "0");
      
      const { data, error, count } = await supabase
        .from("crew_members")
        .select("id, full_name, position, rank, status, nationality, vessel_id, created_at", { count: "exact" })
        .eq("organization_id", keyData.organization_id)
        .is("deleted_at", null)
        .range(offset, offset + limit - 1)
        .order("full_name");
      
      if (error) throw error;
      
      response = jsonResponse({ data, meta: { total: count, limit, offset } }, 200, rateLimitHeaders);
    }
    
    else if (path === "/v1/crew" && method === "POST") {
      if (!hasScope(keyData, "write:crew")) {
        return jsonResponse({ error: "Insufficient permissions" }, 403);
      }
      
      const body = await req.json();
      const { data, error } = await supabase
        .from("crew_members")
        .insert({ ...body, organization_id: keyData.organization_id })
        .select()
        .single();
      
      if (error) throw error;
      
      response = jsonResponse({ data, message: "Crew member created" }, 201, rateLimitHeaders);
    }
    
    // DOCUMENTS
    else if (path === "/v1/documents" && method === "GET") {
      if (!hasScope(keyData, "read:documents")) {
        return jsonResponse({ error: "Insufficient permissions" }, 403);
      }
      
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const { data, error, count } = await supabase
        .from("documents")
        .select("id, title, document_type, status, file_path, created_at", { count: "exact" })
        .eq("organization_id", keyData.organization_id)
        .is("deleted_at", null)
        .limit(limit)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      response = jsonResponse({ data, meta: { total: count, limit } }, 200, rateLimitHeaders);
    }
    
    // MAINTENANCE
    else if (path === "/v1/maintenance" && method === "GET") {
      if (!hasScope(keyData, "read:maintenance")) {
        return jsonResponse({ error: "Insufficient permissions" }, 403);
      }
      
      const { data, error, count } = await supabase
        .from("maintenance_tasks")
        .select("id, title, description, status, priority, due_date, vessel_id, created_at", { count: "exact" })
        .eq("organization_id", keyData.organization_id)
        .is("deleted_at", null)
        .limit(100)
        .order("due_date");
      
      if (error) throw error;
      
      response = jsonResponse({ data, meta: { total: count } }, 200, rateLimitHeaders);
    }
    
    // CERTIFICATES
    else if (path === "/v1/certificates" && method === "GET") {
      if (!hasScope(keyData, "read:certificates")) {
        return jsonResponse({ error: "Insufficient permissions" }, 403);
      }
      
      const { data, error, count } = await supabase
        .from("certificates")
        .select("id, certificate_type, certificate_number, issue_date, expiry_date, status, employee_id", { count: "exact" })
        .eq("organization_id", keyData.organization_id)
        .limit(100)
        .order("expiry_date");
      
      if (error) throw error;
      
      response = jsonResponse({ data, meta: { total: count } }, 200, rateLimitHeaders);
    }
    
    // ANALYTICS
    else if (path === "/v1/analytics/summary" && method === "GET") {
      if (!hasScope(keyData, "read:analytics")) {
        return jsonResponse({ error: "Insufficient permissions" }, 403);
      }
      
      const [vessels, crew, docs, maintenance] = await Promise.all([
        supabase.from("vessels").select("id", { count: "exact", head: true }).eq("organization_id", keyData.organization_id),
        supabase.from("crew_members").select("id", { count: "exact", head: true }).eq("organization_id", keyData.organization_id),
        supabase.from("documents").select("id", { count: "exact", head: true }).eq("organization_id", keyData.organization_id),
        supabase.from("maintenance_tasks").select("id", { count: "exact", head: true }).eq("organization_id", keyData.organization_id).eq("status", "pending")
      ]);
      
      response = jsonResponse({
        data: {
          total_vessels: vessels.count || 0,
          total_crew: crew.count || 0,
          total_documents: docs.count || 0,
          pending_maintenance: maintenance.count || 0,
          generated_at: new Date().toISOString()
        }
      }, 200, rateLimitHeaders);
    }
    
    // WEBHOOKS DISPATCH
    else if (path === "/v1/webhooks/dispatch" && method === "POST") {
      if (!hasScope(keyData, "write:webhooks")) {
        return jsonResponse({ error: "Insufficient permissions" }, 403);
      }
      
      const body = await req.json();
      const { event_type, event_data } = body;
      
      if (!event_type) {
        return jsonResponse({ error: "event_type is required" }, 400);
      }
      
      // Dispatch webhooks
      const { data: dispatchResult } = await supabase.functions.invoke("webhook-dispatcher", {
        body: { action: "dispatch", event_type, event_data }
      });
      
      response = jsonResponse({ success: true, dispatched: dispatchResult?.dispatched || 0 }, 200, rateLimitHeaders);
    }
    
    else {
      response = jsonResponse({ error: "Endpoint not found", code: "NOT_FOUND" }, 404);
    }
    
    // Log usage
    const responseTime = Date.now() - startTime;
    await logApiUsage(supabase, keyData.id, path, method, response.status, responseTime, req);
    
    return response;
    
  } catch (error) {
    console.error("API Error:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Internal server error", code: "INTERNAL_ERROR" },
      500
    );
  }
});
