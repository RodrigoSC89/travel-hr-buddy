import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import {
  CheckCircle,
  XCircle,
  Loader2,
  TestTube,
  MapPin,
  MessageSquare,
  Mic,
  Plane,
  Hotel,
  Cloud,
  Ship,
  AlertCircle,
  Clock,
  Database,
} from "lucide-react";
import { testMapboxConnection } from "@/services/mapbox";
import { testOpenAIConnection } from "@/services/openai";
import { testWhisperConnection } from "@/services/whisper";
import { testSkyscannerConnection } from "@/services/skyscanner";
import { testBookingConnection } from "@/services/booking";
import { testWindyConnection } from "@/services/windy";
import { testMarineTrafficConnection } from "@/services/marinetraffic";
import { testAmadeusConnection } from "@/services/amadeus";
import { testSupabaseConnection } from "@/services/supabase";

interface APITest {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  testFn: () => Promise<unknown>;
  status: "idle" | "loading" | "success" | "error";
  result?: {
    message: string;
    responseTime?: number;
    data?: unknown;
    error?: string;
  };
}

const APITester = () => {
  const [tests, setTests] = useState<APITest[]>([
    {
      id: "openai",
      name: "OpenAI (Chat)",
      description: "Test simple chat response",
      icon: MessageSquare,
      testFn: testOpenAIConnection,
      status: "idle",
    },
    {
      id: "mapbox",
      name: "Mapbox",
      description: "Test geolocation or static map load",
      icon: MapPin,
      testFn: testMapboxConnection,
      status: "idle",
    },
    {
      id: "amadeus",
      name: "Amadeus",
      description: "Test OAuth2 authentication and travel API",
      icon: Plane,
      testFn: testAmadeusConnection,
      status: "idle",
    },
    {
      id: "supabase",
      name: "Supabase",
      description: "Test database and auth connection",
      icon: Database,
      testFn: testSupabaseConnection,
      status: "idle",
    },
    {
      id: "whisper",
      name: "Whisper",
      description: "Test audio transcription API",
      icon: Mic,
      testFn: testWhisperConnection,
      status: "idle",
    },
    {
      id: "windy",
      name: "Weather (Windy/OpenWeather)",
      description: "Weather data by coordinates",
      icon: Cloud,
      testFn: testWindyConnection,
      status: "idle",
    },
    {
      id: "skyscanner",
      name: "Skyscanner",
      description: "Flight search sample",
      icon: Plane,
      testFn: testSkyscannerConnection,
      status: "idle",
    },
    {
      id: "booking",
      name: "Booking.com",
      description: "Hotel search functionality",
      icon: Hotel,
      testFn: testBookingConnection,
      status: "idle",
    },
    {
      id: "marinetraffic",
      name: "MarineTraffic",
      description: "Vessel tracking and location",
      icon: Ship,
      testFn: testMarineTrafficConnection,
      status: "idle",
    },
  ]);

  const runTest = async (testId: string) => {
    setTests((prev) =>
      prev.map((test) =>
        test.id === testId ? { ...test, status: "loading", result: undefined } : test
      )
    );

    const test = tests.find((t) => t.id === testId);
    if (!test) return;

    try {
      const result = await test.testFn();

      setTests((prev) =>
        prev.map((t) =>
          t.id === testId
            ? {
              ...t,
              status: result.success ? "success" : "error",
              result: {
                message: result.message,
                responseTime: result.responseTime,
                data: result.data,
                error: result.error,
              },
            }
            : t
        )
      );
    } catch (error) {
      setTests((prev) =>
        prev.map((t) =>
          t.id === testId
            ? {
              ...t,
              status: "error",
              result: {
                message: "Test execution failed",
                error: error instanceof Error ? error.message : "Unknown error",
              },
            }
            : t
        )
      );
    }
  };

  const runAllTests = async () => {
    for (const test of tests) {
      await runTest(test.id);
      // Add a small delay between tests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "loading":
      return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case "error":
      return <XCircle className="h-5 w-5 text-red-600" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "loading":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            Testing...
        </Badge>
      );
    case "success":
      return (
        <Badge variant="default" className="bg-green-600 text-white">
            ✅ Success
        </Badge>
      );
    case "error":
      return (
        <Badge variant="destructive" className="bg-red-600 text-white">
            ❌ Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-600">
            Not Tested
        </Badge>
      );
    }
  };

  const successCount = tests.filter((t) => t.status === "success").length;
  const errorCount = tests.filter((t) => t.status === "error").length;
  const totalCount = tests.length;

  return (
    <MultiTenantWrapper>
      <ModulePageWrapper gradient="purple">
        <ModuleHeader
          icon={TestTube}
          title="API Tester"
          description="Test all external API integrations connected to Nautilus One"
          gradient="purple"
          badges={[
            { icon: TestTube, label: `${totalCount} APIs` },
            { icon: CheckCircle, label: `${successCount} Passed` },
            { icon: XCircle, label: `${errorCount} Failed` },
          ]}
        />

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total APIs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCount}</div>
                <p className="text-xs text-muted-foreground">External integrations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">APIs responding</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Average Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tests.filter((t) => t.result?.responseTime).length > 0
                    ? Math.round(
                      tests
                        .filter((t) => t.result?.responseTime)
                        .reduce((acc, t) => acc + (t.result?.responseTime || 0), 0) /
                          tests.filter((t) => t.result?.responseTime).length
                    )
                    : 0}
                  ms
                </div>
                <p className="text-xs text-muted-foreground">Response time</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Test Controls</CardTitle>
              <CardDescription>Run individual tests or test all APIs at once</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  onClick={runAllTests}
                  disabled={tests.some((t) => t.status === "loading")}
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  Test All APIs
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setTests((prev) =>
                      prev.map((t) => ({ ...t, status: "idle" as const, result: undefined }))
                    );
                  }}
                >
                  Clear Results
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* API Tests List */}
          <Card>
            <CardHeader>
              <CardTitle>API Integrations</CardTitle>
              <CardDescription>Test each external service integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tests.map((test) => {
                const Icon = test.icon;
                return (
                  <div
                    key={test.id}
                    className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{test.name}</h3>
                            {getStatusBadge(test.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{test.description}</p>
                          {test.result && (
                            <div className="mt-2">
                              <Alert
                                variant={test.status === "error" ? "destructive" : "default"}
                                className="py-2"
                              >
                                <AlertDescription className="text-xs">
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(test.status)}
                                    <span>{test.result.message}</span>
                                    {test.result.responseTime && (
                                      <span className="flex items-center gap-1 ml-auto">
                                        <Clock className="h-3 w-3" />
                                        {test.result.responseTime}ms
                                      </span>
                                    )}
                                  </div>
                                  {test.result.error && (
                                    <div className="mt-1 text-xs opacity-70">
                                      Error: {test.result.error}
                                    </div>
                                  )}
                                  {test.result.data && (
                                    <div className="mt-1 text-xs opacity-70">
                                      Data: {JSON.stringify(test.result.data)}
                                    </div>
                                  )}
                                </AlertDescription>
                              </Alert>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => runTest(test.id)}
                        disabled={test.status === "loading"}
                        size="sm"
                        className="min-w-[80px]"
                      >
                        {test.status === "loading" ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Testing
                          </>
                        ) : (
                          "Test"
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
};

export default APITester;
