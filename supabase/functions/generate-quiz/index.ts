import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuizRequest {
  quiz_type: string;
  norm_reference?: string;
  clause_reference?: string;
  difficulty_level?: 'basic' | 'intermediate' | 'advanced';
  num_questions?: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    const requestData: QuizRequest = await req.json();
    const {
      quiz_type,
      norm_reference,
      clause_reference,
      difficulty_level = 'intermediate',
      num_questions = 5
    } = requestData;

    // Validate input
    if (!quiz_type) {
      return new Response(
        JSON.stringify({ error: "quiz_type is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Build OpenAI prompt
    const prompt = `You are an expert maritime compliance assessor specializing in ${quiz_type} standards.

Generate ${num_questions} multiple-choice questions for a ${difficulty_level} level quiz about ${norm_reference || quiz_type}.
${clause_reference ? `Focus specifically on clause/section: ${clause_reference}` : ''}

Requirements:
- Each question must test practical knowledge and understanding
- Provide 4 options (A, B, C, D) for each question
- Indicate the correct answer
- Provide a clear explanation for why the answer is correct
- Questions should be relevant to maritime operations and compliance

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correct_answer": "A",
    "explanation": "Explanation text here"
  }
]`;

    // Call OpenAI API
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      console.error("OpenAI API key not configured");
      // Return fallback quiz if OpenAI is not available
      return new Response(
        JSON.stringify({
          questions: generateFallbackQuiz(quiz_type, num_questions),
          source: 'fallback'
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a maritime compliance expert who generates technical assessment questions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!openaiResponse.ok) {
      console.error("OpenAI API error:", await openaiResponse.text());
      // Return fallback quiz
      return new Response(
        JSON.stringify({
          questions: generateFallbackQuiz(quiz_type, num_questions),
          source: 'fallback'
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices[0].message.content;

    // Parse the JSON response
    let questions: QuizQuestion[];
    try {
      // Extract JSON from response (might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        questions = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      questions = generateFallbackQuiz(quiz_type, num_questions);
    }

    return new Response(
      JSON.stringify({ 
        questions,
        source: 'ai',
        quiz_type,
        norm_reference,
        difficulty_level
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error generating quiz:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// Fallback quiz generation for when OpenAI is not available
function generateFallbackQuiz(quiz_type: string, num_questions: number): QuizQuestion[] {
  const templates: Record<string, QuizQuestion[]> = {
    IMCA: [
      {
        question: "What is the primary objective of the DP System according to IMCA M117?",
        options: [
          "A) Increase vessel speed",
          "B) Maintain position and heading using thrusters",
          "C) Reduce fuel consumption",
          "D) Improve crew communication"
        ],
        correct_answer: "B",
        explanation: "The DP System's primary objective is to maintain the vessel's position and heading automatically using thrusters and propellers."
      },
      {
        question: "What does FMEA stand for in DP operations?",
        options: [
          "A) Failure Mode and Effects Analysis",
          "B) Fleet Management Emergency Assessment",
          "C) Functional Marine Equipment Analysis",
          "D) Forward Motion Emergency Action"
        ],
        correct_answer: "A",
        explanation: "FMEA stands for Failure Mode and Effects Analysis, a systematic approach to identify potential failures in DP systems."
      }
    ],
    SGSO: [
      {
        question: "What is the main purpose of an SGSO (Safety Management System)?",
        options: [
          "A) Increase profits",
          "B) Ensure safe operations and environmental protection",
          "C) Reduce crew size",
          "D) Speed up operations"
        ],
        correct_answer: "B",
        explanation: "The SGSO's main purpose is to ensure safe ship operations and environmental protection through systematic management."
      },
      {
        question: "How often should safety drills be conducted according to SGSO requirements?",
        options: [
          "A) Annually",
          "B) Monthly",
          "C) Quarterly",
          "D) As specified in the SMS manual"
        ],
        correct_answer: "D",
        explanation: "Safety drill frequency should follow the requirements specified in the company's Safety Management System manual."
      }
    ],
    ISO: [
      {
        question: "What does ISO 9001 primarily focus on?",
        options: [
          "A) Environmental management",
          "B) Quality management systems",
          "C) Occupational health and safety",
          "D) Information security"
        ],
        correct_answer: "B",
        explanation: "ISO 9001 is the international standard for quality management systems, focusing on meeting customer requirements and enhancing satisfaction."
      }
    ]
  };

  const questions = templates[quiz_type] || templates.SGSO;
  return questions.slice(0, Math.min(num_questions, questions.length));
}
