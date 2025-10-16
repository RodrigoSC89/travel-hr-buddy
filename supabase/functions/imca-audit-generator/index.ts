/**
 * IMCA DP Technical Audit Generator Edge Function
 * 
 * Generates AI-powered IMCA DP technical audit reports using OpenAI GPT-4o.
 * Evaluates vessel DP systems against 10 international standards.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuditInput {
  vesselName: string;
  dpClass: 'DP1' | 'DP2' | 'DP3';
  location: string;
  auditObjective: string;
  incidentDetails?: string;
  environmentalConditions?: string;
  systemStatus?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!;
    
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body
    const input: AuditInput = await req.json();

    // Validate required fields
    if (!input.vesselName || !input.dpClass || !input.location || !input.auditObjective) {
      throw new Error('Missing required fields');
    }

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build the prompt for GPT-4o
    const prompt = `
Você é um auditor técnico especializado em sistemas de Posicionamento Dinâmico (DP) para embarcações marítimas, seguindo as normas IMCA (International Marine Contractors Association), IMO (International Maritime Organization) e MTS (Marine Technology Society).

Gere um relatório de auditoria técnica DP completo e detalhado em português para a seguinte embarcação:

**Informações Básicas:**
- Nome da Embarcação: ${input.vesselName}
- Classe DP: ${input.dpClass}
- Localização: ${input.location}
- Objetivo da Auditoria: ${input.auditObjective}

${input.incidentDetails ? `**Detalhes do Incidente:**\n${input.incidentDetails}\n` : ''}
${input.environmentalConditions ? `**Condições Ambientais:**\n${input.environmentalConditions}\n` : ''}
${input.systemStatus ? `**Status dos Sistemas:**\n${input.systemStatus}\n` : ''}

**Normas a serem avaliadas (todas as 10):**
1. IMCA M103 - Guidelines for DP Operations
2. IMCA M117 - DP Operations Guidance
3. IMCA M190 - Guidance on DP Capability Plots
4. IMCA M166 - DP FMEA Guidelines
5. IMCA M109 - DP Annual Trials
6. IMCA M220 - DP Incident Reporting
7. IMCA M140 - DP Operations Personnel
8. MSF 182 - Marine Safety Forum Guidelines
9. MTS DP - MTS DP Operations Guidelines
10. IMO MSC.1/Circ.1580 - IMO DP Guidelines

**Módulos DP a serem avaliados (todos os 12):**
1. Sistemas de Controle
2. Sistema de Propulsão
3. Sistema de Energia
4. Sistemas de Sensores
5. Comunicações
6. Pessoal
7. FMEA
8. Provas Anuais
9. Documentação
10. PMS (Planned Maintenance System)
11. Capability Plots
12. Planejamento Operacional

**Formato de saída esperado (JSON válido):**
{
  "vesselName": "${input.vesselName}",
  "dpClass": "${input.dpClass}",
  "location": "${input.location}",
  "auditDate": "data atual ISO",
  "auditObjective": "${input.auditObjective}",
  "overallScore": número de 0-100,
  "summary": "resumo executivo detalhado da auditoria",
  "standards": [
    {
      "code": "código da norma",
      "name": "nome da norma",
      "description": "descrição breve"
    }
  ],
  "modules": [
    {
      "id": "identificador",
      "name": "nome do módulo",
      "description": "descrição",
      "score": número de 0-100,
      "findings": ["observação 1", "observação 2"]
    }
  ],
  "nonConformities": [
    {
      "id": "id único",
      "module": "nome do módulo",
      "description": "descrição da não conformidade",
      "standard": "norma violada",
      "riskLevel": "Alto" | "Médio" | "Baixo",
      "recommendation": "recomendação de correção"
    }
  ],
  "actionPlan": [
    {
      "id": "id único",
      "description": "descrição da ação",
      "priority": "Crítico" | "Alto" | "Médio" | "Baixo",
      "deadline": "data ISO",
      "responsible": "cargo responsável",
      "relatedNonConformity": "id da não conformidade relacionada"
    }
  ],
  "recommendations": ["recomendação 1", "recomendação 2"]
}

**Instruções importantes:**
- Gere TODAS as 10 normas na lista de standards
- Avalie TODOS os 12 módulos DP
- Identifique pelo menos 3-5 não conformidades realistas
- Classifique riscos como Alto, Médio ou Baixo
- Crie um plano de ação com 8-12 itens prioritizados
- Defina prazos baseados na prioridade:
  * Crítico: < 7 dias
  * Alto: < 30 dias
  * Médio: < 90 dias
  * Baixo: < 180 dias
- Seja específico e técnico nas observações
- Retorne APENAS o JSON, sem texto adicional
`;

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um auditor técnico especializado em sistemas DP marítimos. Responda APENAS com JSON válido, sem markdown ou texto adicional.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    const openaiData = await openaiResponse.json();
    const responseText = openaiData.choices[0].message.content.trim();

    // Parse the JSON response, removing markdown code blocks if present
    let auditReport;
    try {
      // Remove markdown code blocks if present
      const jsonText = responseText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      
      auditReport = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText);
      throw new Error('Failed to parse audit report from AI response');
    }

    // Add timestamps
    auditReport.id = crypto.randomUUID();
    auditReport.createdAt = new Date().toISOString();
    auditReport.updatedAt = new Date().toISOString();

    // Return the audit report
    return new Response(
      JSON.stringify(auditReport),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in imca-audit-generator:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Unauthorized' ? 401 : 500,
      }
    );
  }
});
