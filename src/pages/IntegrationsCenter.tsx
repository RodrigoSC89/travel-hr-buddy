/**
 * Integrations Center - Painel de Integrações Externas
 * Slack, WhatsApp, Webhooks, Email, Push Notifications
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  MessageSquare, 
  Phone, 
  Webhook, 
  Mail, 
  Bell, 
  Settings, 
  CheckCircle, 
  XCircle,
  Send,
  Plus,
  Trash2,
  TestTube,
  RefreshCw
} from "lucide-react";

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  enabled: boolean;
  lastTriggered?: string;
}

export default function IntegrationsCenter() {
  const [slackWebhook, setSlackWebhook] = useState("");
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: "1",
      name: "Alertas Críticos",
      url: "https://hooks.example.com/alerts",
      events: ["incident.critical", "system.down"],
      enabled: true,
      lastTriggered: "2025-12-27T10:30:00Z"
    },
    {
      id: "2",
      name: "Compliance Alerts",
      url: "https://hooks.example.com/compliance",
      events: ["compliance.violation", "audit.failed"],
      enabled: true
    }
  ]);

  const [newWebhook, setNewWebhook] = useState({ name: "", url: "" });

  const handleTestSlack = async () => {
    if (!slackWebhook) {
      toast.error("Configure o webhook do Slack primeiro");
      return;
    }
    
    toast.loading("Enviando mensagem de teste...");
    try {
      const response = await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: "🧪 Teste de integração Nautilus One" })
      });
      if (!response.ok) throw new Error('Webhook failed');
      toast.success("Mensagem de teste enviada para o Slack!");
    } catch (err) {
      toast.error("Falha ao enviar mensagem de teste. Verifique o webhook URL.");
    }
  };

  const handleAddWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast.error("Preencha nome e URL do webhook");
      return;
    }

    const webhook: WebhookConfig = {
      id: Date.now().toString(),
      name: newWebhook.name,
      url: newWebhook.url,
      events: [],
      enabled: true
    };

    setWebhooks([...webhooks, webhook]);
    setNewWebhook({ name: "", url: "" });
    toast.success("Webhook adicionado com sucesso!");
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
    toast.success("Webhook removido");
  };

  const handleTestWebhook = async (webhook: WebhookConfig) => {
    toast.loading(`Testando ${webhook.name}...`);
    try {
      const response = await fetch(webhook.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ test: true, timestamp: new Date().toISOString() }) });
      if (!response.ok) throw new Error('Webhook test failed');
      toast.success(`Webhook ${webhook.name} respondeu com sucesso!`);
    } catch (err) {
      toast.error(`Webhook ${webhook.name} falhou. Verifique a URL.`);
    }
  };

  const integrationCards = [
    {
      icon: MessageSquare,
      title: "Slack",
      description: "Alertas e notificações em tempo real",
      enabled: slackEnabled,
      status: slackEnabled ? "Conectado" : "Desconectado",
      color: slackEnabled ? "text-success" : "text-muted-foreground"
    },
    {
      icon: Phone,
      title: "WhatsApp",
      description: "Alertas via Twilio/Gupshup",
      enabled: whatsappEnabled,
      status: whatsappEnabled ? "Ativo" : "Inativo",
      color: whatsappEnabled ? "text-success" : "text-muted-foreground"
    },
    {
      icon: Mail,
      title: "Email",
      description: "Relatórios e alertas por email",
      enabled: emailEnabled,
      status: emailEnabled ? "Ativo" : "Inativo",
      color: emailEnabled ? "text-success" : "text-muted-foreground"
    },
    {
      icon: Bell,
      title: "Push Notifications",
      description: "Notificações no navegador/mobile",
      enabled: pushEnabled,
      status: pushEnabled ? "Ativo" : "Inativo",
      color: pushEnabled ? "text-success" : "text-muted-foreground"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Central de Integrações</h1>
            <p className="text-muted-foreground">Configure integrações externas e webhooks</p>
          </div>
          <Badge variant="outline" className="text-primary border-primary">
            <Settings className="h-3 w-3 mr-1" />
            4 Integrações Ativas
          </Badge>
        </div>

        {/* Integration Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {integrationCards.map((integration, index) => (
            <motion.div
              key={integration.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <integration.icon className={`h-8 w-8 ${integration.color}`} />
                    {integration.enabled ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground">{integration.title}</h3>
                  <p className="text-xs text-muted-foreground">{integration.description}</p>
                  <Badge 
                    variant={integration.enabled ? "default" : "secondary"} 
                    className="mt-2 text-xs"
                  >
                    {integration.status}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Configuration Tabs */}
        <Tabs defaultValue="slack" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="slack">
              <MessageSquare className="h-4 w-4 mr-2" />
              Slack
            </TabsTrigger>
            <TabsTrigger value="whatsapp">
              <Phone className="h-4 w-4 mr-2" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="webhooks">
              <Webhook className="h-4 w-4 mr-2" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Push
            </TabsTrigger>
          </TabsList>

          {/* Slack Tab */}
          <TabsContent value="slack">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Configuração Slack
                </CardTitle>
                <CardDescription>
                  Configure o webhook do Slack para receber alertas em #nautilus-alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Ativar integração Slack</Label>
                  <Switch checked={slackEnabled} onCheckedChange={setSlackEnabled} />
                </div>
                
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://hooks.slack.com/services/..."
                      value={slackWebhook}
                      onChange={(e) => setSlackWebhook(e.target.value)}
                    />
                    <Button variant="outline" onClick={handleTestSlack}>
                      <TestTube className="h-4 w-4 mr-2" />
                      Testar
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Eventos a notificar</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Incidentes Críticos</Badge>
                    <Badge variant="secondary">Alertas de Segurança</Badge>
                    <Badge variant="secondary">Falhas de Compliance</Badge>
                    <Badge variant="secondary">Decisões de IA</Badge>
                    <Badge variant="outline">+ Adicionar</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WhatsApp Tab */}
          <TabsContent value="whatsapp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-success" />
                  Configuração WhatsApp
                </CardTitle>
                <CardDescription>
                  Integração via Twilio ou Gupshup para alertas móveis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Ativar integração WhatsApp</Label>
                  <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Account SID (Twilio)</Label>
                    <Input placeholder="ACxxxxxxxxxxxxxxxx" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label>Auth Token</Label>
                    <Input placeholder="Token de autenticação" type="password" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Números para notificação</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge>+55 11 99999-0001</Badge>
                    <Badge>+55 21 98888-0002</Badge>
                    <Badge variant="outline">+ Adicionar número</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5 text-primary" />
                  Configuração de Webhooks
                </CardTitle>
                <CardDescription>
                  Configure webhooks customizados para eventos do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add New Webhook */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome do webhook"
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                  />
                  <Input
                    placeholder="https://..."
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                    className="flex-1"
                  />
                  <Button onClick={handleAddWebhook}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>

                {/* Webhook List */}
                <div className="space-y-3">
                  {webhooks.map((webhook) => (
                    <div 
                      key={webhook.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={webhook.enabled}
                          onCheckedChange={(checked) => {
                            setWebhooks(webhooks.map(w => 
                              w.id === webhook.id ? { ...w, enabled: checked } : w
                            ));
                          }}
                        />
                        <div>
                          <p className="font-medium text-foreground">{webhook.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-md">{webhook.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleTestWebhook(webhook)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteWebhook(webhook.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Push Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-warning" />
                  Push Notifications
                </CardTitle>
                <CardDescription>
                  Configure notificações push para navegador e mobile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Ativar Push Notifications</Label>
                  <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium mb-2">Web Push (VAPID)</h4>
                    <Badge variant="outline" className="text-success border-success">Configurado</Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Notificações ativas para Chrome, Firefox, Edge
                    </p>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium mb-2">Firebase Cloud Messaging</h4>
                    <Badge variant="outline" className="text-success border-success">Ativo</Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Push para Android e iOS
                    </p>
                  </div>
                </div>

                <Button className="w-full" onClick={() => {
                  toast.success("Notificação de teste enviada!", { description: "Verifique seu dispositivo móvel." });
                }}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Notificação de Teste
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
