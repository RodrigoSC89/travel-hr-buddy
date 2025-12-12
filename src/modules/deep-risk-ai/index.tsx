/**
 * PATCH 433 - Deep Sea Risk Analysis AI
 * Comprehensive AI-powered risk assessment for deep sea operations
 * Integrated with analytics-core, incident logs, and forecast data
 * 
 * Features:
 * - Multi-factor risk scoring with historical analysis
 * - AI-powered insights and recommendations
 * - Predictive analysis with trend detection
 * - Real-time risk dashboard
 * - Event logging and tracking
 * - JSON report export
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  AlertTriangle,
  Gauge,
  Thermometer,
  Waves,
  Shield,
  TrendingUp,
  Download,
  Activity,
  Clock,
  Database,
} from "lucide-react";
import { deepRiskAIService, type RiskFactors, type RiskScore, type RiskRecommendation } from "./services/deepRiskAIService";
import { toast } from "sonner";

const DeepRiskAI: React.FC = () => {
  const [depth, setDepth] = useState(100);
  const [pressure, setPressure] = useState(11);
  const [temperature, setTemperature] = useState(8);
  const [current, setCurrent] = useState(1.5);
  const [visibility, setVisibility] = useState(12);
  const [sonarQuality, setSonarQuality] = useState(85);
  const [windSpeed, setWindSpeed] = useState(15);
  const [waveHeight, setWaveHeight] = useState(2);
  
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);
  const [recommendations, setRecommendations] = useState<RiskRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [eventHistory, setEventHistory] = useState<any[]>([]);

  // Load event history on mount
  useEffect(() => {
    loadEventHistory();
  }, []);

  const loadEventHistory = async () => {
    try {
      const history = await deepRiskAIService.getRiskEventHistory(20);
      setEventHistory(history);
    } catch (error) {
      console.error("Failed to load event history:", error);
    }
  };

  const analyzeRisk = async () => {
    setIsAnalyzing(true);
    
    try {
      const factors: RiskFactors = {
        depth,
        pressure,
        temperature,
        current,
        visibility,
        sonarQuality,
        windSpeed,
        waveHeight,
      };
      
      // Calculate risk score with full integration
      const score = await deepRiskAIService.calculateRiskScore(factors);
      const recs = await deepRiskAIService.generateRecommendations(factors, score);
      const pred = await deepRiskAIService.predictRisk(factors);
      
      setRiskScore(score);
      setRecommendations(recs);
      setPrediction(pred);

      // Log the risk event
      await deepRiskAIService.logRiskEvent({
        timestamp: new Date().toISOString(),
        eventType: "risk_assessment",
        riskScore: score.overall,
        riskLevel: score.level,
        factors,
        recommendations: recs,
        resolved: false,
      });

      // Reload history
      await loadEventHistory();

      toast.success(`Análise de risco concluída: ${score.level.toUpperCase()}`);
    } catch (error) {
      console.error("Risk analysis failed:", error);
      toast.error("Falha na análise de risco");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      riskFactors: { 
        depth, 
        pressure, 
        temperature, 
        current, 
        visibility, 
        sonarQuality,
        windSpeed,
        waveHeight,
      },
      riskScore,
      recommendations,
      prediction,
      eventHistory: eventHistory.slice(0, 10), // Include last 10 events
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `deep-sea-risk-report-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success("Relatório exportado com sucesso");
  };

  const getRiskColor = (level: string) => {
    const colors = {
      minimal: "bg-green-500",
      low: "bg-blue-500",
      moderate: "bg-yellow-500",
      high: "bg-orange-500",
      severe: "bg-red-500",
      critical: "bg-red-700",
    };
    return colors[level as keyof typeof colors] || "bg-gray-500";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      critical: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[priority as keyof typeof colors] || "bg-gray-500/20 text-gray-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-400 animate-pulse" />
              Deep Sea Risk Analysis AI
            </h1>
            <p className="text-zinc-400 mt-1">
              AI-powered predictive risk assessment - PATCH 433
            </p>
          </div>
          {riskScore && (
            <Badge className={`${getRiskColor(riskScore.level)} text-lg px-4 py-2`}>
              {riskScore.level.toUpperCase()} RISK
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-cyan-400" />
                Environmental Data Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-2 block flex items-center gap-1">
                    <Waves className="w-3 h-3" /> Depth (m)
                  </label>
                  <Input
                    type="number"
                    value={depth}
                    onChange={(e) => setDepth(parseFloat(e.target.value))}
                    className="bg-zinc-900/50 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-2 block">Pressure (bar)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={pressure}
                    onChange={(e) => setPressure(parseFloat(e.target.value))}
                    className="bg-zinc-900/50 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-2 block flex items-center gap-1">
                    <Thermometer className="w-3 h-3" /> Temperature (°C)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="bg-zinc-900/50 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-2 block">Current (knots)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={current}
                    onChange={(e) => setCurrent(parseFloat(e.target.value))}
                    className="bg-zinc-900/50 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-2 block">Visibility (m)</label>
                  <Input
                    type="number"
                    value={visibility}
                    onChange={(e) => setVisibility(parseFloat(e.target.value))}
                    className="bg-zinc-900/50 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-2 block">Sonar Quality (%)</label>
                  <Input
                    type="number"
                    value={sonarQuality}
                    onChange={(e) => setSonarQuality(parseFloat(e.target.value))}
                    className="bg-zinc-900/50 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-2 block">Wind Speed (kts)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={windSpeed}
                    onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
                    className="bg-zinc-900/50 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-2 block">Wave Height (m)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={waveHeight}
                    onChange={(e) => setWaveHeight(parseFloat(e.target.value))}
                    className="bg-zinc-900/50 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <Button
                onClick={analyzeRisk}
                disabled={isAnalyzing}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isAnalyzing ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Run AI Risk Analysis
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {riskScore && (
            <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  Risk Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-purple-400 mb-2">
                    {riskScore.overall.toFixed(0)}
                  </div>
                  <div className="text-sm text-zinc-400">Overall Risk Score</div>
                </div>
                
                <Separator className="bg-zinc-700" />
                
                <div className="space-y-3">
                  {Object.entries(riskScore.categories).map(([category, score]) => (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize text-zinc-300">{category}</span>
                        <span className="font-semibold text-purple-400">{score.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${score > 70 ? "bg-red-500" : score > 40 ? "bg-yellow-500" : "bg-green-500"}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {recommendations.length > 0 && (
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  AI Recommendations ({recommendations.length})
                </div>
                <Button onClick={exportReport} variant="outline" className="border-zinc-600" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded border ${getPriorityColor(rec.priority)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-semibold text-sm">{rec.category}</span>
                      </div>
                      <Badge className={
                        rec.priority === "critical" ? "bg-red-500" :
                          rec.priority === "high" ? "bg-orange-500" :
                            rec.priority === "medium" ? "bg-yellow-500" :
                              "bg-blue-500"
                      }>
                        {rec.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-sm mb-2">
                      <strong>Recommendation:</strong> {rec.recommendation}
                    </div>
                    <div className="text-xs opacity-80 bg-black/20 p-2 rounded">
                      <strong>AI Reasoning:</strong> {rec.reasoning}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Predictive Analysis */}
        {prediction && (
          <Card className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Análise Preditiva com IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">
                    {prediction.predictedScore.toFixed(0)}
                  </div>
                  <div className="text-xs text-zinc-400">Score Previsto</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    {prediction.confidence.toFixed(0)}%
                  </div>
                  <div className="text-xs text-zinc-400">Confiança</div>
                </div>
                <div className="text-center">
                  <Badge className={
                    prediction.trendDirection === "increasing" ? "bg-red-500" :
                      prediction.trendDirection === "decreasing" ? "bg-green-500" :
                        "bg-blue-500"
                  }>
                    {prediction.trendDirection === "increasing" ? "↗ AUMENTANDO" :
                      prediction.trendDirection === "decreasing" ? "↘ DIMINUINDO" :
                        "→ ESTÁVEL"}
                  </Badge>
                  <div className="text-xs text-zinc-400 mt-1">Tendência</div>
                </div>
              </div>
              <div className="p-3 bg-cyan-500/10 rounded border border-cyan-500/30">
                <div className="flex items-start gap-2">
                  <Brain className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <strong className="text-cyan-400">Recomendação Preditiva:</strong>
                    <p className="text-zinc-300 mt-1">{prediction.recommendation}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Event History */}
        {eventHistory.length > 0 && (
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                Histórico de Eventos de Risco
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {eventHistory.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 border border-zinc-700 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-zinc-400" />
                          <span className="text-sm text-zinc-400">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <Badge className={getRiskColor(event.riskLevel)} variant="outline">
                          {event.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-300">Score:</span>
                        <span className="font-semibold text-purple-400">
                          {event.riskScore.toFixed(0)}
                        </span>
                        <span className="text-zinc-500">|</span>
                        <span className="text-zinc-300">Tipo:</span>
                        <span className="text-zinc-400">{event.eventType}</span>
                      </div>
                      {event.notes && (
                        <p className="text-xs text-zinc-500 mt-2">{event.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DeepRiskAI;
