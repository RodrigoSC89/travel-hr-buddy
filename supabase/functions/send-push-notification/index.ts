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
      user_ids, 
      title, 
      body, 
      data,
      priority = 'normal'
    } = await req.json();

    if (!user_ids || !title || !body) {
      return errorResponse('User IDs, title, and body are required', 400);
    }

    // Get push tokens for users
    const { data: tokens } = await supabase
      .from('push_notification_tokens')
      .select('user_id, token, platform')
      .in('user_id', user_ids);

    if (!tokens || tokens.length === 0) {
      return jsonResponse({ 
        success: true, 
        message: 'No push tokens found for specified users',
        sent: 0 
      });
    }

    const fcmKey = Deno.env.get('FIREBASE_SERVER_KEY');
    const results = [];

    for (const tokenData of tokens) {
      try {
        // Send via Firebase Cloud Messaging
        if (fcmKey) {
          const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
              'Authorization': `key=${fcmKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: tokenData.token,
              notification: {
                title,
                body,
                sound: 'default',
              },
              data: {
                ...data,
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
              },
              priority: priority === 'high' ? 'high' : 'normal',
            }),
          });

          const fcmResult = await fcmResponse.json();
          results.push({
            user_id: tokenData.user_id,
            success: fcmResult.success === 1,
            message_id: fcmResult.results?.[0]?.message_id
          });
        }
      } catch (error) {
        results.push({
          user_id: tokenData.user_id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Log notifications
    for (const result of results) {
      await supabase.from('notifications').insert({
        user_id: result.user_id,
        title,
        body,
        type: 'push',
        status: result.success ? 'sent' : 'failed',
        metadata: { priority, data },
        created_at: new Date().toISOString()
      });
    }

    const successCount = results.filter(r => r.success).length;
    log('info', 'send-push-notification', 'Push notifications sent', { 
      total: results.length,
      success: successCount 
    });

    return jsonResponse({
      success: true,
      sent: successCount,
      failed: results.length - successCount,
      results
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'send-push-notification', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
