import * as React from 'react';
import { Suspense, lazy } from 'react';
import { IoTSensorDashboard } from '@/components/iot/IoTSensorDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Cpu, Activity, Gauge, Loader2 } from 'lucide-react';

const IoTDashboardIntelligence = lazy(() => import('@/components/premium/IoTDashboardIntelligence'));

const IoTDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Cpu className="h-8 w-8 text-primary" />
              IoT Sensor Dashboard
            </h1>
            <p className="text-muted-foreground">Real-time vessel sensor monitoring and alerts</p>
          </div>
          <Badge variant="outline">ABS SMART Certified</Badge>
        </div>

        <Tabs defaultValue="intelligence" className="space-y-6">
          <TabsList>
            <TabsTrigger value="intelligence" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Intelligence
              <Badge variant="secondary" className="text-xs">ABS</Badge>
            </TabsTrigger>
            <TabsTrigger value="sensors" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Sensores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="intelligence">
            <Suspense fallback={
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Carregando IoT Intelligence...</span>
              </div>
            }>
              <IoTDashboardIntelligence />
            </Suspense>
          </TabsContent>

          <TabsContent value="sensors">
            <IoTSensorDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IoTDashboardPage;
