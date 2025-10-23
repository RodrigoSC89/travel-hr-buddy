import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { autonomyEngine, AutonomousAction } from "@/lib/autonomy/AutonomyEngine";
import { patternRecognition } from "@/lib/autonomy/PatternRecognition";
import { hotfixManager } from "@/lib/autonomy/HotfixManager";
import { Activity, Brain, CheckCircle, AlertTriangle, Zap, TrendingUp, Shield } from "lucide-react";

export default function AutonomyConsole() {
  const [actions, setActions] = useState<AutonomousAction[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [patternStats, setPatternStats] = useState<any>(null);
  const [hotfixStats, setHotfixStats] = useState<any>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Start autonomy engine
    autonomyEngine.start();
    setIsActive(true);

    // Load initial data
    loadData();

    // Refresh data every 5 seconds
    const interval = setInterval(loadData, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadData = () => {
    setActions(autonomyEngine.getRecentActions(20));
    setStats(autonomyEngine.getStatistics());
    setPatternStats(patternRecognition.getStatistics());
    setHotfixStats(hotfixManager.getStatistics());
  };

  const toggleAutonomy = () => {
    if (isActive) {
      autonomyEngine.stop();
      setIsActive(false);
    } else {
      autonomyEngine.start();
      setIsActive(true);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "restart": return "🔄";
      case "cache-clear": return "🧹";
      case "reconnect-ai": return "🧠";
      case "hotfix": return "🔧";
      case "fallback": return "🛡️";
      default: return "⚙️";
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "restart": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "cache-clear": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "reconnect-ai": return "bg-pink-500/10 text-pink-500 border-pink-500/20";
      case "hotfix": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "fallback": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            Console de Autonomia
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema de decisão autônoma e aprendizado contínuo
          </p>
        </div>
        <Button
          onClick={toggleAutonomy}
          variant={isActive ? "destructive" : "default"}
          className="gap-2"
        >
          {isActive ? <Activity className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
          {isActive ? "Pausar Autonomia" : "Ativar Autonomia"}
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isActive ? (
                <span className="text-green-500">Ativo</span>
              ) : (
                <span className="text-gray-500">Inativo</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sistema de autonomia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Ações Executadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalActions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Taxa de sucesso: {stats?.successRate?.toFixed(1) || 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              Padrões Aprendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patternStats?.totalPatterns || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Confiança média: {patternStats?.averageConfidence?.toFixed(1) || 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-500" />
              Hotfixes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hotfixStats?.totalHotfixes || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {hotfixStats?.totalApplied || 0} aplicados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Ações Autônomas Recentes
          </CardTitle>
          <CardDescription>
            Últimas 20 decisões tomadas pelo sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            {actions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma ação autônoma executada ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {actions.map((action) => (
                  <Card key={action.id} className="border-l-4" style={{
                    borderLeftColor: action.success ? '#22c55e' : '#ef4444'
                  }}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{getActionIcon(action.action)}</span>
                            <Badge className={getActionColor(action.action)}>
                              {action.action}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {action.moduleId}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium mb-1">{action.reason}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Brain className="w-3 h-3" />
                              Confiança: {(action.confidence * 100).toFixed(0)}%
                            </span>
                            <span>{new Date(action.timestamp).toLocaleString('pt-BR')}</span>
                          </div>
                        </div>
                        <div>
                          {action.success ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
