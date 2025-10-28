// @ts-nocheck
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { 
  Plug, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Package,
  Webhook,
  Key
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface IntegrationProvider {
  id: string;
  name: string;
  display_name: string;
  description: string;
  provider_type: string;
  icon_url?: string;
  is_active: boolean;
}

interface UserIntegration {
  id: string;
  provider_id: string;
  is_active: boolean;
  last_sync_at?: string;
  provider: IntegrationProvider;
}

interface IntegrationLog {
  id: string;
  log_type: string;
  status: string;
  message: string;
  created_at: string;
}

interface Plugin {
  id: string;
  name: string;
  display_name: string;
  description: string;
  version: string;
  is_active: boolean;
  install_count: number;
  rating?: number;
}

export default function IntegrationsHub() {
  const { toast } = useToast();
  const [providers, setProviders] = useState<IntegrationProvider[]>([]);
  const [userIntegrations, setUserIntegrations] = useState<UserIntegration[]>([]);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProviders();
    fetchUserIntegrations();
    fetchLogs();
    fetchPlugins();
  }, []);

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from("integration_providers")
        .select("*")
        .eq("is_active", true)
        .order("display_name");

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };

  const fetchUserIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from("user_integrations")
        .select(`
          *,
          provider:integration_providers(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUserIntegrations(data || []);
    } catch (error) {
      console.error("Error fetching integrations:", error);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("integration_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  const fetchPlugins = async () => {
    try {
      const { data, error } = await supabase
        .from("plugins")
        .select("*")
        .eq("is_active", true)
        .order("install_count", { ascending: false });

      if (error) throw error;
      setPlugins(data || []);
    } catch (error) {
      console.error("Error fetching plugins:", error);
    }
  };

  const toggleIntegration = async (integrationId: string, isActive: boolean) => {
    try {
      if (isActive) {
        const { error } = await supabase.rpc("deactivate_integration", {
          p_integration_id: integrationId
        });
        if (error) throw error;
      } else {
        // For activation, would typically go through OAuth flow
        toast({
          title: "OAuth Required",
          description: "Please complete the OAuth flow to activate this integration",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Integration ${isActive ? "deactivated" : "activated"} successfully`,
      });

      fetchUserIntegrations();
    } catch (error) {
      console.error("Error toggling integration:", error);
      toast({
        title: "Error",
        description: "Failed to update integration",
        variant: "destructive",
      });
    }
  };

  const initiateOAuth = async (providerId: string) => {
    try {
      const { data, error } = await supabase.rpc("create_oauth_state", {
        p_provider_id: providerId
      });

      if (error) throw error;

      toast({
        title: "OAuth Flow Started",
        description: "Redirecting to authorization page...",
      });

      // In production, would redirect to OAuth URL
      // window.location.href = data.auth_url + `?state=${data.state}`;
    } catch (error) {
      console.error("Error initiating OAuth:", error);
      toast({
        title: "Error",
        description: "Failed to start OAuth flow",
        variant: "destructive",
      });
    }
  };

  const installPlugin = async (pluginId: string) => {
    try {
      const { error } = await supabase.rpc("install_plugin", {
        p_plugin_id: pluginId,
        p_configuration: {}
      });

      if (error) throw error;

      toast({
        title: "Plugin Installed",
        description: "Plugin has been installed successfully",
      });

      fetchPlugins();
    } catch (error) {
      console.error("Error installing plugin:", error);
      toast({
        title: "Error",
        description: "Failed to install plugin",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Plug className="h-8 w-8" />
            Integrations Hub
          </h1>
          <p className="text-muted-foreground">
            Connect third-party services and extend functionality with plugins
          </p>
        </div>
      </div>

      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="integrations">
            <Plug className="mr-2 h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="plugins">
            <Package className="mr-2 h-4 w-4" />
            Plugins
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Webhook className="mr-2 h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Activity className="mr-2 h-4 w-4" />
            Activity Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => {
              const userIntegration = userIntegrations.find(
                ui => ui.provider_id === provider.id
              );

              return (
                <Card key={provider.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{provider.display_name}</span>
                      <Badge variant={userIntegration?.is_active ? "default" : "secondary"}>
                        {provider.provider_type}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{provider.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {userIntegration?.is_active ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                        <span className="text-sm">
                          {userIntegration?.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      {userIntegration ? (
                        <Switch
                          checked={userIntegration.is_active}
                          onCheckedChange={() =>
                            toggleIntegration(userIntegration.id, userIntegration.is_active)
                          }
                        />
                      ) : (
                        <Button onClick={() => initiateOAuth(provider.id)}>
                          Connect
                        </Button>
                      )}
                    </div>
                    {userIntegration?.last_sync_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Last sync: {new Date(userIntegration.last_sync_at).toLocaleString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="plugins" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plugins.map((plugin) => (
              <Card key={plugin.id}>
                <CardHeader>
                  <CardTitle>{plugin.display_name}</CardTitle>
                  <CardDescription>{plugin.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">v{plugin.version}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {plugin.install_count} installs
                    </span>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => installPlugin(plugin.id)}
                  >
                    Install Plugin
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configured Webhooks</CardTitle>
              <CardDescription>
                Manage webhook endpoints for event notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button>
                  <Webhook className="mr-2 h-4 w-4" />
                  Add Webhook
                </Button>
                <p className="text-sm text-muted-foreground">
                  No webhooks configured yet
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Activity Logs</CardTitle>
              <CardDescription>
                Monitor integration activity and errors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {logs.map((log) => (
                    <Card key={log.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge 
                                variant={
                                  log.status === "success" 
                                    ? "default" 
                                    : log.status === "failure"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {log.status}
                              </Badge>
                              <Badge variant="outline">{log.log_type}</Badge>
                            </div>
                            <p className="text-sm">{log.message}</p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
