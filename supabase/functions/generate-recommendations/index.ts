import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecommendationRequest {
  userId: string;
  context: 'dashboard' | 'hr' | 'travel' | 'finance' | 'general';
  userBehavior?: any;
  preferences?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, context, userBehavior, preferences }: RecommendationRequest = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Generating personalized recommendations for user ${userId} in context ${context}`);

    // Collect user data for personalization
    const userData = await collectUserData(supabase, userId, context);

    // Generate personalized recommendations using AI
    const systemPrompt = `Você é um especialista em personalização e recomendações inteligentes para sistemas corporativos.

Baseado nos dados do usuário, histórico de comportamento e contexto atual, gere recomendações personalizadas e acionáveis.

Retorne uma resposta em JSON com a seguinte estrutura:
{
  "recommendations": [
    {
      "id": "unique_id",
      "title": "Título da Recomendação",
      "description": "Descrição detalhada",
      "category": "categoria",
      "priority": "high/medium/low",
      "actionType": "navigate/configure/learn/optimize",
      "actionData": {
        "module": "módulo_específico",
        "action": "ação_específica"
      },
      "benefits": ["benefício1", "benefício2"],
      "estimatedImpact": "Alto/Médio/Baixo",
      "timeToImplement": "1 dia/1 semana/1 mês"
    }
  ],
  "insights": [
    "insight personalizado 1",
    "insight personalizado 2"
  ],
  "quickActions": [
    {
      "title": "Ação Rápida",
      "action": "ação_específica",
      "icon": "nome_do_ícone"
    }
  ]
}

Diretrizes:
- Use português brasileiro
- Seja específico e acionável
- Considere o contexto e histórico do usuário
- Priorize impacto vs esforço
- Forneça benefícios claros`;

    const userPrompt = `Gere recomendações personalizadas para o usuário:

**Contexto:** ${context}
**ID do Usuário:** ${userId}

**Dados do Usuário:**
${JSON.stringify(userData, null, 2)}

**Comportamento/Preferências:**
${JSON.stringify({ userBehavior, preferences }, null, 2)}

Gere recomendações inteligentes e personalizadas baseadas nesses dados.`;

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
        temperature: 0.4,
        max_tokens: 3000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let recommendations;
    
    try {
      recommendations = JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI recommendations');
    }

    // Save recommendations to database for tracking
    try {
      const { error: saveError } = await supabase
        .from('user_recommendations')
        .insert({
          user_id: userId,
          context,
          recommendations: recommendations.recommendations,
          insights: recommendations.insights,
          quick_actions: recommendations.quickActions,
          generated_at: new Date().toISOString()
        });

      if (saveError) {
        console.error('Error saving recommendations:', saveError);
      }
    } catch (saveError) {
      console.log('Recommendations table not available, skipping save');
    }

    console.log('Personalized recommendations generated successfully');

    return new Response(JSON.stringify({ 
      success: true,
      recommendations: recommendations.recommendations,
      insights: recommendations.insights,
      quickActions: recommendations.quickActions,
      generatedAt: new Date().toISOString(),
      context
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function collectUserData(supabase: any, userId: string, context: string) {
  const data: any = {
    userId,
    context,
    collectedAt: new Date().toISOString()
  };

  try {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      data.profile = profile;
    }

    // Get user role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userRole) {
      data.role = userRole;
    }

    // Get user statistics
    const { data: userStats } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userStats) {
      data.statistics = userStats;
    }

    // Get user's price alerts (behavior data)
    const { data: priceAlerts } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (priceAlerts) {
      data.priceAlerts = priceAlerts;
      data.alertPatterns = analyzeAlertPatterns(priceAlerts);
    }

    // Get notification settings (preferences)
    const { data: notificationSettings } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (notificationSettings) {
      data.notificationPreferences = notificationSettings;
    }

    // Context-specific data
    if (context === 'hr') {
      const { data: certificates } = await supabase
        .from('employee_certificates')
        .select('*')
        .eq('employee_id', profile?.employee_id || profile?.email);

      if (certificates) {
        data.certificates = certificates;
        data.certificateStatus = analyzeCertificateStatus(certificates);
      }
    }

    // Get recent AI reports
    const { data: recentReports } = await supabase
      .from('ai_reports')
      .select('type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentReports) {
      data.recentReports = recentReports;
    }

  } catch (error) {
    console.error('Error collecting user data:', error);
    // Return basic mock data for recommendations
    data.mock = true;
    data.basicProfile = {
      department: 'General',
      role: 'employee',
      activityLevel: 'medium'
    };
  }

  return data;
}

function analyzeAlertPatterns(alerts: any[]) {
  if (!alerts || alerts.length === 0) return null;

  const categories = alerts.reduce((acc: any, alert) => {
    acc[alert.category || 'other'] = (acc[alert.category || 'other'] || 0) + 1;
    return acc;
  }, {});

  const avgTargetPrice = alerts.reduce((sum, alert) => sum + (alert.target_price || 0), 0) / alerts.length;
  
  return {
    totalAlerts: alerts.length,
    activeAlerts: alerts.filter(a => a.is_active).length,
    topCategories: Object.entries(categories)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3),
    averageTargetPrice: avgTargetPrice,
    frequency: alerts.length > 5 ? 'high' : alerts.length > 2 ? 'medium' : 'low'
  };
}

function analyzeCertificateStatus(certificates: any[]) {
  if (!certificates || certificates.length === 0) return null;

  const now = new Date();
  const expiring = certificates.filter(cert => {
    const expiryDate = new Date(cert.expiry_date);
    const daysDiff = (expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return daysDiff <= 30 && daysDiff > 0;
  });

  const expired = certificates.filter(cert => new Date(cert.expiry_date) < now);

  return {
    total: certificates.length,
    expiring: expiring.length,
    expired: expired.length,
    needsAttention: expiring.length + expired.length > 0
  };
}