/**
 * PATCH 230 - Interop Dashboard
 * Unified dashboard for joint operations, external status, and intelligence coordination
 * PATCH 862: Removed @ts-nocheck, aligned with Supabase schema
 */
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Users,
  Radio,
  MapPin,
  TrendingUp,
  XCircle,
} from "lucide-react";
import type { 
  JointMissionLog, 
  AgentSwarmMetric, 
  TrustEvent, 
  InteropLog as InteropLogRow,
} from "@/types/supabase-aliases";
import { getJsonField as extractJson } from "@/types/supabase-aliases";

// Transformed view types for UI display
interface MissionView {
  id: string;
  mission_id: string;
  mission_name: string;
  mission_type: string;
  mission_status: string;
  priority: string;
  completion_percentage: number;
  sync_status: string;
  timestamp: string;
}

interface AgentView {
  id: string;
  agent_id: string;
  agent_name: string;
  agent_type: string;
  status: string;
  total_tasks_completed: number;
  success_rate: number;
  last_active_at: string;
}

interface TrustAlertView {
  id: string;
  source_system: string;
  trust_score: number;
  compliance_status: string;
  alert_level: string;
  alert_message: string;
  timestamp: string;
}

interface InteropLogView {
  id: string;
  protocol: string;
  source_system: string;
  status: string;
  latency_ms: number;
  timestamp: string;
}

// Transform DB rows to view types
function transformMission(row: JointMissionLog): MissionView {
  return {
    id: row.id,
    mission_id: row.mission_id,
    mission_name: extractJson(row.details, "mission_name", "Unknown Mission"),
    mission_type: extractJson(row.details, "mission_type", "general"),
    mission_status: extractJson(row.details, "mission_status", "pending"),
    priority: extractJson(row.details, "priority", "medium"),
    completion_percentage: extractJson(row.details, "completion_percentage", 0),
    sync_status: extractJson(row.details, "sync_status", "pending"),
    timestamp: row.created_at,
  };
}

function transformAgent(row: AgentSwarmMetric): AgentView {
  return {
    id: row.id,
    agent_id: row.agent_id,
    agent_name: row.agent_id, // Use agent_id as name
    agent_type: "swarm",
    status: row.task_count > 0 ? "active" : "idle",
    total_tasks_completed: row.success_count,
    success_rate: row.task_count > 0 ? (row.success_count / row.task_count) * 100 : 0,
    last_active_at: row.last_task_at || row.updated_at,
  };
}

function transformTrustAlert(row: TrustEvent): TrustAlertView {
  return {
    id: row.id,
    source_system: extractJson(row.details, "source_system", row.entity_id),
    trust_score: row.trust_score_after,
    compliance_status: extractJson(row.details, "compliance_status", "unknown"),
    alert_level: extractJson(row.details, "alert_level", row.severity),
    alert_message: extractJson(row.details, "alert_message", row.event_type),
    timestamp: row.created_at,
  };
}

function transformInteropLog(row: InteropLogRow): InteropLogView {
  return {
    id: row.id,
    protocol: row.protocol_type,
    source_system: extractJson(row.message, "source_system", "unknown"),
    status: row.status,
    latency_ms: extractJson(row.message, "latency_ms", 0),
    timestamp: row.created_at,
  };
}

export default function InteropDashboard() {
  const [missions, setMissions] = useState<MissionView[]>([]);
  const [agents, setAgents] = useState<AgentView[]>([]);
  const [trustAlerts, setTrustAlerts] = useState<TrustAlertView[]>([]);
  const [interopLogs, setInteropLogs] = useState<InteropLogView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time subscriptions
    const missionsSubscription = supabase
      .channel("missions_changes")
      .on("postgres_changes", 
        { event: "*", schema: "public", table: "joint_mission_log" },
        () => loadMissions()
      )
      .subscribe();

    const agentsSubscription = supabase
      .channel("agents_changes")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "agent_swarm_metrics" },
        () => loadAgents()
      )
      .subscribe();

    const trustSubscription = supabase
      .channel("trust_changes")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "trust_events" },
        () => loadTrustAlerts()
      )
      .subscribe();

    return () => {
      missionsSubscription.unsubscribe();
      agentsSubscription.unsubscribe();
      trustSubscription.unsubscribe();
    };
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMissions(),
        loadAgents(),
        loadTrustAlerts(),
        loadInteropLogs(),
      ]);
    } catch (error) {
      logger.error("[InteropDashboard] Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMissions = async () => {
    try {
      const { data, error } = await supabase
        .from("joint_mission_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setMissions((data || []).map(transformMission));
    } catch (error) {
      logger.error("[InteropDashboard] Error loading missions:", error);
    }
  };

  const loadAgents = async () => {
    try {
      const { data, error } = await supabase
        .from("agent_swarm_metrics")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Deduplicate by agent_id, keeping most recent
      const transformed = (data || []).map(transformAgent);
      const uniqueAgents = transformed.reduce((acc: AgentView[], curr) => {
        if (!acc.find(a => a.agent_id === curr.agent_id)) {
          acc.push(curr);
        }
        return acc;
      }, []);
      
      setAgents(uniqueAgents);
    } catch (error) {
      logger.error("[InteropDashboard] Error loading agents:", error);
    }
  };

  const loadTrustAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("trust_events")
        .select("*")
        .in("severity", ["high", "critical"])
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setTrustAlerts((data || []).map(transformTrustAlert));
    } catch (error) {
      logger.error("[InteropDashboard] Error loading trust alerts:", error);
    }
  };

  const loadInteropLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("interop_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setInteropLogs((data || []).map(transformInteropLog));
    } catch (error) {
      logger.error("[InteropDashboard] Error loading interop logs:", error);
    }
  };

  const activeMissions = missions.filter(m => 
    ["assigned", "executing"].includes(m.mission_status)
  );
  
  const activeAgents = agents.filter(a => 
    ["active", "busy"].includes(a.status)
  );

  const criticalAlerts = trustAlerts.filter(a => 
    ["critical", "emergency"].includes(a.alert_level)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interoperability Dashboard</h1>
          <p className="text-muted-foreground">
            Joint Operations, External Systems & Intelligence Coordination
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Radio className="h-4 w-4 mr-2" />
          Live
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Active Missions"
          value={activeMissions.length}
          total={missions.length}
          icon={<MapPin className="h-5 w-5" />}
          variant="primary"
        />
        <SummaryCard
          title="Connected Agents"
          value={activeAgents.length}
          total={agents.length}
          icon={<Users className="h-5 w-5" />}
          variant="success"
        />
        <SummaryCard
          title="Critical Alerts"
          value={criticalAlerts.length}
          total={trustAlerts.length}
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="destructive"
        />
        <SummaryCard
          title="Interop Events"
          value={interopLogs.filter(l => l.status === "completed").length}
          total={interopLogs.length}
          icon={<Activity className="h-5 w-5" />}
          variant="secondary"
        />
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Security Alerts</AlertTitle>
          <AlertDescription>
            {criticalAlerts.length} critical security events require immediate attention
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Missions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              External Missions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeMissions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active missions
                </p>
              ) : (
                activeMissions.map(mission => (
                  <MissionCard key={mission.id} mission={mission} />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Connected Agents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Agent Swarm Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeAgents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active agents
                </p>
              ) : (
                activeAgents.slice(0, 6).map(agent => (
                  <AgentCard key={agent.id} agent={agent} />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trust Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Trust & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trustAlerts.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">All systems secure</p>
                </div>
              ) : (
                trustAlerts.slice(0, 5).map(alert => (
                  <TrustAlertCard key={alert.id} alert={alert} />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Distributed Status Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Protocol Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {interopLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              ) : (
                <ProtocolStatusMap logs={interopLogs} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper Components

function SummaryCard({ 
  title, 
  value, 
  total, 
  icon, 
  variant 
}: { 
  title: string; 
  value: number; 
  total: number; 
  icon: React.ReactNode; 
  variant: "primary" | "success" | "destructive" | "secondary";
}) {
  const variantClasses = {
    primary: "text-primary bg-primary/10",
    success: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    destructive: "text-destructive bg-destructive/10",
    secondary: "text-secondary-foreground bg-secondary",
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-sm text-muted-foreground">/ {total}</p>
            </div>
          </div>
          <div className={`p-3 rounded-lg ${variantClasses[variant]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MissionCard({ mission }: { mission: MissionView }) {
  const statusVariant = mission.mission_status === "failed" ? "destructive" : 
                        mission.mission_status === "completed" ? "secondary" : "default";
  const priorityVariant = ["critical", "emergency"].includes(mission.priority) ? "destructive" : "secondary";

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-sm">{mission.mission_name}</p>
          <Badge variant={statusVariant} className="text-xs">
            {mission.mission_status}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {mission.mission_type}
          </span>
          <Badge variant={priorityVariant} className="text-xs">
            {mission.priority}
          </Badge>
        </div>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold">{mission.completion_percentage}%</p>
        <p className="text-xs text-muted-foreground">complete</p>
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: AgentView }) {
  const statusIcons: Record<string, React.ReactNode> = {
    registered: <Clock className="h-4 w-4 text-muted-foreground" />,
    active: <Activity className="h-4 w-4 text-primary" />,
    idle: <Clock className="h-4 w-4 text-yellow-500" />,
    busy: <TrendingUp className="h-4 w-4 text-primary" />,
    offline: <XCircle className="h-4 w-4 text-muted-foreground" />,
    error: <AlertTriangle className="h-4 w-4 text-destructive" />,
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-3">
        {statusIcons[agent.status] || statusIcons.idle}
        <div>
          <p className="font-medium text-sm">{agent.agent_name}</p>
          <p className="text-xs text-muted-foreground">{agent.agent_type}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{agent.success_rate?.toFixed(0) || 0}%</p>
        <p className="text-xs text-muted-foreground">{agent.total_tasks_completed || 0} tasks</p>
      </div>
    </div>
  );
}

function TrustAlertCard({ alert }: { alert: TrustAlertView }) {
  const levelVariants: Record<string, string> = {
    info: "bg-primary/10 border-primary/20",
    warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    high: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
    critical: "bg-destructive/10 border-destructive/20",
    emergency: "bg-destructive/20 border-destructive/30",
  };

  return (
    <div className={`p-3 rounded-lg border ${levelVariants[alert.alert_level] || levelVariants.info}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-medium text-sm">{alert.source_system}</span>
        </div>
        <Badge variant={alert.alert_level === "critical" ? "destructive" : "secondary"}>
          {alert.alert_level}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{alert.alert_message}</p>
      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <span>Trust: {alert.trust_score}%</span>
        <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}

function ProtocolStatusMap({ logs }: { logs: InteropLogView[] }) {
  // Group by protocol
  const protocolStats = logs.reduce((acc, log) => {
    if (!acc[log.protocol]) {
      acc[log.protocol] = { total: 0, completed: 0, avgLatency: 0, latencies: [] as number[] };
    }
    acc[log.protocol].total++;
    if (log.status === "completed") acc[log.protocol].completed++;
    if (log.latency_ms > 0) acc[log.protocol].latencies.push(log.latency_ms);
    return acc;
  }, {} as Record<string, { total: number; completed: number; avgLatency: number; latencies: number[] }>);

  // Calculate averages
  Object.keys(protocolStats).forEach(key => {
    const stats = protocolStats[key];
    if (stats.latencies.length > 0) {
      stats.avgLatency = stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length;
    }
  });

  return (
    <div className="space-y-2">
      {Object.entries(protocolStats).map(([protocol, stats]) => (
        <div key={protocol} className="flex items-center justify-between p-2 rounded border">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">{protocol}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{stats.completed}/{stats.total} completed</span>
            <span>{stats.avgLatency.toFixed(0)}ms avg</span>
          </div>
        </div>
      ))}
    </div>
  );
}
