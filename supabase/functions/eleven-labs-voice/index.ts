/// <reference path="../deno-ambient.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ElevenLabsRequest {
  text: string;
  voice_id?: string;
  model_id?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json() as ElevenLabsRequest;
    const { text, voice_id = "Aria", model_id = "eleven_multilingual_v2" } = body;

    if (!text) {
      throw new Error("Text is required");
    }

    const ELEVEN_LABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVEN_LABS_API_KEY) {
      throw new Error("ElevenLabs API key not configured");
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
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
          stability: 0.5,
          similarity_boost: 0.5
        }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs API error: ${error}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        contentType: "audio/mpeg"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("ElevenLabs TTS error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
