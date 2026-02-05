/**
 * Tracking Mega-Hub - Rastreamento & Telemetria
 * Rota canônica: /tracking
 * 
 * Consolida: Tracking & Telemetry + AIS + SATCOM + Weather Intelligence
 */

import React, { Suspense, lazy } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Satellite, Activity, Ship, Radio, Cloud, AlertTriangle, Map } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load sub-components
const TrackingTelemetryHub = lazy(() => import('@/pages/TrackingTelemetryPremium'));
const RealTimeTrackingPage = lazy(() => import('@/pages/tracking/RealTimeTrackingPage'));
const AISTrackerPage = lazy(() => import('@/pages/AISTrackerPage'));
const SatcomDashboardEnhanced = lazy(() => import('@/pages/SatcomDashboardEnhanced'));
const WeatherIntelligencePage = lazy(() => import('@/pages/advanced/WeatherIntelligencePage'));
const AlertsCommandCenter = lazy(() => import('@/pages/AlertsCommandCenter'));
const PredictiveTelemetry = lazy(() => import('@/pages/PredictiveTelemetry'));

const LoadingSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
    <Skeleton className="h-64" />
  </div>
);

const tabConfig = [
  { id: 'overview', label: 'Overview', icon: Satellite },
  { id: 'realtime', label: 'Real-time', icon: Activity },
  { id: 'ais', label: 'AIS Fleet', icon: Ship },
  { id: 'satcom', label: 'SATCOM', icon: Radio },
  { id: 'weather', label: 'Weather AI', icon: Cloud },
  { id: 'predictive', label: 'Predictive', icon: Map },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
];

export default function TrackingMegaHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Satellite className="h-6 w-6 text-cyan-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Tracking Hub</h1>
                <p className="text-sm text-muted-foreground">Rastreamento & Telemetria</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20">
              MEGA-HUB E
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-[73px] z-10">
          <div className="container">
            <TabsList className="h-12 bg-transparent gap-2 justify-start overflow-x-auto">
              {tabConfig.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white gap-2"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="container py-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <TabsContent value="overview" className="mt-0">
              <TrackingTelemetryHub />
            </TabsContent>
            
            <TabsContent value="realtime" className="mt-0">
              <RealTimeTrackingPage />
            </TabsContent>
            
            <TabsContent value="ais" className="mt-0">
              <AISTrackerPage />
            </TabsContent>
            
            <TabsContent value="satcom" className="mt-0">
              <SatcomDashboardEnhanced />
            </TabsContent>
            
            <TabsContent value="weather" className="mt-0">
              <WeatherIntelligencePage />
            </TabsContent>
            
            <TabsContent value="predictive" className="mt-0">
              <PredictiveTelemetry />
            </TabsContent>
            
            <TabsContent value="alerts" className="mt-0">
              <AlertsCommandCenter />
            </TabsContent>
          </Suspense>
        </div>
      </Tabs>
    </div>
  );
}
