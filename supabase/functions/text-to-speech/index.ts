/// <reference path="../deno-ambient.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json() as TTSRequest;
    const { text, voice = "alloy", speed = 1.0 } = body;

    if (!text) {
      throw new Error("Text is required");
    }

    console.log("Generating speech for:", text.substring(0, 50) + "...");

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: voice,
        response_format: "mp3",
        speed: speed,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI TTS error:", error);
      throw new Error(error.error?.message || "Failed to generate speech");
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    console.log("Speech generated successfully");

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        success: true,
        voice: voice,
        speed: speed
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Text-to-speech error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
