// @ts-ignore: Deno types
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno types
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuizRequest {
  standard: string;
  difficulty: string;
  count?: number;
}

interface Question {
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  category?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get request body
    const { standard, difficulty, count = 10 }: QuizRequest = await req.json();

    if (!standard || !difficulty) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: standard and difficulty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try to fetch from quiz_templates first
    const { data: templates, error: templatesError } = await supabase
      .from("quiz_templates")
      .select("*")
      .eq("standard", standard)
      .eq("difficulty", difficulty)
      .eq("is_active", true)
      .limit(count);

    if (!templatesError && templates && templates.length >= count) {
      // Use existing templates
      const questions: Question[] = templates.map((t: any) => ({
        question: t.question,
        options: t.options,
        correct_answer: t.correct_answer,
        explanation: t.explanation,
        category: t.category,
      }));

      return new Response(
        JSON.stringify({ questions, source: "templates" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try AI generation (GPT-4) if OpenAI key is available
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (openaiKey) {
      try {
        const prompt = `Generate ${count} multiple choice quiz questions about ${standard} at ${difficulty} difficulty level.
        
Each question should:
1. Test practical knowledge of ${standard} standards and procedures
2. Have 4 options
3. Have one clearly correct answer
4. Include a brief explanation

Format the response as a JSON array with this structure:
[
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "The correct option text",
    "explanation": "Brief explanation of why this is correct",
    "category": "Category name"
  }
]

Focus on real-world maritime compliance scenarios for ${standard}.`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: "You are a maritime compliance expert specializing in safety standards and regulations. Generate high-quality quiz questions that test practical knowledge.",
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

        if (response.ok) {
          const data = await response.json();
          const content = data.choices[0].message.content;
          
          // Parse the JSON response
          let questions: Question[];
          try {
            // Try to extract JSON from markdown code blocks if present
            const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
            const jsonString = jsonMatch ? jsonMatch[1] : content;
            questions = JSON.parse(jsonString);
          } catch (parseError) {
            console.error("Failed to parse AI response:", parseError);
            throw new Error("AI generated invalid response format");
          }

          // Validate the structure
          if (Array.isArray(questions) && questions.length > 0) {
            return new Response(
              JSON.stringify({ questions, source: "ai" }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      } catch (aiError) {
        console.error("AI generation failed:", aiError);
        // Fall through to fallback generation
      }
    }

    // Fallback to basic question generation
    const fallbackQuestions: Question[] = generateFallbackQuestions(standard, difficulty, count);

    return new Response(
      JSON.stringify({ questions: fallbackQuestions, source: "fallback" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating quiz:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateFallbackQuestions(standard: string, difficulty: string, count: number): Question[] {
  const questions: Question[] = [];

  const questionTemplates = [
    {
      question: `What is the primary purpose of ${standard}?`,
      options: [
        "Safety and compliance management",
        "Cost reduction",
        "Marketing strategies",
        "Administrative efficiency",
      ],
      correct_answer: "Safety and compliance management",
      explanation: `${standard} primarily focuses on ensuring safety and regulatory compliance in maritime operations.`,
      category: "Fundamentals",
    },
    {
      question: `Which industry sector does ${standard} primarily serve?`,
      options: [
        "Maritime and offshore operations",
        "Agriculture",
        "Retail",
        "Manufacturing",
      ],
      correct_answer: "Maritime and offshore operations",
      explanation: `${standard} is specifically designed for the maritime and offshore industry.`,
      category: "Overview",
    },
    {
      question: `Who is responsible for implementing ${standard} standards?`,
      options: [
        "All relevant personnel and management",
        "Only the safety officer",
        "Only external auditors",
        "Only government inspectors",
      ],
      correct_answer: "All relevant personnel and management",
      explanation: `Implementation of ${standard} requires commitment from all levels of the organization.`,
      category: "Responsibilities",
    },
    {
      question: `What is a key benefit of ${standard} compliance?`,
      options: [
        "Improved safety culture and risk management",
        "Reduced training requirements",
        "Elimination of all documentation",
        "Automatic certification",
      ],
      correct_answer: "Improved safety culture and risk management",
      explanation: `${standard} compliance enhances overall safety culture and systematic risk management.`,
      category: "Benefits",
    },
    {
      question: `How often should ${standard} procedures be reviewed?`,
      options: [
        "Regularly and after incidents",
        "Only once per year",
        "Never, once established",
        "Only when regulations change",
      ],
      correct_answer: "Regularly and after incidents",
      explanation: `Continuous improvement requires regular reviews and updates, especially after incidents.`,
      category: "Best Practices",
    },
  ];

  // Generate questions by cycling through templates
  for (let i = 0; i < count; i++) {
    const template = questionTemplates[i % questionTemplates.length];
    questions.push({
      ...template,
      question: `${template.question} (Question ${i + 1})`,
    });
  }

  // Adjust difficulty by modifying some questions
  if (difficulty === "Advanced") {
    questions.forEach((q, idx) => {
      if (idx % 2 === 0) {
        q.question = q.question.replace("What", "Analyze how");
        q.question = q.question.replace("Which", "Evaluate which");
      }
    });
  }

  return questions;
}
