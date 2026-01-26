import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCORS, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";
import { log } from "../_shared/logger.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

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

    const { document_url, document_type, extract_fields } = await req.json();

    if (!document_url) {
      return errorResponse('Document URL is required', 400);
    }

    if (!OPENAI_API_KEY) {
      return jsonResponse({
        success: true,
        data: {
          extracted_text: 'OCR service not configured. Mock response.',
          fields: {},
          confidence: 0,
          mock: true
        }
      });
    }

    // Use GPT-4 Vision for OCR
    const systemPrompt = `You are an expert document analyzer for maritime documents. 
Extract all text and structured data from the provided document image.
${document_type ? `Document type: ${document_type}` : ''}
${extract_fields ? `Focus on extracting these fields: ${extract_fields.join(', ')}` : ''}

Return a JSON object with:
- extracted_text: full text content
- fields: structured key-value pairs of important data
- document_type: identified document type
- dates: any dates found
- names: any person/organization names
- numbers: certificate numbers, IDs, etc.
- confidence: your confidence score (0-1)`;

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
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this document and extract all relevant information.' },
              { type: 'image_url', image_url: { url: document_url } }
            ]
          }
        ],
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'document-ocr', 'OpenAI API error', { error: errorText });
      return errorResponse('OCR processing failed', 500);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;
    
    let extractedData: Record<string, unknown>;
    try {
      extractedData = JSON.parse(content);
    } catch {
      extractedData = { extracted_text: content, confidence: 0.5 };
    }

    // Save to document insights
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .maybeSingle();

    await supabase.from('ai_document_insights').insert({
      document_id: document_url,
      organization_id: (profile as { organization_id?: string } | null)?.organization_id,
      extracted_text: extractedData.extracted_text,
      entities: extractedData.fields,
      classification: extractedData.document_type,
      confidence: extractedData.confidence,
      dates: extractedData.dates,
      keywords: Object.keys((extractedData.fields as Record<string, unknown>) || {}),
      created_by: user.id
    });

    log('info', 'document-ocr', 'Document processed', {
      userId: user.id,
      documentType: extractedData.document_type,
      confidence: extractedData.confidence
    });

    return jsonResponse({ success: true, data: extractedData });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'document-ocr', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
