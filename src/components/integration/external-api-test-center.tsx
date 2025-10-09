/**
 * External API Test Center
 * Centralized testing interface for all external API integrations
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  MapPin,
  Cloud,
  Plane,
  Brain,
  Mic,
  Wind,
  Globe,
  RefreshCw
} from 'lucide-react';

// Import all test functions
import { testMapbox } from '@/services/mapbox-service';
import { testOpenAI } from '@/services/openai-service';
import { testAmadeus } from '@/services/amadeus-service';
import { testOpenWeather } from '@/services/openweather-service';
import { testElevenLabs } from '@/services/elevenlabs-service';
import { testWindy } from '@/services/windy-service';
import { testSkyscanner } from '@/services/skyscanner-service';

interface TestResult {
  service: string;
  success: boolean;
  message: string;
  data?: any;
  timestamp: Date;
  duration?: number;
}

interface ServiceDefinition {
  id: string;
  name: string;
  icon: React.ElementType;
  testFunction: () => Promise<any>;
  description: string;
  category: 'maps' | 'weather' | 'travel' | 'ai' | 'voice';
}

const services: ServiceDefinition[] = [
  {
    id: 'mapbox',
    name: 'Mapbox',
    icon: MapPin,
    testFunction: testMapbox,
    description: 'Maps, geocoding, and location services',
    category: 'maps',
  },
  {
    id: 'openweather',
    name: 'OpenWeather',
    icon: Cloud,
    testFunction: testOpenWeather,
    description: 'Weather data and forecasts',
    category: 'weather',
  },
  {
    id: 'windy',
    name: 'Windy',
    icon: Wind,
    testFunction: testWindy,
    description: 'Wind and weather visualization',
    category: 'weather',
  },
  {
    id: 'amadeus',
    name: 'Amadeus',
    icon: Plane,
    testFunction: testAmadeus,
    description: 'Travel and flight data',
    category: 'travel',
  },
  {
    id: 'skyscanner',
    name: 'Skyscanner',
    icon: Globe,
    testFunction: testSkyscanner,
    description: 'Flight search and booking',
    category: 'travel',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: Brain,
    testFunction: testOpenAI,
    description: 'AI chat and completions',
    category: 'ai',
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    icon: Mic,
    testFunction: testElevenLabs,
    description: 'Text-to-speech and voice synthesis',
    category: 'voice',
  },
];

export const ExternalAPITestCenter: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testingServices, setTestingServices] = useState<Set<string>>(new Set());
  const [isTestingAll, setIsTestingAll] = useState(false);

  const testService = async (service: ServiceDefinition) => {
    setTestingServices((prev) => new Set(prev).add(service.id));
    const startTime = Date.now();

    try {
      const response = await service.testFunction();
      const duration = Date.now() - startTime;

      const result: TestResult = {
        service: service.name,
        success: response.success,
        message: response.message || response.error || 'Test completed',
        data: response.data,
        timestamp: new Date(),
        duration,
      };

      setResults((prev) => [result, ...prev]);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const result: TestResult = {
        service: service.name,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date(),
        duration,
      };

      setResults((prev) => [result, ...prev]);
    } finally {
      setTestingServices((prev) => {
        const next = new Set(prev);
        next.delete(service.id);
        return next;
      });
    }
  };

  const testAllServices = async () => {
    setIsTestingAll(true);
    setResults([]);

    for (const service of services) {
      await testService(service);
      // Small delay between tests to avoid overwhelming APIs
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setIsTestingAll(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  const getServicesByCategory = (category: string) => {
    return services.filter((s) => s.category === category);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'maps': return MapPin;
      case 'weather': return Cloud;
      case 'travel': return Plane;
      case 'ai': return Brain;
      case 'voice': return Mic;
      default: return Globe;
    }
  };

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>External API Test Center</CardTitle>
              <CardDescription>
                Test and validate all external API integrations
              </CardDescription>
            </div>
            <Button
              onClick={testAllServices}
              disabled={isTestingAll}
              className="flex items-center gap-2"
            >
              {isTestingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Test All APIs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="maps">Maps</TabsTrigger>
              <TabsTrigger value="weather">Weather</TabsTrigger>
              <TabsTrigger value="travel">Travel</TabsTrigger>
              <TabsTrigger value="ai">AI</TabsTrigger>
              <TabsTrigger value="voice">Voice</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {services.map((service) => {
                  const Icon = service.icon;
                  const isTesting = testingServices.has(service.id);
                  
                  return (
                    <Card key={service.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-primary" />
                          <CardTitle className="text-base">{service.name}</CardTitle>
                        </div>
                        <CardDescription className="text-xs">
                          {service.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => testService(service)}
                          disabled={isTesting || isTestingAll}
                        >
                          {isTesting ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                              Testing...
                            </>
                          ) : (
                            'Test Connection'
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {['maps', 'weather', 'travel', 'ai', 'voice'].map((category) => (
              <TabsContent key={category} value={category} className="space-y-3 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getServicesByCategory(category).map((service) => {
                    const Icon = service.icon;
                    const isTesting = testingServices.has(service.id);
                    
                    return (
                      <Card key={service.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-primary" />
                            <CardTitle className="text-base">{service.name}</CardTitle>
                          </div>
                          <CardDescription className="text-xs">
                            {service.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => testService(service)}
                            disabled={isTesting || isTestingAll}
                          >
                            {isTesting ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                Testing...
                              </>
                            ) : (
                              'Test Connection'
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>
                  {successCount} successful, {failureCount} failed
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={clearResults}>
                Clear Results
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {results.map((result, index) => (
              <Alert
                key={index}
                variant={result.success ? 'default' : 'destructive'}
                className="flex items-start gap-3"
              >
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                    <p className="font-semibold">{result.service}</p>
                    <div className="flex items-center gap-2">
                      {result.duration && (
                        <span className="text-xs text-muted-foreground">
                          {result.duration}ms
                        </span>
                      )}
                      <Badge variant={result.success ? 'outline' : 'destructive'}>
                        {result.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                  </div>
                  <AlertDescription className="break-words">
                    {result.message}
                  </AlertDescription>
                  {result.data && (
                    <div className="mt-2 p-2 bg-muted rounded text-xs font-mono overflow-auto">
                      <pre>{JSON.stringify(result.data, null, 2)}</pre>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.timestamp.toLocaleString('pt-BR')}
                  </p>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
