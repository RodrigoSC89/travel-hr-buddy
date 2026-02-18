import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SystemEvent {
  id: string;
  event_type: string;
  source_module: string;
  source_record_id: string;
  vessel_id: string | null;
  organization_id: string | null;
  payload: Record<string, unknown>;
  priority: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Fetch unprocessed events ordered by priority then time
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    const { data: events, error: fetchError } = await sb
      .from("system_events")
      .select("*")
      .eq("processed", false)
      .lte("retry_count", 3)
      .order("created_at", { ascending: true })
      .limit(50);

    if (fetchError) throw fetchError;
    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, message: "No pending events" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sort by priority
    events.sort(
      (a: SystemEvent, b: SystemEvent) =>
        (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2) -
        (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2)
    );

    let processed = 0;
    let errors = 0;
    const results: Array<{ id: string; event_type: string; success: boolean; error?: string }> = [];

    for (const event of events as SystemEvent[]) {
      try {
        const result = await processEvent(sb, event);
        await sb
          .from("system_events")
          .update({
            processed: true,
            processed_at: new Date().toISOString(),
            processor_result: result,
          })
          .eq("id", event.id);
        processed++;
        results.push({ id: event.id, event_type: event.event_type, success: true });
      } catch (err) {
        errors++;
        const errorMsg = err instanceof Error ? err.message : String(err);
        await sb
          .from("system_events")
          .update({
            retry_count: (event as any).retry_count + 1,
            error_message: errorMsg,
          })
          .eq("id", event.id);
        results.push({ id: event.id, event_type: event.event_type, success: false, error: errorMsg });
      }
    }

    return new Response(
      JSON.stringify({ processed, errors, total: events.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function processEvent(sb: any, event: SystemEvent) {
  const payload = event.payload;
  const actions: string[] = [];

  switch (event.event_type) {
    // ── VOYAGE CREATED ──
    case "voyage_created": {
      // 1. Notify compliance check
      if (event.vessel_id) {
        const { data: expiring } = await sb
          .from("certificates")
          .select("id, certificate_type, expiry_date")
          .eq("vessel_id", event.vessel_id)
          .lt("expiry_date", new Date(Date.now() + 30 * 86400000).toISOString())
          .eq("status", "active")
          .limit(10);

        if (expiring && expiring.length > 0) {
          await sb.from("soc_alerts").insert({
            vessel_id: event.vessel_id,
            organization_id: event.organization_id,
            alert_type: "compliance_warning",
            severity: "high",
            title: `⚠️ ${expiring.length} certificado(s) próximo(s) do vencimento`,
            message: `Viagem criada mas há certificados vencendo em 30 dias: ${expiring.map((c: any) => c.certificate_type).join(", ")}`,
            source_module: "voyage",
            source_reference_id: event.source_record_id,
          });
          actions.push(`compliance_alert_${expiring.length}_certs`);
        }

        // 2. Check crew manning
        const { count: crewCount } = await sb
          .from("crew_members")
          .select("id", { count: "exact", head: true })
          .eq("vessel_id", event.vessel_id)
          .eq("status", "on_board");

        const { data: vessel } = await sb
          .from("vessels")
          .select("min_crew, name")
          .eq("id", event.vessel_id)
          .single();

        if (vessel?.min_crew && (crewCount ?? 0) < vessel.min_crew) {
          await sb.from("soc_alerts").insert({
            vessel_id: event.vessel_id,
            organization_id: event.organization_id,
            alert_type: "manning_warning",
            severity: "critical",
            title: `🚨 Manning insuficiente - ${vessel.name}`,
            message: `Tripulação atual: ${crewCount}/${vessel.min_crew}. Viagem pode ser comprometida.`,
            source_module: "crew",
          });
          actions.push("manning_alert");
        }
      }
      break;
    }

    // ── CERTIFICATE UPDATED ──
    case "certificate_updated": {
      const expiryDate = payload.expiry_date as string | undefined;
      if (expiryDate) {
        const daysToExpiry = Math.ceil(
          (new Date(expiryDate).getTime() - Date.now()) / 86400000
        );

        if (daysToExpiry <= 0) {
          // Expired — create critical alert
          await sb.from("soc_alerts").insert({
            vessel_id: event.vessel_id,
            organization_id: event.organization_id,
            alert_type: "certificate_expired",
            severity: "critical",
            title: `🔴 Certificado EXPIRADO: ${payload.certificate_type}`,
            message: `Certificado ${payload.certificate_number || ""} expirou. Novas viagens podem ser bloqueadas.`,
            source_module: "compliance",
            source_reference_id: event.source_record_id,
          });
          actions.push("cert_expired_alert");
        } else if (daysToExpiry <= 30) {
          await sb.from("soc_alerts").insert({
            vessel_id: event.vessel_id,
            organization_id: event.organization_id,
            alert_type: "certificate_expiring",
            severity: daysToExpiry <= 7 ? "critical" : "high",
            title: `📋 Certificado vence em ${daysToExpiry} dias`,
            message: `${payload.certificate_type} - ${payload.certificate_number || ""}`,
            source_module: "compliance",
            source_reference_id: event.source_record_id,
          });
          actions.push("cert_expiring_alert");
        }
      }
      break;
    }

    // ── MAINTENANCE UPDATED ──
    case "maintenance_updated": {
      const status = payload.status as string;
      const priority = payload.priority as string;
      const dueDate = payload.due_date as string | undefined;

      // Check if overdue
      if (status === "pending" && dueDate && new Date(dueDate) < new Date()) {
        await sb.from("soc_alerts").insert({
          vessel_id: event.vessel_id,
          organization_id: event.organization_id,
          alert_type: "maintenance_overdue",
          severity: priority === "critical" ? "critical" : "high",
          title: `🔧 Manutenção vencida: ${payload.title || payload.component_name}`,
          message: `Task venceu em ${dueDate}. Prioridade: ${priority}`,
          source_module: "maintenance",
          source_reference_id: event.source_record_id,
        });
        actions.push("maintenance_overdue_alert");
      }
      break;
    }

    // ── CREW STATUS CHANGED ──
    case "crew_status_changed": {
      const newStatus = payload.status as string;
      if (newStatus === "on_board") {
        actions.push("crew_signed_on");
        // Could trigger: work/rest log init, salary accrual, muster list update
      } else if (newStatus === "on_leave" || newStatus === "off_board") {
        actions.push("crew_signed_off");
      }
      break;
    }

    // ── INCIDENT CREATED ──
    case "incident_created": {
      const severity = payload.severity as string;
      if (severity === "critical" || severity === "high") {
        // Auto-create non-conformity for investigation
        await sb.from("non_conformities").insert({
          title: `Investigação: ${payload.title || "Incidente reportado"}`,
          description: payload.message || payload.description || "Auto-gerado pelo sistema de eventos",
          vessel_id: event.vessel_id,
          organization_id: event.organization_id,
          status: "open",
          severity: severity,
          source: "system_events",
          detected_date: new Date().toISOString(),
        });
        actions.push("auto_nc_created");
      }
      break;
    }

    // ── NON-CONFORMITY CREATED ──
    case "nc_created": {
      actions.push("nc_logged");
      break;
    }

    // ── EXPENSE CREATED ──
    case "expense_created": {
      actions.push("expense_logged");
      break;
    }

    // ── COMPLIANCE UPDATED ──
    case "compliance_updated": {
      actions.push("compliance_recalculated");
      break;
    }

    default:
      actions.push(`unhandled_event_${event.event_type}`);
  }

  return { actions, processed_at: new Date().toISOString() };
}
