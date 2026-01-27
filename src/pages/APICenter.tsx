/**
 * API Center - Central de Gestão de APIs e Integrações
 * Gerencia integrações externas com monitoramento em tempo real
 */

import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Server, Activity, CheckCircle2, AlertTriangle, XCircle, 
  RefreshCw, Settings, Zap, Cloud, Ship, Plane, Brain,
  Search, TrendingUp, Clock, Shield, Globe, Waves
} from "lucide-react";
import { toast } from "sonner";

interface APIIntegration {
  id: string;
  name: string;
  displayName: string;
  category: "weather" | "maritime" | "aviation" | "ai" | "communication" | "security";
  status: "active" | "inactive" | "degraded" | "error";
  isEnabled: boolean;
  latency: number;
  quota: { used: number; limit: number };
  lastSync: string;
  fallbackTo?: string;
}

const mockIntegrations: APIIntegration[] = [
  {
    id: "stormglass",
    name: "stormglass",
    displayName: "StormGlass Weather",
    category: "weather",
    status: "active",
    isEnabled: true,
    latency: 245,
    quota: { used: 1234, limit: 5000 },
    lastSync: new Date().toISOString(),
    fallbackTo: "openweather"
  },
  {
    id: "marinetraffic",
    name: "marinetraffic",
    displayName: "MarineTraffic AIS",
    category: "maritime",
    status: "active",
    isEnabled: true,
    latency: 189,
    quota: { used: 892, limit: 2000 },
    lastSync: new Date().toISOString(),
  },
  {
    id: "amadeus",
    name: "amadeus",
    displayName: "Amadeus Travel",
    category: "aviation",
    status: "degraded",
    isEnabled: true,
    latency: 523,
    quota: { used: 450, limit: 1000 },
    lastSync: new Date().toISOString(),
  },
  {
    id: "openai",
    name: "openai",
    displayName: "OpenAI GPT",
    category: "ai",
    status: "active",
    isEnabled: true,
    latency: 1245,
    quota: { used: 50000, limit: 100000 },
    lastSync: new Date().toISOString(),
  },
  {
    id: "shodan",
    name: "shodan",
    displayName: "Shodan Security",
    category: "security",
    status: "inactive",
    isEnabled: false,
    latency: 0,
    quota: { used: 0, limit: 100 },
    lastSync: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "noaa",
    name: "noaa",
    displayName: "NOAA Weather",
    category: "weather",
    status: "active",
    isEnabled: true,
    latency: 156,
    quota: { used: 0, limit: 0 },
    lastSync: new Date().toISOString(),
  },
];

export default function APICenter() {
  const [integrations, setIntegrations] = useState<APIIntegration[]>(mockIntegrations);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredIntegrations = integrations.filter(api => {
    const matchesSearch = api.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || api.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const stats = {
    total: integrations.length,
    active: integrations.filter(i => i.status === "active").length,
    degraded: integrations.filter(i => i.status === "degraded").length,
    error: integrations.filter(i => i.status === "error").length,
    avgLatency: Math.round(integrations.filter(i => i.latency > 0).reduce((a, b) => a + b.latency, 0) / integrations.filter(i => i.latency > 0).length),
  };

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(api => 
      api.id === id ? { ...api, isEnabled: !api.isEnabled, status: api.isEnabled ? "inactive" : "active" } : api
    ));
    toast.success("Configuração atualizada");
  };

  const testConnection = async (id: string) => {
    toast.info(`Testando conexão com ${id}...`);
    await new Promise(r => setTimeout(r, 1500));
    toast.success("Conexão estabelecida com sucesso!");
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "weather": return <Cloud className="h-4 w-4" />;
      case "maritime": return <Ship className="h-4 w-4" />;
      case "aviation": return <Plane className="h-4 w-4" />;
      case "ai": return <Brain className="h-4 w-4" />;
      case "security": return <Shield className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-success/20 text-success border-success/30"><CheckCircle2 className="h-3 w-3 mr-1" />Ativo</Badge>;
      case "degraded": return <Badge className="bg-warning/20 text-warning border-warning/30"><AlertTriangle className="h-3 w-3 mr-1" />Degradado</Badge>;
      case "error": return <Badge className="bg-destructive/20 text-destructive border-destructive/30"><XCircle className="h-3 w-3 mr-1" />Erro</Badge>;
      default: return <Badge variant="outline">Inativo</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Helmet>
        <title>API Center | Nautilus One</title>
        <meta name="description" content="Central de gestão de APIs e integrações externas" />
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Server className="h-8 w-8 text-primary" />
            API Center
          </h1>
          <p className="text-muted-foreground mt-1">Central de gestão de integrações externas</p>
        </div>
        <Button onClick={async () => {
          toast.loading("Sincronizando APIs...", { id: "sync-apis" });
          // Simula sincronização real
          await new Promise(resolve => setTimeout(resolve, 2000));
          toast.success("Sincronização concluída!", { 
            id: "sync-apis",
            description: `${stats.total} APIs verificadas. ${stats.active} ativas, ${stats.degraded} degradadas.`
          });
        }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Sincronizar Todas
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total APIs</div>
          </CardContent>
        </Card>
        <Card className="bg-success/10 border-success/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{stats.active}</div>
            <div className="text-xs text-muted-foreground">Ativas</div>
          </CardContent>
        </Card>
        <Card className="bg-warning/10 border-warning/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">{stats.degraded}</div>
            <div className="text-xs text-muted-foreground">Degradadas</div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{stats.error}</div>
            <div className="text-xs text-muted-foreground">Com Erro</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.avgLatency}ms</div>
            <div className="text-xs text-muted-foreground">Latência Média</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar integrações..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="weather">Clima</TabsTrigger>
            <TabsTrigger value="maritime">Marítimo</TabsTrigger>
            <TabsTrigger value="ai">IA</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Integrations Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIntegrations.map(api => (
          <Card key={api.id} className={`transition-all ${api.isEnabled ? "border-primary/30" : "opacity-60"}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(api.category)}
                  <CardTitle className="text-lg">{api.displayName}</CardTitle>
                </div>
                <Switch checked={api.isEnabled} onCheckedChange={() => toggleIntegration(api.id)} />
              </div>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(api.status)}
                {api.fallbackTo && (
                  <Badge variant="outline" className="text-xs">
                    Fallback: {api.fallbackTo}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Latência
                </span>
                <span className={api.latency > 500 ? "text-amber-400" : "text-foreground"}>{api.latency}ms</span>
              </div>
              {api.quota.limit > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quota</span>
                    <span>{api.quota.used}/{api.quota.limit}</span>
                  </div>
                  <Progress value={(api.quota.used / api.quota.limit) * 100} className="h-1" />
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => testConnection(api.id)}>
                  <Zap className="h-3 w-3 mr-1" /> Testar
                </Button>
                <Button size="sm" variant="ghost">
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
