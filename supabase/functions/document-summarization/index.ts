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

    const { document_text, document_id, summary_type, max_length } = await req.json();

    if (!document_text) {
      return errorResponse('Document text is required', 400);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return errorResponse('OpenAI API key not configured', 500);
    }

    const summaryTypePrompt = summary_type === 'brief' 
      ? 'Provide a brief 2-3 sentence summary.'
      : summary_type === 'detailed'
      ? 'Provide a detailed summary with key points and sections.'
      : 'Provide a comprehensive summary highlighting main points.';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are a document summarization expert for maritime industry documents. ${summaryTypePrompt} Focus on key information, dates, requirements, and action items.` 
          },
          { role: 'user', content: `Summarize the following document:\n\n${document_text}` }
        ],
        temperature: 0.3,
        max_tokens: max_length || 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'document-summarization', 'OpenAI API error', { error: errorText });
      return errorResponse('AI service error', 500);
    }

    const aiResponse = await response.json();
    const summary = aiResponse.choices[0]?.message?.content;

    // Store summary if document_id provided
    if (document_id) {
      await supabase.from('document_summaries').insert({
        document_id,
        summary,
        summary_type: summary_type || 'standard',
        created_by: user.id,
        created_at: new Date().toISOString()
      });
    }

    log('info', 'document-summarization', 'Document summarized successfully', { 
      documentId: document_id,
      originalLength: document_text.length,
      summaryLength: summary?.length 
    });

    return jsonResponse({
      success: true,
      data: {
        summary,
        original_length: document_text.length,
        summary_length: summary?.length,
        tokens_used: aiResponse.usage?.total_tokens
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'document-summarization', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
