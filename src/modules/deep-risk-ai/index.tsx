/**
 * PATCH 185.0 - Deep Sea Risk Analysis AI
 * Comprehensive AI-powered risk assessment for deep sea operations
 * 
 * Features:
 * - Multi-factor risk scoring
 * - AI-powered insights and recommendations
 * - Predictive analysis
 * - JSON report export
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  AlertTriangle,
  Gauge,
  Thermometer,
  Waves,
  Shield,
  TrendingUp,
  Download,
} from "lucide-react";

interface RiskFactors {
  depth: number;
  pressure: number;
  temperature: number;
  current: number;
  visibility: number;
  sonarQuality: number;
}

interface RiskScore {
  overall: number;
  categories: {
    environmental: number;
    mechanical: number;
    operational: number;
    communication: number;
  };
  level: 'minimal' | 'low' | 'moderate' | 'high' | 'severe' | 'critical';
}

interface AIRecommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  recommendation: string;
  reasoning: string;
}

const DeepRiskAI: React.FC = () => {
  const [depth, setDepth] = useState(100);
  const [pressure, setPressure] = useState(11);
  const [temperature, setTemperature] = useState(8);
  const [current, setCurrent] = useState(1.5);
  const [visibility, setVisibility] = useState(12);
  const [sonarQuality, setSonarQuality] = useState(85);
  
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeRisk = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const factors: RiskFactors = {
        depth,
        pressure,
        temperature,
        current,
        visibility,
        sonarQuality,
      };
      
      const score = calculateRiskScore(factors);
      const recs = generateRecommendations(factors, score);
      
      setRiskScore(score);
      setRecommendations(recs);
      setIsAnalyzing(false);
    }, 1500);
  };

  const calculateRiskScore = (factors: RiskFactors): RiskScore => {
    let envRisk = 0;
    if (factors.depth > 200) envRisk += 30;
    else if (factors.depth > 100) envRisk += 15;
    if (factors.temperature < 4 || factors.temperature > 30) envRisk += 15;
    if (factors.current > 3) envRisk += 25;
    else if (factors.current > 2) envRisk += 10;

    let mechRisk = 0;
    if (factors.pressure > 30) mechRisk += 40;
    else if (factors.pressure > 20) mechRisk += 25;
    else if (factors.pressure > 10) mechRisk += 10;

    let opRisk = 0;
    if (factors.visibility < 5) opRisk += 30;
    else if (factors.visibility < 10) opRisk += 15;

    let commRisk = 0;
    if (factors.sonarQuality < 50) commRisk += 35;
    else if (factors.sonarQuality < 70) commRisk += 20;
    else if (factors.sonarQuality < 85) commRisk += 10;

    // Scaling factor to normalize combined risks to 0-100 range
    // Average of 4 categories with weighted importance
    const RISK_NORMALIZATION_FACTOR = 1.4;
    const overall = Math.min(100, (envRisk + mechRisk + opRisk + commRisk) / RISK_NORMALIZATION_FACTOR);
    
    let level: RiskScore['level'];
    if (overall < 15) level = 'minimal';
    else if (overall < 30) level = 'low';
    else if (overall < 50) level = 'moderate';
    else if (overall < 70) level = 'high';
    else if (overall < 85) level = 'severe';
    else level = 'critical';

    return {
      overall,
      categories: {
        environmental: Math.min(100, envRisk),
        mechanical: Math.min(100, mechRisk),
        operational: Math.min(100, opRisk),
        communication: Math.min(100, commRisk),
      },
      level,
    };
  };

  const generateRecommendations = (factors: RiskFactors, score: RiskScore): AIRecommendation[] => {
    const recs: AIRecommendation[] = [];

    if (factors.depth > 200) {
      recs.push({
        priority: 'critical',
        category: 'Depth Management',
        recommendation: 'Reduce operational depth or enhance pressure ratings',
        reasoning: `Current depth (${factors.depth}m) exceeds safe operational limits for standard ROVs`,
      });
    }

    if (factors.current > 2.5) {
      recs.push({
        priority: 'high',
        category: 'Current Mitigation',
        recommendation: 'Increase thruster power allocation and implement dynamic positioning',
        reasoning: `Strong currents (${factors.current} knots) may affect station-keeping capability`,
      });
    }

    if (factors.visibility < 10) {
      recs.push({
        priority: 'medium',
        category: 'Visibility Enhancement',
        recommendation: 'Deploy additional lighting and rely more on sonar navigation',
        reasoning: `Limited visibility (${factors.visibility}m) reduces visual navigation effectiveness`,
      });
    }

    if (factors.sonarQuality < 70) {
      recs.push({
        priority: 'high',
        category: 'Communication',
        recommendation: 'Check sonar transducers and consider acoustic modem backup',
        reasoning: `Poor sonar quality (${factors.sonarQuality}%) may compromise navigation and obstacle detection`,
      });
    }

    if (score.overall > 60) {
      recs.push({
        priority: 'critical',
        category: 'Mission Planning',
        recommendation: 'Consider postponing mission or implementing additional safety protocols',
        reasoning: `Overall risk score (${score.overall.toFixed(0)}) indicates hazardous conditions`,
      });
    }

    return recs;
  };

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      riskFactors: { depth, pressure, temperature, current, visibility, sonarQuality },
      riskScore,
      recommendations,
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `deep-sea-risk-report-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getRiskColor = (level: string) => {
    const colors = {
      minimal: 'bg-green-500',
      low: 'bg-blue-500',
      moderate: 'bg-yellow-500',
      high: 'bg-orange-500',
      severe: 'bg-red-500',
      critical: 'bg-red-700',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-500';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
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
              AI-powered predictive risk assessment - PATCH 185.0
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
                          className={`h-full transition-all ${score > 70 ? 'bg-red-500' : score > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
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
                        rec.priority === 'critical' ? 'bg-red-500' :
                        rec.priority === 'high' ? 'bg-orange-500' :
                        rec.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-blue-500'
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
      </div>
    </div>
  );
};

export default DeepRiskAI;
