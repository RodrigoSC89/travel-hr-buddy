/**
 * Code Health Dashboard
 * PATCH 541 - Quality metrics & technical debt visualization
 */

import { useState } from "react";;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Code, 
  FileText, 
  Layers,
  RefreshCw,
  TestTube,
  TrendingUp,
  Zap
} from "lucide-react";
import { codeHealthAnalyzer, CodeHealthReport } from "@/lib/quality/code-health-analyzer";
import { useToast } from "@/hooks/use-toast";

export default function CodeHealth() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<CodeHealthReport | null>(null);
  const { toast } = useToast();

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await codeHealthAnalyzer.generateReport();
      setReport(result);
      
      toast({
        title: "Analysis Complete",
        description: `Overall Grade: ${result.grade} (${result.overallScore}/100)`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to complete code health analysis",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
    case "A": return "text-green-600";
    case "B": return "text-blue-600";
    case "C": return "text-yellow-600";
    case "D": return "text-orange-600";
    case "F": return "text-red-600";
    default: return "text-muted-foreground";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
    case "architecture": return <Layers className="h-5 w-5" />;
    case "performance": return <Zap className="h-5 w-5" />;
    case "maintainability": return <Code className="h-5 w-5" />;
    case "testCoverage": return <TestTube className="h-5 w-5" />;
    case "documentation": return <FileText className="h-5 w-5" />;
    default: return <Activity className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical": return "destructive";
    case "high": return "destructive";
    case "medium": return "secondary";
    case "low": return "outline";
    default: return "outline";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Code Health Dashboard</h1>
          <p className="text-muted-foreground">
            Quality metrics, technical debt tracking & recommendations
          </p>
        </div>
        <Button 
          onClick={runAnalysis} 
          disabled={isAnalyzing}
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Activity className="mr-2 h-4 w-4" />
              Run Analysis
            </>
          )}
        </Button>
      </div>

      {report && (
        <>
          {/* Overall Score */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Overall Code Health</CardTitle>
                  <CardDescription>
                    Generated: {new Date(report.timestamp).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getGradeColor(report.grade)}`}>
                    {report.grade}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {report.overallScore}/100
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={report.overallScore} className="h-3" />
            </CardContent>
          </Card>

          {/* Technical Debt */}
          {report.technicalDebt.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Technical Debt</h2>
              {report.technicalDebt.map((debt, idx) => (
                <Alert key={idx}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="flex items-center gap-2">
                    {debt.description}
                    <Badge variant={getSeverityColor(debt.severity)}>
                      {debt.severity}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription className="space-y-1 mt-2">
                    <p><strong>Category:</strong> {debt.category}</p>
                    <p><strong>Impact:</strong> {debt.impact}</p>
                    <p><strong>Estimated Effort:</strong> {debt.estimatedEffort}</p>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
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
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Category Scores */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(report.categories).map(([key, category]) => (
              <Card key={key}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(key)}
                      <CardTitle className="text-lg capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </CardTitle>
                    </div>
                    <Badge className={getGradeColor(category.grade)}>
                      {category.grade}
                    </Badge>
                  </div>
                  <CardDescription>Score: {category.score}/100</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Progress value={category.score} className="h-2" />
                  
                  {category.strengths.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-green-600 mb-1">
                        ✓ Strengths
                      </p>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        {category.strengths.slice(0, 2).map((strength, idx) => (
                          <li key={idx}>• {strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {category.issues.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-yellow-600 mb-1">
                        ⚠ Issues
                      </p>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        {category.issues.slice(0, 2).map((issue, idx) => (
                          <li key={idx}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {!report && !isAnalyzing && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Code className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Click "Run Analysis" to analyze code health & identify technical debt
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
