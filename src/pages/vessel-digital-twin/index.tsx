/**
 * Vessel Digital Twin - Main Dashboard
 * Core module of Nauti One v4.0
 */

import React, { useState, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Ship, 
  Settings, 
  Wrench, 
  FileText, 
  Map as MapIcon, 
  History,
  Gauge,
  Bot,
  QrCode,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useVesselDigitalTwin } from '@/hooks/use-vessel-digital-twin';

// Lazy load heavy components
const VesselOverview = React.lazy(() => import('./VesselOverview'));
const PartsExplorer = React.lazy(() => import('./PartsExplorer'));
const ManualsLibrary = React.lazy(() => import('./ManualsLibrary'));
const PlansViewer = React.lazy(() => import('./PlansViewer'));
const VesselTimeline = React.lazy(() => import('./VesselTimeline'));
const SensorsDashboard = React.lazy(() => import('./SensorsDashboard'));
const VesselAIAssistant = React.lazy(() => import('./VesselAIAssistant'));
const Viewer3D = React.lazy(() => import('./Viewer3D'));

const TabSkeleton = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-64 w-full" />
  </div>
);

export default function VesselDigitalTwinPage() {
  const { vesselId } = useParams<{ vesselId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { 
    vessel, 
    specifications, 
    partsCount,
    manualsCount,
    sensorsCount,
    alertsCount,
    isLoading 
  } = useVesselDigitalTwin(vesselId);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!vessel) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center">
            <Ship className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Embarcação não encontrada</h2>
            <p className="text-muted-foreground">
              Selecione uma embarcação válida para visualizar o Digital Twin
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <Ship className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{vessel.name}</h1>
            <p className="text-muted-foreground">
              {vessel.vessel_type} • IMO: {vessel.imo_number || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={vessel.status === 'active' ? 'default' : 'secondary'}>
            {vessel.status === 'active' ? (
              <><CheckCircle className="h-3 w-3 mr-1" /> Operacional</>
            ) : (
              <><Clock className="h-3 w-3 mr-1" /> {vessel.status}</>
            )}
          </Badge>
          <Button variant="outline" size="sm">
            <QrCode className="h-4 w-4 mr-2" />
            QR Codes
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Partes</p>
                <p className="text-2xl font-bold">{partsCount}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Manuais</p>
                <p className="text-2xl font-bold">{manualsCount}</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sensores</p>
                <p className="text-2xl font-bold">{sensorsCount}</p>
              </div>
              <Gauge className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas</p>
                <p className="text-2xl font-bold">{alertsCount}</p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${alertsCount > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2 h-auto p-1">
          <TabsTrigger value="overview" className="gap-2">
            <Ship className="h-4 w-4" />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="3d" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">3D Model</span>
          </TabsTrigger>
          <TabsTrigger value="parts" className="gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Partes</span>
          </TabsTrigger>
          <TabsTrigger value="manuals" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Manuais</span>
          </TabsTrigger>
          <TabsTrigger value="plans" className="gap-2">
            <MapIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Planos</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Histórico</span>
          </TabsTrigger>
          <TabsTrigger value="sensors" className="gap-2">
            <Gauge className="h-4 w-4" />
            <span className="hidden sm:inline">Sensores</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">IA</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Suspense fallback={<TabSkeleton />}>
            <VesselOverview vessel={vessel} specifications={specifications ?? null} />
          </Suspense>
        </TabsContent>

        <TabsContent value="3d">
          <Suspense fallback={<TabSkeleton />}>
            <Viewer3D vesselId={vesselId!} />
          </Suspense>
        </TabsContent>

        <TabsContent value="parts">
          <Suspense fallback={<TabSkeleton />}>
            <PartsExplorer vesselId={vesselId!} />
          </Suspense>
        </TabsContent>

        <TabsContent value="manuals">
          <Suspense fallback={<TabSkeleton />}>
            <ManualsLibrary vesselId={vesselId!} />
          </Suspense>
        </TabsContent>

        <TabsContent value="plans">
          <Suspense fallback={<TabSkeleton />}>
            <PlansViewer vesselId={vesselId!} />
          </Suspense>
        </TabsContent>

        <TabsContent value="history">
          <Suspense fallback={<TabSkeleton />}>
            <VesselTimeline vesselId={vesselId!} />
          </Suspense>
        </TabsContent>

        <TabsContent value="sensors">
          <Suspense fallback={<TabSkeleton />}>
            <SensorsDashboard vesselId={vesselId!} />
          </Suspense>
        </TabsContent>

        <TabsContent value="ai">
          <Suspense fallback={<TabSkeleton />}>
            <VesselAIAssistant vesselId={vesselId!} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
