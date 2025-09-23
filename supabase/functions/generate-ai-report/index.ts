import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportRequest {
  type: 'hr' | 'financial' | 'operational' | 'analytics' | 'custom';
  dateRange: { start: string; end: string };
  modules?: string[];
  format: 'detailed' | 'summary' | 'executive';
  customPrompt?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, dateRange, modules = [], format, customPrompt }: ReportRequest = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Generating ${type} report for ${dateRange.start} to ${dateRange.end}`);

    // Collect data based on report type
    let reportData: any = {};
    
    if (type === 'hr' || modules.includes('hr')) {
      // Get HR data - certificates, employee data
      const { data: certificates } = await supabase
        .from('certificates')
        .select('*')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      reportData.hr = {
        totalEmployees: profiles?.length || 0,
        certificates: certificates || [],
        expiringCertificates: certificates?.filter(cert => 
          new Date(cert.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        ) || []
      };
    }

    if (type === 'analytics' || modules.includes('analytics')) {
      // Get user statistics
      const { data: userStats } = await supabase
        .from('user_statistics')
        .select('*');

      const { data: priceAlerts } = await supabase
        .from('price_alerts')
        .select('*')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);

      reportData.analytics = {
        userStatistics: userStats || [],
        priceAlerts: priceAlerts || [],
        totalAlerts: priceAlerts?.length || 0,
        activeAlerts: priceAlerts?.filter(alert => alert.is_active)?.length || 0
      };
    }

    if (type === 'operational' || modules.includes('operational')) {
      // Get system usage data (mock data for demonstration)
      reportData.operational = {
        systemUptime: '99.9%',
        totalUsers: reportData.hr?.totalEmployees || 0,
        activeUsers: Math.floor((reportData.hr?.totalEmployees || 0) * 0.8),
        averageResponseTime: '120ms',
        totalRequests: 15420,
        errorRate: '0.1%'
      };
    }

    // Generate AI report based on collected data
    const systemPrompt = getSystemPrompt(type, format);
    const userPrompt = generateUserPrompt(reportData, type, dateRange, customPrompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedReport = data.choices[0].message.content;

    // Save report to database
    const { data: savedReport, error: saveError } = await supabase
      .from('ai_reports')
      .insert({
        type,
        title: `Relatório ${type.toUpperCase()} - ${new Date().toLocaleDateString('pt-BR')}`,
        content: generatedReport,
        format,
        date_range_start: dateRange.start,
        date_range_end: dateRange.end,
        modules,
        raw_data: reportData,
        generated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving report:', saveError);
    }

    console.log('Report generated successfully');

    return new Response(JSON.stringify({ 
      success: true,
      report: {
        id: savedReport?.id,
        content: generatedReport,
        type,
        format,
        generatedAt: new Date().toISOString(),
        dataPoints: Object.keys(reportData).length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getSystemPrompt(type: string, format: string): string {
  const basePrompt = `Você é um especialista em análise de dados corporativos e geração de relatórios. Sua tarefa é criar um relatório ${format} sobre ${type}.`;
  
  const formatGuidelines = {
    'detailed': 'Forneça uma análise detalhada e completa com gráficos sugeridos, insights profundos e recomendações específicas.',
    'summary': 'Crie um resumo executivo conciso com os pontos principais e métricas chave.',
    'executive': 'Foque em insights estratégicos de alto nível adequados para executivos e tomadores de decisão.'
  };

  const typeSpecific = {
    'hr': 'Analise dados de recursos humanos, certificações, treinamentos e performance de equipe.',
    'financial': 'Foque em métricas financeiras, custos, ROI e indicadores econômicos.',
    'operational': 'Analise eficiência operacional, performance de sistemas e métricas de produtividade.',
    'analytics': 'Foque em análise de dados, padrões de uso e insights comportamentais.',
    'custom': 'Adapte a análise conforme solicitado pelo usuário.'
  };

  return `${basePrompt}

${formatGuidelines[format as keyof typeof formatGuidelines]}

${typeSpecific[type as keyof typeof typeSpecific]}

Diretrizes:
- Use português brasileiro
- Inclua métricas específicas quando disponíveis
- Forneça insights acionáveis
- Sugira próximos passos quando relevante
- Use formatação Markdown para melhor legibilidade
- Inclua seções como: Resumo Executivo, Principais Métricas, Análise, Recomendações`;
}

function generateUserPrompt(data: any, type: string, dateRange: any, customPrompt?: string): string {
  const dataString = JSON.stringify(data, null, 2);
  
  return `Gere um relatório baseado nos seguintes dados:

**Período:** ${dateRange.start} a ${dateRange.end}
**Tipo:** ${type}

**Dados coletados:**
${dataString}

${customPrompt ? `**Instruções específicas:** ${customPrompt}` : ''}

Por favor, analise estes dados e gere um relatório profissional e insights relevantes.`;
}