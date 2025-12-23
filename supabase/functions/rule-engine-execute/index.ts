/**
 * PATCH 1002 - Rule Engine Execute
 * Edge function to execute automation rules
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RuleCondition {
  field: string;
  operator: "equals" | "contains" | "greater_than" | "less_than" | "not_equals";
  value: string | number;
}

interface RuleAction {
  type: "notification" | "email" | "webhook" | "create_task" | "update_status";
  config: Record<string, unknown>;
}

interface Rule {
  id: string;
  rule_name: string;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  conditions: RuleCondition[];
  actions: RuleAction[];
  is_active: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { ruleId, eventData } = await req.json();

    if (!ruleId) {
      return new Response(
        JSON.stringify({ error: "Rule ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the rule
    const { data: rule, error: ruleError } = await supabase
      .from("automation_rules")
      .select("*")
      .eq("id", ruleId)
      .single();

    if (ruleError || !rule) {
      return new Response(
        JSON.stringify({ error: "Rule not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const typedRule = rule as unknown as Rule;

    if (!typedRule.is_active) {
      return new Response(
        JSON.stringify({ error: "Rule is not active" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Evaluate conditions
    const conditionsMet = evaluateConditions(typedRule.conditions || [], eventData || {});

    if (!conditionsMet) {
      console.log(`[RuleEngine] Conditions not met for rule ${ruleId}`);
      return new Response(
        JSON.stringify({ success: false, message: "Conditions not met" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Execute actions
    const actionResults = await executeActions(typedRule.actions || [], supabase, eventData);

    // Log execution
    await supabase.from("automation_logs").insert({
      rule_id: ruleId,
      status: actionResults.every(r => r.success) ? "success" : "partial_failure",
      trigger_data: eventData,
      actions_executed: actionResults,
      executed_at: new Date().toISOString(),
    });

    // Update rule execution count
    await supabase
      .from("automation_rules")
      .update({
        execution_count: (typedRule as unknown as { execution_count: number }).execution_count + 1,
        last_executed_at: new Date().toISOString(),
      })
      .eq("id", ruleId);

    console.log(`[RuleEngine] Rule ${ruleId} executed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        rule: typedRule.rule_name,
        actionsExecuted: actionResults.length,
        results: actionResults,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[RuleEngine] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function evaluateConditions(conditions: RuleCondition[], eventData: Record<string, unknown>): boolean {
  if (!conditions || conditions.length === 0) return true;

  return conditions.every((condition) => {
    const fieldValue = eventData[condition.field];
    const targetValue = condition.value;

    switch (condition.operator) {
      case "equals":
        return fieldValue === targetValue;
      case "not_equals":
        return fieldValue !== targetValue;
      case "contains":
        return String(fieldValue).includes(String(targetValue));
      case "greater_than":
        return Number(fieldValue) > Number(targetValue);
      case "less_than":
        return Number(fieldValue) < Number(targetValue);
      default:
        return false;
    }
  });
}

async function executeActions(
  actions: RuleAction[],
  supabase: ReturnType<typeof createClient>,
  eventData: Record<string, unknown>
): Promise<Array<{ type: string; success: boolean; result?: unknown; error?: string }>> {
  const results = [];

  for (const action of actions) {
    try {
      let result: unknown = null;

      switch (action.type) {
        case "notification":
          // Insert notification
          const { error: notifError } = await supabase.from("notifications").insert({
            title: action.config.title || "Automated Notification",
            message: action.config.message || JSON.stringify(eventData),
            type: "automation",
            priority: action.config.priority || "medium",
            created_at: new Date().toISOString(),
          });
          if (notifError) throw notifError;
          result = { type: "notification", sent: true };
          break;

        case "email":
          // Queue email (would integrate with email service)
          console.log("[RuleEngine] Email action:", action.config);
          result = { type: "email", queued: true, to: action.config.to };
          break;

        case "webhook":
          // Call external webhook
          const webhookUrl = action.config.url as string;
          if (webhookUrl) {
            const webhookResponse = await fetch(webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ eventData, config: action.config }),
            });
            result = { type: "webhook", status: webhookResponse.status };
          }
          break;

        case "create_task":
          // Create a task
          const { error: taskError } = await supabase.from("tasks").insert({
            title: action.config.title || "Automated Task",
            description: action.config.description || JSON.stringify(eventData),
            status: "pending",
            priority: action.config.priority || "medium",
            created_at: new Date().toISOString(),
          });
          if (taskError) throw taskError;
          result = { type: "task", created: true };
          break;

        case "update_status":
          // Update a record status
          const { error: updateError } = await supabase
            .from(action.config.table as string)
            .update({ status: action.config.new_status })
            .eq("id", action.config.record_id);
          if (updateError) throw updateError;
          result = { type: "status_update", success: true };
          break;
      }

      results.push({ type: action.type, success: true, result });
    } catch (error) {
      console.error(`[RuleEngine] Action ${action.type} failed:`, error);
      results.push({
        type: action.type,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}
