// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Globe,
  Zap,
  CheckCircle,
  AlertTriangle,
  Settings,
  Plus,
  ExternalLink,
  Database,
  Cloud,
  Mail,
  MessageSquare,
  BarChart3,
  Webhook,
  Key,
  Shield,
  Activity
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: "communication" | "analytics" | "automation" | "storage" | "ai";
  provider: string;
  oauth_enabled: boolean;
  webhook_enabled: boolean;
  icon: React.ElementType;
}

interface ConnectedIntegration {
  id: string;
  user_id: string;
  integration_name: string;
  integration_type: string;
  oauth_provider: string;
  status: string;
  last_sync: string;
  configuration: any;
  created_at: string;
}

interface WebhookEvent {
  id: string;
  integration_id: string;
  event_type: string;
  payload: any;
  status: string;
  created_at: string;
  processed_at: string;
  error_message: string;
}

const availableIntegrations: Integration[] = [
  {
    id: "google",
    name: "Google Workspace",
    description: "Connect Google Calendar, Drive, and Gmail",
    category: "communication",
    provider: "google",
    oauth_enabled: true,
    webhook_enabled: true,
    icon: Mail,
  },
  {
    id: "microsoft",
    name: "Microsoft 365",
    description: "Integrate with Outlook, Teams, and OneDrive",
    category: "communication",
    provider: "microsoft",
    oauth_enabled: true,
    webhook_enabled: true,
    icon: Cloud,
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect with 5000+ apps via Zapier automation",
    category: "automation",
    provider: "zapier",
    oauth_enabled: true,
    webhook_enabled: true,
    icon: Zap,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Send notifications and updates to Slack channels",
    category: "communication",
    provider: "slack",
    oauth_enabled: true,
    webhook_enabled: true,
    icon: MessageSquare,
  },
  {
    id: "analytics",
    name: "Google Analytics",
    description: "Track usage and performance metrics",
    category: "analytics",
    provider: "google",
    oauth_enabled: true,
    webhook_enabled: false,
    icon: BarChart3,
  },
  {
    id: "openai",
    name: "OpenAI API",
    description: "AI-powered analysis and automation",
    category: "ai",
    provider: "openai",
    oauth_enabled: false,
    webhook_enabled: true,
    icon: Zap,
  },
];

const IntegrationsHubEnhanced = () => {
  const { toast } = useToast();
  const [connectedIntegrations, setConnectedIntegrations] = useState<ConnectedIntegration[]>([]);
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOAuthDialog, setShowOAuthDialog] = useState(false);
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const [integrationsData, eventsData] = await Promise.all([
        supabase
          .from('connected_integrations')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('webhook_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)
      ]);

      if (integrationsData.data) {
        setConnectedIntegrations(integrationsData.data);
      }

      if (eventsData.data) {
        setWebhookEvents(eventsData.data);
      }
    } catch (error) {
      console.error("Error loading integrations:", error);
      toast({
        title: "Error",
        description: "Failed to load integrations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initiateOAuth = async (integration: Integration) => {
    setSelectedIntegration(integration);
    
    // In a real implementation, this would redirect to OAuth provider
    // For now, we'll simulate the OAuth flow
    const simulateOAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Simulate OAuth token exchange
        const mockAccessToken = `mock_token_${Date.now()}`;
        const mockRefreshToken = `mock_refresh_${Date.now()}`;
        
        const { error } = await supabase
          .from('connected_integrations')
          .insert({
            user_id: user?.id,
            integration_name: integration.name,
            integration_type: integration.category,
            oauth_provider: integration.provider,
            access_token: mockAccessToken,
            refresh_token: mockRefreshToken,
            token_expires_at: new Date(Date.now() + 3600000).toISOString(),
            status: 'active',
            configuration: {},
          });

        if (error) throw error;

        toast({
          title: "Integration Connected",
          description: `Successfully connected ${integration.name}`,
        });

        setShowOAuthDialog(false);
        loadIntegrations();
      } catch (error) {
        console.error("OAuth error:", error);
        toast({
          title: "Connection Failed",
          description: "Failed to connect integration",
          variant: "destructive",
        });
      }
    };

    // Show dialog and simulate OAuth
    setShowOAuthDialog(true);
    setTimeout(simulateOAuth, 2000);
  };

  const disconnectIntegration = async (integrationId: string) => {
    try {
      const { error } = await supabase
        .from('connected_integrations')
        .delete()
        .eq('id', integrationId);

      if (error) throw error;

      toast({
        title: "Integration Disconnected",
        description: "Integration has been removed",
      });

      loadIntegrations();
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect integration",
        variant: "destructive",
      });
    }
  };

  const setupWebhook = async () => {
    if (!selectedIntegration || !webhookUrl) {
      toast({
        title: "Validation Error",
        description: "Please provide webhook URL",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Find or create connected integration
      let integrationRecord = connectedIntegrations.find(
        i => i.integration_name === selectedIntegration.name
      );

      if (!integrationRecord) {
        const { data, error } = await supabase
          .from('connected_integrations')
          .insert({
            user_id: user?.id,
            integration_name: selectedIntegration.name,
            integration_type: selectedIntegration.category,
            oauth_provider: selectedIntegration.provider,
            status: 'active',
            configuration: {
              webhook_url: webhookUrl,
              webhook_secret: webhookSecret,
            },
          })
          .select()
          .single();

        if (error) throw error;
        integrationRecord = data;
      } else {
        const { error } = await supabase
          .from('connected_integrations')
          .update({
            configuration: {
              ...integrationRecord.configuration,
              webhook_url: webhookUrl,
              webhook_secret: webhookSecret,
            },
          })
          .eq('id', integrationRecord.id);

        if (error) throw error;
      }

      toast({
        title: "Webhook Configured",
        description: `Webhook set up for ${selectedIntegration.name}`,
      });

      setShowWebhookDialog(false);
      setWebhookUrl("");
      setWebhookSecret("");
      loadIntegrations();
    } catch (error) {
      console.error("Webhook setup error:", error);
      toast({
        title: "Setup Failed",
        description: "Failed to configure webhook",
        variant: "destructive",
      });
    }
  };

  const testWebhook = async (integration: ConnectedIntegration) => {
    try {
      const testPayload = {
        event: "test",
        timestamp: new Date().toISOString(),
        data: {
          message: "Test webhook event",
          source: integration.integration_name,
        },
      };

      const { error } = await supabase
        .from('webhook_events')
        .insert({
          integration_id: integration.id,
          event_type: "test",
          payload: testPayload,
          status: "pending",
        });

      if (error) throw error;

      toast({
        title: "Test Webhook Sent",
        description: "Check the events log for the result",
      });

      loadIntegrations();
    } catch (error) {
      console.error("Webhook test error:", error);
      toast({
        title: "Test Failed",
        description: "Failed to send test webhook",
        variant: "destructive",
      });
    }
  };

  const isIntegrationConnected = (integrationId: string) => {
    return connectedIntegrations.some(
      ci => ci.integration_name === availableIntegrations.find(i => i.id === integrationId)?.name
    );
  };

  const getIntegrationsByCategory = (category: string) => {
    return availableIntegrations.filter(i => i.category === category);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "error":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8" />
            Integrations Hub
          </h1>
          <p className="text-muted-foreground">
            Connect external services via OAuth and webhooks
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedIntegrations.length}</div>
            <p className="text-xs text-muted-foreground">Active integrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">OAuth Enabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {connectedIntegrations.filter(i => i.oauth_provider).length}
            </div>
            <p className="text-xs text-muted-foreground">OAuth connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Webhook Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webhookEvents.length}</div>
            <p className="text-xs text-muted-foreground">Total events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {webhookEvents.length > 0
                ? Math.round(
                    (webhookEvents.filter(e => e.status === "success").length /
                      webhookEvents.length) *
                      100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Webhook success</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="marketplace" className="space-y-4">
        <TabsList>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="connected">Connected ({connectedIntegrations.length})</TabsTrigger>
          <TabsTrigger value="webhooks">Webhook Events</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableIntegrations.map((integration) => {
              const isConnected = isIntegrationConnected(integration.id);
              const Icon = integration.icon;

              return (
                <Card key={integration.id} className={isConnected ? "border-green-300" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {integration.category}
                          </Badge>
                        </div>
                      </div>
                      {isConnected && <CheckCircle className="h-5 w-5 text-green-600" />}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                    
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {integration.oauth_enabled && (
                        <Badge variant="secondary">
                          <Shield className="h-3 w-3 mr-1" />
                          OAuth
                        </Badge>
                      )}
                      {integration.webhook_enabled && (
                        <Badge variant="secondary">
                          <Webhook className="h-3 w-3 mr-1" />
                          Webhooks
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {!isConnected ? (
                        <>
                          {integration.oauth_enabled && (
                            <Button
                              className="flex-1"
                              onClick={() => initiateOAuth(integration)}
                            >
                              <Key className="h-4 w-4 mr-2" />
                              Connect
                            </Button>
                          )}
                          {integration.webhook_enabled && (
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedIntegration(integration);
                                setShowWebhookDialog(true);
                              }}
                            >
                              <Webhook className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button variant="outline" className="flex-1" disabled>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Connected
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="connected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Connected Integrations</CardTitle>
              <CardDescription>
                Manage your active integrations and webhooks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {connectedIntegrations.length > 0 ? (
                    connectedIntegrations.map((integration) => (
                      <div
                        key={integration.id}
                        className="p-4 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{integration.integration_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {integration.integration_type}
                            </p>
                          </div>
                          <Badge className={getStatusColor(integration.status)}>
                            {integration.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          {integration.oauth_provider && (
                            <span className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              OAuth: {integration.oauth_provider}
                            </span>
                          )}
                          {integration.last_sync && (
                            <span className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              Last sync: {new Date(integration.last_sync).toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testWebhook(integration)}
                          >
                            Test Webhook
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const int = availableIntegrations.find(
                                i => i.name === integration.integration_name
                              );
                              if (int) {
                                setSelectedIntegration(int);
                                setShowWebhookDialog(true);
                              }
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => disconnectIntegration(integration.id)}
                          >
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No integrations connected yet</p>
                      <p className="text-sm">Connect your first integration from the Marketplace</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Events Log</CardTitle>
              <CardDescription>
                Monitor webhook deliveries and responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {webhookEvents.length > 0 ? (
                    webhookEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-3 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(event.status)}>
                              {event.status}
                            </Badge>
                            <span className="font-medium text-sm">{event.event_type}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.created_at).toLocaleString()}
                          </span>
                        </div>
                        
                        {event.error_message && (
                          <p className="text-xs text-red-600 mb-2">{event.error_message}</p>
                        )}
                        
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            View payload
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                            {JSON.stringify(event.payload, null, 2)}
                          </pre>
                        </details>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No webhook events yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Documentation</CardTitle>
              <CardDescription>
                Learn how to set up and use integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  OAuth Authentication
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  OAuth 2.0 is used to securely connect external services. When you click "Connect",
                  you'll be redirected to the provider's authorization page.
                </p>
                <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                  <p><strong>Supported Providers:</strong></p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>Google (OAuth 2.0)</li>
                    <li>Microsoft (OAuth 2.0)</li>
                    <li>Zapier (OAuth 2.0)</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Webhook Configuration
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Webhooks allow real-time event notifications from external services.
                </p>
                <div className="p-3 bg-muted rounded-lg text-sm space-y-2">
                  <p><strong>Webhook URL Format:</strong></p>
                  <code className="block p-2 bg-background rounded">
                    https://your-domain.com/api/webhooks/[integration-id]
                  </code>
                  <p className="mt-2"><strong>Security:</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    <li>Always use HTTPS</li>
                    <li>Set a webhook secret for verification</li>
                    <li>Validate signature headers</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">API Endpoints</h3>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-muted rounded">
                    <code>GET /api/integrations</code> - List all integrations
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <code>POST /api/integrations/connect</code> - Initiate OAuth flow
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <code>POST /api/webhooks/[id]</code> - Webhook endpoint
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <code>GET /api/webhooks/events</code> - List webhook events
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* OAuth Dialog */}
      <Dialog open={showOAuthDialog} onOpenChange={setShowOAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connecting to {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              Redirecting to OAuth authorization...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">
                Please wait while we connect your account
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Webhook Setup Dialog */}
      <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Webhook for {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              Set up webhook URL and secret for secure event delivery
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-domain.com/api/webhooks"
              />
            </div>
            <div>
              <Label htmlFor="webhook-secret">Webhook Secret (Optional)</Label>
              <Input
                id="webhook-secret"
                type="password"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder="Enter a secret key for verification"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used to verify webhook authenticity
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWebhookDialog(false)}>
              Cancel
            </Button>
            <Button onClick={setupWebhook}>Configure Webhook</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntegrationsHubEnhanced;
