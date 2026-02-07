import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * M007 - RAG Engine for Maritime Regulations
 * Retrieval-Augmented Generation using regulatory_knowledge table
 * Provides precise answers with section citations
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Built-in maritime regulation knowledge base (key sections)
const REGULATION_KNOWLEDGE: Record<string, string[]> = {
  SOLAS: [
    "SOLAS Chapter II-1: Construction - Structure, stability, installations",
    "SOLAS Chapter II-2: Fire protection, detection, extinction",
    "SOLAS Chapter III: Life-saving appliances and arrangements",
    "SOLAS Chapter IV: Radiocommunications - GMDSS",
    "SOLAS Chapter V: Safety of navigation - VDR, ECDIS, AIS",
    "SOLAS Chapter VI: Carriage of cargoes",
    "SOLAS Chapter VII: Dangerous goods",
    "SOLAS Chapter IX: ISM Code implementation",
    "SOLAS Chapter XI-1: Special measures for maritime safety",
    "SOLAS Chapter XI-2: ISPS Code - Maritime security",
    "SOLAS Chapter XII: Additional safety measures for bulk carriers",
    "SOLAS Chapter XIV: Polar Code safety measures",
  ],
  MARPOL: [
    "MARPOL Annex I: Oil pollution prevention - IOPP Certificate, ORB, SOPEP",
    "MARPOL Annex II: Noxious liquid substances - NLS Certificate, P&A Manual",
    "MARPOL Annex III: Harmful substances in packaged form - IMDG Code",
    "MARPOL Annex IV: Sewage - sewage treatment plant, holding tank, comminuter",
    "MARPOL Annex V: Garbage - garbage management plan, garbage record book",
    "MARPOL Annex VI: Air pollution - SOx, NOx, EEDI, SEEMP, CII, EU ETS",
    "MARPOL Annex VI Reg 14: SOx 0.50% global cap, 0.10% ECA",
    "MARPOL Annex VI Reg 22A: CII rating A-E, operational carbon intensity",
  ],
  "MLC 2006": [
    "MLC Title 1: Minimum requirements for seafarers - age, medical, training",
    "MLC Title 2: Conditions of employment - SEA, wages, hours of work/rest",
    "MLC Standard A2.3: Hours of work and rest - 14h max/24h, 72h max/7 days",
    "MLC Title 3: Accommodation, food, catering - cabin size, mess rooms",
    "MLC Title 4: Health protection, medical care, welfare, social security",
    "MLC Standard A4.1: Medical care on board and ashore",
    "MLC Title 5: Compliance and enforcement - DMLC Part I & II, MLC Certificate",
    "MLC Standard A2.1: Seafarers' employment agreements (SEA) requirements",
    "MLC Standard A2.2: Wages - monthly payment, allotments, currency",
    "MLC Guideline B4.3: Health and safety protection - risk assessment, PPE",
  ],
  STCW: [
    "STCW Chapter I: General provisions - definitions, certificates, dispensations",
    "STCW Chapter II: Master and deck department - OOW, Chief Officer, Master",
    "STCW Chapter III: Engine department - OICEW, 2nd Engineer, Chief Engineer",
    "STCW Chapter IV: Radiocommunication and radio operators - GMDSS GOC, ROC",
    "STCW Chapter V: Special training - tankers, ro-ro, passenger ships, polar",
    "STCW Chapter VI: Emergency functions - basic safety, survival craft, fire, first aid",
    "STCW Chapter VII: Alternative certification",
    "STCW Chapter VIII: Watchkeeping - fitness for duty, rest hours, fatigue",
    "STCW Table A-II/1: OOW navigation watch certification requirements",
    "STCW Table A-III/1: OICEW engineering watch certification requirements",
  ],
  ISM: [
    "ISM Code Element 1: General - objectives, application, definitions",
    "ISM Code Element 2: Safety and environmental protection policy",
    "ISM Code Element 3: Company responsibilities and authority - DPA",
    "ISM Code Element 4: Designated Person Ashore (DPA)",
    "ISM Code Element 5: Master's responsibility and authority",
    "ISM Code Element 6: Resources and personnel",
    "ISM Code Element 7: Development of plans for shipboard operations",
    "ISM Code Element 8: Emergency preparedness",
    "ISM Code Element 9: Reports and analysis of NCRs, accidents, hazardous occurrences",
    "ISM Code Element 10: Maintenance of ship and equipment",
    "ISM Code Element 11: Documentation - SMS manual, procedures",
    "ISM Code Element 12: Company verification, review and evaluation",
    "ISM Code Element 13: Certification, verification and control - DOC, SMC",
  ],
  ISPS: [
    "ISPS Part A: Mandatory requirements - ship security assessment, SSP, PFSP",
    "ISPS Part B: Guidance - security levels 1, 2, 3 measures",
    "ISPS Security Level 1: Normal - minimum protective security measures",
    "ISPS Security Level 2: Heightened - additional protective measures",
    "ISPS Security Level 3: Exceptional - further specific protective measures",
    "ISPS SSO: Ship Security Officer - appointment, duties, training",
    "ISPS CSO: Company Security Officer - responsibilities",
    "ISPS PFSO: Port Facility Security Officer - interface with ships",
  ],
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, regulation, includeExamples } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!question) {
      return new Response(JSON.stringify({ error: "question is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build context from regulation knowledge base
    let ragContext = "";
    const relevantRegulations: string[] = [];

    if (regulation && REGULATION_KNOWLEDGE[regulation]) {
      ragContext = `## ${regulation} Relevant Sections:\n`;
      ragContext += REGULATION_KNOWLEDGE[regulation].join("\n");
      relevantRegulations.push(regulation);
    } else {
      // Search all regulations for relevant sections
      const questionLower = question.toLowerCase();
      for (const [reg, sections] of Object.entries(REGULATION_KNOWLEDGE)) {
        const matches = sections.filter((s) =>
          s.toLowerCase().includes(questionLower.split(" ").filter((w: string) => w.length > 3).join("|") || "")
        );
        if (matches.length > 0 || questionLower.includes(reg.toLowerCase())) {
          ragContext += `\n## ${reg} Relevant Sections:\n${(matches.length > 0 ? matches : sections.slice(0, 5)).join("\n")}\n`;
          relevantRegulations.push(reg);
        }
      }

      // If no specific match, include all key regulations
      if (!ragContext) {
        for (const [reg, sections] of Object.entries(REGULATION_KNOWLEDGE)) {
          ragContext += `\n## ${reg}:\n${sections.slice(0, 3).join("\n")}\n`;
          relevantRegulations.push(reg);
        }
      }
    }

    // Also try to fetch from database if available
    let dbContext = "";
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: memories } = await supabase
        .from("ai_memory")
        .select("content, memory_type")
        .eq("memory_type", "regulation_knowledge")
        .limit(5);

      if (memories && memories.length > 0) {
        dbContext = "\n## Additional Knowledge from Database:\n";
        for (const m of memories) {
          dbContext += JSON.stringify(m.content).substring(0, 500) + "\n";
        }
      }
    } catch (dbErr) {
      console.log("DB context fetch skipped:", dbErr);
    }

    const systemPrompt = `Você é um especialista em regulamentações marítimas internacionais com conhecimento profundo de:
- SOLAS (Safety of Life at Sea)
- MARPOL (Marine Pollution)
- MLC 2006 (Maritime Labour Convention)
- STCW (Standards of Training, Certification and Watchkeeping)
- ISM Code (International Safety Management)
- ISPS Code (International Ship and Port Facility Security)
- NORMAM (Normas da Autoridade Marítima - Brasil)
- IMO Resolutions and Circulars

REGRAS OBRIGATÓRIAS:
1. SEMPRE cite a seção/artigo/standard exato da regulamentação
2. Use o formato: "Conforme [Regulamento] [Seção/Artigo], ..."
3. Se a resposta envolve prazos ou valores, cite os limites exatos
4. Indique quando uma regulamentação foi emendada recentemente
5. Se houver conflito entre regulamentações, explique a hierarquia
6. Responda em Português do Brasil
7. Forneça exemplos práticos quando possível

CONTEXTO REGULATÓRIO DISPONÍVEL:
${ragContext}
${dbContext}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: includeExamples
              ? `${question}\n\nPor favor, inclua exemplos práticos e cenários de aplicação.`
              : question,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("RAG query error:", response.status, errText);
      return new Response(JSON.stringify({ error: "RAG query failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const answer = result.choices?.[0]?.message?.content || "";

    console.log(`RAG Query: "${question.substring(0, 80)}..." → ${relevantRegulations.join(", ")}`);

    return new Response(
      JSON.stringify({
        answer,
        sources: relevantRegulations,
        ragContextUsed: ragContext.length > 0,
        model: "gemini-2.5-flash",
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("RAG Maritime error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
