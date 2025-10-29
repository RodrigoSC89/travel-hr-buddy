/**
 * PATCH 515 - AI Governance Engine Interface
 * UI for managing governance rules, viewing decisions, and tracking ethics
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Brain,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Settings,
  FileText,
} from "lucide-react";
import { governanceEngine, GovernanceRule, GovernanceDecision } from "@/modules/governance/GovernanceEngine";
import { toast } from "sonner";

export default function GovernanceAIPanel() {
  const [rules, setRules] = useState<GovernanceRule[]>([]);
  const [decisions, setDecisions] = useState<GovernanceDecision[]>([]);
  const [stats, setStats] = useState<any>({});
  const [selectedDecision, setSelectedDecision] = useState<GovernanceDecision | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    try {
      setLoading(true);
      const rulesData = governanceEngine.getRules();
      const decisionsData = governanceEngine.getDecisionHistory(100);
      const statsData = governanceEngine.getStatistics();

      setRules(rulesData);
      setDecisions(decisionsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading governance data:", error);
      toast.error("Failed to load governance data");
    } finally {
      setLoading(false);
    }
  };

  const testGovernance = async () => {
    try {
      const testContext = {
        involvesPersonalData: true,
        hasConsent: false,
        securityRisk: 0.3,
        transparencyLevel: 0.9,
        potentialHarm: 0.1,
        requiresAudit: true,
        stakeholders: ["users", "administrators", "compliance team"],
      };

      const decision = await governanceEngine.evaluateRequest(testContext);
      toast.success(`Governance decision: ${decision.decision.toUpperCase()}`, {
        description: `Ethics Score: ${decision.ethicsScore}/100`,
      });
      loadData();
    } catch (error) {
      toast.error("Failed to test governance");
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case "approve":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "reject":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "escalate":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "modify":
        return <Settings className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getDecisionBadge = (decision: string) => {
    const variants: Record<string, any> = {
      approve: "default",
      reject: "destructive",
      escalate: "warning",
      modify: "secondary",
    };
    return <Badge variant={variants[decision] || "default"}>{decision.toUpperCase()}</Badge>;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      ethics: "text-purple-600",
      compliance: "text-blue-600",
      security: "text-red-600",
      performance: "text-green-600",
      custom: "text-gray-600",
    };
    return colors[category] || "text-gray-600";
  };

  const getEthicsScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-destructive";
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            AI Governance
          </h1>
          <p className="text-muted-foreground">
            Ethical AI decision-making with transparency and accountability
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={testGovernance} variant="outline" size="sm">
            <Brain className="h-4 w-4 mr-2" />
            Test Governance
          </Button>
          <Button onClick={loadData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total ? `${((stats.approved / stats.total) * 100).toFixed(1)}%` : "0%"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total ? `${((stats.rejected / stats.total) * 100).toFixed(1)}%` : "0%"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Escalated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.escalated || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Ethics Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getEthicsScoreColor(stats.averageEthicsScore || 0)}`}>
              {stats.averageEthicsScore || 0}
            </div>
            <Progress value={stats.averageEthicsScore || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Governance Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Governance Rules</CardTitle>
          <CardDescription>Active rules governing AI decisions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Rules</TabsTrigger>
              <TabsTrigger value="ethics">Ethics</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="space-y-2">
                {rules.map((rule) => (
                  <div key={rule.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{rule.name}</div>
                      <div className="text-sm text-muted-foreground">{rule.condition}</div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className={getCategoryColor(rule.category)}>
                          {rule.category}
                        </Badge>
                        <Badge variant="secondary">Priority: {rule.priority}</Badge>
                        {rule.enabled && <Badge variant="default">Active</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {["ethics", "compliance", "security", "performance"].map((category) => (
              <TabsContent key={category} value={category}>
                <div className="space-y-2">
                  {rules
                    .filter((r) => r.category === category)
                    .map((rule) => (
                      <div key={rule.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{rule.name}</div>
                          <div className="text-sm text-muted-foreground">{rule.condition}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Action: {rule.action}
                          </div>
                        </div>
                        <Badge variant="secondary">Priority: {rule.priority}</Badge>
                      </div>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Decision History */}
      <Card>
        <CardHeader>
          <CardTitle>Decision History</CardTitle>
          <CardDescription>Recent governance decisions with justifications</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {decisions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No decisions yet</div>
              ) : (
                decisions.map((decision) => (
                  <div
                    key={decision.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => setSelectedDecision(decision)}
                  >
                    {getDecisionIcon(decision.decision)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getDecisionBadge(decision.decision)}
                        <div
                          className={`text-sm font-medium ${getEthicsScoreColor(decision.ethicsScore)}`}
                        >
                          Ethics: {decision.ethicsScore}/100
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {decision.justification}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(decision.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Selected Decision Details */}
      {selectedDecision && (
        <Card>
          <CardHeader>
            <CardTitle>Decision Details</CardTitle>
            <CardDescription>Complete governance decision analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Decision</h3>
                {getDecisionBadge(selectedDecision.decision)}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Ethics Score</h3>
                <div className="flex items-center gap-3">
                  <Progress value={selectedDecision.ethicsScore} className="flex-1" />
                  <span className={`font-bold ${getEthicsScoreColor(selectedDecision.ethicsScore)}`}>
                    {selectedDecision.ethicsScore}/100
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Justification</h3>
                <p className="text-sm bg-muted p-3 rounded">{selectedDecision.justification}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Impact Assessment</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Immediate:</span>{" "}
                    {selectedDecision.impactAssessment.immediate}
                  </div>
                  <div>
                    <span className="font-medium">Long-term:</span>{" "}
                    {selectedDecision.impactAssessment.longTerm}
                  </div>
                  <div>
                    <span className="font-medium">Stakeholders:</span>{" "}
                    {selectedDecision.impactAssessment.stakeholders.join(", ")}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Context</h3>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                  {JSON.stringify(selectedDecision.context, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
