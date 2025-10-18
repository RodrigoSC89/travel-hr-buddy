import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuizRequest {
  quiz_type: string;
  norm_reference: string;
  clause_reference?: string;
  difficulty_level?: "basic" | "intermediate" | "advanced";
  num_questions?: number;
  language?: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

async function generateQuizWithAI(request: QuizRequest): Promise<QuizQuestion[]> {
  const {
    quiz_type,
    norm_reference,
    clause_reference,
    difficulty_level = "intermediate",
    num_questions = 5,
    language = "pt-BR",
  } = request;

  const prompt = `
Você é um especialista em auditorias e conformidade normativa, especialmente em:
- SGSO (Sistema de Gestão de Segurança Operacional)
- IMCA (International Marine Contractors Association)
- ISO (International Organization for Standardization)
- ANP (Agência Nacional do Petróleo)

Gere ${num_questions} perguntas de múltipla escolha sobre:
Tipo: ${quiz_type}
Norma: ${norm_reference}
${clause_reference ? `Cláusula: ${clause_reference}` : ""}
Nível: ${difficulty_level}

Cada pergunta deve ter:
1. Um enunciado técnico claro e objetivo
2. Exatamente 4 alternativas (A, B, C, D)
3. Apenas UMA alternativa correta
4. Uma explicação técnica detalhada da resposta correta

As perguntas devem:
- Testar conhecimento prático e aplicação
- Ser relevantes para operações marítimas
- Seguir rigorosamente a norma especificada
- Ter nível de dificuldade ${difficulty_level}

Retorne APENAS um JSON válido no formato:
{
  "questions": [
    {
      "id": "q1",
      "question": "Pergunta aqui?",
      "options": ["A) Opção 1", "B) Opção 2", "C) Opção 3", "D) Opção 4"],
      "correct_answer": "A",
      "explanation": "Explicação técnica detalhada"
    }
  ]
}

Idioma das perguntas: ${language === "pt-BR" ? "Português Brasileiro" : "English"}
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert in maritime safety standards and compliance auditing. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    // Parse JSON response
    const quizData = JSON.parse(content);
    return quizData.questions || [];
  } catch (error) {
    console.error("Error generating quiz with AI:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Invalid authentication");
    }

    // Parse request body
    const requestData: QuizRequest = await req.json();

    // Validate required fields
    if (!requestData.quiz_type || !requestData.norm_reference) {
      throw new Error("Missing required fields: quiz_type and norm_reference");
    }

    console.log(`Generating quiz for user ${user.id}:`, requestData);

    // Generate quiz with AI
    const questions = await generateQuizWithAI(requestData);

    // Prepare quiz data
    const quizData = {
      quiz_type: requestData.quiz_type,
      norm_reference: requestData.norm_reference,
      clause_reference: requestData.clause_reference,
      difficulty_level: requestData.difficulty_level || "intermediate",
      questions,
      generated_at: new Date().toISOString(),
      generated_by: user.id,
    };

    // Optionally save as template
    if (requestData.quiz_type && requestData.norm_reference) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (profile?.organization_id) {
        // Save as template for reuse
        await supabase.from("quiz_templates").insert({
          organization_id: profile.organization_id,
          quiz_type: requestData.quiz_type,
          norm_reference: requestData.norm_reference,
          clause_reference: requestData.clause_reference,
          title: `${requestData.quiz_type} - ${requestData.norm_reference}${
            requestData.clause_reference ? ` (${requestData.clause_reference})` : ""
          }`,
          description: `Quiz gerado automaticamente sobre ${requestData.norm_reference}`,
          difficulty_level: requestData.difficulty_level || "intermediate",
          questions: quizData.questions,
          created_by: user.id,
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      quiz: quizData,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in generate-quiz function:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
