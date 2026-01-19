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

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'pt';

    if (!audioFile) {
      return errorResponse('Audio file is required', 400);
    }

    // Step 1: Transcribe with Whisper (OpenAI)
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return errorResponse('OpenAI API key not configured', 500);
    }

    const whisperFormData = new FormData();
    whisperFormData.append('file', audioFile);
    whisperFormData.append('model', 'whisper-1');
    whisperFormData.append('language', language);

    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: whisperFormData,
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      log('error', 'ai-voice-chat', 'Whisper transcription failed', { error: errorText });
      return errorResponse('Failed to transcribe audio', 500);
    }

    const transcription = await whisperResponse.json();
    const userMessage = transcription.text;

    // Step 2: Get AI response (using GPT-4)
    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are Nauti Brain, an AI assistant for the Nauti One maritime HR management platform. 
            You help with crew management, compliance (MLC 2006, STCW), voyage planning, and maintenance scheduling.
            Respond in ${language === 'pt' ? 'Portuguese (Brazil)' : 'English'}.
            Keep responses concise and helpful.`
          },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 500,
      }),
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      log('error', 'ai-voice-chat', 'Chat completion failed', { error: errorText });
      return errorResponse('Failed to generate response', 500);
    }

    const chatData = await chatResponse.json();
    const aiResponse = chatData.choices[0].message.content;

    // Step 3: Synthesize speech with ElevenLabs
    const elevenlabsKey = Deno.env.get('ELEVENLABS_API_KEY');
    let audioUrl = null;

    if (elevenlabsKey) {
      const voiceId = language === 'pt' ? 'pNInz6obpgDQGcFmaJgB' : '21m00Tcm4TlvDq8ikWAM';
      
      const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': elevenlabsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: aiResponse,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          }
        }),
      });

      if (ttsResponse.ok) {
        const audioBuffer = await ttsResponse.arrayBuffer();
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
        audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
      }
    }

    // Log interaction
    await supabase.from('ai_audit_logs').insert({
      user_id: user.id,
      interaction_type: 'voice_chat',
      user_input: userMessage,
      ai_response: aiResponse,
      model_version: 'gpt-4o-mini + whisper-1 + elevenlabs',
      created_at: new Date().toISOString()
    });

    log('info', 'ai-voice-chat', 'Voice chat completed', { userId: user.id });

    return jsonResponse({
      success: true,
      transcription: userMessage,
      response: aiResponse,
      audio_url: audioUrl
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'ai-voice-chat', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
