/**
 * MLC Voice Chat Edge Function
 * AI-powered voice chat for MLC 2006 inspection assistance
 * Uses Lovable AI Gateway with Google Gemini 2.5 Flash
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MLC_VOICE_SYSTEM_PROMPT = `You are MLCGuard AI, an expert Maritime Labour Convention 2006 voice assistant.

CRITICAL VOICE MODE RULES:
- Responses MUST be under 60 words for voice synthesis
- Be direct, practical, and actionable
- Use maritime terminology appropriately
- Focus on the most important information first

Your expertise covers:
- MLC 2006 with 2022 amendments (5 Titles, 22 Regulations)
- Port State Control (PSC) inspection procedures
- Seafarer rights and welfare requirements
- Accommodation, food, and recreation standards
- Hours of work and rest requirements
- Wage and leave entitlements
- Health and medical care requirements
- Complaint procedures onboard

When answering:
1. Provide concise, practical guidance
2. Reference specific MLC regulations when relevant
3. Highlight critical items that may lead to detention
4. Give clear next steps

Respond in the language of the query (Portuguese or English).`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build context string if inspection context provided
    let contextStr = '';
    if (context) {
      contextStr = `\n\nCurrent inspection context:
- Vessel: ${context.vesselName || 'N/A'}
- Port: ${context.port || 'N/A'}
- Progress: ${context.progress || 'N/A'}%
- Current section: ${context.currentSection || 'N/A'}`;
    }

    console.log('[MLC-Voice] Processing message:', message.substring(0, 50));

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: MLC_VOICE_SYSTEM_PROMPT + contextStr },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 200, // Keep responses short for voice
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[MLC-Voice] AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          response: 'Sistema temporariamente sobrecarregado. Tente novamente em alguns segundos.',
          error: 'rate_limit'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          response: 'Créditos insuficientes. Entre em contato com o administrador.',
          error: 'payment_required'
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content returned from AI');
    }

    console.log('[MLC-Voice] Response generated successfully');

    return new Response(JSON.stringify({ 
      response: content,
      model: 'google/gemini-2.5-flash',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[MLC-Voice] Error:', error);
    
    // Provide helpful fallback responses for common queries
    const fallbackResponses: Record<string, string> = {
      'default': 'Desculpe, não consegui processar sua pergunta. Por favor, tente novamente ou consulte o checklist MLC diretamente.'
    };
    
    return new Response(JSON.stringify({ 
      response: fallbackResponses.default,
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true
    }), {
      status: 200, // Return 200 with fallback for better UX
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
