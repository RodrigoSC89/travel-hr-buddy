import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Code, Globe, Lock, Zap, CheckCircle, XCircle, 
  Cloud, Satellite, Anchor, Package 
} from "lucide-react";

const API_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-gateway`;

export default function APIGatewayDocs() {
  const [testEndpoint, setTestEndpoint] = useState('weather');
  const [testParams, setTestParams] = useState('location=Santos');
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const endpoints = [
    {
      name: 'Weather API',
      path: '/weather',
      method: 'GET',
      icon: Cloud,
      description: 'Get weather information for a location',
      params: [
        { name: 'location', type: 'string', required: false, default: 'Santos, Brazil' }
      ],
      example: `${API_BASE_URL}/weather?location=Santos`,
      response: {
        location: 'Santos, Brazil',
        temperature: 24,
        humidity: 75,
        wind_speed: 12,
        conditions: 'Sunny'
      }
    },
    {
      name: 'Satellite Tracking',
      path: '/satellite',
      method: 'GET',
      icon: Satellite,
      description: 'Track vessel position via satellite',
      params: [
        { name: 'vessel_id', type: 'string', required: false }
      ],
      example: `${API_BASE_URL}/satellite?vessel_id=NAV-001`,
      response: {
        vessel_id: 'NAV-001',
        position: { latitude: -23.96, longitude: -46.33 },
        speed: 12,
        heading: 180
      }
    },
    {
      name: 'AIS (Vessel Traffic)',
      path: '/ais',
      method: 'GET',
      icon: Anchor,
      description: 'Get AIS data for vessels in an area',
      params: [
        { name: 'area', type: 'string', required: false, default: 'Santos Port' }
      ],
      example: `${API_BASE_URL}/ais?area=Santos%20Port`,
      response: {
        area: 'Santos Port',
        vessels_detected: 12,
        vessels: []
      }
    },
    {
      name: 'Logistics',
      path: '/logistics',
      method: 'POST',
      icon: Package,
      description: 'Logistics operations and cargo tracking',
      params: [
        { name: 'operation', type: 'string', required: true },
        { name: 'data', type: 'object', required: true }
      ],
      example: `${API_BASE_URL}/logistics`,
      body: {
        operation: 'track_cargo',
        data: { cargo_id: 'CARGO-123' }
      },
      response: {
        cargo_id: 'CARGO-123',
        status: 'In Transit',
        location: 'Santos Port'
      }
    }
  ];

  const testAPI = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const url = `${API_BASE_URL}/${testEndpoint}${testParams ? `?${testParams}` : ''}`;
      
      const response = await fetch(url, { headers });
      const data = await response.json();
      
      setTestResult(data);
      
      toast({
        title: "API Response",
        description: `Status: ${response.status}`,
      });
    } catch (error) {
      console.error('API test error:', error);
      setTestResult({ error: error instanceof Error ? error.message : 'Unknown error' });
      toast({
        title: "API Error",
        description: "Failed to call API endpoint",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Globe className="w-8 h-8 text-primary" />
          API Gateway Documentation
        </h1>
        <p className="text-muted-foreground mt-1">
          Secure integration layer for external APIs and data sources
        </p>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-500" />
              Secure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              JWT authentication & token validation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Fast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Low latency edge function deployment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-500" />
              RESTful
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Standard REST API with JSON responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-500" />
              External
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Connects to weather, AIS, satellite APIs
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="endpoints" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="testing">API Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Endpoints</CardTitle>
              <CardDescription>
                All endpoints require authentication via JWT token or x-nautilus-token header
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {endpoints.map((endpoint, idx) => {
                    const Icon = endpoint.icon;
                    return (
                      <Card key={idx}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Icon className="w-5 h-5 text-primary" />
                              <h3 className="font-semibold">{endpoint.name}</h3>
                            </div>
                            <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                              {endpoint.method}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {endpoint.description}
                          </p>

                          <div className="space-y-2">
                            <div>
                              <span className="text-xs font-medium">Endpoint:</span>
                              <code className="block mt-1 p-2 bg-muted rounded text-xs">
                                {endpoint.path}
                              </code>
                            </div>

                            <div>
                              <span className="text-xs font-medium">Parameters:</span>
                              <div className="mt-1 space-y-1">
                                {endpoint.params.map((param, pidx) => (
                                  <div key={pidx} className="flex items-center gap-2 text-xs">
                                    <code className="bg-muted px-2 py-1 rounded">{param.name}</code>
                                    <Badge variant="outline" className="text-xs">{param.type}</Badge>
                                    {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                                    {'default' in param && param.default && (
                                      <span className="text-muted-foreground">Default: {param.default}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <span className="text-xs font-medium">Example Request:</span>
                              <code className="block mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                                {endpoint.example}
                              </code>
                            </div>

                            {endpoint.body && (
                              <div>
                                <span className="text-xs font-medium">Request Body:</span>
                                <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                                  {JSON.stringify(endpoint.body, null, 2)}
                                </pre>
                              </div>
                            )}

                            <div>
                              <span className="text-xs font-medium">Example Response:</span>
                              <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                                {JSON.stringify(endpoint.response, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Methods</CardTitle>
              <CardDescription>
                Secure your API requests with proper authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Method 1: JWT Bearer Token (Recommended)
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Use your Supabase session token for authenticated requests
                </p>
                <code className="block p-3 bg-muted rounded text-sm">
                  Authorization: Bearer YOUR_JWT_TOKEN
                </code>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  Method 2: Custom Nautilus Token
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Use a custom token for service-to-service communication
                </p>
                <code className="block p-3 bg-muted rounded text-sm">
                  x-nautilus-token: YOUR_CUSTOM_TOKEN
                </code>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Example: Authenticated Request</h3>
                <pre className="p-3 bg-muted rounded text-sm overflow-x-auto">
{`fetch('${API_BASE_URL}/weather?location=Santos', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  }
}).then(res => res.json())`}
                </pre>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Security Warning
                </h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Never expose your tokens in client-side code or public repositories. 
                  Always use environment variables and secure storage.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing">
          <Card>
            <CardHeader>
              <CardTitle>API Testing Console</CardTitle>
              <CardDescription>
                Test API endpoints directly from this interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Endpoint</label>
                <select
                  value={testEndpoint}
                  onChange={(e) => setTestEndpoint(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="weather">Weather API</option>
                  <option value="satellite">Satellite Tracking</option>
                  <option value="ais">AIS (Vessel Traffic)</option>
                  <option value="status">Gateway Status</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Query Parameters (optional)</label>
                <Input
                  value={testParams}
                  onChange={(e) => setTestParams(e.target.value)}
                  placeholder="location=Santos"
                />
                <p className="text-xs text-muted-foreground">
                  Format: param1=value1&param2=value2
                </p>
              </div>

              <Button onClick={testAPI} disabled={isLoading} className="w-full">
                {isLoading ? "Testing..." : "Test API"}
              </Button>

              {testResult && (
                <div>
                  <h3 className="font-semibold mb-2">Response:</h3>
                  <pre className="p-3 bg-muted rounded text-sm overflow-x-auto max-h-96">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
