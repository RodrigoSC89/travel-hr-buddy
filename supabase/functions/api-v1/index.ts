// @ts-nocheck
/**
 * Nauti One Public API v1
 * Complete REST API with authentication, rate limiting, and comprehensive endpoints
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-api-key, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface APIKeyData {
  id: string;
  organization_id: string;
  scopes: string[];
  rate_limit: number;
  usage_count: number;
}

// Initialize Supabase client
function getSupabaseClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
}

// Hash API key
async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Authenticate API key
async function authenticateAPIKey(req: Request): Promise<APIKeyData> {
  const apiKey = req.headers.get("X-API-Key") || 
                 req.headers.get("Authorization")?.replace("Bearer ", "");
  
  if (!apiKey) {
    throw new Error("API key required. Provide via X-API-Key header or Authorization: Bearer <key>");
  }
  
  const keyHash = await hashKey(apiKey);
  const supabase = getSupabaseClient();
  
  const { data: keyData, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("key_hash", keyHash)
    .eq("is_active", true)
    .single();
  
  if (error || !keyData) {
    throw new Error("Invalid API key");
  }
  
  // Check expiration
  if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
    throw new Error("API key expired");
  }
  
  // Check rate limit (requests in last hour)
  const oneHourAgo = new Date(Date.now() - 3600000);
  const { count } = await supabase
    .from("api_key_usage")
    .select("*", { count: "exact", head: true })
    .eq("api_key_id", keyData.id)
    .gte("timestamp", oneHourAgo.toISOString());
  
  if (count && count >= keyData.rate_limit) {
    throw new Error("Rate limit exceeded. Try again later.");
  }
  
  return keyData;
}

// Check scope permission
function requireScope(keyData: APIKeyData, requiredScope: string): void {
  if (keyData.scopes.includes("admin:*")) return;
  if (keyData.scopes.includes(requiredScope)) return;
  
  const [resource] = requiredScope.split(":");
  if (keyData.scopes.includes(`${resource}:*`)) return;
  
  throw new Error(`Missing required scope: ${requiredScope}`);
}

// Log API usage
async function logUsage(
  keyData: APIKeyData, 
  req: Request, 
  statusCode: number, 
  startTime: number
) {
  const supabase = getSupabaseClient();
  const url = new URL(req.url);
  
  await supabase.from("api_key_usage").insert({
    api_key_id: keyData.id,
    endpoint: url.pathname,
    method: req.method,
    status_code: statusCode,
    response_time_ms: Date.now() - startTime,
    ip_address: req.headers.get("x-forwarded-for")?.split(",")[0] || null,
    user_agent: req.headers.get("user-agent"),
    request_id: crypto.randomUUID(),
  });
  
  // Update usage count
  await supabase
    .from("api_keys")
    .update({
      last_used_at: new Date().toISOString(),
      usage_count: keyData.usage_count + 1,
    })
    .eq("id", keyData.id);
}

// JSON response helper
function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Error response helper
function errorResponse(message: string, status: number) {
  return new Response(
    JSON.stringify({ error: message, status }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// =====================================================
// VESSELS ROUTES
// =====================================================
async function handleVessels(
  req: Request, 
  path: string, 
  keyData: APIKeyData
): Promise<Response> {
  const supabase = getSupabaseClient();
  const method = req.method;
  const url = new URL(req.url);
  
  // GET /vessels - List all vessels
  if (method === "GET" && path === "/vessels") {
    requireScope(keyData, "read:vessels");
    
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const status = url.searchParams.get("status");
    
    let query = supabase
      .from("vessels")
      .select("*", { count: "exact" })
      .eq("organization_id", keyData.organization_id)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });
    
    if (status) {
      query = query.eq("status", status);
    }
    
    const { data, error, count } = await query;
    
    if (error) return errorResponse(error.message, 400);
    
    return jsonResponse({
      data,
      meta: { total: count, limit, offset },
    });
  }
  
  // GET /vessels/:id - Get specific vessel
  const vesselIdMatch = path.match(/^\/vessels\/([^\/]+)$/);
  if (method === "GET" && vesselIdMatch) {
    requireScope(keyData, "read:vessels");
    
    const vesselId = vesselIdMatch[1];
    
    const { data, error } = await supabase
      .from("vessels")
      .select(`
        *,
        vessel_parts(id, part_number, name, category),
        vessel_manuals(id, title, file_url),
        vessel_sensors(id, sensor_type, status, last_reading)
      `)
      .eq("id", vesselId)
      .eq("organization_id", keyData.organization_id)
      .single();
    
    if (error) return errorResponse("Vessel not found", 404);
    
    return jsonResponse({ data });
  }
  
  // POST /vessels - Create vessel
  if (method === "POST" && path === "/vessels") {
    requireScope(keyData, "write:vessels");
    
    const body = await req.json();
    
    const { data, error } = await supabase
      .from("vessels")
      .insert({
        ...body,
        organization_id: keyData.organization_id,
      })
      .select()
      .single();
    
    if (error) return errorResponse(error.message, 400);
    
    // Trigger webhook
    await triggerWebhook("vessel.created", data, keyData.organization_id);
    
    return jsonResponse({ data }, 201);
  }
  
  // PUT /vessels/:id - Update vessel
  if (method === "PUT" && vesselIdMatch) {
    requireScope(keyData, "write:vessels");
    
    const vesselId = vesselIdMatch[1];
    const body = await req.json();
    
    const { data, error } = await supabase
      .from("vessels")
      .update(body)
      .eq("id", vesselId)
      .eq("organization_id", keyData.organization_id)
      .select()
      .single();
    
    if (error) return errorResponse(error.message, 400);
    
    await triggerWebhook("vessel.updated", data, keyData.organization_id);
    
    return jsonResponse({ data });
  }
  
  // DELETE /vessels/:id
  if (method === "DELETE" && vesselIdMatch) {
    requireScope(keyData, "delete:vessels");
    
    const vesselId = vesselIdMatch[1];
    
    const { error } = await supabase
      .from("vessels")
      .delete()
      .eq("id", vesselId)
      .eq("organization_id", keyData.organization_id);
    
    if (error) return errorResponse(error.message, 400);
    
    await triggerWebhook("vessel.deleted", { id: vesselId }, keyData.organization_id);
    
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  
  return errorResponse("Not found", 404);
}

// =====================================================
// CREW ROUTES
// =====================================================
async function handleCrew(
  req: Request, 
  path: string, 
  keyData: APIKeyData
): Promise<Response> {
  const supabase = getSupabaseClient();
  const method = req.method;
  const url = new URL(req.url);
  
  // GET /crew - List all crew members
  if (method === "GET" && path === "/crew") {
    requireScope(keyData, "read:crew");
    
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    
    const { data, error, count } = await supabase
      .from("crew_members")
      .select("*", { count: "exact" })
      .eq("organization_id", keyData.organization_id)
      .range(offset, offset + limit - 1)
      .order("full_name");
    
    if (error) return errorResponse(error.message, 400);
    
    return jsonResponse({
      data,
      meta: { total: count, limit, offset },
    });
  }
  
  // GET /crew/:id
  const crewIdMatch = path.match(/^\/crew\/([^\/]+)$/);
  if (method === "GET" && crewIdMatch) {
    requireScope(keyData, "read:crew");
    
    const { data, error } = await supabase
      .from("crew_members")
      .select(`
        *,
        crew_certificates(*),
        crew_contracts(*)
      `)
      .eq("id", crewIdMatch[1])
      .eq("organization_id", keyData.organization_id)
      .single();
    
    if (error) return errorResponse("Crew member not found", 404);
    
    return jsonResponse({ data });
  }
  
  // POST /crew
  if (method === "POST" && path === "/crew") {
    requireScope(keyData, "write:crew");
    
    const body = await req.json();
    
    const { data, error } = await supabase
      .from("crew_members")
      .insert({
        ...body,
        organization_id: keyData.organization_id,
      })
      .select()
      .single();
    
    if (error) return errorResponse(error.message, 400);
    
    await triggerWebhook("crew.created", data, keyData.organization_id);
    
    return jsonResponse({ data }, 201);
  }
  
  // PUT /crew/:id
  if (method === "PUT" && crewIdMatch) {
    requireScope(keyData, "write:crew");
    
    const { data, error } = await supabase
      .from("crew_members")
      .update(await req.json())
      .eq("id", crewIdMatch[1])
      .eq("organization_id", keyData.organization_id)
      .select()
      .single();
    
    if (error) return errorResponse(error.message, 400);
    
    await triggerWebhook("crew.updated", data, keyData.organization_id);
    
    return jsonResponse({ data });
  }
  
  return errorResponse("Not found", 404);
}

// =====================================================
// DOCUMENTS ROUTES
// =====================================================
async function handleDocuments(
  req: Request, 
  path: string, 
  keyData: APIKeyData
): Promise<Response> {
  const supabase = getSupabaseClient();
  const method = req.method;
  const url = new URL(req.url);
  
  // GET /documents
  if (method === "GET" && path === "/documents") {
    requireScope(keyData, "read:documents");
    
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const category = url.searchParams.get("category");
    
    let query = supabase
      .from("documents")
      .select("*", { count: "exact" })
      .eq("organization_id", keyData.organization_id)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });
    
    if (category) {
      query = query.eq("category", category);
    }
    
    const { data, error, count } = await query;
    
    if (error) return errorResponse(error.message, 400);
    
    return jsonResponse({
      data,
      meta: { total: count, limit, offset },
    });
  }
  
  // GET /documents/:id
  const docIdMatch = path.match(/^\/documents\/([^\/]+)$/);
  if (method === "GET" && docIdMatch) {
    requireScope(keyData, "read:documents");
    
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", docIdMatch[1])
      .eq("organization_id", keyData.organization_id)
      .single();
    
    if (error) return errorResponse("Document not found", 404);
    
    return jsonResponse({ data });
  }
  
  return errorResponse("Not found", 404);
}

// =====================================================
// MAINTENANCE ROUTES
// =====================================================
async function handleMaintenance(
  req: Request, 
  path: string, 
  keyData: APIKeyData
): Promise<Response> {
  const supabase = getSupabaseClient();
  const method = req.method;
  const url = new URL(req.url);
  
  // GET /maintenance
  if (method === "GET" && path === "/maintenance") {
    requireScope(keyData, "read:maintenance");
    
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const vesselId = url.searchParams.get("vessel_id");
    const status = url.searchParams.get("status");
    
    let query = supabase
      .from("maintenance_tasks")
      .select("*", { count: "exact" })
      .eq("organization_id", keyData.organization_id)
      .range(offset, offset + limit - 1)
      .order("due_date", { ascending: true });
    
    if (vesselId) query = query.eq("vessel_id", vesselId);
    if (status) query = query.eq("status", status);
    
    const { data, error, count } = await query;
    
    if (error) return errorResponse(error.message, 400);
    
    return jsonResponse({
      data,
      meta: { total: count, limit, offset },
    });
  }
  
  // POST /maintenance
  if (method === "POST" && path === "/maintenance") {
    requireScope(keyData, "write:maintenance");
    
    const body = await req.json();
    
    const { data, error } = await supabase
      .from("maintenance_tasks")
      .insert({
        ...body,
        organization_id: keyData.organization_id,
      })
      .select()
      .single();
    
    if (error) return errorResponse(error.message, 400);
    
    await triggerWebhook("maintenance.created", data, keyData.organization_id);
    
    return jsonResponse({ data }, 201);
  }
  
  return errorResponse("Not found", 404);
}

// =====================================================
// WEBHOOKS TRIGGER
// =====================================================
async function triggerWebhook(
  event: string,
  payload: unknown,
  organizationId: string
) {
  const supabase = getSupabaseClient();
  
  try {
    const { data: webhooks } = await supabase
      .from("webhooks")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .contains("events", [event]);
    
    if (!webhooks || webhooks.length === 0) return;
    
    for (const webhook of webhooks) {
      try {
        const payloadStr = JSON.stringify(payload);
        
        // Generate HMAC signature
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw",
          encoder.encode(webhook.secret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );
        const signature = await crypto.subtle.sign(
          "HMAC",
          key,
          encoder.encode(payloadStr)
        );
        const signatureHex = Array.from(new Uint8Array(signature))
          .map(b => b.toString(16).padStart(2, "0"))
          .join("");
        
        const startTime = Date.now();
        const response = await fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signatureHex,
            "X-Webhook-Event": event,
            "X-Webhook-ID": webhook.id,
            ...webhook.custom_headers,
          },
          body: payloadStr,
        });
        
        // Log delivery
        await supabase.from("webhook_deliveries").insert({
          webhook_id: webhook.id,
          event,
          payload,
          status: response.ok ? "success" : "failed",
          status_code: response.status,
          response_body: await response.text(),
          response_time_ms: Date.now() - startTime,
          delivered_at: new Date().toISOString(),
        });
        
      } catch (err) {
        console.error(`Webhook delivery failed: ${err.message}`);
        
        await supabase.from("webhook_deliveries").insert({
          webhook_id: webhook.id,
          event,
          payload,
          status: "failed",
          error_message: err.message,
          delivered_at: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.error("Webhook trigger error:", err);
  }
}

// =====================================================
// API INFO ROUTE
// =====================================================
function handleAPIInfo(): Response {
  return jsonResponse({
    name: "Nauti One API",
    version: "1.0.0",
    documentation: "https://docs.nautione.com/api",
    endpoints: {
      vessels: "/api-v1/vessels",
      crew: "/api-v1/crew",
      documents: "/api-v1/documents",
      maintenance: "/api-v1/maintenance",
      webhooks: "/api-v1/webhooks",
    },
    scopes: [
      "read:vessels", "write:vessels", "delete:vessels",
      "read:crew", "write:crew", "delete:crew",
      "read:documents", "write:documents",
      "read:maintenance", "write:maintenance",
      "admin:*",
    ],
  });
}

// =====================================================
// MAIN HANDLER
// =====================================================
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  const startTime = Date.now();
  const url = new URL(req.url);
  const path = url.pathname.replace("/api-v1", "");
  
  // API info (public)
  if (path === "" || path === "/") {
    return handleAPIInfo();
  }
  
  // Health check (public)
  if (path === "/health") {
    return jsonResponse({ status: "ok", timestamp: new Date().toISOString() });
  }
  
  let keyData: APIKeyData;
  
  try {
    // Authenticate
    keyData = await authenticateAPIKey(req);
  } catch (err) {
    const status = err.message.includes("Rate limit") ? 429 : 401;
    return errorResponse(err.message, status);
  }
  
  try {
    let response: Response;
    
    // Route to appropriate handler
    if (path.startsWith("/vessels")) {
      response = await handleVessels(req, path, keyData);
    } else if (path.startsWith("/crew")) {
      response = await handleCrew(req, path, keyData);
    } else if (path.startsWith("/documents")) {
      response = await handleDocuments(req, path, keyData);
    } else if (path.startsWith("/maintenance")) {
      response = await handleMaintenance(req, path, keyData);
    } else {
      response = errorResponse("Endpoint not found", 404);
    }
    
    // Log usage
    await logUsage(keyData, req, response.status, startTime);
    
    return response;
    
  } catch (err) {
    console.error("API Error:", err);
    
    const status = err.message.includes("scope") ? 403 : 500;
    await logUsage(keyData, req, status, startTime);
    
    return errorResponse(err.message, status);
  }
});
