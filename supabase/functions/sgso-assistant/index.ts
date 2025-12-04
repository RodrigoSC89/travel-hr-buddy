import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SGSO Knowledge Base - ANP Resolution 43/2007
const SGSO_KNOWLEDGE = {
  practices: [
    { id: 1, name: "Liderança e Responsabilidade", description: "Compromisso da alta direção com segurança operacional", articles: ["Art. 3º", "Anexo Item 4.1"] },
    { id: 2, name: "Identificação de Perigos e Avaliação de Riscos", description: "Processos sistemáticos de identificação e avaliação", articles: ["Anexo Item 4.2"] },
    { id: 3, name: "Controle de Riscos", description: "Implementação de medidas de controle e mitigação", articles: ["Anexo Item 4.3"] },
    { id: 4, name: "Competência, Treinamento e Conscientização", description: "Gestão de competências e programas de treinamento", articles: ["Anexo Item 4.4", "NR-37 Item 37.4"] },
    { id: 5, name: "Comunicação e Consulta", description: "Canais de comunicação sobre segurança", articles: ["Anexo Item 4.5"] },
    { id: 6, name: "Documentação do SGSO", description: "Gestão documental do sistema", articles: ["Anexo Item 4.6"] },
    { id: 7, name: "Controle Operacional", description: "Procedimentos operacionais e controles", articles: ["Anexo Item 4.7"] },
    { id: 8, name: "Preparação e Resposta a Emergências", description: "Planos de emergência", articles: ["Anexo Item 4.8"] },
    { id: 9, name: "Monitoramento e Medição", description: "Indicadores de segurança", articles: ["Anexo Item 4.9"] },
    { id: 10, name: "Avaliação de Conformidade", description: "Avaliação regulatória", articles: ["Anexo Item 4.10"] },
    { id: 11, name: "Investigação de Incidentes", description: "Análise de incidentes", articles: ["Anexo Item 4.11"] },
    { id: 12, name: "Análise Crítica pela Direção", description: "Revisões gerenciais", articles: ["Anexo Item 4.12"] },
    { id: 13, name: "Gestão de Mudanças", description: "MOC - Management of Change", articles: ["Anexo Item 4.13", "API RP 75"] },
    { id: 14, name: "Aquisição e Contratação", description: "Critérios de segurança em aquisições", articles: ["Anexo Item 4.14"] },
    { id: 15, name: "Projeto e Construção", description: "Segurança em projetos", articles: ["Anexo Item 4.15"] },
    { id: 16, name: "Informações de Segurança de Processo", description: "Gestão de informações críticas", articles: ["Anexo Item 4.16"] },
    { id: 17, name: "Integridade Mecânica", description: "Manutenção de equipamentos", articles: ["Anexo Item 4.17"] }
  ],
  ncTreatment: {
    major: { prazo: 30, description: "NC Maior - até 30 dias" },
    minor: { prazo: 60, description: "NC Menor - até 60 dias" },
    observation: { prazo: 90, description: "Observação - até 90 dias" }
  }
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question } = await req.json();
    
    if (!question) {
      return new Response(
        JSON.stringify({ error: "Question is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("SGSO Assistant query:", question);

    // Try to use Lovable AI if available
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (LOVABLE_API_KEY) {
      try {
        const systemPrompt = `Você é o Oficial Virtual SGSO, especialista em:
- Resolução ANP nº 43/2007 - Regulamento Técnico do SGSO
- 17 Práticas de Gestão obrigatórias para unidades de perfuração
- Tratamento de Não Conformidades e CAPAs
- Preparação de dossiês para auditoria ANP

REGRAS IMPORTANTES:
1. SEMPRE cite as normas aplicáveis (Resolução ANP, artigos, itens)
2. Se não souber com certeza, indique e sugira consulta à fonte oficial
3. Respostas em português brasileiro
4. Formato estruturado com emojis e listas quando apropriado

Base de conhecimento das 17 práticas:
${JSON.stringify(SGSO_KNOWLEDGE.practices, null, 2)}

Prazos de tratamento de NC:
${JSON.stringify(SGSO_KNOWLEDGE.ncTreatment, null, 2)}`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: question }
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const answer = data.choices?.[0]?.message?.content || "";
          
          // Extract potential citations from the answer
          const citations = [];
          if (answer.includes("Resolução ANP")) {
            citations.push({ norma: "Resolução ANP nº 43/2007", artigo: "Geral", link: "https://www.gov.br/anp/sgso" });
          }
          if (answer.includes("Prática")) {
            const practiceMatch = answer.match(/Prática (\d+)/);
            if (practiceMatch) {
              const practice = SGSO_KNOWLEDGE.practices.find(p => p.id === parseInt(practiceMatch[1]));
              if (practice) {
                citations.push({ norma: "Resolução ANP nº 43/2007", artigo: practice.articles[0], link: "https://www.gov.br/anp/sgso" });
              }
            }
          }

          return new Response(
            JSON.stringify({ answer, citations, source: "lovable-ai" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch (aiError) {
        console.error("Lovable AI error:", aiError);
      }
    }

    // Fallback: Return structured response based on keyword matching
    const lowerQuestion = question.toLowerCase();
    let answer = "";
    const citations: Array<{norma: string; artigo: string; link?: string}> = [];

    if (lowerQuestion.includes("17 práticas") || lowerQuestion.includes("práticas obrigatórias")) {
      answer = `As **17 Práticas de Gestão do SGSO** são obrigatórias conforme Resolução ANP nº 43/2007:\n\n`;
      SGSO_KNOWLEDGE.practices.forEach(p => {
        answer += `${p.id}. **${p.name}** - ${p.description}\n`;
      });
      citations.push({ norma: "Resolução ANP nº 43/2007", artigo: "Anexo - Item 4", link: "https://www.gov.br/anp/sgso" });
    } else if (lowerQuestion.includes("nc") || lowerQuestion.includes("não conformidade")) {
      answer = `**Tratamento de Não Conformidades no SGSO:**\n\n`;
      answer += `⏱️ **Prazos:**\n`;
      answer += `- NC Maior: ${SGSO_KNOWLEDGE.ncTreatment.major.prazo} dias\n`;
      answer += `- NC Menor: ${SGSO_KNOWLEDGE.ncTreatment.minor.prazo} dias\n`;
      answer += `- Observação: ${SGSO_KNOWLEDGE.ncTreatment.observation.prazo} dias\n`;
      citations.push({ norma: "Resolução ANP nº 43/2007", artigo: "Art. 8º", link: "https://www.gov.br/anp/sgso" });
    } else {
      answer = `Para informações específicas sobre "${question}", consulte a Resolução ANP nº 43/2007 ou reformule sua pergunta mencionando práticas específicas do SGSO.`;
      citations.push({ norma: "Resolução ANP nº 43/2007", artigo: "Geral", link: "https://www.gov.br/anp/sgso" });
    }

    return new Response(
      JSON.stringify({ answer, citations, source: "fallback" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("SGSO Assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
