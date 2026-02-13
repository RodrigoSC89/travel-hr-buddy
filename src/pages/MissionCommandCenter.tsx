/**
 * Mission Command Center
 * PATCH UNIFY-8.0 - Fusão dos módulos de Missão
 * 
 * Módulos fundidos:
 * - mission-logs → Mission Command Center
 * - mission-control → Mission Command Center
 * 
 * Funcionalidades unificadas:
 * - Registros de Missão (CRUD completo)
 * - Controle de Missão em tempo real
 * - Dashboard de KPIs
 * - AI Commander
 * - Logs do sistema
 * - Status de módulos
 * - Planejamento de missões
 * - Execução em tempo real
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Radio, 
  Activity, 
  Ship, 
  Cloud, 
  Satellite, 
  AlertTriangle,
  TrendingUp,
  Zap,
  FileText,
  Plus,
  Edit,
  Trash2,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  Pause,
  XCircle,
  Bot,
  LayoutGrid
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { missionLogsService, type MissionLog as MissionLogType } from "@/modules/mission-control/services/mission-logs-service";

// Components from mission-control
import { AICommander } from "@/modules/mission-control/components/AICommander";
import { KPIDashboard } from "@/modules/mission-control/components/KPIDashboard";
import { SystemLogs } from "@/modules/mission-control/components/SystemLogs";
import { logger } from '@/lib/logger';

interface ModuleStatus {
  id: string;
  name: string;
  status: "operational" | "warning" | "critical" | "offline";
  health: number;
  lastUpdate: string;
  alerts: number;
}

interface Mission {
  id: string;
  mission_id: string;
  name: string;
  description: string;
  status: "planning" | "in_progress" | "paused" | "completed" | "error" | "cancelled";
  priority: "low" | "normal" | "high" | "critical";
  progress_percentage: number;
  start_date?: string;
  estimated_duration_hours?: number;
  actual_duration_hours?: number;
  updated_at: string;
}

interface ActivityLog {
  id: string;
  mission_id: string;
  log_type: string;
  message: string;
  timestamp: string;
}

const MissionCommandCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast: toastHook } = useToast();
  
  // Mission Logs state
  const [logs, setLogs] = useState<MissionLogType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<MissionLogType | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [logsLoading, setLogsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<MissionLogType>>({
    missionName: "",
    missionDate: new Date().toISOString().split("T")[0],
    crewMembers: [],
    status: "planned",
    description: "",
    location: ""
  });

  // Mission Control state
  const [missions, setMissions] = useState<Mission[]>([]);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [missionsLoading, setMissionsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const moduleStatuses: ModuleStatus[] = [
    { id: "fleet", name: "Fleet Management", status: "operational", health: 98, lastUpdate: new Date().toISOString(), alerts: 0 },
    { id: "emergency", name: "Emergency Response", status: "operational", health: 100, lastUpdate: new Date().toISOString(), alerts: 0 },
    { id: "satellite", name: "Satellite Tracking", status: "operational", health: 95, lastUpdate: new Date().toISOString(), alerts: 1 },
    { id: "weather", name: "Weather Monitor", status: "warning", health: 87, lastUpdate: new Date().toISOString(), alerts: 2 }
  ];

  // Load Mission Logs
  const loadLogs = async () => {
    setLogsLoading(true);
    const filters = statusFilter ? { status: statusFilter } : undefined;
    const data = await missionLogsService.getLogs(filters);
    setLogs(data);
    setLogsLoading(false);
  };

  // Load Real-time Missions
  const loadMissions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("missions")
        .select("*")
        .in("status", ["planning", "in_progress", "paused", "error"])
        .order("priority", { ascending: false })
        .order("updated_at", { ascending: false });

      if (error) throw error;
      if (data) setMissions(data as Mission[]);
    } catch (error) {
      logger.error("Error loading missions:", error);
    } finally {
      setMissionsLoading(false);
    }
  }, []);

  const loadRecentLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("mission_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(10);

      if (error) throw error;
      if (data) setRecentLogs(data as ActivityLog[]);
    } catch (error) {
      logger.error("Error loading logs:", error);
    }
  }, []);

  useEffect(() => {
    loadLogs();
    loadMissions();
    loadRecentLogs();

    const interval = setInterval(() => {
      loadMissions();
      loadRecentLogs();
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [statusFilter, loadMissions, loadRecentLogs]);

  // Mission Log CRUD
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLog?.id) {
        await missionLogsService.updateLog(editingLog.id, formData);
        toast.success("Mission log updated");
      } else {
        await missionLogsService.createLog(formData as MissionLogType);
        toast.success("Mission log created");
      }
      setIsDialogOpen(false);
      resetForm();
      loadLogs();
    } catch (error) {
      toast.error("Failed to save mission log");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this log?")) {
      try {
        await missionLogsService.deleteLog(id);
        toast.success("Mission log deleted");
        loadLogs();
      } catch (error) {
        toast.error("Failed to delete mission log");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      missionName: "",
      missionDate: new Date().toISOString().split("T")[0],
      crewMembers: [],
      status: "planned",
      description: "",
      location: ""
    });
    setEditingLog(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "planned": "outline",
      "in-progress": "default",
      "completed": "secondary",
      "cancelled": "destructive"
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getStatusColor = (status: ModuleStatus["status"]) => {
    switch (status) {
      case "operational": return "text-green-500 bg-green-500/10";
      case "warning": return "text-yellow-500 bg-yellow-500/10";
      case "critical": return "text-red-500 bg-red-500/10";
      case "offline": return "text-muted-foreground bg-muted";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const getStatusIcon = (moduleId: string) => {
    switch (moduleId) {
      case "fleet": return <Ship className="w-5 h-5" />;
      case "emergency": return <AlertTriangle className="w-5 h-5" />;
      case "satellite": return <Satellite className="w-5 h-5" />;
      case "weather": return <Cloud className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getMissionStatusIcon = (status: Mission["status"]) => {
    switch (status) {
      case "in_progress": return <Activity className="w-4 h-4 text-info animate-pulse" />;
      case "completed": return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "error": return <AlertCircle className="w-4 h-4 text-destructive" />;
      case "paused": return <Pause className="w-4 h-4 text-warning" />;
      case "planning": return <Clock className="w-4 h-4 text-muted-foreground" />;
      case "cancelled": return <XCircle className="w-4 h-4 text-muted-foreground" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getMissionStatusColor = (status: Mission["status"]) => {
    switch (status) {
      case "in_progress": return "bg-info/20 text-info border-info/30";
      case "completed": return "bg-success/20 text-success border-success/30";
      case "error": return "bg-destructive/20 text-destructive border-destructive/30";
      case "paused": return "bg-warning/20 text-warning border-warning/30";
      default: return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getPriorityColor = (priority: Mission["priority"]) => {
    switch (priority) {
      case "critical": return "bg-destructive/20 text-destructive border-destructive/30";
      case "high": return "bg-warning/20 text-warning border-warning/30";
      case "normal": return "bg-info/20 text-info border-info/30";
      default: return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const stats = {
    totalMissions: missions.length,
    inProgress: missions.filter(m => m.status === "in_progress").length,
    completed: missions.filter(m => m.status === "completed").length,
    errors: missions.filter(m => m.status === "error").length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Radio className="w-8 h-8 text-primary" />
              Mission Command Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Centro Unificado de Controle e Registros de Missão - PATCH UNIFY-8.0
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-success animate-pulse" />
              <span className="text-success">All Systems Operational</span>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" /> New Mission Log
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-popover border-border text-foreground">
                <DialogHeader>
                  <DialogTitle>{editingLog ? "Edit Mission Log" : "Create Mission Log"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Mission Name</Label>
                    <Input
                      value={formData.missionName}
                      onChange={(e) => setFormData({ ...formData, missionName: e.target.value })}
                      required
                      className="bg-popover border-border"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={formData.missionDate}
                        onChange={(e) => setFormData({ ...formData, missionDate: e.target.value })}
                        required
                      className="bg-popover border-border"
                      />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as "planned" | "in-progress" | "completed" | "cancelled" })}>
                        <SelectTrigger className="bg-popover border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="bg-popover border-border"
                    />
                  </div>
                  <div>
                    <Label>Crew Members (comma-separated)</Label>
                    <Input
                      value={formData.crewMembers?.join(", ")}
                      onChange={(e) => setFormData({ ...formData, crewMembers: e.target.value.split(",").map(s => s.trim()) })}
                      className="bg-popover border-border"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="bg-popover border-border"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                    {editingLog ? "Update" : "Create"} Mission Log
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* AI Commander */}
        <AICommander />

        {/* KPI Dashboard */}
        <KPIDashboard modules={moduleStatuses} />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-muted/50">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Mission Logs
            </TabsTrigger>
            <TabsTrigger value="realtime" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Real-Time
            </TabsTrigger>
            <TabsTrigger value="modules" className="flex items-center gap-2">
              <Radio className="h-4 w-4" />
              Modules
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              System Logs
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-card/50 border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Mission Logs</p>
                      <p className="text-2xl font-bold">{logs.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-primary opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Missions</p>
                      <p className="text-2xl font-bold text-info">{stats.inProgress}</p>
                    </div>
                    <Play className="h-8 w-8 text-info opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold text-success">{stats.completed}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-success opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">System Health</p>
                      <p className="text-2xl font-bold text-success">98.5%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-success opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Module Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {moduleStatuses.map((module) => (
                <Card key={module.id} className="bg-card/50 border-border hover:bg-card/70 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(module.id)}
                        <CardTitle className="text-sm">{module.name}</CardTitle>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(module.status)}`}>
                        {module.status.toUpperCase()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Health</span>
                        <span className="font-semibold">{module.health}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            module.health >= 90 ? "bg-success" : 
                              module.health >= 70 ? "bg-warning" : "bg-destructive"
                          }`}
                          style={{ width: `${module.health}%` }}
                        />
                      </div>
                      {module.alerts > 0 && (
                        <div className="flex items-center gap-2 text-xs text-warning mt-2">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{module.alerts} active alert{module.alerts > 1 ? "s" : ""}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Mission Logs Tab */}
          <TabsContent value="logs" className="mt-6 space-y-4">
            <Card className="p-4 bg-card/50 border-border">
              <div className="flex items-center gap-4">
                <Filter className="h-4 w-4" />
                <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
                  <SelectTrigger className="w-48 bg-popover border-border">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            <div className="grid gap-4">
              {logsLoading ? (
                <Card className="p-8 text-center bg-card/50 border-border">Loading...</Card>
              ) : logs.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground bg-card/50 border-border">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No mission logs found. Create your first one!</p>
                </Card>
              ) : (
                logs.map((log) => (
                  <Card key={log.id} className="p-6 bg-card/50 border-border">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-semibold">{log.missionName}</h3>
                          {getStatusBadge(log.status)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>📅 {new Date(log.missionDate).toLocaleDateString()}</p>
                          {log.location && <p>📍 {log.location}</p>}
                          {log.crewMembers.length > 0 && <p>👥 {log.crewMembers.join(", ")}</p>}
                        </div>
                        {log.description && <p className="text-sm mt-2">{log.description}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                           className="border-border hover:bg-muted"
                          onClick={() => {
                            setEditingLog(log);
                            setFormData(log);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-border hover:bg-muted"
                          onClick={() => log.id && handleDelete(log.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Real-Time Tab */}
          <TabsContent value="realtime" className="mt-6 space-y-6">
            {/* Live Status Indicator */}
            <div className="flex items-center justify-between px-4 py-2 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-sm text-foreground/80">Live Updates Active</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Last update: {lastUpdate.toLocaleTimeString()}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-card/50 border-border">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold">{stats.totalMissions}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total Active</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-info">{stats.inProgress}</div>
                  <p className="text-xs text-muted-foreground mt-1">In Progress</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-success">{stats.completed}</div>
                  <p className="text-xs text-muted-foreground mt-1">Completed</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-destructive">{stats.errors}</div>
                  <p className="text-xs text-muted-foreground mt-1">Errors</p>
                </CardContent>
              </Card>
            </div>

            {/* Missions and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-warning" />
                    Active Missions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    {missionsLoading ? (
                      <div className="text-center py-8 text-muted-foreground">Loading missions...</div>
                    ) : missions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No active missions</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {missions.map((mission) => (
                          <div key={mission.id} className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getMissionStatusIcon(mission.status)}
                                <h3 className="font-semibold text-foreground">{mission.name}</h3>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="outline" className={getPriorityColor(mission.priority)}>
                                  {mission.priority}
                                </Badge>
                                <Badge variant="outline" className={getMissionStatusColor(mission.status)}>
                                  {mission.status}
                                </Badge>
                              </div>
                            </div>
                            {mission.description && (
                              <p className="text-sm text-muted-foreground mb-3">{mission.description}</p>
                            )}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Progress</span>
                                <span>{mission.progress_percentage}%</span>
                              </div>
                              <Progress value={mission.progress_percentage} className="h-2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-success" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    {recentLogs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No recent activity</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {recentLogs.map((log) => (
                          <div key={log.id} className="p-3 rounded-lg border border-border bg-card/30">
                            <div className="flex items-start justify-between mb-1">
                              <Badge variant="outline" className="text-xs">
                                {log.log_type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-foreground/80">{log.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ship className="w-5 h-5 text-primary" />
                    Fleet Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Fleet operations and vessel tracking integrated.</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Emergency Response
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Emergency protocols and incident management.</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Satellite className="w-5 h-5 text-accent-foreground" />
                    Satellite Communications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Satellite tracking and communications.</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-info" />
                    Weather Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Weather conditions and forecasts.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Logs Tab */}
          <TabsContent value="system" className="mt-6">
            <SystemLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MissionCommandCenter;
