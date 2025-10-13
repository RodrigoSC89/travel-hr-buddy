import React, { useState, useEffect } from "react";
import { useVoiceRecording, useTextToSpeech } from "@/hooks/use-voice-conversation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Brain,
  Trophy,
  Target,
  Users,
  TrendingUp,
  Star,
  Award
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

interface VoiceInteractionPanelProps {
  crewMemberId: string;
  crewMemberName: string;
}

interface AIInsight {
  id: string;
  analysis_type: string;
  insights_data: any;
  confidence_score: number;
  created_at: string;
}

interface GamificationProfile {
  id: string;
  total_experience_points: number;
  current_level: number;
  badges_earned: any[];
  achievements: any[];
  skill_progression: any;
  leaderboard_rank: number;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  current_progress: number;
  target_value: number;
  status: string;
  deadline: string;
}

export const AdvancedCrewDossierInteraction: React.FC<VoiceInteractionPanelProps> = ({
  crewMemberId,
  crewMemberName
}) => {
  const [activeTab, setActiveTab] = useState<"voice" | "ai" | "gamification" | "goals">("voice");
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [gamificationProfile, setGamificationProfile] = useState<GamificationProfile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isLoadingGamification, setIsLoadingGamification] = useState(false);
  
  const { isRecording, isProcessing, startRecording, stopRecording } = useVoiceRecording();
  const { isSpeaking, speak, stopSpeaking } = useTextToSpeech();
  const { toast } = useToast();

  useEffect(() => {
    loadGamificationProfile();
    loadGoals();
  }, [crewMemberId]);

  const handleVoiceInteraction = async () => {
    try {
      if (isRecording) {
        const transcribedText = await stopRecording();
        if (transcribedText) {
          toast({
            title: "Transcrição completada",
            description: `"${transcribedText}"`,
          });
          
          // Enviar para IA processar
          await processVoiceCommand(transcribedText);
        }
      } else {
        await startRecording();
        toast({
          title: "Gravação iniciada",
          description: "Fale agora para interagir com seu dossiê...",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na interação por voz",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  };

  const processVoiceCommand = async (text: string) => {
    try {
      // Aqui você pode implementar processamento de comandos de voz
      // Por exemplo, interpretar comandos como "mostrar minhas certificações"
      const response = `Processando comando: "${text}". Esta funcionalidade será expandida em breve.`;
      await speak(response);
    } catch (error) {
      logger.error("Failed to process voice command:", error);
    }
  };

  const generateAIInsights = async () => {
    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke("crew-ai-insights", {
        body: { 
          crew_member_id: crewMemberId,
          analysis_type: "comprehensive"
        }
      });

      if (error) throw error;

      toast({
        title: "Análise de IA gerada",
        description: "Novos insights foram gerados para o seu perfil!",
      });

      await loadAIInsights();
    } catch (error) {
      toast({
        title: "Erro ao gerar insights",
        description: "Não foi possível gerar a análise de IA.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const loadAIInsights = async () => {
    try {
      const { data, error } = await supabase
        .from("crew_ai_insights")
        .select("*")
        .eq("crew_member_id", crewMemberId)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setAiInsights(data || []);
    } catch (error) {
      logger.error("Failed to generate AI insights:", error);
    }
  };

  const loadGamificationProfile = async () => {
    setIsLoadingGamification(true);
    try {
      const { data, error } = await supabase.functions.invoke("crew-gamification", {
        body: { 
          crew_member_id: crewMemberId,
          action_type: "get_profile"
        }
      });

      if (error) throw error;
      setGamificationProfile(data.profile);
    } catch (error) {
      logger.error("Failed to load gamification profile:", error);
    } finally {
      setIsLoadingGamification(false);
    }
  };

  const loadGoals = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("crew-goal-tracker", {
        body: { 
          crew_member_id: crewMemberId,
          action: "get_goals"
        }
      });

      if (error) throw error;
      setGoals(data.result?.goals || []);
    } catch (error) {
      logger.error("Failed to load personal goals:", error);
    }
  };

  const createNewGoal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("crew-goal-tracker", {
        body: { 
          crew_member_id: crewMemberId,
          action: "suggest_goals"
        }
      });

      if (error) throw error;

      toast({
        title: "Sugestões de metas geradas",
        description: "Novas metas personalizadas foram sugeridas para você!",
      });
    } catch (error) {
      logger.error("Failed to create new goal:", error);
    }
  };

  const renderVoiceTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Interação por Voz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <Button
              onClick={handleVoiceInteraction}
              variant={isRecording ? "destructive" : "default"}
              size="lg"
              className={`w-32 h-32 rounded-full ${isRecording ? "animate-pulse" : ""}`}
              disabled={isProcessing}
            >
              {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              {isRecording ? "Gravando... Clique para parar" : 
                isProcessing ? "Processando..." : 
                  "Clique para iniciar gravação"}
            </p>
          </div>

          <div className="flex items-center justify-center space-x-2">
            <Button
              onClick={isSpeaking ? stopSpeaking : () => speak("Olá! Como posso ajudar você hoje?")}
              variant="outline"
              size="sm"
            >
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {isSpeaking ? "Parar" : "Teste de Voz"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAITab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Insights de IA
          </CardTitle>
          <Button onClick={generateAIInsights} disabled={isLoadingAI}>
            {isLoadingAI ? "Gerando..." : "Gerar Análise"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiInsights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum insight gerado ainda.</p>
              <p className="text-sm">Clique em "Gerar Análise" para começar.</p>
            </div>
          ) : (
            aiInsights.map((insight) => (
              <Card key={insight.id} className="border-l-4 border-l-primary">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{insight.analysis_type}</Badge>
                    <span className="text-sm text-muted-foreground">
                      Confiança: {(insight.confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm">
                    {insight.insights_data.summary || "Análise disponível nos dados detalhados."}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderGamificationTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Gamificação e Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {gamificationProfile ? (
            <>
              {/* Level and XP */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                  <span className="text-2xl font-bold">Nível {gamificationProfile.current_level}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {gamificationProfile.total_experience_points} XP Total
                </p>
                <Progress 
                  value={(gamificationProfile.total_experience_points % 500) / 5} 
                  className="w-full"
                />
              </div>

              {/* Badges */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Conquistas ({gamificationProfile.badges_earned?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {gamificationProfile.badges_earned?.map((badge, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      <span>{badge.icon}</span>
                      {badge.name}
                    </Badge>
                  )) || <p className="text-sm text-muted-foreground">Nenhuma conquista ainda.</p>}
                </div>
              </div>

              {/* Ranking */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">Ranking Global</span>
                </div>
                <Badge variant="secondary">
                  #{gamificationProfile.leaderboard_rank || "N/A"}
                </Badge>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Carregando perfil de gamificação...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderGoalsTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas de Desenvolvimento
          </CardTitle>
          <Button onClick={createNewGoal} variant="outline" size="sm">
            Sugerir Metas
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma meta definida ainda.</p>
              <p className="text-sm">Clique em "Sugerir Metas" para começar.</p>
            </div>
          ) : (
            goals.map((goal) => (
              <Card key={goal.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{goal.title}</h4>
                    <Badge variant={goal.status === "completed" ? "default" : "secondary"}>
                      {goal.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{goal.current_progress}/{goal.target_value}</span>
                    </div>
                    <Progress 
                      value={(goal.current_progress / goal.target_value) * 100} 
                      className="w-full"
                    />
                  </div>
                  {goal.deadline && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Prazo: {new Date(goal.deadline).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Dossiê Interativo - {crewMemberName}</h2>
        <p className="text-muted-foreground">
          Interface avançada com IA, gamificação e interação por voz
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
        {[
          { id: "voice", label: "Voz", icon: Mic },
          { id: "ai", label: "IA", icon: Brain },
          { id: "gamification", label: "Conquistas", icon: Trophy },
          { id: "goals", label: "Metas", icon: Target }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
              activeTab === id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "voice" && renderVoiceTab()}
      {activeTab === "ai" && renderAITab()}
      {activeTab === "gamification" && renderGamificationTab()}
      {activeTab === "goals" && renderGoalsTab()}
    </div>
  );
};