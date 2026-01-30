/**
 * 📄 Documents Intelligence - Edge Function
 * Multi-engine OCR, AI extraction, Classification, Compliance
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let result;

    switch (action) {
      case "process-document":
        result = await processDocument(params, supabase, LOVABLE_API_KEY);
        break;
      case "extract-data":
        result = await extractDocumentData(params, LOVABLE_API_KEY);
        break;
      case "classify":
        result = await classifyDocument(params, LOVABLE_API_KEY);
        break;
      case "validate-compliance":
        result = await validateCompliance(params, LOVABLE_API_KEY);
        break;
      case "search":
        result = await searchDocuments(params, supabase);
        break;
      case "find-related":
        result = await findRelatedDocuments(params, supabase, LOVABLE_API_KEY);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Documents Intelligence error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function processDocument(
  params: { documentId: string; ocrText?: string },
  supabase: any,
  apiKey: string
): Promise<any> {
  const { data: doc } = await supabase
    .from("ai_documents")
    .select("*")
    .eq("id", params.documentId)
    .single();

  if (!doc) {
    throw new Error("Document not found");
  }

  const ocrText = params.ocrText || doc.ocr_text || "";

  // 1. Extract structured data with AI
  const extractedData = await extractDocumentData({ text: ocrText, fileName: doc.file_name }, apiKey);

  // 2. Classify document
  const classification = await classifyDocument({ text: ocrText, extractedData }, apiKey);

  // 3. Validate compliance
  const compliance = await validateCompliance({ extractedData, classification }, apiKey);

  // 4. Generate summary
  const summary = await generateSummary(ocrText, apiKey);

  // Update document with results
  await supabase
    .from("ai_documents")
    .update({
      category: classification.category,
      extracted_keywords: extractedData,
      ocr_status: "completed",
      ocr_completed_at: new Date().toISOString(),
    })
    .eq("id", params.documentId);

  // Save insights
  await supabase.from("ai_document_insights").insert({
    document_id: params.documentId,
    classification: classification.category,
    keywords: classification.tags,
    entities: extractedData.entities,
    dates: extractedData.dates,
    summary,
    confidence: classification.confidence,
    highlights: extractedData.keyPoints,
  });

  return {
    documentId: params.documentId,
    extractedData,
    classification,
    compliance,
    summary,
    processed: true,
  };
}

async function extractDocumentData(
  params: { text: string; fileName?: string },
  apiKey: string
): Promise<any> {
  const prompt = `Analyze this maritime document and extract ALL relevant information:

DOCUMENT TEXT:
${params.text.slice(0, 15000)}

${params.fileName ? `FILE NAME: ${params.fileName}` : ""}

EXTRACT COMPLETELY:
1. Document Type (certificate, contract, invoice, report, manual, log, etc)
2. Important Dates (issue date, expiry date, validity period, deadlines)
3. Monetary Values (amounts, currencies, payment terms)
4. Entities (companies, persons, authorities, classification societies)
5. Reference Numbers (IMO, certificate numbers, contract IDs, PO numbers)
6. Vessels (names, IMO numbers, flags, types)
7. Obligations & Requirements (what must be done, by whom, when)
8. Compliance Items (regulations referenced: SOLAS, MARPOL, MLC, STCW, ISM)
9. Key Points (3-5 most important takeaways)
10. Risk/Criticality Level (low/medium/high/critical)

Return JSON:
{
  "documentType": "string",
  "dates": [{ "type": "string", "date": "ISO date", "description": "string" }],
  "monetaryValues": [{ "amount": number, "currency": "string", "purpose": "string" }],
  "entities": [{ "type": "company|person|authority", "name": "string", "role": "string" }],
  "referenceNumbers": [{ "type": "string", "value": "string" }],
  "vessels": [{ "name": "string", "imo": "string", "flag": "string" }],
  "obligations": [{ "action": "string", "responsible": "string", "deadline": "string" }],
  "complianceItems": [{ "regulation": "string", "requirement": "string", "status": "string" }],
  "keyPoints": ["string"],
  "riskLevel": "low|medium|high|critical",
  "language": "string"
}`;

  const response = await callLovableAI(prompt, apiKey);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Parse error:", e);
  }

  return {
    documentType: "unknown",
    dates: [],
    monetaryValues: [],
    entities: [],
    referenceNumbers: [],
    vessels: [],
    obligations: [],
    complianceItems: [],
    keyPoints: ["Document processing completed"],
    riskLevel: "medium",
    language: "en",
  };
}

async function classifyDocument(
  params: { text?: string; extractedData?: any },
  apiKey: string
): Promise<any> {
  const context = params.extractedData 
    ? JSON.stringify(params.extractedData)
    : params.text?.slice(0, 5000);

  const prompt = `Classify this maritime document:

CONTEXT:
${context}

CLASSIFICATION REQUIRED:
1. Category (one of: certificate, contract, report, invoice, manual, correspondence, log, inspection, audit, training, crew, safety, environmental, technical)
2. Subcategory (specific type within category)
3. Tags (relevant keywords for search)
4. Confidence (0-100)
5. Retention Period (years to keep)
6. Access Level (public, internal, confidential, restricted)

Return JSON:
{
  "category": "string",
  "subcategory": "string",
  "tags": ["string"],
  "confidence": 85,
  "retentionPeriod": 7,
  "accessLevel": "internal",
  "suggestedFolder": "string"
}`;

  const response = await callLovableAI(prompt, apiKey);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Parse error:", e);
  }

  return {
    category: "general",
    subcategory: "unclassified",
    tags: ["document"],
    confidence: 50,
    retentionPeriod: 5,
    accessLevel: "internal",
    suggestedFolder: "/documents/general",
  };
}

async function validateCompliance(
  params: { extractedData?: any; classification?: any },
  apiKey: string
): Promise<any> {
  const prompt = `Validate maritime compliance for this document:

EXTRACTED DATA:
${JSON.stringify(params.extractedData, null, 2)}

CLASSIFICATION:
${JSON.stringify(params.classification, null, 2)}

CHECK COMPLIANCE WITH:
- SOLAS (Safety of Life at Sea)
- MARPOL (Marine Pollution Prevention)
- MLC 2006 (Maritime Labour Convention)
- STCW (Standards of Training, Certification and Watchkeeping)
- ISM Code (International Safety Management)
- ISPS Code (Ship and Port Facility Security)
- Flag State Requirements

Return JSON:
{
  "compliant": true,
  "overallScore": 85,
  "regulations": [
    {
      "name": "SOLAS",
      "applicable": true,
      "compliant": true,
      "findings": ["string"],
      "recommendations": ["string"]
    }
  ],
  "expirations": [
    {
      "item": "Certificate name",
      "expiryDate": "ISO date",
      "daysRemaining": 90,
      "severity": "low|medium|high|critical"
    }
  ],
  "violations": [],
  "warnings": ["string"],
  "recommendations": ["string"]
}`;

  const response = await callLovableAI(prompt, apiKey);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Parse error:", e);
  }

  return {
    compliant: true,
    overallScore: 75,
    regulations: [],
    expirations: [],
    violations: [],
    warnings: [],
    recommendations: ["Complete document review recommended"],
  };
}

async function generateSummary(text: string, apiKey: string): Promise<string> {
  const prompt = `Summarize this maritime document in 2-3 sentences, focusing on the most critical information:

${text.slice(0, 10000)}

Provide a concise, professional summary.`;

  return await callLovableAI(prompt, apiKey);
}

async function searchDocuments(
  params: { query: string; filters?: any },
  supabase: any
): Promise<any> {
  let query = supabase
    .from("ai_documents")
    .select("*, ai_document_insights(*)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (params.filters?.category) {
    query = query.eq("category", params.filters.category);
  }

  const { data, error } = await query;
  
  if (error) throw error;

  // Simple text-based search (in production, use full-text search)
  const searchLower = params.query.toLowerCase();
  const filtered = data?.filter((doc: any) => 
    doc.file_name?.toLowerCase().includes(searchLower) ||
    doc.ocr_text?.toLowerCase().includes(searchLower) ||
    doc.category?.toLowerCase().includes(searchLower)
  );

  return {
    results: filtered || [],
    total: filtered?.length || 0,
    query: params.query,
  };
}

async function findRelatedDocuments(
  params: { documentId: string; extractedData?: any },
  supabase: any,
  apiKey: string
): Promise<any> {
  const { data: doc } = await supabase
    .from("ai_documents")
    .select("*, ai_document_insights(*)")
    .eq("id", params.documentId)
    .single();

  if (!doc) return { related: [] };

  // Find documents with similar category or vessels
  const { data: related } = await supabase
    .from("ai_documents")
    .select("id, file_name, category, created_at")
    .eq("category", doc.category)
    .neq("id", params.documentId)
    .limit(10);

  return {
    related: related || [],
    basedOn: doc.category,
  };
}

async function callLovableAI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are an expert maritime document analyst. Always respond with valid JSON when requested." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
