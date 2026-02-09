/**
 * Integrations Manager - Advanced Integrations Management
 * Gerenciador avançado de integrações com terceiros
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Plug,
  PlugZap,
  Unplug,
  RefreshCw,
  Settings,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Database,
  Cloud,
  Globe,
  Mail,
  Shield,
  Cpu,
  Webhook,
  Key,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Plus,
  ArrowRight,
  Activity,
  TrendingUp,
  Zap,
  FileCode,
  Server,
  Radio,
  Satellite,
  Ship,
  Anchor,
} from "lucide-react";
import { toast } from "sonner";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: "database" | "ai" | "communication" | "maritime" | "cloud" | "analytics" | "payment";
  status: "connected" | "error" | "disconnected" | "syncing";
  enabled: boolean;
  lastSync?: Date;
  syncInterval?: string;
  health: number;
  requests24h: number;
  errors24h: number;
  config?: Record<string, any>;
  icon: React.ElementType;
}

const CATEGORIES = [
  { id: "all", label: "Todas" },
  { id: "database", label: "Database" },
  { id: "ai", label: "IA/ML" },
  { id: "communication", label: "Comunicação" },
  { id: "maritime", label: "Marítimo" },
  { id: "cloud", label: "Cloud" },
  { id: "analytics", label: "Analytics" },
  { id: "payment", label: "Pagamentos" },
];

export default function IntegrationsManager() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const queryClient = useQueryClient();

  // Fetch integrations from database
  const { data: dbIntegrations = [], isLoading } = useQuery({
    queryKey: ["integrations-manager"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integrations")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Mock integrations for UI demonstration
  const integrations: Integration[] = [
    {
      id: "supabase",
      name: "Supabase",
      description: "Backend-as-a-Service com PostgreSQL, Auth e Realtime",
      category: "database",
      status: "connected",
      enabled: true,
      lastSync: new Date(),
      syncInterval: "Tempo real",
      health: 100,
      requests24h: 45230,
      errors24h: 12,
      icon: Database,
    },
    {
      id: "openai",
      name: "OpenAI GPT-4",
      description: "Modelo de linguagem para análise de documentos e assistente IA",
      category: "ai",
      status: "connected",
      enabled: true,
      lastSync: new Date(Date.now() - 120000),
      syncInterval: "Por demanda",
      health: 98,
      requests24h: 1560,
      errors24h: 3,
      icon: Cpu,
    },
    {
      id: "sendgrid",
      name: "SendGrid",
      description: "Serviço de e-mail transacional e marketing",
      category: "communication",
      status: "connected",
      enabled: true,
      lastSync: new Date(Date.now() - 600000),
      health: 100,
      requests24h: 890,
      errors24h: 0,
      icon: Mail,
    },
    {
      id: "ais-provider",
      name: "AIS Maritime Data",
      description: "Dados de posicionamento de embarcações em tempo real",
      category: "maritime",
      status: "error",
      enabled: true,
      lastSync: new Date(Date.now() - 7200000),
      health: 45,
      requests24h: 12000,
      errors24h: 156,
      icon: Ship,
    },
    {
      id: "weather-api",
      name: "OpenWeather Marine",
      description: "Previsão meteorológica marítima detalhada",
      category: "maritime",
      status: "connected",
      enabled: true,
      lastSync: new Date(Date.now() - 60000),
      syncInterval: "1 minuto",
      health: 99,
      requests24h: 8640,
      errors24h: 2,
      icon: Cloud,
    },
    {
      id: "satcom",
      name: "Inmarsat Fleet",
      description: "Comunicação via satélite para embarcações",
      category: "communication",
      status: "connected",
      enabled: true,
      health: 95,
      requests24h: 234,
      errors24h: 5,
      icon: Satellite,
    },
    {
      id: "stripe",
      name: "Stripe Payments",
      description: "Processamento de pagamentos e faturamento",
      category: "payment",
      status: "connected",
      enabled: true,
      health: 100,
      requests24h: 45,
      errors24h: 0,
      icon: Globe,
    },
    {
      id: "port-authority",
      name: "Port Authority API",
      description: "Informações de portos e escalas",
      category: "maritime",
      status: "disconnected",
      enabled: false,
      health: 0,
      requests24h: 0,
      errors24h: 0,
      icon: Anchor,
    },
    {
      id: "analytics",
      name: "PostHog Analytics",
      description: "Análise de comportamento de usuários",
      category: "analytics",
      status: "connected",
      enabled: true,
      health: 100,
      requests24h: 15600,
      errors24h: 0,
      icon: TrendingUp,
    },
    {
      id: "sentry",
      name: "Sentry",
      description: "Monitoramento de erros e performance",
      category: "analytics",
      status: "connected",
      enabled: true,
      health: 100,
      requests24h: 2340,
      errors24h: 0,
      icon: Shield,
    },
  ];

  // Toggle integration status
  const toggleIntegration = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      // In real implementation, update database
      toast.success(enabled ? "Integração ativada" : "Integração desativada");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations-manager"] });
    },
  });

  // Sync integration
  const syncIntegration = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('access_logs').insert({
        action: 'integration_sync',
        module_accessed: `integration-${id}`,
        result: 'success',
        severity: 'info',
      });
      if (error) throw error;
      toast.success("Sincronização concluída");
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-success";
      case "syncing":
        return "text-primary";
      case "error":
        return "text-destructive";
      case "disconnected":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-success/10 text-success border-success/20">Conectado</Badge>;
      case "syncing":
        return <Badge className="bg-primary/10 text-primary border-primary/20">Sincronizando</Badge>;
      case "error":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Erro</Badge>;
      case "disconnected":
        return <Badge variant="secondary">Desconectado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 90) return "text-success";
    if (health >= 70) return "text-warning";
    return "text-destructive";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "database":
        return <Database className="h-4 w-4" />;
      case "ai":
        return <Cpu className="h-4 w-4" />;
      case "communication":
        return <Mail className="h-4 w-4" />;
      case "maritime":
        return <Ship className="h-4 w-4" />;
      case "cloud":
        return <Cloud className="h-4 w-4" />;
      case "analytics":
        return <TrendingUp className="h-4 w-4" />;
      case "payment":
        return <Globe className="h-4 w-4" />;
      default:
        return <Plug className="h-4 w-4" />;
    }
  };

  const filteredIntegrations = integrations.filter(int => {
    const matchesCategory = selectedCategory === "all" || int.category === selectedCategory;
    const matchesSearch = int.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         int.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const connectedCount = integrations.filter(i => i.status === "connected").length;
  const errorCount = integrations.filter(i => i.status === "error").length;
  const totalRequests = integrations.reduce((sum, i) => sum + i.requests24h, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <PlugZap className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{connectedCount}</p>
                <p className="text-sm text-muted-foreground">Conectadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{errorCount}</p>
                <p className="text-sm text-muted-foreground">Com Erro</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(totalRequests / 1000).toFixed(1)}k</p>
                <p className="text-sm text-muted-foreground">Req. (24h)</p>
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
                <p className="text-2xl font-bold">{integrations.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Buscar integrações..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:w-[300px]"
        />
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="gap-1"
            >
              {getCategoryIcon(cat.id)}
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIntegrations.map((integration, idx) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className={`h-full hover:shadow-md transition-all ${
              integration.status === "error" ? "border-destructive/50" : ""
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      integration.status === "connected" 
                        ? "bg-success/10" 
                        : integration.status === "error"
                        ? "bg-destructive/10"
                        : "bg-muted"
                    }`}>
                      <integration.icon className={`h-5 w-5 ${
                        integration.status === "connected"
                          ? "text-success"
                          : integration.status === "error"
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium">{integration.name}</h4>
                      <p className="text-xs text-muted-foreground">{integration.category}</p>
                    </div>
                  </div>
                  <Switch
                    checked={integration.enabled}
                    onCheckedChange={(checked) => toggleIntegration.mutate({ id: integration.id, enabled: checked })}
                  />
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {integration.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  {getStatusBadge(integration.status)}
                  <span className={`text-sm font-medium ${getHealthColor(integration.health)}`}>
                    {integration.health}% Health
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-4">
                  <div>
                    <span>Requisições (24h):</span>
                    <span className="ml-1 font-medium text-foreground">{integration.requests24h.toLocaleString()}</span>
                  </div>
                  <div>
                    <span>Erros:</span>
                    <span className={`ml-1 font-medium ${integration.errors24h > 0 ? "text-destructive" : "text-success"}`}>
                      {integration.errors24h}
                    </span>
                  </div>
                </div>

                {integration.lastSync && (
                  <p className="text-xs text-muted-foreground mb-4">
                    Última sync: {integration.lastSync.toLocaleTimeString("pt-BR")}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => syncIntegration.mutate(integration.id)}
                    disabled={syncIntegration.isPending || !integration.enabled}
                  >
                    <RefreshCw className={`h-3 w-3 mr-1 ${syncIntegration.isPending ? "animate-spin" : ""}`} />
                    Sincronizar
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <integration.icon className="h-5 w-5" />
                          Configurar {integration.name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">API Key</label>
                          <div className="flex gap-2">
                            <Input
                              type={showApiKey ? "text" : "password"}
                              value="sk_live_••••••••••••••••"
                              readOnly
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowApiKey(!showApiKey)}
                            >
                              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Webhook URL</label>
                          <Input
                            value="https://api.nautilus.com/webhooks/..."
                            readOnly
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Ativar Integração</label>
                          <Switch checked={integration.enabled} />
                        </div>

                        <div className="pt-4 flex gap-2">
                          <Button className="flex-1">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Salvar
                          </Button>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Add New Integration Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="h-full border-dashed hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[250px]">
              <div className="p-4 rounded-full bg-muted mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h4 className="font-medium mb-2">Nova Integração</h4>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Conecte um novo serviço ao sistema
              </p>
              <Button variant="outline" className="gap-2">
                Explorar
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
