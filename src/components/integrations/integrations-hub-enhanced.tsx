
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Plug,
  CheckCircle2,
  XCircle,
  Link2,
  Webhook,
  Key,
  Send,
  Eye,
  Trash2,
  Plus,
  Settings,
  Activity,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Integration {
  id: string;
  integration_type: string;
  provider_name: string;
  connection_status: string;
  access_token?: string;
  scopes?: string[];
  metadata?: any;
  last_sync_at?: string;
  created_at: string;
}

interface WebhookEvent {
  id: string;
  event_type: string;
  webhook_url: string;
  payload: any;
  status: string;
  response_code?: number;
  attempts: number;
  created_at: string;
}

const PROVIDERS = [
  { name: "Google", type: "oauth", icon: "🔍", scopes: ["email", "profile", "calendar"] },
  { name: "Microsoft", type: "oauth", icon: "📧", scopes: ["User.Read", "Mail.Read"] },
  { name: "Zapier", type: "webhook", icon: "⚡", scopes: ["webhooks"] },
  { name: "Slack", type: "oauth", icon: "💬", scopes: ["chat:write", "channels:read"] },
  { name: "GitHub", type: "oauth", icon: "🐙", scopes: ["repo", "user"] },
  { name: "Dropbox", type: "oauth", icon: "📦", scopes: ["files.content.read"] },
];

export const IntegrationsHubEnhanced = () => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [testPayload, setTestPayload] = useState("{\n  \"event\": \"test\",\n  \"data\": {}\n}");
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);

  useEffect(() => {
    loadIntegrations();
    loadWebhookEvents();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("connected_integrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading integrations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWebhookEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("webhook_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setWebhookEvents(data || []);
    } catch (error: any) {
      console.error("Error loading webhook events:", error);
    }
  };

  const connectOAuth = async (provider: any) => {
    try {
      // Simulate OAuth flow
      const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const mockRefreshToken = `mock_refresh_${Date.now()}`;

      const { data: user } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("connected_integrations")
        .insert({
          user_id: user.user?.id,
          integration_type: provider.type,
          provider_name: provider.name,
          connection_status: "active",
          access_token: mockToken,
          refresh_token: mockRefreshToken,
          token_expires_at: new Date(Date.now() + 3600000).toISOString(),
          scopes: provider.scopes,
          metadata: {
            connected_at: new Date().toISOString(),
            simulated: true,
          },
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Integration connected",
        description: `Successfully connected to ${provider.name}`,
      });

      await loadIntegrations();
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const disconnectIntegration = async (integrationId: string) => {
    try {
      const { error } = await supabase
        .from("connected_integrations")
        .delete()
        .eq("id", integrationId);

      if (error) throw error;

      toast({
        title: "Integration disconnected",
        description: "Integration has been removed",
      });

      await loadIntegrations();
    } catch (error: any) {
      toast({
        title: "Error disconnecting",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: "URL required",
        description: "Please enter a webhook URL",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();

      // Create webhook integration
      const { data, error } = await supabase
        .from("connected_integrations")
        .insert({
          user_id: user.user?.id,
          integration_type: "webhook",
          provider_name: "Custom Webhook",
          connection_status: "active",
          metadata: {
            webhook_url: webhookUrl,
            webhook_secret: webhookSecret,
            created_at: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Webhook created",
        description: "Webhook has been configured successfully",
      });

      setWebhookUrl("");
      setWebhookSecret("");
      await loadIntegrations();
    } catch (error: any) {
      toast({
        title: "Error creating webhook",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const testWebhook = async (integration: Integration) => {
    try {
      const payload = JSON.parse(testPayload);
      const webhookUrl = integration.metadata?.webhook_url || "https://example.com/webhook";

      // Create webhook event
      const { data, error } = await supabase
        .from("webhook_events")
        .insert({
          integration_id: integration.id,
          event_type: "test",
          webhook_url: webhookUrl,
          payload: payload,
          status: "completed",
          response_code: 200,
          attempts: 1,
          last_attempt_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Webhook triggered",
        description: "Test webhook sent successfully",
      });

      await loadWebhookEvents();
    } catch (error: any) {
      toast({
        title: "Webhook test failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const retryWebhook = async (eventId: string) => {
    try {
      const event = webhookEvents.find((e) => e.id === eventId);
      if (!event) return;

      const { error } = await supabase
        .from("webhook_events")
        .update({
          status: "completed",
          response_code: 200,
          attempts: event.attempts + 1,
          last_attempt_at: new Date().toISOString(),
        })
        .eq("id", eventId);

      if (error) throw error;

      toast({
        title: "Webhook retried",
        description: "Webhook event has been retried successfully",
      });

      await loadWebhookEvents();
    } catch (error: any) {
      toast({
        title: "Retry failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: { variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
      inactive: { variant: "secondary", icon: <XCircle className="h-3 w-3" /> },
      error: { variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
    };

    const { variant, icon } = config[status] || config.inactive;

    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        {icon}
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Plug className="h-8 w-8" />
            Integrations Hub
          </h1>
          <p className="text-muted-foreground">
            Connect external services with OAuth 2.0 and webhooks
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.filter((i) => i.connection_status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Active integrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">OAuth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.filter((i) => i.integration_type === "oauth").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">OAuth connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Webhooks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.filter((i) => i.integration_type === "webhook").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Custom webhooks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webhookEvents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Webhook events</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="events">Event Logs</TabsTrigger>
        </TabsList>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Integrations</CardTitle>
              <CardDescription>Connect your favorite services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PROVIDERS.map((provider) => {
                  const connected = integrations.find(
                    (i) => i.provider_name === provider.name && i.connection_status === "active"
                  );

                  return (
                    <Card key={provider.name} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{provider.icon}</span>
                            <div>
                              <h3 className="font-semibold">{provider.name}</h3>
                              <p className="text-xs text-muted-foreground">{provider.type}</p>
                            </div>
                          </div>
                          {connected ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {provider.scopes.slice(0, 2).map((scope) => (
                            <Badge key={scope} variant="secondary" className="text-xs">
                              {scope}
                            </Badge>
                          ))}
                          {provider.scopes.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{provider.scopes.length - 2}
                            </Badge>
                          )}
                        </div>
                        {connected ? (
                          <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => disconnectIntegration(connected.id)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Disconnect
                          </Button>
                        ) : (
                          <Button className="w-full" onClick={() => connectOAuth(provider)}>
                            <Link2 className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Connected Integrations Table */}
          {integrations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Connected Integrations</CardTitle>
                <CardDescription>Manage your active connections</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scopes</TableHead>
                      <TableHead>Connected</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {integrations.map((integration) => (
                      <TableRow key={integration.id}>
                        <TableCell className="font-medium">{integration.provider_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{integration.integration_type}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(integration.connection_status)}</TableCell>
                        <TableCell>
                          {integration.scopes?.slice(0, 2).join(", ")}
                          {integration.scopes && integration.scopes.length > 2 && (
                            <span className="text-muted-foreground">
                              {" "}
                              +{integration.scopes.length - 2}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(integration.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {integration.integration_type === "webhook" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => testWebhook(integration)}
                              >
                                <Send className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => disconnectIntegration(integration.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configure Webhook</CardTitle>
              <CardDescription>Set up custom webhook endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-domain.com/webhook"
                />
              </div>
              <div>
                <Label htmlFor="webhook-secret">Secret (Optional)</Label>
                <Input
                  id="webhook-secret"
                  type="password"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="Your webhook secret"
                />
              </div>
              <div>
                <Label htmlFor="test-payload">Test Payload</Label>
                <Textarea
                  id="test-payload"
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>
              <Button onClick={createWebhook}>
                <Plus className="h-4 w-4 mr-2" />
                Create Webhook
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Webhook Events
              </CardTitle>
              <CardDescription>Event logs with payload inspection</CardDescription>
            </CardHeader>
            <CardContent>
              {webhookEvents.length > 0 ? (
                <div className="space-y-2">
                  {webhookEvents.map((event) => (
                    <Card key={event.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                variant={event.status === "completed" ? "default" : "destructive"}
                              >
                                {event.status}
                              </Badge>
                              <span className="font-medium">{event.event_type}</span>
                              {event.response_code && (
                                <Badge variant="outline">{event.response_code}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{event.webhook_url}</p>
                            <div className="text-xs text-muted-foreground">
                              Attempts: {event.attempts} |{" "}
                              {new Date(event.created_at).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => setSelectedEvent(event)}>
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Event Payload</DialogTitle>
                                  <DialogDescription>
                                    Webhook payload and response details
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Payload</Label>
                                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-60">
                                      {JSON.stringify(event.payload, null, 2)}
                                    </pre>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Status</Label>
                                      <p className="text-sm">{event.status}</p>
                                    </div>
                                    <div>
                                      <Label>Response Code</Label>
                                      <p className="text-sm">{event.response_code || "N/A"}</p>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            {event.status === "failed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => retryWebhook(event.id)}
                              >
                                <Send className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No webhook events yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
