import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCORS, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";
import { log } from "../_shared/logger.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCORS();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { user, error: authError } = await getAuthenticatedUser(supabase);
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    const { 
      organization_id, 
      vessel_id, 
      alert_type, 
      title, 
      description, 
      severity, 
      source_module,
      source_id,
      metadata,
      auto_notify
    } = await req.json();

    if (!organization_id || !alert_type || !title || !severity) {
      return errorResponse('Organization ID, alert type, title and severity are required', 400);
    }

    const { data, error } = await supabase
      .from('alerts')
      .insert({
        organization_id,
        vessel_id,
        alert_type,
        title,
        description,
        severity,
        source_module,
        source_id,
        metadata,
        status: 'active',
        created_by: user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      log('error', 'create-alert', 'Failed to create alert', { error: error.message });
      return errorResponse('Failed to create alert', 500);
    }

    // Auto-notify if requested
    if (auto_notify) {
      // Get alert subscribers
      const { data: subscribers } = await supabase
        .from('alert_subscriptions')
        .select('user_id, notification_methods')
        .eq('organization_id', organization_id)
        .contains('alert_types', [alert_type]);

      if (subscribers && subscribers.length > 0) {
        // Queue notifications with proper error handling
        const notificationPromises = subscribers.map(async (sub: { user_id: string; notification_methods: string[] }) => {
          const { error: queueError } = await supabase.from('notification_queue').insert({
            alert_id: data.id,
            user_id: sub.user_id,
            notification_methods: sub.notification_methods,
            status: 'pending',
            created_at: new Date().toISOString()
          });
          
          if (queueError) {
            log('warn', 'create-alert', 'Failed to queue notification', { 
              userId: sub.user_id, 
              error: queueError.message 
            });
          }
          return !queueError;
        });
        
        const results = await Promise.allSettled(notificationPromises);
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
        log('info', 'create-alert', `Queued ${successCount}/${subscribers.length} notifications`);
      }
    }

    log('info', 'create-alert', 'Alert created successfully', { alertId: data.id, type: alert_type, severity });
    return jsonResponse({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'create-alert', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
