/**
 * HR Document OCR - Digital Admission Document Processing
 * Extracts data from employee documents using AI vision
 * Validates CPF, RG, PIS and other documents
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// CPF validation
function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cpf[10]);
}

// PIS validation
function validatePIS(pis: string): boolean {
  pis = pis.replace(/\D/g, "");
  if (pis.length !== 11) return false;

  const weights = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(pis[i]) * weights[i];
  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? 0 : 11 - remainder;
  return checkDigit === parseInt(pis[10]);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { document_url, document_type, admission_id } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!document_url) {
      throw new Error("document_url is required");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Document type specific prompts
    const documentPrompts: Record<string, string> = {
      cpf: `Extraia do documento CPF:
- Número do CPF (11 dígitos)
- Nome completo
- Data de nascimento
Retorne JSON: { "cpf": "xxx.xxx.xxx-xx", "nome": "...", "nascimento": "DD/MM/YYYY" }`,
      
      rg: `Extraia do documento RG/Identidade:
- Número do RG
- Nome completo
- Data de nascimento
- Órgão emissor
- Data de emissão
Retorne JSON: { "rg": "...", "nome": "...", "nascimento": "DD/MM/YYYY", "orgao": "...", "emissao": "DD/MM/YYYY" }`,
      
      ctps: `Extraia da Carteira de Trabalho (CTPS):
- Número da CTPS
- Série
- UF
- Data de emissão
- Nome
- PIS/PASEP
Retorne JSON: { "numero": "...", "serie": "...", "uf": "...", "emissao": "DD/MM/YYYY", "nome": "...", "pis": "..." }`,
      
      comprovante_residencia: `Extraia do comprovante de residência:
- Endereço completo (rua, número, complemento)
- Bairro
- Cidade
- Estado
- CEP
- Nome do titular
Retorne JSON: { "rua": "...", "numero": "...", "complemento": "...", "bairro": "...", "cidade": "...", "estado": "XX", "cep": "XXXXX-XXX", "titular": "..." }`,
      
      certidao_nascimento: `Extraia da certidão de nascimento:
- Nome completo
- Data de nascimento
- Local de nascimento
- Nome do pai
- Nome da mãe
- Matrícula
Retorne JSON: { "nome": "...", "nascimento": "DD/MM/YYYY", "local": "...", "pai": "...", "mae": "...", "matricula": "..." }`,
      
      titulo_eleitor: `Extraia do título de eleitor:
- Número do título
- Zona eleitoral
- Seção
- Nome
- Data de nascimento
- Município
- UF
Retorne JSON: { "titulo": "...", "zona": "...", "secao": "...", "nome": "...", "nascimento": "DD/MM/YYYY", "municipio": "...", "uf": "XX" }`,
      
      certificado_reservista: `Extraia do certificado de reservista:
- Número do certificado
- Nome
- Região Militar
- Categoria
- Data de nascimento
Retorne JSON: { "numero": "...", "nome": "...", "regiao": "...", "categoria": "...", "nascimento": "DD/MM/YYYY" }`,
      
      default: `Extraia todas as informações relevantes deste documento de RH.
Identifique: nomes, datas, números de documentos, endereços.
Retorne como JSON estruturado.`,
    };

    const prompt = documentPrompts[document_type] || documentPrompts.default;

    // Call AI to extract data from document image
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `Você é um sistema de OCR especializado em documentos brasileiros de RH.
Extraia informações com precisão máxima.
Retorne APENAS JSON válido, sem markdown ou explicações.
Se não conseguir ler algum campo, use null.`
          },
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: document_url } }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI processing failed");
    }

    const aiResult = await response.json();
    const extractedText = aiResult.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let extractedData: any = {};
    try {
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse OCR result:", e);
    }

    // Validate extracted data
    const validationResults: Record<string, { valid: boolean; message: string }> = {};

    if (extractedData.cpf) {
      const cpfClean = extractedData.cpf.replace(/\D/g, "");
      validationResults.cpf = {
        valid: validateCPF(cpfClean),
        message: validateCPF(cpfClean) ? "CPF válido" : "CPF inválido - verificar dígitos"
      };
    }

    if (extractedData.pis) {
      const pisClean = extractedData.pis.replace(/\D/g, "");
      validationResults.pis = {
        valid: validatePIS(pisClean),
        message: validatePIS(pisClean) ? "PIS válido" : "PIS inválido - verificar dígitos"
      };
    }

    // Calculate confidence score
    const fieldsExtracted = Object.values(extractedData).filter(v => v !== null).length;
    const totalFields = Object.keys(extractedData).length;
    const confidenceScore = totalFields > 0 ? (fieldsExtracted / totalFields) * 100 : 0;

    // Update admission record if provided
    if (admission_id) {
      const { data: admission } = await supabase
        .from("hr_admissions")
        .select("ocr_results, documents_validated")
        .eq("id", admission_id)
        .single();

      const existingOCR = admission?.ocr_results || {};
      const existingValidations = admission?.documents_validated || {};

      await supabase.from("hr_admissions").update({
        ocr_results: {
          ...existingOCR,
          [document_type]: {
            extracted_at: new Date().toISOString(),
            data: extractedData,
            confidence: confidenceScore,
          }
        },
        documents_validated: {
          ...existingValidations,
          [document_type]: {
            validated_at: new Date().toISOString(),
            results: validationResults,
            all_valid: Object.values(validationResults).every(v => v.valid),
          }
        },
        ai_validation_score: confidenceScore,
      }).eq("id", admission_id);
    }

    return new Response(JSON.stringify({
      success: true,
      document_type,
      extracted_data: extractedData,
      validation_results: validationResults,
      confidence_score: confidenceScore,
      all_valid: Object.values(validationResults).every(v => v.valid),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[hr-document-ocr] Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
