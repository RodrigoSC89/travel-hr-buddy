/**
 * Voice Assistant Pro - Processamento de voz avançado
 * STT via ElevenLabs Scribe + TTS via ElevenLabs
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Voices otimizadas para português
const VOICE_MAP: Record<string, string> = {
  default: 'onwK4e9ZLuTAKqWW03F9', // Daniel - Portuguese male
  male: 'onwK4e9ZLuTAKqWW03F9', // Daniel
  female: 'cgSgspJ2msm6clMCkdW9', // Jessica
  professional: 'nPczCjzI2devNBz1zQrb', // Brian
  friendly: 'EXAVITQu4vr4xnSDxMaL', // Sarah
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop() || 'tts';

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY') || Deno.env.get('ELEVENLABS_API_KEY_1');
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    if (action === 'tts' || req.method === 'POST') {
      // Text-to-Speech
      const { text, voiceType = 'default', speed = 1.0 } = await req.json();
      
      if (!text) {
        throw new Error('Text is required for TTS');
      }

      const voiceId = VOICE_MAP[voiceType] || VOICE_MAP.default;
      
      console.log('[voice-assistant-pro] TTS request, voice:', voiceType, 'chars:', text.length);

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.3,
              use_speaker_boost: true,
              speed: speed,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[voice-assistant-pro] ElevenLabs TTS error:', response.status, errorText);
        throw new Error(`TTS error: ${response.status}`);
      }

      const audioBuffer = await response.arrayBuffer();
      
      console.log('[voice-assistant-pro] TTS complete, size:', audioBuffer.byteLength);

      return new Response(audioBuffer, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.byteLength.toString(),
        },
      });
    }

    // STT Token generation for realtime transcription
    if (action === 'stt-token') {
      console.log('[voice-assistant-pro] Generating STT token');
      
      const response = await fetch(
        'https://api.elevenlabs.io/v1/single-use-token/realtime_scribe',
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[voice-assistant-pro] Token generation error:', response.status, errorText);
        throw new Error(`Token generation error: ${response.status}`);
      }

      const { token } = await response.json();
      
      return new Response(
        JSON.stringify({ token }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Batch STT (non-realtime)
    if (action === 'stt') {
      const formData = await req.formData();
      const audioFile = formData.get('audio') as File;
      
      if (!audioFile) {
        throw new Error('Audio file is required for STT');
      }

      console.log('[voice-assistant-pro] STT request, file size:', audioFile.size);

      const apiFormData = new FormData();
      apiFormData.append('file', audioFile);
      apiFormData.append('model_id', 'scribe_v2');
      apiFormData.append('language_code', 'por'); // Portuguese
      apiFormData.append('tag_audio_events', 'true');
      apiFormData.append('diarize', 'false');

      const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: apiFormData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[voice-assistant-pro] ElevenLabs STT error:', response.status, errorText);
        throw new Error(`STT error: ${response.status}`);
      }

      const transcription = await response.json();
      
      console.log('[voice-assistant-pro] STT complete');

      return new Response(
        JSON.stringify(transcription),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error(`Unknown action: ${action}`);

  } catch (error) {
    console.error('[voice-assistant-pro] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
