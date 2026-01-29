/**
 * IoT Integration Hub Page
 * Central de Integração IoT - Referência Mundial
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cpu, FileText, Activity, Brain, Wifi, Sparkles } from 'lucide-react';
import { IoTSensorDashboard } from '@/components/iot/IoTSensorDashboard';
import { IoTNoonReportPanel } from '@/components/iot/IoTNoonReportPanel';

const IoTIntegrationPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Wifi className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Central IoT</h1>
            <p className="text-muted-foreground">
              Integração de sensores em tempo real com auto-preenchimento de relatórios
            </p>
          </div>
        </div>
        <Badge className="bg-gradient-to-r from-primary to-primary/70 text-primary-foreground px-4 py-1">
          <Sparkles className="h-3 w-3 mr-1" />
          EXCLUSIVO NAUTI ONE
        </Badge>
      </div>

      {/* Features Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sensores Suportados</p>
                <p className="text-xl font-bold">12+</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <FileText className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Auto-Fill Noon Report</p>
                <p className="text-xl font-bold">INÉDITO</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Activity className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Detecção Anomalias</p>
                <p className="text-xl font-bold">ML Real-time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-sky-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-500/20">
                <Brain className="h-5 w-5 text-sky-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Previsão Preditiva</p>
                <p className="text-xl font-bold">EWMA + Z-Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="sensors" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="sensors" className="gap-2">
            <Cpu className="h-4 w-4" />
            Sensores em Tempo Real
          </TabsTrigger>
          <TabsTrigger value="noonreport" className="gap-2">
            <FileText className="h-4 w-4" />
            Noon Report Auto-Fill
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sensors">
          <IoTSensorDashboard />
        </TabsContent>

        <TabsContent value="noonreport">
          <IoTNoonReportPanel />
        </TabsContent>
      </Tabs>

      {/* Info Footer */}
      <Card className="bg-gradient-to-r from-muted/50 to-transparent border-dashed">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Tecnologias Integradas</h4>
              <p className="text-sm text-muted-foreground">
                MQTT • Supabase Realtime • EWMA Analytics • Z-Score Anomaly Detection
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">NMEA 2000</Badge>
              <Badge variant="outline">ModBus</Badge>
              <Badge variant="outline">OPC-UA</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IoTIntegrationPage;
