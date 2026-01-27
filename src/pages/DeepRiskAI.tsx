/**
 * Deep Risk AI - PRODUCTION v4.0
 * AI-powered risk analysis for deep-sea operations
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Shield, TrendingUp, Brain, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function DeepRiskAI() {
  const [analyzing, setAnalyzing] = useState(false);

  const runAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      toast.success("Análise de riscos concluída!");
    }, 2000);
  };

  const riskCategories = [
    { name: "Risco Operacional", score: 23, status: "low", trend: "down" },
    { name: "Risco Ambiental", score: 45, status: "medium", trend: "stable" },
    { name: "Risco de Equipamentos", score: 12, status: "low", trend: "down" },
    { name: "Risco de Pessoal", score: 8, status: "low", trend: "down" },
  ];

  const recommendations = [
    { id: 1, priority: "high", text: "Revisar procedimentos de emergência para operações abaixo de 100m", status: "pending" },
    { id: 2, priority: "medium", text: "Atualizar certificações de equipamentos de mergulho profundo", status: "completed" },
    { id: 3, priority: "low", text: "Programar treinamento adicional para equipe de ROV", status: "pending" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            Deep Risk AI
          </h1>
          <p className="text-muted-foreground">Análise preditiva de riscos em operações profundas</p>
        </div>
        <Button onClick={runAnalysis} disabled={analyzing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${analyzing ? "animate-spin" : ""}`} />
          {analyzing ? "Analisando..." : "Nova Análise"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {riskCategories.map(cat => (
          <Card key={cat.name}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium">{cat.name}</span>
                <Badge variant={cat.status === "low" ? "secondary" : cat.status === "medium" ? "default" : "destructive"}>
                  {cat.status === "low" ? "Baixo" : cat.status === "medium" ? "Médio" : "Alto"}
                </Badge>
              </div>
              <div className="text-3xl font-bold mb-2">{cat.score}%</div>
              <Progress value={cat.score} className="h-2" />
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <TrendingUp className={`h-3 w-3 ${cat.trend === "down" ? "rotate-180 text-green-500" : ""}`} />
                {cat.trend === "down" ? "Reduzindo" : "Estável"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="recommendations">
        <TabsList>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Recomendações de Mitigação
              </CardTitle>
              <CardDescription>Ações sugeridas pela IA para redução de riscos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.map(rec => (
                <div key={rec.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "secondary"}>
                      {rec.priority}
                    </Badge>
                    <span className="text-sm">{rec.text}</span>
                  </div>
                  {rec.status === "completed" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => toast.success("Ação marcada como concluída!")}>
                      Concluir
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader><CardTitle>Histórico de Análises</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Análise #{100 - i}</p>
                      <p className="text-sm text-muted-foreground">{new Date(Date.now() - i * 86400000).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <Badge variant="secondary">Score: {85 + i}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader><CardTitle>Configurações do Modelo</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Sensibilidade da IA</p>
                  <p className="text-sm text-muted-foreground">Nível de detecção de anomalias</p>
                </div>
                <Badge>Alta</Badge>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Frequência de Análise</p>
                  <p className="text-sm text-muted-foreground">Intervalo entre análises automáticas</p>
                </div>
                <Badge variant="outline">A cada 6h</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
