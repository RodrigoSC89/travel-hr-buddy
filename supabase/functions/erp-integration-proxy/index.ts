/**
 * ERP Integration Proxy — Secure server-side proxy for SAP, Oracle, Dynamics 365
 * Credentials are stored as Supabase secrets, never exposed to frontend
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { operation, erp_type, params } = await req.json();

    // Supported operations
    const OPERATIONS: Record<string, string[]> = {
      sap: ["test-connection", "sync-crew", "sync-maintenance", "sync-finance", "sync-procurement"],
      oracle: ["test-connection", "sync-employees", "sync-assets"],
      dynamics: ["test-connection", "sync-vendors", "sync-employees"],
    };

    if (!erp_type || !OPERATIONS[erp_type]) {
      return new Response(
        JSON.stringify({ error: `Invalid ERP type. Supported: ${Object.keys(OPERATIONS).join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!operation || !OPERATIONS[erp_type].includes(operation)) {
      return new Response(
        JSON.stringify({ error: `Invalid operation. Supported for ${erp_type}: ${OPERATIONS[erp_type].join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const start = Date.now();
    let result: unknown;

    switch (erp_type) {
      case "sap": {
        const sapUrl = Deno.env.get("SAP_BASE_URL");
        const sapUser = Deno.env.get("SAP_USER");
        const sapPass = Deno.env.get("SAP_PASSWORD");
        const sapClient = Deno.env.get("SAP_CLIENT") || "100";

        if (!sapUrl || !sapUser || !sapPass) {
          result = {
            success: false,
            status: "not_configured",
            message: "SAP credentials not configured. Set SAP_BASE_URL, SAP_USER, SAP_PASSWORD secrets.",
            required_secrets: ["SAP_BASE_URL", "SAP_USER", "SAP_PASSWORD", "SAP_CLIENT"],
          };
          break;
        }

        const authStr = "Basic " + btoa(`${sapUser}:${sapPass}`);
        const headers: Record<string, string> = {
          Authorization: authStr,
          "sap-client": sapClient,
          Accept: "application/json",
        };

        if (operation === "test-connection") {
          try {
            const resp = await fetch(`${sapUrl}/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner?$top=1&$format=json`, {
              headers: { ...headers, "X-CSRF-Token": "Fetch" },
            });
            result = { success: resp.ok, status: resp.ok ? "connected" : "error", statusCode: resp.status, duration_ms: Date.now() - start };
          } catch (e) {
            result = { success: false, status: "error", error: (e as Error).message, duration_ms: Date.now() - start };
          }
        } else {
          // Generic OData sync
          const endpoints: Record<string, string> = {
            "sync-crew": "/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner?$filter=BusinessPartnerCategory eq '1'&$top=500&$format=json",
            "sync-maintenance": "/sap/opu/odata/sap/API_MAINTNOTIFICATION/MaintenanceNotification?$filter=NotificationType eq 'M2'&$top=500&$format=json",
            "sync-finance": "/sap/opu/odata/sap/API_JOURNAL_ENTRY_ITEM_BASIC/A_JournalEntryItemBasic?$top=500&$format=json",
            "sync-procurement": "/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder?$top=500&$format=json",
          };
          try {
            const resp = await fetch(`${sapUrl}${endpoints[operation]}`, { headers });
            const data = await resp.json();
            const records = data?.d?.results || [];
            result = { success: resp.ok, recordsProcessed: records.length, source: "sap", operation, duration_ms: Date.now() - start };
          } catch (e) {
            result = { success: false, error: (e as Error).message, duration_ms: Date.now() - start };
          }
        }
        break;
      }

      case "oracle": {
        const oracleUrl = Deno.env.get("ORACLE_BASE_URL");
        const oracleClientId = Deno.env.get("ORACLE_CLIENT_ID");
        const oracleClientSecret = Deno.env.get("ORACLE_CLIENT_SECRET");
        const oracleTokenUrl = Deno.env.get("ORACLE_TOKEN_URL");

        if (!oracleUrl || !oracleClientId || !oracleClientSecret) {
          result = {
            success: false,
            status: "not_configured",
            message: "Oracle credentials not configured.",
            required_secrets: ["ORACLE_BASE_URL", "ORACLE_CLIENT_ID", "ORACLE_CLIENT_SECRET", "ORACLE_TOKEN_URL"],
          };
          break;
        }

        try {
          // Get OAuth token
          const tokenResp = await fetch(oracleTokenUrl || `${oracleUrl}/oauth2/v1/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "client_credentials",
              client_id: oracleClientId,
              client_secret: oracleClientSecret,
              scope: "urn:opc:resource:consumer::all",
            }),
          });
          const tokenData = await tokenResp.json();
          const accessToken = tokenData.access_token;

          if (operation === "test-connection") {
            result = { success: !!accessToken, status: accessToken ? "connected" : "error", duration_ms: Date.now() - start };
          } else {
            const endpoints: Record<string, string> = {
              "sync-employees": "/hcmRestApi/resources/11.13.18.05/workers?limit=500",
              "sync-assets": "/fscmRestApi/resources/11.13.18.05/maintenanceWorkOrders?limit=500",
            };
            const resp = await fetch(`${oracleUrl}${endpoints[operation]}`, {
              headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
            });
            const data = await resp.json();
            result = { success: resp.ok, recordsProcessed: data?.items?.length || 0, source: "oracle", operation, duration_ms: Date.now() - start };
          }
        } catch (e) {
          result = { success: false, error: (e as Error).message, duration_ms: Date.now() - start };
        }
        break;
      }

      case "dynamics": {
        const d365Url = Deno.env.get("DYNAMICS_BASE_URL");
        const d365TenantId = Deno.env.get("DYNAMICS_TENANT_ID");
        const d365ClientId = Deno.env.get("DYNAMICS_CLIENT_ID");
        const d365ClientSecret = Deno.env.get("DYNAMICS_CLIENT_SECRET");

        if (!d365Url || !d365TenantId || !d365ClientId || !d365ClientSecret) {
          result = {
            success: false,
            status: "not_configured",
            message: "Dynamics 365 credentials not configured.",
            required_secrets: ["DYNAMICS_BASE_URL", "DYNAMICS_TENANT_ID", "DYNAMICS_CLIENT_ID", "DYNAMICS_CLIENT_SECRET"],
          };
          break;
        }

        try {
          const tokenResp = await fetch(`https://login.microsoftonline.com/${d365TenantId}/oauth2/v2.0/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "client_credentials",
              client_id: d365ClientId,
              client_secret: d365ClientSecret,
              scope: `${d365Url}/.default`,
            }),
          });
          const tokenData = await tokenResp.json();
          const accessToken = tokenData.access_token;

          if (operation === "test-connection") {
            result = { success: !!accessToken, status: accessToken ? "connected" : "error", duration_ms: Date.now() - start };
          } else {
            const endpoints: Record<string, string> = {
              "sync-vendors": "/data/Vendors?$top=500&$select=VendorAccountNumber,VendorName",
              "sync-employees": "/data/Workers?$top=500&$select=PersonnelNumber,Name",
            };
            const resp = await fetch(`${d365Url}${endpoints[operation]}`, {
              headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
            });
            const data = await resp.json();
            result = { success: resp.ok, recordsProcessed: data?.value?.length || 0, source: "dynamics", operation, duration_ms: Date.now() - start };
          }
        } catch (e) {
          result = { success: false, error: (e as Error).message, duration_ms: Date.now() - start };
        }
        break;
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[erp-integration-proxy] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
