/**
 * Code Audit Report Page - PATCH 70.0
 * Visual interface for code quality audits
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileCode, Play, Download, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { codeAuditor, CodeAuditResult } from "@/lib/auditor/CodeAuditor";
import { Logger } from "@/lib/utils/logger";
import { useToast } from "@/hooks/use-toast";

export default function CodeAuditReport() {
  const [isRunning, setIsRunning] = useState(false);
  const [auditResult, setAuditResult] = useState<CodeAuditResult | null>(null);
  const { toast } = useToast();

  const runAudit = async () => {
    try {
      setIsRunning(true);
      Logger.info("Starting manual code audit", undefined, "CodeAuditReport");

      toast({
        title: "🔍 Running Code Audit",
        description: "Analyzing codebase quality...",
      });

      const result = await codeAuditor.runWeeklyAudit();
      setAuditResult(result);

      toast({
        title: "✅ Audit Complete",
        description: `Quality Score: ${result.score}/100`,
      });

    } catch (error) {
      Logger.error("Audit failed", error, "CodeAuditReport");
      toast({
        title: "❌ Audit Failed",
        description: "Failed to complete code audit",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const exportReport = () => {
    if (!auditResult) return;

    const report = codeAuditor.getFormattedReport(auditResult);
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code-audit-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "📄 Report Exported",
      description: "Audit report downloaded successfully",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-600">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-600">Good</Badge>;
    return <Badge className="bg-red-600">Needs Improvement</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <FileCode className="w-10 h-10 text-blue-600" />
            Code Quality Audit
          </h1>
          <p className="text-muted-foreground mt-2">
            Automated code quality analysis and recommendations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="lg"
            onClick={runAudit}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? (
              <>
                <Play className="w-5 h-5 mr-2 animate-spin" />
                Running Audit...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Run Audit
              </>
            )}
          </Button>
          {auditResult && (
            <Button
              size="lg"
              variant="outline"
              onClick={exportReport}
            >
              <Download className="w-5 h-5 mr-2" />
              Export Report
            </Button>
          )}
        </div>
      </div>

      {!auditResult && !isRunning && (
        <Alert>
          <FileCode className="w-4 h-4" />
          <AlertDescription>
            Click "Run Audit" to analyze code quality and generate recommendations.
            Audits are also run automatically every week.
          </AlertDescription>
        </Alert>
      )}

      {auditResult && (
        <>
          {/* Quality Score */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Overall Quality Score</CardTitle>
                  <CardDescription>
                    Generated: {new Date(auditResult.timestamp).toLocaleString()}
                  </CardDescription>
                </div>
                {getScoreBadge(auditResult.score)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getScoreColor(auditResult.score)}`}>
                    {auditResult.score}/100
                  </div>
                  <Progress value={auditResult.score} className="mt-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issues Breakdown */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">TypeScript Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {auditResult.typeScriptIssues}
                </div>
                {auditResult.typeScriptIssues > 10 ? (
                  <XCircle className="w-5 h-5 text-red-600 mt-2" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-2" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Unused Imports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {auditResult.unusedImports}
                </div>
                {auditResult.unusedImports > 5 ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-2" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-2" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Long Functions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {auditResult.longFunctions}
                </div>
                {auditResult.longFunctions > 8 ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-2" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-2" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Duplicate Code</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {auditResult.duplicateCode}
                </div>
                {auditResult.duplicateCode > 3 ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-2" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-2" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Missing Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {auditResult.missingTests}
                </div>
                {auditResult.missingTests > 15 ? (
                  <XCircle className="w-5 h-5 text-red-600 mt-2" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-2" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {auditResult.issuesFound}
                </div>
                {auditResult.issuesFound > 40 ? (
                  <XCircle className="w-5 h-5 text-red-600 mt-2" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-2" />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Recommendations</CardTitle>
              <CardDescription>Prioritized action items to improve code quality</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditResult.recommendations.map((rec, index) => (
                  <Alert key={index}>
                    <AlertDescription className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">{index + 1}</Badge>
                      <span>{rec}</span>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
