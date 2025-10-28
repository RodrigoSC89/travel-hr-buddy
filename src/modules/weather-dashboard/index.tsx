/**
 * Weather Dashboard - PATCH 386 Complete
 * Autonomous weather monitoring with maps, real-time data, and alert system
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cloud, Map, Activity, AlertTriangle } from "lucide-react";
import { WindyMapEmbed, type WindyOverlay } from "./components/WindyMap";
import { RealTimeWeatherData } from "./components/RealTimeWeatherData";
import { WeatherAlerts } from "./components/WeatherAlerts";

const WeatherDashboard = () => {
  const [selectedOverlay, setSelectedOverlay] = useState<WindyOverlay>('wind');
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Cloud className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Weather Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time weather monitoring with maps, alerts, and autonomous data updates
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <Activity className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="map">
            <Map className="mr-2 h-4 w-4" />
            Interactive Map
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <RealTimeWeatherData 
            latitude={-15}
            longitude={-45}
            autoRefresh={true}
            refreshInterval={300000}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Module Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✅ Real-time weather data with autonomous updates every 5 minutes</li>
                <li>✅ Interactive map with multiple layers (wind, pressure, temperature, rain, waves)</li>
                <li>✅ Active weather alert system with severity levels</li>
                <li>✅ Browser notifications for critical weather conditions</li>
                <li>✅ Mobile-responsive design</li>
                <li>✅ Independent from Forecast Global module</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Weather Map</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Select a layer to view different weather conditions. The map updates in real-time
                and supports wind, waves, rain, temperature, and pressure visualizations.
              </p>
            </CardContent>
          </Card>
          
          <WindyMapEmbed 
            latitude={-15}
            longitude={-45}
            zoom={4}
            overlay={selectedOverlay}
            height={600}
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <WeatherAlerts />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeatherDashboard;
