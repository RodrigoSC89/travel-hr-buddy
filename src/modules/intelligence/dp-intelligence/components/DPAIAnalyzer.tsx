import { useState, useMemo, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Brain,
  Zap,
  Activity,
  Shield,
  TrendingUp,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";

interface TelemetryData {
  activeThrusters: number;
  totalThrusters: number;
  totalPower: number;
  heading: number;
  gyroDrift: number;
  busA: string;
  busB: string;
  confidence: number;
  windSpeed?: number;
  current?: number;
  waveHeight?: number;
  alertMessage?: string;
}

export default function DPAIAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<string>("full");
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  // Simulated telemetry data - in production, this would come from real sensors
  const [telemetry] = useState<TelemetryData>({
    activeThrusters: 5,
    totalThrusters: 6,
    totalPower: 4.2,
    heading: 127.5,
    gyroDrift: 0.02,
    busA: "OK",
    busB: "OK",
    confidence: 98,
    windSpeed: 18,
    current: 1.2,
    waveHeight: 2.1,
  });

  const runAnalysis = async (type: string) => {
    setIsAnalyzing(true);
    setAnalysisType(type);
    setAnalysis(null);

    try {
      
      const response = await fetch(
        "https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/dp-intelligence-ai",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ telemetry, analysisType: type }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Analysis error:", response.status, errorData);
        console.error("Analysis error:", response.status, errorData);
        
        if (response.status === 429) {
          toast.error("Limite de requisições", {
            description: "Muitas requisições. Aguarde alguns segundos e tente novamente.",
          });
          return;
        }
        
        if (response.status === 402) {
          toast.error("Créditos insuficientes", {
            description: "Adicione créditos ao workspace para continuar usando a IA.",
          });
          return;
        }
        
        toast.error("Erro na análise", {
          description: errorData.message || "Não foi possível completar a análise.",
        });
        return;
      }

      const data = await response.json();

      if (data.error) {
        toast.error(data.error, { description: data.message });
        return;
      }

      setAnalysis(data.analysis);
      setLastAnalysis(new Date());
      toast.success("Análise concluída", {
        description: `Análise ${getAnalysisLabel(type)} completada com sucesso.`,
      });
    } catch (err) {
      console.error("Error:", err);
      console.error("Error:", err);
      toast.error("Erro de conexão", {
        description: "Não foi possível conectar ao serviço de IA. Verifique sua conexão.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAnalysisLabel = (type: string) => {
    switch (type) {
    case "full": return "Completa";
    case "predictive": return "Preditiva";
    case "optimization": return "Otimização";
    case "emergency": return "Emergência";
    default: return type;
    }
  };

  const getStatusColor = (confidence: number) => {
    if (confidence >= 95) return "text-emerald-500";
    if (confidence >= 80) return "text-amber-500";
    return "text-red-500";
  };

  const getStatusBadge = (status: string) => {
    if (status === "OK") {
      return <Badge className="bg-emerald-100 text-emerald-700">OK</Badge>;
    }
    if (status === "WARNING") {
      return <Badge className="bg-amber-100 text-amber-700">Alerta</Badge>;
    }
    return <Badge className="bg-red-100 text-red-700">Crítico</Badge>;
  };

  return (
    <Card className="border border-primary/20 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            DP AI Intelligence Center
            <Badge className="ml-2 bg-primary/10 text-primary">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by AI
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastAnalysis && (
              <span className="text-xs text-muted-foreground">
                Última análise: {lastAnalysis.toLocaleTimeString()}
              </span>
            )}
            <div className={`flex items-center gap-1 ${getStatusColor(telemetry.confidence)}`}>
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-semibold">{telemetry.confidence}%</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Telemetry Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Thrusters</span>
              <Activity className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">
              {telemetry.activeThrusters}
              <span className="text-sm text-muted-foreground">/{telemetry.totalThrusters}</span>
            </p>
            <Progress
              value={(telemetry.activeThrusters / telemetry.totalThrusters) * 100}
              className="h-1 mt-2"
            />
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Potência</span>
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold">
              {telemetry.totalPower.toFixed(1)}
              <span className="text-sm text-muted-foreground"> MW</span>
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Bus Status</span>
              <Shield className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">A:</span>
              {getStatusBadge(telemetry.busA)}
              <span className="text-sm ml-2">B:</span>
              {getStatusBadge(telemetry.busB)}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Gyro Drift</span>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold">
              {telemetry.gyroDrift}
              <span className="text-sm text-muted-foreground">°/min</span>
            </p>
          </div>
        </div>

        {/* Analysis Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handlerunAnalysis}
            disabled={isAnalyzing}
            className="flex-1 min-w-[150px]"
          >
            {isAnalyzing && analysisType === "full" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            Análise Completa
          </Button>
          <Button
            onClick={() => handlerunAnalysis}
            disabled={isAnalyzing}
            variant="secondary"
            className="flex-1 min-w-[150px]"
          >
            {isAnalyzing && analysisType === "predictive" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TrendingUp className="h-4 w-4 mr-2" />
            )}
            Análise Preditiva
          </Button>
          <Button
            onClick={() => handlerunAnalysis}
            disabled={isAnalyzing}
            variant="outline"
            className="flex-1 min-w-[150px]"
          >
            {isAnalyzing && analysisType === "optimization" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Otimização
          </Button>
          <Button
            onClick={() => handlerunAnalysis}
            disabled={isAnalyzing}
            variant="destructive"
            className="flex-1 min-w-[150px]"
          >
            {isAnalyzing && analysisType === "emergency" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <AlertTriangle className="h-4 w-4 mr-2" />
            )}
            Emergência
          </Button>
        </div>

        {/* Analysis Result */}
        {(isAnalyzing || analysis) && (
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                Resultado da Análise IA
                {isAnalyzing && (
                  <Badge variant="outline" className="ml-2">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Processando...
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="relative">
                    <Brain className="h-12 w-12 text-primary animate-pulse" />
                    <Sparkles className="h-6 w-6 text-amber-500 absolute -top-1 -right-1 animate-bounce" />
                  </div>
                  <p className="text-muted-foreground">
                    Analisando dados de telemetria com IA...
                  </p>
                  <Progress value={undefined} className="w-48 h-2" />
                </div>
              ) : analysis ? (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {analysis}
                  </div>
                </ScrollArea>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Environmental Conditions */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg border">
            <span className="text-xs text-muted-foreground">Vento</span>
            <p className="text-lg font-semibold">{telemetry.windSpeed || "N/A"} knots</p>
          </div>
          <div className="p-3 rounded-lg border">
            <span className="text-xs text-muted-foreground">Corrente</span>
            <p className="text-lg font-semibold">{telemetry.current || "N/A"} knots</p>
          </div>
          <div className="p-3 rounded-lg border">
            <span className="text-xs text-muted-foreground">Ondas</span>
            <p className="text-lg font-semibold">{telemetry.waveHeight || "N/A"} m</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
