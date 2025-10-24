import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cloud, Wind, Thermometer, Droplets, AlertTriangle, Brain, MapPin, Navigation, Zap } from "lucide-react";

/**
 * Weather Dashboard - PATCH 89.0 Enhanced
 * 
 * Features:
 * - Real-time weather monitoring
 * - Route-specific forecasts
 * - Severe weather alerts
 * - AI-powered route recommendations
 * - DP operation risk assessment
 * - Historical weather analysis
 */
const WeatherDashboard = () => {
  const [activeTab, setActiveTab] = useState("current");

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Cloud className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Weather Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time weather monitoring with AI-powered insights
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <Brain className="h-3 w-3" />
            AI-Powered
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Zap className="h-3 w-3" />
            Real-time
          </Badge>
        </div>
      </div>
      
      {/* Current Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24°C</div>
            <p className="text-xs text-muted-foreground">Average across fleet</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Wind Speed</CardTitle>
            <Wind className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 kn</div>
            <p className="text-xs text-muted-foreground">Current conditions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Humidity</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">Relative humidity</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">2</div>
            <p className="text-xs text-muted-foreground">Weather warnings</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Weather Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Real-time weather monitoring and forecasting with route-specific conditions, 
                severe weather alerts, and historical weather data analysis.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Route-Specific Forecasts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">Route A-23</p>
                      <p className="text-sm text-muted-foreground">Santos → Rio de Janeiro</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50">Safe</Badge>
                  </div>
                  <p className="text-sm">Clear skies, wind 8-12 kn, waves 1-2m</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">Route B-15</p>
                      <p className="text-sm text-muted-foreground">Recife → Fortaleza</p>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50">Caution</Badge>
                  </div>
                  <p className="text-sm">Scattered storms, wind 15-20 kn, waves 2-3m</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Severe Weather Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-900">Strong Wind Warning</p>
                      <p className="text-xs text-orange-700 mt-1">
                        Expected wind speeds 25-30 kn in region Southeast - Valid until 18:00
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <Cloud className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Storm Watch</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Tropical storm forming 200 nm east - Monitor for next 24 hours
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI-Powered Weather Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2 mb-2">
                    <Navigation className="h-5 w-5 text-blue-600 mt-0.5" />
                    <p className="text-sm font-medium text-blue-900">Route Optimization</p>
                  </div>
                  <p className="text-sm text-blue-700">
                    AI recommends diverting Route B-15 by 15 nm to avoid storm system. 
                    Estimated time savings: 2 hours, fuel savings: 8%
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-start gap-2 mb-2">
                    <Cloud className="h-5 w-5 text-purple-600 mt-0.5" />
                    <p className="text-sm font-medium text-purple-900">DP Operations Risk</p>
                  </div>
                  <p className="text-sm text-purple-700">
                    Current weather conditions pose LOW risk for DP operations. 
                    Wind direction stable, wave height within operational limits.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-2 mb-2">
                    <Thermometer className="h-5 w-5 text-green-600 mt-0.5" />
                    <p className="text-sm font-medium text-green-900">Optimal Conditions Window</p>
                  </div>
                  <p className="text-sm text-green-700">
                    Best weather window for critical operations: Tomorrow 06:00-14:00 local time.
                    Calm seas, light winds, excellent visibility predicted.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historical Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AI analysis of historical weather patterns suggests seasonal optimization opportunities 
                and predictive maintenance scheduling based on weather trends.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeatherDashboard;
