/**
 * ML & Analytics Dashboard
 * Nauti One v4.0 - Simplified Version
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, TrendingUp, AlertTriangle, Activity, BarChart3,
  RefreshCw, Eye, Zap, Target
} from "lucide-react";
import { toast } from "sonner";

interface Anomaly {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  value: number;
  description: string;
}

interface Prediction {
  date: string;
  value: number;
  confidence: number;
  lowerBound: number;
  upperBound: number;
}

const MLAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState("anomalies");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    toast.info("Analisando dados para anomalias...");
    
    await new Promise(r => setTimeout(r, 2000));
    
    // Mock anomalies
    const mockAnomalies: Anomaly[] = [
      { id: '1', type: 'Statistical Outlier', severity: 'high', confidence: 0.92, value: 156.7, description: 'CPU usage spike detected' },
      { id: '2', type: 'Pattern Deviation', severity: 'medium', confidence: 0.85, value: 89.3, description: 'Unusual traffic pattern' },
      { id: '3', type: 'Threshold Breach', severity: 'critical', confidence: 0.98, value: 203.5, description: 'Memory usage exceeded limit' },
    ];
    
    // Mock predictions
    const mockPredictions: Prediction[] = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() + (i + 1) * 86400000).toISOString().split('T')[0],
      value: 75 + Math.random() * 20,
      confidence: 0.85 - i * 0.05,
      lowerBound: 60 + Math.random() * 10,
      upperBound: 90 + Math.random() * 15,
    }));
    
    setAnomalies(mockAnomalies);
    setPredictions(mockPredictions);
    toast.success(`Análise concluída: ${mockAnomalies.length} anomalias detectadas`);
    setIsAnalyzing(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-blue-500 bg-blue-500/10';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            ML & Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">Detecção de Anomalias & Análise Preditiva</p>
        </div>
        <Button onClick={handleAnalyze} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Analisando...</>
          ) : (
            <><Zap className="h-4 w-4 mr-2" /> Analisar Dados</>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Anomalias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{anomalies.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Precisão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">94.5%</div>
            <Progress value={94.5} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Falsos Positivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">2.3%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Pontos Analisados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">125,430</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="anomalies">🚨 Anomalias</TabsTrigger>
          <TabsTrigger value="predictions">📈 Previsões</TabsTrigger>
        </TabsList>

        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Anomalias Detectadas</CardTitle>
              <CardDescription>Padrões anormais identificados pelo modelo de ML</CardDescription>
            </CardHeader>
            <CardContent>
              {anomalies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Clique em "Analisar Dados" para detectar anomalias</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {anomalies.map((anomaly) => (
                    <div key={anomaly.id} className={`p-4 rounded-lg border ${getSeverityColor(anomaly.severity)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5" />
                          <div>
                            <p className="font-medium">{anomaly.type}</p>
                            <p className="text-sm opacity-75">{anomaly.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={anomaly.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {anomaly.severity}
                          </Badge>
                          <p className="text-xs mt-1">Confiança: {(anomaly.confidence * 100).toFixed(0)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Previsões Preditivas</CardTitle>
              <CardDescription>Projeções para os próximos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              {predictions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Clique em "Analisar Dados" para gerar previsões</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {predictions.map((pred, index) => (
                    <div key={index} className="p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Dia +{index + 1}</p>
                          <p className="text-sm text-muted-foreground">{pred.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{pred.value.toFixed(1)}</p>
                          <p className="text-xs text-muted-foreground">
                            Intervalo: {pred.lowerBound.toFixed(1)} - {pred.upperBound.toFixed(1)}
                          </p>
                        </div>
                      </div>
                      <Progress value={pred.confidence * 100} className="mt-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MLAnalyticsDashboard;
