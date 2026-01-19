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

    const { question, context, vessel_id, crew_member_id } = await req.json();

    if (!question) {
      return errorResponse('Question is required', 400);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return errorResponse('OpenAI API key not configured', 500);
    }

    // Build context from database if vessel or crew provided
    let additionalContext = '';
    
    if (vessel_id) {
      const { data: vessel } = await supabase
        .from('vessels')
        .select('name, flag_state, gross_tonnage, vessel_type')
        .eq('id', vessel_id)
        .single();
      
      if (vessel) {
        additionalContext += `\nVessel Info: ${vessel.name}, Flag: ${vessel.flag_state}, Type: ${vessel.vessel_type}`;
      }
    }

    if (crew_member_id) {
      const { data: crew } = await supabase
        .from('crew_members')
        .select('full_name, position, nationality')
        .eq('id', crew_member_id)
        .single();
      
      if (crew) {
        additionalContext += `\nCrew Member: ${crew.full_name}, Position: ${crew.position}, Nationality: ${crew.nationality}`;
      }
    }

    const systemPrompt = `You are an expert MLC 2006 (Maritime Labour Convention) compliance advisor. 
You have deep knowledge of all MLC requirements including:
- Minimum age requirements (Regulation 1.1)
- Medical certification (Regulation 1.2)
- Training and qualifications (Regulation 1.3)
- Recruitment and placement (Regulation 1.4)
- Seafarers' employment agreements (Regulation 2.1)
- Wages (Regulation 2.2)
- Hours of work and rest (Regulation 2.3)
- Entitlement to leave (Regulation 2.4)
- Repatriation (Regulation 2.5)
- Seafarer compensation (Regulation 2.6)
- Manning levels (Regulation 2.7)
- Accommodation and food (Regulation 3.1-3.2)
- Health and safety (Regulation 4.1-4.3)
- Onboard complaint procedures (Regulation 5.1.5)

Provide accurate, practical advice based on MLC 2006 requirements. 
Always cite the relevant regulation numbers.
If unsure, recommend consulting with a maritime legal expert.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${context ? `Context: ${context}\n${additionalContext}\n\n` : ''}Question: ${question}` }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'mlc-compliance-advisor', 'OpenAI API error', { error: errorText });
      return errorResponse('AI service error', 500);
    }

    const aiResponse = await response.json();
    const advice = aiResponse.choices[0]?.message?.content;

    // Log the interaction
    await supabase.from('ai_audit_logs').insert({
      user_id: user.id,
      user_input: question,
      ai_response: advice,
      module_name: 'mlc-compliance-advisor',
      model_version: 'gpt-4o',
      tokens_input: aiResponse.usage?.prompt_tokens,
      tokens_output: aiResponse.usage?.completion_tokens,
      created_at: new Date().toISOString()
    });

    log('info', 'mlc-compliance-advisor', 'Advice provided successfully');
    return jsonResponse({ 
      success: true, 
      data: {
        advice,
        tokens_used: aiResponse.usage?.total_tokens,
        model: 'gpt-4o'
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'mlc-compliance-advisor', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
