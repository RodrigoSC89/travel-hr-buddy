/// <reference path="../deno-ambient.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Helper function to encode ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Top voice IDs from ElevenLabs
const VOICE_IDS: Record<string, string> = {
  "aria": "EXAVITQu4vr4xnSDxMaL",
  "roger": "CwhRBWXzGAHq8TQ4Fs17",
  "sarah": "EXAVITQu4vr4xnSDxMaL",
  "laura": "FGY2WhTYpPnrIDTdsKH5",
  "charlie": "IKne3meq5aSn9XLyUdCD",
  "george": "JBFqnCBsd6RMkjVDRZzb",
  "callum": "N2lVS1w4EtoT3dr4eOWO",
  "river": "SAz9YHcvj6GT2YYXdXww",
  "liam": "TX3LPaxmHKxFdv7VOQHJ",
  "alice": "Xb7hH8MSUJpSbSDYk0k2",
  "matilda": "XrExE9yKIg1WjnnlVkGX",
  "will": "bIHbv24MWmeRgasZH58o",
  "jessica": "cgSgspJ2msm6clMCkdW9",
  "eric": "cjVigY5qzO86Huf0OWal",
  "brian": "nPczCjzI2devNBz1zQrb",
  "daniel": "onwK4e9ZLuTAKqWW03F9",
};

interface ElevenLabsRequest {
  text: string;
  voice_id?: string;
  voice_name?: string;
  model_id?: string;
  stability?: number;
  similarity_boost?: number;
  speed?: number;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json() as ElevenLabsRequest;
    const { 
      text, 
      voice_id,
      voice_name = "george", // Default to George - clear Brazilian Portuguese
      model_id = "eleven_multilingual_v2",
      stability = 0.5,
      similarity_boost = 0.75,
      speed = 1.0
    } = body;

    if (!text) {
      throw new Error("Text is required");
    }

    // Get API key (try connector key first, then regular key)
    const ELEVEN_LABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY_1") || Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVEN_LABS_API_KEY) {
      throw new Error("ElevenLabs API key not configured");
    }

    // Resolve voice ID from name or use provided ID
    const resolvedVoiceId = voice_id || VOICE_IDS[voice_name.toLowerCase()] || VOICE_IDS["george"];

    console.log(`[ElevenLabs TTS] Generating speech for ${text.length} chars with voice ${resolvedVoiceId}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": ELEVEN_LABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: model_id,
          voice_settings: {
            stability: stability,
            similarity_boost: similarity_boost,
            style: 0.5,
            use_speaker_boost: true,
            speed: speed
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ElevenLabs TTS] API error: ${response.status} - ${errorText}`);
      throw new Error(`ElevenLabs API error: ${errorText}`);
    }

    // Get audio as ArrayBuffer and encode to base64 properly
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = arrayBufferToBase64(arrayBuffer);

    console.log(`[ElevenLabs TTS] Successfully generated ${arrayBuffer.byteLength} bytes of audio`);

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        contentType: "audio/mpeg",
        voiceId: resolvedVoiceId,
        textLength: text.length
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[ElevenLabs TTS] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
