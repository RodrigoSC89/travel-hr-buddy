import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Webhook,
  Code,
  Play,
  Copy,
  Download,
  Upload,
  Settings,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Zap,
  Database,
  Globe,
  Lock,
  Filter,
  BarChart3,
  Activity,
  MessageSquare,
} from "lucide-react";

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  method: "POST" | "PUT" | "PATCH";
  headers: Record<string, string>;
  payload: string;
  authentication: {
    type: "none" | "api_key" | "bearer" | "signature";
    value: string;
  };
  triggers: string[];
  isActive: boolean;
  retryConfig: {
    enabled: boolean;
    maxRetries: number;
    backoffStrategy: "fixed" | "exponential";
  };
}

interface WebhookEvent {
  id: string;
  webhookId: string;
  timestamp: string;
  status: "success" | "failed" | "retrying";
  statusCode?: number;
  response?: string;
  duration: number;
  retryCount: number;
}

export const WebhookBuilder: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("builder");
  const [isCreating, setIsCreating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const [webhookConfig, setWebhookConfig] = useState<Partial<WebhookConfig>>({
    name: "",
    url: "",
    method: "POST",
    headers: {},
    payload: "",
    authentication: { type: "none", value: "" },
    triggers: [],
    isActive: true,
    retryConfig: {
      enabled: true,
      maxRetries: 3,
      backoffStrategy: "exponential",
    },
  });

  const [webhooks] = useState<WebhookConfig[]>([
    {
      id: "1",
      name: "Slack Notifications",
      url: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      payload: '{"text": "Nova integração ativada: {{integration_name}}"}',
      authentication: { type: "none", value: "" },
      triggers: ["integration_connected", "integration_error"],
      isActive: true,
      retryConfig: { enabled: true, maxRetries: 3, backoffStrategy: "exponential" },
    },
    {
      id: "2",
      name: "Teams Alert",
      url: "https://outlook.office.com/webhook/XXXXXXXX",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      payload: '{"title": "Sistema Nautilus", "text": "{{event_description}}"}',
      authentication: { type: "bearer", value: "xxxxx" },
      triggers: ["high_error_rate", "system_health_critical"],
      isActive: false,
      retryConfig: { enabled: true, maxRetries: 5, backoffStrategy: "fixed" },
    },
  ]);

  const [recentEvents] = useState<WebhookEvent[]>([
    {
      id: "1",
      webhookId: "1",
      timestamp: "2024-01-20T16:30:00Z",
      status: "success",
      statusCode: 200,
      response: "ok",
      duration: 234,
      retryCount: 0,
    },
    {
      id: "2",
      webhookId: "1",
      timestamp: "2024-01-20T16:15:00Z",
      status: "failed",
      statusCode: 500,
      response: "Internal Server Error",
      duration: 1240,
      retryCount: 2,
    },
    {
      id: "3",
      webhookId: "2",
      timestamp: "2024-01-20T15:45:00Z",
      status: "success",
      statusCode: 200,
      response: "Message delivered",
      duration: 567,
      retryCount: 0,
    },
  ]);

  const availableTriggers = [
    {
      value: "integration_connected",
      label: "Integração Conectada",
      description: "Quando uma nova integração é ativada",
    },
    {
      value: "integration_disconnected",
      label: "Integração Desconectada",
      description: "Quando uma integração é desativada",
    },
    {
      value: "integration_error",
      label: "Erro de Integração",
      description: "Quando ocorre falha em uma integração",
    },
    {
      value: "high_error_rate",
      label: "Alta Taxa de Erro",
      description: "Quando taxa de erro excede limite",
    },
    {
      value: "system_health_critical",
      label: "Saúde Crítica",
      description: "Quando saúde do sistema fica crítica",
    },
    {
      value: "performance_degradation",
      label: "Degradação de Performance",
      description: "Quando performance fica abaixo do esperado",
    },
    {
      value: "token_expiring",
      label: "Token Expirando",
      description: "Quando token está próximo do vencimento",
    },
    {
      value: "daily_report",
      label: "Relatório Diário",
      description: "Relatório automático diário",
    },
  ];

  const payloadTemplates = {
    slack: `{
  "text": "🚨 Alerta Nautilus: {{event_type}}",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*{{event_title}}*\\n{{event_description}}"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "plain_text",
          "text": "Timestamp: {{timestamp}}"
        }
      ]
    }
  ]
}`,
    teams: `{
  "@type": "MessageCard",
  "@context": "http://schema.org/extensions",
  "themeColor": "{{color}}",
  "summary": "Nautilus Alert",
  "sections": [{
    "activityTitle": "{{event_title}}",
    "activitySubtitle": "{{event_description}}",
    "facts": [{
      "name": "Timestamp",
      "value": "{{timestamp}}"
    }, {
      "name": "System",
      "value": "Nautilus One"
    }]
  }]
}`,
    generic: `{
  "event": "{{event_type}}",
  "title": "{{event_title}}",
  "description": "{{event_description}}",
  "timestamp": "{{timestamp}}",
  "data": {{event_data}}
}`,
  };

  const handleSaveWebhook = () => {
    setIsCreating(true);

    setTimeout(() => {
      setIsCreating(false);
      toast({
        title: "Webhook Criado",
        description: `Webhook "${webhookConfig.name}" foi criado com sucesso.`,
      });

      // Reset form
      setWebhookConfig({
        name: "",
        url: "",
        method: "POST",
        headers: {},
        payload: "",
        authentication: { type: "none", value: "" },
        triggers: [],
        isActive: true,
        retryConfig: {
          enabled: true,
          maxRetries: 3,
          backoffStrategy: "exponential",
        },
      });
    }, 1500);
  };

  const handleTestWebhook = (webhookId: string) => {
    setIsTesting(true);

    setTimeout(() => {
      setIsTesting(false);
      toast({
        title: "Teste Concluído",
        description: "Webhook testado com sucesso. Status: 200 OK",
      });
    }, 2000);
  };

  const copyWebhookUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copiada",
      description: "URL do webhook foi copiada para a área de transferência.",
    });
  };

  const loadTemplate = (template: string) => {
    setWebhookConfig({
      ...webhookConfig,
      payload: payloadTemplates[template as keyof typeof payloadTemplates],
    });

    toast({
      title: "Template Carregado",
      description: `Template ${template} foi aplicado ao payload.`,
    });
  };

  const getStatusColor = (status: WebhookEvent["status"]) => {
    switch (status) {
      case "success":
        return "text-success";
      case "failed":
        return "text-destructive";
      case "retrying":
        return "text-warning";
    }
  };

  const getStatusIcon = (status: WebhookEvent["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "failed":
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case "retrying":
        return <RefreshCw className="w-4 h-4 text-warning animate-spin" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Webhook className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl text-foreground">Webhook Builder</CardTitle>
              <CardDescription>
                Crie e gerencie webhooks personalizados para suas integrações
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Webhook Builder */}
        <TabsContent value="builder" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Settings className="w-5 h-5 text-primary" />
                  Configuração Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-name">Nome do Webhook</Label>
                  <Input
                    id="webhook-name"
                    value={webhookConfig.name}
                    onChange={e => setWebhookConfig({ ...webhookConfig, name: e.target.value })}
                    placeholder="Ex: Notificações Slack"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-url">URL de Destino</Label>
                  <Input
                    id="webhook-url"
                    value={webhookConfig.url}
                    onChange={e => setWebhookConfig({ ...webhookConfig, url: e.target.value })}
                    placeholder="https://hooks.slack.com/services/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Método HTTP</Label>
                  <Select
                    value={webhookConfig.method}
                    onValueChange={(value: any) =>
                      setWebhookConfig({ ...webhookConfig, method: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Triggers</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {availableTriggers.map(trigger => (
                      <div
                        key={trigger.value}
                        className="flex items-start space-x-2 p-2 border border-border rounded-lg"
                      >
                        <input
                          type="checkbox"
                          id={trigger.value}
                          checked={webhookConfig.triggers?.includes(trigger.value)}
                          onChange={e => {
                            const triggers = webhookConfig.triggers || [];
                            if (e.target.checked) {
                              setWebhookConfig({
                                ...webhookConfig,
                                triggers: [...triggers, trigger.value],
                              });
                            } else {
                              setWebhookConfig({
                                ...webhookConfig,
                                triggers: triggers.filter(t => t !== trigger.value),
                              });
                            }
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={trigger.value}
                            className="text-sm font-medium text-foreground cursor-pointer"
                          >
                            {trigger.label}
                          </label>
                          <p className="text-xs text-muted-foreground">{trigger.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Code className="w-5 h-5 text-primary" />
                  Payload e Autenticação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Template de Payload</Label>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => loadTemplate("slack")}>
                        Slack
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => loadTemplate("teams")}>
                        Teams
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => loadTemplate("generic")}>
                        Generic
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={webhookConfig.payload}
                    onChange={e => setWebhookConfig({ ...webhookConfig, payload: e.target.value })}
                    placeholder="Payload JSON do webhook..."
                    className="font-mono text-sm min-h-32"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use variáveis como {"{{event_type}}"}, {"{{timestamp}}"},{" "}
                    {"{{event_description}}"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Autenticação</Label>
                  <Select
                    value={webhookConfig.authentication?.type}
                    onValueChange={(value: any) =>
                      setWebhookConfig({
                        ...webhookConfig,
                        authentication: { ...webhookConfig.authentication, type: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      <SelectItem value="api_key">API Key</SelectItem>
                      <SelectItem value="bearer">Bearer Token</SelectItem>
                      <SelectItem value="signature">Signature</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {webhookConfig.authentication?.type !== "none" && (
                  <div className="space-y-2">
                    <Label>Valor da Autenticação</Label>
                    <Input
                      type="password"
                      value={webhookConfig.authentication?.value}
                      onChange={e =>
                        setWebhookConfig({
                          ...webhookConfig,
                          authentication: {
                            ...webhookConfig.authentication,
                            value: e.target.value,
                          },
                        })
                      }
                      placeholder="Token ou chave de autenticação"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label>Webhook Ativo</Label>
                  <Switch
                    checked={webhookConfig.isActive}
                    onCheckedChange={checked =>
                      setWebhookConfig({ ...webhookConfig, isActive: checked })
                    }
                  />
                </div>

                <Button
                  onClick={handleSaveWebhook}
                  disabled={isCreating || !webhookConfig.name || !webhookConfig.url}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Criar Webhook
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lista de Webhooks */}
        <TabsContent value="webhooks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {webhooks.map(webhook => (
              <Card key={webhook.id} className="border border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <Webhook className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-foreground">{webhook.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {webhook.method} • {webhook.triggers.length} triggers
                        </p>
                      </div>
                    </div>
                    <Switch checked={webhook.isActive} onCheckedChange={() => {}} />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <code className="text-xs text-muted-foreground truncate flex-1">
                        {webhook.url}
                      </code>
                      <Button size="sm" variant="ghost" onClick={() => copyWebhookUrl(webhook.url)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {webhook.triggers.map(trigger => (
                      <Badge key={trigger} variant="outline" className="text-xs">
                        {availableTriggers.find(t => t.value === trigger)?.label}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestWebhook(webhook.id)}
                      disabled={isTesting}
                    >
                      {isTesting ? (
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Play className="w-3 h-3 mr-1" />
                      )}
                      Testar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Eventos */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Activity className="w-5 h-5 text-primary" />
                Eventos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEvents.map(event => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 border border-border/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(event.status)}
                      <div>
                        <p className="font-medium text-foreground">
                          {webhooks.find(w => w.id === event.webhookId)?.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(event.timestamp).toLocaleString("pt-BR")}
                          <span>•</span>
                          <span>{event.duration}ms</span>
                          {event.retryCount > 0 && (
                            <>
                              <span>•</span>
                              <span>{event.retryCount} tentativas</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={`${
                          event.status === "success"
                            ? "bg-success/20 text-success border-success/30"
                            : event.status === "failed"
                              ? "bg-destructive/20 text-destructive border-destructive/30"
                              : "bg-warning/20 text-warning border-warning/30"
                        }`}
                      >
                        {event.statusCode}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{event.response}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Slack Notification
                </CardTitle>
                <CardDescription>
                  Template otimizado para notificações no Slack com blocos e formatação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline">POST</Badge>
                  <p className="text-xs text-muted-foreground">
                    Inclui blocos, formatação markdown e contexto
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => loadTemplate("slack")}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Usar Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Globe className="w-5 h-5 text-primary" />
                  Microsoft Teams
                </CardTitle>
                <CardDescription>
                  MessageCard para Teams com formatação rica e botões de ação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline">POST</Badge>
                  <p className="text-xs text-muted-foreground">
                    MessageCard com seções e fatos estruturados
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => loadTemplate("teams")}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Usar Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Code className="w-5 h-5 text-primary" />
                  Generic JSON
                </CardTitle>
                <CardDescription>
                  Template genérico compatível com qualquer sistema que aceita JSON
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline">POST</Badge>
                  <p className="text-xs text-muted-foreground">
                    Estrutura simples com campos essenciais
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => loadTemplate("generic")}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Usar Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
