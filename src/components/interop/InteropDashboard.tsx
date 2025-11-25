// PATCH 230 - Unified Interop Dashboard
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getInteropLogs } from "@/integrations/interop/protocolAdapter";
import { listAgents, getAgentMetrics } from "@/integrations/interop/agentSwarm";
import { getMissionTasks, getExternalEntities } from "@/integrations/interop/jointTasking";
import { Activity, Users, Target, Shield } from "lucide-react";

export default function InteropDashboard() {
  const { data: interopLogs } = useQuery({
    queryKey: ["interop-logs"],
    queryFn: () => getInteropLogs(undefined, 10)
  });

  const { data: agents } = useQuery({
    queryKey: ["agents"],
    queryFn: () => listAgents()
  });

  const { data: agentMetrics } = useQuery({
    queryKey: ["agent-metrics"],
    queryFn: () => getAgentMetrics()
  });

  const { data: externalEntities } = useQuery({
    queryKey: ["external-entities"],
    queryFn: () => getExternalEntities()
  });

  const activeAgents = agents?.filter(a => a.status === "active").length || 0;
  const totalAgents = agents?.length || 0;
  const avgResponseTime = agentMetrics?.length > 0
    ? Math.round(agentMetrics.reduce((sum: number, m: any) => sum + m.avg_response_time_ms, 0) / agentMetrics.length)
    : 0;

  const activeEntities = externalEntities?.filter(e => e.status === "active").length || 0;
  const avgTrustScore = externalEntities?.length > 0
    ? Math.round(externalEntities.reduce((sum: number, e: any) => sum + e.trust_score, 0) / externalEntities.length)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Interoperability Dashboard</h2>
        <p className="text-muted-foreground">
          Unified view of protocol adapters, agent swarms, joint missions, and trust compliance
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protocol Messages</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interopLogs?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Recent protocol exchanges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAgents} / {totalAgents}</div>
            <p className="text-xs text-muted-foreground">Avg response: {avgResponseTime}ms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">External Entities</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEntities}</div>
            <p className="text-xs text-muted-foreground">Active partnerships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Trust Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgTrustScore}%</div>
            <p className="text-xs text-muted-foreground">Compliance level</p>
          </CardContent>
        </Card>
      </div>

      {/* Agent Registry */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Swarm Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {agents?.slice(0, 5).map((agent: any) => {
              const metrics = agentMetrics?.find((m: any) => m.agent_id === agent.agent_id);
              return (
                <div key={agent.agent_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-muted-foreground">{agent.agent_id}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {metrics && (
                      <div className="text-right text-sm">
                        <p className="font-medium">{metrics.success_count}/{metrics.task_count} tasks</p>
                        <p className="text-muted-foreground">{metrics.avg_response_time_ms}ms avg</p>
                      </div>
                    )}
                    <Badge variant={agent.status === "active" ? "default" : "secondary"}>
                      {agent.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* External Entities */}
      <Card>
        <CardHeader>
          <CardTitle>External Entities & Trust Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {externalEntities?.slice(0, 5).map((entity: any) => (
              <div key={entity.entity_id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{entity.name}</p>
                  <p className="text-sm text-muted-foreground">{entity.entity_type}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">Trust: {entity.trust_score}%</p>
                    <Badge variant={
                      entity.trust_score >= 70 ? "default" :
                        entity.trust_score >= 50 ? "secondary" : "destructive"
                    }>
                      {entity.trust_score >= 70 ? "High" :
                        entity.trust_score >= 50 ? "Medium" : "Low"}
                    </Badge>
                  </div>
                  <Badge variant={entity.status === "active" ? "default" : "secondary"}>
                    {entity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Protocol Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Protocol Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {interopLogs?.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between p-2 border-b last:border-0">
                <div className="flex-1">
                  <Badge variant="outline" className="mr-2">{log.protocol_type}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <Badge variant={
                  log.status === "success" ? "default" :
                    log.status === "warning" ? "secondary" : "destructive"
                }>
                  {log.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
