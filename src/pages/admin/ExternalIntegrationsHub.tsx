/**
 * External Integrations Hub - Admin Dashboard
 * Manage Stripe, Twilio, SendGrid, Weather APIs and more
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  MessageSquare, 
  Mail, 
  Cloud, 
  Webhook,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  TestTube,
  Zap,
  Send
} from "lucide-react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "connected" | "disconnected" | "error";
  category: "payments" | "communication" | "weather" | "analytics";
  lastSync?: string;
  features: string[];
}

const INTEGRATIONS: Integration[] = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Pagamentos, assinaturas e faturamento",
    icon: <CreditCard className="h-6 w-6" />,
    status: "connected",
    category: "payments",
    lastSync: "2 minutos atrás",
    features: ["Pagamentos", "Assinaturas", "Faturas", "Customer Portal"]
  },
  {
    id: "twilio",
    name: "Twilio",
    description: "SMS, WhatsApp e chamadas de voz",
    icon: <MessageSquare className="h-6 w-6" />,
    status: "connected",
    category: "communication",
    lastSync: "5 minutos atrás",
    features: ["SMS", "WhatsApp", "Voice", "Video"]
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Email transacional e marketing",
    icon: <Mail className="h-6 w-6" />,
    status: "connected",
    category: "communication",
    lastSync: "1 minuto atrás",
    features: ["Email Transacional", "Templates", "Analytics"]
  },
  {
    id: "resend",
    name: "Resend",
    description: "Email API moderna para desenvolvedores",
    icon: <Send className="h-6 w-6" />,
    status: "connected",
    category: "communication",
    lastSync: "30 segundos atrás",
    features: ["Email API", "React Templates", "Webhooks"]
  },
  {
    id: "openweather",
    name: "OpenWeatherMap",
    description: "Dados meteorológicos em tempo real",
    icon: <Cloud className="h-6 w-6" />,
    status: "connected",
    category: "weather",
    lastSync: "10 minutos atrás",
    features: ["Previsão", "Alertas", "Dados Históricos"]
  },
  {
    id: "stormglass",
    name: "StormGlass",
    description: "Previsão marítima especializada",
    icon: <Cloud className="h-6 w-6" />,
    status: "connected",
    category: "weather",
    lastSync: "15 minutos atrás",
    features: ["Ondas", "Maré", "Vento Marítimo"]
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Automações e integrações sem código",
    icon: <Zap className="h-6 w-6" />,
    status: "disconnected",
    category: "analytics",
    features: ["Automações", "5000+ Apps", "Webhooks"]
  }
];

export default function ExternalIntegrationsHub() {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [activeTab, setActiveTab] = useState("all");
  const [testing, setTesting] = useState<string | null>(null);

  const handleTestConnection = async (integrationId: string) => {
    setTesting(integrationId);
    
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Conexão testada",
      description: `Integração ${integrationId} está funcionando corretamente.`,
    });
    
    setTesting(null);
  };

  const handleToggleIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(i => {
      if (i.id === integrationId) {
        const newStatus = i.status === "connected" ? "disconnected" : "connected";
        toast({
          title: newStatus === "connected" ? "Integração ativada" : "Integração desativada",
          description: `${i.name} foi ${newStatus === "connected" ? "conectada" : "desconectada"}.`,
        });
        return { ...i, status: newStatus };
      }
      return i;
    }));
  };

  const filteredIntegrations = activeTab === "all" 
    ? integrations 
    : integrations.filter(i => i.category === activeTab);

  const stats = {
    total: integrations.length,
    connected: integrations.filter(i => i.status === "connected").length,
    disconnected: integrations.filter(i => i.status === "disconnected").length,
    error: integrations.filter(i => i.status === "error").length,
  };

  return (
    <ModulePageWrapper gradient="blue">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Integrações Externas</h1>
            <p className="text-muted-foreground">
              Gerencie conexões com serviços de terceiros
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
            <Button>
              <Webhook className="h-4 w-4 mr-2" />
              Nova Integração
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-500">{stats.connected}</div>
              <p className="text-sm text-muted-foreground">Conectadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-500">{stats.disconnected}</div>
              <p className="text-sm text-muted-foreground">Desconectadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-500">{stats.error}</div>
              <p className="text-sm text-muted-foreground">Com Erro</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="communication">Comunicação</TabsTrigger>
            <TabsTrigger value="weather">Meteorologia</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredIntegrations.map((integration) => (
                <Card key={integration.id} className="relative overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          {integration.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {integration.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge 
                        variant={integration.status === "connected" ? "default" : "secondary"}
                        className={
                          integration.status === "connected" 
                            ? "bg-green-500/10 text-green-500 border-green-500/20" 
                            : integration.status === "error"
                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                            : ""
                        }
                      >
                        {integration.status === "connected" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {integration.status === "error" && <XCircle className="h-3 w-3 mr-1" />}
                        {integration.status === "connected" ? "Conectado" : 
                         integration.status === "error" ? "Erro" : "Desconectado"}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Features */}
                    <div className="flex flex-wrap gap-1">
                      {integration.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    {/* Last Sync */}
                    {integration.lastSync && (
                      <p className="text-xs text-muted-foreground">
                        Última sincronização: {integration.lastSync}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`toggle-${integration.id}`} className="text-xs">
                          Ativo
                        </Label>
                        <Switch
                          id={`toggle-${integration.id}`}
                          checked={integration.status === "connected"}
                          onCheckedChange={() => handleToggleIntegration(integration.id)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleTestConnection(integration.id)}
                          disabled={testing === integration.id}
                        >
                          {testing === integration.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <TestTube className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Teste e configure suas integrações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Testar Email (Resend)</Label>
                <div className="flex gap-2">
                  <Input placeholder="email@exemplo.com" />
                  <Button>Enviar</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Testar SMS (Twilio)</Label>
                <div className="flex gap-2">
                  <Input placeholder="+55 11 99999-9999" />
                  <Button>Enviar</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Testar Webhook</Label>
                <div className="flex gap-2">
                  <Input placeholder="https://..." />
                  <Button>Disparar</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModulePageWrapper>
  );
}
