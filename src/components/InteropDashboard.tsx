// @ts-nocheck
/**
 * PATCH 230 - Interop Dashboard
 * Unified dashboard for joint operations, external status, and intelligence coordination
 * Displays missions, agents, trust alerts, and distributed status map
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

// Types
interface Mission {
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

interface Agent {
  id: string;
  agent_id: string;
  agent_name: string;
  agent_type: string;
  status: string;
  total_tasks_completed: number;
  success_rate: number;
  last_active_at: string;
}

interface TrustAlert {
  id: string;
  source_system: string;
  trust_score: number;
  compliance_status: string;
  alert_level: string;
  alert_message: string;
  timestamp: string;
}

interface InteropLog {
  id: string;
  protocol: string;
  source_system: string;
  status: string;
  latency_ms: number;
  timestamp: string;
}

export default function InteropDashboard() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [trustAlerts, setTrustAlerts] = useState<TrustAlert[]>([]);
  const [interopLogs, setInteropLogs] = useState<InteropLog[]>([]);
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
        .order("timestamp", { ascending: false })
        .limit(10);

      if (error) throw error;
      setMissions(data || []);
    } catch (error) {
      logger.error("[InteropDashboard] Error loading missions:", error);
    }
  };

  const loadAgents = async () => {
    try {
      const { data, error } = await supabase
        .from("agent_swarm_metrics")
        .select("*")
        .order("last_active_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Deduplicate by agent_id, keeping most recent
      const uniqueAgents = data?.reduce((acc: Agent[], curr) => {
        if (!acc.find(a => a.agent_id === curr.agent_id)) {
          acc.push(curr);
        }
        return acc;
      }, []) || [];
      
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
        .in("alert_level", ["high", "critical", "emergency"])
        .order("timestamp", { ascending: false })
        .limit(10);

      if (error) throw error;
      setTrustAlerts(data || []);
    } catch (error) {
      logger.error("[InteropDashboard] Error loading trust alerts:", error);
    }
  };

  const loadInteropLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("interop_log")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(20);

      if (error) throw error;
      setInteropLogs(data || []);
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
          color="blue"
        />
        <SummaryCard
          title="Connected Agents"
          value={activeAgents.length}
          total={agents.length}
          icon={<Users className="h-5 w-5" />}
          color="green"
        />
        <SummaryCard
          title="Critical Alerts"
          value={criticalAlerts.length}
          total={trustAlerts.length}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="red"
        />
        <SummaryCard
          title="Interop Events"
          value={interopLogs.filter(l => l.status === "completed").length}
          total={interopLogs.length}
          icon={<Activity className="h-5 w-5" />}
          color="purple"
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
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
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
  color 
}: { 
  title: string; 
  value: number; 
  total: number; 
  icon: React.ReactNode; 
  color: string;
}) {
  const colorClasses = {
    blue: "text-blue-500 bg-blue-50 dark:bg-blue-950",
    green: "text-green-500 bg-green-50 dark:bg-green-950",
    red: "text-red-500 bg-red-50 dark:bg-red-950",
    purple: "text-purple-500 bg-purple-50 dark:bg-purple-950",
  }[color];

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
          <div className={`p-3 rounded-lg ${colorClasses}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MissionCard({ mission }: { mission: Mission }) {
  const statusColors = {
    planning: "secondary",
    assigned: "default",
    executing: "default",
    completed: "default",
    failed: "destructive",
    cancelled: "secondary",
  };

  const priorityColors = {
    low: "secondary",
    medium: "default",
    high: "default",
    critical: "destructive",
    emergency: "destructive",
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-sm">{mission.mission_name}</p>
          <Badge variant={statusColors[mission.mission_status as keyof typeof statusColors] as any} className="text-xs">
            {mission.mission_status}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {mission.mission_type}
          </span>
          <Badge variant={priorityColors[mission.priority as keyof typeof priorityColors] as any} className="text-xs">
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

function AgentCard({ agent }: { agent: Agent }) {
  const statusIcons = {
    registered: <Clock className="h-4 w-4 text-gray-500" />,
    active: <Activity className="h-4 w-4 text-green-500" />,
    idle: <Clock className="h-4 w-4 text-yellow-500" />,
    busy: <TrendingUp className="h-4 w-4 text-blue-500" />,
    offline: <XCircle className="h-4 w-4 text-gray-400" />,
    error: <AlertTriangle className="h-4 w-4 text-red-500" />,
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-3">
        {statusIcons[agent.status as keyof typeof statusIcons]}
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

function TrustAlertCard({ alert }: { alert: TrustAlert }) {
  const levelColors = {
    info: "bg-blue-50 dark:bg-blue-950 border-blue-200",
    warning: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200",
    high: "bg-orange-50 dark:bg-orange-950 border-orange-200",
    critical: "bg-red-50 dark:bg-red-950 border-red-200",
    emergency: "bg-red-100 dark:bg-red-900 border-red-300",
  };

  return (
    <div className={`p-3 rounded-lg border ${levelColors[alert.alert_level as keyof typeof levelColors]}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <p className="font-medium text-sm">{alert.source_system}</p>
        </div>
        <Badge variant="outline" className="text-xs">
          Score: {alert.trust_score}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">{alert.alert_message}</p>
    </div>
  );
}

function ProtocolStatusMap({ logs }: { logs: InteropLog[] }) {
  const protocolStats = logs.reduce((acc, log) => {
    if (!acc[log.protocol]) {
      acc[log.protocol] = { total: 0, completed: 0, failed: 0, avgLatency: 0 };
    }
    acc[log.protocol].total++;
    if (log.status === "completed") acc[log.protocol].completed++;
    if (log.status === "failed") acc[log.protocol].failed++;
    acc[log.protocol].avgLatency += log.latency_ms || 0;
    return acc;
  }, {} as Record<string, { total: number; completed: number; failed: number; avgLatency: number }>);

  Object.keys(protocolStats).forEach(protocol => {
    protocolStats[protocol].avgLatency = 
      protocolStats[protocol].avgLatency / protocolStats[protocol].total;
  });

  return (
    <div className="space-y-3">
      {Object.entries(protocolStats).map(([protocol, stats]) => (
        <div key={protocol} className="p-3 rounded-lg border bg-card">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-sm uppercase">{protocol}</p>
            <Badge variant="outline" className="text-xs">
              {stats.total} msgs
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              {stats.completed}
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-500" />
              {stats.failed}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {stats.avgLatency.toFixed(0)}ms
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
