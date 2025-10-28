/**
 * PATCH 455 - Deep Risk AI Complete
 * AI-powered risk detection with deep learning
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Activity, LineChart } from "lucide-react";
import { toast } from "sonner";
import { RiskTimeline } from "@/modules/deep-risk-ai/components/RiskTimeline";
import { AnomalyDetection } from "@/modules/deep-risk-ai/components/AnomalyDetection";
import { RiskPredictions } from "@/modules/deep-risk-ai/components/RiskPredictions";
import { deepRiskAIService } from "@/modules/deep-risk-ai/services/deep-risk-ai-service";
import type { RiskPrediction, Anomaly } from "@/modules/deep-risk-ai/types";

const DeepRiskAIPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("anomalies");
  const [predictions, setPredictions] = useState<RiskPrediction[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeModel();
    loadData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const initializeModel = async () => {
    try {
      await deepRiskAIService.loadModel();
      setModelLoaded(true);
      toast.success("AI model loaded successfully");
    } catch (error) {
      console.error("Error loading model:", error);
      toast.error("Failed to load AI model");
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [predictionsData, anomaliesData] = await Promise.all([
        deepRiskAIService.getPredictions(),
        deepRiskAIService.getAnomalies()
      ]);
      setPredictions(predictionsData);
      setAnomalies(anomaliesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    try {
      toast.info("Running deep analysis...");
      await deepRiskAIService.runAnalysis();
      await loadData();
      toast.success("Analysis complete");
    } catch (error) {
      toast.error("Analysis failed");
    }
  };

  const criticalPredictions = predictions.filter(p => p.severity === "critical");
  const highRiskAnomalies = anomalies.filter(a => a.riskScore > 0.7);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Deep Risk AI</h1>
            <p className="text-sm text-muted-foreground">
              Advanced risk detection using deep learning
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={modelLoaded ? "default" : "secondary"}>
            {modelLoaded ? "Model Ready" : "Loading..."}
          </Badge>
          <Button onClick={handleRunAnalysis} variant="outline" size="sm" disabled={!modelLoaded}>
            Run Analysis
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium">Critical Predictions</span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalPredictions.length}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium">High Risk Anomalies</span>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highRiskAnomalies.length}</div>
            <p className="text-xs text-muted-foreground">Detected patterns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium">Total Predictions</span>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions.length}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium">Model Accuracy</span>
            <LineChart className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">Confidence score</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="anomalies">
            <Activity className="mr-2 h-4 w-4" />
            Anomaly Detection
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <LineChart className="mr-2 h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="predictions">
            <Brain className="mr-2 h-4 w-4" />
            Predictions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="anomalies" className="space-y-4">
          <AnomalyDetection 
            anomalies={anomalies}
          />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <RiskTimeline 
            anomalies={anomalies}
            predictions={predictions}
          />
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <RiskPredictions 
            predictions={predictions}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeepRiskAIPage;
