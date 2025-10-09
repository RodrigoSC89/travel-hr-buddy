import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Globe, 
  Link, 
  Code, 
  Database, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  status: "connected" | "disconnected" | "error";
  lastSync?: Date;
  config?: Record<string, any>;
}

const IntegrationsHub = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [zapierWebhook, setZapierWebhook] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "zapier",
      name: "Zapier",
      description: "Automatize workflows conectando milhares de aplicativos",
      icon: Link,
      category: "automation",
      status: "disconnected"
    },
    {
      id: "slack",
      name: "Slack",
      description: "Notificações em tempo real para sua equipe",
      icon: MessageSquare,
      category: "communication",
      status: "connected",
      lastSync: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Sincronize eventos e compromissos",
      icon: Calendar,
      category: "productivity",
      status: "connected",
      lastSync: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Processamento de pagamentos integrado",
      icon: DollarSign,
      category: "payments",
      status: "error",
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: "google-analytics",
      name: "Google Analytics",
      description: "Análise de dados e métricas avançadas",
      icon: BarChart3,
      category: "analytics",
      status: "connected",
      lastSync: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: "Marketing por email automatizado",
      icon: Mail,
      category: "marketing",
      status: "disconnected"
    },
    {
      id: "whatsapp-business",
      name: "WhatsApp Business",
      description: "Comunicação direta com clientes",
      icon: Smartphone,
      category: "communication",
      status: "disconnected"
    },
    {
      id: "postgresql",
      name: "PostgreSQL",
      description: "Banco de dados principal do sistema",
      icon: Database,
      category: "database",
      status: "connected",
      lastSync: new Date(Date.now() - 1 * 60 * 1000)
    }
  ]);

  const categories = [
    { id: "all", name: "Todas", count: integrations.length },
    { id: "communication", name: "Comunicação", count: integrations.filter(i => i.category === "communication").length },
    { id: "automation", name: "Automação", count: integrations.filter(i => i.category === "automation").length },
    { id: "analytics", name: "Analytics", count: integrations.filter(i => i.category === "analytics").length },
    { id: "payments", name: "Pagamentos", count: integrations.filter(i => i.category === "payments").length },
    { id: "productivity", name: "Produtividade", count: integrations.filter(i => i.category === "productivity").length },
    { id: "marketing", name: "Marketing", count: integrations.filter(i => i.category === "marketing").length },
    { id: "database", name: "Banco de Dados", count: integrations.filter(i => i.category === "database").length }
  ];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === "all" || integration.category === selectedCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "connected":
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "error":
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    default:
      return <RefreshCw className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "connected":
      return "text-green-600 bg-green-100";
    case "error":
      return "text-red-600 bg-red-100";
    default:
      return "text-muted-foreground bg-gray-100";
    }
  };

  const handleTriggerZapier = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!zapierWebhook) {
      toast({
        title: "Erro",
        description: "Por favor, insira a URL do webhook do Zapier",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(zapierWebhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
          user_id: "user-123",
          event_type: "manual_trigger"
        }),
      });

      toast({
        title: "Webhook Enviado",
        description: "A requisição foi enviada para o Zapier. Verifique o histórico do seu Zap para confirmar.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar webhook. Verifique a URL e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === id) {
        const newStatus = integration.status === "connected" ? "disconnected" : "connected";
        return {
          ...integration,
          status: newStatus,
          lastSync: newStatus === "connected" ? new Date() : undefined
        };
      }
      return integration;
    }));

    toast({
      title: "Integração atualizada",
      description: "Status da integração foi alterado com sucesso",
    });
  };

  const syncIntegration = (id: string) => {
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === id && integration.status === "connected") {
        return {
          ...integration,
          lastSync: new Date()
        };
      }
      return integration;
    }));

    toast({
      title: "Sincronização concluída",
      description: "Dados atualizados com sucesso",
    });
  };

  const getRelativeTime = (date?: Date) => {
    if (!date) return "Nunca";
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Agora";
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  const connectedCount = integrations.filter(i => i.status === "connected").length;
  const errorCount = integrations.filter(i => i.status === "error").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="w-8 h-8" />
            Hub de Integrações
          </h1>
          <p className="text-muted-foreground">
            {connectedCount} conectadas · {errorCount} com erro · {integrations.length - connectedCount - errorCount} disponíveis
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Integração
        </Button>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="zapier">Zapier</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Buscar integrações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:max-w-xs"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <integration.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{integration.name}</h3>
                        <Badge className={getStatusColor(integration.status)} variant="secondary">
                          {integration.status === "connected" ? "Conectado" : 
                            integration.status === "error" ? "Erro" : "Desconectado"}
                        </Badge>
                      </div>
                    </div>
                    {getStatusIcon(integration.status)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {integration.description}
                  </p>
                  
                  {integration.lastSync && (
                    <p className="text-xs text-muted-foreground mb-4">
                      Última sinc: {getRelativeTime(integration.lastSync)}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      variant={integration.status === "connected" ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toggleIntegration(integration.id)}
                      className="flex-1"
                    >
                      {integration.status === "connected" ? "Desconectar" : "Conectar"}
                    </Button>
                    {integration.status === "connected" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => syncIntegration(integration.id)}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="zapier" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Integração Zapier
              </CardTitle>
              <CardDescription>
                Configure webhooks do Zapier para automatizar workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleTriggerZapier} className="space-y-4">
                <div>
                  <Label htmlFor="zapier-webhook">URL do Webhook Zapier</Label>
                  <Input
                    id="zapier-webhook"
                    type="url"
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    value={zapierWebhook}
                    onChange={(e) => setZapierWebhook(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Cole a URL do webhook do seu Zap aqui
                  </p>
                </div>
                
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  Testar Webhook
                </Button>
              </form>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Como configurar:</h4>
                <ol className="text-sm space-y-1 text-muted-foreground">
                  <li>1. Crie um novo Zap no Zapier</li>
                  <li>2. Use "Webhooks by Zapier" como trigger</li>
                  <li>3. Escolha "Catch Hook"</li>
                  <li>4. Cole a URL gerada acima</li>
                  <li>5. Configure as ações desejadas</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Webhooks</CardTitle>
              <CardDescription>
                Configure endpoints para receber notificações de eventos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>URL do Endpoint</Label>
                  <Input placeholder="https://seu-dominio.com/webhook" />
                </div>
                <div>
                  <Label>Eventos</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {["user.created", "certificate.expired", "report.generated", "alert.triggered"].map((event) => (
                      <label key={event} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Button>Salvar Webhook</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                API e Tokens
              </CardTitle>
              <CardDescription>
                Gerencie chaves de API e tokens de acesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Chave da API</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="password" 
                      value="sk_live_xxxxxxxxxxxxxxxxxxxxx" 
                      readOnly 
                      className="font-mono"
                    />
                    <Button variant="outline">Regenerar</Button>
                  </div>
                </div>
                
                <div>
                  <Label>Base URL da API</Label>
                  <Input 
                    value="https://api.nautilus.com/v1" 
                    readOnly 
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Exemplo de uso:</h4>
                <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
                  {`curl -X GET "https://api.nautilus.com/v1/users" \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json"`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsHub;