import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VoiceRequest {
  audio_data?: string; // Base64 encoded audio
  transcript?: string; // Pre-transcribed text
  session_id?: string;
  confidence?: number;
}

serve(async (req) => {
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

    const { audio_data, transcript: providedTranscript, session_id, confidence = 90 }: VoiceRequest = await req.json();

    let transcript = providedTranscript;

    // If audio data is provided, use OpenAI Whisper to transcribe
    if (audio_data && !transcript) {
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      
      if (!openaiApiKey) {
        return new Response(
          JSON.stringify({ error: 'OpenAI API key not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Convert base64 to blob
      const audioBlob = new Blob(
        [Uint8Array.from(atob(audio_data), c => c.charCodeAt(0))],
        { type: 'audio/webm' }
      );

      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'pt');

      const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: formData,
      });

      if (!whisperResponse.ok) {
        console.error('Whisper API error:', await whisperResponse.text());
        return new Response(
          JSON.stringify({ error: 'Failed to transcribe audio' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const whisperData = await whisperResponse.json();
      transcript = whisperData.text;
    }

    if (!transcript || transcript.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'No transcript or audio data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user
    const { data: userData } = await supabaseClient.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process the command using the database function
    const { data: commandResult, error: commandError } = await supabaseClient
      .rpc('process_voice_command', {
        p_transcript: transcript,
        p_user_id: userId,
        p_session_id: session_id || null,
        p_confidence: confidence,
      });

    if (commandError) {
      console.error('Command processing error:', commandError);
      throw commandError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        transcript,
        confidence,
        ...commandResult,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Voice recognize error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
