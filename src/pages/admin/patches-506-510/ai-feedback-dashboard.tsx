import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, RefreshCw, Download, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AIFeedbackService } from "@/services/ai-feedback-service";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface AIFeedbackScore {
  id?: string;
  command_type: string;
  command_data: Record<string, any>;
  self_score: number;
  improvements?: string[];
  metadata?: Record<string, any>;
  created_at?: string;
}

const AIFeedbackDashboard = () => {
  const { toast } = useToast();
  const [scores, setScores] = useState<AIFeedbackScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    try {
      setLoading(true);
      const data = await AIFeedbackService.getAllScores(100);
      setScores(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar scores",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportScores = async () => {
    try {
      const exported = await AIFeedbackService.exportScores();
      const dataStr = JSON.stringify(exported, null, 2);
      const dataUri = "data:application/json;charset=utf-8,"+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `ai-feedback-scores-${new Date().toISOString()}.json`;
      
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      toast({
        title: "Scores Exportados",
        description: `${exported.length} registros exportados`
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: String(error),
        variant: "destructive"
      });
    }
  };

  const commandTypes = Array.from(new Set(scores.map(s => s.command_type)));
  
  const avgScore = scores.length > 0 ? scores.reduce((sum, s) => sum + s.self_score, 0) / scores.length : 0;
  const highScores = scores.filter(s => s.self_score >= 0.8).length;
  const mediumScores = scores.filter(s => s.self_score >= 0.5 && s.self_score < 0.8).length;
  const lowScores = scores.filter(s => s.self_score < 0.5).length;

  // Prepare chart data - last 20 scores with trend
  const chartData = scores
    .slice(0, 20)
    .reverse()
    .map((score, index) => ({
      index: index + 1,
      score: score.self_score * 100,
      type: score.command_type
    }));

  const getScoreBadge = (score: number) => {
    if (score >= 0.8) return <Badge className="bg-green-500">Alto</Badge>;
    if (score >= 0.5) return <Badge variant="secondary">Médio</Badge>;
    return <Badge variant="destructive">Baixo</Badge>;
  };

  const getTrendIcon = () => {
    if (scores.length < 2) return <Minus className="h-4 w-4 text-muted-foreground" />;
    
    const recent = scores.slice(0, 10).reduce((sum, s) => sum + s.self_score, 0) / 10;
    const older = scores.slice(10, 20).reduce((sum, s) => sum + s.self_score, 0) / 10;
    
    if (recent > older) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (recent < older) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-green-500" />
          <div>
            <h1 className="text-3xl font-bold">AI Feedback Loop</h1>
            <p className="text-muted-foreground">PATCH 509 - Self-Learning & Improvement Tracking</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadScores} variant="outline" size="icon">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={exportScores} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar JSON
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Score Médio</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {(avgScore * 100).toFixed(1)}%
              {getTrendIcon()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Scores Altos (≥80%)</CardDescription>
            <CardTitle className="text-3xl text-green-500">{highScores}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Scores Médios (50-79%)</CardDescription>
            <CardTitle className="text-3xl text-yellow-500">{mediumScores}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Scores Baixos (&lt;50%)</CardDescription>
            <CardTitle className="text-3xl text-red-500">{lowScores}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tipos de Comando</CardDescription>
            <CardTitle className="text-3xl">{commandTypes.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução dos Scores</CardTitle>
          <CardDescription>Últimas 20 avaliações de performance da IA</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="index" label={{ value: "Sequência", position: "insideBottom", offset: -5 }} />
              <YAxis label={{ value: "Score (%)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recentes ({scores.length})</TabsTrigger>
          <TabsTrigger value="byType">Por Tipo ({commandTypes.length})</TabsTrigger>
        </TabsList>

        {/* Recent Scores */}
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Scores Recentes</CardTitle>
              <CardDescription>Avaliações mais recentes da IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Carregando scores...</div>
                ) : scores.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Nenhum score registrado</div>
                ) : (
                  scores.slice(0, 50).map(score => (
                    <div key={score.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{score.command_type}</Badge>
                          {getScoreBadge(score.self_score)}
                          <span className="text-sm font-medium">
                            {(score.self_score * 100).toFixed(0)}%
                          </span>
                        </div>
                        {score.created_at && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(score.created_at), { addSuffix: true, locale: ptBR })}
                          </span>
                        )}
                      </div>
                      {score.improvements && score.improvements.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">Melhorias sugeridas:</p>
                          <ul className="text-xs space-y-1">
                            {score.improvements.map((improvement, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                <span>{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Type */}
        <TabsContent value="byType">
          <Card>
            <CardHeader>
              <CardTitle>Scores por Tipo de Comando</CardTitle>
              <CardDescription>Performance média por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commandTypes.map(type => {
                  const typeScores = scores.filter(s => s.command_type === type);
                  const avgTypeScore = typeScores.reduce((sum, s) => sum + s.self_score, 0) / typeScores.length;
                  
                  return (
                    <div key={type} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{type}</Badge>
                          {getScoreBadge(avgTypeScore)}
                        </div>
                        <span className="text-sm font-medium">
                          {(avgTypeScore * 100).toFixed(1)}% média
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{typeScores.length} avaliações</span>
                      </div>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            avgTypeScore >= 0.8 ? "bg-green-500" :
                              avgTypeScore >= 0.5 ? "bg-yellow-500" :
                                "bg-red-500"
                          }`}
                          style={{ width: `${avgTypeScore * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIFeedbackDashboard;
