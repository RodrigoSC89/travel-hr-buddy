import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Helper function to encode array buffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * ElevenLabs Voice Assistant - Advanced Voice AI
 * Operations: text-to-speech, speech-to-text, voice-command
 */

type VoiceOperation = "tts" | "stt" | "command";

interface RequestPayload {
  operation: VoiceOperation;
  text?: string;
  audio?: string; // base64 encoded audio
  voiceId?: string;
  language?: string;
}

// Default voice IDs from ElevenLabs
const VOICES = {
  george: "JBFqnCBsd6RMkjVDRZzb", // British male
  sarah: "EXAVITQu4vr4xnSDxMaL", // American female
  roger: "CwhRBWXzGAHq8TQ4Fs17", // American male
  laura: "FGY2WhTYpPnrIDTdsKH5", // American female
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY") || Deno.env.get("ELEVENLABS_API_KEY_1");
  
  if (!ELEVENLABS_API_KEY) {
    console.error("ElevenLabs API key not configured");
    return new Response(
      JSON.stringify({ error: "ElevenLabs API key not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const payload: RequestPayload = await req.json();
    const { operation, text, audio, voiceId = VOICES.george, language = "pt" } = payload;

    console.log(`[elevenlabs-voice] Operation: ${operation}`);

    switch (operation) {
      case "tts": {
        // Text to Speech
        if (!text) {
          return new Response(
            JSON.stringify({ error: "Text is required for TTS" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            method: "POST",
            headers: {
              "xi-api-key": ELEVENLABS_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text,
              model_id: "eleven_multilingual_v2",
              output_format: "mp3_44100_128",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0.5,
                use_speaker_boost: true,
              },
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("ElevenLabs TTS error:", response.status, errorText);
          return new Response(
            JSON.stringify({ error: "TTS generation failed", details: errorText }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const audioBuffer = await response.arrayBuffer();
        const audioBase64 = arrayBufferToBase64(audioBuffer);

        return new Response(
          JSON.stringify({ 
            success: true,
            operation: "tts",
            audioContent: audioBase64,
            mimeType: "audio/mpeg",
            voiceId,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "stt": {
        // Speech to Text (using ElevenLabs Scribe)
        if (!audio) {
          return new Response(
            JSON.stringify({ error: "Audio is required for STT" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Decode base64 audio
        const audioBytes = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
        const audioBlob = new Blob([audioBytes], { type: "audio/webm" });

        const formData = new FormData();
        formData.append("file", audioBlob, "audio.webm");
        formData.append("model_id", "scribe_v1");
        formData.append("language_code", language === "pt" ? "por" : "eng");

        const response = await fetch(
          "https://api.elevenlabs.io/v1/speech-to-text",
          {
            method: "POST",
            headers: {
              "xi-api-key": ELEVENLABS_API_KEY,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("ElevenLabs STT error:", response.status, errorText);
          return new Response(
            JSON.stringify({ error: "STT transcription failed", details: errorText }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const result = await response.json();

        return new Response(
          JSON.stringify({ 
            success: true,
            operation: "stt",
            text: result.text,
            words: result.words,
            language,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "command": {
        // Voice command processing - combines STT + AI + TTS
        if (!audio && !text) {
          return new Response(
            JSON.stringify({ error: "Audio or text is required for command" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let commandText = text;

        // If audio provided, transcribe first
        if (audio && !text) {
          const audioBytes = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
          const audioBlob = new Blob([audioBytes], { type: "audio/webm" });

          const formData = new FormData();
          formData.append("file", audioBlob, "audio.webm");
          formData.append("model_id", "scribe_v1");
          formData.append("language_code", "por");

          const sttResponse = await fetch(
            "https://api.elevenlabs.io/v1/speech-to-text",
            {
              method: "POST",
              headers: { "xi-api-key": ELEVENLABS_API_KEY },
              body: formData,
            }
          );

          if (sttResponse.ok) {
            const sttResult = await sttResponse.json();
            commandText = sttResult.text;
          }
        }

        if (!commandText) {
          return new Response(
            JSON.stringify({ error: "Could not transcribe audio" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Process command with Lovable AI
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        
        let aiResponse = "Desculpe, não consegui processar seu comando.";
        
        if (LOVABLE_API_KEY) {
          const aiResult = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { 
                  role: "system", 
                  content: `Você é o assistente de voz do Nautilus One, um sistema de gestão marítima.
Responda de forma concisa e direta, em português do Brasil.
Você pode ajudar com:
- Navegação no sistema (ex: "ir para manutenção", "abrir tripulação")
- Consultas sobre embarcações, tripulação, manutenção
- Status do sistema e alertas
- Comandos operacionais

Responda em no máximo 2 frases.`
                },
                { role: "user", content: commandText }
              ],
              temperature: 0.7,
            }),
          });

          if (aiResult.ok) {
            const aiData = await aiResult.json();
            aiResponse = aiData.choices?.[0]?.message?.content || aiResponse;
          }
        }

        // Generate TTS response
        const ttsResponse = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            method: "POST",
            headers: {
              "xi-api-key": ELEVENLABS_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: aiResponse,
              model_id: "eleven_multilingual_v2",
              output_format: "mp3_44100_128",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
              },
            }),
          }
        );

        let audioContent = null;
        if (ttsResponse.ok) {
          const audioBuffer = await ttsResponse.arrayBuffer();
          audioContent = arrayBufferToBase64(audioBuffer);
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            operation: "command",
            userText: commandText,
            aiResponse,
            audioContent,
            mimeType: "audio/mpeg",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown operation: ${operation}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

  } catch (error) {
    console.error("elevenlabs-voice error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
