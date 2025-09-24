import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  userId?: string;
  type: 'smart_alert' | 'system_insight' | 'recommendation_update' | 'performance_summary';
  priority: 'low' | 'medium' | 'high' | 'critical';
  context?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, type, priority, context }: NotificationRequest = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Generating intelligent notification: ${type} for user ${userId}`);

    // Collect context data for notification
    const notificationContext = await collectNotificationContext(supabase, userId, type, context);

    // Generate intelligent notification content
    const systemPrompt = `Você é um especialista em comunicação corporativa e notificações inteligentes.

Baseado no tipo de notificação e contexto, gere conteúdo de notificação personalizado e acionável.

Retorne uma resposta em JSON com a seguinte estrutura:
{
  "notification": {
    "title": "Título claro e conciso",
    "message": "Mensagem principal da notificação",
    "actionText": "Texto do botão de ação",
    "actionType": "navigate/configure/dismiss/learn",
    "actionData": {
      "module": "módulo_específico",
      "action": "ação_específica"
    },
    "importance": "high/medium/low",
    "category": "categoria_da_notificação",
    "estimatedReadTime": "30s/1min/2min",
    "personalizedElements": [
      "elemento personalizado 1",
      "elemento personalizado 2"
    ]
  },
  "metadata": {
    "shouldSendEmail": boolean,
    "shouldSendPush": boolean,
    "expiresIn": "24h/7d/30d",
    "relatedModules": ["módulo1", "módulo2"]
  }
}

Diretrizes:
- Use português brasileiro
- Seja conciso mas informativo
- Inclua elementos personalizados baseados no contexto
- Sugira ações claras e específicas
- Considere a urgência e relevância`;

    const userPrompt = `Gere uma notificação inteligente:

**Tipo:** ${type}
**Prioridade:** ${priority}
**Usuário:** ${userId || 'Sistema'}

**Contexto:**
${JSON.stringify(notificationContext, null, 2)}

Crie uma notificação personalizada e acionável baseada nestes dados.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let notificationData;
    
    try {
      notificationData = JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI notification');
    }

    // Save notification to database
    const notificationRecord = {
      user_id: userId,
      type,
      priority,
      title: notificationData.notification.title,
      message: notificationData.notification.message,
      action_text: notificationData.notification.actionText,
      action_type: notificationData.notification.actionType,
      action_data: notificationData.notification.actionData,
      metadata: notificationData.metadata,
      is_read: false,
      created_at: new Date().toISOString()
    };

    try {
      const { data: savedNotification, error: saveError } = await supabase
        .from('intelligent_notifications')
        .insert(notificationRecord)
        .select()
        .single();

      if (saveError) {
        console.error('Error saving notification:', saveError);
      } else {
        console.log('Notification saved:', savedNotification.id);
      }
    } catch (saveError) {
      console.log('Notifications table not available, skipping save');
    }

    // Send push notification if configured
    if (notificationData.metadata.shouldSendPush && userId) {
      await sendPushNotification(supabase, userId, notificationData.notification);
    }

    // Send email if configured
    if (notificationData.metadata.shouldSendEmail && userId) {
      await sendEmailNotification(supabase, userId, notificationData.notification);
    }

    console.log('Intelligent notification generated successfully');

    return new Response(JSON.stringify({ 
      success: true,
      notification: notificationData.notification,
      metadata: notificationData.metadata,
      generatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating intelligent notification:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function collectNotificationContext(supabase: any, userId: string | undefined, type: string, context: any) {
  const data: any = {
    type,
    userId,
    context,
    timestamp: new Date().toISOString()
  };

  if (!userId) {
    data.systemNotification = true;
    return data;
  }

  try {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      data.userProfile = {
        department: profile.department,
        position: profile.position,
        name: profile.full_name
      };
    }

    // Get recent activity based on notification type
    if (type === 'smart_alert') {
      const { data: recentAlerts } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(3);

      data.recentAlerts = recentAlerts;
    }

    if (type === 'system_insight') {
      const { data: userStats } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', userId)
        .single();

      data.userStatistics = userStats;
    }

    if (type === 'recommendation_update') {
      // Get recent recommendations or actions
      data.lastActivity = await getLastUserActivity(supabase, userId);
    }

    if (type === 'performance_summary') {
      // Get performance data
      data.performanceData = await getPerformanceData(supabase, userId);
    }

  } catch (error) {
    console.error('Error collecting notification context:', error);
    data.error = 'Could not collect full context';
  }

  return data;
}

async function getLastUserActivity(supabase: any, userId: string) {
  try {
    const { data: recentReports } = await supabase
      .from('ai_reports')
      .select('type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    return recentReports?.[0] || null;
  } catch {
    return null;
  }
}

async function getPerformanceData(supabase: any, userId: string) {
  try {
    const { data: alerts } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('user_id', userId);

    const activeAlerts = alerts?.filter((a: any) => a.is_active).length || 0;
    const totalAlerts = alerts?.length || 0;

    return {
      totalAlerts,
      activeAlerts,
      alertsEfficiency: totalAlerts > 0 ? (activeAlerts / totalAlerts * 100).toFixed(1) : 0
    };
  } catch {
    return null;
  }
}

async function sendPushNotification(supabase: any, userId: string, notification: any) {
  // Implementation for push notifications
  // This would integrate with a push notification service
  console.log('Sending push notification to user:', userId);
}

async function sendEmailNotification(supabase: any, userId: string, notification: any) {
  // Implementation for email notifications
  // This would integrate with an email service
  console.log('Sending email notification to user:', userId);
}