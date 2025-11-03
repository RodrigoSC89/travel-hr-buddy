/**
 * System Health Dashboard
 * PATCH 541 - Automated validation and monitoring
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Shield, 
  Zap,
  Brain,
  RefreshCw
} from "lucide-react";
import { autoValidator, ValidationReport } from "@/lib/validation/auto-validator";
import { useToast } from "@/hooks/use-toast";

export default function SystemHealth() {
  const [isValidating, setIsValidating] = useState(false);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const { toast } = useToast();

  const runValidation = async () => {
    setIsValidating(true);
    try {
      const result = await autoValidator.runFullValidation();
      setReport(result);
      
      toast({
        title: "Validation Complete",
        description: `System status: ${result.overallStatus.toUpperCase()}`,
        variant: result.overallStatus === "fail" ? "destructive" : "default"
      });
    } catch (error) {
      toast({
        title: "Validation Failed",
        description: "Unable to complete system validation",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "pass": return "text-green-600";
    case "warning": return "text-yellow-600";
    case "fail": return "text-red-600";
    default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "pass": return <CheckCircle className="h-5 w-5 text-green-600" />;
    case "warning": return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    case "fail": return <AlertTriangle className="h-5 w-5 text-red-600" />;
    default: return <Activity className="h-5 w-5" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
    case "performance": return <Zap className="h-5 w-5" />;
    case "memory": return <Activity className="h-5 w-5" />;
    case "security": return <Shield className="h-5 w-5" />;
    case "qa": return <Brain className="h-5 w-5" />;
    default: return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health Dashboard</h1>
          <p className="text-muted-foreground">
            Automated validation of performance, memory, security, and QA
          </p>
        </div>
        <Button 
          onClick={runValidation} 
          disabled={isValidating}
          size="lg"
        >
          {isValidating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              <Activity className="mr-2 h-4 w-4" />
              Run Validation
            </>
          )}
        </Button>
      </div>

      {report && (
        <>
          {/* Overall Status */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(report.overallStatus)}
                  <div>
                    <CardTitle>Overall System Status</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3" />
                      {new Date(report.timestamp).toLocaleString()}
                    </CardDescription>
                  </div>
                </div>
                <Badge 
                  variant={report.overallStatus === "pass" ? "default" : "destructive"}
                  className="text-lg px-4 py-2"
                >
                  {report.overallStatus.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Critical Issues */}
          {report.criticalIssues.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Critical Issues Found</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {report.criticalIssues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Recommendations</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {report.recommendations.slice(0, 5).map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Category Results */}
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(report.categories).map(([key, category]) => (
              <Card key={key}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(key)}
                      <CardTitle className="capitalize">{category.details}</CardTitle>
                    </div>
                    <Badge variant={
                      category.status === "pass" ? "default" : 
                        category.status === "warning" ? "secondary" : 
                          "destructive"
                    }>
                      {category.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Score: {category.score}/100
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.checks.map((check, idx) => (
                      <div 
                        key={idx}
                        className="flex items-start gap-2 text-sm border-l-2 pl-3 py-1"
                        style={{
                          borderColor: check.passed 
                            ? "hsl(var(--success))" 
                            : check.severity === "critical" 
                              ? "hsl(var(--destructive))" 
                              : "hsl(var(--warning))"
                        }}
                      >
                        <div className="flex-1">
                          <p className="font-medium">{check.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {check.message}
                          </p>
                        </div>
                        {check.passed ? (
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {!report && !isValidating && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Click "Run Validation" to analyze system health
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
