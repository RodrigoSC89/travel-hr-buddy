import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCORS, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { log } from "../_shared/logger.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCORS();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { organization_id } = await req.json();

    if (!organization_id) {
      return errorResponse('Organization ID is required', 400);
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Get alerts count
    const { count: alertsCount } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization_id)
      .gte('created_at', yesterdayStr);

    // Get active voyages
    const { data: activeVoyages } = await supabase
      .from('voyages')
      .select('id, vessel_id, origin_port, destination_port')
      .eq('organization_id', organization_id)
      .eq('status', 'in_progress');

    // Get upcoming maintenance
    const { data: upcomingMaintenance } = await supabase
      .from('maintenance_tasks')
      .select('id, title, due_date, priority')
      .eq('organization_id', organization_id)
      .eq('status', 'pending')
      .lte('due_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('due_date', { ascending: true })
      .limit(5);

    // Get compliance deadlines
    const { data: complianceDeadlines } = await supabase
      .from('compliance_deadlines')
      .select('id, description, deadline')
      .eq('organization_id', organization_id)
      .lte('deadline', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('deadline', { ascending: true })
      .limit(5);

    const summary = {
      date: new Date().toISOString().split('T')[0],
      organization_id,
      metrics: {
        alerts_last_24h: alertsCount || 0,
        active_voyages: activeVoyages?.length || 0,
        upcoming_maintenance_items: upcomingMaintenance?.length || 0,
        compliance_deadlines_30_days: complianceDeadlines?.length || 0
      },
      active_voyages: activeVoyages || [],
      upcoming_maintenance: upcomingMaintenance || [],
      compliance_deadlines: complianceDeadlines || []
    };

    // Get subscribers for daily summary
    const { data: subscribers } = await supabase
      .from('notification_preferences')
      .select('user_id, email')
      .eq('organization_id', organization_id)
      .eq('daily_summary', true);

    // Queue email notifications
    if (subscribers && subscribers.length > 0) {
      for (const sub of subscribers) {
        await supabase.from('notification_queue').insert({
          user_id: sub.user_id,
          type: 'daily_summary',
          content: summary,
          status: 'pending',
          created_at: new Date().toISOString()
        });
      }
    }

    log('info', 'send-daily-summary', 'Daily summary generated', { 
      organizationId: organization_id,
      subscribersCount: subscribers?.length || 0 
    });

    return jsonResponse({ success: true, data: summary });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'send-daily-summary', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
