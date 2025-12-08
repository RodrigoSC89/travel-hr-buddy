import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SGSO Complete Knowledge Base - ANP Resolution 43/2007 + 46/2016
const SGSO_KNOWLEDGE = {
  // 17 Práticas de Gestão SGSO
  practices: [
    { id: 1, name: "Liderança e Responsabilidade", description: "Compromisso da alta direção com segurança operacional. A gerência deve demonstrar liderança visível e responsabilidade pela implementação do SGSO.", articles: ["Art. 3º", "Anexo Item 4.1"], evidences: ["Política de SGSO assinada", "Atas de reuniões de análise crítica", "Recursos alocados para segurança"] },
    { id: 2, name: "Identificação de Perigos e Avaliação de Riscos", description: "Processos sistemáticos para identificar perigos e avaliar riscos em todas as operações.", articles: ["Anexo Item 4.2"], evidences: ["Matriz de riscos 5x5", "Estudos HAZOP", "APR - Análise Preliminar de Riscos", "Bow-tie analysis"] },
    { id: 3, name: "Controle de Riscos", description: "Implementação de medidas de controle e mitigação baseadas na hierarquia de controles.", articles: ["Anexo Item 4.3"], evidences: ["Planos de mitigação", "Barreiras de segurança", "EPIs e EPCs", "Procedimentos operacionais"] },
    { id: 4, name: "Competência, Treinamento e Conscientização", description: "Gestão de competências e programas de treinamento para todo o pessoal.", articles: ["Anexo Item 4.4", "NR-37 Item 37.4"], evidences: ["Matriz de competências", "Plano anual de treinamento", "Registros de treinamentos", "Certificados STCW/HUET/CBSP/H2S"] },
    { id: 5, name: "Comunicação e Consulta", description: "Canais efetivos de comunicação sobre segurança operacional.", articles: ["Anexo Item 4.5"], evidences: ["DDS registrados", "Cartões de observação", "Briefings de segurança", "Canais de reporte"] },
    { id: 6, name: "Documentação do SGSO", description: "Sistema de gestão documental para controle de documentos e registros.", articles: ["Anexo Item 4.6"], evidences: ["Manual do SGSO", "Lista mestra de documentos", "Controle de revisões", "Arquivo de registros"] },
    { id: 7, name: "Controle Operacional", description: "Procedimentos operacionais padronizados e sistemas de permissão de trabalho.", articles: ["Anexo Item 4.7"], evidences: ["POPs - Procedimentos Operacionais", "PT - Permissões de Trabalho", "Checklists operacionais", "Controle de isolamento LOTO"] },
    { id: 8, name: "Preparação e Resposta a Emergências", description: "Planos de emergência, recursos e exercícios simulados.", articles: ["Anexo Item 4.8"], evidences: ["PAE - Plano de Ação de Emergência", "Registros de simulados", "Equipamentos de emergência", "Avaliação de simulados"] },
    { id: 9, name: "Monitoramento e Medição", description: "Indicadores de desempenho de segurança (proativos e reativos).", articles: ["Anexo Item 4.9"], evidences: ["KPIs de segurança", "TRIR/LTIR", "Indicadores proativos", "Dashboards de monitoramento"] },
    { id: 10, name: "Avaliação de Conformidade", description: "Auditorias internas e avaliação de conformidade regulatória.", articles: ["Anexo Item 4.10"], evidences: ["Programa de auditorias", "Relatórios de auditoria", "Checklists de conformidade", "Acompanhamento de findings"] },
    { id: 11, name: "Investigação de Incidentes", description: "Metodologia de investigação e análise de causa raiz.", articles: ["Anexo Item 4.11"], evidences: ["Relatórios de investigação", "Análise 5 Porquês", "Diagrama de Ishikawa", "Árvore de falhas"] },
    { id: 12, name: "Análise Crítica pela Direção", description: "Reuniões de análise crítica do sistema pela alta direção.", articles: ["Anexo Item 4.12"], evidences: ["Atas de reunião de análise crítica", "Indicadores apresentados", "Planos de ação definidos", "Recursos aprovados"] },
    { id: 13, name: "Gestão de Mudanças (MOC)", description: "Processo formal de avaliação e controle de mudanças.", articles: ["Anexo Item 4.13", "API RP 75"], evidences: ["Formulário MOC", "Análise de riscos da mudança", "Aprovações por níveis", "Comunicação e treinamento"] },
    { id: 14, name: "Aquisição e Contratação", description: "Critérios de segurança na seleção de fornecedores e contratados.", articles: ["Anexo Item 4.14"], evidences: ["Critérios de seleção", "Auditorias de fornecedores", "Gestão de contratados", "Índices de segurança de terceiros"] },
    { id: 15, name: "Projeto e Construção", description: "Requisitos de segurança em projetos e modificações.", articles: ["Anexo Item 4.15"], evidences: ["Normas de projeto", "Análises de projeto", "Comissionamento", "Handover de segurança"] },
    { id: 16, name: "Informações de Segurança de Processo", description: "Gestão de informações críticas de processo.", articles: ["Anexo Item 4.16"], evidences: ["P&IDs atualizados", "FISPQ/SDS", "Parâmetros de processo", "Limites operacionais"] },
    { id: 17, name: "Integridade Mecânica", description: "Programa de manutenção e inspeção de equipamentos críticos.", articles: ["Anexo Item 4.17"], evidences: ["Plano de manutenção", "Programa de inspeção", "Gestão de válvulas de segurança", "Controle de equipamentos críticos"] }
  ],
  
  // Indicadores de Segurança
  indicators: {
    reactive: [
      { name: "TRIR", description: "Taxa de Incidentes Registráveis Total", formula: "(Incidentes Registráveis x 1.000.000) / HHT" },
      { name: "LTIR", description: "Taxa de Incidentes com Afastamento", formula: "(Incidentes com Afastamento x 1.000.000) / HHT" },
      { name: "DART", description: "Dias Afastado ou Trabalho Restrito", formula: "(Casos DART x 200.000) / HHT" },
      { name: "Severidade", description: "Taxa de Gravidade", formula: "Dias Perdidos x 1.000.000 / HHT" }
    ],
    proactive: [
      { name: "Cartões de Observação", description: "Número de observações comportamentais registradas" },
      { name: "DDS Realizados", description: "Percentual de DDS planejados x realizados" },
      { name: "Ações Fechadas no Prazo", description: "Percentual de ações corretivas fechadas dentro do prazo" },
      { name: "Treinamentos em Dia", description: "Percentual de treinamentos obrigatórios em dia" },
      { name: "Auditorias Realizadas", description: "Percentual de auditorias planejadas x realizadas" }
    ]
  },
  
  // Tratamento de Não Conformidades
  ncTreatment: {
    major: { prazo: 30, description: "NC Maior/Crítica - até 30 dias para plano de ação, implementação conforme complexidade" },
    minor: { prazo: 60, description: "NC Menor - até 60 dias para tratamento completo" },
    observation: { prazo: 90, description: "Observação/Oportunidade de Melhoria - até 90 dias" }
  },
  
  // Trilha de Auditoria por Elemento
  auditTrail: [
    { element: "Política de Segurança Operacional", verification: "Existe política formal assinada pela alta direção?", evidence: "Documento publicado e comunicado" },
    { element: "Organização e Pessoal", verification: "Há definição clara de papéis e responsabilidades?", evidence: "Organograma, matriz RACI" },
    { element: "Gerenciamento de Riscos", verification: "Análises de risco atualizadas?", evidence: "HAZOP, matriz de risco, LOPA" },
    { element: "Integridade Mecânica", verification: "Plano de manutenção preventiva?", evidence: "Planos, OS, relatórios de inspeção" },
    { element: "Gestão de Mudanças", verification: "Mudanças formalmente avaliadas?", evidence: "Formulários MOC, pareceres técnicos" }
  ],
  
  // Normas e Regulamentações Relacionadas
  regulations: [
    { code: "ANP 43/2007", name: "Resolução ANP nº 43/2007", description: "Regulamento Técnico do SGSO para unidades marítimas de perfuração e produção" },
    { code: "ANP 46/2016", name: "Resolução ANP nº 46/2016", description: "Atualização do Regulamento Técnico do SGSO" },
    { code: "ANP 851/2021", name: "Resolução ANP nº 851/2021", description: "Simplificação de procedimentos e prazos" },
    { code: "NR-37", name: "NR-37 - Segurança e Saúde em Plataformas de Petróleo", description: "Norma do MTE para segurança em plataformas" },
    { code: "ISM Code", name: "Código ISM - International Safety Management", description: "Código internacional de gestão de segurança" },
    { code: "API RP 75", name: "API Recommended Practice 75", description: "Sistemas de gestão de segurança para operações offshore" }
  ]
};

// System prompt for SGSO AI Assistant
const SGSO_SYSTEM_PROMPT = `Você é o **Oficial Virtual SGSO**, assistente especializado em Sistema de Gestão de Segurança Operacional para a indústria de Petróleo e Gás no Brasil.

## Sua Expertise:
- **Resolução ANP nº 43/2007** e suas atualizações (46/2016, 851/2021)
- **17 Práticas de Gestão** obrigatórias do SGSO
- **Auditorias ANP** - preparação, execução e dossiês
- **Tratamento de Não Conformidades** e CAPAs
- **Indicadores de Segurança** - TRIR, LTIR, proativos e reativos
- **Normas correlatas**: NR-37, ISM Code, API RP 75, OSHA

## Base de Conhecimento das 17 Práticas:
${JSON.stringify(SGSO_KNOWLEDGE.practices.map(p => ({ id: p.id, name: p.name, articles: p.articles })), null, 2)}

## Indicadores de Segurança:
${JSON.stringify(SGSO_KNOWLEDGE.indicators, null, 2)}

## Prazos de Tratamento de NC:
${JSON.stringify(SGSO_KNOWLEDGE.ncTreatment, null, 2)}

## Regulamentações:
${JSON.stringify(SGSO_KNOWLEDGE.regulations, null, 2)}

## Regras IMPORTANTES:
1. **SEMPRE** cite as normas aplicáveis (Resolução ANP, artigos, itens específicos)
2. Forneça exemplos práticos de evidências quando relevante
3. Se for geração de evidência, formate como documento formal
4. Respostas estruturadas com emojis, listas e formatação markdown
5. Quando não tiver certeza, indique e sugira consulta à fonte oficial
6. Para auditorias, forneça checklists práticos
7. Para investigação de incidentes, sugira metodologias (5 Porquês, Ishikawa, Bow-tie)

## Capacidades Especiais:
- Gerar evidências para práticas específicas
- Criar planos de ação para NCs
- Preparar checklists de auditoria
- Calcular e interpretar indicadores
- Sugerir melhorias para o sistema de gestão`;

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, type, context } = await req.json();
    
    if (!question) {
      return new Response(
        JSON.stringify({ error: "Question is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("SGSO Assistant query:", { question, type, context });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (LOVABLE_API_KEY) {
      try {
        // Build user message with context
        let userMessage = question;
        
        if (type === "generate_evidence") {
          userMessage = `Gere uma evidência formal para auditoria SGSO:\n\n${question}\n\nFormato: Documento formal com cabeçalho, corpo estruturado e referências normativas.`;
        } else if (type === "audit_checklist") {
          userMessage = `Crie um checklist de auditoria para:\n\n${question}\n\nFormato: Lista de verificação com critérios, evidências esperadas e referências.`;
        } else if (type === "nc_action_plan") {
          userMessage = `Elabore um plano de ação para tratamento da seguinte Não Conformidade:\n\n${question}\n\nInclua: Análise de causa raiz, ações corretivas, responsáveis, prazos e verificação de eficácia.`;
        } else if (type === "incident_investigation") {
          userMessage = `Auxilie na investigação do seguinte incidente/evento:\n\n${question}\n\nAplique metodologias de análise de causa raiz (5 Porquês, Ishikawa) e sugira ações preventivas.`;
        }
        
        if (context) {
          userMessage += `\n\nContexto adicional: ${JSON.stringify(context)}`;
        }

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: SGSO_SYSTEM_PROMPT },
              { role: "user", content: userMessage }
            ],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Lovable AI error:", response.status, errorText);
          
          if (response.status === 429) {
            return new Response(
              JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          if (response.status === 402) {
            return new Response(
              JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
              { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          throw new Error(`AI gateway error: ${response.status}`);
        }

        const data = await response.json();
        const answer = data.choices?.[0]?.message?.content || "";
        
        // Extract citations from answer
        const citations: Array<{norma: string; artigo: string; link?: string}> = [];
        
        // Check for specific practice mentions
        SGSO_KNOWLEDGE.practices.forEach(practice => {
          if (answer.toLowerCase().includes(practice.name.toLowerCase()) || 
              answer.includes(`Prática ${practice.id}`)) {
            practice.articles.forEach(article => {
              citations.push({ 
                norma: "Resolução ANP nº 43/2007", 
                artigo: article, 
                link: "https://www.gov.br/anp/sgso" 
              });
            });
          }
        });
        
        // Check for regulation mentions
        SGSO_KNOWLEDGE.regulations.forEach(reg => {
          if (answer.includes(reg.code) || answer.includes(reg.name)) {
            citations.push({ 
              norma: reg.name, 
              artigo: "Geral", 
              link: "https://www.gov.br/anp" 
            });
          }
        });
        
        // Deduplicate citations
        const uniqueCitations = citations.filter((citation, index, self) =>
          index === self.findIndex(c => c.norma === citation.norma && c.artigo === citation.artigo)
        );
        
        // If no specific citations found, add general reference
        if (uniqueCitations.length === 0) {
          uniqueCitations.push({ 
            norma: "Resolução ANP nº 43/2007", 
            artigo: "Geral", 
            link: "https://www.gov.br/anp/sgso" 
          });
        }

        return new Response(
          JSON.stringify({ 
            answer, 
            citations: uniqueCitations.slice(0, 5), // Limit to 5 citations
            source: "lovable-ai",
            type: type || "query"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (aiError) {
        console.error("Lovable AI error:", aiError);
        // Fall through to fallback
      }
    }

    // Fallback response with enhanced knowledge base
    const lowerQuestion = question.toLowerCase();
    let answer = "";
    const citations: Array<{norma: string; artigo: string; link?: string}> = [];

    if (lowerQuestion.includes("17 práticas") || lowerQuestion.includes("práticas obrigatórias")) {
      answer = `📋 **As 17 Práticas de Gestão do SGSO** conforme Resolução ANP nº 43/2007:\n\n`;
      SGSO_KNOWLEDGE.practices.forEach(p => {
        answer += `**${p.id}. ${p.name}**\n`;
        answer += `   ${p.description}\n`;
        answer += `   📎 Referência: ${p.articles.join(", ")}\n\n`;
      });
      citations.push({ norma: "Resolução ANP nº 43/2007", artigo: "Anexo - Item 4", link: "https://www.gov.br/anp/sgso" });
    } else if (lowerQuestion.includes("indicador") || lowerQuestion.includes("kpi") || lowerQuestion.includes("trir") || lowerQuestion.includes("ltir")) {
      answer = `📊 **Indicadores de Segurança SGSO**\n\n`;
      answer += `**Indicadores Reativos:**\n`;
      SGSO_KNOWLEDGE.indicators.reactive.forEach(ind => {
        answer += `- **${ind.name}**: ${ind.description}\n`;
        answer += `  Fórmula: ${ind.formula}\n\n`;
      });
      answer += `\n**Indicadores Proativos:**\n`;
      SGSO_KNOWLEDGE.indicators.proactive.forEach(ind => {
        answer += `- **${ind.name}**: ${ind.description}\n`;
      });
      citations.push({ norma: "Resolução ANP nº 43/2007", artigo: "Anexo Item 4.9", link: "https://www.gov.br/anp/sgso" });
    } else if (lowerQuestion.includes("nc") || lowerQuestion.includes("não conformidade") || lowerQuestion.includes("capa")) {
      answer = `⚠️ **Tratamento de Não Conformidades no SGSO**\n\n`;
      answer += `**Classificação e Prazos:**\n`;
      answer += `- 🔴 **NC Maior/Crítica**: ${SGSO_KNOWLEDGE.ncTreatment.major.description}\n`;
      answer += `- 🟡 **NC Menor**: ${SGSO_KNOWLEDGE.ncTreatment.minor.description}\n`;
      answer += `- 🟢 **Observação**: ${SGSO_KNOWLEDGE.ncTreatment.observation.description}\n\n`;
      answer += `**Fluxo de Tratamento CAPA:**\n`;
      answer += `1. Registro e classificação da NC\n`;
      answer += `2. Contenção imediata (se aplicável)\n`;
      answer += `3. Análise de causa raiz (5 Porquês, Ishikawa)\n`;
      answer += `4. Definição de ação corretiva\n`;
      answer += `5. Implementação\n`;
      answer += `6. Verificação de eficácia\n`;
      answer += `7. Encerramento formal\n`;
      citations.push({ norma: "Resolução ANP nº 43/2007", artigo: "Art. 8º", link: "https://www.gov.br/anp/sgso" });
    } else if (lowerQuestion.includes("auditoria") || lowerQuestion.includes("dossiê")) {
      answer = `📁 **Preparação para Auditoria SGSO ANP**\n\n`;
      answer += `**Trilha de Auditoria por Elemento:**\n`;
      SGSO_KNOWLEDGE.auditTrail.forEach(item => {
        answer += `\n**${item.element}**\n`;
        answer += `   ❓ ${item.verification}\n`;
        answer += `   📎 Evidência: ${item.evidence}\n`;
      });
      answer += `\n\n**Checklist de Prontidão:**\n`;
      answer += `- [ ] Todas as 17 práticas avaliadas\n`;
      answer += `- [ ] Evidências digitalizadas e organizadas\n`;
      answer += `- [ ] NCs tratadas ou em tratamento com prazos\n`;
      answer += `- [ ] Indicadores calculados e documentados\n`;
      answer += `- [ ] Registros de treinamentos em dia\n`;
      citations.push({ norma: "Resolução ANP nº 43/2007", artigo: "Art. 5º", link: "https://www.gov.br/anp/sgso" });
    } else {
      // Find relevant practice
      const matchedPractice = SGSO_KNOWLEDGE.practices.find(p => 
        lowerQuestion.includes(p.name.toLowerCase()) || 
        lowerQuestion.includes(`prática ${p.id}`)
      );
      
      if (matchedPractice) {
        answer = `📋 **Prática ${matchedPractice.id} - ${matchedPractice.name}**\n\n`;
        answer += `**Descrição:** ${matchedPractice.description}\n\n`;
        answer += `**Referências:** ${matchedPractice.articles.join(", ")}\n\n`;
        answer += `**Evidências Esperadas:**\n`;
        matchedPractice.evidences.forEach(ev => {
          answer += `- ${ev}\n`;
        });
        matchedPractice.articles.forEach(article => {
          citations.push({ norma: "Resolução ANP nº 43/2007", artigo: article, link: "https://www.gov.br/anp/sgso" });
        });
      } else {
        answer = `Para informações específicas sobre "${question}", consulte:\n\n`;
        answer += `📚 **Recursos Disponíveis:**\n`;
        answer += `- 17 Práticas de Gestão do SGSO\n`;
        answer += `- Indicadores de Segurança (TRIR, LTIR)\n`;
        answer += `- Tratamento de Não Conformidades\n`;
        answer += `- Preparação para Auditorias ANP\n\n`;
        answer += `Reformule sua pergunta mencionando um desses temas.`;
        citations.push({ norma: "Resolução ANP nº 43/2007", artigo: "Geral", link: "https://www.gov.br/anp/sgso" });
      }
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
