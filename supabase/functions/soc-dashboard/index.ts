import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface Alert { id: string; severity: string; alert_type: string; is_acknowledged: boolean; resolved_at: string | null; }
interface CrewMember { id: string; status: string; }
interface Vessel { id: string; status: string; }
interface Invoice { id: string; status: string; total_amount: number; due_at: string; }
interface Transmission { id: string; status: string; }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Invalid authentication");
    }

    const { operation, payload } = await req.json();
    console.log(`[soc-dashboard] Operation: ${operation}, User: ${user.id}`);

    const { data: orgUser } = await supabase
      .from("organization_users")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!orgUser) {
      throw new Error("User not associated with any organization");
    }

    const organizationId = orgUser.organization_id;

    switch (operation) {
      case "get_dashboard_stats": {
        const { data: alerts } = await supabase
          .from("soc_alerts")
          .select("id, severity, alert_type, is_acknowledged, resolved_at")
          .eq("organization_id", organizationId)
          .is("resolved_at", null);

        const alertList = (alerts || []) as Alert[];
        const alertStats = {
          total: alertList.length,
          critical: alertList.filter((a) => a.severity === "critical").length,
          high: alertList.filter((a) => a.severity === "high").length,
          medium: alertList.filter((a) => a.severity === "medium").length,
          low: alertList.filter((a) => a.severity === "low").length,
          unacknowledged: alertList.filter((a) => !a.is_acknowledged).length,
          by_type: {
            compliance: alertList.filter((a) => a.alert_type === "compliance").length,
            maintenance: alertList.filter((a) => a.alert_type === "maintenance").length,
            crew: alertList.filter((a) => a.alert_type === "crew").length,
            safety: alertList.filter((a) => a.alert_type === "safety").length,
            weather: alertList.filter((a) => a.alert_type === "weather").length,
          },
        };

        const { data: crewMembers } = await supabase
          .from("crew_members")
          .select("id, status")
          .eq("organization_id", organizationId);

        const crewList = (crewMembers || []) as CrewMember[];
        const crewStats = {
          total: crewList.length,
          onboard: crewList.filter((c) => c.status === "onboard").length,
          onshore: crewList.filter((c) => c.status === "onshore").length,
          on_leave: crewList.filter((c) => c.status === "on_leave").length,
        };

        const { data: vessels } = await supabase
          .from("vessels")
          .select("id, status")
          .eq("organization_id", organizationId);

        const vesselList = (vessels || []) as Vessel[];
        const vesselStats = {
          total: vesselList.length,
          active: vesselList.filter((v) => v.status === "active").length,
          in_port: vesselList.filter((v) => v.status === "in_port").length,
          maintenance: vesselList.filter((v) => v.status === "maintenance").length,
        };

        const { data: invoices } = await supabase
          .from("invoices")
          .select("id, status, total_amount, due_at")
          .eq("organization_id", organizationId)
          .in("status", ["sent", "overdue"]);

        const invoiceList = (invoices || []) as Invoice[];
        const invoiceStats = {
          pending_count: invoiceList.length,
          pending_amount: invoiceList.reduce((sum, i) => sum + Number(i.total_amount), 0),
          overdue_count: invoiceList.filter((i) => i.status === "overdue").length,
        };

        const { data: transmissions } = await supabase
          .from("siscomex_transmissions")
          .select("id, status")
          .eq("organization_id", organizationId)
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        const txList = (transmissions || []) as Transmission[];
        const siscomexStats = {
          total_7_days: txList.length,
          pending: txList.filter((t) => t.status === "pending").length,
          sent: txList.filter((t) => t.status === "sent").length,
          acknowledged: txList.filter((t) => t.status === "acknowledged").length,
          errors: txList.filter((t) => t.status === "error").length,
        };

        return new Response(
          JSON.stringify({
            success: true,
            stats: {
              alerts: alertStats,
              crew: crewStats,
              vessels: vesselStats,
              invoices: invoiceStats,
              siscomex: siscomexStats,
              last_updated: new Date().toISOString(),
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_active_alerts": {
        const { severity, alert_type, limit = 50 } = payload || {};

        let query = supabase
          .from("soc_alerts")
          .select("*")
          .eq("organization_id", organizationId)
          .is("resolved_at", null)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (severity) query = query.eq("severity", severity);
        if (alert_type) query = query.eq("alert_type", alert_type);

        const { data: alerts, error } = await query;

        if (error) throw error;

        return new Response(
          JSON.stringify({
            success: true,
            alerts,
            count: alerts?.length || 0,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "acknowledge_alert": {
        const { alert_id } = payload;

        if (!alert_id) {
          throw new Error("alert_id is required");
        }

        const { error: updateError } = await supabase
          .from("soc_alerts")
          .update({
            is_acknowledged: true,
            acknowledged_by: user.id,
            acknowledged_at: new Date().toISOString(),
          })
          .eq("id", alert_id)
          .eq("organization_id", organizationId);

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({
            success: true,
            alert_id,
            message: "Alert acknowledged",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "resolve_alert": {
        const { alert_id, resolution_notes } = payload;

        if (!alert_id) {
          throw new Error("alert_id is required");
        }

        const { error: updateError } = await supabase
          .from("soc_alerts")
          .update({
            resolved_at: new Date().toISOString(),
            resolved_by: user.id,
            metadata: {
              resolution_notes,
              resolved_at: new Date().toISOString(),
            },
          })
          .eq("id", alert_id)
          .eq("organization_id", organizationId);

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({
            success: true,
            alert_id,
            message: "Alert resolved",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "create_alert": {
        const { alert_type, severity, title, message, vessel_id, source_module, source_reference_id, metadata } = payload;

        if (!alert_type || !severity || !title || !message) {
          throw new Error("alert_type, severity, title, and message are required");
        }

        const { data: alert, error: insertError } = await supabase
          .from("soc_alerts")
          .insert({
            organization_id: organizationId,
            vessel_id,
            alert_type,
            severity,
            title,
            message,
            source_module,
            source_reference_id,
            metadata: metadata || {},
          })
          .select()
          .single();

        if (insertError) throw insertError;

        console.log(`[soc-dashboard] Alert created: ${alert.id}`);

        return new Response(
          JSON.stringify({
            success: true,
            alert_id: alert.id,
            message: "Alert created",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_compliance_deadlines": {
        // Get upcoming compliance deadlines
        const { data: certificates } = await supabase
          .from("maritime_certificates")
          .select("id, certificate_type, expiry_date, crew_member_id, crew_members(name)")
          .eq("organization_id", organizationId)
          .gte("expiry_date", new Date().toISOString())
          .lte("expiry_date", new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString())
          .order("expiry_date", { ascending: true })
          .limit(20);

        const deadlines = (certificates || []).map((cert: any) => ({
          id: cert.id,
          type: "certificate",
          description: `${cert.certificate_type} - ${cert.crew_members?.name || "Unknown"}`,
          expiry_date: cert.expiry_date,
          days_until_expiry: Math.ceil(
            (new Date(cert.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          ),
          severity:
            Math.ceil((new Date(cert.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 7
              ? "critical"
              : Math.ceil((new Date(cert.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 30
              ? "high"
              : "medium",
        }));

        return new Response(
          JSON.stringify({
            success: true,
            deadlines,
            count: deadlines.length,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_maintenance_alerts": {
        // Get maintenance items needing attention
        const { data: maintenanceItems } = await supabase
          .from("maintenance_items")
          .select("*")
          .eq("organization_id", organizationId)
          .in("status", ["pending", "in_progress", "overdue"])
          .order("due_date", { ascending: true })
          .limit(20);

        const maintenanceAlerts = (maintenanceItems || []).map((item: any) => ({
          id: item.id,
          title: item.title || item.description,
          vessel_id: item.vessel_id,
          status: item.status,
          due_date: item.due_date,
          priority: item.priority || "medium",
          days_overdue: item.due_date
            ? Math.max(0, Math.ceil((Date.now() - new Date(item.due_date).getTime()) / (1000 * 60 * 60 * 24)))
            : 0,
        }));

        return new Response(
          JSON.stringify({
            success: true,
            maintenance_alerts: maintenanceAlerts,
            count: maintenanceAlerts.length,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[soc-dashboard] Error:", errorMessage);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
