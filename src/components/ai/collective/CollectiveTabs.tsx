import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, TrendingUp, AlertTriangle, CheckCircle2, Target, Zap, Users } from "lucide-react";
import { Decision } from "@/ai/distributedDecisionCore";
import { SystemObservation } from "@/ai/consciousCore";
import { FeedbackSummary } from "@/ai/feedback/collectiveLoop";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ModulePerformance {
  moduleName: string;
  precision: number;
  recall: number;
  f1Score: number;
  accuracy: number;
  decisionCount: number;
  successRate: number;
}

interface ConflictData {
  id: string;
  modules: string[];
  severity: string;
  description: string;
  status: "open" | "resolving" | "resolved";
  timestamp: Date;
}

interface CollectiveTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  decisions: Decision[];
  conflicts: ConflictData[];
  modulePerformance: ModulePerformance[];
  feedbackSummary: FeedbackSummary | null;
  observations: SystemObservation[];
}

const getSeverityBadge = (severity: string) => {
  const variants: Record<string, "default" | "secondary" | "destructive"> = {
    info: "default", warning: "secondary", error: "destructive", critical: "destructive"
  };
  return <Badge variant={variants[severity] || "default"}>{severity}</Badge>;
};

const getDecisionLevelBadge = (level: string) => {
  const colors: Record<string, string> = {
    local: "bg-primary", escalated: "bg-warning", delegated: "bg-accent", collaborative: "bg-success"
  };
  return <Badge className={colors[level] || "bg-muted"}>{level}</Badge>;
};

export const CollectiveTabs: React.FC<CollectiveTabsProps> = ({
  activeTab, setActiveTab, decisions, conflicts, modulePerformance, feedbackSummary, observations
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="decisions"><Target className="h-4 w-4 mr-2" />Decision Timeline</TabsTrigger>
        <TabsTrigger value="conflicts"><AlertTriangle className="h-4 w-4 mr-2" />Conflicts</TabsTrigger>
        <TabsTrigger value="performance"><TrendingUp className="h-4 w-4 mr-2" />AI Performance</TabsTrigger>
        <TabsTrigger value="feedback"><Users className="h-4 w-4 mr-2" />Collective Feedback</TabsTrigger>
        <TabsTrigger value="insights"><Brain className="h-4 w-4 mr-2" />Insights</TabsTrigger>
      </TabsList>

      {/* Decision Timeline */}
      <TabsContent value="decisions" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Decision Timeline by Module</CardTitle>
            <CardDescription>Recent decisions across all modules</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {decisions.map((decision) => (
                  <div key={decision.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{decision.moduleName}</span>
                          {getDecisionLevelBadge(decision.decisionLevel)}
                          <Badge variant={decision.success ? "default" : "destructive"}>{decision.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{decision.decisionType} - {decision.action}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">{new Date(decision.timestamp).toLocaleString()}</div>
                    </div>
                    {decision.escalationReason && (
                      <div className="bg-warning/10 border-l-4 border-warning p-2 text-sm">
                        <strong>Escalation:</strong> {decision.escalationReason}
                      </div>
                    )}
                    {decision.errorMessage && (
                      <div className="bg-destructive/10 border-l-4 border-destructive p-2 text-sm">
                        <strong>Error:</strong> {decision.errorMessage}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Conflicts */}
      <TabsContent value="conflicts" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Conflict Map & Resolution</CardTitle>
            <CardDescription>Active and resolved conflicts between modules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conflicts.map((conflict) => (
                <div key={conflict.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(conflict.severity)}
                      <Badge variant={conflict.status === "resolved" ? "default" : "secondary"}>{conflict.status}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{new Date(conflict.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">{conflict.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <strong>Modules affected:</strong>
                      {conflict.modules.map(m => <Badge key={m} variant="outline">{m}</Badge>)}
                    </div>
                  </div>
                </div>
              ))}
              {conflicts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-success" />
                  <p>No active conflicts</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Performance */}
      <TabsContent value="performance" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>AI Performance Metrics by Module</CardTitle>
            <CardDescription>Precision, Recall, and Success Rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={modulePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="moduleName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="precision" fill="hsl(var(--accent))" name="Precision" />
                  <Bar dataKey="recall" fill="hsl(var(--success))" name="Recall" />
                  <Bar dataKey="accuracy" fill="hsl(var(--warning))" name="Accuracy" />
                </BarChart>
              </ResponsiveContainer>
              <div className="grid gap-4">
                {modulePerformance.map((perf) => (
                  <div key={perf.moduleName} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{perf.moduleName}</h4>
                      <Badge>{perf.decisionCount} decisions</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div><div className="text-muted-foreground">Precision</div><div className="font-bold">{(perf.precision * 100).toFixed(1)}%</div></div>
                      <div><div className="text-muted-foreground">Recall</div><div className="font-bold">{(perf.recall * 100).toFixed(1)}%</div></div>
                      <div><div className="text-muted-foreground">F1 Score</div><div className="font-bold">{(perf.f1Score * 100).toFixed(1)}%</div></div>
                      <div><div className="text-muted-foreground">Success Rate</div><div className="font-bold">{(perf.successRate * 100).toFixed(1)}%</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Feedback */}
      <TabsContent value="feedback" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Collective Feedback Overview</CardTitle>
            <CardDescription>Feedback from humans, AI, and operations</CardDescription>
          </CardHeader>
          <CardContent>
            {feedbackSummary && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center"><div className="text-2xl font-bold">{feedbackSummary.totalEvents}</div><div className="text-sm text-muted-foreground">Total Events</div></div>
                  <div className="text-center"><div className="text-2xl font-bold">{feedbackSummary.averageRating.toFixed(1)}</div><div className="text-sm text-muted-foreground">Avg Rating</div></div>
                  <div className="text-center"><div className="text-2xl font-bold">{feedbackSummary.processedCount}</div><div className="text-sm text-muted-foreground">Processed</div></div>
                  <div className="text-center"><div className="text-2xl font-bold">{feedbackSummary.learningAppliedCount}</div><div className="text-sm text-muted-foreground">Learning Applied</div></div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Feedback by Type</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(feedbackSummary.byType).map(([type, count]) => (
                      <div key={type} className="border rounded p-2"><div className="font-bold">{count}</div><div className="text-sm text-muted-foreground capitalize">{type}</div></div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Feedback by Category</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(feedbackSummary.byCategory).map(([category, count]) => (
                      <div key={category} className="border rounded p-2"><div className="font-bold">{count}</div><div className="text-sm text-muted-foreground capitalize">{category}</div></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Insights */}
      <TabsContent value="insights" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Collective Insights & Suggestions</CardTitle>
            <CardDescription>AI-generated insights from system analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {observations.slice(0, 5).map((obs) => (
                <div key={obs.id} className="border-l-4 border-primary bg-primary/5 p-4 rounded">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="font-semibold capitalize">{obs.observationType}</span>
                      {getSeverityBadge(obs.severity)}
                    </div>
                    <span className="text-sm text-muted-foreground">{new Date(obs.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-sm mb-2">{obs.description}</p>
                  {obs.suggestedAction && (
                    <div className="bg-card border rounded p-2 text-sm"><strong>Suggested Action:</strong> {obs.suggestedAction}</div>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <strong>Modules:</strong>
                    {obs.modulesAffected.map(m => <Badge key={m} variant="outline" className="text-xs">{m}</Badge>)}
                  </div>
                </div>
              ))}
              {observations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-2" />
                  <p>No insights available yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
