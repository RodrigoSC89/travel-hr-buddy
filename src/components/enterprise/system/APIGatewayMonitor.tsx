/**
 * API Gateway Monitor Component
 * Documentação interativa, rate limiting, logs de requisições
 */
import React, { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, Activity, Clock, AlertTriangle, CheckCircle2,
  XCircle, Search, Filter, Zap, BarChart3, Code,
  Server, Shield, Key, RefreshCw, Copy, Eye
} from "lucide-react";

interface APIEndpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  category: string;
  rateLimit: number;
  currentUsage: number;
  avgResponseTime: number;
  successRate: number;
  lastCalled: string;
}

interface APIRequest {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  status: number;
  responseTime: number;
  ip: string;
  userAgent: string;
}

const endpoints: APIEndpoint[] = [
  {
    id: "1",
    method: "GET",
    path: "/api/v1/vessels",
    description: "List all vessels with pagination",
    category: "Fleet",
    rateLimit: 1000,
    currentUsage: 756,
    avgResponseTime: 145,
    successRate: 99.8,
    lastCalled: "2024-02-05T14:32:00"
  },
  {
    id: "2",
    method: "GET",
    path: "/api/v1/vessels/:id/position",
    description: "Get vessel current position",
    category: "Tracking",
    rateLimit: 5000,
    currentUsage: 4521,
    avgResponseTime: 42,
    successRate: 99.9,
    lastCalled: "2024-02-05T14:32:05"
  },
  {
    id: "3",
    method: "POST",
    path: "/api/v1/voyages",
    description: "Create new voyage record",
    category: "Operations",
    rateLimit: 500,
    currentUsage: 89,
    avgResponseTime: 320,
    successRate: 98.5,
    lastCalled: "2024-02-05T14:30:00"
  },
  {
    id: "4",
    method: "GET",
    path: "/api/v1/crew/certifications",
    description: "List crew certifications",
    category: "HR",
    rateLimit: 1000,
    currentUsage: 234,
    avgResponseTime: 189,
    successRate: 99.2,
    lastCalled: "2024-02-05T14:25:00"
  },
  {
    id: "5",
    method: "PUT",
    path: "/api/v1/maintenance/:id",
    description: "Update maintenance record",
    category: "Maintenance",
    rateLimit: 500,
    currentUsage: 156,
    avgResponseTime: 275,
    successRate: 97.8,
    lastCalled: "2024-02-05T14:20:00"
  },
  {
    id: "6",
    method: "GET",
    path: "/api/v1/analytics/performance",
    description: "Fleet performance analytics",
    category: "Analytics",
    rateLimit: 200,
    currentUsage: 45,
    avgResponseTime: 890,
    successRate: 96.5,
    lastCalled: "2024-02-05T14:15:00"
  }
];

const recentRequests: APIRequest[] = [
  { id: "1", timestamp: "14:32:05", method: "GET", path: "/api/v1/vessels/123/position", status: 200, responseTime: 38, ip: "192.168.1.100", userAgent: "NaviTrack/2.0" },
  { id: "2", timestamp: "14:32:03", method: "GET", path: "/api/v1/vessels", status: 200, responseTime: 142, ip: "10.0.0.50", userAgent: "FleetDashboard/1.5" },
  { id: "3", timestamp: "14:32:00", method: "POST", path: "/api/v1/voyages", status: 201, responseTime: 315, ip: "192.168.1.100", userAgent: "NaviTrack/2.0" },
  { id: "4", timestamp: "14:31:55", method: "GET", path: "/api/v1/vessels/456/position", status: 200, responseTime: 41, ip: "10.0.0.50", userAgent: "FleetDashboard/1.5" },
  { id: "5", timestamp: "14:31:50", method: "GET", path: "/api/v1/weather/forecast", status: 503, responseTime: 5002, ip: "192.168.1.100", userAgent: "NaviTrack/2.0" },
  { id: "6", timestamp: "14:31:45", method: "PUT", path: "/api/v1/maintenance/789", status: 200, responseTime: 268, ip: "10.0.0.75", userAgent: "MaintenanceApp/3.0" },
  { id: "7", timestamp: "14:31:40", method: "GET", path: "/api/v1/crew/certifications", status: 401, responseTime: 12, ip: "unknown", userAgent: "curl/7.68.0" },
  { id: "8", timestamp: "14:31:35", method: "GET", path: "/api/v1/vessels/123/position", status: 200, responseTime: 45, ip: "192.168.1.100", userAgent: "NaviTrack/2.0" }
];

const getMethodColor = (method: string) => {
  switch (method) {
    case "GET": return "bg-success/10 text-success";
    case "POST": return "bg-info/10 text-info";
    case "PUT": return "bg-warning/10 text-warning";
    case "PATCH": return "bg-warning/10 text-warning";
    case "DELETE": return "bg-destructive/10 text-destructive";
    default: return "bg-muted text-muted-foreground";
  }
};

const getStatusColor = (status: number) => {
  if (status >= 200 && status < 300) return "text-success";
  if (status >= 400 && status < 500) return "text-warning";
  if (status >= 500) return "text-destructive";
  return "text-muted-foreground";
};

export function APIGatewayMonitor() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);

  const totalRequests = endpoints.reduce((sum, e) => sum + e.currentUsage, 0);
  const avgResponseTime = Math.round(endpoints.reduce((sum, e) => sum + e.avgResponseTime, 0) / endpoints.length);
  const overallSuccessRate = (endpoints.reduce((sum, e) => sum + e.successRate, 0) / endpoints.length).toFixed(1);
  const rateLimitWarnings = endpoints.filter(e => (e.currentUsage / e.rateLimit) > 0.8).length;

  const filteredEndpoints = endpoints.filter(e => 
    e.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Requisições/hora</p>
                <p className="text-2xl font-bold">{totalRequests.toLocaleString()}</p>
                <p className="text-xs text-success">+12% vs média</p>
              </div>
              <Globe className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Resposta</p>
                <p className="text-2xl font-bold">{avgResponseTime}ms</p>
                <p className="text-xs text-muted-foreground">Média geral</p>
              </div>
              <Clock className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-success">{overallSuccessRate}%</p>
                <Progress value={parseFloat(overallSuccessRate)} className="h-2 mt-2" />
              </div>
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rate Limit Alerts</p>
                <p className="text-2xl font-bold text-warning">{rateLimitWarnings}</p>
                <p className="text-xs text-muted-foreground">Endpoints &gt;80%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="endpoints">
        <TabsList>
          <TabsTrigger value="endpoints" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Requisições
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  API Endpoints
                </CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar endpoint..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredEndpoints.map((endpoint) => {
                  const usagePercent = (endpoint.currentUsage / endpoint.rateLimit) * 100;
                  
                  return (
                    <div
                      key={endpoint.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedEndpoint?.id === endpoint.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedEndpoint(endpoint)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={getMethodColor(endpoint.method)} variant="secondary">
                            {endpoint.method}
                          </Badge>
                          <div>
                            <code className="text-sm font-mono">{endpoint.path}</code>
                            <p className="text-xs text-muted-foreground mt-1">{endpoint.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm font-medium">{endpoint.avgResponseTime}ms</p>
                            <p className="text-xs text-muted-foreground">avg response</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${endpoint.successRate >= 99 ? "text-success" : "text-warning"}`}>
                              {endpoint.successRate}%
                            </p>
                            <p className="text-xs text-muted-foreground">success rate</p>
                          </div>
                          <div className="w-32">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{endpoint.currentUsage}</span>
                              <span className="text-muted-foreground">/{endpoint.rateLimit}/h</span>
                            </div>
                            <Progress 
                              value={usagePercent} 
                              className={`h-2 ${usagePercent >= 80 ? "[&>div]:bg-warning" : usagePercent >= 90 ? "[&>div]:bg-destructive" : ""}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Requisições Recentes
                </CardTitle>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-3 text-sm font-medium">Timestamp</th>
                      <th className="text-left p-3 text-sm font-medium">Method</th>
                      <th className="text-left p-3 text-sm font-medium">Path</th>
                      <th className="text-center p-3 text-sm font-medium">Status</th>
                      <th className="text-right p-3 text-sm font-medium">Response</th>
                      <th className="text-left p-3 text-sm font-medium">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRequests.map((req) => (
                      <tr key={req.id} className="border-t hover:bg-muted/30">
                        <td className="p-3 text-sm text-muted-foreground">{req.timestamp}</td>
                        <td className="p-3">
                          <Badge className={getMethodColor(req.method)} variant="secondary">
                            {req.method}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm font-mono">{req.path}</td>
                        <td className="p-3 text-center">
                          <span className={`font-medium ${getStatusColor(req.status)}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className={`p-3 text-sm text-right ${req.responseTime > 1000 ? "text-destructive" : ""}`}>
                          {req.responseTime}ms
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{req.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Keys
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Production Key", created: "2024-01-15", lastUsed: "2024-02-05", status: "active" },
                  { name: "Development Key", created: "2024-01-20", lastUsed: "2024-02-04", status: "active" },
                  { name: "Legacy Integration", created: "2023-06-10", lastUsed: "2024-01-15", status: "deprecated" }
                ].map((key, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{key.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Criada: {new Date(key.created).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={key.status === "active" ? "default" : "secondary"}>
                        {key.status === "active" ? "Ativa" : "Descontinuada"}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => {
                        navigator.clipboard?.writeText(`Key: ${key.name} | Status: ${key.status} | Created: ${new Date(key.created).toLocaleDateString("pt-BR")} | Last Used: ${new Date(key.lastUsed).toLocaleDateString("pt-BR")}`);
                        toast.success("Detalhes da chave copiados");
                      }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        navigator.clipboard?.writeText(key.name);
                        toast.success("Nome da chave copiado para a área de transferência");
                      }}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline" onClick={() => toast.success("Gerencie suas credenciais via Supabase Dashboard > Settings > API")}>
                  <Key className="h-4 w-4 mr-2" />
                  Gerar Nova API Key
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="font-medium text-success">SSL/TLS Ativo</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Todas as conexões são criptografadas com TLS 1.3
                  </p>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-3">Rate Limiting</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Global</span>
                      <span>10,000 req/hora</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Por IP</span>
                      <span>1,000 req/hora</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Burst</span>
                      <span>100 req/segundo</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-3">Últimos Eventos de Segurança</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <span>3 tentativas de acesso inválidas (hoje)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span>Nenhum ataque detectado</span>
                    </div>
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

export default APIGatewayMonitor;
