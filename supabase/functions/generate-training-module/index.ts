/// <reference path="../deno-ambient.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrainingModuleRequest {
  auditId?: string;
  gapDetected: string;
  normReference: string;
  vessel?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
}

interface OpenAIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: TrainingModuleRequest = await req.json();
    const { auditId, gapDetected, normReference, vessel } = body;

    if (!gapDetected || !normReference) {
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios: gapDetected, normReference' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Configuração de IA não disponível' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `Você é um especialista em treinamento técnico e normas IMCA para operações marítimas offshore.

Contexto:
- Falha Detectada: ${gapDetected}
- Norma de Referência: ${normReference}
${vessel ? `- Embarcação: ${vessel}` : ''}

Tarefa: Crie um módulo de micro treinamento completo e estruturado para corrigir esta falha.

O módulo deve incluir:

1. TÍTULO (conciso e claro)
2. CONTEXTO (explicação do problema e por que é importante)
3. O QUE FAZER (ações práticas e específicas, mínimo 3 itens)
4. QUESTIONÁRIO (exatamente 3 perguntas de múltipla escolha com 3 opções cada, identificando a resposta correta)

Formate a resposta EXATAMENTE assim:

TÍTULO: [título do treinamento]

---

CONTEXTO:
[explicação detalhada do contexto e importância]

---

O QUE FAZER:
- [ação prática 1]
- [ação prática 2]
- [ação prática 3]

---

QUESTIONÁRIO:

1. [Pergunta 1]?
A) [Opção A]
B) [Opção B]
C) [Opção C]
RESPOSTA_CORRETA: [A, B ou C]

2. [Pergunta 2]?
A) [Opção A]
B) [Opção B]
C) [Opção C]
RESPOSTA_CORRETA: [A, B ou C]

3. [Pergunta 3]?
A) [Opção A]
B) [Opção B]
C) [Opção C]
RESPOSTA_CORRETA: [A, B ou C]

Mantenha tudo em português brasileiro, tom profissional e técnico.`;

    const openaiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em desenvolvimento de conteúdo de treinamento técnico para operações marítimas offshore, com expertise em normas IMCA.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('AI Gateway error:', openaiResponse.status, errorData);
      if (openaiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (openaiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos ao workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar conteúdo de treinamento' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data: OpenAIResponse = await openaiResponse.json();
    const generatedContent = data.choices?.[0]?.message?.content?.trim() || '';

    const titleMatch = generatedContent.match(/TÍTULO:\s*(.+)/i);
    const contextMatch = generatedContent.match(/CONTEXTO:\s*\n([\s\S]+?)\n---/i);
    const actionsMatch = generatedContent.match(/O QUE FAZER:\s*\n([\s\S]+?)\n---/i);
    const quizMatch = generatedContent.match(/QUESTIONÁRIO:\s*\n([\s\S]+?)$/i);

    const title = titleMatch ? titleMatch[1].trim() : 'Módulo de Treinamento';
    const context = contextMatch ? contextMatch[1].trim() : '';
    const actions = actionsMatch ? actionsMatch[1].trim() : '';
    
    const trainingContent = `## ${title}

### 💡 Contexto
${context}

### ✅ O que fazer
${actions}

### 📚 Norma de Referência
${normReference}
`;

    const quiz: QuizQuestion[] = [];
    if (quizMatch) {
      const quizText = quizMatch[1];
      const questionRegex = /(\d+)\.\s*(.+?)\?[\s\S]*?A\)\s*(.+?)[\s\S]*?B\)\s*(.+?)[\s\S]*?C\)\s*(.+?)[\s\S]*?RESPOSTA_CORRETA:\s*([ABC])/gi;
      
      let match;
      while ((match = questionRegex.exec(quizText)) !== null) {
        const [, , question, optionA, optionB, optionC, correctAnswer] = match;
        quiz.push({
          question: question.trim(),
          options: [
            optionA.trim(),
            optionB.trim(),
            optionC.trim()
          ],
          correct_answer: correctAnswer === 'A' ? 0 : correctAnswer === 'B' ? 1 : 2
        });
      }
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const authHeader = req.headers.get('Authorization');

    let savedModuleId: string | null = null;

    if (supabaseUrl && supabaseServiceKey && authHeader) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const token = authHeader.replace('Bearer ', '');
      const { data: userData, error: userError } = await supabase.auth.getUser(token);

      if (!userError && userData?.user) {
        const { data: insertedModule, error: insertError } = await supabase
          .from('training_modules')
          .insert({
            title,
            gap_detected: gapDetected,
            norm_reference: normReference,
            training_content: trainingContent,
            quiz,
            audit_id: auditId || null,
            vessel_id: vessel || null,
            created_by: userData.user.id,
            status: 'active'
          })
          .select()
          .single();

        if (!insertError && insertedModule) {
          savedModuleId = insertedModule.id;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        module: {
          id: savedModuleId,
          title,
          gap_detected: gapDetected,
          norm_reference: normReference,
          training_content: trainingContent,
          quiz
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-training-module function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
