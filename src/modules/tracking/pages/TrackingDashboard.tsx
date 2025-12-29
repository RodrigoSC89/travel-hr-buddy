/**
 * DGNSS Tracking Dashboard
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Satellite, MapPin, AlertTriangle, Activity, Radio, Navigation } from "lucide-react";
import { useTrackingStats, useGnssDevices, useGnssAlerts } from "../hooks/useTrackingData";

export default function TrackingDashboard() {
  const { data: stats } = useTrackingStats();
  const { data: devices } = useGnssDevices();
  const { data: alerts } = useGnssAlerts(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Satellite className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">DGNSS & Precision Tracking</h1>
          <p className="text-muted-foreground">Rastreamento GNSS de Alta Precisão</p>
        </div>
        <Badge variant="secondary" className="ml-auto">v3.2.0</Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dispositivos</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.onlineDevices || 0}/{stats?.totalDevices || 0}</div>
            <p className="text-xs text-muted-foreground">Online / Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Precisão Média</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgAccuracy?.toFixed(2) || '0.00'}m</div>
            <p className="text-xs text-muted-foreground">Últimas 100 leituras</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Pendentes de resolução</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="bg-green-500">Operacional</Badge>
            <p className="text-xs text-muted-foreground mt-1">DGPS/RTK Ativo</p>
          </CardContent>
        </Card>
      </div>

      {/* Devices List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Satellite className="h-5 w-5" />
            Dispositivos GNSS
          </CardTitle>
        </CardHeader>
        <CardContent>
          {devices && devices.length > 0 ? (
            <div className="space-y-2">
              {devices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${device.is_online ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div>
                      <p className="font-medium">{device.device_name}</p>
                      <p className="text-sm text-muted-foreground">{device.device_type.toUpperCase()} - {device.manufacturer || 'N/A'}</p>
                    </div>
                  </div>
                  <Badge variant={device.is_online ? "default" : "secondary"}>
                    {device.is_online ? "Online" : "Offline"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum dispositivo GNSS cadastrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
