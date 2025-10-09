import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Code,
  Key,
  Globe,
  Zap,
  Shield,
  Book,
  Download,
  Users,
  Webhook,
  Package,
  ExternalLink,
  Copy,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface APIEndpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  endpoint: string;
  description: string;
  category: "vessels" | "crew" | "voyages" | "alerts" | "reports" | "auth";
  authenticated: boolean;
  rateLimit: string;
  version: string;
}

interface WebhookEvent {
  id: string;
  event: string;
  description: string;
  payload: string;
  frequency: string;
}

interface SDK {
  id: string;
  name: string;
  language: string;
  version: string;
  downloads: number;
  lastUpdate: string;
  status: "stable" | "beta" | "deprecated";
}

export const PublicAPI = () => {
  const [apiKey, setApiKey] = useState("naut_live_sk_1a2b3c4d5e6f7g8h9i0j");
  const [copiedKey, setCopiedKey] = useState(false);
  const { toast } = useToast();

  const apiEndpoints: APIEndpoint[] = [
    {
      id: "1",
      method: "GET",
      endpoint: "/api/v1/vessels",
      description: "Lista todas as embarcações com status e localização",
      category: "vessels",
      authenticated: true,
      rateLimit: "1000/hora",
      version: "v1",
    },
    {
      id: "2",
      method: "POST",
      endpoint: "/api/v1/vessels/{id}/voyage",
      description: "Cria uma nova viagem para a embarcação especificada",
      category: "voyages",
      authenticated: true,
      rateLimit: "500/hora",
      version: "v1",
    },
    {
      id: "3",
      method: "GET",
      endpoint: "/api/v1/crew/{id}",
      description: "Obtém informações detalhadas de um tripulante",
      category: "crew",
      authenticated: true,
      rateLimit: "2000/hora",
      version: "v1",
    },
    {
      id: "4",
      method: "POST",
      endpoint: "/api/v1/alerts",
      description: "Cria um novo alerta de preço ou operacional",
      category: "alerts",
      authenticated: true,
      rateLimit: "200/hora",
      version: "v1",
    },
    {
      id: "5",
      method: "GET",
      endpoint: "/api/v1/reports/operational",
      description: "Gera relatório operacional em tempo real",
      category: "reports",
      authenticated: true,
      rateLimit: "50/hora",
      version: "v1",
    },
    {
      id: "6",
      method: "POST",
      endpoint: "/api/v1/auth/token",
      description: "Autentica e obtém token de acesso OAuth2",
      category: "auth",
      authenticated: false,
      rateLimit: "100/hora",
      version: "v1",
    },
  ];

  const webhookEvents: WebhookEvent[] = [
    {
      id: "1",
      event: "vessel.status_changed",
      description: "Disparado quando o status de uma embarcação muda",
      payload: '{"vessel_id": "string", "old_status": "string", "new_status": "string"}',
      frequency: "Tempo real",
    },
    {
      id: "2",
      event: "voyage.completed",
      description: "Disparado quando uma viagem é concluída",
      payload: '{"voyage_id": "string", "vessel_id": "string", "duration": "number"}',
      frequency: "Tempo real",
    },
    {
      id: "3",
      event: "alert.triggered",
      description: "Disparado quando um alerta é acionado",
      payload: '{"alert_id": "string", "type": "string", "priority": "string"}',
      frequency: "Tempo real",
    },
    {
      id: "4",
      event: "certificate.expiring",
      description: "Disparado quando uma certificação está próxima do vencimento",
      payload:
        '{"certificate_id": "string", "employee_id": "string", "days_until_expiry": "number"}',
      frequency: "Diário",
    },
  ];

  const sdks: SDK[] = [
    {
      id: "1",
      name: "nautilus-js",
      language: "JavaScript/TypeScript",
      version: "2.1.4",
      downloads: 15420,
      lastUpdate: "2025-01-15",
      status: "stable",
    },
    {
      id: "2",
      name: "nautilus-python",
      language: "Python",
      version: "1.8.2",
      downloads: 8750,
      lastUpdate: "2025-01-12",
      status: "stable",
    },
    {
      id: "3",
      name: "nautilus-java",
      language: "Java",
      version: "1.5.1",
      downloads: 4320,
      lastUpdate: "2025-01-08",
      status: "beta",
    },
    {
      id: "4",
      name: "nautilus-csharp",
      language: "C#/.NET",
      version: "1.3.0",
      downloads: 2180,
      lastUpdate: "2024-12-20",
      status: "stable",
    },
  ];

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    toast({
      title: "Chave copiada",
      description: "A chave da API foi copiada para a área de transferência.",
    });
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const generateNewKey = () => {
    const newKey = `naut_live_sk_${Math.random().toString(36).substring(2, 15)}`;
    setApiKey(newKey);
    toast({
      title: "Nova chave gerada",
      description: "Uma nova chave da API foi gerada com sucesso.",
    });
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-success text-success-foreground";
      case "POST":
        return "bg-info text-info-foreground";
      case "PUT":
        return "bg-warning text-warning-foreground";
      case "DELETE":
        return "bg-danger text-danger-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "stable":
        return "bg-success text-success-foreground";
      case "beta":
        return "bg-warning text-warning-foreground";
      case "deprecated":
        return "bg-danger text-danger-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            API Pública & Plataforma Aberta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{apiEndpoints.length}</div>
              <div className="text-sm text-muted-foreground">Endpoints</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{webhookEvents.length}</div>
              <div className="text-sm text-muted-foreground">Webhooks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-info">{sdks.length}</div>
              <div className="text-sm text-muted-foreground">SDKs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="endpoints" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="sdks">SDKs</TabsTrigger>
          <TabsTrigger value="auth">Autenticação</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-6">
          {/* API Documentation */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Documentação da API
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Book className="h-4 w-4 mr-2" />
                    Swagger UI
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    OpenAPI Spec
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiEndpoints.map(endpoint => (
                  <div key={endpoint.id} className="border rounded-lg p-4 hover-lift">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge className={getMethodColor(endpoint.method)}>{endpoint.method}</Badge>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {endpoint.endpoint}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        {endpoint.authenticated && (
                          <Badge variant="outline">
                            <Shield className="h-3 w-3 mr-1" />
                            Auth
                          </Badge>
                        )}
                        <Badge variant="outline">{endpoint.rateLimit}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{endpoint.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Categoria: {endpoint.category}</span>
                      <span>Versão: {endpoint.version}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          {/* Webhook Configuration */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-primary" />
                Configuração de Webhooks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="webhook-url">URL do Webhook</Label>
                    <Input
                      id="webhook-url"
                      placeholder="https://sua-api.com/webhooks/nautilus"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="webhook-secret">Secret (Opcional)</Label>
                    <Input
                      id="webhook-secret"
                      placeholder="Chave secreta para verificação"
                      type="password"
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button>
                  <Zap className="h-4 w-4 mr-2" />
                  Adicionar Webhook
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Available Events */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Eventos Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhookEvents.map(event => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm font-semibold">{event.event}</code>
                      <Badge variant="outline">{event.frequency}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                    <details className="text-sm">
                      <summary className="cursor-pointer text-primary">Ver payload</summary>
                      <code className="block mt-2 p-2 bg-muted rounded text-xs">
                        {event.payload}
                      </code>
                    </details>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sdks" className="space-y-6">
          {/* SDK Downloads */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                SDKs e Bibliotecas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sdks.map(sdk => (
                  <div key={sdk.id} className="border rounded-lg p-4 hover-lift">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{sdk.name}</h4>
                      <Badge className={getStatusColor(sdk.status)}>{sdk.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{sdk.language}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="font-medium">Versão:</span>
                        <p className="text-muted-foreground">{sdk.version}</p>
                      </div>
                      <div>
                        <span className="font-medium">Downloads:</span>
                        <p className="text-muted-foreground">{sdk.downloads.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        GitHub
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Marketplace */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Marketplace de Extensões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
                <p className="text-muted-foreground mb-4">
                  Marketplace para extensões e integrações de terceiros chegando em breve.
                </p>
                <Button variant="outline">Seja um Desenvolvedor Parceiro</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth" className="space-y-6">
          {/* API Key Management */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Gerenciamento de Chaves
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="api-key">Sua Chave da API</Label>
                  <div className="flex gap-2 mt-1">
                    <Input id="api-key" value={apiKey} readOnly className="font-mono" />
                    <Button variant="outline" size="icon" onClick={copyApiKey}>
                      {copiedKey ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={generateNewKey}>
                    <Key className="h-4 w-4 mr-2" />
                    Gerar Nova Chave
                  </Button>
                  <Button variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Configurar Permissões
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* OAuth2 Setup */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-success" />
                Configuração OAuth2
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client-id">Client ID</Label>
                    <Input
                      id="client-id"
                      value="naut_client_abc123def456"
                      readOnly
                      className="mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-secret">Client Secret</Label>
                    <Input
                      id="client-secret"
                      type="password"
                      value="naut_secret_xyz789uvw456"
                      readOnly
                      className="mt-1 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="redirect-uri">Redirect URI</Label>
                  <Input
                    id="redirect-uri"
                    placeholder="https://sua-app.com/auth/callback"
                    className="mt-1"
                  />
                </div>

                <div className="bg-muted/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Exemplo de Integração</h4>
                  <code className="text-sm block">
                    {`curl -X POST https://api.nautilus.com/oauth/token \\
  -H "Content-Type: application/json" \\
  -d '{
    "grant_type": "authorization_code",
    "client_id": "naut_client_abc123def456",
    "client_secret": "naut_secret_xyz789uvw456",
    "code": "authorization_code_here"
  }'`}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PublicAPI;
