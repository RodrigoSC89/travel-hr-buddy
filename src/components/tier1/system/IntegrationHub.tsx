/**
 * Integration Hub - API Gateway & Third-Party Integrations
 * Enterprise-grade Integration Management
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Plug, 
  Cloud, 
  Database,
  Lock,
  Activity,
  AlertTriangle,
  CheckCircle,
  Settings,
  RefreshCw,
  Key,
  Webhook,
  BarChart3,
  Clock,
  Zap
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  category: 'ais' | 'weather' | 'port' | 'compliance' | 'payment' | 'communication' | 'analytics';
  provider: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync: Date | null;
  apiCalls: {
    today: number;
    limit: number;
    remaining: number;
  };
  health: {
    latency: number; // ms
    uptime: number; // %
    errorRate: number; // %
  };
  config: {
    apiKey: boolean;
    webhook: boolean;
    oauth: boolean;
  };
}

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'paused' | 'failed';
  lastTriggered: Date | null;
  successRate: number;
}

const fallbackIntegrations: Integration[] = [
  {
    id: "int1",
    name: "MarineTraffic AIS",
    category: "ais",
    provider: "MarineTraffic",
    status: "connected",
    lastSync: new Date(),
    apiCalls: { today: 2450, limit: 10000, remaining: 7550 },
    health: { latency: 145, uptime: 99.9, errorRate: 0.1 },
    config: { apiKey: true, webhook: true, oauth: false }
  },
  {
    id: "int2",
    name: "StormGeo Weather",
    category: "weather",
    provider: "StormGeo",
    status: "connected",
    lastSync: new Date(Date.now() - 3600000),
    apiCalls: { today: 890, limit: 5000, remaining: 4110 },
    health: { latency: 320, uptime: 99.5, errorRate: 0.5 },
    config: { apiKey: true, webhook: false, oauth: false }
  },
  {
    id: "int3",
    name: "PortCall Optimizer",
    category: "port",
    provider: "Port Authority Network",
    status: "connected",
    lastSync: new Date(Date.now() - 7200000),
    apiCalls: { today: 156, limit: 2000, remaining: 1844 },
    health: { latency: 210, uptime: 98.8, errorRate: 1.2 },
    config: { apiKey: true, webhook: true, oauth: true }
  },
  {
    id: "int4",
    name: "DNV Veracity",
    category: "compliance",
    provider: "DNV",
    status: "error",
    lastSync: new Date(Date.now() - 86400000),
    apiCalls: { today: 0, limit: 1000, remaining: 1000 },
    health: { latency: 0, uptime: 0, errorRate: 100 },
    config: { apiKey: true, webhook: false, oauth: true }
  },
  {
    id: "int5",
    name: "Stripe Payments",
    category: "payment",
    provider: "Stripe",
    status: "connected",
    lastSync: new Date(),
    apiCalls: { today: 45, limit: 10000, remaining: 9955 },
    health: { latency: 85, uptime: 99.99, errorRate: 0.01 },
    config: { apiKey: true, webhook: true, oauth: false }
  },
  {
    id: "int6",
    name: "Twilio SMS/Voice",
    category: "communication",
    provider: "Twilio",
    status: "connected",
    lastSync: new Date(),
    apiCalls: { today: 234, limit: 5000, remaining: 4766 },
    health: { latency: 120, uptime: 99.8, errorRate: 0.2 },
    config: { apiKey: true, webhook: true, oauth: false }
  }
];

const fallbackWebhooks: WebhookEndpoint[] = [
  {
    id: "wh1",
    name: "Vessel Position Updates",
    url: "https://api.example.com/webhooks/position",
    events: ["vessel.position.update", "vessel.geofence.enter", "vessel.geofence.exit"],
    status: "active",
    lastTriggered: new Date(),
    successRate: 99.8
  },
  {
    id: "wh2",
    name: "Compliance Alerts",
    url: "https://api.example.com/webhooks/compliance",
    events: ["compliance.certificate.expiring", "compliance.audit.scheduled"],
    status: "active",
    lastTriggered: new Date(Date.now() - 3600000),
    successRate: 100
  },
  {
    id: "wh3",
    name: "Crew Notifications",
    url: "https://api.example.com/webhooks/crew",
    events: ["crew.embarkation", "crew.certificate.expiring"],
    status: "paused",
    lastTriggered: new Date(Date.now() - 86400000),
    successRate: 95.2
  }
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'ais': return <Activity className="h-4 w-4" />;
    case 'weather': return <Cloud className="h-4 w-4" />;
    case 'port': return <Database className="h-4 w-4" />;
    case 'compliance': return <Lock className="h-4 w-4" />;
    case 'payment': return <Zap className="h-4 w-4" />;
    case 'communication': return <Webhook className="h-4 w-4" />;
    default: return <Plug className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'connected': return 'text-green-500';
    case 'disconnected': return 'text-muted-foreground';
    case 'error': return 'text-red-500';
    case 'pending': return 'text-yellow-500';
    default: return 'text-muted-foreground';
  }
};

export function IntegrationHub() {
  const [integrations, setIntegrations] = useState(fallbackIntegrations);

  const stats = {
    total: integrations.length,
    connected: integrations.filter(i => i.status === 'connected').length,
    errors: integrations.filter(i => i.status === 'error').length,
    totalCalls: integrations.reduce((acc, i) => acc + i.apiCalls.today, 0),
    avgLatency: integrations.filter(i => i.status === 'connected')
      .reduce((acc, i) => acc + i.health.latency, 0) / 
      integrations.filter(i => i.status === 'connected').length
  };

  return (
    <div className="space-y-6">
      {/* Integration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Plug className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Total Integrations</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Configured</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Connected</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-green-500">{stats.connected}</p>
            <Progress value={(stats.connected / stats.total) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className={stats.errors > 0 ? 'border-red-500' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${stats.errors > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
              <span className="text-sm text-muted-foreground">Errors</span>
            </div>
            <p className={`text-2xl font-bold mt-2 ${stats.errors > 0 ? 'text-red-500' : ''}`}>
              {stats.errors}
            </p>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-muted-foreground">API Calls Today</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.totalCalls.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Across all integrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-muted-foreground">Avg Latency</span>
            </div>
            <p className="text-2xl font-bold mt-2">{Math.round(stats.avgLatency)} ms</p>
            <p className="text-xs text-muted-foreground">Response time</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="integrations">
            <Plug className="h-4 w-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Webhook className="h-4 w-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="apikeys">
            <Key className="h-4 w-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Activity className="h-4 w-4 mr-2" />
            Activity Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plug className="h-5 w-5" />
                  Third-Party Integrations
                </div>
                <Button size="sm">
                  + Add Integration
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className={`p-4 border rounded-lg ${
                    integration.status === 'error' ? 'border-red-500 bg-red-500/5' : ''
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full bg-muted ${getStatusColor(integration.status)}`}>
                          {getCategoryIcon(integration.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{integration.name}</p>
                            <Badge variant="outline">{integration.provider}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>Last sync: {integration.lastSync?.toLocaleTimeString() || 'Never'}</span>
                            <span>•</span>
                            <span>Latency: {integration.health.latency}ms</span>
                            <span>•</span>
                            <span>Uptime: {integration.health.uptime}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm">
                            <span className="font-semibold">{integration.apiCalls.today.toLocaleString()}</span>
                            <span className="text-muted-foreground"> / {integration.apiCalls.limit.toLocaleString()}</span>
                          </p>
                          <Progress 
                            value={(integration.apiCalls.today / integration.apiCalls.limit) * 100}
                            className="w-24 mt-1"
                          />
                        </div>
                        <Badge variant={
                          integration.status === 'connected' ? 'default' :
                          integration.status === 'error' ? 'destructive' : 'secondary'
                        }>
                          {integration.status}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                        {integration.status === 'error' && (
                          <Button variant="outline" size="icon">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Webhook Endpoints
                </div>
                <Button size="sm">
                  + Create Webhook
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fallbackWebhooks.map((webhook) => (
                  <div key={webhook.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{webhook.name}</p>
                          <Badge variant={
                            webhook.status === 'active' ? 'default' :
                            webhook.status === 'failed' ? 'destructive' : 'secondary'
                          }>
                            {webhook.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono mt-1">{webhook.url}</p>
                        <div className="flex gap-2 mt-2">
                          {webhook.events.map((event, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Success Rate</p>
                          <p className={`font-semibold ${
                            webhook.successRate >= 99 ? 'text-green-500' :
                            webhook.successRate >= 95 ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            {webhook.successRate}%
                          </p>
                        </div>
                        <Switch checked={webhook.status === 'active'} />
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apikeys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Keys
                </div>
                <Button size="sm">
                  + Generate Key
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Production API Key</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        sk_live_••••••••••••••••••••xxxx
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>Live</Badge>
                      <Button variant="outline" size="sm">Rotate</Button>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Test API Key</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        sk_test_••••••••••••••••••••xxxx
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Test</Badge>
                      <Button variant="outline" size="sm">Rotate</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Activity Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm">
                <div className="p-2 bg-muted/50 rounded flex items-center justify-between">
                  <span><span className="text-green-500">200</span> GET /api/vessels/position</span>
                  <span className="text-muted-foreground">145ms • 2 min ago</span>
                </div>
                <div className="p-2 bg-muted/50 rounded flex items-center justify-between">
                  <span><span className="text-green-500">200</span> POST /api/compliance/check</span>
                  <span className="text-muted-foreground">320ms • 5 min ago</span>
                </div>
                <div className="p-2 bg-muted/50 rounded flex items-center justify-between">
                  <span><span className="text-red-500">500</span> GET /api/dnv/certificates</span>
                  <span className="text-muted-foreground">timeout • 1 hr ago</span>
                </div>
                <div className="p-2 bg-muted/50 rounded flex items-center justify-between">
                  <span><span className="text-green-500">201</span> POST /api/webhooks/trigger</span>
                  <span className="text-muted-foreground">89ms • 2 hr ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
