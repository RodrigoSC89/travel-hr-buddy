/**
 * System Command Center - Premium System Administration
 * Centro de controle de sistema, configurações e integrações
 */

import React, { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Settings,
  Server,
  Database,
  Shield,
  Users,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Cpu,
  HardDrive,
  Network,
  Clock,
  Terminal,
  Key,
  Lock,
  Unlock,
  Globe,
  Mail,
  Bell,
  Palette,
  Languages,
  Download,
  Upload,
  Trash2,
  Eye,
  History,
  BarChart3,
  Zap,
  Cloud,
  Wifi,
  WifiOff,
  Plug,
  GitBranch,
  Webhook,
  FileCode,
  PlugZap,
} from "lucide-react";

// Tipos
interface SystemService {
  id: string;
  name: string;
  status: "online" | "degraded" | "offline";
  uptime: string;
  latency: number;
  icon: React.ElementType;
}

interface Integration {
  id: string;
  name: string;
  type: string;
  status: "connected" | "error" | "disconnected";
  lastSync: string;
  icon: React.ElementType;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  module: string;
  timestamp: string;
  status: "success" | "warning" | "error";
  ip: string;
}

// Dados
const SERVICES: SystemService[] = [
  { id: "api", name: "API Principal", status: "online", uptime: "99.98%", latency: 45, icon: Server },
  { id: "database", name: "Database", status: "online", uptime: "99.99%", latency: 12, icon: Database },
  { id: "auth", name: "Autenticação", status: "online", uptime: "99.95%", latency: 28, icon: Shield },
  { id: "storage", name: "Storage", status: "online", uptime: "99.97%", latency: 89, icon: HardDrive },
  { id: "ai", name: "AI Engine", status: "degraded", uptime: "98.50%", latency: 234, icon: Cpu },
  { id: "realtime", name: "Real-time", status: "online", uptime: "99.90%", latency: 15, icon: Zap },
];

const INTEGRATIONS: Integration[] = [
  { id: "supabase", name: "Supabase", type: "Database", status: "connected", lastSync: "Agora", icon: Database },
  { id: "openai", name: "OpenAI", type: "AI/ML", status: "connected", lastSync: "Há 2min", icon: Cpu },
  { id: "stripe", name: "Stripe", type: "Pagamentos", status: "connected", lastSync: "Há 5min", icon: Globe },
  { id: "sendgrid", name: "SendGrid", type: "Email", status: "connected", lastSync: "Há 10min", icon: Mail },
  { id: "ais", name: "AIS Provider", type: "Maritime", status: "error", lastSync: "Há 2h", icon: Globe },
  { id: "weather", name: "Weather API", type: "Dados", status: "connected", lastSync: "Há 1min", icon: Cloud },
];

const AUDIT_LOGS: AuditLog[] = [
  { id: "1", action: "Login realizado", user: "carlos.silva@nautilus.com", module: "Auth", timestamp: "10:45:32", status: "success", ip: "192.168.1.45" },
  { id: "2", action: "Documento criado", user: "maria.santos@nautilus.com", module: "Documents", timestamp: "10:42:18", status: "success", ip: "192.168.1.67" },
  { id: "3", action: "Configuração alterada", user: "admin@nautilus.com", module: "Settings", timestamp: "10:38:05", status: "warning", ip: "192.168.1.1" },
  { id: "4", action: "Tentativa de acesso negada", user: "unknown@test.com", module: "Auth", timestamp: "10:35:22", status: "error", ip: "45.33.21.89" },
  { id: "5", action: "Backup automático", user: "system", module: "Backup", timestamp: "10:30:00", status: "success", ip: "localhost" },
  { id: "6", action: "API Key regenerada", user: "admin@nautilus.com", module: "Security", timestamp: "10:25:45", status: "success", ip: "192.168.1.1" },
];

export function SystemCommandCenter() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    slack: true,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
      case "connected":
      case "success":
        return "text-emerald-500";
      case "degraded":
      case "warning":
        return "text-amber-500";
      case "offline":
      case "error":
      case "disconnected":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "online":
      case "connected":
        return "bg-success";
      case "degraded":
        return "bg-warning";
      case "offline":
      case "error":
      case "disconnected":
        return "bg-destructive";
      default:
        return "bg-muted-foreground";
    }
  };

  // Métricas do sistema
  const systemMetrics = {
    cpu: 42,
    memory: 68,
    disk: 45,
    network: 23,
    activeUsers: 156,
    requestsPerMin: 2340,
  };

  return (
    <div className="space-y-6">
      {/* Header com status do sistema */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-muted-foreground">CPU</span>
            </div>
            <p className="text-2xl font-bold mt-1">{systemMetrics.cpu}%</p>
            <Progress value={systemMetrics.cpu} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-muted-foreground">Memória</span>
            </div>
            <p className="text-2xl font-bold mt-1">{systemMetrics.memory}%</p>
            <Progress value={systemMetrics.memory} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-amber-400" />
              <span className="text-sm text-muted-foreground">Disco</span>
            </div>
            <p className="text-2xl font-bold mt-1">{systemMetrics.disk}%</p>
            <Progress value={systemMetrics.disk} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-muted-foreground">Rede</span>
            </div>
            <p className="text-2xl font-bold mt-1">{systemMetrics.network} MB/s</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              <span className="text-sm text-muted-foreground">Usuários Ativos</span>
            </div>
            <p className="text-2xl font-bold mt-1">{systemMetrics.activeUsers}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-rose-400" />
              <span className="text-sm text-muted-foreground">Req/min</span>
            </div>
            <p className="text-2xl font-bold mt-1">{systemMetrics.requestsPerMin}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="services" className="gap-2">
            <Server className="h-4 w-4" />
            <span className="hidden sm:inline">Serviços</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Plug className="h-4 w-4" />
            <span className="hidden sm:inline">Integrações</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <Terminal className="h-4 w-4" />
            <span className="hidden sm:inline">Logs</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configurações</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Serviços */}
        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((service) => (
              <Card key={service.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <service.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{service.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`h-2 w-2 rounded-full ${getStatusBg(service.status)}`} />
                          <span className={`text-xs capitalize ${getStatusColor(service.status)}`}>
                            {service.status === "online" ? "Online" : service.status === "degraded" ? "Degradado" : "Offline"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Uptime</p>
                      <p className="font-medium">{service.uptime}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Latência</p>
                      <p className="font-medium">{service.latency}ms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Status geral */}
          <Card className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-emerald-500/20">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Sistema Operacional</h3>
                  <p className="text-muted-foreground">
                    Todos os serviços críticos estão funcionando normalmente. 
                    Uptime geral: 99.97%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Integrações */}
        <TabsContent value="integrations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTEGRATIONS.map((integration) => (
              <Card key={integration.id} className={`hover:border-primary/50 transition-colors ${
                integration.status === "error" ? "border-red-500/50" : ""
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        integration.status === "connected" 
                          ? "bg-emerald-500/10" 
                          : integration.status === "error" 
                          ? "bg-red-500/10" 
                          : "bg-muted"
                      }`}>
                        <integration.icon className={`h-5 w-5 ${
                          integration.status === "connected" 
                            ? "text-emerald-500" 
                            : integration.status === "error" 
                            ? "text-red-500" 
                            : "text-muted-foreground"
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-medium">{integration.name}</h4>
                        <p className="text-xs text-muted-foreground">{integration.type}</p>
                      </div>
                    </div>
                    <Badge className={
                      integration.status === "connected" 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : integration.status === "error" 
                        ? "bg-red-500/20 text-red-400" 
                        : "bg-gray-500/20 text-gray-400"
                    }>
                      {integration.status === "connected" ? "Conectado" : integration.status === "error" ? "Erro" : "Desconectado"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Última sync: {integration.lastSync}</span>
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Sincronizar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Adicionar nova integração */}
            <Card className="border-dashed hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[150px]">
                <div className="p-3 rounded-full bg-muted mb-3">
                  <PlugZap className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium">Nova Integração</p>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  Conecte novos serviços
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Segurança */}
        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Keys
                </CardTitle>
                <CardDescription>
                  Gerencie suas chaves de API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Production Key", created: "2024-01-15", lastUsed: "Agora" },
                    { name: "Development Key", created: "2024-02-01", lastUsed: "Há 2h" },
                    { name: "Testing Key", created: "2024-02-10", lastUsed: "Ontem" },
                  ].map((key) => (
                    <div key={key.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{key.name}</p>
                          <p className="text-xs text-muted-foreground">Usado: {key.lastUsed}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { navigator.clipboard.writeText(`${key.name} | Criada: ${key.created} | Último uso: ${key.lastUsed}`); toast.success("Dados da chave copiados"); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { window.open(`https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/settings/api`, '_blank'); }}>
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline" onClick={() => window.open('https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/settings/api', '_blank')}>
                  <Key className="h-4 w-4 mr-2" />
                  Gerar Nova API Key
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Políticas de Segurança
                </CardTitle>
                <CardDescription>
                  Configure regras de acesso e autenticação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Autenticação 2FA obrigatória", enabled: true },
                    { label: "Bloqueio após 5 tentativas", enabled: true },
                    { label: "Sessão expira em 24h", enabled: true },
                    { label: "Log de todas as ações", enabled: true },
                    { label: "Notificar logins suspeitos", enabled: false },
                  ].map((policy) => (
                    <div key={policy.label} className="flex items-center justify-between">
                      <span className="text-sm">{policy.label}</span>
                      <Switch checked={policy.enabled} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Logs */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Logs de Auditoria
                  </CardTitle>
                  <CardDescription>
                    Histórico completo de ações do sistema
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Buscar logs..." className="w-64" />
                  <Button variant="outline" onClick={() => {
                    const csv = ["Ação;Usuário;Módulo;Horário;Status;IP", ...AUDIT_LOGS.map(l => `${l.action};${l.user};${l.module};${l.timestamp};${l.status};${l.ip}`)].join('\n');
                    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `audit-logs-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
                    toast.success("Logs de auditoria exportados");
                  }}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {AUDIT_LOGS.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg border ${
                        log.status === "error" 
                          ? "bg-red-500/5 border-red-500/30" 
                          : log.status === "warning"
                          ? "bg-amber-500/5 border-amber-500/30"
                          : "bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded ${
                            log.status === "success" 
                              ? "bg-emerald-500/20" 
                              : log.status === "warning"
                              ? "bg-amber-500/20"
                              : "bg-red-500/20"
                          }`}>
                            {log.status === "success" ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : log.status === "warning" ? (
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{log.action}</p>
                            <p className="text-xs text-muted-foreground">
                              {log.user} • {log.module} • IP: {log.ip}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Configurações */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Email</span>
                    </div>
                    <Switch 
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Push</span>
                    </div>
                    <Switch 
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">SMS</span>
                    </div>
                    <Switch 
                      checked={notifications.sms}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sms: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Slack</span>
                    </div>
                    <Switch 
                      checked={notifications.slack}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, slack: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Aparência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tema Escuro</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Animações</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compacto</span>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SystemCommandCenter;
