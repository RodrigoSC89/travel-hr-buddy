/**
 * 🎓 Training LXP AI - Edge Function
 * Adaptive Learning, Gamification, VR Training
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LearnerProfile {
  learningStyle: { visual: number; auditory: number; kinesthetic: number; reading: number };
  preferredPace: 'slow' | 'medium' | 'fast';
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  strengths: string[];
  challenges: string[];
  optimalStudyTime: string;
}

interface MicroLesson {
  id: string;
  title: string;
  hook: string;
  concept: string;
  examples: string[];
  application: string;
  quiz: QuizQuestion[];
  xpReward: number;
  badge?: string;
  estimatedMinutes: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface GameProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  badges: string[];
  leaderboardPosition: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let result;

    switch (action) {
      case "build-profile":
        result = await buildLearnerProfile(params, supabase, LOVABLE_API_KEY);
        break;
      case "generate-curriculum":
        result = await generatePersonalizedCurriculum(params, supabase, LOVABLE_API_KEY);
        break;
      case "create-micro-lesson":
        result = await createMicroLesson(params, supabase, LOVABLE_API_KEY);
        break;
      case "adapt-content":
        result = await adaptContentRealtime(params, supabase, LOVABLE_API_KEY);
        break;
      case "update-progress":
        result = await updateGameProgress(params, supabase);
        break;
      case "get-vr-scenario":
        result = await getVRScenario(params);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Log AI interaction
    await supabase.from("ai_audit_logs").insert({
      user_input: JSON.stringify({ action, ...params }),
      ai_response: JSON.stringify(result),
      module_name: "training-lxp-ai",
      model_version: "gemini-2.5-flash",
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Training LXP AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function buildLearnerProfile(
  params: { learnerId: string },
  supabase: any,
  apiKey: string
): Promise<LearnerProfile> {
  // Fetch learner's training history
  const { data: progress } = await supabase
    .from("academy_progress")
    .select("*")
    .eq("user_id", params.learnerId);

  const { data: trainee } = await supabase
    .from("crew_members")
    .select("*")
    .eq("id", params.learnerId)
    .single();

  const prompt = `You are an expert learning psychologist specializing in maritime training.

## Learner Data:
${JSON.stringify({ trainee, progress }, null, 2)}

## Task:
Build a comprehensive learner profile analyzing:

1. Learning Style (percentages must sum to 100):
   - Visual (diagrams, videos, charts)
   - Auditory (lectures, discussions)
   - Kinesthetic (hands-on, simulations)
   - Reading/Writing (manuals, notes)

2. Preferred Pace: slow, medium, or fast

3. Current Level: beginner, intermediate, or advanced

4. Strengths: What they excel at

5. Challenges: Where they struggle

6. Optimal Study Time: Best time of day for learning

Return JSON:
{
  "learningStyle": { "visual": 35, "auditory": 25, "kinesthetic": 25, "reading": 15 },
  "preferredPace": "medium",
  "currentLevel": "intermediate",
  "strengths": ["string"],
  "challenges": ["string"],
  "optimalStudyTime": "morning"
}`;

  const response = await callLovableAI(prompt, apiKey);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Parse error:", e);
  }

  // Fallback profile
  return {
    learningStyle: { visual: 30, auditory: 25, kinesthetic: 30, reading: 15 },
    preferredPace: "medium",
    currentLevel: "intermediate",
    strengths: ["Practical skills", "Safety awareness"],
    challenges: ["Technical documentation", "Time management"],
    optimalStudyTime: "morning",
  };
}

async function generatePersonalizedCurriculum(
  params: { learnerId: string; objective: string; profile?: LearnerProfile },
  supabase: any,
  apiKey: string
): Promise<any> {
  const profile = params.profile || await buildLearnerProfile({ learnerId: params.learnerId }, supabase, apiKey);

  const { data: courses } = await supabase
    .from("academy_courses")
    .select("*")
    .eq("is_published", true);

  const prompt = `You are a maritime training curriculum designer.

## Learner Profile:
${JSON.stringify(profile, null, 2)}

## Learning Objective:
${params.objective}

## Available Courses:
${JSON.stringify(courses || [], null, 2)}

## Task:
Create a personalized learning curriculum that:
1. Matches the learner's style (${profile.learningStyle.visual}% visual, ${profile.learningStyle.kinesthetic}% hands-on)
2. Addresses their challenges
3. Builds on their strengths
4. Respects their pace (${profile.preferredPace})

Return JSON:
{
  "title": "Curriculum title",
  "objective": "Main objective",
  "estimatedHours": 20,
  "modules": [
    {
      "order": 1,
      "title": "Module title",
      "type": "video|reading|interactive|simulation",
      "duration": "2 hours",
      "topics": ["topic1", "topic2"],
      "assessment": "Quiz/Practical"
    }
  ],
  "milestones": [
    { "week": 1, "target": "Complete safety basics" }
  ],
  "personalization": {
    "focusAreas": ["string"],
    "skipTopics": ["string"],
    "extraResources": ["string"]
  }
}`;

  const response = await callLovableAI(prompt, apiKey);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Parse error:", e);
  }

  return {
    title: `Personalized ${params.objective} Curriculum`,
    objective: params.objective,
    estimatedHours: 15,
    modules: [
      { order: 1, title: "Introduction", type: "video", duration: "1 hour", topics: ["Overview"], assessment: "Quiz" },
      { order: 2, title: "Core Concepts", type: "interactive", duration: "3 hours", topics: ["Fundamentals"], assessment: "Practical" },
      { order: 3, title: "Advanced Topics", type: "simulation", duration: "4 hours", topics: ["Advanced"], assessment: "Simulation" },
    ],
    milestones: [{ week: 1, target: "Complete introduction" }],
    personalization: { focusAreas: ["Safety"], skipTopics: [], extraResources: [] },
  };
}

async function createMicroLesson(
  params: { topic: string; profile?: LearnerProfile },
  supabase: any,
  apiKey: string
): Promise<MicroLesson> {
  const prompt = `Create a 5-7 minute micro-lesson about: ${params.topic}

## Requirements:
- Hook: 15-second attention grabber (why this matters)
- Core Concept: 2-minute clear explanation
- Examples: 2-3 practical maritime examples
- Application: 1-minute real-world use case
- Quiz: 3 multiple-choice questions

## Gamification:
- XP reward (30-100 based on difficulty)
- Badge name if completing a series
- Motivational message

Return JSON:
{
  "id": "micro-lesson-uuid",
  "title": "Catchy title",
  "hook": "Why should I care about this?",
  "concept": "Clear explanation of the topic",
  "examples": ["Example 1", "Example 2", "Example 3"],
  "application": "When and how to use this",
  "quiz": [
    {
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Why A is correct"
    }
  ],
  "xpReward": 50,
  "badge": "Badge name or null",
  "estimatedMinutes": 6
}`;

  const response = await callLovableAI(prompt, apiKey);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Parse error:", e);
  }

  return {
    id: `micro-${Date.now()}`,
    title: `Quick Guide: ${params.topic}`,
    hook: "Master this skill in just 5 minutes!",
    concept: `Understanding ${params.topic} is essential for maritime safety.`,
    examples: ["Bridge operations", "Emergency procedures", "Communication protocols"],
    application: "Apply this knowledge daily in your operations.",
    quiz: [
      {
        question: `What is the key principle of ${params.topic}?`,
        options: ["Safety first", "Speed optimization", "Cost reduction", "Crew comfort"],
        correctIndex: 0,
        explanation: "Safety is always the top priority in maritime operations.",
      },
    ],
    xpReward: 50,
    badge: undefined,
    estimatedMinutes: 5,
  };
}

async function adaptContentRealtime(
  params: { learnerId: string; moduleId: string; score: number; timeSpent: number; expectedTime: number },
  supabase: any,
  apiKey: string
): Promise<any> {
  const { score, timeSpent, expectedTime } = params;

  // Fast learner - performing well quickly
  if (score > 0.9 && timeSpent < expectedTime * 0.7) {
    return {
      action: "accelerate",
      reason: "Excellent performance, ready for advanced content",
      adjustments: {
        skipBasics: true,
        addAdvancedContent: true,
        increaseComplexity: true,
        suggestChallenges: true,
      },
      message: "🚀 You're crushing it! Ready for a challenge?",
    };
  }

  // Struggling - needs more support
  if (score < 0.6 || timeSpent > expectedTime * 1.5) {
    return {
      action: "support",
      reason: "Needs additional reinforcement",
      adjustments: {
        addExamples: true,
        simplifyContent: true,
        addVisualAids: true,
        offerAlternativeExplanation: true,
        suggestBreak: timeSpent > expectedTime * 2,
      },
      message: "💪 No worries! Let's try a different approach.",
    };
  }

  // On track
  return {
    action: "maintain",
    reason: "Good progress at expected pace",
    adjustments: {},
    message: "👍 Great progress! Keep going!",
  };
}

async function updateGameProgress(
  params: { learnerId: string; xpGained: number; completedLesson?: string },
  supabase: any
): Promise<GameProgress> {
  // Get current progress
  const { data: current } = await supabase
    .from("academy_progress")
    .select("*")
    .eq("user_id", params.learnerId)
    .single();

  const currentXP = (current?.metadata?.xp || 0) + params.xpGained;
  const newLevel = Math.floor(currentXP / 500) + 1;
  const xpInLevel = currentXP % 500;
  
  // Calculate streak
  const lastActivity = current?.updated_at ? new Date(current.updated_at) : null;
  const today = new Date();
  let streak = current?.metadata?.streak || 0;
  
  if (lastActivity) {
    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff === 1) {
      streak += 1;
    } else if (daysDiff > 1) {
      streak = 1;
    }
  } else {
    streak = 1;
  }

  // Check for new badges
  const badges: string[] = current?.metadata?.badges || [];
  if (currentXP >= 100 && !badges.includes("First Steps")) badges.push("First Steps");
  if (currentXP >= 500 && !badges.includes("Quick Learner")) badges.push("Quick Learner");
  if (currentXP >= 1000 && !badges.includes("Knowledge Seeker")) badges.push("Knowledge Seeker");
  if (streak >= 7 && !badges.includes("Week Warrior")) badges.push("Week Warrior");
  if (streak >= 30 && !badges.includes("Dedicated Learner")) badges.push("Dedicated Learner");

  // Update progress
  await supabase
    .from("academy_progress")
    .upsert({
      user_id: params.learnerId,
      metadata: {
        xp: currentXP,
        level: newLevel,
        streak,
        badges,
        lastLessonCompleted: params.completedLesson,
      },
      updated_at: new Date().toISOString(),
    });

  return {
    level: newLevel,
    xp: currentXP,
    xpToNextLevel: 500 - xpInLevel,
    streak,
    badges,
    leaderboardPosition: Math.max(1, 10 - newLevel), // Simplified
  };
}

function getVRScenario(params: { scenarioType: string }): any {
  const scenarios: Record<string, any> = {
    "fire-fighting": {
      id: "vr-fire-001",
      title: "Engine Room Fire Response",
      description: "Respond to a Class B fire in the engine room",
      duration: "15-20 minutes",
      environment: {
        location: "engine_room",
        visibility: "low",
        hazards: ["fire", "smoke", "heat", "electrical"],
      },
      objectives: [
        { id: "assess", title: "Assess situation", weight: 20 },
        { id: "alert", title: "Raise alarm", weight: 15 },
        { id: "ppe", title: "Don firefighting PPE", weight: 15 },
        { id: "extinguish", title: "Extinguish fire", weight: 30 },
        { id: "secure", title: "Secure area", weight: 20 },
      ],
      passingScore: 80,
      xpReward: 200,
    },
    "abandon-ship": {
      id: "vr-abandon-001",
      title: "Abandon Ship Drill",
      description: "Execute emergency evacuation procedures",
      duration: "20-25 minutes",
      environment: {
        location: "deck",
        conditions: "rough_seas",
        hazards: ["waves", "cold", "panic"],
      },
      objectives: [
        { id: "muster", title: "Report to muster station", weight: 20 },
        { id: "lifejacket", title: "Don lifejacket", weight: 15 },
        { id: "lifeboat", title: "Board lifeboat", weight: 25 },
        { id: "launch", title: "Assist launch", weight: 25 },
        { id: "survival", title: "Survival actions", weight: 15 },
      ],
      passingScore: 85,
      xpReward: 250,
    },
    "medical-emergency": {
      id: "vr-medical-001",
      title: "Medical Emergency Response",
      description: "Provide first aid for cardiac emergency",
      duration: "10-15 minutes",
      environment: {
        location: "crew_quarters",
        conditions: "normal",
        hazards: ["time_pressure"],
      },
      objectives: [
        { id: "assess", title: "Assess patient", weight: 20 },
        { id: "call", title: "Call for help", weight: 15 },
        { id: "cpr", title: "Perform CPR", weight: 35 },
        { id: "aed", title: "Use AED", weight: 20 },
        { id: "handover", title: "Handover to medic", weight: 10 },
      ],
      passingScore: 90,
      xpReward: 300,
    },
  };

  return scenarios[params.scenarioType] || scenarios["fire-fighting"];
}

async function callLovableAI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are an expert maritime training AI. Always respond with valid JSON when requested." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
