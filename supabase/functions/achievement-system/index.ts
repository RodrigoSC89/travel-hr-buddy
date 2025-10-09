import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AchievementRequest {
  userId: string
  action: string
  context?: {
    module: string
    action_type: string
    metadata?: any
  }
  progress_data?: {
    certificates_managed?: number
    reports_generated?: number
    workflows_created?: number
    collaboration_sessions?: number
    ai_features_used?: number
  }
}

interface Achievement {
  achievement_id: string
  title: string
  description: string
  category: "productivity" | "collaboration" | "innovation" | "leadership"
  points: number
  progress: number
  max_progress: number
  unlocked: boolean
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: AchievementRequest = await req.json();
    console.log("Achievement System Request:", body);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get current user achievements
    const { data: currentAchievements, error: fetchError } = await supabaseClient
      .from("user_achievements")
      .select("*")
      .eq("user_id", body.userId);

    if (fetchError) {
      console.error("Error fetching achievements:", fetchError);
    }

    // Define all available achievements
    const allAchievements: Achievement[] = [
      {
        achievement_id: "certificate_master",
        title: "Mestre de Certificações",
        description: "Gerencie 50 certificados com sucesso",
        category: "productivity",
        points: 500,
        progress: body.progress_data?.certificates_managed || 0,
        max_progress: 50,
        unlocked: false
      },
      {
        achievement_id: "collaboration_expert",
        title: "Expert em Colaboração",
        description: "Participe de 25 sessões colaborativas",
        category: "collaboration",
        points: 300,
        progress: body.progress_data?.collaboration_sessions || 0,
        max_progress: 25,
        unlocked: false
      },
      {
        achievement_id: "ai_innovator",
        title: "Inovador com IA",
        description: "Use 10 recursos diferentes de IA",
        category: "innovation",
        points: 750,
        progress: body.progress_data?.ai_features_used || 0,
        max_progress: 10,
        unlocked: false
      },
      {
        achievement_id: "workflow_architect",
        title: "Arquiteto de Workflows",
        description: "Crie e otimize 15 workflows",
        category: "productivity",
        points: 400,
        progress: body.progress_data?.workflows_created || 0,
        max_progress: 15,
        unlocked: false
      },
      {
        achievement_id: "report_generator",
        title: "Gerador de Relatórios",
        description: "Gere 100 relatórios detalhados",
        category: "productivity",
        points: 200,
        progress: body.progress_data?.reports_generated || 0,
        max_progress: 100,
        unlocked: false
      },
      {
        achievement_id: "first_login",
        title: "Primeiro Acesso",
        description: "Bem-vindo ao Nautilus One!",
        category: "productivity",
        points: 50,
        progress: 1,
        max_progress: 1,
        unlocked: true
      },
      {
        achievement_id: "early_adopter",
        title: "Adotante Precoce",
        description: "Use o sistema por 30 dias consecutivos",
        category: "leadership",
        points: 600,
        progress: 15, // Simulated progress
        max_progress: 30,
        unlocked: false
      },
      {
        achievement_id: "efficiency_master",
        title: "Mestre da Eficiência",
        description: "Complete 500 tarefas no sistema",
        category: "productivity",
        points: 1000,
        progress: 156, // Simulated progress
        max_progress: 500,
        unlocked: false
      },
      {
        achievement_id: "communication_champion",
        title: "Campeão da Comunicação",
        description: "Envie 200 mensagens no sistema",
        category: "collaboration",
        points: 300,
        progress: 45, // Simulated progress
        max_progress: 200,
        unlocked: false
      },
      {
        achievement_id: "innovation_leader",
        title: "Líder em Inovação",
        description: "Sugira 5 melhorias implementadas",
        category: "leadership",
        points: 800,
        progress: 2, // Simulated progress
        max_progress: 5,
        unlocked: false
      }
    ];

    // Update progress based on action
    const updatedAchievements = allAchievements.map(achievement => {
      let newProgress = achievement.progress;

      // Update progress based on action type
      switch (body.action) {
      case "certificate_created":
      case "certificate_updated":
        if (achievement.achievement_id === "certificate_master") {
          newProgress = Math.min(newProgress + 1, achievement.max_progress);
        }
        break;
        
      case "collaboration_session":
        if (achievement.achievement_id === "collaboration_expert") {
          newProgress = Math.min(newProgress + 1, achievement.max_progress);
        }
        break;
        
      case "ai_feature_used":
        if (achievement.achievement_id === "ai_innovator") {
          newProgress = Math.min(newProgress + 1, achievement.max_progress);
        }
        break;
        
      case "workflow_created":
        if (achievement.achievement_id === "workflow_architect") {
          newProgress = Math.min(newProgress + 1, achievement.max_progress);
        }
        break;
        
      case "report_generated":
        if (achievement.achievement_id === "report_generator") {
          newProgress = Math.min(newProgress + 1, achievement.max_progress);
        }
        break;
        
      case "task_completed":
        if (achievement.achievement_id === "efficiency_master") {
          newProgress = Math.min(newProgress + 1, achievement.max_progress);
        }
        break;
        
      case "message_sent":
        if (achievement.achievement_id === "communication_champion") {
          newProgress = Math.min(newProgress + 1, achievement.max_progress);
        }
        break;
      }

      // Check if achievement should be unlocked
      const wasUnlocked = achievement.unlocked;
      const isNowUnlocked = newProgress >= achievement.max_progress;

      return {
        ...achievement,
        progress: newProgress,
        unlocked: isNowUnlocked || wasUnlocked
      };
    });

    // Find newly unlocked achievements
    const newlyUnlocked = updatedAchievements.filter(achievement => 
      !allAchievements.find(a => a.achievement_id === achievement.achievement_id)?.unlocked && 
      achievement.unlocked
    );

    // Store/update achievements in database
    const achievementsToUpsert = updatedAchievements.map(achievement => ({
      user_id: body.userId,
      achievement_id: achievement.achievement_id,
      title: achievement.title,
      description: achievement.description,
      category: achievement.category,
      points: achievement.points,
      progress: achievement.progress,
      max_progress: achievement.max_progress,
      unlocked: achievement.unlocked,
      unlocked_at: achievement.unlocked && !allAchievements.find(a => a.achievement_id === achievement.achievement_id)?.unlocked 
        ? new Date().toISOString() 
        : null
    }));

    // Delete existing achievements for this user and insert updated ones
    const { error: deleteError } = await supabaseClient
      .from("user_achievements")
      .delete()
      .eq("user_id", body.userId);

    if (deleteError) {
      console.error("Error deleting old achievements:", deleteError);
    }

    const { error: insertError } = await supabaseClient
      .from("user_achievements")
      .insert(achievementsToUpsert);

    if (insertError) {
      console.error("Error storing achievements:", insertError);
    } else {
      console.log(`Updated ${achievementsToUpsert.length} achievements for user ${body.userId}`);
    }

    // Generate notifications for newly unlocked achievements
    const notifications = [];
    for (const achievement of newlyUnlocked) {
      notifications.push({
        user_id: body.userId,
        type: "achievement_unlocked",
        priority: "medium",
        title: `Conquista Desbloqueada: ${achievement.title}!`,
        message: `Parabéns! Você desbloqueou "${achievement.title}" e ganhou ${achievement.points} pontos.`,
        action_text: "Ver Conquistas",
        action_type: "navigate",
        action_data: { module: "innovation", tab: "gamification" },
        category: "Gamificação",
        estimated_read_time: "30s"
      });
    }

    if (notifications.length > 0) {
      const { error: notificationError } = await supabaseClient
        .from("intelligent_notifications")
        .insert(notifications);

      if (notificationError) {
        console.error("Error creating notifications:", notificationError);
      }
    }

    // Calculate user statistics
    const totalPoints = updatedAchievements.reduce((sum, ach) => 
      ach.unlocked ? sum + ach.points : sum, 0);
    
    const unlockedCount = updatedAchievements.filter(ach => ach.unlocked).length;
    
    // Determine user level based on points
    const level = Math.floor(totalPoints / 200) + 1;
    
    // Determine rank based on level
    let rank = "Iniciante";
    if (level >= 10) rank = "Especialista Corporate";
    else if (level >= 7) rank = "Profissional Avançado";
    else if (level >= 5) rank = "Especialista";
    else if (level >= 3) rank = "Profissional";

    return new Response(
      JSON.stringify({
        success: true,
        achievements: updatedAchievements,
        newly_unlocked: newlyUnlocked,
        user_stats: {
          total_points: totalPoints,
          level: level,
          rank: rank,
          achievements_unlocked: unlockedCount,
          achievements_total: updatedAchievements.length
        },
        action_processed: body.action,
        notifications_created: notifications.length
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Achievement System Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});