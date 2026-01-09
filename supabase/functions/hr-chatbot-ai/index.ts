/**
 * HR Chatbot AI - 24/7 Employee Assistant
 * Answers questions about payroll, vacations, benefits, policies
 * Uses Lovable AI Gateway with RAG context
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HR_KNOWLEDGE_BASE = `
# Base de Conhecimento RH - Nautilus One

## FÉRIAS (CLT Art. 129-145)
- Direito: 30 dias após 12 meses de trabalho
- Fracionamento: até 3 períodos (1 mínimo 14 dias, outros 5+ dias)
- Abono pecuniário: pode vender até 1/3 (10 dias)
- Pagamento: até 2 dias antes do início
- 1/3 constitucional: adicional obrigatório

## FOLHA DE PAGAMENTO
- Salário: até 5º dia útil do mês seguinte
- 13º salário: 1ª parcela até 30/nov, 2ª até 20/dez
- FGTS: 8% sobre remuneração (depósito até dia 7)
- INSS: alíquotas de 7,5% a 14%
- IRRF: conforme tabela progressiva

## BENEFÍCIOS
- Vale Transporte: desconto máximo 6% do salário
- Vale Refeição/Alimentação: conforme política empresa
- Plano de Saúde: coparticipação conforme contrato
- Auxílio Creche: conforme convenção coletiva

## LICENÇAS
- Maternidade: 120 dias (extensível 180 dias)
- Paternidade: 5 dias (extensível 20 dias)
- Casamento: 3 dias
- Falecimento: 2 dias (parentes próximos)
- Doação sangue: 1 dia por ano

## JORNADA DE TRABALHO
- Padrão: 44 horas semanais / 8 horas diárias
- Hora extra: 50% adicional (100% domingos/feriados)
- Adicional noturno: 20% (22h às 5h)
- Intervalo: 1-2h para jornadas 6h+

## RESCISÃO
- Aviso prévio: 30 dias + 3 dias por ano trabalhado
- Saldo de salário: dias trabalhados
- 13º proporcional: meses trabalhados
- Férias proporcionais + 1/3: sempre devidas
- Multa FGTS: 40% (demissão sem justa causa)
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, employee_id, session_id, history = [] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const startTime = Date.now();

    // Fetch employee context if available
    let employeeContext = "";
    if (employee_id) {
      const { data: employee } = await supabase
        .from("hr_employees")
        .select("full_name, position, department, hire_date, base_salary, status")
        .eq("id", employee_id)
        .single();

      if (employee) {
        employeeContext = `
Colaborador: ${employee.full_name}
Cargo: ${employee.position}
Departamento: ${employee.department}
Data Admissão: ${employee.hire_date}
Status: ${employee.status}
`;
      }

      // Fetch vacation balance
      const { data: vacations } = await supabase
        .from("hr_vacations")
        .select("days_entitled, days_taken, acquisition_end, status")
        .eq("employee_id", employee_id)
        .eq("status", "pending")
        .order("acquisition_end", { ascending: false })
        .limit(1);

      if (vacations?.[0]) {
        const remaining = vacations[0].days_entitled - vacations[0].days_taken;
        employeeContext += `
Férias Disponíveis: ${remaining} dias
Período Aquisitivo Vence: ${vacations[0].acquisition_end}
`;
      }
    }

    const systemPrompt = `Você é o Assistente de RH do Nautilus One, um chatbot 24/7 para colaboradores.

REGRAS:
1. Responda SEMPRE em português brasileiro, de forma clara e amigável
2. Use a Base de Conhecimento abaixo para responder sobre políticas
3. Para dúvidas específicas do colaborador, use o Contexto do Colaborador
4. Se não souber, diga que vai encaminhar para o RH
5. Para ações (solicitar férias, atestado), oriente sobre o processo
6. Cite artigos da CLT quando relevante
7. Seja empático e profissional

${HR_KNOWLEDGE_BASE}

${employeeContext ? `CONTEXTO DO COLABORADOR:\n${employeeContext}` : ""}

EXEMPLOS DE RESPOSTAS:
- "Quantos dias de férias tenho?" → Verifique o saldo e informe com detalhes
- "Como solicito férias?" → Explique o processo passo a passo
- "Quando recebo o 13º?" → Cite as datas e explique as parcelas
- "Preciso de um atestado" → Oriente sobre envio e prazos`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10), // Last 10 messages for context
      { role: "user", content: message }
    ];

    // Detect intent for logging
    const intentPatterns = [
      { pattern: /férias|vacation|folga/i, intent: "vacation_inquiry" },
      { pattern: /salário|pagamento|holerite|contracheque/i, intent: "payroll_inquiry" },
      { pattern: /benefício|vale|plano|auxílio/i, intent: "benefits_inquiry" },
      { pattern: /licença|atestado|falta/i, intent: "leave_inquiry" },
      { pattern: /rescisão|demissão|desligamento/i, intent: "termination_inquiry" },
      { pattern: /13|décimo terceiro/i, intent: "thirteenth_salary" },
      { pattern: /hora extra|jornada|ponto/i, intent: "worktime_inquiry" },
    ];

    const detectedIntent = intentPatterns.find(p => p.pattern.test(message))?.intent || "general_inquiry";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    // Log the interaction (async, don't wait)
    const responseTime = Date.now() - startTime;
    supabase.from("hr_chatbot_logs").insert({
      employee_id,
      session_id: session_id || crypto.randomUUID(),
      user_message: message,
      intent_detected: detectedIntent,
      response_time_ms: responseTime,
    }).then(() => {}).catch(console.error);

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("[hr-chatbot-ai] Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
