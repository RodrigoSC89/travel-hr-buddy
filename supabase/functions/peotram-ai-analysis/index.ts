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
    const { auditId } = await req.json();

    console.log('Iniciando análise PEOTRAM para auditoria:', auditId);

    // Buscar dados da auditoria
    const { data: audit, error: auditError } = await supabase
      .from('peotram_audits')
      .select(`
        *,
        peotram_documents (*)
      `)
      .eq('id', auditId)
      .single();

    if (auditError) {
      throw new Error(`Erro ao buscar auditoria: ${auditError.message}`);
    }

    const documents = audit.peotram_documents || [];
    
    // Categorizar documentos
    const documentsByCategory: Record<string, any[]> = documents.reduce((acc: Record<string, any[]>, doc: any) => {
      if (!acc[doc.category]) {
        acc[doc.category] = [];
      }
      acc[doc.category].push(doc);
      return acc;
    }, {});

    // Definir categorias obrigatórias PEOTRAM
    const requiredCategories = [
      'seguranca',
      'qualidade', 
      'ambiental',
      'operacional',
      'treinamento',
      'emergencia',
      'manutencao',
      'certificacoes'
    ];

    // Analisar cada categoria
    const categoryScores: Record<string, any> = {};
    const criticalFindings: string[] = [];
    const recommendations = [];

    for (const category of requiredCategories) {
      const categoryDocs = documentsByCategory[category] || [];
      const requiredDocsCount = getCategoryRequiredDocs(category);
      const presentDocsCount = categoryDocs.length;
      const conformeDocs = categoryDocs.filter((doc: any) => doc.compliance_status === 'conforme').length;
      
      // Calcular score da categoria (0-100)
      const completenessScore = Math.min(100, (presentDocsCount / requiredDocsCount) * 100);
      const conformityScore = presentDocsCount > 0 ? (conformeDocs / presentDocsCount) * 100 : 0;
      const categoryScore = (completenessScore * 0.6) + (conformityScore * 0.4);
      
      categoryScores[category] = {
        score: Math.round(categoryScore),
        completeness: Math.round(completenessScore),
        conformity: Math.round(conformityScore),
        required_docs: requiredDocsCount,
        present_docs: presentDocsCount,
        conforme_docs: conformeDocs
      };

      // Identificar problemas críticos
      if (categoryScore < 60) {
        criticalFindings.push(`Categoria ${category}: Score baixo (${Math.round(categoryScore)}%)`);
      }
      
      if (presentDocsCount < requiredDocsCount) {
        const missing = requiredDocsCount - presentDocsCount;
        criticalFindings.push(`Categoria ${category}: ${missing} documento(s) ausente(s)`);
        recommendations.push(`Urgente: Incluir documentos obrigatórios da categoria ${category}`);
      }
    }

    // Calcular score geral
    const categoryScoreValues = Object.values(categoryScores).map((cat: any) => cat.score);
    const overallCompliance = categoryScoreValues.reduce((sum: number, score: number) => sum + score, 0) / categoryScoreValues.length;

    // Análise de IA com GPT-4
    const analysisPrompt = `Você é um especialista em auditoria PEOTRAM da Petrobras. Analise os dados fornecidos e forneça insights:

    Auditoria: ${audit.audit_period}
    Embarcação: ${audit.vessel_id || 'N/A'}
    Total de documentos: ${documents.length}
    
    Scores por categoria:
    ${JSON.stringify(categoryScores, null, 2)}
    
    Problemas críticos identificados:
    ${criticalFindings.join('\n')}
    
    Baseado nesta análise, forneça:
    1. Avaliação geral da conformidade
    2. Principais riscos identificados
    3. Recomendações prioritárias
    4. Ações corretivas específicas
    5. Previsão de score final da auditoria
    
    Responda APENAS com um JSON válido:
    {
      "assessment_summary": "string",
      "risk_level": "baixo|medio|alto|critico",
      "priority_recommendations": ["string"],
      "corrective_actions": ["string"],
      "predicted_final_score": number,
      "confidence_assessment": number
    }`;

    console.log('Chamando OpenAI para análise PEOTRAM...');
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um especialista em auditoria PEOTRAM. Forneça análises precisas e acionáveis.' 
          },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.2,
        max_tokens: 1500,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    const aiResponse = openAIData.choices[0].message.content;

    // Parsear resposta da IA
    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Erro ao parsear resposta da IA:', parseError);
      aiAnalysis = {
        assessment_summary: 'Análise automatizada baseada em métricas de conformidade',
        risk_level: overallCompliance < 60 ? 'alto' : overallCompliance < 80 ? 'medio' : 'baixo',
        priority_recommendations: recommendations.slice(0, 5),
        corrective_actions: ['Revisar documentação pendente', 'Verificar conformidade de documentos'],
        predicted_final_score: Math.round(overallCompliance),
        confidence_assessment: 0.75
      };
    }

    // Buscar auditorias anteriores para comparação
    const { data: previousAudits } = await supabase
      .from('peotram_audits')
      .select('final_score, audit_period')
      .eq('vessel_id', audit.vessel_id)
      .neq('id', auditId)
      .order('audit_date', { ascending: false })
      .limit(3);

    const comparativeAnalysis = {
      trend: 'stable',
      improvement_areas: [],
      regression_areas: []
    };

    if (previousAudits && previousAudits.length > 0) {
      const lastScore = previousAudits[0]?.final_score;
      if (lastScore) {
        const scoreDiff = overallCompliance - lastScore;
        comparativeAnalysis.trend = scoreDiff > 5 ? 'improving' : scoreDiff < -5 ? 'declining' : 'stable';
      }
    }

    // Preparar resultado final
    const finalAnalysis = {
      audit_id: auditId,
      analysis_type: 'overall_assessment',
      category_scores: categoryScores,
      overall_compliance: Math.round(overallCompliance),
      critical_findings: criticalFindings,
      recommendations: [...recommendations, ...aiAnalysis.priority_recommendations],
      risk_assessment: {
        level: aiAnalysis.risk_level,
        factors: criticalFindings,
        mitigation_actions: aiAnalysis.corrective_actions
      },
      comparative_analysis: comparativeAnalysis,
      ai_model_used: 'gpt-4',
      confidence_level: aiAnalysis.confidence_assessment,
      analysis_data: {
        total_documents: documents.length,
        categories_analyzed: requiredCategories.length,
        compliance_by_category: categoryScores,
        ai_assessment: aiAnalysis
      }
    };

    // Salvar análise no banco
    const { data: analysisRecord, error: insertError } = await supabase
      .from('peotram_ai_analysis')
      .insert(finalAnalysis)
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao salvar análise PEOTRAM:', insertError);
    }

    // Atualizar score preditivo da auditoria
    await supabase
      .from('peotram_audits')
      .update({
        predicted_score: Math.round(overallCompliance)
      })
      .eq('id', auditId);

    // Gerar predição de melhoria
    const improvementScenarios = generateImprovementScenarios(categoryScores, documents);
    
    // Salvar predições
    await supabase
      .from('peotram_score_predictions')
      .insert({
        audit_id: auditId,
        predicted_score: Math.round(overallCompliance),
        prediction_confidence: aiAnalysis.confidence_assessment,
        score_breakdown: categoryScores,
        improvement_scenarios: improvementScenarios,
        risk_factors: criticalFindings,
        recommended_actions: aiAnalysis.corrective_actions,
        based_on_documents: documents.length
      });

    console.log('Análise PEOTRAM concluída com sucesso');

    return new Response(JSON.stringify({
      success: true,
      analysis: finalAnalysis,
      improvement_scenarios: improvementScenarios,
      analysis_id: analysisRecord?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Erro na análise PEOTRAM:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error?.message || 'Erro desconhecido'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Função auxiliar para definir documentos obrigatórios por categoria
function getCategoryRequiredDocs(category: string): number {
  const requirements: Record<string, number> = {
    'seguranca': 12,
    'qualidade': 8,
    'ambiental': 10,
    'operacional': 15,
    'treinamento': 6,
    'emergencia': 8,
    'manutencao': 10,
    'certificacoes': 12
  };
  return requirements[category] || 5;
}

// Função para gerar cenários de melhoria
function generateImprovementScenarios(categoryScores: any, documents: any[]): any[] {
  const scenarios = [];
  
  // Analisar categorias com baixo score
  for (const [category, data] of Object.entries(categoryScores)) {
    const categoryData = data as any;
    if (categoryData.score < 80) {
      const potentialImprovement = Math.min(20, 85 - categoryData.score);
      scenarios.push({
        action: `Completar documentação da categoria ${category}`,
        potential_improvement: potentialImprovement,
        impact: potentialImprovement > 15 ? 'alto' : potentialImprovement > 8 ? 'medio' : 'baixo',
        estimated_effort: categoryData.present_docs < categoryData.required_docs / 2 ? 'alto' : 'medio'
      });
    }
  }

  // Cenário otimista
  scenarios.push({
    action: 'Completar todos os documentos pendentes',
    potential_improvement: Math.max(...Object.values(categoryScores).map((cat: any) => 100 - cat.score)),
    impact: 'muito_alto',
    estimated_effort: 'alto'
  });

  return scenarios.slice(0, 5); // Retornar top 5 cenários
}