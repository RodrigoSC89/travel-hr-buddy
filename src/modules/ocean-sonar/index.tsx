import { useEffect, useState } from "react";;
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Waves, 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Navigation,
  Activity,
  MapPin,
  Download,
  Save,
  FolderOpen,
  Database
} from "lucide-react";
import SonarEngine, { BathymetricData, SonarReading } from "./services/sonarEngine";
import BathymetryExporter from "./services/bathymetryExporter";
import { sonarPersistenceService } from "./services/sonarPersistenceService";
import { toast } from "sonner";

/**
 * PATCH 180.0 - Sonar AI & Bathymetric Scanner
 * PATCH 183.0 - Enhanced with export and offline capabilities
 * PATCH 457 - Enhanced with database persistence and AI predictions
 * 
 * Features:
 * - Real-time bathymetric scanning simulation
 * - AI-powered depth analysis and risk assessment
 * - Color-coded depth visualization
 * - Safe route suggestions
 * - Obstacle detection and warnings
 * - GeoJSON and PNG export
 * - Offline data caching
 * - Database persistence (sonar_readings, sonar_ai_predictions)
 */

const OceanSonar: React.FC = () => {
  const [sonarEngine] = useState(() => SonarEngine.getInstance());
  const [exporter] = useState(() => new BathymetryExporter());
  const [isScanning, setIsScanning] = useState(false);
  const [bathymetricData, setBathymetricData] = useState<BathymetricData | null>(null);
  const [centerLat, setCenterLat] = useState(-23.5505); // São Paulo Bay (example)
  const [centerLon, setCenterLon] = useState(-46.6333);
  const [radiusKm, setRadiusKm] = useState(50);
  const [hasCachedData, setHasCachedData] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    recommendation: string;
    safePath: { lat: number; lon: number }[];
    warnings: string[];
  } | null>(null);
  const [sonarStats, setSonarStats] = useState({
    totalReadings: 0,
    safeReadings: 0,
    cautionReadings: 0,
    dangerReadings: 0,
    avgDepth: 0,
    totalPredictions: 0,
  });

  // Check for cached data and load stats on mount
  useEffect(() => {
    setHasCachedData(exporter.hasCachedData());
    loadSonarStats();
  }, [exporter]);

  const loadSonarStats = async () => {
    const stats = await sonarPersistenceService.getSonarStats();
    if (stats) {
      setSonarStats(stats);
    }
  };

  const startScan = async () => {
    setIsScanning(true);
    setAiAnalysis(null);

    // Simulate scanning delay
    setTimeout(async () => {
      const data = sonarEngine.generateBathymetricData(centerLat, centerLon, radiusKm);
      setBathymetricData(data);
      
      // Save to cache (PATCH 183.0)
      exporter.saveToCache(data);
      setHasCachedData(true);
      
      // Generate AI analysis
      const analysis = sonarEngine.analyzeSafeRoute(data, centerLat + 0.1, centerLon + 0.1);
      setAiAnalysis(analysis);
      
      // PATCH 457: Save to database
      const saveResult = await sonarPersistenceService.saveBathymetricScan(data);
      if (saveResult.success) {
        toast.success(`Scan saved: ${saveResult.readingsCount} readings persisted`);
      }

      // Save AI prediction
      await sonarPersistenceService.saveAIPrediction(
        analysis.recommendation,
        analysis.safePath,
        analysis.warnings,
        { lat: centerLat, lon: centerLon },
        90
      );

      // Reload stats
      await loadSonarStats();
      
      setIsScanning(false);
    }, 2000);
  };

  const getRiskColor = (risk: SonarReading["riskLevel"]) => {
    switch (risk) {
    case "safe":
      return "text-green-400 bg-green-500/10";
    case "caution":
      return "text-yellow-400 bg-yellow-500/10";
    case "danger":
      return "text-red-400 bg-red-500/10";
    }
  };

  const getRiskIcon = (risk: SonarReading["riskLevel"]) => {
    switch (risk) {
    case "safe":
      return <CheckCircle className="w-4 h-4" />;
    case "caution":
    case "danger":
      return <AlertTriangle className="w-4 h-4" />;
    }
  };

  // PATCH 183.0 - Export handlers
  const handleExportGeoJSON = () => {
    if (!bathymetricData) return;
    exporter.downloadGeoJSON(bathymetricData, `bathymetry-${Date.now()}.geojson`);
  };

  const handleExportPNG = async () => {
    if (!bathymetricData) return;
    try {
      await exporter.downloadPNG(bathymetricData, `bathymetry-${Date.now()}.png`, 1200, 1200);
    } catch (error) {
      console.error("Failed to export PNG:", error);
    }
  };

  const handleLoadFromCache = () => {
    const cachedData = exporter.loadFromCache();
    if (cachedData) {
      setBathymetricData(cachedData);
      const analysis = sonarEngine.analyzeSafeRoute(cachedData, centerLat + 0.1, centerLon + 0.1);
      setAiAnalysis(analysis);
    }
  };

  const handleClearCache = () => {
    exporter.clearCache();
    setHasCachedData(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Waves className="w-8 h-8 text-cyan-400" />
              Sonar AI & Bathymetric Scanner
            </h1>
            <p className="text-zinc-400 mt-1">
              Ocean reconnaissance and underwater depth analysis - PATCH 180.0 / PATCH 457
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {isScanning ? (
              <>
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-cyan-400">Scanning...</span>
              </>
            ) : (
              <>
                <Waves className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400">Ready</span>
              </>
            )}
          </div>
        </div>

        {/* PATCH 457: Statistics Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-800/50 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-zinc-400">Total Scans</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {sonarStats.totalReadings}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800/50 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-xs text-zinc-400">Safe Areas</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {sonarStats.safeReadings}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800/50 border-orange-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-zinc-400">Caution Areas</span>
              </div>
              <div className="text-2xl font-bold text-orange-400">
                {sonarStats.cautionReadings}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800/50 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-zinc-400">AI Predictions</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">
                {sonarStats.totalPredictions}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scan Controls */}
        <Card className="bg-zinc-800/50 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              Scan Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Center Latitude</label>
                <Input
                  type="number"
                  step="0.0001"
                  value={centerLat}
                  onChange={(e) => setCenterLat(parseFloat(e.target.value))}
                  className="bg-zinc-900/50 border-zinc-700 text-white"
                  disabled={isScanning}
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Center Longitude</label>
                <Input
                  type="number"
                  step="0.0001"
                  value={centerLon}
                  onChange={(e) => setCenterLon(parseFloat(e.target.value))}
                  className="bg-zinc-900/50 border-zinc-700 text-white"
                  disabled={isScanning}
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Radius (km)</label>
                <Input
                  type="number"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                  className="bg-zinc-900/50 border-zinc-700 text-white"
                  disabled={isScanning}
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                onClick={startScan}
                disabled={isScanning}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {isScanning ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Scanning Ocean Floor...
                  </>
                ) : (
                  <>
                    <Waves className="w-4 h-4 mr-2" />
                    Start Bathymetric Scan
                  </>
                )}
              </Button>
              
              {/* PATCH 183.0 - Cache controls */}
              {hasCachedData && (
                <Button
                  onClick={handleLoadFromCache}
                  variant="outline"
                  className="border-zinc-600"
                  disabled={isScanning}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Load from Cache
                </Button>
              )}
            </div>

            {/* PATCH 183.0 - Export buttons */}
            {bathymetricData && (
              <div className="mt-4 border-t border-zinc-700 pt-4">
                <div className="text-sm text-zinc-400 mb-2">Export Options (PATCH 183.0):</div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleExportGeoJSON}
                    variant="outline"
                    className="border-zinc-600"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export GeoJSON
                  </Button>
                  <Button
                    onClick={handleExportPNG}
                    variant="outline"
                    className="border-zinc-600"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export PNG
                  </Button>
                  {hasCachedData && (
                    <Button
                      onClick={handleClearCache}
                      variant="outline"
                      className="border-zinc-600"
                      size="sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Clear Cache
                    </Button>
                  )}
                </div>
                {hasCachedData && (
                  <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30">
                    Data cached for offline use
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Analysis */}
        {aiAnalysis && (
          <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
                AI Route Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-zinc-900/50 rounded-lg border border-purple-500/20">
                <div className="flex items-start gap-2">
                  <Brain className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <div className="text-xs text-zinc-400 mb-1">AI Recommendation:</div>
                    <p className="text-sm text-white">{aiAnalysis.recommendation}</p>
                  </div>
                </div>
              </div>

              {aiAnalysis.warnings.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-yellow-400">Detected Hazards:</div>
                  {aiAnalysis.warnings.map((warning, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-yellow-300 bg-yellow-500/10 p-2 rounded">
                      <AlertTriangle className="w-4 h-4" />
                      {warning}
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs text-zinc-500">
                Safe waypoints identified: {aiAnalysis.safePath.length}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bathymetric Data */}
        {bathymetricData && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-cyan-400">
                    {bathymetricData.minDepth.toFixed(1)}m
                  </div>
                  <div className="text-sm text-zinc-400">Minimum Depth</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-blue-400">
                    {bathymetricData.avgDepth.toFixed(1)}m
                  </div>
                  <div className="text-sm text-zinc-400">Average Depth</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-indigo-400">
                    {bathymetricData.maxDepth.toFixed(1)}m
                  </div>
                  <div className="text-sm text-zinc-400">Maximum Depth</div>
                </CardContent>
              </Card>
            </div>

            {/* Depth Visualization */}
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-cyan-400" />
                  Bathymetric Map (Color-Coded by Depth)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Bathymetric Grid - Using flex wrapping for 20x20 grid */}
                <div className="flex flex-wrap gap-1 mb-4" style={{ maxWidth: "600px" }}>
                  {bathymetricData.readings.map((reading) => {
                    const color = sonarEngine.getDepthColor(reading.depth);
                    return (
                      <div
                        key={reading.id}
                        className="rounded-sm cursor-pointer hover:ring-2 hover:ring-white transition-all"
                        style={{ 
                          backgroundColor: color,
                          width: "calc(5% - 4px)", // 20 columns
                          aspectRatio: "1"
                        }}
                        title={`Depth: ${reading.depth.toFixed(1)}m\nRisk: ${reading.riskLevel}\nTerrain: ${reading.terrain}`}
                      />
                    );
                  })}
                </div>

                {/* Color Legend */}
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-zinc-400">Depth Legend:</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {sonarEngine.getColorLegend().map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: item.color }}
                        />
                        <div>
                          <div className="font-semibold">{item.depth}</div>
                          <div className="text-zinc-500">{item.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Summary */}
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  Risk Assessment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(["safe", "caution", "danger"] as const).map((risk) => {
                    const count = bathymetricData.readings.filter(r => r.riskLevel === risk).length;
                    const percentage = ((count / bathymetricData.readings.length) * 100).toFixed(1);
                    
                    return (
                      <div key={risk} className={`p-4 rounded-lg ${getRiskColor(risk)}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {getRiskIcon(risk)}
                          <span className="font-semibold capitalize">{risk}</span>
                        </div>
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-sm opacity-75">{percentage}% of area</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default OceanSonar;
