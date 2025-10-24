import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Server, Shield, Zap, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiEndpoint {
  id: string;
  name: string;
  path: string;
  method: string;
  status: "active" | "inactive" | "error";
  requests: number;
  avgLatency: number;
}

const ApiGateway = () => {
  const { toast } = useToast();
  const [endpoints] = useState<ApiEndpoint[]>([
    {
      id: "1",
      name: "User Authentication",
      path: "/api/auth",
      method: "POST",
      status: "active",
      requests: 15420,
      avgLatency: 120
    },
    {
      id: "2",
      name: "Fleet Data",
      path: "/api/fleet",
      method: "GET",
      status: "active",
      requests: 8934,
      avgLatency: 85
    },
    {
      id: "3",
      name: "Document Upload",
      path: "/api/documents",
      method: "POST",
      status: "active",
      requests: 3241,
      avgLatency: 340
    },
    {
      id: "4",
      name: "Analytics Query",
      path: "/api/analytics",
      method: "GET",
      status: "error",
      requests: 1203,
      avgLatency: 2100
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMethodBadge = (method: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      GET: "default",
      POST: "secondary",
      PUT: "outline",
      DELETE: "destructive"
    };
    return <Badge variant={variants[method] || "default"}>{method}</Badge>;
  };

  const handleTest = (endpoint: ApiEndpoint) => {
    toast({
      title: "Testing Endpoint",
      description: `Testing ${endpoint.name}...`
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Server className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">API Gateway</h1>
          <p className="text-muted-foreground">Manage and monitor all API endpoints</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{endpoints.length}</div>
            <p className="text-xs text-muted-foreground">Active endpoints</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {endpoints.reduce((acc, e) => acc + e.requests, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(endpoints.reduce((acc, e) => acc + e.avgLatency, 0) / endpoints.length)}ms
            </div>
            <p className="text-xs text-muted-foreground">Response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Active</div>
            <p className="text-xs text-muted-foreground">All systems secure</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="endpoints" className="space-y-4">
        <TabsList>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>Manage and test your API endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {endpoints.map((endpoint) => (
                  <div
                    key={endpoint.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {getStatusIcon(endpoint.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{endpoint.name}</h3>
                          {getMethodBadge(endpoint.method)}
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">{endpoint.path}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{endpoint.requests.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">requests</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{endpoint.avgLatency}ms</div>
                        <div className="text-xs text-muted-foreground">latency</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest(endpoint)}
                      className="ml-4"
                    >
                      Test
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Real-time monitoring dashboard with request tracking and performance metrics.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configure authentication, rate limiting, and API security policies.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiGateway;
