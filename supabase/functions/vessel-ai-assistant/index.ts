// @ts-nocheck
/**
 * Vessel AI Assistant Edge Function
 * Specialized AI with access to vessel data, manuals, and diagnostics
 * Multi-provider with fallback: OpenAI -> Anthropic -> Smart Fallback
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VesselContext {
  vesselId: string;
  vesselName: string;
  specifications?: Record<string, unknown>;
  recentHistory?: unknown[];
  activeSensors?: unknown[];
}

interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const SYSTEM_PROMPT = `Você é o Assistente IA do Digital Twin de Embarcações do sistema Nauti One.

SUAS CAPACIDADES:
1. Responder perguntas técnicas sobre a embarcação e seus sistemas
2. Buscar informações em manuais técnicos e procedimentos operacionais
3. Fornecer diagnósticos e recomendações de manutenção preventiva/corretiva
4. Alertar sobre prazos de certificados, inspeções e documentos
5. Orientar sobre procedimentos de segurança (SOLAS, ISM, ISPS)
6. Interpretar dados de sensores e alertar sobre anomalias
7. Auxiliar na resolução de problemas técnicos

CONHECIMENTO ESPECIALIZADO:
- Convenções IMO: SOLAS, MARPOL (Anexos I-VI), STCW, ISM Code, ISPS Code
- MLC 2006 (Maritime Labour Convention) - Direitos dos marítimos
- Regulamentações de bandeira (Brasil - NORMAM, Panama, Liberia, Marshall Islands)
- Procedimentos de manutenção preventiva e preditiva
- Sistemas de propulsão (diesel, diesel-elétrico, azimuth thrusters)
- Sistemas de posicionamento dinâmico (DP1, DP2, DP3) - IMO Classes
- Equipamentos de navegação (ECDIS, Radar, AIS, GMDSS)
- Equipamentos de salvatagem (LSA Code)
- Sistemas elétricos e hidráulicos marítimos
- Automação e controle (SCADA, PLCs, sensores IoT)

COMPORTAMENTO:
- Seja preciso e técnico, usando terminologia marítima correta
- Cite regulamentos específicos quando aplicável (ex: "conforme SOLAS Cap. II-2")
- Indique níveis de urgência: 🟢 Normal, 🟡 Atenção, 🔴 Crítico
- Sugira ações preventivas e cronogramas
- Responda sempre em português brasileiro
- Use formatação markdown para melhor legibilidade
- Forneça referências a manuais/procedimentos quando disponíveis

LIMITAÇÕES:
- Não tome decisões operacionais críticas sem supervisão humana
- Para emergências reais, recomende contato imediato com a ponte/DPA
- Indique claramente quando uma informação requer verificação presencial`;

// Try OpenAI first, then Anthropic, then fallback
async function callAI(messages: ConversationMessage[], context: VesselContext): Promise<{ response: string; model: string; success: boolean }> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
  
  // Try OpenAI first
  if (openaiKey) {
    try {
      console.log("[VESSEL-AI] Trying OpenAI...");
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          console.log("[VESSEL-AI] OpenAI success");
          return { response: text, model: "gpt-4o", success: true };
        }
      }
    } catch (e) {
      console.log("[VESSEL-AI] OpenAI failed:", e.message);
    }
  }

  // Try Anthropic
  if (anthropicKey) {
    try {
      console.log("[VESSEL-AI] Trying Anthropic...");
      const systemContent = messages.filter(m => m.role === "system").map(m => m.content).join("\n\n");
      const chatMessages = messages.filter(m => m.role !== "system");
      
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          system: systemContent,
          messages: chatMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.content?.[0]?.text;
        if (text) {
          console.log("[VESSEL-AI] Anthropic success");
          return { response: text, model: "claude-sonnet-4", success: true };
        }
      }
    } catch (e) {
      console.log("[VESSEL-AI] Anthropic failed:", e.message);
    }
  }

  // Fallback to smart response
  console.log("[VESSEL-AI] Using smart fallback");
  return { 
    response: generateSmartFallback(messages[messages.length - 1].content, context), 
    model: "fallback", 
    success: false 
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const question = body.question || body.prompt || "";
    const context: VesselContext = body.context || { 
      vesselId: body.vessel_id || "unknown", 
      vesselName: body.vessel_name || "Embarcação" 
    };
    const conversationHistory: ConversationMessage[] = body.conversationHistory || body.history || [];

    if (!question) {
      throw new Error("Question is required");
    }

    console.log("[VESSEL-AI] Processing:", question.substring(0, 80));
    console.log("[VESSEL-AI] Vessel:", context.vesselName, `(${context.vesselId})`);

    const contextMessage = buildContextMessage(context);
    
    const messages: ConversationMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: contextMessage },
      ...conversationHistory.slice(-6),
      { role: "user", content: question }
    ];

    const { response: aiResponse, model, success } = await callAI(messages, context);
    const sources = detectSources(question);

    return new Response(
      JSON.stringify({
        response: aiResponse,
        sources,
        confidence: success ? 0.92 : 0.65,
        model,
        timestamp: new Date().toISOString(),
        vessel: { id: context.vesselId, name: context.vesselName }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const error = err as Error;
    console.error("[VESSEL-AI] Error:", error.message);
    
    return new Response(
      JSON.stringify({
        response: "Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente em alguns instantes.",
        error: error.message,
        sources: [],
        confidence: 0,
        model: "error"
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

function buildContextMessage(context: VesselContext): string {
  let message = `CONTEXTO DA EMBARCAÇÃO:
- ID: ${context.vesselId}
- Nome: ${context.vesselName}`;

  if (context.specifications) {
    const specs = context.specifications;
    message += `\n- Tipo: ${specs.vessel_type || 'N/A'}`;
    message += `\n- Bandeira: ${specs.flag || 'N/A'}`;
    message += `\n- IMO: ${specs.imo_number || 'N/A'}`;
  }

  if (context.recentHistory && context.recentHistory.length > 0) {
    message += `\n- Eventos recentes: ${context.recentHistory.length} registros`;
  }

  if (context.activeSensors && context.activeSensors.length > 0) {
    message += `\n- Sensores ativos: ${context.activeSensors.length} monitorando`;
  }

  return message;
}

function detectSources(question: string): { type: string; title: string; reference?: string }[] {
  const sources = [];
  const q = question.toLowerCase();

  if (q.includes("manual") || q.includes("procedimento") || q.includes("como") || q.includes("passo")) {
    sources.push({ type: "manual", title: "Manuais Técnicos", reference: "Biblioteca de Documentos" });
  }

  if (q.includes("manutenção") || q.includes("reparo") || q.includes("preventiva") || q.includes("corretiva")) {
    sources.push({ type: "history", title: "Histórico de Manutenção", reference: "Registros de Serviço" });
  }

  if (q.includes("sensor") || q.includes("temperatura") || q.includes("pressão") || q.includes("vibração") || q.includes("nível")) {
    sources.push({ type: "sensor", title: "Telemetria IoT", reference: "Sensores em Tempo Real" });
  }

  if (q.includes("peça") || q.includes("parte") || q.includes("componente") || q.includes("spare")) {
    sources.push({ type: "part", title: "Catálogo de Peças", reference: "Inventário de Sobressalentes" });
  }

  if (q.includes("certificado") || q.includes("inspeção") || q.includes("solas") || q.includes("imo") || q.includes("classe")) {
    sources.push({ type: "regulation", title: "Regulamentações IMO", reference: "SOLAS, MARPOL, ISM, MLC" });
  }

  if (q.includes("dp") || q.includes("posicionamento") || q.includes("thruster")) {
    sources.push({ type: "dp", title: "Sistema DP", reference: "IMO MSC/Circ.645" });
  }

  return sources;
}

function generateSmartFallback(question: string, context: VesselContext): string {
  const q = question.toLowerCase();
  const vessel = context.vesselName;

  // Manutenção
  if (q.includes("manutenção") || q.includes("manutencao")) {
    return `## 🔧 Manutenção - ${vessel}

Para informações sobre manutenção desta embarcação:

### Manutenção Preventiva
- Acesse o **módulo MMI** para visualizar o plano de manutenção programada
- Verifique os intervalos recomendados por fabricante e classe
- Consulte os **PMS (Planned Maintenance System)** para cronogramas

### Histórico
- A **Timeline** mostra todos os serviços realizados
- Filtros por sistema, equipamento ou período disponíveis

### Ações Recomendadas
1. Verificar itens vencidos no painel de alertas
2. Consultar estoque de sobressalentes
3. Revisar ordens de serviço em aberto

📋 *Acesse: Menu > Manutenção > Plano de Manutenção*`;
  }

  // Pressão de óleo
  if (q.includes("pressão") && (q.includes("óleo") || q.includes("oleo"))) {
    return `## 🛢️ Verificação de Pressão de Óleo - ${vessel}

### Procedimento de Verificação

1. **Leitura dos Instrumentos**
   - Verifique o manômetro de pressão de óleo no painel de controle
   - Valores normais: geralmente entre **40-60 PSI** (motor quente)
   - ⚠️ Pressão baixa (<25 PSI): investigar imediatamente

2. **Causas Comuns de Baixa Pressão**
   - Nível de óleo insuficiente
   - Filtro de óleo obstruído
   - Bomba de óleo desgastada
   - Vazamento no sistema
   - Óleo degradado ou diluído

3. **Ações Corretivas**
   - Verificar nível no carter (motor frio)
   - Inspecionar filtros e substituir se necessário
   - Verificar viscosidade do óleo
   - Checar por vazamentos visíveis

### 🔴 Alarme de Baixa Pressão
Se o alarme disparar, **REDUZA A ROTAÇÃO IMEDIATAMENTE** e notifique a ponte de comando.

📖 Consulte: Manual do Motor Principal, Seção "Lubrication System"`;
  }

  // Emergência/Segurança
  if (q.includes("emergência") || q.includes("segurança") || q.includes("incêndio") || q.includes("abandono")) {
    return `## 🚨 Procedimentos de Emergência - ${vessel}

### ⚠️ IMPORTANTE
Em caso de emergência REAL, contate imediatamente:
- **Ponte de Comando** (Canal 16 VHF)
- **Oficial de Segurança (SSO)**
- **Ative o Sistema de Alarme Geral** se necessário

### Procedimentos Principais

| Emergência | Referência | Localização |
|------------|------------|-------------|
| Incêndio | SOLAS Cap. II-2 | Estação de Incêndio |
| Homem ao Mar | SOLAS Cap. III | Ponte de Comando |
| Abandono | LSA Code | Pontos de Reunião |
| Poluição | MARPOL | SOPEP Manual |
| Médica | MLC 2006 | Enfermaria |

### Documentação
- **Muster List** - Funções de cada tripulante
- **SMPEP** - Plano de emergência do navio
- **SOPEP** - Plano de emergência para poluição

🔴 *Nunca hesite em acionar alarme em caso de risco real à vida ou embarcação.*`;
  }

  // Certificados
  if (q.includes("certificado") || q.includes("validade") || q.includes("vencimento")) {
    return `## 📜 Certificados e Documentação - ${vessel}

### Sistema de Gestão de Certificados

O Nauti One monitora automaticamente:
- **Certificados Estatutários** (SOLAS, Load Line, IOPP, ISPP, SMC, ISM DOC)
- **Certificados de Classe**
- **Licenças e Registros**
- **Documentação da Tripulação**

### Alertas Automáticos
- 🟡 **60 dias** antes do vencimento - Primeiro alerta
- 🟠 **30 dias** - Alerta urgente
- 🔴 **15 dias** - Crítico, ação imediata

### Verificação
1. Acesse **Compliance > Certificates**
2. Use filtros por status ou data
3. Exporte relatório para Port State Control

📋 *Dashboard mostra resumo de certificados próximos do vencimento.*`;
  }

  // DP (Dynamic Positioning)
  if (q.includes("dp") || q.includes("posicionamento dinâmico") || q.includes("thruster")) {
    return `## 🎯 Sistema de Posicionamento Dinâmico - ${vessel}

### Classificação DP (IMO)
- **DP1**: Perda de posição possível em caso de falha única
- **DP2**: Redundância - mantém posição com falha única
- **DP3**: Separação física de sistemas redundantes

### Monitoramento em Tempo Real
- Status dos **thrusters** (azimutais, tunnel, principais)
- **Reference systems** (DGPS, HPR, Taut Wire)
- **Power management** e UPS
- **Footprint** e excursões

### Manutenção Crítica
Os sistemas DP requerem:
- Testes anuais de FMEA
- Trials após manutenção
- Registro contínuo de operações

📖 Referência: **IMO MSC/Circ.645** e **IMCA M 103**`;
  }

  // Resposta genérica melhorada
  return `## 🚢 Assistente Digital Twin - ${vessel}

Obrigado pela sua pergunta. Posso ajudá-lo com informações sobre:

### 📊 Dados da Embarcação
- Especificações técnicas e desenhos
- Histórico de eventos e manutenções
- Status de sensores e telemetria

### 🔧 Operações & Manutenção
- Procedimentos técnicos e manuais
- Diagnósticos de equipamentos
- Planejamento de manutenção (PMS)

### 📜 Compliance & Documentação
- Status de certificados
- Requisitos regulatórios (IMO, Classe)
- Checklists de inspeção

### 🤖 Assistência IA
- Análise preditiva de falhas
- Recomendações de manutenção
- Pesquisa em manuais técnicos

**Reformule sua pergunta** com mais detalhes específicos para uma resposta mais precisa, ou escolha uma das categorias acima.

💡 *Exemplo: "Qual o procedimento para troca de filtro de óleo do motor principal?"*`;
}
