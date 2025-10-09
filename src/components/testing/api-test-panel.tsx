import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Loader2,
  MapPin,
  MessageSquare,
  Plane,
  Cloud,
  Mic,
  Wind,
  CreditCard,
  Database,
  Search
} from 'lucide-react';
import {
  testMapbox,
  testOpenAI,
  testAmadeus,
  testOpenWeather,
  testElevenLabs,
  testWindy,
  testSkyscanner,
  testStripe,
  testSupabase,
  getMapboxStatus,
  getOpenAIStatus,
  getAmadeusStatus,
  getOpenWeatherStatus,
  getElevenLabsStatus,
  getWindyStatus,
  getSkyscannerStatus,
  getStripeStatus,
  getSupabaseStatus
} from '@/services';

interface TestResult {
  service: string;
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
  timestamp: Date;
}

interface APIService {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  testFn: () => Promise<any>;
  statusFn: () => any;
}

export const APITestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<Map<string, TestResult>>(new Map());
  const [testingServices, setTestingServices] = useState<Set<string>>(new Set());

  const services: APIService[] = [
    {
      id: 'mapbox',
      name: 'Mapbox',
      icon: <MapPin className="w-5 h-5" />,
      description: 'Maps, geocoding, and location services',
      testFn: testMapbox,
      statusFn: getMapboxStatus
    },
    {
      id: 'openai',
      name: 'OpenAI',
      icon: <MessageSquare className="w-5 h-5" />,
      description: 'AI chat and assistant features',
      testFn: testOpenAI,
      statusFn: getOpenAIStatus
    },
    {
      id: 'amadeus',
      name: 'Amadeus',
      icon: <Plane className="w-5 h-5" />,
      description: 'Travel booking and flight information',
      testFn: testAmadeus,
      statusFn: getAmadeusStatus
    },
    {
      id: 'openweather',
      name: 'OpenWeather',
      icon: <Cloud className="w-5 h-5" />,
      description: 'Weather data and forecasts',
      testFn: testOpenWeather,
      statusFn: getOpenWeatherStatus
    },
    {
      id: 'elevenlabs',
      name: 'ElevenLabs',
      icon: <Mic className="w-5 h-5" />,
      description: 'Text-to-speech and voice services',
      testFn: testElevenLabs,
      statusFn: getElevenLabsStatus
    },
    {
      id: 'windy',
      name: 'Windy',
      icon: <Wind className="w-5 h-5" />,
      description: 'Weather, wind, and marine forecasts',
      testFn: testWindy,
      statusFn: getWindyStatus
    },
    {
      id: 'skyscanner',
      name: 'Skyscanner',
      icon: <Search className="w-5 h-5" />,
      description: 'Flight search and comparison',
      testFn: testSkyscanner,
      statusFn: getSkyscannerStatus
    },
    {
      id: 'stripe',
      name: 'Stripe',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Payment processing',
      testFn: testStripe,
      statusFn: getStripeStatus
    },
    {
      id: 'supabase',
      name: 'Supabase',
      icon: <Database className="w-5 h-5" />,
      description: 'Database and authentication',
      testFn: testSupabase,
      statusFn: getSupabaseStatus
    }
  ];

  const runTest = async (service: APIService) => {
    setTestingServices(prev => new Set(prev).add(service.id));
    
    try {
      const result = await service.testFn();
      const testResult: TestResult = {
        service: service.name,
        success: result.success,
        message: result.message,
        error: result.error,
        data: result.data,
        timestamp: new Date()
      };
      
      setTestResults(prev => new Map(prev).set(service.id, testResult));
    } catch (error) {
      const testResult: TestResult = {
        service: service.name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
      
      setTestResults(prev => new Map(prev).set(service.id, testResult));
    } finally {
      setTestingServices(prev => {
        const newSet = new Set(prev);
        newSet.delete(service.id);
        return newSet;
      });
    }
  };

  const runAllTests = async () => {
    for (const service of services) {
      await runTest(service);
    }
  };

  const getStatusBadge = (serviceId: string) => {
    const result = testResults.get(serviceId);
    
    if (testingServices.has(serviceId)) {
      return <Badge variant="outline" className="gap-1"><Loader2 className="w-3 h-3 animate-spin" />Testing</Badge>;
    }
    
    if (!result) {
      return <Badge variant="outline">Not Tested</Badge>;
    }
    
    if (result.success) {
      return <Badge variant="default" className="bg-green-500 gap-1"><CheckCircle className="w-3 h-3" />Connected</Badge>;
    }
    
    return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Error</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Test Panel</CardTitle>
              <CardDescription>
                Test and validate external API integrations for the Nautilus One system
              </CardDescription>
            </div>
            <Button 
              onClick={runAllTests}
              disabled={testingServices.size > 0}
            >
              {testingServices.size > 0 ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test All APIs'
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="results">Detailed Results</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map(service => {
                  const status = service.statusFn();
                  const result = testResults.get(service.id);
                  
                  return (
                    <Card key={service.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {service.icon}
                            <CardTitle className="text-base">{service.name}</CardTitle>
                          </div>
                          {getStatusBadge(service.id)}
                        </div>
                        <CardDescription className="text-sm">
                          {service.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-xs text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span>Configuration:</span>
                            <span className={status.configured ? 'text-green-500' : 'text-orange-500'}>
                              {status.configured ? '✓ Configured' : '⚠ Not configured'}
                            </span>
                          </div>
                          {result && (
                            <div className="flex items-center justify-between mt-1">
                              <span>Last tested:</span>
                              <span>{result.timestamp.toLocaleTimeString()}</span>
                            </div>
                          )}
                        </div>
                        
                        <Button
                          onClick={() => runTest(service)}
                          disabled={testingServices.has(service.id)}
                          className="w-full"
                          size="sm"
                          variant={result?.success ? 'outline' : 'default'}
                        >
                          {testingServices.has(service.id) ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                              Testing...
                            </>
                          ) : result ? (
                            'Test Again'
                          ) : (
                            'Run Test'
                          )}
                        </Button>

                        {result && result.error && (
                          <Alert variant="destructive" className="mt-2">
                            <AlertDescription className="text-xs">
                              {result.error}
                            </AlertDescription>
                          </Alert>
                        )}

                        {result && result.success && result.data && (
                          <div className="text-xs bg-muted p-2 rounded mt-2">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <div className="space-y-3">
                {Array.from(testResults.entries()).map(([serviceId, result]) => {
                  const service = services.find(s => s.id === serviceId);
                  
                  return (
                    <Card key={serviceId}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {service?.icon}
                            <CardTitle className="text-base">{result.service}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            {result.success ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            <span className="text-sm text-muted-foreground">
                              {result.timestamp.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {result.message && (
                          <p className="text-sm text-green-600 mb-2">{result.message}</p>
                        )}
                        {result.error && (
                          <Alert variant="destructive">
                            <AlertDescription>{result.error}</AlertDescription>
                          </Alert>
                        )}
                        {result.data && (
                          <div className="mt-3">
                            <p className="text-xs font-medium mb-1">Response Data:</p>
                            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                
                {testResults.size === 0 && (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No tests have been run yet. Click "Test All APIs" or test individual services.
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default APITestPanel;
