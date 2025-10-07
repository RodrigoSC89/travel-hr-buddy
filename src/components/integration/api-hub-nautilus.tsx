import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Network, 
  Code,
  Key,
  Activity,
  CheckCircle,
  AlertCircle,
  Download,
  Book,
  Zap,
  Globe,
  Shield,
  Clock,
  TrendingUp
} from 'lucide-react';

interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  category: 'vessel' | 'crew' | 'weather' | 'routes' | 'analytics' | 'iot';
  authentication: 'api_key' | 'oauth' | 'jwt';
  rateLimit: string;
  status: 'active' | 'beta' | 'deprecated';
  version: string;
  usageToday: number;
  avgResponseTime: number;
}

interface Integration {
  id: string;
  name: string;
  provider: string;
  type: 'weather' | 'navigation' | 'iot' | 'erp' | 'satellite' | 'customs';
  status: 'active' | 'inactive' | 'error';
  lastSync: string;
  apiCalls: number;
  uptime: number;
  credentials: {
    type: string;
    configured: boolean;
  };
}

export const APIHubNautilus: React.FC = () => {
  const [endpoints] = useState<APIEndpoint[]>([
    {
      id: '1',
      name: 'Get Vessel Position',
      method: 'GET',
      path: '/api/v1/vessels/{id}/position',
      description: 'Retorna posição atual e dados de navegação da embarcação',
      category: 'vessel',
      authentication: 'api_key',
      rateLimit: '1000/hour',
      status: 'active',
      version: 'v1.0',
      usageToday: 4523,
      avgResponseTime: 145
    },
    {
      id: '2',
      name: 'Get Weather Forecast',
      method: 'GET',
      path: '/api/v1/weather/forecast',
      description: 'Previsão meteorológica e oceânica para coordenadas específicas',
      category: 'weather',
      authentication: 'api_key',
      rateLimit: '500/hour',
      status: 'active',
      version: 'v1.0',
      usageToday: 2341,
      avgResponseTime: 312
    },
    {
      id: '3',
      name: 'Optimize Route',
      method: 'POST',
      path: '/api/v1/routes/optimize',
      description: 'Calcula rota otimizada considerando clima, consumo e tempo',
      category: 'routes',
      authentication: 'jwt',
      rateLimit: '100/hour',
      status: 'active',
      version: 'v1.2',
      usageToday: 156,
      avgResponseTime: 2450
    },
    {
      id: '4',
      name: 'Get Crew Schedule',
      method: 'GET',
      path: '/api/v1/crew/schedule',
      description: 'Retorna escala atual e próximas rotações da tripulação',
      category: 'crew',
      authentication: 'oauth',
      rateLimit: '2000/hour',
      status: 'active',
      version: 'v1.0',
      usageToday: 1823,
      avgResponseTime: 98
    },
    {
      id: '5',
      name: 'IoT Sensor Data',
      method: 'GET',
      path: '/api/v1/iot/sensors/{id}/data',
      description: 'Dados em tempo real de sensores IoT embarcados',
      category: 'iot',
      authentication: 'api_key',
      rateLimit: '10000/hour',
      status: 'beta',
      version: 'v2.0-beta',
      usageToday: 8734,
      avgResponseTime: 67
    },
    {
      id: '6',
      name: 'Analytics Dashboard',
      method: 'POST',
      path: '/api/v1/analytics/dashboard',
      description: 'Gera métricas e KPIs customizados para dashboards',
      category: 'analytics',
      authentication: 'jwt',
      rateLimit: '200/hour',
      status: 'active',
      version: 'v1.1',
      usageToday: 542,
      avgResponseTime: 1234
    }
  ]);

  const [integrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'OpenWeatherMap',
      provider: 'OpenWeather',
      type: 'weather',
      status: 'active',
      lastSync: '2025-05-12T14:30:00',
      apiCalls: 45234,
      uptime: 99.8,
      credentials: { type: 'API Key', configured: true }
    },
    {
      id: '2',
      name: 'MarineTraffic AIS',
      provider: 'MarineTraffic',
      type: 'navigation',
      status: 'active',
      lastSync: '2025-05-12T14:32:00',
      apiCalls: 23145,
      uptime: 99.5,
      credentials: { type: 'OAuth 2.0', configured: true }
    },
    {
      id: '3',
      name: 'AWS IoT Core',
      provider: 'Amazon Web Services',
      type: 'iot',
      status: 'active',
      lastSync: '2025-05-12T14:33:00',
      apiCalls: 156789,
      uptime: 99.9,
      credentials: { type: 'IAM Role', configured: true }
    },
    {
      id: '4',
      name: 'SAP Maritime',
      provider: 'SAP',
      type: 'erp',
      status: 'inactive',
      lastSync: '2025-05-10T08:15:00',
      apiCalls: 8934,
      uptime: 97.2,
      credentials: { type: 'API Key', configured: false }
    },
    {
      id: '5',
      name: 'Inmarsat FleetBroadband',
      provider: 'Inmarsat',
      type: 'satellite',
      status: 'active',
      lastSync: '2025-05-12T14:31:00',
      apiCalls: 12456,
      uptime: 98.7,
      credentials: { type: 'Custom Auth', configured: true }
    }
  ]);

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-600';
      case 'POST': return 'bg-blue-600';
      case 'PUT': return 'bg-yellow-600';
      case 'DELETE': return 'bg-red-600';
      case 'PATCH': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'beta': return 'secondary';
      case 'deprecated': return 'destructive';
      default: return 'outline';
    }
  };

  const getIntegrationStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-gray-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const totalAPICalls = endpoints.reduce((sum, e) => sum + e.usageToday, 0);
  const avgResponseTime = Math.round(
    endpoints.reduce((sum, e) => sum + e.avgResponseTime, 0) / endpoints.length
  );
  const activeIntegrations = integrations.filter(i => i.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Endpoints Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{endpoints.length}</div>
            <p className="text-xs text-muted-foreground">API disponíveis</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Chamadas Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalAPICalls / 1000).toFixed(1)}k</div>
            <p className="text-xs text-muted-foreground">Requisições</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tempo Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">Média</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Integrações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeIntegrations}/{integrations.length}
            </div>
            <p className="text-xs text-muted-foreground">Ativas</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                API Hub Nautilus
              </CardTitle>
              <CardDescription>
                Portal central de APIs, SDK e integração com ecossistema marítimo
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Book className="h-4 w-4 mr-2" />
                Documentação
              </Button>
              <Button size="sm">
                <Key className="h-4 w-4 mr-2" />
                Nova API Key
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="endpoints">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="integrations">Integrações</TabsTrigger>
              <TabsTrigger value="sdk">SDK & Docs</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
            </TabsList>

            <TabsContent value="endpoints" className="space-y-4 mt-4">
              {/* Search */}
              <div className="flex gap-2">
                <Input placeholder="Buscar endpoints..." className="flex-1" />
                <Button variant="outline">
                  Filtrar
                </Button>
              </div>

              {/* Endpoints List */}
              {endpoints.map((endpoint) => (
                <Card key={endpoint.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col gap-2">
                          <Badge className={getMethodColor(endpoint.method)}>
                            {endpoint.method}
                          </Badge>
                          <Badge variant={getStatusColor(endpoint.status) as any}>
                            {endpoint.status}
                          </Badge>
                        </div>
                        <div>
                          <CardTitle className="text-base">{endpoint.name}</CardTitle>
                          <code className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded mt-1 inline-block">
                            {endpoint.path}
                          </code>
                          <CardDescription className="mt-2">
                            {endpoint.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline">v{endpoint.version}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="h-4 w-4 text-blue-600" />
                          <span className="text-xs text-muted-foreground">Uso Hoje</span>
                        </div>
                        <div className="text-lg font-bold">{endpoint.usageToday.toLocaleString()}</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-muted-foreground">Resp. Média</span>
                        </div>
                        <div className="text-lg font-bold">{endpoint.avgResponseTime}ms</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="h-4 w-4 text-purple-600" />
                          <span className="text-xs text-muted-foreground">Auth</span>
                        </div>
                        <div className="text-sm font-medium">{endpoint.authentication.toUpperCase()}</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-4 w-4 text-yellow-600" />
                          <span className="text-xs text-muted-foreground">Rate Limit</span>
                        </div>
                        <div className="text-sm font-medium">{endpoint.rateLimit}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Code className="h-4 w-4 mr-2" />
                        Testar API
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Book className="h-4 w-4 mr-2" />
                        Documentação
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Exemplos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4 mt-4">
              {integrations.map((integration) => (
                <Card key={integration.id} className="border-l-4 border-l-purple-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                          <Globe className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {integration.name}
                            <Badge variant="outline">{integration.type}</Badge>
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {integration.provider}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center gap-1 ${getIntegrationStatusColor(integration.status)}`}>
                          {integration.status === 'active' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                          <span className="text-sm font-medium">{integration.status.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Integration Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Uptime</div>
                        <div className="text-xl font-bold text-green-600">{integration.uptime}%</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">API Calls</div>
                        <div className="text-xl font-bold">{(integration.apiCalls / 1000).toFixed(1)}k</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Última Sync</div>
                        <div className="text-sm font-medium">
                          {new Date(integration.lastSync).toLocaleTimeString('pt-BR')}
                        </div>
                      </div>
                    </div>

                    {/* Credentials */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{integration.credentials.type}</span>
                      </div>
                      {integration.credentials.configured ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Configurado
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Não Configurado
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Configurar
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Logs
                      </Button>
                      <Button size="sm" variant="outline">
                        Testar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="sdk" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>SDKs Disponíveis</CardTitle>
                  <CardDescription>
                    Bibliotecas oficiais para integração rápida
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'JavaScript/TypeScript SDK', version: 'v2.1.0', downloads: '45.2k' },
                    { name: 'Python SDK', version: 'v1.8.3', downloads: '32.1k' },
                    { name: 'Java SDK', version: 'v1.5.0', downloads: '18.7k' },
                    { name: 'C# .NET SDK', version: 'v1.3.2', downloads: '12.4k' }
                  ].map((sdk, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">{sdk.name}</div>
                        <div className="text-sm text-muted-foreground">v{sdk.version} • {sdk.downloads} downloads</div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Documentação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    'Guia de Início Rápido',
                    'Referência Completa da API',
                    'Exemplos de Código',
                    'Webhooks e Callbacks',
                    'Autenticação e Segurança',
                    'Limites e Quotas'
                  ].map((doc, idx) => (
                    <Button key={idx} variant="ghost" className="w-full justify-start">
                      <Book className="h-4 w-4 mr-2" />
                      {doc}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Performance API</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Uptime (30 dias)</span>
                          <span className="font-medium">99.87%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{width: '99.87%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Tempo Resposta P95</span>
                          <span className="font-medium">245ms</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{width: '78%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Taxa de Erro</span>
                          <span className="font-medium">0.13%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-red-500" style={{width: '0.13%'}}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Uso por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { category: 'IoT Sensors', percentage: 48, color: 'bg-purple-500' },
                        { category: 'Vessel Data', percentage: 25, color: 'bg-blue-500' },
                        { category: 'Weather', percentage: 13, color: 'bg-green-500' },
                        { category: 'Analytics', percentage: 9, color: 'bg-yellow-500' },
                        { category: 'Crew', percentage: 5, color: 'bg-red-500' }
                      ].map((item, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">{item.category}</span>
                            <span className="font-medium">{item.percentage}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${item.color}`} style={{width: `${item.percentage}%`}}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIHubNautilus;
