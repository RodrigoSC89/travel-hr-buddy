import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Plug,
  Plus,
  Settings,
  Check,
  X,
  RefreshCw,
  Database,
  Mail,
  FileText,
  Cloud,
  Smartphone,
  Globe,
  Activity,
  Download,
  AlertTriangle,
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: "database" | "communication" | "reporting" | "storage" | "mobile" | "external-api";
  status: "connected" | "disconnected" | "error" | "configuring";
  lastSync?: string;
  config: Record<string, any>;
  isActive: boolean;
}

export const PeotramIntegrationHub: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>(getDemoIntegrations());
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  function getDemoIntegrations(): Integration[] {
    return [
      {
        id: "INT001",
        name: "Sistema ERP",
        description: "Integração com sistema ERP corporativo para sincronização de dados",
        category: "database",
        status: "connected",
        lastSync: "2024-01-22 14:30",
        config: { endpoint: "https://erp.empresa.com/api", apiKey: "***" },
        isActive: true,
      },
      {
        id: "INT002",
        name: "Email Notifications",
        description: "Envio automático de notificações por email",
        category: "communication",
        status: "connected",
        lastSync: "2024-01-22 15:45",
        config: { smtpServer: "smtp.empresa.com", port: 587 },
        isActive: true,
      },
      {
        id: "INT003",
        name: "Power BI",
        description: "Exportação de dados para dashboards corporativos",
        category: "reporting",
        status: "disconnected",
        config: { workspace: "", datasetId: "" },
        isActive: false,
      },
      {
        id: "INT004",
        name: "SharePoint",
        description: "Armazenamento de documentos em SharePoint",
        category: "storage",
        status: "error",
        lastSync: "2024-01-21 10:15",
        config: { siteUrl: "https://empresa.sharepoint.com", folder: "/PEOTRAM" },
        isActive: true,
      },
      {
        id: "INT005",
        name: "App Mobile",
        description: "Sincronização com aplicativo mobile para auditorias offline",
        category: "mobile",
        status: "connected",
        lastSync: "2024-01-22 16:00",
        config: { deviceCount: 12, lastVersion: "2.1.4" },
        isActive: true,
      },
      {
        id: "INT006",
        name: "API Externa ANTAQ",
        description: "Integração com dados públicos da ANTAQ",
        category: "external-api",
        status: "configuring",
        config: { endpoint: "https://api.antaq.gov.br", token: "" },
        isActive: false,
      },
    ];
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-success/20 text-success border-success/30";
      case "error":
        return "bg-destructive/20 text-destructive border-destructive/30";
      case "configuring":
        return "bg-warning/20 text-warning border-warning/30";
      case "disconnected":
        return "bg-muted/20 text-muted-foreground border-muted/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <Check className="w-4 h-4 text-success" />;
      case "error":
        return <X className="w-4 h-4 text-destructive" />;
      case "configuring":
        return <Settings className="w-4 h-4 text-warning" />;
      case "disconnected":
        return <X className="w-4 h-4 text-muted-foreground" />;
      default:
        return <X className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "database":
        return <Database className="w-5 h-5" />;
      case "communication":
        return <Mail className="w-5 h-5" />;
      case "reporting":
        return <FileText className="w-5 h-5" />;
      case "storage":
        return <Cloud className="w-5 h-5" />;
      case "mobile":
        return <Smartphone className="w-5 h-5" />;
      case "external-api":
        return <Globe className="w-5 h-5" />;
      default:
        return <Plug className="w-5 h-5" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "database":
        return "Banco de Dados";
      case "communication":
        return "Comunicação";
      case "reporting":
        return "Relatórios";
      case "storage":
        return "Armazenamento";
      case "mobile":
        return "Mobile";
      case "external-api":
        return "API Externa";
      default:
        return category;
    }
  };

  const toggleIntegration = (id: string) => {
    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === id ? { ...integration, isActive: !integration.isActive } : integration
      )
    );
  };

  const syncIntegration = (id: string) => {
    // Simular sincronização
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Central de Integrações</h2>
          <p className="text-muted-foreground">Gerencie conexões com sistemas externos e APIs</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sincronizar Tudo
          </Button>
          <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Integração
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Configurar Nova Integração</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="integration-name">Nome</Label>
                    <Input id="integration-name" placeholder="Nome da integração" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="integration-category">Categoria</Label>
                    <Input id="integration-category" placeholder="Categoria" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="integration-description">Descrição</Label>
                  <Textarea id="integration-description" placeholder="Descrição da integração" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsConfigOpen(false)}>Configurar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="active">Ativas</TabsTrigger>
          <TabsTrigger value="available">Disponíveis</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Plug className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{integrations.length}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Check className="w-8 h-8 text-success" />
                  <div>
                    <p className="text-2xl font-bold">
                      {integrations.filter(i => i.status === "connected").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Conectadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-8 h-8 text-warning" />
                  <div>
                    <p className="text-2xl font-bold">
                      {integrations.filter(i => i.status === "error").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Com Erro</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-8 h-8 text-info" />
                  <div>
                    <p className="text-2xl font-bold">
                      {integrations.filter(i => i.isActive).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Ativas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {integrations.map(integration => (
              <Card key={integration.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(integration.category)}
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <CardDescription>{getCategoryName(integration.category)}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(integration.status)}>
                        {getStatusIcon(integration.status)}
                        {integration.status}
                      </Badge>
                      <Switch
                        checked={integration.isActive}
                        onCheckedChange={() => toggleIntegration(integration.id)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{integration.description}</p>

                  {integration.lastSync && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <RefreshCw className="w-3 h-3" />
                      Última sincronização: {integration.lastSync}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedIntegration(integration)}
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Configurar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => syncIntegration(integration.id)}
                      disabled={integration.status !== "connected"}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Sincronizar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {integrations
              .filter(i => i.isActive)
              .map(integration => (
                <Card key={integration.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(integration.category)}
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                      </div>
                      <Badge variant="outline" className={getStatusColor(integration.status)}>
                        {getStatusIcon(integration.status)}
                        {integration.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>

                    {integration.lastSync && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <RefreshCw className="w-3 h-3" />
                        Última sincronização: {integration.lastSync}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Activity className="w-3 h-3 mr-1" />
                        Monitor
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="w-3 h-3 mr-1" />
                        Configurar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="available" className="space-y-6">
          <div className="text-center p-8">
            <Plug className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Integrações Disponíveis</h3>
            <p className="text-muted-foreground mb-4">
              Explore mais integrações disponíveis para o seu sistema PEOTRAM
            </p>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Explorar Marketplace
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <div className="text-center p-8">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Logs de Integração</h3>
            <p className="text-muted-foreground mb-4">
              Visualize logs detalhados de todas as integrações
            </p>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar Logs
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
