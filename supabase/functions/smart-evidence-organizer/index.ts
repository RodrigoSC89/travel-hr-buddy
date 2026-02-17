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

// ─── Framework-specific expert system prompts ─────────────────────────────
const FRAMEWORK_PROMPTS: Record<string, { systemPrompt: string; parserContext: string; responseContext: string }> = {
  peodp: {
    systemPrompt: `Você é o mais renomado especialista mundial em auditorias PEO-DP (Petrobras Equipment Operability - Dynamic Positioning).
Seu conhecimento abrange TODAS as normas aplicáveis:
- IMCA M 117 (The training and experience of key DP personnel)
- IMCA M 166 (Guidance on the design, selection, installation and use of DP systems)
- IMCA M 182 (DP Station Keeping Incidents)
- IMO MSC/Circ.645 (Guidelines for DP vessels)
- Petrobras N-2784 (Requisitos de DP)
- DPVOA Annual DP Trials guidelines
- Anexos A-O do PEO-DP 2026 da Petrobras
- MTS/IMCA DP ASOG (Activity Specific Operating Guidelines)
- FMECA (Failure Mode, Effects and Criticality Analysis)

Você conhece em detalhes cada ELEMENTO e ITEM do checklist PEO-DP, incluindo:
- Redundância de sistemas (power, thrusters, reference systems)
- Annual Trials requirements e relatórios
- WSOG/ASOG preparation
- Capability plots e footprint analysis
- Treinamento de DPOs (Dynamic Positioning Operators)
- Manutenção preventiva e registros de equipamentos DP`,
    parserContext: `Framework PEO-DP (Petrobras Dynamic Positioning). Identifique elementos conforme os Anexos A-O do PEO-DP:
- Anexo A: Sistema DP principal
- Anexo B: Sistemas de referência de posição  
- Anexo C: Sistemas de potência
- Anexo D: Thrusters e propulsão
- Anexo E: UPS e sistemas de emergência
- Anexo F: Comunicação e alarmes
- Anexo G: Treinamento de DPOs
- Anexo H: Procedimentos operacionais
- Anexo I: FMECA e redundância
- Anexo J: ASOG/WSOG
- Anexo K: Annual trials
- Anexo L: Manutenção preventiva
- Anexo M: Documentação e certificados
- Anexo N: Incidentes e relatórios
- Anexo O: Gestão de mudanças`,
    responseContext: `Ao gerar respostas para auditoria PEO-DP:
1. Cite normas IMCA e IMO aplicáveis (ex: "Conforme IMCA M 166, Seção 4.3...")
2. Referencie o Anexo PEO-DP específico
3. Use terminologia técnica de DP (redundancy, common point failure, worst case failure, etc.)
4. Mencione registros e evidências típicas (DP log, trial reports, maintenance records)
5. Seja EXTREMAMENTE preciso e detalhado — o auditor é especialista
6. A resposta deve convencer um auditor da Petrobras de que o vessel está 100% conforme`,
  },
  peotram: {
    systemPrompt: `Você é o mais renomado especialista mundial em auditorias PEOTRAM (Petrobras Equipment Operability - Trabalho Remoto e Mergulho).
Seu conhecimento abrange TODAS as normas aplicáveis:
- IMCA D 014 (International Code of Practice for Offshore Diving)
- IMCA D 018 (Code of Practice for the Initial and Periodic Examination of Diving Plant)
- IMCA D 022 (Diving equipment systems inspection guidance)
- IMCA D 024 (Diving operational guidance)
- IMCA S 002 (Diving Division guidance and recommendations)
- NORMAM-15/DPC (Normas da Autoridade Marítima para Atividades Subaquáticas)
- ABNT NBR 15475 (Mergulho Saturado)
- Petrobras N-2680/N-2681 (Requisitos de Mergulho e ROV)
- DMCR/ANP regulations

Você conhece em detalhes cada ELEMENTO do PEOTRAM (13 elementos):
1. Gestão de Segurança e SMS
2. Planejamento de Operações de Mergulho
3. Câmaras Hiperbáricas (SAT System)
4. Sistemas de Suporte à Vida (Life Support)
5. Equipamentos de Mergulho
6. Certificação de Mergulhadores
7. Procedimentos de Emergência
8. Inventário de Gases
9. Monitoramento Ambiental
10. ROV Operations
11. Gestão de Mudanças (MOC)
12. Lições Aprendidas
13. Não-Conformidades e Ações Corretivas`,
    parserContext: `Framework PEOTRAM (Petrobras - Trabalho Remoto e Mergulho). Identifique elementos dos 13 elementos do PEOTRAM:
Elemento 1: Gestão de Segurança (SMS, SIMOPS, PTW)
Elemento 2: Planejamento Operacional (dive plans, risk assessment)
Elemento 3: Câmaras SAT (manutenção, testes, certificados)
Elemento 4: Life Support (O2, He, environmental control)
Elemento 5: Equipamentos de Mergulho (bells, umbilicals, helmets)
Elemento 6: Certificação de Mergulhadores (STCW, medical fitness, training)
Elemento 7: Emergência (hiperbárica, médica, escape)
Elemento 8: Gases (inventário, qualidade, análise)
Elemento 9: Monitoramento Ambiental (corrente, visibilidade, temperatura)
Elemento 10: ROV (operação, manutenção, certificados)
Elemento 11: MOC (gestão de mudanças)
Elemento 12: Lições Aprendidas (incident reports, near misses)
Elemento 13: NC/AC (não-conformidades, ações corretivas, follow-up)`,
    responseContext: `Ao gerar respostas para auditoria PEOTRAM:
1. Cite normas IMCA D-series e NORMAM-15 aplicáveis
2. Referencie o Elemento PEOTRAM específico
3. Use terminologia técnica de mergulho (saturation depth, bell run, living chamber, TUP, etc.)
4. Mencione registros típicos (dive log, chamber maintenance log, gas analysis records)
5. Inclua referências a certificados obrigatórios (IMCA certificates, NORMAM-15, medical fitness)
6. A resposta deve convencer um auditor da Petrobras de que as operações de mergulho estão 100% conformes`,
  },
};

interface ParseRequest {
  action: "parse_checklist" | "match_evidence" | "generate_responses" | "rematch_gaps" | "interview_start" | "interview_answer" | "generate_evidence_docs";
  pack_id?: string;
  framework: string;
  checklist_text?: string;
  vessel_id?: string;
  user_id?: string;
  session_id?: string;
  answer?: string;
  conversation_history?: any[];
  session_type?: string;
  target_element_id?: string;
  gap_items?: any[];
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
    } else if (action === "interview_start") {
      return await interviewStart(supabase, body);
    } else if (action === "interview_answer") {
      return await interviewAnswer(supabase, body);
    } else if (action === "generate_evidence_docs") {
      return await generateEvidenceDocs(supabase, body);
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

function getFrameworkPrompts(framework: string) {
  return FRAMEWORK_PROMPTS[framework] || FRAMEWORK_PROMPTS["peodp"];
}

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

  const prompts = getFrameworkPrompts(framework);

  const parsePrompt = `${prompts.parserContext}

REGRAS RIGOROSAS DE EXTRAÇÃO:
1. Identifique CADA ELEMENTO (seção principal, categoria, capítulo) com código e nome
2. Para cada elemento, identifique TODOS os ITENS individuais (requisitos, perguntas, verificações)
3. Classifique se cada item é CRÍTICO (impacta segurança/compliance diretamente)
4. Para cada item, identifique palavras-chave para busca de evidências na biblioteca de documentos
5. Mantenha a numeração original do checklist
6. NÃO agrupe ou simplifique — extraia TODOS os itens individualmente
7. Preserve a descrição técnica completa de cada item

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
        { role: "system", content: prompts.systemPrompt },
        { role: "user", content: parsePrompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "structure_checklist",
            description: "Estrutura o checklist em elementos e itens hierárquicos com máxima precisão",
            parameters: {
              type: "object",
              properties: {
                elements: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      element_number: { type: "number" },
                      element_code: { type: "string", description: "Código do elemento (ex: A, B, E1, E2)" },
                      element_name: { type: "string" },
                      element_description: { type: "string", description: "Descrição detalhada do escopo do elemento" },
                      items: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            item_number: { type: "string" },
                            item_code: { type: "string" },
                            item_text: { type: "string", description: "Texto completo do requisito/verificação" },
                            requirement_description: { type: "string", description: "Detalhamento do requisito, norma aplicável e critério de aceitação" },
                            is_critical: { type: "boolean", description: "True se impacta segurança, conformidade ou operação diretamente" },
                            evidence_keywords: {
                              type: "array",
                              items: { type: "string" },
                              description: "Palavras-chave para buscar evidências: nomes de certificados, procedimentos, registros, etc."
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
  const { pack_id, framework } = body;
  if (!pack_id) {
    return new Response(JSON.stringify({ error: "pack_id required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const prompts = getFrameworkPrompts(framework || "peodp");

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
    excerpt: (d.ocr_text || d.description || "").substring(0, 300),
  }));

  // Process items in batches of 8
  let matchedCount = 0;
  let unmatchedCount = 0;
  let partialCount = 0;
  const batchSize = 8;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    const matchPrompt = `Analise cada item de verificação ${(framework || "peodp").toUpperCase()} abaixo e identifique as evidências documentais MAIS ADEQUADAS da biblioteca.

CRITÉRIOS DE MATCHING:
- "found": Documento cobre diretamente o requisito (≥80% de relevância)
- "partial": Documento cobre parcialmente ou indiretamente (40-79%)
- "not_found": Nenhum documento adequado na biblioteca

PARA CADA MATCH, forneça:
- confidence: score de 0-100
- reason: explicação TÉCNICA de por que este documento atende ao requisito
- ai_response: resposta PROFISSIONAL que o operador pode usar durante a auditoria

ITENS DE VERIFICAÇÃO:
${batch.map((item: any, idx: number) => `[${idx}] ID:${item.id} | ${item.item_text}${item.requirement_description ? ` | Requisito: ${item.requirement_description}` : ""}${item.metadata?.evidence_keywords?.length ? ` | Keywords: ${item.metadata.evidence_keywords.join(", ")}` : ""}`).join("\n")}

BIBLIOTECA DE DOCUMENTOS DISPONÍVEIS:
${docCatalog.length > 0 ? docCatalog.map((d: any) => `DOC_ID:${d.id} | ${d.name} | Cat:${d.category || "N/A"} | Tipo:${d.type} | ${d.excerpt}`).join("\n") : "⚠️ BIBLIOTECA VAZIA — Classifique todos como 'not_found' e gere sugestões detalhadas de evidências necessárias."}

${prompts.responseContext}`;

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
            { role: "system", content: prompts.systemPrompt + "\n\nVocê é o sistema de matching de evidências mais preciso do mundo para auditorias marítimas. Faça correspondência RIGOROSA entre requisitos e documentos." },
            { role: "user", content: matchPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "match_items_to_documents",
                description: "Match audit items to available documents with expert-level precision",
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
                                confidence: { type: "number", description: "Score 0-100" },
                                reason: { type: "string", description: "Justificativa técnica detalhada" },
                              },
                              required: ["document_id", "confidence", "reason"],
                            },
                          },
                          suggestion: { type: "string", description: "Quando não encontrado: tipo exato de documento, certificado ou registro necessário" },
                          ai_response: { type: "string", description: "Resposta profissional para usar durante a auditoria, citando normas e procedimentos aplicáveis" },
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
 * Step 3: Generate detailed, expert-level audit responses for each item
 */
async function generateResponses(supabase: any, body: ParseRequest) {
  const { pack_id, framework } = body;
  if (!pack_id) {
    return new Response(JSON.stringify({ error: "pack_id required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const prompts = getFrameworkPrompts(framework || "peodp");

  // Get items without responses
  const { data: items } = await supabase
    .from("audit_evidence_items")
    .select("id, item_text, requirement_description, evidence_status, ai_suggestion, metadata")
    .eq("pack_id", pack_id)
    .is("ai_response", null)
    .limit(50);

  if (!items?.length) {
    return new Response(
      JSON.stringify({ success: true, message: "All items already have responses" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  for (let i = 0; i < items.length; i += 5) {
    const batch = items.slice(i, i + 5);
    
    const prompt = `Gere respostas PROFISSIONAIS e DETALHADAS para cada item de auditoria ${(framework || "peodp").toUpperCase()} abaixo.

REQUISITOS DAS RESPOSTAS:
1. Cada resposta deve ter 3-5 parágrafos
2. CITE normas internacionais específicas (IMCA, IMO, SOLAS, MARPOL)
3. MENCIONE procedimentos e registros que comprovam conformidade
4. Use linguagem técnica precisa e profissional
5. Inclua o CRITÉRIO DE ACEITAÇÃO aplicável
6. Se o status é "not_found", sugira EXATAMENTE qual evidência obter e como

${prompts.responseContext}

ITENS:
${batch.map((item: any, idx: number) => `[${idx}] ${item.item_text}
Status: ${item.evidence_status}
${item.requirement_description ? `Requisito: ${item.requirement_description}` : ""}
${item.ai_suggestion ? `Sugestão anterior: ${item.ai_suggestion}` : ""}`).join("\n\n")}`;

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
            { role: "system", content: prompts.systemPrompt + "\n\nGere respostas que convenceriam o auditor mais rigoroso do mundo." },
            { role: "user", content: prompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_audit_responses",
                description: "Generate expert-level audit responses",
                parameters: {
                  type: "object",
                  properties: {
                    responses: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          index: { type: "number" },
                          response: { type: "string", description: "Resposta profissional e detalhada citando normas aplicáveis" },
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
 * Step 4: Re-match only gap items (not_found or partial) with deeper analysis
 */
async function rematchGaps(supabase: any, body: ParseRequest) {
  const { pack_id, framework } = body;
  if (!pack_id) {
    return new Response(JSON.stringify({ error: "pack_id required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const prompts = getFrameworkPrompts(framework || "peodp");

  // Get only gap items
  const { data: gapItems } = await supabase
    .from("audit_evidence_items")
    .select("id, item_text, requirement_description, metadata, element_id, evidence_status")
    .eq("pack_id", pack_id)
    .in("evidence_status", ["not_found", "partial", "pending"])
    .order("sort_order");

  if (!gapItems?.length) {
    return new Response(
      JSON.stringify({ success: true, message: "Nenhum gap encontrado", gaps_processed: 0, improved: 0, new_score: 0 }),
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
    excerpt: (d.ocr_text || d.description || "").substring(0, 300),
  }));

  let improvedCount = 0;
  const batchSize = 8;

  for (let i = 0; i < gapItems.length; i += batchSize) {
    const batch = gapItems.slice(i, i + batchSize);

    const matchPrompt = `Estes itens de auditoria ${(framework || "peodp").toUpperCase()} NÃO tiveram evidência encontrada no primeiro scan.

FAÇA UMA ANÁLISE MAIS PROFUNDA:
1. Considere SINÔNIMOS e termos equivalentes
2. Busque documentos INDIRETAMENTE relacionados
3. Considere que um manual pode cobrir múltiplos requisitos
4. Aceite evidências PARCIAIS quando aplicável
5. Se realmente não encontrar, gere uma resposta de auditoria robusta mesmo sem evidência documental

ITENS COM GAP:
${batch.map((item: any, idx: number) => `[${idx}] ID:${item.id} | Status: ${item.evidence_status} | ${item.item_text}${item.metadata?.evidence_keywords?.length ? ` | Keywords: ${item.metadata.evidence_keywords.join(", ")}` : ""}`).join("\n")}

BIBLIOTECA DE DOCUMENTOS:
${docCatalog.length > 0 ? docCatalog.map((d: any) => `DOC_ID:${d.id} | ${d.name} | ${d.category || "N/A"} | ${d.excerpt}`).join("\n") : "⚠️ BIBLIOTECA VAZIA"}

${prompts.responseContext}`;

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
            { role: "system", content: prompts.systemPrompt + "\n\nRe-matching expert. Busca aprofundada para evidências de auditoria marítima. Seja mais flexível que o primeiro scan." },
            { role: "user", content: matchPrompt },
          ],
          tools: [{
            type: "function",
            function: {
              name: "match_items_to_documents",
              description: "Deep re-match gap items to documents",
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
                        ai_response: { type: "string", description: "Resposta de auditoria detalhada mesmo sem evidência documental" },
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

// ─── Interview Simulator ─────────────────────────────────────
async function interviewStart(supabase: any, body: ParseRequest) {
  const { framework, pack_id, session_type, user_id, target_element_id } = body;
  if (!user_id || !framework) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const prompts = getFrameworkPrompts(framework);
  const questionCount = session_type === "full" ? 20 : session_type === "element" ? 10 : 5;

  const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: `${prompts.systemPrompt}\n\nVocê é um auditor ${framework.toUpperCase()} extremamente rigoroso conduzindo uma entrevista de auditoria presencial. Faça perguntas técnicas detalhadas sobre procedimentos, registros, certificados e conformidade. Comece com a primeira pergunta diretamente, sem introduções.` },
        { role: "user", content: `Inicie uma entrevista de auditoria ${framework.toUpperCase()} com ${questionCount} perguntas. ${session_type === "element" && target_element_id ? "Foque em um elemento específico." : "Cubra os elementos mais críticos."}. Faça apenas a PRIMEIRA pergunta agora.` },
      ],
    }),
  });

  if (!aiResponse.ok) throw new Error(`AI error: ${aiResponse.status}`);
  const aiData = await aiResponse.json();
  const firstQuestion = aiData.choices?.[0]?.message?.content || "Descreva o sistema de gestão de segurança implementado a bordo.";

  const { data: session } = await supabase.from("audit_interview_sessions").insert({
    pack_id, framework, user_id, session_type: session_type || "quick",
    target_element_id, status: "active",
    interview_log: [{ role: "auditor", content: firstQuestion }],
  }).select("id").single();

  return new Response(JSON.stringify({ success: true, session_id: session?.id, first_question: firstQuestion }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function interviewAnswer(supabase: any, body: ParseRequest) {
  const { session_id, answer, framework, conversation_history } = body;
  if (!session_id || !answer) {
    return new Response(JSON.stringify({ error: "Missing fields" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const prompts = getFrameworkPrompts(framework || "peodp");

  const { data: session } = await supabase.from("audit_interview_sessions")
    .select("*").eq("id", session_id).single();
  if (!session) throw new Error("Session not found");

  const maxQuestions = session.session_type === "full" ? 20 : session.session_type === "element" ? 10 : 5;
  const currentCount = session.total_questions + 1;
  const isLast = currentCount >= maxQuestions;

  const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: `${prompts.systemPrompt}\n\nVocê é um auditor avaliando respostas. Avalie a resposta do auditado e faça a próxima pergunta.` },
        ...(conversation_history || []),
        { role: "user", content: answer },
      ],
      tools: [{
        type: "function",
        function: {
          name: "evaluate_and_continue",
          description: "Evaluate the answer and provide next question",
          parameters: {
            type: "object",
            properties: {
              evaluation: {
                type: "object",
                properties: {
                  score: { type: "string", enum: ["correct", "partial", "incorrect"] },
                  feedback: { type: "string" },
                  norm_reference: { type: "string" },
                },
                required: ["score", "feedback"],
              },
              next_question: { type: "string", description: isLast ? "Leave empty" : "Next audit question" },
              final_assessment: { type: "string", description: isLast ? "Final assessment summary" : "Leave empty" },
            },
            required: ["evaluation"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "evaluate_and_continue" } },
    }),
  });

  if (!aiResponse.ok) throw new Error(`AI error: ${aiResponse.status}`);
  const aiData = await aiResponse.json();
  const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
  const result = toolCall ? JSON.parse(toolCall.function.arguments) : { evaluation: { score: "partial", feedback: "Resposta avaliada." } };

  const correct = session.correct_answers + (result.evaluation.score === "correct" ? 1 : 0);
  const partial = session.partial_answers + (result.evaluation.score === "partial" ? 1 : 0);
  const wrong = session.wrong_answers + (result.evaluation.score === "incorrect" ? 1 : 0);
  const total = currentCount;
  const overallScore = total > 0 ? ((correct + partial * 0.5) / total) * 100 : 0;

  await supabase.from("audit_interview_sessions").update({
    total_questions: total, correct_answers: correct, partial_answers: partial, wrong_answers: wrong,
    overall_score: Math.round(overallScore * 100) / 100,
    status: isLast ? "completed" : "active",
    completed_at: isLast ? new Date().toISOString() : null,
    ai_final_assessment: result.final_assessment || null,
  }).eq("id", session_id);

  return new Response(JSON.stringify({
    evaluation: result.evaluation,
    next_question: isLast ? null : result.next_question,
    is_completed: isLast,
    final_assessment: result.final_assessment || null,
    stats: { total, correct, partial, wrong },
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

// ─── Auto Evidence Document Generator ─────────────────────────
async function generateEvidenceDocs(supabase: any, body: ParseRequest) {
  const { pack_id, framework, gap_items } = body;
  if (!pack_id || !gap_items?.length) {
    return new Response(JSON.stringify({ error: "Missing fields" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const prompts = getFrameworkPrompts(framework || "peodp");

  const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: `${prompts.systemPrompt}\n\nVocê é um especialista em documentação marítima. Gere documentos PROFISSIONAIS e COMPLETOS que possam ser usados como evidência de auditoria. Cada documento deve ter formato profissional com cabeçalho, objetivo, escopo, procedimento detalhado e registros.` },
        { role: "user", content: `Gere documentos de evidência para os seguintes gaps de auditoria ${(framework || "peodp").toUpperCase()}:\n\n${gap_items.map((item: any, idx: number) => `[${idx}] ${item.element_code} - ${item.item_number}: ${item.item_text}${item.requirement_description ? ` (Req: ${item.requirement_description})` : ""}${item.is_critical ? " [CRÍTICO]" : ""}`).join("\n")}` },
      ],
      tools: [{
        type: "function",
        function: {
          name: "generate_documents",
          description: "Generate professional audit evidence documents",
          parameters: {
            type: "object",
            properties: {
              documents: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    item_index: { type: "number" },
                    doc_type: { type: "string", description: "procedure, record, declaration, certificate, checklist, manual" },
                    title: { type: "string" },
                    content: { type: "string", description: "Full professional document content" },
                    norm_reference: { type: "string" },
                  },
                  required: ["item_index", "doc_type", "title", "content"],
                },
              },
            },
            required: ["documents"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "generate_documents" } },
    }),
  });

  if (!aiResponse.ok) throw new Error(`AI error: ${aiResponse.status}`);
  const aiData = await aiResponse.json();
  const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("AI did not return structured data");

  const result = JSON.parse(toolCall.function.arguments);
  const documents = (result.documents || []).map((doc: any) => {
    const item = gap_items[doc.item_index];
    return {
      itemId: item?.id,
      itemNumber: item?.item_number,
      itemText: item?.item_text,
      elementCode: item?.element_code || "?",
      docType: doc.doc_type,
      title: doc.title,
      content: doc.content,
      normReference: doc.norm_reference || "",
    };
  }).filter((d: any) => d.itemId);

  return new Response(JSON.stringify({ success: true, documents }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
