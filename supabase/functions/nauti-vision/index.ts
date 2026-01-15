import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Nauti Vision - Multimodal AI Analysis
 * Analyzes images and documents using Gemini Vision
 * Operations: analyze-image, ocr-document, equipment-inspection, certificate-validation
 */

type VisionOperation = 
  | "analyze-image" 
  | "ocr-document" 
  | "equipment-inspection" 
  | "certificate-validation"
  | "damage-assessment";

interface RequestPayload {
  operation: VisionOperation;
  imageBase64?: string;
  imageUrl?: string;
  mimeType?: string;
  context?: Record<string, unknown>;
  prompt?: string;
}

const VISION_PROMPTS: Record<VisionOperation, string> = {
  "analyze-image": `Você é um especialista em análise de imagens marítimas.
Analise a imagem fornecida e descreva:
- O que você vê na imagem
- Elementos relevantes para operações marítimas
- Potenciais problemas ou riscos identificados
- Recomendações baseadas na análise
Responda em português de forma detalhada e profissional.`,

  "ocr-document": `Você é um especialista em OCR de documentos marítimos.
Extraia TODO o texto visível da imagem/documento fornecido.
Organize as informações de forma estruturada:
- Tipo de documento identificado
- Campos e valores extraídos
- Datas importantes
- Números de registro/certificação
- Status (válido/expirado se aplicável)
Retorne em formato JSON estruturado.`,

  "equipment-inspection": `Você é um inspetor técnico de equipamentos marítimos.
Analise a imagem do equipamento e forneça:
- Identificação do equipamento
- Estado visual (excelente/bom/regular/crítico)
- Sinais de desgaste, corrosão ou danos
- Manutenção recomendada
- Urgência da ação (1-5)
- Estimativa de vida útil restante
Retorne em formato JSON para integração com MMI.`,

  "certificate-validation": `Você é um especialista em certificados marítimos (STCW, MLC, ISM).
Analise o certificado na imagem e extraia:
- Tipo de certificado
- Nome do titular
- Número do certificado
- Data de emissão
- Data de validade
- Autoridade emissora
- Status de validade
- Limitações ou endossos
Retorne em formato JSON para registro no sistema.`,

  "damage-assessment": `Você é um perito em avaliação de danos marítimos.
Analise a imagem e forneça:
- Descrição do dano observado
- Severidade (leve/moderado/grave/crítico)
- Causa provável
- Impacto operacional
- Ação corretiva recomendada
- Estimativa de custo de reparo (se possível)
- Prazo recomendado para correção
Retorne em formato JSON para relatório de incidentes.`,
};

async function analyzeWithVision(
  operation: VisionOperation,
  imageData: string,
  mimeType: string,
  additionalPrompt?: string
): Promise<Response> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const systemPrompt = VISION_PROMPTS[operation];
  const userPrompt = additionalPrompt 
    ? `${systemPrompt}\n\nContexto adicional: ${additionalPrompt}` 
    : systemPrompt;

  // Build message with image
  const messages = [
    {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${imageData}`,
          },
        },
        {
          type: "text",
          text: userPrompt,
        },
      ],
    },
  ];

  console.log(`[nautilus-vision] Processing ${operation} with ${mimeType}`);

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash", // Gemini has excellent vision capabilities
      messages,
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  return response;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: RequestPayload = await req.json();
    const { operation, imageBase64, imageUrl, mimeType = "image/jpeg", context = {}, prompt } = payload;

    if (!operation) {
      return new Response(
        JSON.stringify({ error: "Operation is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get image data
    let imageData = imageBase64;
    
    if (!imageData && imageUrl) {
      // Fetch image from URL
      console.log(`[nautilus-vision] Fetching image from URL: ${imageUrl}`);
      const imageResponse = await fetch(imageUrl);
      const arrayBuffer = await imageResponse.arrayBuffer();
      imageData = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    }

    if (!imageData) {
      return new Response(
        JSON.stringify({ error: "Image data (imageBase64 or imageUrl) is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await analyzeWithVision(operation, imageData, mimeType, prompt);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Vision AI error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Vision AI error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    // Try to parse structured JSON response
    let structured = null;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                        content.match(/\{[\s\S]*\}/) ||
                        content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        structured = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
    } catch {
      // Keep as text if JSON parsing fails
    }

    console.log(`[nautilus-vision] ${operation} completed successfully`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        operation, 
        analysis: content,
        structured,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("nautilus-vision error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
