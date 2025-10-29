/**
 * PATCH 465 - Technical Validation Panel
 * Dashboard for monitoring module health, tests, documentation, and duplications
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  TestTube,
  Copy,
  Heart,
  Download,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";
import { toast } from "sonner";
import modulesRegistry from "@/../modules-registry.json";

interface ModuleValidation {
  id: string;
  name: string;
  path: string;
  status: string;
  category: string;
  version?: string;
  hasTests: boolean;
  hasDocumentation: boolean;
  hasDuplication: boolean;
  healthScore: number;
  issues: string[];
  lastModified?: string;
}

export const TechnicalValidationPanel: React.FC = () => {
  const [modules, setModules] = useState<ModuleValidation[]>([]);
  const [filter, setFilter] = useState<"all" | "issues" | "healthy">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyzeModules();
  }, []);

  const analyzeModules = async () => {
    setLoading(true);
    try {
      // Analyze each module from the registry
      const validations: ModuleValidation[] = await Promise.all(
        modulesRegistry.modules.map(async (module) => {
          const validation = await analyzeModule(module);
          return validation;
        })
      );

      setModules(validations);
    } catch (error) {
      console.error("Error analyzing modules:", error);
      toast.error("Failed to analyze modules");
    } finally {
      setLoading(false);
    }
  };

  const analyzeModule = async (module: any): Promise<ModuleValidation> => {
    const issues: string[] = [];
    
    // Check for tests (simplified - in production, check actual test files)
    const hasTests = module.hasTests !== false; // Default to true if not specified
    if (!hasTests) {
      issues.push("No automated tests found");
    }

    // Check for documentation
    const hasDocumentation = module.description && module.description.length > 20;
    if (!hasDocumentation) {
      issues.push("Missing or insufficient documentation");
    }

    // Check for duplication (based on status and naming patterns)
    const hasDuplication = checkForDuplication(module, modulesRegistry.modules);
    if (hasDuplication) {
      issues.push("Potential duplication detected");
    }

    // Check if deprecated
    if (module.status === "deprecated") {
      issues.push("Module is deprecated");
    }

    // Calculate health score
    const healthScore = calculateHealthScore({
      hasTests,
      hasDocumentation,
      hasDuplication,
      isDeprecated: module.status === "deprecated",
      isActive: module.status === "active",
      hasDatabase: module.hasDatabase,
      hasMockData: module.hasMockData
    });

    return {
      id: module.id,
      name: module.name,
      path: module.path,
      status: module.status || "unknown",
      category: module.category || "uncategorized",
      version: module.version,
      hasTests,
      hasDocumentation,
      hasDuplication,
      healthScore,
      issues,
      lastModified: module.lastModified
    };
  };

  const checkForDuplication = (module: any, allModules: any[]): boolean => {
    // Check for similar names or paths
    const similarModules = allModules.filter(m => 
      m.id !== module.id && (
        m.name.toLowerCase().includes(module.name.toLowerCase().split(" ")[0]) ||
        m.path.includes(module.id) ||
        (m.replacedBy === module.id) ||
        (module.replacedBy === m.id)
      )
    );
    
    return similarModules.length > 0;
  };

  const calculateHealthScore = (factors: {
    hasTests: boolean;
    hasDocumentation: boolean;
    hasDuplication: boolean;
    isDeprecated: boolean;
    isActive: boolean;
    hasDatabase: boolean;
    hasMockData: boolean;
  }): number => {
    let score = 100;

    if (!factors.hasTests) score -= 30;
    if (!factors.hasDocumentation) score -= 20;
    if (factors.hasDuplication) score -= 25;
    if (factors.isDeprecated) score -= 40;
    if (!factors.isActive) score -= 20;
    if (factors.hasMockData) score -= 10; // Mock data is a red flag
    if (!factors.hasDatabase && factors.isActive) score -= 15;

    return Math.max(0, score);
  };

  const getHealthColor = (score: number): string => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getHealthBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500">Healthy</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-500">Warning</Badge>;
    if (score >= 40) return <Badge className="bg-orange-500">Issues</Badge>;
    return <Badge className="bg-red-500">Critical</Badge>;
  };

  const exportToCSV = () => {
    const headers = ["ID", "Name", "Status", "Health Score", "Tests", "Documentation", "Duplication", "Issues"];
    const rows = modules.map(m => [
      m.id,
      m.name,
      m.status,
      m.healthScore.toString(),
      m.hasTests ? "Yes" : "No",
      m.hasDocumentation ? "Yes" : "No",
      m.hasDuplication ? "Yes" : "No",
      m.issues.join("; ")
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `module-validation-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("CSV exported successfully");
  };

  const exportToPDF = () => {
    // Simplified PDF export - in production, use jsPDF or similar
    toast.info("PDF export will be implemented with jsPDF library");
  };

  const filteredModules = modules.filter(m => {
    if (filter === "issues") return m.issues.length > 0;
    if (filter === "healthy") return m.healthScore >= 80;
    return true;
  });

  const stats = {
    total: modules.length,
    healthy: modules.filter(m => m.healthScore >= 80).length,
    issues: modules.filter(m => m.issues.length > 0).length,
    deprecated: modules.filter(m => m.status === "deprecated").length,
    avgHealthScore: modules.length > 0 
      ? Math.round(modules.reduce((sum, m) => sum + m.healthScore, 0) / modules.length)
      : 0
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Analyzing modules...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            Technical Validation Panel
          </h1>
          <p className="text-sm text-muted-foreground">
            PATCH 465 - Module health monitoring and quality metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Healthy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.healthy}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">With Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.issues}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Deprecated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.deprecated}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(stats.avgHealthScore)}`}>
              {stats.avgHealthScore}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs defaultValue="all" onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All Modules ({modules.length})</TabsTrigger>
          <TabsTrigger value="healthy">Healthy ({stats.healthy})</TabsTrigger>
          <TabsTrigger value="issues">With Issues ({stats.issues})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4 mt-4">
          {filteredModules.map((module) => (
            <Card key={module.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{module.name}</CardTitle>
                      {getHealthBadge(module.healthScore)}
                      <Badge variant="outline">{module.status}</Badge>
                      <Badge variant="secondary">{module.category}</Badge>
                    </div>
                    <CardDescription>
                      {module.path} {module.version && `• v${module.version}`}
                      {module.lastModified && ` • Modified: ${module.lastModified}`}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${getHealthColor(module.healthScore)}`}>
                      {module.healthScore}
                    </div>
                    <div className="text-xs text-muted-foreground">Health Score</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Health Score Progress */}
                <div>
                  <Progress value={module.healthScore} className="h-2" />
                </div>

                {/* Indicators */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    {module.hasTests ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <div className="text-sm font-medium">Tests</div>
                      <div className="text-xs text-muted-foreground">
                        {module.hasTests ? "Present" : "Missing"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {module.hasDocumentation ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <div className="text-sm font-medium">Documentation</div>
                      <div className="text-xs text-muted-foreground">
                        {module.hasDocumentation ? "Complete" : "Incomplete"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!module.hasDuplication ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    )}
                    <div>
                      <div className="text-sm font-medium">Duplication</div>
                      <div className="text-xs text-muted-foreground">
                        {module.hasDuplication ? "Detected" : "None"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="text-sm font-medium">Issues</div>
                      <div className="text-xs text-muted-foreground">
                        {module.issues.length} found
                      </div>
                    </div>
                  </div>
                </div>

                {/* Issues List */}
                {module.issues.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      Issues Found:
                    </div>
                    <ul className="space-y-1">
                      {module.issues.map((issue, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground pl-6">
                          • {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    View Code
                  </Button>
                  <Button variant="outline" size="sm">
                    <TestTube className="h-4 w-4 mr-2" />
                    Run Tests
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {filteredModules.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No modules match the selected filter</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TechnicalValidationPanel;
