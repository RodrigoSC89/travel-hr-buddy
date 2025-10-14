import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Zap, 
  Cloud, 
  Database, 
  Shield, 
  Webhook,
  CheckCircle,
  AlertCircle,
  Settings,
  Plus,
  Trash2,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: "payment" | "crm" | "analytics" | "security" | "communication" | "storage";
  status: "connected" | "disconnected" | "error";
  icon: React.ReactNode;
  configurable: boolean;
  webhookUrl?: string;
  lastSync?: Date;
}

interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  lastTrigger?: Date;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: Date;
  lastUsed?: Date;
  active: boolean;
}

export const APIIntegrationsHub: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "1",
      name: "Stripe",
      description: "Processamento de pagamentos",
      category: "payment",
      status: "connected",
      icon: <Zap className="h-5 w-5" />,
      configurable: true,
      lastSync: new Date(Date.now() - 2 * 60000)
    },
    {
      id: "2",
      name: "HubSpot",
      description: "CRM e automação de marketing",
      category: "crm",
      status: "disconnected",
      icon: <Database className="h-5 w-5" />,
      configurable: true
    },
    {
      id: "3",
      name: "Google Analytics",
      description: "Análise de dados e métricas",
      category: "analytics",
      status: "connected",
      icon: <Cloud className="h-5 w-5" />,
      configurable: false,
      lastSync: new Date(Date.now() - 5 * 60000)
    },
    {
      id: "4",
      name: "Auth0",
      description: "Autenticação e segurança",
      category: "security",
      status: "error",
      icon: <Shield className="h-5 w-5" />,
      configurable: true
    }
  ]);

  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: "1",
      name: "Production API",
      key: "naut_prod_" + Math.random().toString(36).substring(7),
      permissions: ["read", "write", "admin"],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 30 * 60000),
      active: true
    },
    {
      id: "2",
      name: "Development API",
      key: "naut_dev_" + Math.random().toString(36).substring(7),
      permissions: ["read", "write"],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
      active: true
    }
  ]);

  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: "1",
      url: "https://api.nautilus.com/webhooks/stripe",
      events: ["payment.completed", "payment.failed"],
      active: true,
      lastTrigger: new Date(Date.now() - 15 * 60000)
    },
    {
      id: "2",
      url: "https://api.nautilus.com/webhooks/notifications",
      events: ["user.created", "user.updated"],
      active: true,
      lastTrigger: new Date(Date.now() - 45 * 60000)
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newKeyName, setNewKeyName] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
    case "connected": return "bg-green-500";
    case "disconnected": return "bg-gray-500";
    case "error": return "bg-red-500";
    default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "connected": return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "error": return <AlertCircle className="h-4 w-4 text-red-500" />;
    default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const filteredIntegrations = integrations.filter(integration => 
    selectedCategory === "all" || integration.category === selectedCategory
  );

  const handleConnect = (integration: Integration) => {
    setIntegrations(prev => prev.map(int => 
      int.id === integration.id 
        ? { ...int, status: "connected", lastSync: new Date() }
        : int
    ));
    
    toast({
      title: "Integração conectada",
      description: `${integration.name} foi conectado com sucesso.`,
    });
  };

  const handleDisconnect = (integration: Integration) => {
    setIntegrations(prev => prev.map(int => 
      int.id === integration.id 
        ? { ...int, status: "disconnected", lastSync: undefined }
        : int
    ));
    
    toast({
      title: "Integração desconectada",
      description: `${integration.name} foi desconectado.`,
    });
  };

  const handleSync = (integration: Integration) => {
    setIntegrations(prev => prev.map(int => 
      int.id === integration.id 
        ? { ...int, lastSync: new Date() }
        : int
    ));
    
    toast({
      title: "Sincronização concluída",
      description: `Dados do ${integration.name} foram sincronizados.`,
    });
  };

  const createAPIKey = () => {
    if (!newKeyName.trim()) return;

    const newKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: "naut_" + Math.random().toString(36).substring(2, 15),
      permissions: ["read"],
      createdAt: new Date(),
      active: true
    };

    setApiKeys(prev => [...prev, newKey]);
    setNewKeyName("");
    
    toast({
      title: "Chave API criada",
      description: "Nova chave API foi gerada com sucesso.",
    });
  };

  const revokeAPIKey = (keyId: string) => {
    setApiKeys(prev => prev.map(key => 
      key.id === keyId ? { ...key, active: false } : key
    ));
    
    toast({
      title: "Chave revogada",
      description: "A chave API foi revogada com sucesso.",
    });
  };

  const createWebhook = () => {
    if (!newWebhookUrl.trim()) return;

    const newWebhook = {
      id: Date.now().toString(),
      url: newWebhookUrl,
      events: ["user.created"],
      active: true,
      lastTrigger: undefined
    };

    setWebhooks(prev => [...prev, newWebhook]);
    setNewWebhookUrl("");
    
    toast({
      title: "Webhook criado",
      description: "Novo webhook foi configurado com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Hub de Integrações</h2>
        <p className="text-muted-foreground">
          Gerencie todas as integrações, APIs e webhooks do sistema
        </p>
      </div>

      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="api-keys">Chaves API</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Label>Filtrar por categoria:</Label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border border-border rounded-md bg-background"
            >
              <option value="all">Todas</option>
              <option value="payment">Pagamento</option>
              <option value="crm">CRM</option>
              <option value="analytics">Analytics</option>
              <option value="security">Segurança</option>
              <option value="communication">Comunicação</option>
              <option value="storage">Armazenamento</option>
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {integration.icon}
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(integration.status)}
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(integration.status)}`} />
                    </div>
                  </div>
                  <CardDescription>{integration.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="capitalize">
                        {integration.category}
                      </Badge>
                      <Badge variant={integration.status === "connected" ? "default" : "secondary"}>
                        {integration.status === "connected" ? "Conectado" : 
                          integration.status === "error" ? "Erro" : "Desconectado"}
                      </Badge>
                    </div>

                    {integration.lastSync && (
                      <p className="text-xs text-muted-foreground">
                        Última sincronização: {integration.lastSync.toLocaleTimeString()}
                      </p>
                    )}

                    <div className="flex space-x-2">
                      {integration.status === "connected" ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSync(integration)}
                            className="flex-1"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Sync
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDisconnect(integration)}
                          >
                            Desconectar
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleConnect(integration)}
                          className="flex-1"
                        >
                          Conectar
                        </Button>
                      )}
                      
                      {integration.configurable && (
                        <Button size="sm" variant="outline">
                          <Settings className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Chaves API</CardTitle>
              <CardDescription>
                Crie e gerencie chaves API para acesso ao sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-4">
                <Input
                  placeholder="Nome da chave API"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
                <Button onClick={createAPIKey}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar
                </Button>
              </div>

              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div key={key.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{key.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Criada em {key.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch checked={key.active} />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => revokeAPIKey(key.id)}
                          disabled={!key.active}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-muted rounded p-2 mb-2">
                      <code className="text-sm">{key.key}</code>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {key.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                    
                    {key.lastUsed && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Último uso: {key.lastUsed.toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurar Webhooks</CardTitle>
              <CardDescription>
                Configure endpoints para receber eventos do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-4">
                <Input
                  placeholder="URL do webhook"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                />
                <Button onClick={createWebhook}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              <div className="space-y-3">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium flex items-center">
                          <Webhook className="h-4 w-4 mr-2" />
                          {webhook.url}
                        </h4>
                        {webhook.lastTrigger && (
                          <p className="text-sm text-muted-foreground">
                            Último trigger: {webhook.lastTrigger.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch checked={webhook.active} />
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="secondary" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};