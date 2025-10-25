import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Satellite, Signal, MapPin, Activity } from "lucide-react";
import { SatelliteStatus } from "./components/SatelliteStatus";
import { CoverageMap } from "./components/CoverageMap";

const SatelliteTracker = () => {
  const satelliteData = [
    {
      id: "sat-1",
      name: "Inmarsat-5 F4",
      status: 'active' as const,
      signalStrength: 92,
      battery: 87,
      temperature: 22,
      lastContact: new Date().toISOString(),
    },
    {
      id: "sat-2",
      name: "Iridium NEXT 124",
      status: 'active' as const,
      signalStrength: 85,
      battery: 91,
      temperature: 21,
      lastContact: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    {
      id: "sat-3",
      name: "Globalstar M093",
      status: 'standby' as const,
      signalStrength: 45,
      battery: 68,
      temperature: 24,
      lastContact: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    {
      id: "sat-4",
      name: "Thuraya 3",
      status: 'offline' as const,
      signalStrength: 0,
      battery: 52,
      temperature: 26,
      lastContact: new Date(Date.now() - 120 * 60000).toISOString(),
    },
  ];

  const coverageData = [
    {
      region: "Atlântico Norte",
      coverage: 95,
      satellites: 3,
      quality: 'excellent' as const,
    },
    {
      region: "Atlântico Sul",
      coverage: 88,
      satellites: 2,
      quality: 'good' as const,
    },
    {
      region: "Pacífico",
      coverage: 72,
      satellites: 2,
      quality: 'fair' as const,
    },
    {
      region: "Índico",
      coverage: 45,
      satellites: 1,
      quality: 'poor' as const,
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Satellite className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Rastreador de Satélites</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Satélites Ativos</CardTitle>
            <Satellite className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">De 4 disponíveis</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Força do Sinal</CardTitle>
            <Signal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88%</div>
            <p className="text-xs text-muted-foreground">Média geral</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cobertura Global</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground">Todas as regiões</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.2%</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      <SatelliteStatus satellites={satelliteData} />

      <CoverageMap coverageData={coverageData} />
    </div>
  );
};

export default SatelliteTracker;
