/**
 * PATCH 631 - Compliance Status Dashboard
 * Real-time compliance monitoring with automated audit simulation
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Shield,
  AlertCircle,
  Clock,
  TrendingUp
} from "lucide-react";
import {
  runComplianceAudit,
  getComplianceAlerts,
  getComplianceScoreByStandard,
  type ComplianceReport,
  type ComplianceAlert
} from "@/lib/compliance/continuous-checker";
import { logger } from "@/lib/logger";

export default function ComplianceStatusPage() {
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [scoresByStandard, setScoresByStandard] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadData = async () => {
    setLoading(true);
    try {
      const [auditReport, alertsData, scores] = await Promise.all([
        runComplianceAudit("manual"),
        getComplianceAlerts(),
        getComplianceScoreByStandard()
      ]);

      setReport(auditReport);
      setAlerts(alertsData);
      setScoresByStandard(scores);
      setLastUpdate(new Date());
    } catch (error) {
      logger.error("Error loading compliance data", { error });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      pass: { variant: "default", className: "bg-green-100 text-green-800" },
      fail: { variant: "destructive", className: "bg-red-100 text-red-800" },
      warning: { variant: "default", className: "bg-yellow-100 text-yellow-800" },
      not_applicable: { variant: "secondary", className: "bg-gray-100 text-gray-800" }
    };
    return variants[status] || variants.not_applicable;
  };

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg">Running compliance audit...</p>
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
            Continuous Compliance Engine
          </h1>
          <p className="text-muted-foreground mt-1">
            Automated compliance validation and audit simulation
          </p>
        </div>
        <div className="text-right">
          <Button onClick={loadData} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Run Audit
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Last audit: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Critical Alerts */}
      {alerts.filter(a => a.severity === "critical").length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Compliance Issues</AlertTitle>
          <AlertDescription>
            {alerts.filter(a => a.severity === "critical").length} critical issue(s) detected.
            Immediate action required to maintain compliance.
          </AlertDescription>
        </Alert>
      )}

      {/* Overall Score */}
      {report && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Overall Compliance Score</span>
              <span className={`text-4xl font-bold ${getScoreColor(report.score)}`}>
                {report.score}%
              </span>
            </CardTitle>
            <CardDescription>
              {report.score >= 90 && "✅ System is audit-ready"}
              {report.score >= 75 && report.score < 90 && "⚡ Action needed within 30 days"}
              {report.score < 75 && "⚠️ Immediate review required"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={report.score} className="h-4 mb-4" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <div className="text-2xl font-bold">{report.passed}</div>
                <div className="text-xs text-muted-foreground">Passed</div>
              </div>
              <div>
                <AlertCircle className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                <div className="text-2xl font-bold">{report.warnings}</div>
                <div className="text-xs text-muted-foreground">Warnings</div>
              </div>
              <div>
                <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-1" />
                <div className="text-2xl font-bold">{report.failed}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scores by Standard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(scoresByStandard).map(([standard, score]) => (
          <Card key={standard}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{standard}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                {score}%
              </div>
              <Progress value={score} className="h-2 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      {report && report.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Detailed Checks */}
      {report && (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Checks ({report.totalChecks})</TabsTrigger>
            <TabsTrigger value="failed">Failed ({report.failed})</TabsTrigger>
            <TabsTrigger value="warnings">Warnings ({report.warnings})</TabsTrigger>
            <TabsTrigger value="ISM">ISM</TabsTrigger>
            <TabsTrigger value="MLC">MLC</TabsTrigger>
            <TabsTrigger value="MARPOL">MARPOL</TabsTrigger>
            <TabsTrigger value="PSC">PSC</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ChecksList checks={report.checks} getStatusBadge={getStatusBadge} />
          </TabsContent>

          <TabsContent value="failed">
            <ChecksList 
              checks={report.checks.filter(c => c.status === "fail")} 
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>

          <TabsContent value="warnings">
            <ChecksList 
              checks={report.checks.filter(c => c.status === "warning")} 
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>

          {["ISM", "MLC", "MARPOL", "PSC"].map(standard => (
            <TabsContent key={standard} value={standard}>
              <ChecksList 
                checks={report.checks.filter(c => c.standard === standard)} 
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

function ChecksList({ 
  checks, 
  getStatusBadge 
}: { 
  checks: any[];
  getStatusBadge: (status: string) => { variant: any; className: string };
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-3">
          {checks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No checks in this category</p>
          ) : (
            checks.map((check) => {
              const badgeStyle = getStatusBadge(check.status);
              return (
                <div
                  key={check.id}
                  className="border rounded-lg p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={badgeStyle.className}>
                        {check.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{check.standard}</Badge>
                      <span className="text-sm text-muted-foreground">{check.section}</span>
                    </div>
                    <Badge 
                      variant={check.severity === "critical" ? "destructive" : "secondary"}
                      className="ml-2"
                    >
                      {check.severity}
                    </Badge>
                  </div>

                  <p className="font-medium mb-1">{check.requirement}</p>
                  <p className="text-sm text-muted-foreground mb-2">{check.message}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(check.timestamp).toLocaleString()}
                    </span>
                    {check.automated && (
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Automated Check
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
