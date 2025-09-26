import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { 
      checklistId,
      documents = [], // Array de documentos ou texto
      analysisType = 'compliance'
    } = await req.json();

    console.log('Iniciando análise de IA para checklist:', checklistId);

    // Buscar dados do checklist
    const { data: checklist, error: checklistError } = await supabase
      .from('operational_checklists')
      .select(`
        *,
        checklist_items (*)
      `)
      .eq('id', checklistId)
      .single();

    if (checklistError) {
      throw new Error(`Erro ao buscar checklist: ${checklistError.message}`);
    }

    // Preparar dados para análise
    const analysisData = {
      checklist: {
        title: checklist.title,
        type: checklist.type,
        status: checklist.status,
        items: checklist.checklist_items || []
      },
      documents,
      totalItems: checklist.checklist_items?.length || 0,
      completedItems: checklist.checklist_items?.filter((item: any) => item.completed).length || 0
    };

    // Criar prompt baseado no tipo de análise
    let systemPrompt = '';
    let userPrompt = '';

    switch (analysisType) {
      case 'compliance':
        systemPrompt = `Você é um especialista em conformidade operacional marítima. Analise o checklist fornecido e identifique:
        1. Score geral de conformidade (0-100)
        2. Problemas encontrados
        3. Itens críticos não conformes
        4. Recomendações específicas
        5. Campos obrigatórios não preenchidos
        6. Inconsistências nos dados

        Responda APENAS com um JSON válido no formato:
        {
          "overall_score": number,
          "issues_found": number,
          "critical_issues": number,
          "recommendations": string[],
          "missing_fields": string[],
          "inconsistencies": string[],
          "confidence_level": number,
          "analysis_summary": string
        }`;
        break;

      case 'quality':
        systemPrompt = `Você é um especialista em qualidade operacional. Analise a qualidade do preenchimento do checklist e forneça:
        1. Score de qualidade (0-100)
        2. Problemas de qualidade identificados
        3. Sugestões de melhoria
        4. Campos com informações insuficientes

        Responda APENAS com um JSON válido no formato especificado.`;
        break;

      case 'risk':
        systemPrompt = `Você é um especialista em análise de risco operacional marítimo. Identifique:
        1. Riscos potenciais baseados no checklist
        2. Score de risco (0-100, onde 100 é muito alto risco)
        3. Itens críticos para segurança
        4. Recomendações de mitigação

        Responda APENAS com um JSON válido no formato especificado.`;
        break;

      default:
        systemPrompt = `Você é um especialista em análise operacional marítima. Faça uma análise geral do checklist.
        Responda APENAS com um JSON válido no formato especificado.`;
    }

    userPrompt = `Analise o seguinte checklist operacional:

    Tipo: ${checklist.type}
    Status: ${checklist.status}
    Total de itens: ${analysisData.totalItems}
    Itens completos: ${analysisData.completedItems}

    Itens do checklist:
    ${JSON.stringify(checklist.checklist_items, null, 2)}

    ${documents.length > 0 ? `Documentos anexos:\n${JSON.stringify(documents, null, 2)}` : ''}

    Faça uma análise detalhada e forneça insights acionáveis.`;

    // Chamar OpenAI para análise
    console.log('Chamando OpenAI para análise...');
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    const aiResponse = openAIData.choices[0].message.content;

    console.log('Resposta da IA recebida:', aiResponse);

    // Tentar parsear a resposta JSON
    let analysisResult;
    try {
      analysisResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Erro ao parsear resposta da IA:', parseError);
      // Fallback: criar resultado básico
      analysisResult = {
        overall_score: Math.max(0, Math.min(100, (analysisData.completedItems / analysisData.totalItems) * 100)),
        issues_found: Math.max(0, analysisData.totalItems - analysisData.completedItems),
        critical_issues: 0,
        recommendations: ['Revisar itens não preenchidos', 'Validar informações críticas'],
        missing_fields: [],
        inconsistencies: [],
        confidence_level: 0.5,
        analysis_summary: 'Análise automatizada básica realizada'
      };
    }

    // Garantir que todos os campos obrigatórios estejam presentes
    const finalResult = {
      overall_score: Math.max(0, Math.min(100, analysisResult.overall_score || 0)),
      issues_found: analysisResult.issues_found || 0,
      critical_issues: analysisResult.critical_issues || 0,
      recommendations: Array.isArray(analysisResult.recommendations) ? analysisResult.recommendations : [],
      missing_fields: Array.isArray(analysisResult.missing_fields) ? analysisResult.missing_fields : [],
      inconsistencies: Array.isArray(analysisResult.inconsistencies) ? analysisResult.inconsistencies : [],
      confidence_level: Math.max(0, Math.min(1, analysisResult.confidence_level || 0.7)),
      analysis_data: {
        analysis_type: analysisType,
        processed_items: analysisData.totalItems,
        completion_rate: analysisData.totalItems > 0 ? (analysisData.completedItems / analysisData.totalItems) : 0,
        raw_response: aiResponse
      }
    };

    // Salvar análise no banco
    const { data: analysisRecord, error: insertError } = await supabase
      .from('checklist_ai_analysis')
      .insert({
        checklist_id: checklistId,
        analysis_type: analysisType,
        overall_score: finalResult.overall_score,
        issues_found: finalResult.issues_found,
        critical_issues: finalResult.critical_issues,
        recommendations: finalResult.recommendations,
        missing_fields: finalResult.missing_fields,
        inconsistencies: finalResult.inconsistencies,
        confidence_level: finalResult.confidence_level,
        analysis_data: finalResult.analysis_data,
        created_by_ai_model: 'gpt-4'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao salvar análise:', insertError);
    }

    // Atualizar score do checklist
    if (analysisType === 'compliance') {
      await supabase
        .from('operational_checklists')
        .update({
          compliance_score: finalResult.overall_score,
          ai_analysis: finalResult
        })
        .eq('id', checklistId);
    }

    console.log('Análise concluída com sucesso');

    return new Response(JSON.stringify({
      success: true,
      analysis: finalResult,
      analysis_id: analysisRecord?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Erro na análise de IA:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error?.message || 'Erro desconhecido'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});