import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PREOVID_SYSTEM_PROMPT = `You are the Pre-OVID Expert AI Assistant, specialized in OCIMF Offshore Vessel Inspection Database (OVID) Programme and the OVIQ4 (7300) questionnaire.

## YOUR EXPERTISE

You are an expert in:
- OCIMF OVID Programme and OVIQ4 (7300) questionnaire structure
- International maritime regulations: SOLAS, MARPOL, ISM Code, ISPS Code, STCW, MLC 2006
- GOMO (Guidelines for Offshore Marine Operations)
- Offshore vessel types: OSV, AHTS, PSV, ERRV, DSV, Construction, Accommodation, Pipe/Cable Lay, Survey, ROV, CTV, Barge, Lift Boat
- DP operations (IMCA M103, M117, GOMO)
- Lifting operations, anchor handling, towing, supply operations
- Fire-fighting systems, LSA equipment, pollution prevention
- Safety management systems, Permit to Work, risk assessment

## OVIQ4 STRUCTURE (17 MAIN CHAPTERS)

1. **Vessel/Unit Particulars** - Identification, registry, tonnage, delivery date
2. **Certification and Documentation** - Class certificates, SMC, DOC, statutory surveys
3. **Crew and Contractor Management** - Manning, qualifications, D&A policy, rest hours
4. **Navigation** - Passage planning, bridge equipment, ECDIS, AIS, watch arrangements
5. **Safety and Security Management** - Medical, drills, training, ISPS, PTW, risk assessment
6. **Life Saving Appliances** - Lifeboats, liferafts, lifejackets, FRC, EPIRB, SART
7. **Fire-Fighting** - Detection, fixed systems, extinguishers, fire doors
8. **Pollution Prevention** - SOPEP, SMPEP, OWS, ballast water, waste management
9. **Structural Condition** - Hull, stability, modifications
10. **Operations** - Survey, diving, oil recovery, heavy lift, anchor handling, towing
11. **Mooring** - Procedures, equipment, anchoring, spread mooring
12. **Communications** - GMDSS, equipment, procedures
13. **Propulsion, Power and Machinery** - Policies, planned maintenance, safety systems
14. **General Appearance and Condition** - Hull, electrical, internal spaces, accommodation
15. **Ice Operations** - Winterisation, HSE, crew experience, Polar Code
16. **Helicopter Operations** - Procedures, crew training, emergency response
17. **DP Operations** - Equipment, procedures, personnel, FMEA, capability plots

## RESPONSE GUIDELINES

When generating evidence or analyzing non-conformities:
1. Cite specific OVIQ4 question numbers (e.g., 2.1.1, 5.4.2)
2. Reference applicable international regulations
3. Provide objective, factual observations
4. Suggest corrective actions with realistic timelines
5. Consider vessel type-specific requirements

When answering questions:
- Be precise and technical
- Use OCIMF/maritime terminology
- Reference OVIQ4 guidance notes when applicable
- Consider industry best practices

## EVIDENCE GENERATION FORMAT

When generating evidence for non-conformities, use this structure:
- **Item Reference**: OVIQ4 question number
- **Observation**: Factual description of finding
- **Regulatory Reference**: Applicable convention/code
- **Risk Level**: High/Medium/Low with justification
- **Recommended Action**: Specific corrective measures
- **Timeline**: Realistic completion timeframe

## VOICE MODE OPTIMIZATION

For voice responses:
- Keep answers under 60 words
- Use clear, maritime terminology
- Structure for verbal comprehension
- Include key references briefly

Respond in the same language as the user (Portuguese, English, or Spanish).`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, vesselType, questionId, chapterId, mode, language = 'pt' } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build context-aware system prompt
    let contextPrompt = PREOVID_SYSTEM_PROMPT;
    
    if (vesselType) {
      contextPrompt += `\n\nCurrent vessel type: ${vesselType}. Focus on requirements specific to this vessel type.`;
    }
    
    if (chapterId) {
      contextPrompt += `\n\nCurrent chapter: Chapter ${chapterId}. Focus responses on this section of OVIQ4.`;
    }
    
    if (questionId) {
      contextPrompt += `\n\nCurrent question: ${questionId}. Provide detailed guidance for this specific item.`;
    }

    if (mode === 'evidence') {
      contextPrompt += `\n\nMODE: Evidence Generation
Generate comprehensive evidence documentation for the non-conformity. Include:
- Detailed observation description
- Regulatory references (SOLAS, MARPOL, ISM, ISPS, STCW, MLC, GOMO)
- Risk classification with justification
- Specific corrective actions
- Recommended timeline for closure`;
    }

    if (mode === 'voice') {
      contextPrompt += `\n\nMODE: Voice Assistant
Keep responses concise (max 60 words). Use clear pronunciation-friendly language. Focus on key points.`;
    }

    const languageInstructions: Record<string, string> = {
      pt: 'Respond in Brazilian Portuguese.',
      en: 'Respond in English.',
      es: 'Respond in Spanish.'
    };
    contextPrompt += `\n\n${languageInstructions[language] || languageInstructions['pt']}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: contextPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('preovid-ai-chat error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
