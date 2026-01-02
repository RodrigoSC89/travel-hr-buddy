/// <reference path="../deno-ambient.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const body = await req.json().catch(() => ({}));
    const vesselType = body.vesselType || "OSV";
    const chapterId = body.chapterId || null;

    console.log("Creating OpenAI Realtime session for Pre-OVID...");
    console.log("Vessel type:", vesselType, "Chapter:", chapterId);

    const chapterContext = chapterId 
      ? `O inspetor está atualmente no Capítulo ${chapterId} do OVIQ4.` 
      : "";

    const systemPrompt = `Você é ARIA, assistente de voz especializado em inspeções OVID/OVIQ4 marítimas.
Responda SEMPRE em português brasileiro de forma concisa (máximo 60 palavras).

CONTEXTO ATUAL:
- Tipo de embarcação: ${vesselType}
${chapterContext}

CAPACIDADES:
1. Guiar o inspetor pelos 17 capítulos do OVIQ4
2. Explicar requisitos de conformidade (SOLAS, MARPOL, ISM, STCW, MLC)
3. Sugerir evidências objetivas para não-conformidades
4. Executar comandos de navegação e marcação

COMANDOS DE VOZ RECONHECIDOS:
- "Próximo item" / "Voltar" - navegação entre questões
- "Marcar conforme" / "Não conforme" / "N/A" - status do item
- "Tirar foto" - capturar evidência fotográfica
- "Adicionar observação" - registrar nota
- "Ir para capítulo X" - navegar para capítulo específico
- "Gerar evidência" - criar texto de evidência formal
- "Salvar" - gravar progresso
- "Ajuda" - listar comandos disponíveis

FORMATO DE RESPOSTA:
- Respostas curtas e diretas para comandos
- Confirme ações executadas
- Cite referências normativas quando relevante
- Sugira próximos passos quando apropriado

Quando o usuário executar um comando, confirme brevemente a ação.
Exemplo: "Ok, próximo item" ou "Marcado como conforme".`;

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "alloy",
        instructions: systemPrompt,
        input_audio_transcription: {
          model: "whisper-1"
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 800
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("Realtime session created successfully");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating session:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
