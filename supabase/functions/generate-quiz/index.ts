import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuizRequest {
  standard: string; // SGSO, IMCA, ISO, ANP, ISM Code, ISPS Code
  difficulty: string; // Basic, Intermediate, Advanced
  questionCount?: number;
  language?: string; // pt-BR, en
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

// Fallback quiz templates when AI is unavailable
const FALLBACK_TEMPLATES: Record<string, Record<string, Question[]>> = {
  SGSO: {
    Basic: [
      {
        id: "sgso_basic_1",
        question: "O que significa SGSO?",
        options: [
          "Sistema de Gestão de Segurança Operacional",
          "Sistema Geral de Segurança Ocupacional",
          "Sistema de Gestão de Segurança e Operações",
          "Sistema de Garantia de Segurança Organizacional"
        ],
        correctAnswer: 0,
        explanation: "SGSO significa Sistema de Gestão de Segurança Operacional, fundamental para gestão de riscos.",
        category: "Conceitos Básicos"
      },
      {
        id: "sgso_basic_2",
        question: "Qual é o principal objetivo do SGSO?",
        options: [
          "Aumentar a produtividade",
          "Reduzir custos operacionais",
          "Prevenir acidentes e incidentes",
          "Melhorar a comunicação"
        ],
        correctAnswer: 2,
        explanation: "O principal objetivo do SGSO é prevenir acidentes e incidentes através da gestão sistemática de riscos.",
        category: "Objetivos"
      },
      {
        id: "sgso_basic_3",
        question: "Quem é responsável pela segurança operacional?",
        options: [
          "Apenas o gerente de segurança",
          "Somente a alta direção",
          "Todos os membros da organização",
          "Apenas os supervisores"
        ],
        correctAnswer: 2,
        explanation: "A segurança operacional é responsabilidade de todos os membros da organização.",
        category: "Responsabilidades"
      }
    ],
    Intermediate: [
      {
        id: "sgso_inter_1",
        question: "Qual é a hierarquia de controle de riscos no SGSO?",
        options: [
          "EPI, Controles Administrativos, Controles de Engenharia, Eliminação",
          "Eliminação, Controles de Engenharia, Controles Administrativos, EPI",
          "Controles Administrativos, EPI, Eliminação, Controles de Engenharia",
          "EPI, Eliminação, Controles Administrativos, Controles de Engenharia"
        ],
        correctAnswer: 1,
        explanation: "A hierarquia correta é: Eliminação, Controles de Engenharia, Controles Administrativos e por último EPI.",
        category: "Gestão de Riscos"
      }
    ],
    Advanced: [
      {
        id: "sgso_adv_1",
        question: "Como é calculado o Nível de Risco (NR) no SGSO?",
        options: [
          "NR = Probabilidade + Severidade",
          "NR = Probabilidade × Severidade",
          "NR = Probabilidade / Severidade",
          "NR = (Probabilidade + Severidade) / 2"
        ],
        correctAnswer: 1,
        explanation: "O Nível de Risco é calculado multiplicando a Probabilidade pela Severidade (NR = P × S).",
        category: "Análise Quantitativa"
      }
    ]
  },
  IMCA: {
    Basic: [
      {
        id: "imca_basic_1",
        question: "O que é IMCA?",
        options: [
          "International Marine Contractors Association",
          "International Maritime Compliance Authority",
          "International Marine Certification Agency",
          "International Maritime Control Association"
        ],
        correctAnswer: 0,
        explanation: "IMCA é a International Marine Contractors Association, associação internacional de contratantes marítimos.",
        category: "Conceitos"
      }
    ]
  },
  ISO: {
    Basic: [
      {
        id: "iso_basic_1",
        question: "O que significa ISO?",
        options: [
          "International Safety Organization",
          "International Standards Organization",
          "International Shipping Operations",
          "International Security Office"
        ],
        correctAnswer: 1,
        explanation: "ISO significa International Standards Organization (Organização Internacional de Normalização).",
        category: "Conceitos"
      }
    ]
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { standard, difficulty, questionCount = 10, language = "pt-BR" }: QuizRequest = await req.json();
    
    console.log(`Generating quiz: ${standard} - ${difficulty} - ${questionCount} questions`);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    let questions: Question[];
    
    // Try to generate with AI if API key is available
    if (OPENAI_API_KEY) {
      try {
        questions = await generateQuestionsWithAI(standard, difficulty, questionCount, language, OPENAI_API_KEY);
      } catch (aiError) {
        console.error("AI generation failed, using fallback:", aiError);
        questions = getFallbackQuestions(standard, difficulty, questionCount);
      }
    } else {
      console.log("No OpenAI API key, using fallback templates");
      questions = getFallbackQuestions(standard, difficulty, questionCount);
    }

    // Save quiz template to database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        // Get user's organization
        const { data: profile } = await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", user.id)
          .single();
        
        if (profile?.organization_id) {
          // Save template
          await supabase.from("quiz_templates").insert({
            organization_id: profile.organization_id,
            title: `${standard} - ${difficulty} Quiz`,
            description: `Auto-generated quiz for ${standard} compliance at ${difficulty} level`,
            standard,
            difficulty,
            questions,
            created_by: user.id
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        questions,
        metadata: {
          standard,
          difficulty,
          questionCount: questions.length,
          generatedAt: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in generate-quiz:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

async function generateQuestionsWithAI(
  standard: string,
  difficulty: string,
  count: number,
  language: string,
  apiKey: string
): Promise<Question[]> {
  const systemPrompt = language === "pt-BR" 
    ? `Você é um especialista em compliance marítimo e certificações. Gere ${count} questões de múltipla escolha sobre ${standard} no nível ${difficulty}.

Para cada questão, forneça:
- Uma pergunta clara e precisa
- 4 opções de resposta
- O índice da resposta correta (0-3)
- Uma explicação detalhada
- A categoria da questão

Retorne em formato JSON como array de objetos Question.`
    : `You are an expert in maritime compliance and certifications. Generate ${count} multiple-choice questions about ${standard} at ${difficulty} level.

For each question, provide:
- A clear and precise question
- 4 answer options
- The index of the correct answer (0-3)
- A detailed explanation
- The question category

Return in JSON format as an array of Question objects.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate quiz questions for ${standard} - ${difficulty}` }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Parse JSON from response
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    const questions = JSON.parse(jsonMatch[0]);
    return questions.map((q: any, idx: number) => ({
      id: `${standard.toLowerCase()}_${difficulty.toLowerCase()}_${idx + 1}`,
      ...q
    }));
  }
  
  throw new Error("Could not parse AI response");
}

function getFallbackQuestions(standard: string, difficulty: string, count: number): Question[] {
  const templates = FALLBACK_TEMPLATES[standard]?.[difficulty] || FALLBACK_TEMPLATES.SGSO.Basic;
  
  // Repeat questions if needed to reach desired count
  const questions: Question[] = [];
  while (questions.length < count) {
    questions.push(...templates);
  }
  
  return questions.slice(0, count);
}
