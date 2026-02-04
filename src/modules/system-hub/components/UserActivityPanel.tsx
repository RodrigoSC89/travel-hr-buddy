/**
 * User Activity Panel - Real-time User Activity Monitoring
 * Painel de monitoramento de atividade de usuários em tempo real
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Activity,
  Eye,
  Clock,
  LogIn,
  LogOut,
  Shield,
  AlertTriangle,
  Search,
  Filter,
  Download,
  RefreshCw,
  UserCheck,
  UserX,
  Globe,
  Monitor,
  Smartphone,
  MapPin,
  MoreHorizontal,
  Ban,
  MessageSquare,
  Mail,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";

interface UserSession {
  id: string;
  userId: string;
  userName: string;
  email: string;
  avatar?: string;
  role: string;
  status: "online" | "away" | "offline";
  lastActivity: Date;
  device: "desktop" | "mobile" | "tablet";
  browser: string;
  location: string;
  ipAddress: string;
  sessionDuration: number;
  actionsCount: number;
}

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  timestamp: Date;
  severity: "info" | "warning" | "error" | "success";
  details?: string;
  ipAddress: string;
}

export default function UserActivityPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Fetch active sessions
  const { data: sessions = [], isLoading: sessionsLoading, refetch } = useQuery({
    queryKey: ["user-activity-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("active_sessions")
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            avatar_url,
            role
          )
        `)
        .eq("is_active", true)
        .order("last_activity", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 15000,
  });

  // Fetch access logs
  const { data: activityLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["user-activity-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("access_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 10000,
  });

  // Mock data for demonstration
  const mockSessions: UserSession[] = [
    {
      id: "1",
      userId: "u1",
      userName: "Carlos Silva",
      email: "carlos.silva@nautilus.com",
      role: "Capitão",
      status: "online",
      lastActivity: new Date(),
      device: "desktop",
      browser: "Chrome 121",
      location: "Santos, SP",
      ipAddress: "192.168.1.45",
      sessionDuration: 125,
      actionsCount: 47,
    },
    {
      id: "2",
      userId: "u2",
      userName: "Maria Santos",
      email: "maria.santos@nautilus.com",
      role: "Engenheira Chefe",
      status: "online",
      lastActivity: new Date(Date.now() - 120000),
      device: "desktop",
      browser: "Firefox 122",
      location: "Rio de Janeiro, RJ",
      ipAddress: "192.168.1.67",
      sessionDuration: 89,
      actionsCount: 32,
    },
    {
      id: "3",
      userId: "u3",
      userName: "Pedro Oliveira",
      email: "pedro.oliveira@nautilus.com",
      role: "Oficial de Navegação",
      status: "away",
      lastActivity: new Date(Date.now() - 600000),
      device: "mobile",
      browser: "Safari Mobile",
      location: "Paranaguá, PR",
      ipAddress: "192.168.2.12",
      sessionDuration: 45,
      actionsCount: 15,
    },
    {
      id: "4",
      userId: "u4",
      userName: "Ana Costa",
      email: "ana.costa@nautilus.com",
      role: "Gerente de Operações",
      status: "online",
      lastActivity: new Date(Date.now() - 30000),
      device: "tablet",
      browser: "Chrome iPad",
      location: "São Paulo, SP",
      ipAddress: "192.168.1.89",
      sessionDuration: 210,
      actionsCount: 78,
    },
    {
      id: "5",
      userId: "u5",
      userName: "Roberto Lima",
      email: "roberto.lima@nautilus.com",
      role: "Técnico de Manutenção",
      status: "offline",
      lastActivity: new Date(Date.now() - 3600000),
      device: "desktop",
      browser: "Edge 121",
      location: "Vitória, ES",
      ipAddress: "192.168.3.22",
      sessionDuration: 0,
      actionsCount: 0,
    },
  ];

  const mockLogs: ActivityLog[] = [
    { id: "1", userId: "u1", userName: "Carlos Silva", action: "Login realizado", module: "Auth", timestamp: new Date(), severity: "success", ipAddress: "192.168.1.45" },
    { id: "2", userId: "u2", userName: "Maria Santos", action: "Documento criado", module: "Documents", timestamp: new Date(Date.now() - 180000), severity: "info", ipAddress: "192.168.1.67" },
    { id: "3", userId: "u1", userName: "Carlos Silva", action: "Configuração alterada", module: "Settings", timestamp: new Date(Date.now() - 420000), severity: "warning", details: "Alterou permissões de usuário", ipAddress: "192.168.1.45" },
    { id: "4", userId: "u3", userName: "Pedro Oliveira", action: "Acesso negado", module: "Finance", timestamp: new Date(Date.now() - 900000), severity: "error", details: "Tentativa de acesso sem permissão", ipAddress: "192.168.2.12" },
    { id: "5", userId: "u4", userName: "Ana Costa", action: "Relatório exportado", module: "Analytics", timestamp: new Date(Date.now() - 1200000), severity: "info", ipAddress: "192.168.1.89" },
    { id: "6", userId: "u2", userName: "Maria Santos", action: "Manutenção agendada", module: "Maintenance", timestamp: new Date(Date.now() - 1800000), severity: "success", ipAddress: "192.168.1.67" },
  ];

  const hourlyActivity = [
    { hour: "00h", users: 12 },
    { hour: "04h", users: 8 },
    { hour: "08h", users: 45 },
    { hour: "12h", users: 78 },
    { hour: "16h", users: 92 },
    { hour: "20h", users: 56 },
  ];

  const deviceDistribution = [
    { name: "Desktop", value: 65, color: "hsl(217, 91%, 60%)" },
    { name: "Mobile", value: 25, color: "hsl(142, 71%, 45%)" },
    { name: "Tablet", value: 10, color: "hsl(280, 87%, 65%)" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-success";
      case "away":
        return "bg-warning";
      case "offline":
        return "bg-muted-foreground";
      default:
        return "bg-muted";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "success":
        return "text-success bg-success/10";
      case "info":
        return "text-blue-500 bg-blue-500/10";
      case "warning":
        return "text-warning bg-warning/10";
      case "error":
        return "text-destructive bg-destructive/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "desktop":
        return <Monitor className="h-4 w-4" />;
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const onlineUsers = mockSessions.filter(s => s.status === "online").length;
  const awayUsers = mockSessions.filter(s => s.status === "away").length;
  const totalSessions = mockSessions.length;

  const filteredSessions = mockSessions.filter(
    s => s.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
         s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTerminateSession = (sessionId: string) => {
    toast.success("Sessão encerrada com sucesso");
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <UserCheck className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{onlineUsers}</p>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{awayUsers}</p>
                <p className="text-sm text-muted-foreground">Ausentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSessions}</p>
                <p className="text-sm text-muted-foreground">Sessões Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Activity className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockLogs.length}</p>
                <p className="text-sm text-muted-foreground">Ações (1h)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Sessions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Sessões Ativas
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar usuário..."
                      className="pl-9 w-[200px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {filteredSessions.map((session, idx) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-4 rounded-lg border hover:bg-accent/50 transition-colors ${
                        selectedUser === session.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedUser(session.id === selectedUser ? null : session.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={session.avatar} />
                              <AvatarFallback>
                                {session.userName.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(session.status)}`} />
                          </div>
                          <div>
                            <p className="font-medium">{session.userName}</p>
                            <p className="text-sm text-muted-foreground">{session.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{session.role}</Badge>
                          {getDeviceIcon(session.device)}
                        </div>
                      </div>

                      {selectedUser === session.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-4 pt-4 border-t"
                        >
                          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                              <span className="text-muted-foreground">Navegador:</span>
                              <span className="ml-2">{session.browser}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Localização:</span>
                              <span className="ml-2">{session.location}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">IP:</span>
                              <span className="ml-2 font-mono text-xs">{session.ipAddress}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Duração:</span>
                              <span className="ml-2">{session.sessionDuration} min</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Mensagem
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Eye className="h-3 w-3 mr-1" />
                              Atividade
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleTerminateSession(session.id)}
                            >
                              <Ban className="h-3 w-3" />
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Activity Charts */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Atividade por Hora</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="hour" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    />
                    <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Dispositivos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {deviceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {deviceDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-1 text-xs">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}: {item.value}%
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity Logs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Log de Atividades Recentes
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {mockLogs.map((log, idx) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <Badge variant="outline" className={getSeverityColor(log.severity)}>
                    {log.severity === "success" && <CheckCircle2 className="h-3 w-3" />}
                    {log.severity === "info" && <Activity className="h-3 w-3" />}
                    {log.severity === "warning" && <AlertTriangle className="h-3 w-3" />}
                    {log.severity === "error" && <Shield className="h-3 w-3" />}
                  </Badge>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.userName}</span>
                      <span className="text-muted-foreground">•</span>
                      <span>{log.action}</span>
                    </div>
                    {log.details && (
                      <p className="text-sm text-muted-foreground">{log.details}</p>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <p>{log.timestamp.toLocaleTimeString("pt-BR")}</p>
                    <p className="text-xs text-muted-foreground">{log.module}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
