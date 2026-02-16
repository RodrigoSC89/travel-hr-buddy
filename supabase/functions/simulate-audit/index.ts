import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Comprehensive audit questions by module with IMO/IMCA references
const AUDIT_QUESTIONS: Record<string, Array<{ id: string; question: string; ref: string; weight: number; category: string }>> = {
  ISM: [
    { id: "safety_policy", question: "Política de segurança atualizada, assinada pelo CEO e disponível a bordo?", ref: "ISM Code 2.1", weight: 10, category: "SMS Documentation" },
    { id: "sms_manual", question: "SMS Manual completamente implementado com todos os procedimentos documentados?", ref: "ISM Code 1.4", weight: 10, category: "SMS Documentation" },
    { id: "drills_monthly", question: "Simulacros mensais de emergência registrados nos últimos 3 meses?", ref: "ISM Code 8.2", weight: 8, category: "Emergency Preparedness" },
    { id: "near_miss", question: "Near-miss reportados, investigados e com ação corretiva implementada?", ref: "ISM Code 9.1", weight: 8, category: "Incident Management" },
    { id: "master_review", question: "Master Review realizada nos últimos 12 meses com evidências?", ref: "ISM Code 5.2", weight: 7, category: "Management Review" },
    { id: "internal_audit", question: "Auditoria interna realizada nos últimos 12 meses?", ref: "ISM Code 12.1", weight: 9, category: "Internal Audit" },
    { id: "nc_closeout", question: "Todas as não-conformidades anteriores encerradas dentro do prazo?", ref: "ISM Code 12.2", weight: 9, category: "Non-Conformity" },
    { id: "maintenance_system", question: "Sistema de manutenção planejada (PMS) atualizado e evidenciado?", ref: "ISM Code 10.1", weight: 8, category: "Maintenance" },
    { id: "change_management", question: "Procedimento de gestão de mudanças (MOC) implementado?", ref: "ISM Code 1.2.3", weight: 6, category: "SMS Documentation" },
    { id: "crew_familiarization", question: "Registros de familiarização da tripulação completos e assinados?", ref: "ISM Code 6.3", weight: 7, category: "Crew Competence" },
  ],
  MLC: [
    { id: "dmlc", question: "DMLC Parte I e Parte II válidas e disponíveis a bordo?", ref: "MLC Reg.5.1.3", weight: 10, category: "Documentation" },
    { id: "sea_contracts", question: "Todos os marítimos possuem SEA/CEM assinado e em conformidade?", ref: "MLC Reg.2.1", weight: 10, category: "Employment Agreements" },
    { id: "wages", question: "Salários ≥ mínimo ILO/ITF pagos pontualmente (máx. 1 mês atraso)?", ref: "MLC Reg.2.2", weight: 9, category: "Wages" },
    { id: "work_rest", question: "Registros de horas de trabalho/descanso atualizados e assinados diariamente?", ref: "MLC Reg.2.3", weight: 9, category: "Working Hours" },
    { id: "medical_certs", question: "Todos os marítimos com certificado médico válido (ENG1 ou equivalente)?", ref: "MLC Reg.1.2", weight: 8, category: "Medical" },
    { id: "accommodation", question: "Acomodações em conformidade (ruído, iluminação, ventilação, espaço)?", ref: "MLC Reg.3.1", weight: 7, category: "Accommodation" },
    { id: "food_catering", question: "Alimentação adequada em quantidade e qualidade, cozinheiro certificado?", ref: "MLC Reg.3.2", weight: 7, category: "Food & Catering" },
    { id: "complaint_procedure", question: "Procedimento de queixas disponível e comunicado à tripulação?", ref: "MLC Reg.5.1.5", weight: 8, category: "Complaints" },
    { id: "repatriation", question: "Garantia financeira para repatriação disponível e documentada?", ref: "MLC Reg.2.5", weight: 8, category: "Repatriation" },
    { id: "social_facilities", question: "Instalações recreativas e comunicação disponíveis a bordo?", ref: "MLC Reg.3.1", weight: 5, category: "Welfare" },
  ],
  ISPS: [
    { id: "ssp", question: "Ship Security Plan (SSP) aprovado pela Administração e a bordo?", ref: "ISPS A/9.4", weight: 10, category: "Security Plan" },
    { id: "issc", question: "ISSC (International Ship Security Certificate) válido?", ref: "ISPS A/19", weight: 10, category: "Certification" },
    { id: "security_drills", question: "Exercícios de segurança realizados a cada 3 meses?", ref: "ISPS A/13", weight: 8, category: "Drills" },
    { id: "sso", question: "SSO (Ship Security Officer) designado, treinado e certificado?", ref: "ISPS A/12", weight: 9, category: "Personnel" },
    { id: "cso", question: "CSO (Company Security Officer) designado e registrado?", ref: "ISPS A/11", weight: 9, category: "Personnel" },
    { id: "access_control", question: "Controle de acesso ao navio implementado e documentado?", ref: "ISPS A/9.4.3", weight: 8, category: "Access Control" },
    { id: "security_level", question: "Nível de segurança atual comunicado e procedimentos em vigor?", ref: "ISPS A/7", weight: 7, category: "Security Level" },
    { id: "dos", question: "DoS (Declaration of Security) realizadas quando requerido?", ref: "ISPS A/5", weight: 7, category: "Documentation" },
  ],
  DP: [
    { id: "dp_log", question: "DP Log atualizado com entradas dos últimos 90 dias?", ref: "IMCA M 117", weight: 9, category: "Documentation" },
    { id: "annual_trial", question: "Annual DP Trial realizado nos últimos 12 meses (IMCA M 190)?", ref: "IMCA M 190", weight: 10, category: "Testing" },
    { id: "dpo_certs", question: "Todos os DPOs com certificado NI DP válido e esquema adequado?", ref: "NI DP Scheme", weight: 10, category: "Certification" },
    { id: "fmea", question: "FMEA atualizado após últimas modificações no sistema DP?", ref: "IMCA M 166", weight: 9, category: "FMEA" },
    { id: "ciras", question: "Incidentes DP reportados ao IMCA CIRAS nos últimos 12 meses?", ref: "IMCA M 232", weight: 7, category: "Incident Reporting" },
    { id: "capability_plot", question: "Capability plot atualizado e disponível para referência?", ref: "IMCA M 140", weight: 8, category: "Capability" },
    { id: "watch_handover", question: "Procedimento de handover de watch DP documentado e seguido?", ref: "IMCA M 117", weight: 8, category: "Operations" },
    { id: "wf_sensors", question: "Sensores de referência de posição (DGNSS, HPR) calibrados?", ref: "IMCA M 166", weight: 8, category: "Equipment" },
  ],
  PEOTRAM: [
    { id: "sat_system", question: "Sistema de saturação verificado e certificado conforme IMCA D 023?", ref: "IMCA D 023", weight: 10, category: "Saturation System" },
    { id: "divers_cert", question: "Todos os mergulhadores com certificação HSE/IDSA válida?", ref: "HSE Diving Regs", weight: 10, category: "Diver Certification" },
    { id: "gas_log", question: "Log de gestão de gases completo e auditado (O₂, He, N₂)?", ref: "IMCA D 018", weight: 9, category: "Gas Management" },
    { id: "emergency_procedures", question: "Procedimentos de emergência de mergulho acessíveis e praticados?", ref: "IMCA D 023 S5", weight: 9, category: "Emergency" },
    { id: "bell_checks", question: "Verificações pré-mergulho do sino realizadas e documentadas?", ref: "IMCA D 024", weight: 8, category: "Bell Operations" },
    { id: "hot_water", question: "Sistema de água quente do mergulhador testado e funcional?", ref: "IMCA D 023", weight: 8, category: "Life Support" },
    { id: "decompression", question: "Tabelas de descompressão aprovadas e disponíveis?", ref: "DMAC/HSE", weight: 9, category: "Decompression" },
    { id: "medical_support", question: "Suporte médico hiperbárico disponível 24h?", ref: "IMCA D 023", weight: 9, category: "Medical" },
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { module, responses } = await req.json();

    if (!module || !responses) {
      return new Response(
        JSON.stringify({ error: "module and responses required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const questions = AUDIT_QUESTIONS[module];
    if (!questions) {
      return new Response(
        JSON.stringify({ error: `Unknown module: ${module}. Available: ${Object.keys(AUDIT_QUESTIONS).join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Score weights
    const scoreMap: Record<string, number> = {
      yes: 100, partial: 50, no: 0, na: -1, // -1 = excluded from scoring
    };

    let totalWeight = 0;
    let earnedScore = 0;
    const weakAreas: string[] = [];
    const ncItems: Array<{ id: string; question: string; ref: string; response: string; category: string }> = [];
    const categoryScores: Record<string, { earned: number; total: number }> = {};

    for (const q of questions) {
      const answer = responses[q.id] || "no";
      const points = scoreMap[answer];

      if (points === -1) continue; // N/A - skip

      totalWeight += q.weight;
      earnedScore += (points / 100) * q.weight;

      // Track category scores
      if (!categoryScores[q.category]) {
        categoryScores[q.category] = { earned: 0, total: 0 };
      }
      categoryScores[q.category].total += q.weight;
      categoryScores[q.category].earned += (points / 100) * q.weight;

      if (answer === "no") {
        ncItems.push({ id: q.id, question: q.question, ref: q.ref, response: answer, category: q.category });
        weakAreas.push(`${q.ref}: ${q.question}`);
      } else if (answer === "partial") {
        weakAreas.push(`${q.ref}: ${q.question} (parcial)`);
      }
    }

    const score = totalWeight > 0 ? Math.round((earnedScore / totalWeight) * 100) : 0;
    const passed = score >= 70;

    // Generate recommendations
    const recommendations: string[] = [];
    if (ncItems.length > 0) {
      recommendations.push(
        `Corrigir ${ncItems.length} não-conformidade(s) antes da auditoria ${module}`
      );
    }
    for (const nc of ncItems.slice(0, 5)) {
      recommendations.push(`⚠️ [${nc.ref}] ${nc.question}`);
    }
    if (score < 50) {
      recommendations.push("CRÍTICO: Score abaixo de 50% — risco de detenção/retenção");
    } else if (score < 70) {
      recommendations.push("ATENÇÃO: Score abaixo de 70% — revisão urgente necessária");
    }

    // Category breakdown
    const categoryBreakdown = Object.entries(categoryScores).map(([cat, s]) => ({
      category: cat,
      score: s.total > 0 ? Math.round((s.earned / s.total) * 100) : 0,
      weight: s.total,
    })).sort((a, b) => a.score - b.score);

    return new Response(
      JSON.stringify({
        module,
        score,
        passed,
        total_questions: questions.length,
        answered: Object.keys(responses).length,
        non_conformities: ncItems.length,
        weak_areas: weakAreas,
        nc_items: ncItems,
        recommendations,
        category_breakdown: categoryBreakdown,
        risk_level: score >= 90 ? "low" : score >= 70 ? "medium" : score >= 50 ? "high" : "critical",
        estimated_days_to_ready: Math.max(0, Math.ceil((100 - score) * 0.5)),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
