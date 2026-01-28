/**
 * Webhooks Management Page
 * Configure and monitor webhooks for event notifications
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Webhook, Plus, Trash2, Play, Pause, RefreshCw, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const WEBHOOK_EVENTS = [
  { id: "vessel.created", label: "Embarcação Criada", category: "Vessels" },
  { id: "vessel.updated", label: "Embarcação Atualizada", category: "Vessels" },
  { id: "vessel.deleted", label: "Embarcação Excluída", category: "Vessels" },
  { id: "crew.created", label: "Tripulante Adicionado", category: "Crew" },
  { id: "crew.updated", label: "Tripulante Atualizado", category: "Crew" },
  { id: "crew.deleted", label: "Tripulante Removido", category: "Crew" },
  { id: "document.created", label: "Documento Criado", category: "Documents" },
  { id: "document.expired", label: "Documento Expirado", category: "Documents" },
  { id: "maintenance.created", label: "Manutenção Criada", category: "Maintenance" },
  { id: "maintenance.completed", label: "Manutenção Concluída", category: "Maintenance" },
  { id: "certificate.expiring", label: "Certificado Expirando", category: "Certificates" },
];

interface WebhookData {
  id: string;
  name: string;
  url: string;
  description: string | null;
  events: string[];
  is_active: boolean;
  created_at: string;
}

interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event: string;
  status: string;
  status_code: number | null;
  response_time_ms: number | null;
  error_message: string | null;
  delivered_at: string;
}

// Generate webhook secret
function generateSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let secret = "whsec_";
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

export default function WebhooksManagement() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWebhookName, setNewWebhookName] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);

  // Fetch webhooks
  const { data: webhooks, isLoading } = useQuery({
    queryKey: ["webhooks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webhooks")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as WebhookData[];
    },
  });

  // Fetch deliveries for selected webhook
  const { data: deliveries } = useQuery({
    queryKey: ["webhook-deliveries", selectedWebhook],
    queryFn: async () => {
      if (!selectedWebhook) return [];
      
      const { data, error } = await supabase
        .from("webhook_deliveries")
        .select("*")
        .eq("webhook_id", selectedWebhook)
        .order("delivered_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as WebhookDelivery[];
    },
    enabled: !!selectedWebhook,
  });

  // Create webhook mutation
  const createWebhookMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      const { error } = await supabase
        .from("webhooks")
        .insert([{
          organization_id: orgMember?.organization_id ?? "",
          name: newWebhookName,
          url: newWebhookUrl,
          events: newWebhookEvents,
          secret: generateSecret(),
          created_by: user.id,
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Webhook criado com sucesso!");
      resetDialog();
    },
    onError: (error) => {
      toast.error(`Erro ao criar webhook: ${error.message}`);
    },
  });

  // Toggle webhook status
  const toggleWebhookMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("webhooks")
        .update({ is_active: !isActive })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Status atualizado");
    },
  });

  // Delete webhook mutation
  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("webhooks")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      setSelectedWebhook(null);
      toast.success("Webhook excluído");
    },
  });

  // Test webhook
  const testWebhookMutation = useMutation({
    mutationFn: async (webhook: WebhookData) => {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Event": "test",
          "X-Webhook-ID": webhook.id,
        },
        body: JSON.stringify({
          event: "test",
          timestamp: new Date().toISOString(),
          data: { message: "Test webhook from Nauti One" },
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return response.status;
    },
    onSuccess: (status) => {
      toast.success(`Webhook testado com sucesso (HTTP ${status})`);
    },
    onError: (error) => {
      toast.error(`Teste falhou: ${error.message}`);
    },
  });

  const resetDialog = () => {
    setShowCreateDialog(false);
    setNewWebhookName("");
    setNewWebhookUrl("");
    setNewWebhookEvents([]);
  };

  const handleCreateWebhook = () => {
    if (!newWebhookName.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!newWebhookUrl.trim() || !newWebhookUrl.startsWith("https://")) {
      toast.error("URL inválida (deve começar com https://)");
      return;
    }
    if (newWebhookEvents.length === 0) {
      toast.error("Selecione pelo menos um evento");
      return;
    }
    createWebhookMutation.mutate();
  };

  // Group events by category
  const eventsByCategory = WEBHOOK_EVENTS.reduce((acc, event) => {
    if (!acc[event.category]) acc[event.category] = [];
    acc[event.category].push(event);
    return acc;
  }, {} as Record<string, typeof WEBHOOK_EVENTS>);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Webhook className="h-8 w-8 text-primary" />
            Webhooks
          </h1>
          <p className="text-muted-foreground">
            Configure notificações para eventos importantes
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Criar Novo Webhook</DialogTitle>
              <DialogDescription>
                Configure a URL e os eventos que dispararão este webhook
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  placeholder="Ex: Notificação Slack"
                  value={newWebhookName}
                  onChange={(e) => setNewWebhookName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>URL do Endpoint</Label>
                <Input
                  placeholder="https://..."
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Eventos</Label>
                <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-4">
                  {Object.entries(eventsByCategory).map(([category, events]) => (
                    <div key={category}>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        {category}
                      </p>
                      <div className="space-y-2">
                        {events.map((event) => (
                          <div key={event.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={event.id}
                              checked={newWebhookEvents.includes(event.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewWebhookEvents([...newWebhookEvents, event.id]);
                                } else {
                                  setNewWebhookEvents(newWebhookEvents.filter(e => e !== event.id));
                                }
                              }}
                            />
                            <label htmlFor={event.id} className="text-sm cursor-pointer">
                              {event.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={resetDialog}>
                Cancelar
              </Button>
              <Button onClick={handleCreateWebhook} disabled={createWebhookMutation.isPending}>
                {createWebhookMutation.isPending ? "Criando..." : "Criar Webhook"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Webhooks List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Webhooks Configurados</CardTitle>
            <CardDescription>
              Clique em um webhook para ver o histórico de entregas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando...
              </div>
            ) : webhooks?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum webhook configurado ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {webhooks?.map((webhook) => (
                  <div
                    key={webhook.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedWebhook === webhook.id
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/30"
                    }`}
                    onClick={() => setSelectedWebhook(webhook.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={webhook.is_active}
                          onCheckedChange={() =>
                            toggleWebhookMutation.mutate({
                              id: webhook.id,
                              isActive: webhook.is_active,
                            })
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div>
                          <p className="font-medium">{webhook.name}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                            {webhook.url}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {webhook.events.length} eventos
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            testWebhookMutation.mutate(webhook);
                          }}
                          disabled={testWebhookMutation.isPending}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWebhookMutation.mutate(webhook.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {webhook.events.slice(0, 3).map((event) => (
                        <Badge key={event} variant="secondary" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                      {webhook.events.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{webhook.events.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery History */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Entregas</CardTitle>
            <CardDescription>
              {selectedWebhook
                ? "Últimas 50 entregas"
                : "Selecione um webhook"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedWebhook ? (
              <div className="text-center py-8 text-muted-foreground">
                Selecione um webhook para ver o histórico
              </div>
            ) : deliveries?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma entrega registrada ainda
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {deliveries?.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="flex items-center gap-3 p-2 border rounded-lg text-sm"
                  >
                    {delivery.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{delivery.event}</p>
                      <p className="text-xs text-muted-foreground">
                        {delivery.status_code && `HTTP ${delivery.status_code}`}
                        {delivery.response_time_ms && ` • ${delivery.response_time_ms}ms`}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(delivery.delivered_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Integration Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Exemplos de Integração</CardTitle>
          <CardDescription>
            Como verificar a assinatura do webhook no seu servidor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`// Node.js / TypeScript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
}

// Express middleware
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const event = req.headers['x-webhook-event'];
  
  if (!verifyWebhookSignature(req.body, signature, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process the event
  console.log('Received event:', event, req.body);
  
  res.status(200).send('OK');
});`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
