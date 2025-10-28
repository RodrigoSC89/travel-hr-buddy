/**
 * PATCH 346: Integrations Hub v2 - Main Dashboard
 * Centralized integration management with OAuth, webhooks, and plugins
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  AlertCircle,
  Check,
  ExternalLink,
  Plus,
  Power,
  Settings,
  TrendingUp,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IntegrationsService } from '@/services/integrations.service';
import type { IntegrationPlugin, OAuthConnection, WebhookIntegration } from '@/types/integrations';
import { toast } from 'sonner';

export const IntegrationsHubV2 = () => {
  const queryClient = useQueryClient();

  // Queries
  const { data: stats } = useQuery({
    queryKey: ['integration-stats'],
    queryFn: () => IntegrationsService.getDashboardStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: plugins = [] } = useQuery({
    queryKey: ['integration-plugins'],
    queryFn: () => IntegrationsService.getPlugins(),
  });

  const { data: oauthConnections = [] } = useQuery({
    queryKey: ['oauth-connections'],
    queryFn: () => IntegrationsService.getOAuthConnections(),
  });

  const { data: webhooks = [] } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => IntegrationsService.getIntegrations(),
  });

  // Mutations
  const togglePluginMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      IntegrationsService.togglePlugin(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-plugins'] });
      toast.success('Plugin atualizado com sucesso');
    },
  });

  const disconnectOAuthMutation = useMutation({
    mutationFn: (provider: string) =>
      IntegrationsService.disconnectOAuth(provider as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oauth-connections'] });
      toast.success('Conexão removida com sucesso');
    },
  });

  const toggleWebhookMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      IntegrationsService.toggleIntegration(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Integração atualizada');
    },
  });

  const handleOAuthConnect = (provider: string) => {
    // In production, this would open OAuth flow
    const clientId = 'YOUR_CLIENT_ID';
    const redirectUri = `${window.location.origin}/integrations/oauth/callback`;
    const scope = ['profile', 'email'];

    const authUrl = IntegrationsService.getOAuthUrl(
      provider as any,
      clientId,
      redirectUri,
      scope
    );

    // Open OAuth window
    window.open(authUrl, 'oauth', 'width=600,height=700');
    toast.info('Abrindo janela de autenticação...');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Integrations Hub v2</h1>
          <p className="text-muted-foreground">
            Gerencie conexões externas, webhooks e automações
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Integração
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Integrações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_integrations || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Integrações Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.active_integrations || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.success_rate.toFixed(1) || 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Eventos Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_events || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="plugins" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plugins">Plugins</TabsTrigger>
          <TabsTrigger value="oauth">OAuth Connections</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="events">Eventos Recentes</TabsTrigger>
        </TabsList>

        {/* Plugins Tab */}
        <TabsContent value="plugins" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plugins.map((plugin) => (
              <Card key={plugin.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {plugin.icon_url && (
                        <img
                          src={plugin.icon_url}
                          alt={plugin.display_name}
                          className="w-10 h-10 rounded"
                        />
                      )}
                      <div>
                        <CardTitle className="text-base">
                          {plugin.display_name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {plugin.provider}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={plugin.is_enabled ? 'default' : 'secondary'}
                    >
                      {plugin.is_enabled ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {plugin.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {plugin.capabilities?.map((cap) => (
                      <Badge key={cap} variant="outline" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={plugin.is_enabled ? 'destructive' : 'default'}
                      onClick={() =>
                        togglePluginMutation.mutate({
                          id: plugin.id,
                          enabled: !plugin.is_enabled,
                        })
                      }
                      disabled={plugin.is_system && plugin.is_enabled}
                    >
                      <Power className="w-3 h-3 mr-1" />
                      {plugin.is_enabled ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="w-3 h-3 mr-1" />
                      Configurar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* OAuth Tab */}
        <TabsContent value="oauth" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['google', 'microsoft', 'zapier'].map((provider) => {
              const connection = oauthConnections.find(
                (c) => c.provider === provider
              );
              const isConnected = connection?.status === 'connected';

              return (
                <Card key={provider}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="capitalize">{provider}</CardTitle>
                      {isConnected ? (
                        <Badge className="bg-green-500">
                          <Check className="w-3 h-3 mr-1" />
                          Conectado
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Desconectado</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isConnected && connection && (
                      <div className="text-sm space-y-1">
                        <p className="text-muted-foreground">
                          Última sincronização:{' '}
                          {connection.last_sync_at
                            ? new Date(connection.last_sync_at).toLocaleString()
                            : 'Nunca'}
                        </p>
                        <p className="text-muted-foreground">
                          Expira em:{' '}
                          {connection.expires_at
                            ? new Date(connection.expires_at).toLocaleString()
                            : 'N/A'}
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {isConnected ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              /* Refresh token */
                            }}
                          >
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Sincronizar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              disconnectOAuthMutation.mutate(provider)
                            }
                          >
                            <X className="w-3 h-3 mr-1" />
                            Desconectar
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleOAuthConnect(provider)}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Conectar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <div className="space-y-3">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{webhook.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {webhook.webhook_url}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          webhook.status === 'active' ? 'default' : 'secondary'
                        }
                      >
                        {webhook.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          toggleWebhookMutation.mutate({
                            id: webhook.id,
                            enabled: webhook.status !== 'active',
                          })
                        }
                      >
                        <Power className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Sucessos: </span>
                      <span className="font-medium text-green-600">
                        {webhook.success_count}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Falhas: </span>
                      <span className="font-medium text-red-600">
                        {webhook.failure_count}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Último trigger: </span>
                      <span className="font-medium">
                        {webhook.last_triggered_at
                          ? new Date(webhook.last_triggered_at).toLocaleString()
                          : 'Nunca'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eventos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats?.recent_events.slice(0, 10).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {event.status === 'success' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : event.status === 'failed' ? (
                        <X className="w-4 h-4 text-red-600" />
                      ) : (
                        <Activity className="w-4 h-4 text-blue-600" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{event.event_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.triggered_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        event.status === 'success'
                          ? 'default'
                          : event.status === 'failed'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {event.status}
                    </Badge>
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
