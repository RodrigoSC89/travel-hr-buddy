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
      console.error("Error loading missions:", error);
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
      console.error("Error loading logs:", error);
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
      case "offline": return "text-gray-500 bg-gray-500/10";
      default: return "text-gray-500 bg-gray-500/10";
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
      case "in_progress": return <Activity className="w-4 h-4 text-blue-400 animate-pulse" />;
      case "completed": return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "error": return <AlertCircle className="w-4 h-4 text-red-400" />;
      case "paused": return <Pause className="w-4 h-4 text-yellow-400" />;
      case "planning": return <Clock className="w-4 h-4 text-gray-400" />;
      case "cancelled": return <XCircle className="w-4 h-4 text-gray-400" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getMissionStatusColor = (status: Mission["status"]) => {
    switch (status) {
      case "in_progress": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "completed": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "error": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "paused": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getPriorityColor = (priority: Mission["priority"]) => {
    switch (priority) {
      case "critical": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "normal": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const stats = {
    totalMissions: missions.length,
    inProgress: missions.filter(m => m.status === "in_progress").length,
    completed: missions.filter(m => m.status === "completed").length,
    errors: missions.filter(m => m.status === "error").length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Radio className="w-8 h-8 text-blue-400" />
              Mission Command Center
            </h1>
            <p className="text-zinc-400 mt-1">
              Centro Unificado de Controle e Registros de Missão - PATCH UNIFY-8.0
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-green-400 animate-pulse" />
              <span className="text-green-400">All Systems Operational</span>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" /> New Mission Log
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-700 text-white">
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
                      className="bg-zinc-800 border-zinc-700"
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
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
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
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <div>
                    <Label>Crew Members (comma-separated)</Label>
                    <Input
                      value={formData.crewMembers?.join(", ")}
                      onChange={(e) => setFormData({ ...formData, crewMembers: e.target.value.split(",").map(s => s.trim()) })}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
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
          <TabsList className="grid w-full grid-cols-5 bg-zinc-800/50">
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
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-400">Mission Logs</p>
                      <p className="text-2xl font-bold">{logs.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-400">Active Missions</p>
                      <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
                    </div>
                    <Play className="h-8 w-8 text-blue-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-400">Completed</p>
                      <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-400">System Health</p>
                      <p className="text-2xl font-bold text-green-400">98.5%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Module Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {moduleStatuses.map((module) => (
                <Card key={module.id} className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800/70 transition-colors">
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
                        <span className="text-zinc-400">Health</span>
                        <span className="font-semibold">{module.health}%</span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            module.health >= 90 ? "bg-green-500" : 
                              module.health >= 70 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${module.health}%` }}
                        />
                      </div>
                      {module.alerts > 0 && (
                        <div className="flex items-center gap-2 text-xs text-yellow-400 mt-2">
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
            <Card className="p-4 bg-zinc-800/50 border-zinc-700">
              <div className="flex items-center gap-4">
                <Filter className="h-4 w-4" />
                <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
                  <SelectTrigger className="w-48 bg-zinc-900 border-zinc-700">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
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
                <Card className="p-8 text-center bg-zinc-800/50 border-zinc-700">Loading...</Card>
              ) : logs.length === 0 ? (
                <Card className="p-8 text-center text-zinc-400 bg-zinc-800/50 border-zinc-700">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No mission logs found. Create your first one!</p>
                </Card>
              ) : (
                logs.map((log) => (
                  <Card key={log.id} className="p-6 bg-zinc-800/50 border-zinc-700">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-semibold">{log.missionName}</h3>
                          {getStatusBadge(log.status)}
                        </div>
                        <div className="text-sm text-zinc-400 space-y-1">
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
                          className="border-zinc-600 hover:bg-zinc-700"
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
                          className="border-zinc-600 hover:bg-zinc-700"
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
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 rounded-lg border border-zinc-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-zinc-300">Live Updates Active</span>
              </div>
              <div className="text-xs text-zinc-500">
                Last update: {lastUpdate.toLocaleTimeString()}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-zinc-900/50 border-zinc-700">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold">{stats.totalMissions}</div>
                  <p className="text-xs text-zinc-400 mt-1">Total Active</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/50 border-zinc-700">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-blue-400">{stats.inProgress}</div>
                  <p className="text-xs text-zinc-400 mt-1">In Progress</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/50 border-zinc-700">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-green-400">{stats.completed}</div>
                  <p className="text-xs text-zinc-400 mt-1">Completed</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/50 border-zinc-700">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-red-400">{stats.errors}</div>
                  <p className="text-xs text-zinc-400 mt-1">Errors</p>
                </CardContent>
              </Card>
            </div>

            {/* Missions and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-zinc-900/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Active Missions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    {missionsLoading ? (
                      <div className="text-center py-8 text-zinc-400">Loading missions...</div>
                    ) : missions.length === 0 ? (
                      <div className="text-center py-8 text-zinc-500">
                        <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No active missions</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {missions.map((mission) => (
                          <div key={mission.id} className="p-4 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getMissionStatusIcon(mission.status)}
                                <h3 className="font-semibold text-white">{mission.name}</h3>
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
                              <p className="text-sm text-zinc-400 mb-3">{mission.description}</p>
                            )}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs text-zinc-500">
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

              <Card className="bg-zinc-900/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    {recentLogs.length === 0 ? (
                      <div className="text-center py-8 text-zinc-500">
                        <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No recent activity</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {recentLogs.map((log) => (
                          <div key={log.id} className="p-3 rounded-lg border border-zinc-700 bg-zinc-800/30">
                            <div className="flex items-start justify-between mb-1">
                              <Badge variant="outline" className="text-xs">
                                {log.log_type}
                              </Badge>
                              <span className="text-xs text-zinc-500">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-zinc-300">{log.message}</p>
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
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ship className="w-5 h-5 text-blue-400" />
                    Fleet Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400">Fleet operations and vessel tracking integrated.</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    Emergency Response
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400">Emergency protocols and incident management.</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Satellite className="w-5 h-5 text-purple-400" />
                    Satellite Communications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400">Satellite tracking and communications.</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-cyan-400" />
                    Weather Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400">Weather conditions and forecasts.</p>
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
