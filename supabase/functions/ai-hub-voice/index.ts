/**
 * AI Hub Voice - ElevenLabs HD Voice for AI Hub
 * PATCH AI-REVOLUTION
 * 
 * Provides HD voice synthesis for all 16 AI modules
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Voice mapping by module personality
const MODULE_VOICES: Record<string, string> = {
  peotram: "onwK4e9ZLuTAKqWW03F9",    // Daniel - Professional male
  peodp: "nPczCjzI2devNBz1zQrb",       // Brian - Technical male
  command: "JBFqnCBsd6RMkjVDRZzb",     // George - Authoritative
  aria: "EXAVITQu4vr4xnSDxMaL",        // Sarah - Friendly female (ARIA default)
  bunker: "TX3LPaxmHKxFdv7VOQHJ",      // Liam - Clear male
  safety: "iP95p4xoKVk53GoZ742B",      // Chris - Calm male
  compliance: "cgSgspJ2msm6clMCkdW9",  // Eric - Professional
  fleet: "N2lVS1w4EtoT3dr4eOWO",       // Callum - British male
  crew: "FGY2WhTYpPnrIDTdsKH5",        // Laura - Warm female
  weather: "SAz9YHcvj6GT2YYXdXww",     // River - Clear
  maintenance: "bIHbv24MWmeRgasZH58o", // Will - Technical
  cargo: "CwhRBWXzGAHq8TQ4Fs17",       // Roger - Deep male
  training: "XrExE9yKIg1WjnnlVkGX",    // Matilda - Educator female
  voyage: "Xb7hH8MSUJpSbSDYk0k2",      // Alice - Pleasant female
  charter: "pqHfZKP75CvOlQylNhV4",     // Bill - Business male
  mlc: "pFZP5JQG7iQjIQuC4Bku",         // Lily - Professional female
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, module = "command", voiceId } = await req.json();

    if (!text) {
      throw new Error("Text is required");
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY not configured");
    }

    // Use custom voiceId or get module-specific voice
    const voice = voiceId || MODULE_VOICES[module] || MODULE_VOICES.command;

    console.log(`[AI-HUB-VOICE] Module: ${module}, Voice: ${voice}, Text length: ${text.length}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
            speed: 1.0,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[AI-HUB-VOICE] ElevenLabs error:", response.status, errorText);
      throw new Error(`ElevenLabs error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    // Convert to base64 safely for large buffers
    const uint8Array = new Uint8Array(audioBuffer);
    let binary = '';
    const chunkSize = 32768;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64Audio = btoa(binary);

    return new Response(
      JSON.stringify({ audioContent: base64Audio, voice, module }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[AI-HUB-VOICE] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
