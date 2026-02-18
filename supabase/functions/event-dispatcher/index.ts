import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OutboxEvent {
  id: string;
  event_type: string;
  payload: Record<string, unknown>;
  source_entity_type?: string;
  source_entity_id?: string;
  organization_id?: string;
  status: string;
  retries: number;
  created_at: string;
}

interface Subscription {
  consumer_name: string;
  event_type: string;
  handler_config?: Record<string, unknown>;
}

// Consumer handlers — each maps an event to side-effects
// deno-lint-ignore no-explicit-any
const CONSUMER_HANDLERS: Record<string, (event: OutboxEvent, supabase: any) => Promise<void>> = {
  // When a voyage completes, update vessel status
  "FleetService:voyage.completed": async (event, supabase) => {
    const vesselId = event.payload.vessel_id as string;
    if (vesselId) {
      await supabase.from("vessels").update({ operational_status: "available" }).eq("id", vesselId);
    }
  },

  // When a work order is created, log integration health
  "IntegrationHealth:maintenance.work_order.created": async (event, supabase) => {
    await supabase.from("integration_health").upsert({
      service_name: "maintenance",
      status: "healthy",
      last_check_at: new Date().toISOString(),
      metadata: { last_event: event.event_type, event_id: event.id },
    }, { onConflict: "service_name" });
  },

  // When connectivity degrades, update integration health
  "IntegrationHealth:tracking.connectivity.degraded": async (event, supabase) => {
    await supabase.from("integration_health").upsert({
      service_name: `satcom_${event.payload.provider}`,
      status: "degraded",
      last_check_at: new Date().toISOString(),
      error_count: 1,
      metadata: { signal_quality: event.payload.signal_quality, vessel_id: event.payload.vessel_id },
    }, { onConflict: "service_name" });
  },

  // When a certificate is expiring, create an alert
  "AlertService:compliance.certificate.expiring": async (event, supabase) => {
    await supabase.from("soc_alerts").insert({
      alert_type: "certificate_expiring",
      severity: (event.payload.days_remaining as number) <= 7 ? "critical" : "warning",
      vessel_id: event.payload.vessel_id,
      description: `Certificate expires in ${event.payload.days_remaining} days`,
      status: "open",
    });
  },

  // When a finding is created, create a risk item
  "RiskService:compliance.finding.created": async (event, supabase) => {
    await supabase.from("risk_assessments").insert({
      title: `Risk from finding: ${event.payload.finding_id}`,
      severity: event.payload.severity || "medium",
      status: "open",
      vessel_id: event.payload.vessel_id,
      metadata: { source_finding_id: event.payload.finding_id, source_audit_id: event.payload.audit_id },
    });
  },

  // AI decision logged — update integration health
  "AuditTrail:ai.decision.logged": async (event, supabase) => {
    await supabase.from("audit_events").insert({
      entity_type: "ai_decision",
      entity_id: event.payload.decision_id as string,
      action: "ai_decision_logged",
      metadata_json: { confidence: event.payload.confidence, action_type: event.payload.action_type },
    });
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // 1. Fetch pending events (batch of 50)
    const { data: pendingEvents, error: fetchError } = await supabase
      .from("event_outbox")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(50);

    if (fetchError) {
      throw new Error(`Failed to fetch events: ${fetchError.message}`);
    }

    if (!pendingEvents || pendingEvents.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, message: "No pending events" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Fetch active subscriptions
    const { data: subscriptions } = await supabase
      .from("event_subscriptions")
      .select("*")
      .eq("enabled", true);

    const subMap = new Map<string, Subscription[]>();
    for (const sub of subscriptions || []) {
      const existing = subMap.get(sub.event_type) || [];
      existing.push(sub);
      subMap.set(sub.event_type, existing);
    }

    // 3. Process each event
    let processed = 0;
    let failed = 0;
    const results: Array<{ event_id: string; status: string; consumers: number }> = [];

    for (const event of pendingEvents as OutboxEvent[]) {
      const consumers = subMap.get(event.event_type) || [];
      let eventFailed = false;

      for (const consumer of consumers) {
        const handlerKey = `${consumer.consumer_name}:${event.event_type}`;
        const handler = CONSUMER_HANDLERS[handlerKey];

        if (handler) {
          try {
            await handler(event, supabase);
          } catch (handlerError) {
            console.error(`Handler ${handlerKey} failed:`, handlerError);
            eventFailed = true;
          }
        }
      }

      // 4. Update event status
      if (eventFailed) {
        const newRetries = (event.retries || 0) + 1;
        const newStatus = newRetries >= 3 ? "failed" : "pending";
        await supabase
          .from("event_outbox")
          .update({ status: newStatus, retries: newRetries })
          .eq("id", event.id);
        failed++;
      } else {
        await supabase
          .from("event_outbox")
          .update({ status: "processed", processed_at: new Date().toISOString() })
          .eq("id", event.id);
        processed++;
      }

      results.push({
        event_id: event.id,
        status: eventFailed ? "failed" : "processed",
        consumers: consumers.length,
      });
    }

    // 5. Update integration health for the dispatcher itself
    await supabase.from("integration_health").upsert({
      service_name: "event_dispatcher",
      status: failed > 0 ? "degraded" : "healthy",
      last_check_at: new Date().toISOString(),
      metadata: { processed, failed, total: pendingEvents.length },
    }, { onConflict: "service_name" });

    return new Response(
      JSON.stringify({ processed, failed, total: pendingEvents.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Event dispatcher error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
