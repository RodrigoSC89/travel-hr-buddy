/**
import { useEffect, useState, useCallback, useMemo } from "react";;
 * PATCH 537 - Deep Risk AI with ONNX Runtime
 * Browser-based AI risk analysis with real-time scoring
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  AlertTriangle,
  TrendingUp,
  Activity,
  Shield,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { deepRiskAIService } from "@/services/deepRiskAIService";
import type { RiskForecast, RiskLevel } from "@/types/patches-536-540";
import { logger } from "@/lib/logger";

const DeepRiskAIPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("analyzer");
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forecasts, setForecasts] = useState<RiskForecast[]>([]);
  const [statistics, setStatistics] = useState({
    totalForecasts: 0,
    avgRiskScore: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
  });

  // Input states
  const [forecastName, setForecastName] = useState("");
  const [weatherRisk, setWeatherRisk] = useState(0.3);
  const [mechanicalRisk, setMechanicalRisk] = useState(0.2);
  const [crewFatigue, setCrewFatigue] = useState(0.15);
  const [seaState, setSeaState] = useState(0.25);
  const [navigationComplexity, setNavigationComplexity] = useState(0.2);
  const [fuelStatus, setFuelStatus] = useState(0.1);
  const [equipmentStatus, setEquipmentStatus] = useState(0.15);
  const [communicationQuality, setCommunicationQuality] = useState(0.1);

  // Current analysis result
  const [currentAnalysis, setCurrentAnalysis] = useState<{
    score: number;
    level: RiskLevel;
    factors: Array<{ factor: string; weight: number; value: number; description: string }>;
    confidence: number;
    inferenceTime: number;
  } | null>(null);

  useEffect(() => {
    initializeModel();
    loadData();
  }, []);

  const initializeModel = async () => {
    try {
      const loaded = await deepRiskAIService.loadModel();
      setModelLoaded(loaded);
      if (loaded) {
        toast.success("ONNX model loaded successfully");
      } else {
        toast.error("Failed to load ONNX model");
      }
    } catch (error) {
      logger.error("Error initializing deep risk AI model", { error });
      toast.error("Error initializing model");
    }
  });

  const loadData = async () => {
    try {
      const [forecastsData, statsData] = await Promise.all([
        deepRiskAIService.getRiskForecasts(10),
        deepRiskAIService.getRiskStatistics(),
      ]);
      setForecasts(forecastsData);
      setStatistics(statsData);
    } catch (error) {
      logger.error("Error loading deep risk AI data", { error });
    }
  };

  const handleAnalyze = async () => {
    if (!modelLoaded) {
      toast.error("Model not loaded yet");
      return;
    }

    setLoading(true);
    try {
      const result = await deepRiskAIService.calculateRiskScore({
        weather_risk: weatherRisk,
        mechanical_risk: mechanicalRisk,
        crew_fatigue: crewFatigue,
        sea_state: seaState,
        navigation_complexity: navigationComplexity,
        fuel_status: fuelStatus,
        equipment_status: equipmentStatus,
        communication_quality: communicationQuality,
      });

      setCurrentAnalysis(result);
      toast.success(`Risk analysis complete: ${result.level.toUpperCase()} (${result.score.toFixed(1)})`);
    } catch (error) {
      logger.error("Error analyzing risk with deep risk AI", { error, weatherRisk, mechanicalRisk });
      toast.error("Error analyzing risk");
    } finally {
      setLoading(false);
    }
  });

  const handleSaveForecast = async () => {
    if (!currentAnalysis) {
      toast.error("Please run analysis first");
      return;
    }

    if (!forecastName) {
      toast.error("Please provide a forecast name");
      return;
    }

    setLoading(true);
    try {
      const forecast = await deepRiskAIService.createRiskForecast(forecastName, {
        weather_risk: weatherRisk,
        mechanical_risk: mechanicalRisk,
        crew_fatigue: crewFatigue,
        sea_state: seaState,
        navigation_complexity: navigationComplexity,
        fuel_status: fuelStatus,
        equipment_status: equipmentStatus,
        communication_quality: communicationQuality,
      });

      if (forecast) {
        toast.success("Forecast saved successfully");
        setForecastName("");
        loadData();
      } else {
        toast.error("Failed to save forecast");
      }
    } catch (error) {
      logger.error("Error saving risk forecast", { error, forecastName });
      toast.error("Error saving forecast");
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string): string => {
    const colors: Record<string, string> = {
      low: "text-green-600 bg-green-100 border-green-300",
      medium: "text-yellow-600 bg-yellow-100 border-yellow-300",
      high: "text-orange-600 bg-orange-100 border-orange-300",
      critical: "text-red-600 bg-red-100 border-red-300",
    };
    return colors[level] || "text-gray-600 bg-gray-100 border-gray-300";
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
    case "low":
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    case "medium":
      return <Activity className="w-5 h-5 text-yellow-600" />;
    case "high":
      return <AlertTriangle className="w-5 h-5 text-orange-600" />;
    case "critical":
      return <Shield className="w-5 h-5 text-red-600" />;
    default:
      return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            Deep Risk AI Engine
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered risk analysis with ONNX Runtime
          </p>
        </div>
        <div className="flex items-center gap-2">
          {modelLoaded ? (
            <Badge variant="outline" className="bg-green-100 text-green-700">
              <Zap className="w-3 h-3 mr-1" />
              Model Loaded
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-100 text-red-700">
              Model Not Loaded
            </Badge>
          )}
          <Button onClick={loadData} variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Forecasts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalForecasts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.avgRiskScore.toFixed(1)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statistics.lowCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Medium Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {statistics.mediumCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              High Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {statistics.highCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Critical Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statistics.criticalCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analyzer">Risk Analyzer</TabsTrigger>
          <TabsTrigger value="history">Forecast History</TabsTrigger>
        </TabsList>

        {/* Risk Analyzer Tab */}
        <TabsContent value="analyzer" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Factors Input</CardTitle>
                <CardDescription>
                  Adjust risk factors for real-time analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Weather Risk: {(weatherRisk * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[weatherRisk * 100]}
                    onValueChange={([v]) => setWeatherRisk(v / 100}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mechanical Risk: {(mechanicalRisk * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[mechanicalRisk * 100]}
                    onValueChange={([v]) => setMechanicalRisk(v / 100}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Crew Fatigue: {(crewFatigue * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[crewFatigue * 100]}
                    onValueChange={([v]) => setCrewFatigue(v / 100}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sea State: {(seaState * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[seaState * 100]}
                    onValueChange={([v]) => setSeaState(v / 100}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Navigation Complexity: {(navigationComplexity * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[navigationComplexity * 100]}
                    onValueChange={([v]) => setNavigationComplexity(v / 100}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fuel Status: {(fuelStatus * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[fuelStatus * 100]}
                    onValueChange={([v]) => setFuelStatus(v / 100}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Equipment Status: {(equipmentStatus * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[equipmentStatus * 100]}
                    onValueChange={([v]) => setEquipmentStatus(v / 100}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Communication Quality: {(communicationQuality * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[communicationQuality * 100]}
                    onValueChange={([v]) => setCommunicationQuality(v / 100}
                    max={100}
                    step={1}
                  />
                </div>

                <Button 
                  onClick={handleAnalyze} 
                  disabled={loading || !modelLoaded}
                  className="w-full"
                  size="lg"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Analyze Risk
                </Button>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <div className="space-y-4">
              {currentAnalysis ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {getRiskIcon(currentAnalysis.level)}
                        Risk Analysis Result
                      </CardTitle>
                      <CardDescription>
                        Inference time: {currentAnalysis.inferenceTime}ms | Confidence: {currentAnalysis.confidence.toFixed(1)}%
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center py-6">
                        <div className={`text-6xl font-bold ${currentAnalysis.level === "low" ? "text-green-600" : currentAnalysis.level === "medium" ? "text-yellow-600" : currentAnalysis.level === "high" ? "text-orange-600" : "text-red-600"}`}>
                          {currentAnalysis.score.toFixed(1)}
                        </div>
                        <Badge
                          className={`mt-2 text-lg px-4 py-1 ${getRiskLevelColor(currentAnalysis.level)}`}
                        >
                          {currentAnalysis.level.toUpperCase()} RISK
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Risk Factors Contribution</h4>
                        <div className="space-y-2">
                          {currentAnalysis.factors
                            .sort((a, b) => (b.weight * b.value) - (a.weight * a.value))
                            .slice(0, 5)
                            .map((factor, idx) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>{factor.factor}</span>
                                  <span className="font-medium">
                                    {((factor.weight * factor.value) * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary"
                                    style={{ width: `${(factor.weight * factor.value) * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="forecast-name">Forecast Name (optional)</Label>
                        <Input
                          id="forecast-name"
                          value={forecastName}
                          onChange={handleChange}
                          placeholder="e.g., North Atlantic Route Analysis"
                        />
                      </div>

                      <Button
                        onClick={handleSaveForecast}
                        disabled={loading}
                        className="w-full"
                        variant="outline"
                      >
                        Save Forecast to Database
                      </Button>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Analysis Result</CardTitle>
                    <CardDescription>
                      Adjust risk factors and click "Analyze Risk" to see results
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <Brain className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p>No analysis performed yet</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Forecast History
              </CardTitle>
              <CardDescription>
                Recent risk forecasts and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {forecasts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No forecasts saved yet
                  </p>
                ) : (
                  forecasts.map((forecast) => (
                    <div
                      key={forecast.id}
                      className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getRiskIcon(forecast.risk_level || "medium")}
                          <h4 className="font-medium">{forecast.forecast_name}</h4>
                        </div>
                        <Badge className={getRiskLevelColor(forecast.risk_level || "medium")}>
                          {forecast.risk_level?.toUpperCase()} - {forecast.risk_score.toFixed(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Confidence: {forecast.model_confidence?.toFixed(1)}% | 
                        Inference: {forecast.inference_time_ms}ms
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(forecast.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeepRiskAIPage;
