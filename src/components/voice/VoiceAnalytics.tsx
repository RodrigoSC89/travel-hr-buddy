import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Clock, 
  MessageCircle, 
  Zap,
  TrendingUp,
  Volume2
} from "lucide-react";

interface VoiceAnalyticsProps {
  isConnected: boolean;
  totalMessages: number;
  sessionDuration: number;
  responseTime: number;
  connectionQuality: "excellent" | "good" | "poor";
}

const VoiceAnalytics: React.FC<VoiceAnalyticsProps> = ({
  isConnected,
  totalMessages,
  sessionDuration,
  responseTime,
  connectionQuality
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
    case "excellent": return "text-emerald-500";
    case "good": return "text-yellow-500";
    case "poor": return "text-red-500";
    default: return "text-muted-foreground";
    }
  };

  const getQualityProgress = (quality: string) => {
    switch (quality) {
    case "excellent": return 95;
    case "good": return 70;
    case "poor": return 30;
    default: return 0;
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">Estatísticas da Sessão</h4>
        <Badge variant={isConnected ? "default" : "secondary"}>
          {isConnected ? "Ativo" : "Inativo"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Messages Count */}
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-blue-500" />
          <div>
            <div className="text-lg font-semibold">{totalMessages}</div>
            <div className="text-xs text-muted-foreground">Mensagens</div>
          </div>
        </div>

        {/* Session Duration */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-green-500" />
          <div>
            <div className="text-lg font-semibold">{formatDuration(sessionDuration)}</div>
            <div className="text-xs text-muted-foreground">Duração</div>
          </div>
        </div>

        {/* Response Time */}
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-500" />
          <div>
            <div className="text-lg font-semibold">{responseTime}ms</div>
            <div className="text-xs text-muted-foreground">Resposta</div>
          </div>
        </div>

        {/* Connection Quality */}
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-purple-500" />
          <div>
            <div className={`text-lg font-semibold capitalize ${getQualityColor(connectionQuality)}`}>
              {connectionQuality}
            </div>
            <div className="text-xs text-muted-foreground">Qualidade</div>
          </div>
        </div>
      </div>

      {/* Connection Quality Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Qualidade da Conexão</span>
          <span className={getQualityColor(connectionQuality)}>{getQualityProgress(connectionQuality)}%</span>
        </div>
        <Progress value={getQualityProgress(connectionQuality)} className="h-2" />
      </div>

      {/* Performance Tips */}
      {connectionQuality === "poor" && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-yellow-800 dark:text-yellow-200">
                Dica de Performance
              </div>
              <div className="text-yellow-700 dark:text-yellow-300 mt-1">
                Verifique sua conexão com a internet para melhor qualidade de áudio.
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default VoiceAnalytics;