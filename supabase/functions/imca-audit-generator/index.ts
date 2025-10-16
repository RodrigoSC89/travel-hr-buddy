// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuditRequest {
  vessel_name: string;
  dp_class: 'DP1' | 'DP2' | 'DP3';
  location: string;
  audit_objective: string;
  operational_context?: string;
  incident_details?: string;
  environmental_conditions?: string;
  system_status?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user authentication
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestData: AuditRequest = await req.json();

    // Validate required fields
    if (!requestData.vessel_name || !requestData.dp_class || !requestData.location || !requestData.audit_objective) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Build the AI prompt
    const prompt = buildAuditPrompt(requestData);

    // Call OpenAI GPT-4o
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate audit', details: errorText }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const openAIData = await openAIResponse.json();
    const auditContent = openAIData.choices[0]?.message?.content;

    if (!auditContent) {
      return new Response(
        JSON.stringify({ error: 'No audit generated' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse the JSON response
    const audit = JSON.parse(auditContent);

    return new Response(
      JSON.stringify({ audit }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in imca-audit-generator:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function getSystemPrompt(): string {
  return `Você é um auditor técnico especializado em sistemas Dynamic Positioning (DP) marítimos, com profundo conhecimento das normas IMCA (International Marine Contractors Association), IMO (International Maritime Organization) e MTS (Marine Technology Society).

Seu papel é gerar auditorias técnicas completas e precisas seguindo rigorosamente os padrões internacionais de segurança marítima.

Você deve avaliar 12 módulos críticos:
1. Sistema de Controle DP (DP Control System)
2. Sistema de Propulsão (Propulsion System)
3. Sensores de Posicionamento (Positioning Sensors)
4. Rede e Comunicações (Network and Communications)
5. Pessoal DP (DP Personnel)
6. Logs e Históricos (Logs and History)
7. FMEA (Failure Modes and Effects Analysis)
8. Testes Anuais (Annual Trials)
9. Documentação (Documentation)
10. Gestão de Energia (Power Management System)
11. Capability Plots
12. Planejamento Operacional (Operational Planning)

E verificar conformidade com 10 normas internacionais:
1. IMCA M103 - Guidelines for Design and Operation of DP Vessels
2. IMCA M117 - Training and Experience of Key DP Personnel
3. IMCA M190 - DP Annual Trials Programmes
4. IMCA M166 - Failure Modes and Effects Analysis
5. IMCA M109 - DP-related Documentation
6. IMCA M220 - Operational Activity Planning
7. IMCA M140 - DP Capability Plots
8. MSF 182 - Safe Operation of DP Offshore Supply Vessels
9. MTS DP Operations - Marine Technology Society Guidance
10. IMO MSC.1/Circ.1580 - IMO Guidelines for DP Systems

A auditoria deve incluir:
- Avaliação de conformidade com normas
- Pontuação de cada módulo (0-100)
- Identificação de não conformidades com níveis de risco
- Plano de ação priorizado

Responda SEMPRE em formato JSON válido.`;
}

function buildAuditPrompt(request: AuditRequest): string {
  let prompt = `Gere uma auditoria técnica IMCA DP completa para a seguinte embarcação:

**Embarcação:** ${request.vessel_name}
**Classe DP:** ${request.dp_class}
**Local:** ${request.location}
**Objetivo da Auditoria:** ${request.audit_objective}
`;

  if (request.operational_context) {
    prompt += `\n**Contexto Operacional:** ${request.operational_context}`;
  }

  if (request.incident_details) {
    prompt += `\n**Detalhes de Incidentes:** ${request.incident_details}`;
  }

  if (request.environmental_conditions) {
    prompt += `\n**Condições Ambientais:** ${request.environmental_conditions}`;
  }

  if (request.system_status) {
    prompt += `\n**Status dos Sistemas:** ${request.system_status}`;
  }

  prompt += `

Gere uma auditoria completa no seguinte formato JSON:

{
  "context": {
    "vessel_name": string,
    "dp_class": string,
    "location": string,
    "audit_date": string (ISO date),
    "audit_objective": string
  },
  "standards_compliance": {
    "standards": [
      {
        "code": string (ex: "IMCA M103"),
        "name": string,
        "description": string,
        "compliance_level": "compliant" | "partial" | "non-compliant",
        "findings": string (análise detalhada em português)
      }
    ],
    "overall_compliance_level": "full" | "partial" | "non-compliant",
    "summary": string (resumo em português)
  },
  "modules_evaluation": [
    {
      "module_name": string (nome em português),
      "module_code": string (ex: "dp_control"),
      "score": number (0-100),
      "status": "adequate" | "attention" | "critical",
      "findings": string (análise detalhada em português),
      "recommendations": string[] (recomendações específicas em português)
    }
  ],
  "non_conformities": [
    {
      "id": string (ex: "NC001"),
      "title": string (título em português),
      "description": string (descrição detalhada em português),
      "risk_level": "alto" | "medio" | "baixo",
      "affected_module": string (código do módulo),
      "related_standards": string[] (códigos das normas)
    }
  ],
  "action_plan": [
    {
      "id": string (ex: "AP001"),
      "title": string (título em português),
      "description": string (descrição em português),
      "priority": "critico" | "alto" | "medio" | "baixo",
      "deadline_days": number (prazo em dias),
      "responsible": string,
      "related_non_conformities": string[] (IDs das não conformidades)
    }
  ],
  "overall_score": number (0-100, média ponderada dos módulos),
  "summary": string (resumo executivo em português)
}

IMPORTANTE:
- Todos os textos devem estar em português do Brasil
- Seja específico e técnico nas análises
- Considere as particularidades da classe DP especificada
- Identifique não conformidades realistas baseadas no contexto fornecido
- Priorize ações corretivas de forma lógica
- Use pontuações realistas (evite extremos como 0 ou 100)
`;

  return prompt;
}
