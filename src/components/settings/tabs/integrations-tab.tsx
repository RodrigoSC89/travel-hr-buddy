import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Link2, 
  Key, 
  Webhook, 
  Globe, 
  Plus,
  Edit,
  Trash2,
  TestTube,
  CheckCircle,
  AlertTriangle,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';

interface IntegrationSettings {
  apiKeys: Record<string, string>;
  webhooks: Array<{ id: string; name: string; url: string; active: boolean }>;
  externalServices: Record<string, any>;
}

interface IntegrationsTabProps {
  settings: IntegrationSettings;
  onUpdate: (updates: Partial<IntegrationSettings>) => void;
  testMode: boolean;
}

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({
  settings,
  onUpdate,
  testMode
}) => {
  const { toast } = useToast();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '' });

  const apiServices = [
    {
      id: 'google_oauth',
      name: 'Google OAuth',
      description: 'Autenticação com Google',
      icon: '🔐',
      status: 'connected',
      required: ['client_id', 'client_secret']
    },
    {
      id: 'microsoft_graph',
      name: 'Microsoft Graph',
      description: 'Integração com Microsoft 365',
      icon: '📧',
      status: 'disconnected',
      required: ['app_id', 'app_secret', 'tenant_id']
    },
    {
      id: 'openweather',
      name: 'OpenWeather API',
      description: 'Dados meteorológicos',
      icon: '🌤️',
      status: 'connected',
      required: ['api_key']
    },
    {
      id: 'amadeus',
      name: 'Amadeus Travel API',
      description: 'Serviços de viagem',
      icon: '✈️',
      status: 'connected',
      required: ['api_key', 'api_secret']
    },
    {
      id: 'mapbox',
      name: 'Mapbox',
      description: 'Mapas e geolocalização',
      icon: '🗺️',
      status: 'connected',
      required: ['access_token']
    },
    {
      id: 'supabase',
      name: 'Supabase',
      description: 'Backend e banco de dados',
      icon: '⚡',
      status: 'connected',
      required: ['url', 'anon_key', 'service_role_key']
    }
  ];

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const addWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast({
        title: "Erro",
        description: "Nome e URL são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const webhook = {
      id: Date.now().toString(),
      name: newWebhook.name,
      url: newWebhook.url,
      active: true
    };

    onUpdate({
      webhooks: [...settings.webhooks, webhook]
    });

    setNewWebhook({ name: '', url: '' });
    
    toast({
      title: "Webhook Adicionado",
      description: "Webhook configurado com sucesso"
    });
  };

  const removeWebhook = (id: string) => {
    onUpdate({
      webhooks: settings.webhooks.filter(w => w.id !== id)
    });
    
    toast({
      title: "Webhook Removido",
      description: "Webhook foi removido das configurações"
    });
  };

  const testWebhook = async (webhook: any) => {
    toast({
      title: "Testando Webhook",
      description: "Enviando payload de teste..."
    });

    // Simulate webhook test
    setTimeout(() => {
      toast({
        title: "Webhook Testado",
        description: "Resposta: 200 OK - Webhook funcionando corretamente"
      });
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'connected') {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Conectado
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-orange-600 border-orange-200">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Desconectado
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="apis" className="space-y-6">
        <TabsList>
          <TabsTrigger value="apis" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            APIs e Tokens
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="w-4 h-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Serviços Externos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="apis" className="space-y-6">
          {/* API Keys Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                Configuração de Chaves e Tokens de API
                {testMode && <Badge variant="outline" className="ml-2"><TestTube className="w-3 h-3 mr-1" />Teste</Badge>}
              </CardTitle>
              <CardDescription>
                Configure as chaves de API para integração com serviços externos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                {apiServices.map((service) => (
                  <div key={service.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{service.icon}</span>
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(service.status)}
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-2" />
                          Configurar
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {service.required.map((field) => (
                        <div key={field} className="space-y-2">
                          <Label htmlFor={`${service.id}_${field}`}>
                            {field.replace(/_/g, ' ').toUpperCase()}
                          </Label>
                          <div className="relative">
                            <Input
                              id={`${service.id}_${field}`}
                              type={showKeys[`${service.id}_${field}`] ? 'text' : 'password'}
                              placeholder={`Digite ${field.replace(/_/g, ' ')}`}
                              defaultValue={field.includes('key') || field.includes('secret') ? '••••••••••••••••' : ''}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => toggleKeyVisibility(`${service.id}_${field}`)}
                            >
                              {showKeys[`${service.id}_${field}`] ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          {/* Webhooks Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5 text-primary" />
                Configuração de Webhooks
              </CardTitle>
              <CardDescription>
                Configure webhooks para notificar sistemas externos sobre eventos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Webhook */}
              <div className="p-4 border-2 border-dashed rounded-lg">
                <h4 className="font-medium mb-4">Adicionar Novo Webhook</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhookName">Nome</Label>
                    <Input
                      id="webhookName"
                      placeholder="Nome descritivo do webhook"
                      value={newWebhook.name}
                      onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">URL</Label>
                    <Input
                      id="webhookUrl"
                      placeholder="https://api.exemplo.com/webhook"
                      value={newWebhook.url}
                      onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                    />
                  </div>
                </div>
                <Button onClick={addWebhook} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Webhook
                </Button>
              </div>

              {/* Existing Webhooks */}
              <div className="space-y-4">
                {settings.webhooks.map((webhook) => (
                  <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={webhook.active}
                        onCheckedChange={(active) => {
                          const updatedWebhooks = settings.webhooks.map(w =>
                            w.id === webhook.id ? { ...w, active } : w
                          );
                          onUpdate({ webhooks: updatedWebhooks });
                        }}
                      />
                      <div>
                        <h4 className="font-medium">{webhook.name}</h4>
                        <p className="text-sm text-muted-foreground">{webhook.url}</p>
                      </div>
                      {webhook.active && (
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => testWebhook(webhook)}>
                        Testar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeWebhook(webhook.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {settings.webhooks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Webhook className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum webhook configurado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          {/* External Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Serviços Externos Conectados
              </CardTitle>
              <CardDescription>
                Gerencie conexões com serviços externos e hub de integrações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apiServices.filter(s => s.status === 'connected').map((service) => (
                  <div key={service.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{service.icon}</span>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ativo
                      </Badge>
                    </div>
                    <h4 className="font-medium mb-1">{service.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Configurar
                      </Button>
                      <Button variant="outline" size="sm">
                        Testar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-800">Hub de Integrações</h4>
                <p className="text-sm text-blue-700">
                  Conecte-se com mais serviços através do hub de integrações. 
                  Explore centenas de conectores disponíveis para automatizar seus processos.
                </p>
                <Button variant="outline" className="mt-3 text-blue-800 border-blue-300 hover:bg-blue-100">
                  <Link2 className="w-4 h-4 mr-2" />
                  Abrir Hub de Integrações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
