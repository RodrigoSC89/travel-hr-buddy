/**
 * PATCH 435 - Sonar AI Enhancement
 * Enhanced AI sonar data interpretation with risk detection
 * 
 * Features:
 * - Real-time sonar data analysis with enhanced mock data
 * - Visual wave/frequency panel with charts
 * - Improved pattern detection logic
 * - Object detection alerts with logging
 * - Detection history tracking
 * - Risk assessment and hazard detection
 * - AI-powered navigation recommendations
 * - Bathymetric depth mapping
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Radar,
  Brain,
  AlertTriangle,
  Shield,
  Activity,
  Waves,
  MapPin,
  Target,
  TrendingUp,
  Database,
  CheckCircle,
} from "lucide-react";
import DataAnalyzer, { SonarAnalysis } from "./dataAnalyzer";
import RiskInterpreter, { RiskAssessment, Hazard } from "./riskInterpreter";
import { sonarAIService, type SonarDetection } from "./services/sonarAIService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const SonarAI: React.FC = () => {
  const { user } = useAuth();
  const [analyzer] = useState(() => new DataAnalyzer());
  const [interpreter] = useState(() => new RiskInterpreter());
  
  const [isScanning, setIsScanning] = useState(false);
  const [analysis, setAnalysis] = useState<SonarAnalysis | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [detections, setDetections] = useState<SonarDetection[]>([]);
  const [detectionHistory, setDetectionHistory] = useState<SonarDetection[]>([]);
  const [visualizationData, setVisualizationData] = useState<any>(null);
  
  // Scan parameters
  const [scanDepth, setScanDepth] = useState(50);
  const [scanRadius, setScanRadius] = useState(100);
  const [numPings, setNumPings] = useState(360);
  
  // Auto-scan
  const [autoScan, setAutoScan] = useState(false);

  // Load detection history on mount
  useEffect(() => {
    loadDetectionHistory();
  }, []);

  const loadDetectionHistory = async () => {
    try {
      const history = await sonarAIService.getRecentDetections(20);
      setDetectionHistory(history);
    } catch (error) {
      console.error("Failed to load detection history:", error);
    }
  };

  // Perform scan
  const performScan = async () => {
    setIsScanning(true);

    try {
      // Generate enhanced mock data with realistic patterns
      const mockData = sonarAIService.generateEnhancedMockData(scanDepth, scanRadius, numPings);
      
      // Analyze pings
      const sonarAnalysis = analyzer.analyzePings(mockData.returns.map(r => r.ping));
      setAnalysis(sonarAnalysis);

      // Assess risks
      const risks = interpreter.assessRisks(
        mockData.returns,
        sonarAnalysis.patterns,
        scanDepth
      );
      setRiskAssessment(risks);

      // Process detections with enhanced service
      const newDetections = await sonarAIService.processDetections(sonarAnalysis, user?.id);
      setDetections(newDetections);

      // Generate visualization data
      const vizData = sonarAIService.generateVisualizationData(sonarAnalysis);
      setVisualizationData(vizData);

      // Log the scan
      await sonarAIService.logScan({
        timestamp: new Date().toISOString(),
        scanDepth,
        scanRadius,
        numPings,
        qualityScore: sonarAnalysis.qualityScore,
        coverage: sonarAnalysis.coverage,
        detectionsCount: newDetections.length,
        analysis: sonarAnalysis,
        userId: user?.id,
      });

      // Reload detection history
      await loadDetectionHistory();

      if (mockData.includeObjects) {
        toast.success(`Scan concluído: ${mockData.objectCount} objetos detectados!`);
      } else {
        toast.success("Scan concluído - Área limpa");
      }
    } catch (error) {
      console.error("Scan failed:", error);
      toast.error("Falha no scan");
    } finally {
      setIsScanning(false);
    }
  };

  // Auto-scan effect
  useEffect(() => {
    if (!autoScan) return;

    const interval = setInterval(() => {
      performScan();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoScan, scanDepth, scanRadius, numPings]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
    case "safe": return "bg-green-500";
    case "caution": return "bg-yellow-500";
    case "dangerous": return "bg-orange-500";
    case "critical": return "bg-red-500";
    default: return "bg-gray-500";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "low": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "critical": return "bg-red-500/20 text-red-400 border-red-500/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Radar className="w-8 h-8 text-cyan-400 animate-pulse" />
              Sonar AI Enhancement
            </h1>
            <p className="text-zinc-400 mt-1">
              Real-time sonar analysis with AI-powered risk detection - PATCH 435
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isScanning && (
              <Badge className="bg-cyan-500 animate-pulse">
                SCANNING
              </Badge>
            )}
            {riskAssessment && (
              <Badge className={getRiskColor(riskAssessment.overallRisk)}>
                {riskAssessment.overallRisk.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {analysis && riskAssessment && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-zinc-800/50 border-cyan-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-zinc-400">Quality Score</span>
                </div>
                <div className="text-2xl font-bold text-cyan-400">
                  {analysis.qualityScore.toFixed(0)}%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-blue-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-zinc-400">Coverage</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {analysis.coverage.toFixed(0)}%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-orange-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-zinc-400">Hazards</span>
                </div>
                <div className="text-2xl font-bold text-orange-400">
                  {riskAssessment.hazards.length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-green-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-zinc-400">Safe Zones</span>
                </div>
                <div className="text-2xl font-bold text-green-400">
                  {riskAssessment.safeZones.length}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scan Configuration */}
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radar className="w-5 h-5 text-cyan-400" />
                Scan Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-2 block">Center Depth (m)</label>
                  <Input
                    type="number"
                    value={scanDepth}
                    onChange={(e) => setScanDepth(parseFloat(e.target.value))}
                    className="bg-zinc-900/50 border-zinc-700 text-white"
                    disabled={isScanning || autoScan}
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-2 block">Scan Radius (m)</label>
                  <Input
                    type="number"
                    value={scanRadius}
                    onChange={(e) => setScanRadius(parseFloat(e.target.value))}
                    className="bg-zinc-900/50 border-zinc-700 text-white"
                    disabled={isScanning || autoScan}
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-2 block">Resolution (pings)</label>
                  <Input
                    type="number"
                    value={numPings}
                    onChange={(e) => setNumPings(parseInt(e.target.value))}
                    className="bg-zinc-900/50 border-zinc-700 text-white"
                    disabled={isScanning || autoScan}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={performScan}
                  disabled={isScanning || autoScan}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                >
                  {isScanning ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Radar className="w-4 h-4 mr-2" />
                      Start Scan
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setAutoScan(!autoScan)}
                  variant={autoScan ? "destructive" : "outline"}
                  className={autoScan ? "" : "border-zinc-600"}
                >
                  {autoScan ? "Stop Auto" : "Auto Scan"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Summary */}
          {analysis && riskAssessment && (
            <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
                  AI Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-zinc-900/50 rounded-lg border border-purple-500/20">
                  <div className="flex items-start gap-2">
                    <Brain className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs text-zinc-400 mb-1">Navigation Recommendation:</div>
                      <p className="text-sm text-white">{riskAssessment.navigationAdvice}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-zinc-400 text-xs mb-1">Risk Score</div>
                    <div className="text-2xl font-bold text-orange-400">
                      {riskAssessment.riskScore.toFixed(0)}/100
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-400 text-xs mb-1">Anomalies Detected</div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {riskAssessment.detectedAnomalies}
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-400 text-xs mb-1">Patterns Found</div>
                    <div className="text-2xl font-bold text-cyan-400">
                      {analysis.patterns.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-400 text-xs mb-1">Scan Resolution</div>
                    <div className="text-lg font-bold text-blue-400">
                      {analysis.resolution.toFixed(1)}m
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Hazards & Safe Zones */}
        {riskAssessment && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Detected Hazards */}
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  Detected Hazards ({riskAssessment.hazards.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {riskAssessment.hazards.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500">
                    <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No hazards detected</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {riskAssessment.hazards.map((hazard: Hazard) => (
                      <div
                        key={hazard.id}
                        className={`p-3 rounded border ${getSeverityColor(hazard.severity)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-semibold text-sm capitalize">
                              {hazard.type.replace("_", " ")}
                            </span>
                          </div>
                          <Badge className={`${getRiskColor(hazard.severity === "critical" ? "critical" : hazard.severity === "high" ? "dangerous" : hazard.severity === "medium" ? "caution" : "safe")} text-xs`}>
                            {hazard.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs mb-2">{hazard.description}</p>
                        <div className="text-xs opacity-75">
                          📍 {hazard.location.angle.toFixed(0)}° @ {hazard.location.distance.toFixed(0)}m, 
                          Depth: {hazard.location.depth.toFixed(0)}m
                        </div>
                        <div className="text-xs mt-2 bg-black/20 p-2 rounded">
                          💡 {hazard.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Safe Zones */}
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  Safe Zones ({riskAssessment.safeZones.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {riskAssessment.safeZones.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No safe zones identified</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {riskAssessment.safeZones.map((zone) => (
                      <div
                        key={zone.id}
                        className="p-3 bg-green-500/10 rounded border border-green-500/30"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-400" />
                            <span className="font-semibold text-sm text-green-400">
                              Safe Zone
                            </span>
                          </div>
                          <div className="text-xs text-green-400">
                            Safety: {zone.safetyScore.toFixed(0)}%
                          </div>
                        </div>
                        <div className="text-xs text-green-300 mb-2">
                          📍 Heading {zone.center.angle.toFixed(0)}° @ {zone.center.distance.toFixed(0)}m
                        </div>
                        <div className="text-xs space-y-1">
                          {zone.characteristics.map((char, idx) => (
                            <div key={idx} className="text-green-300/80">
                              ✓ {char}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detected Patterns */}
        {analysis && analysis.patterns.length > 0 && (
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Detected Patterns ({analysis.patterns.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.patterns.map((pattern) => (
                  <div
                    key={pattern.type + pattern.location.angle}
                    className="p-3 bg-purple-500/10 rounded border border-purple-500/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm capitalize text-purple-400">
                        {pattern.type.replace("_", " ")}
                      </span>
                      <span className="text-xs text-purple-300">
                        {pattern.confidence.toFixed(0)}% confidence
                      </span>
                    </div>
                    <p className="text-xs text-purple-200 mb-2">{pattern.description}</p>
                    <div className="text-xs text-purple-300/70">
                      📍 {pattern.location.angle.toFixed(0)}° @ {pattern.location.distance.toFixed(0)}m
                      <br />
                      Size: ~{pattern.size.toFixed(1)}m
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detection History */}
        {detectionHistory.length > 0 && (
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 w-5 text-blue-400" />
                Histórico de Detecções ({detectionHistory.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {detectionHistory.map((detection) => (
                  <div
                    key={detection.id}
                    className="p-3 border border-zinc-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {detection.detectionType === "object" ? (
                          <Target className="w-4 h-4 text-cyan-400" />
                        ) : detection.detectionType === "hazard" ? (
                          <AlertTriangle className="w-4 h-4 text-orange-400" />
                        ) : (
                          <Radar className="w-4 h-4 text-purple-400" />
                        )}
                        <span className="text-sm font-medium capitalize">
                          {detection.detectionType.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            detection.severity === "critical"
                              ? "destructive"
                              : detection.severity === "high"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {detection.severity.toUpperCase()}
                        </Badge>
                        {detection.resolved && (
                          <Badge variant="outline" className="text-green-400 border-green-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Resolvido
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-zinc-300 mb-2">{detection.description}</p>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span>
                        📍 {detection.location.angle.toFixed(0)}° @ {detection.location.distance.toFixed(0)}m
                      </span>
                      <span>Confiança: {detection.confidence.toFixed(0)}%</span>
                      <span>{new Date(detection.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SonarAI;
