import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é um especialista em PEOTRAM (Programa de Excelência Operacional para Transporte Aéreo e Marítimo) da Petrobras. Seu conhecimento abrange:

**O QUE É O PEOTRAM:**
O PEOTRAM é um modelo de avaliação abrangente que verifica aproximadamente 390 requisitos em:
- Gestão de Segurança (SGSA)
- Operações Marítimas e Aéreas
- Manutenção de Embarcações e Aeronaves
- Saúde e Meio Ambiente

**OS 13 ELEMENTOS DO PEOTRAM:**
1. **ELEMENTO 1 - Liderança, Gerenciamento e Responsabilidade**: Política de segurança, comprometimento da liderança, estrutura organizacional
2. **ELEMENTO 2 - Conformidade Legal**: Atendimento às NRs, STCW, ISM Code, legislação marítima
3. **ELEMENTO 3 - Gestão de Riscos**: Identificação, avaliação, controle e monitoramento de riscos
4. **ELEMENTO 4 - Operação**: Procedimentos operacionais, operações críticas, controles de processo
5. **ELEMENTO 5 - Controle Operacional**: Sistemas de controle, procedimentos de trabalho seguro
6. **ELEMENTO 6 - Manutenção**: Manutenção preventiva, corretiva, preditiva e controle de equipamentos críticos
7. **ELEMENTO 7 - Gestão de Mudanças**: Processos de MOC (Management of Change)
8. **ELEMENTO 8 - Gestão de Fornecedores**: Qualificação, seleção e avaliação de prestadores
9. **ELEMENTO 9 - Gestão de Recursos Humanos**: Recrutamento, treinamento, competências
10. **ELEMENTO 10 - Gestão da Informação & Comunicação**: Controle de documentos, registros
11. **ELEMENTO 11 - Preparação e Respostas à Emergências**: Planos de contingência, exercícios
12. **ELEMENTO 12 - Investigação de Acidentes e Incidentes**: Análise de causas, medidas corretivas
13. **ELEMENTO 13 - Auditoria Interna e Análise Crítica**: Sistema de auditoria, melhoria contínua

**SISTEMA DE CLASSIFICAÇÃO:**
- **Escala de Score (0-4)**:
  - 4: Conforme - Implementação completa e eficaz
  - 3: Oportunidade de melhoria menor
  - 2: Não conformidade menor
  - 1: Não conformidade maior
  - 0: Não conforme - Falha crítica

- **Níveis de Criticidade (A-D)**:
  - A: Crítico - Impacto imediato na segurança
  - B: Grave - Alto impacto operacional
  - C: Moderado - Impacto significativo
  - D: Leve - Impacto menor

**NORMAS E REGULAMENTOS:**
- ISM Code (International Safety Management)
- STCW (Standards of Training, Certification and Watchkeeping)
- SOLAS (Safety of Life at Sea)
- MARPOL (International Convention for the Prevention of Pollution from Ships)
- NRs (Normas Regulamentadoras brasileiras): NR-30, NR-34, NR-35, NR-33
- NORMAM (Normas da Autoridade Marítima)
- ANTAQ (Agência Nacional de Transportes Aquaviários)

**TIPOS DE AUDITORIA:**
- **Auditoria Embarcação (Vessel)**: Avaliação a bordo das embarcações
- **Auditoria Terra (Shore)**: Avaliação de instalações em terra

Responda em português brasileiro, de forma técnica mas acessível. Forneça exemplos práticos e referências normativas quando aplicável. Ajude com:
1. Geração de evidências para auditorias
2. Interpretação de requisitos PEOTRAM
3. Planos de ação para não conformidades
4. Melhores práticas do setor
5. Orientações sobre legislação marítima`;

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, systemPrompt, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing PEOTRAM AI chat request with", messages?.length || 0, "messages, action:", action);

    // Build the full system prompt based on action
    let fullSystemPrompt = systemPrompt || SYSTEM_PROMPT;
    
    if (action === "generate_evidence") {
      fullSystemPrompt += `\n\nATENÇÃO: O usuário solicitou GERAÇÃO DE EVIDÊNCIA DE CONFORMIDADE.
Forneça um modelo de evidência estruturado com:
1. Cabeçalho (elemento, requisito, data)
2. Descrição da verificação realizada
3. Evidências objetivas encontradas
4. Registros fotográficos/documentais sugeridos
5. Conclusão de conformidade
6. Recomendações (se aplicável)`;
    } else if (action === "non_conformity_plan") {
      fullSystemPrompt += `\n\nATENÇÃO: O usuário solicitou PLANO DE AÇÃO PARA NÃO CONFORMIDADE.
Forneça um plano estruturado com:
1. Análise de causa raiz (5 Porquês, Ishikawa)
2. Ações corretivas imediatas
3. Ações corretivas de longo prazo
4. Responsáveis e prazos
5. Recursos necessários
6. Indicadores de eficácia
7. Verificação de eficácia`;
    } else if (action === "training_matrix") {
      fullSystemPrompt += `\n\nATENÇÃO: O usuário solicitou MATRIZ DE TREINAMENTOS.
Forneça uma matriz estruturada com:
1. Competências obrigatórias por cargo
2. Treinamentos regulamentares (STCW, NR-30, etc.)
3. Periodicidade de reciclagem
4. Carga horária mínima
5. Critérios de avaliação`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limits exceeded, please try again later.",
          response: "Desculpe, o limite de requisições foi atingido. Por favor, tente novamente em alguns minutos."
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Payment required",
          response: "Desculpe, é necessário adicionar créditos para continuar usando o assistente IA."
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "Não foi possível gerar uma resposta.";
    
    // Extract references from the response
    const references: string[] = [];
    const refPatterns = [
      /ISM Code/gi,
      /STCW/gi,
      /SOLAS/gi,
      /MARPOL/gi,
      /NR-\d+/gi,
      /NORMAM-\d+/gi,
      /PEOTRAM/gi,
      /Elemento\s+\d+/gi,
      /ANTAQ/gi
    ];
    
    refPatterns.forEach(pattern => {
      const matches = aiResponse.match(pattern);
      if (matches) {
        matches.forEach((match: string) => {
          const normalized = match.toUpperCase();
          if (!references.includes(normalized)) {
            references.push(normalized);
          }
        });
      }
    });

    console.log("Successfully processed PEOTRAM AI response, references:", references);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      references: references.slice(0, 6)
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in peotram-ai-chat function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      response: "Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
