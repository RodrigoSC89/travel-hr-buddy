import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCORS, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { log } from "../_shared/logger.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCORS();

  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio');
    const language = formData.get('language') as string || 'pt';

    if (!audioFile || !(audioFile instanceof File)) {
      return errorResponse('Audio file is required', 400);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return errorResponse('OpenAI API key not configured', 500);
    }

    const whisperFormData = new FormData();
    whisperFormData.append('file', audioFile);
    whisperFormData.append('model', 'whisper-1');
    whisperFormData.append('language', language);
    whisperFormData.append('response_format', 'verbose_json');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: whisperFormData
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'speech-to-text', 'OpenAI Whisper API error', { error: errorText });
      return errorResponse('Speech-to-text service error', 500);
    }

    const result = await response.json();

    log('info', 'speech-to-text', 'Transcription completed', { 
      language: result.language,
      duration: result.duration 
    });

    return jsonResponse({
      success: true,
      data: {
        text: result.text,
        language: result.language,
        duration: result.duration,
        segments: result.segments
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'speech-to-text', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
