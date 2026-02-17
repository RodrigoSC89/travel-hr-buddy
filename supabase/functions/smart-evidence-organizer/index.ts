import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface ParseRequest {
  action: "parse_checklist" | "match_evidence" | "generate_responses";
  pack_id?: string;
  framework: string;
  checklist_text?: string;
  vessel_id?: string;
  user_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const body: ParseRequest = await req.json();
    const { action } = body;

    if (action === "parse_checklist") {
      return await parseChecklist(supabase, body);
    } else if (action === "match_evidence") {
      return await matchEvidence(supabase, body);
    } else if (action === "generate_responses") {
      return await generateResponses(supabase, body);
    } else if (action === "rematch_gaps") {
      return await rematchGaps(supabase, body);
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Smart Evidence Organizer error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Step 1: Parse checklist text into elements and items using AI
 */
async function parseChecklist(supabase: any, body: ParseRequest) {
  const { checklist_text, framework, vessel_id, user_id, pack_id } = body;

  if (!checklist_text || !framework || !user_id) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Use AI to parse the checklist into structured elements and items
  const parsePrompt = `Você é um especialista em auditorias marítimas ${framework.toUpperCase()}.
Analise o texto do checklist/lista de verificação abaixo e extraia a estrutura hierárquica.

REGRAS IMPORTANTES:
1. Identifique cada ELEMENTO (seção principal, categoria, capítulo)
2. Para cada elemento, identifique os ITENS individuais (requisitos, perguntas, verificações)
3. Classifique se cada item é CRÍTICO (impacta segurança/compliance diretamente)
4. Retorne usando a tool function fornecida

TEXTO DO CHECKLIST:
${checklist_text.substring(0, 15000)}`;

  const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: `Você é um parser especializado em checklists de auditoria marítima (${framework.toUpperCase()}). Extraia elementos e itens de forma estruturada.` },
        { role: "user", content: parsePrompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "structure_checklist",
            description: "Estrutura o checklist em elementos e itens hierárquicos",
            parameters: {
              type: "object",
              properties: {
                elements: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      element_number: { type: "number" },
                      element_code: { type: "string" },
                      element_name: { type: "string" },
                      element_description: { type: "string" },
                      items: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            item_number: { type: "string" },
                            item_code: { type: "string" },
                            item_text: { type: "string" },
                            requirement_description: { type: "string" },
                            is_critical: { type: "boolean" },
                            evidence_keywords: {
                              type: "array",
                              items: { type: "string" },
                              description: "Palavras-chave para buscar evidências na biblioteca de documentos"
                            },
                          },
                          required: ["item_number", "item_text"],
                        },
                      },
                    },
                    required: ["element_number", "element_name", "items"],
                  },
                },
              },
              required: ["elements"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "structure_checklist" } },
    }),
  });

  if (!aiResponse.ok) {
    const errText = await aiResponse.text();
    console.error("AI parse error:", aiResponse.status, errText);
    if (aiResponse.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Tente novamente em alguns segundos." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResponse.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    throw new Error(`AI gateway error: ${aiResponse.status}`);
  }

  const aiData = await aiResponse.json();
  const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
  
  if (!toolCall) {
    throw new Error("AI did not return structured data");
  }

  const parsed = JSON.parse(toolCall.function.arguments);
  const elements = parsed.elements || [];

  // Create or update the pack
  let currentPackId = pack_id;
  if (!currentPackId) {
    const { data: pack, error: packError } = await supabase
      .from("audit_evidence_packs")
      .insert({
        created_by: user_id,
        framework,
        title: `Auditoria ${framework.toUpperCase()} ${new Date().getFullYear()}`,
        vessel_id: vessel_id || null,
        status: "parsed",
        total_elements: elements.length,
        total_items: elements.reduce((acc: number, el: any) => acc + (el.items?.length || 0), 0),
      })
      .select("id")
      .single();

    if (packError) throw packError;
    currentPackId = pack.id;
  } else {
    await supabase
      .from("audit_evidence_packs")
      .update({
        status: "parsed",
        total_elements: elements.length,
        total_items: elements.reduce((acc: number, el: any) => acc + (el.items?.length || 0), 0),
      })
      .eq("id", currentPackId);
  }

  // Insert elements and items
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const { data: element, error: elError } = await supabase
      .from("audit_evidence_elements")
      .insert({
        pack_id: currentPackId,
        element_number: el.element_number || i + 1,
        element_code: el.element_code || `E${i + 1}`,
        element_name: el.element_name,
        element_description: el.element_description,
        total_items: el.items?.length || 0,
        sort_order: i,
        metadata: { evidence_keywords: el.items?.flatMap((it: any) => it.evidence_keywords || []) },
      })
      .select("id")
      .single();

    if (elError) {
      console.error("Element insert error:", elError);
      continue;
    }

    if (el.items?.length) {
      const itemRows = el.items.map((item: any, j: number) => ({
        element_id: element.id,
        pack_id: currentPackId,
        item_number: item.item_number || `${i + 1}.${j + 1}`,
        item_code: item.item_code,
        item_text: item.item_text,
        requirement_description: item.requirement_description,
        is_critical: item.is_critical || false,
        evidence_status: "pending",
        sort_order: j,
        metadata: { evidence_keywords: item.evidence_keywords || [] },
      }));

      const { error: itemsError } = await supabase
        .from("audit_evidence_items")
        .insert(itemRows);

      if (itemsError) console.error("Items insert error:", itemsError);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      pack_id: currentPackId,
      elements_count: elements.length,
      items_count: elements.reduce((acc: number, el: any) => acc + (el.items?.length || 0), 0),
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

/**
 * Step 2: Search document library and match evidence to items
 */
async function matchEvidence(supabase: any, body: ParseRequest) {
  const { pack_id } = body;
  if (!pack_id) {
    return new Response(JSON.stringify({ error: "pack_id required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Update status
  await supabase.from("audit_evidence_packs").update({ status: "matching" }).eq("id", pack_id);

  // Get all items with their keywords
  const { data: items, error: itemsError } = await supabase
    .from("audit_evidence_items")
    .select("id, item_text, requirement_description, metadata, element_id")
    .eq("pack_id", pack_id)
    .order("sort_order");

  if (itemsError) throw itemsError;

  // Get ALL documents from the library for matching
  const { data: documents } = await supabase
    .from("ai_documents")
    .select("id, file_name, title, category, ocr_text, description, file_type, storage_path")
    .limit(500);

  const docList = documents || [];

  // Build a condensed document catalog for AI matching
  const docCatalog = docList.map((d: any) => ({
    id: d.id,
    name: d.file_name || d.title,
    category: d.category,
    type: d.file_type,
    excerpt: (d.ocr_text || d.description || "").substring(0, 200),
  }));

  // Process items in batches of 10
  let matchedCount = 0;
  let unmatchedCount = 0;
  let partialCount = 0;
  const batchSize = 10;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    const matchPrompt = `Você é um especialista em auditorias marítimas. Para cada item de verificação abaixo, identifique quais documentos da biblioteca são evidências aplicáveis.

ITENS DE VERIFICAÇÃO:
${batch.map((item: any, idx: number) => `[${idx}] ID:${item.id} | ${item.item_text}${item.requirement_description ? ` | Req: ${item.requirement_description}` : ""}`).join("\n")}

BIBLIOTECA DE DOCUMENTOS DISPONÍVEIS:
${docCatalog.map((d: any) => `DOC_ID:${d.id} | ${d.name} | Cat:${d.category || "N/A"} | ${d.excerpt}`).join("\n")}

Para cada item, encontre os documentos mais relevantes. Se não houver documento adequado, sugira qual tipo de documento/evidência seria necessário.`;

    try {
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "Você é um sistema de matching de evidências para auditorias marítimas. Faça correspondência precisa entre requisitos e documentos disponíveis." },
            { role: "user", content: matchPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "match_items_to_documents",
                description: "Match audit items to available documents",
                parameters: {
                  type: "object",
                  properties: {
                    matches: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          item_id: { type: "string" },
                          status: { type: "string", enum: ["found", "partial", "not_found"] },
                          matched_documents: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                document_id: { type: "string" },
                                confidence: { type: "number" },
                                reason: { type: "string" },
                              },
                              required: ["document_id", "confidence", "reason"],
                            },
                          },
                          suggestion: { type: "string", description: "Sugestão de evidência quando não encontrada" },
                          ai_response: { type: "string", description: "Resposta robusta para este item da auditoria" },
                        },
                        required: ["item_id", "status"],
                      },
                    },
                  },
                  required: ["matches"],
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "match_items_to_documents" } },
        }),
      });

      if (!aiResponse.ok) {
        console.error("AI match error:", aiResponse.status);
        continue;
      }

      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) continue;

      const result = JSON.parse(toolCall.function.arguments);
      const matches = result.matches || [];

      for (const match of matches) {
        // Update item status and AI response
        await supabase
          .from("audit_evidence_items")
          .update({
            evidence_status: match.status,
            ai_response: match.ai_response || null,
            ai_suggestion: match.suggestion || null,
            ai_confidence: match.matched_documents?.[0]?.confidence || null,
          })
          .eq("id", match.item_id);

        // Insert evidence matches
        if (match.matched_documents?.length) {
          for (const doc of match.matched_documents) {
            const foundDoc = docList.find((d: any) => d.id === doc.document_id);
            if (foundDoc) {
              await supabase.from("audit_evidence_matches").insert({
                item_id: match.item_id,
                pack_id,
                document_id: doc.document_id,
                document_title: foundDoc.file_name || foundDoc.title,
                document_type: foundDoc.file_type,
                document_path: foundDoc.storage_path,
                match_source: "ai",
                match_confidence: doc.confidence,
                match_reason: doc.reason,
              });
            }
          }
        }

        if (match.status === "found") matchedCount++;
        else if (match.status === "partial") partialCount++;
        else unmatchedCount++;
      }
    } catch (err) {
      console.error("Batch match error:", err);
    }
  }

  // Update element scores
  const { data: elements } = await supabase
    .from("audit_evidence_elements")
    .select("id")
    .eq("pack_id", pack_id);

  for (const el of (elements || [])) {
    const { data: elItems } = await supabase
      .from("audit_evidence_items")
      .select("evidence_status")
      .eq("element_id", el.id);

    const total = elItems?.length || 0;
    const found = elItems?.filter((i: any) => i.evidence_status === "found").length || 0;
    const partial = elItems?.filter((i: any) => i.evidence_status === "partial").length || 0;
    const notFound = elItems?.filter((i: any) => i.evidence_status === "not_found").length || 0;
    const score = total > 0 ? ((found + partial * 0.5) / total) * 100 : 0;

    await supabase
      .from("audit_evidence_elements")
      .update({
        matched_count: found,
        partial_count: partial,
        unmatched_count: notFound,
        compliance_score: Math.round(score * 100) / 100,
      })
      .eq("id", el.id);
  }

  // Update pack totals
  const overallScore = items.length > 0
    ? ((matchedCount + partialCount * 0.5) / items.length) * 100
    : 0;

  await supabase
    .from("audit_evidence_packs")
    .update({
      status: "completed",
      matched_items: matchedCount,
      unmatched_items: unmatchedCount,
      partial_items: partialCount,
      overall_score: Math.round(overallScore * 100) / 100,
    })
    .eq("id", pack_id);

  return new Response(
    JSON.stringify({
      success: true,
      matched: matchedCount,
      partial: partialCount,
      unmatched: unmatchedCount,
      overall_score: Math.round(overallScore * 100) / 100,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

/**
 * Step 3: Generate detailed responses for each item
 */
async function generateResponses(supabase: any, body: ParseRequest) {
  const { pack_id } = body;
  if (!pack_id) {
    return new Response(JSON.stringify({ error: "pack_id required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get items without responses
  const { data: items } = await supabase
    .from("audit_evidence_items")
    .select("id, item_text, requirement_description, evidence_status, ai_suggestion")
    .eq("pack_id", pack_id)
    .is("ai_response", null)
    .limit(50);

  if (!items?.length) {
    return new Response(
      JSON.stringify({ success: true, message: "All items already have responses" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get pack info
  const { data: pack } = await supabase
    .from("audit_evidence_packs")
    .select("framework")
    .eq("id", pack_id)
    .single();

  const framework = pack?.framework || "general";

  for (let i = 0; i < items.length; i += 5) {
    const batch = items.slice(i, i + 5);
    
    const prompt = `Gere respostas robustas e profissionais para cada item de auditoria ${framework.toUpperCase()} abaixo. 
As respostas devem ser detalhadas, citar normas aplicáveis e demonstrar conformidade.

${batch.map((item: any, idx: number) => `[${idx}] ${item.item_text}
Status: ${item.evidence_status}
${item.ai_suggestion ? `Sugestão: ${item.ai_suggestion}` : ""}`).join("\n\n")}`;

    try {
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: `Especialista em compliance marítimo ${framework.toUpperCase()}. Gere respostas de auditoria em PT-BR.` },
            { role: "user", content: prompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_audit_responses",
                description: "Generate audit responses for each item",
                parameters: {
                  type: "object",
                  properties: {
                    responses: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          index: { type: "number" },
                          response: { type: "string", description: "Resposta robusta para o auditor" },
                        },
                        required: ["index", "response"],
                      },
                    },
                  },
                  required: ["responses"],
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "generate_audit_responses" } },
        }),
      });

      if (!aiResponse.ok) continue;

      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) continue;

      const result = JSON.parse(toolCall.function.arguments);
      for (const resp of (result.responses || [])) {
        const item = batch[resp.index];
        if (item) {
          await supabase
            .from("audit_evidence_items")
            .update({ ai_response: resp.response })
            .eq("id", item.id);
        }
      }
    } catch (err) {
      console.error("Generate response error:", err);
    }
  }

  return new Response(
    JSON.stringify({ success: true, processed: items.length }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

/**
 * Step 4: Re-match only gap items (not_found or partial)
 */
async function rematchGaps(supabase: any, body: ParseRequest) {
  const { pack_id, framework } = body;
  if (!pack_id) {
    return new Response(JSON.stringify({ error: "pack_id required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get only gap items
  const { data: gapItems } = await supabase
    .from("audit_evidence_items")
    .select("id, item_text, requirement_description, metadata, element_id, evidence_status")
    .eq("pack_id", pack_id)
    .in("evidence_status", ["not_found", "partial", "pending"])
    .order("sort_order");

  if (!gapItems?.length) {
    return new Response(
      JSON.stringify({ success: true, message: "Nenhum gap encontrado", rematched: 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get ALL documents (fresh scan)
  const { data: documents } = await supabase
    .from("ai_documents")
    .select("id, file_name, title, category, ocr_text, description, file_type, storage_path")
    .limit(500);

  const docList = documents || [];
  const docCatalog = docList.map((d: any) => ({
    id: d.id,
    name: d.file_name || d.title,
    category: d.category,
    type: d.file_type,
    excerpt: (d.ocr_text || d.description || "").substring(0, 200),
  }));

  let improvedCount = 0;
  const batchSize = 10;

  for (let i = 0; i < gapItems.length; i += batchSize) {
    const batch = gapItems.slice(i, i + batchSize);

    const matchPrompt = `Você é um especialista em auditorias marítimas. Estes itens NÃO tiveram evidência encontrada anteriormente. Faça uma busca MAIS APROFUNDADA, considerando sinônimos, documentos relacionados indiretamente e evidências parciais.

ITENS COM GAP:
${batch.map((item: any, idx: number) => `[${idx}] ID:${item.id} | Status atual: ${item.evidence_status} | ${item.item_text}`).join("\n")}

BIBLIOTECA DE DOCUMENTOS:
${docCatalog.map((d: any) => `DOC_ID:${d.id} | ${d.name} | Cat:${d.category || "N/A"} | ${d.excerpt}`).join("\n")}

IMPORTANTE: Seja mais flexível no matching. Considere evidências indiretas e parciais.`;

    try {
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "Re-matching expert. Busca mais flexível para evidências de auditoria marítima." },
            { role: "user", content: matchPrompt },
          ],
          tools: [{
            type: "function",
            function: {
              name: "match_items_to_documents",
              description: "Match gap items to documents with deeper analysis",
              parameters: {
                type: "object",
                properties: {
                  matches: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        item_id: { type: "string" },
                        status: { type: "string", enum: ["found", "partial", "not_found"] },
                        matched_documents: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              document_id: { type: "string" },
                              confidence: { type: "number" },
                              reason: { type: "string" },
                            },
                            required: ["document_id", "confidence", "reason"],
                          },
                        },
                        suggestion: { type: "string" },
                        ai_response: { type: "string" },
                      },
                      required: ["item_id", "status"],
                    },
                  },
                },
                required: ["matches"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "match_items_to_documents" } },
        }),
      });

      if (!aiResponse.ok) continue;

      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) continue;

      const result = JSON.parse(toolCall.function.arguments);
      for (const match of (result.matches || [])) {
        const originalItem = batch.find((b: any) => b.id === match.item_id);
        const improved = originalItem && (
          (originalItem.evidence_status === "not_found" && match.status !== "not_found") ||
          (originalItem.evidence_status === "partial" && match.status === "found")
        );

        if (improved) improvedCount++;

        await supabase
          .from("audit_evidence_items")
          .update({
            evidence_status: match.status,
            ai_response: match.ai_response || null,
            ai_suggestion: match.suggestion || null,
          })
          .eq("id", match.item_id);

        if (match.matched_documents?.length) {
          for (const doc of match.matched_documents) {
            const foundDoc = docList.find((d: any) => d.id === doc.document_id);
            if (foundDoc) {
              // Delete old AI matches for this item before inserting new ones
              await supabase.from("audit_evidence_matches")
                .delete()
                .eq("item_id", match.item_id)
                .eq("match_source", "ai");

              await supabase.from("audit_evidence_matches").insert({
                item_id: match.item_id,
                pack_id,
                document_id: doc.document_id,
                document_title: foundDoc.file_name || foundDoc.title,
                document_type: foundDoc.file_type,
                document_path: foundDoc.storage_path,
                match_source: "ai",
                match_confidence: doc.confidence,
                match_reason: doc.reason,
              });
            }
          }
        }
      }
    } catch (err) {
      console.error("Rematch batch error:", err);
    }
  }

  // Recalculate element scores and pack totals
  const { data: allItems } = await supabase
    .from("audit_evidence_items")
    .select("id, evidence_status, element_id")
    .eq("pack_id", pack_id);

  const { data: elements } = await supabase
    .from("audit_evidence_elements")
    .select("id")
    .eq("pack_id", pack_id);

  for (const el of (elements || [])) {
    const elItems = (allItems || []).filter((i: any) => i.element_id === el.id);
    const total = elItems.length;
    const found = elItems.filter((i: any) => i.evidence_status === "found").length;
    const partial = elItems.filter((i: any) => i.evidence_status === "partial").length;
    const notFound = elItems.filter((i: any) => i.evidence_status === "not_found").length;
    const score = total > 0 ? ((found + partial * 0.5) / total) * 100 : 0;

    await supabase
      .from("audit_evidence_elements")
      .update({ matched_count: found, partial_count: partial, unmatched_count: notFound, compliance_score: Math.round(score * 100) / 100 })
      .eq("id", el.id);
  }

  const totalItems = (allItems || []).length;
  const totalFound = (allItems || []).filter((i: any) => i.evidence_status === "found").length;
  const totalPartial = (allItems || []).filter((i: any) => i.evidence_status === "partial").length;
  const totalNotFound = (allItems || []).filter((i: any) => i.evidence_status === "not_found").length;
  const overallScore = totalItems > 0 ? ((totalFound + totalPartial * 0.5) / totalItems) * 100 : 0;

  await supabase
    .from("audit_evidence_packs")
    .update({ matched_items: totalFound, partial_items: totalPartial, unmatched_items: totalNotFound, overall_score: Math.round(overallScore * 100) / 100 })
    .eq("id", pack_id);

  return new Response(
    JSON.stringify({ success: true, gaps_processed: gapItems.length, improved: improvedCount, new_score: Math.round(overallScore * 100) / 100 }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
