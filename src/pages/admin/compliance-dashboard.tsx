/**
 * PATCH 629 - Compliance Dashboard
 * Real-time risk monitoring and predictive compliance analysis
 */

import { useEffect, useState, useCallback } from "react";;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  RefreshCw,
  FileWarning
} from "lucide-react";
import { predictComplianceRisks, getRiskSummary, type RiskScore } from "@/lib/ai/risk-predictor";
import { logger } from "@/lib/logger";

export default function ComplianceDashboard() {
  const [risks, setRisks] = useState<RiskScore[]>([]);
  const [summary, setSummary] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadRiskData = async () => {
    setLoading(true);
    try {
      const [riskData, summaryData] = await Promise.all([
        predictComplianceRisks(),
        getRiskSummary()
      ]);
      setRisks(riskData);
      setSummary(summaryData);
      setLastUpdate(new Date());
    } catch (error) {
      logger.error("Error loading risk data", { error });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRiskData();
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
    case "critical": return "text-red-600 bg-red-50 border-red-200";
    case "high": return "text-orange-600 bg-orange-50 border-orange-200";
    case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "low": return "text-green-600 bg-green-50 border-green-200";
    default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getRiskBadgeVariant = (level: string): "default" | "secondary" | "destructive" | "outline" => {
    if (level === "critical" || level === "high") return "destructive";
    if (level === "medium") return "default";
    return "secondary";
  };

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg">Analyzing compliance risks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Predictive Risk Engine
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered compliance risk monitoring and prediction
          </p>
        </div>
        <div className="text-right">
          <Button onClick={loadRiskData} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Last update: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Critical Risks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{summary.criticalCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Immediate action required</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">High Risks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{summary.highCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Schedule inspection urgently</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Medium Risks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{summary.mediumCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Monitor closely</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Average Risk Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.averageScore}</div>
              <p className="text-xs text-muted-foreground mt-1">Out of 100</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Critical Alerts */}
      {risks.filter(r => r.riskLevel === "critical").length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Compliance Risks Detected</AlertTitle>
          <AlertDescription>
            {risks.filter(r => r.riskLevel === "critical").length} module(s) require immediate attention.
            Failure to address these issues may result in compliance violations during inspection.
          </AlertDescription>
        </Alert>
      )}

      {/* Risk Details Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Modules ({risks.length})</TabsTrigger>
          <TabsTrigger value="critical">
            Critical ({risks.filter(r => r.riskLevel === "critical").length})
          </TabsTrigger>
          <TabsTrigger value="high">
            High ({risks.filter(r => r.riskLevel === "high").length})
          </TabsTrigger>
          <TabsTrigger value="medium">
            Medium ({risks.filter(r => r.riskLevel === "medium").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {risks.map((risk) => (
            <RiskCard key={risk.moduleId} risk={risk} getRiskColor={getRiskColor} getRiskBadgeVariant={getRiskBadgeVariant} />
          ))}
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          {risks.filter(r => r.riskLevel === "critical").map((risk) => (
            <RiskCard key={risk.moduleId} risk={risk} getRiskColor={getRiskColor} getRiskBadgeVariant={getRiskBadgeVariant} />
          ))}
        </TabsContent>

        <TabsContent value="high" className="space-y-4">
          {risks.filter(r => r.riskLevel === "high").map((risk) => (
            <RiskCard key={risk.moduleId} risk={risk} getRiskColor={getRiskColor} getRiskBadgeVariant={getRiskBadgeVariant} />
          ))}
        </TabsContent>

        <TabsContent value="medium" className="space-y-4">
          {risks.filter(r => r.riskLevel === "medium").map((risk) => (
            <RiskCard key={risk.moduleId} risk={risk} getRiskColor={getRiskColor} getRiskBadgeVariant={getRiskBadgeVariant} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RiskCard({ 
  risk, 
  getRiskColor,
  getRiskBadgeVariant 
}: { 
  risk: RiskScore;
  getRiskColor: (level: string) => string;
  getRiskBadgeVariant: (level: string) => "default" | "secondary" | "destructive" | "outline";
}) {
  return (
    <Card className={`border-2 ${getRiskColor(risk.riskLevel)}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {risk.moduleName}
              <Badge variant={getRiskBadgeVariant(risk.riskLevel)}>
                {risk.riskLevel.toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-2 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {risk.daysWithoutInspection} days since last inspection
              </span>
              {risk.lastInspectionDate && (
                <span className="text-xs">
                  Last: {new Date(risk.lastInspectionDate).toLocaleDateString()}
                </span>
              )}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{risk.score}</div>
            <div className="text-xs text-muted-foreground">Risk Score</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Risk Score Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Risk Level</span>
            <span>{risk.score}/100</span>
          </div>
          <Progress value={risk.score} className="h-2" />
        </div>

        {/* Prediction */}
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertTitle>Prediction</AlertTitle>
          <AlertDescription>{risk.prediction}</AlertDescription>
        </Alert>

        {/* Risk Factors */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <FileWarning className="h-4 w-4" />
            Risk Factors
          </h4>
          <div className="space-y-2">
            {risk.factors.map((factor, idx) => (
              <div key={idx} className="text-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{factor.factor}</span>
                  <span className="text-muted-foreground">
                    {factor.value.toFixed(1)} pts (weight: {(factor.weight * 100).toFixed(0)}%)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{factor.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Actions */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Recommended Actions
          </h4>
          <ul className="space-y-1">
            {risk.recommendedActions.map((action, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
