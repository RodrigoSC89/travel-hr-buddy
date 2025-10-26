/**
 * PATCH 215.0 - Telemetry Dashboard 360 (Painel Cognitivo Operacional)
 * 
 * Unified dashboard showing global telemetry, AI decisions, simulations, 
 * alerts and AI evolution.
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Globe,
  Satellite,
  Brain,
  FlaskConical,
  AlertTriangle,
  Download,
  Play,
  Pause,
} from 'lucide-react';
import { satelliteSyncEngine } from '@/lib/satelliteSyncEngine';
import { missionSimulationCore } from '@/ai/missionSimulationCore';
import { neuralCopilot } from '@/assistants/neuralCopilot';
import { missionAutonomyEngine } from '@/ai/missionAutonomyEngine';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

interface TelemetryDashboard360Props {
  userId?: string;
}

export const TelemetryDashboard360: React.FC<TelemetryDashboard360Props> = ({ userId }) => {
  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [satelliteData, setSatelliteData] = useState<any[]>([]);
  const [simulations, setSimulations] = useState<any[]>([]);
  const [autonomyActions, setAutonomyActions] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<any[]>([]);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(false);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load weather data
      const weather = await satelliteSyncEngine.getLatestWeatherData();
      setWeatherData(weather.slice(0, 10));

      // Load satellite data
      const satellite = await satelliteSyncEngine.getLatestSatelliteData();
      setSatelliteData(satellite.slice(0, 10));

      // Load simulations
      const sims = await missionSimulationCore.listSimulations();
      setSimulations(sims.slice(0, 10));

      // Load autonomy actions
      const actions = await missionAutonomyEngine.getAuditLogs(20);
      setAutonomyActions(actions);

      // Get sync status
      const status = satelliteSyncEngine.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      logger.error('[TelemetryDashboard360] Failed to load data', { error });
    }
  };

  const toggleAutoSync = () => {
    if (isAutoSyncEnabled) {
      satelliteSyncEngine.stopAutoSync();
      setIsAutoSyncEnabled(false);
      toast.success('Auto-sync disabled');
    } else {
      satelliteSyncEngine.startAutoSync();
      setIsAutoSyncEnabled(true);
      toast.success('Auto-sync enabled');
    }
  };

  const exportToPDF = () => {
    toast.info('PDF export feature coming soon');
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'danger':
      case 'critical':
        return 'destructive';
      case 'warning':
      case 'high':
        return 'default';
      case 'caution':
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'executed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'error':
      case 'failed':
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8" />
            Telemetry Dashboard 360
          </h1>
          <p className="text-muted-foreground">
            Global operations monitoring and AI intelligence
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isAutoSyncEnabled ? 'default' : 'outline'}
            onClick={toggleAutoSync}
          >
            {isAutoSyncEnabled ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop Auto-Sync
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Auto-Sync
              </>
            )}
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Sync Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {syncStatus.map((status) => (
          <Card key={status.source}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                {status.source}
                <Badge variant={getStatusBadgeVariant(status.status)}>
                  {status.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{status.records_synced}</div>
              <p className="text-xs text-muted-foreground">records synced</p>
              {status.error_message && (
                <p className="text-xs text-destructive mt-1">{status.error_message}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="global-map" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="global-map">
            <Globe className="h-4 w-4 mr-2" />
            Global Map
          </TabsTrigger>
          <TabsTrigger value="ai-actions">
            <Brain className="h-4 w-4 mr-2" />
            AI Actions
          </TabsTrigger>
          <TabsTrigger value="simulations">
            <FlaskConical className="h-4 w-4 mr-2" />
            Simulations
          </TabsTrigger>
          <TabsTrigger value="satellite">
            <Satellite className="h-4 w-4 mr-2" />
            Satellite Data
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alerts
          </TabsTrigger>
        </TabsList>

        {/* Global Map Tab */}
        <TabsContent value="global-map" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Weather Feed */}
            <Card>
              <CardHeader>
                <CardTitle>Weather Conditions</CardTitle>
                <CardDescription>Real-time weather data from satellites</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {weatherData.map((weather) => (
                      <div
                        key={weather.id}
                        className="p-3 border rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">
                            {weather.location_name || 'Unknown Location'}
                          </div>
                          <Badge variant={getRiskBadgeVariant(weather.risk_level)}>
                            {weather.risk_level}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Temp:</span>{' '}
                            {weather.temperature}°C
                          </div>
                          <div>
                            <span className="text-muted-foreground">Wind:</span>{' '}
                            {weather.wind_speed} kt
                          </div>
                          <div>
                            <span className="text-muted-foreground">Visibility:</span>{' '}
                            {weather.visibility} m
                          </div>
                          <div>
                            <span className="text-muted-foreground">Source:</span>{' '}
                            {weather.source}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Lat: {weather.latitude}, Lon: {weather.longitude}
                        </div>
                      </div>
                    ))}
                    {weatherData.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        No weather data available
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Satellite Markers Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Satellite Positions</CardTitle>
                <CardDescription>Live satellite and vessel tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Globe className="h-12 w-12 mx-auto mb-2" />
                    <p>Map visualization coming soon</p>
                    <p className="text-sm">Integrate with Mapbox or Leaflet</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Actions Tab */}
        <TabsContent value="ai-actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Autonomy Actions</CardTitle>
              <CardDescription>Real-time AI decision making and approvals</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {autonomyActions.map((action) => (
                    <div
                      key={action.id}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{action.action_type}</div>
                        <div className="flex gap-2">
                          <Badge variant={getStatusBadgeVariant(action.status)}>
                            {action.status}
                          </Badge>
                          <Badge variant="outline">{action.decision_level}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {action.reasoning}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Confidence:</span>{' '}
                          {(action.confidence_score * 100).toFixed(0)}%
                        </div>
                        <div>
                          <span className="text-muted-foreground">Risk:</span>{' '}
                          {(action.risk_score * 100).toFixed(0)}%
                        </div>
                      </div>
                      {action.result && (
                        <div className="text-xs bg-muted p-2 rounded">
                          Result: {JSON.stringify(action.result)}
                        </div>
                      )}
                    </div>
                  ))}
                  {autonomyActions.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No autonomy actions recorded
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Simulations Tab */}
        <TabsContent value="simulations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mission Simulations</CardTitle>
              <CardDescription>Simulated missions and predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {simulations.map((sim) => (
                    <div
                      key={sim.id}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{sim.name}</div>
                        <Badge variant={getStatusBadgeVariant(sim.status)}>
                          {sim.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {sim.description}
                      </p>
                      {sim.predictions && (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Success Prob:</span>{' '}
                            {(sim.predictions.success_probability * 100).toFixed(0)}%
                          </div>
                          <div>
                            <span className="text-muted-foreground">Risk Score:</span>{' '}
                            {sim.predictions.risk_score.toFixed(1)}
                          </div>
                        </div>
                      )}
                      {sim.outcome && (
                        <div className="text-xs bg-muted p-2 rounded space-y-1">
                          <div>
                            Success: {sim.outcome.success ? 'Yes' : 'No'} (
                            {sim.outcome.completion_percentage}%)
                          </div>
                          <div>Incidents: {sim.outcome.incidents?.length || 0}</div>
                        </div>
                      )}
                    </div>
                  ))}
                  {simulations.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No simulations available
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Satellite Data Tab */}
        <TabsContent value="satellite" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Satellite Telemetry</CardTitle>
              <CardDescription>Raw satellite data feeds</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {satelliteData.map((data) => (
                    <div
                      key={data.id}
                      className="p-3 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{data.source}</div>
                        <Badge variant="outline">{data.data_type}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Lat: {data.latitude}, Lon: {data.longitude}
                      </div>
                      <div className="text-xs bg-muted p-2 rounded max-h-20 overflow-auto">
                        {JSON.stringify(data.normalized_data || data.raw_data, null, 2)}
                      </div>
                    </div>
                  ))}
                  {satelliteData.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No satellite data available
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Critical alerts and warnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
                <p>No active alerts</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
