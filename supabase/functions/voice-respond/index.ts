import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VoiceRespondRequest {
  text: string;
  voice?: string;
  language?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, voice = 'nova', language = 'pt' }: VoiceRespondRequest = await req.json();

    if (!text || text.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate text length to prevent abuse
    if (text.length > 4000) {
      return new Response(
        JSON.stringify({ error: 'Text too long. Maximum 4000 characters allowed.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      // Return text-only response if API key not available
      return new Response(
        JSON.stringify({
          success: true,
          text,
          audio_available: false,
          message: 'TTS not configured, use client-side synthesis',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Use OpenAI TTS to generate audio
    const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: voice,
        input: text,
        speed: 1.0,
      }),
    });

    if (!ttsResponse.ok) {
      console.error('TTS API error:', await ttsResponse.text());
      return new Response(
        JSON.stringify({
          success: true,
          text,
          audio_available: false,
          error: 'Failed to generate audio',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Get audio as array buffer and convert to base64 in chunks
    const audioBuffer = await ttsResponse.arrayBuffer();
    const bytes = new Uint8Array(audioBuffer);
    const chunkSize = 8192;
    let binaryString = '';
    
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const audioBase64 = btoa(binaryString);

    return new Response(
      JSON.stringify({
        success: true,
        text,
        audio_available: true,
        audio_data: audioBase64,
        audio_format: 'mp3',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Voice respond error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
