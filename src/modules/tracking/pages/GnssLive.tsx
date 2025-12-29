import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Satellite } from "lucide-react";
import { useGnssLogs } from "../hooks/useTrackingData";

export default function GnssLive() {
  const { data: logs, isLoading } = useGnssLogs(undefined, 20);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Satellite className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">GNSS Live Tracking</h1>
        <Badge variant="outline" className="ml-auto">Tempo Real</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mapa de Posições</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-2" />
                <p>Mapa GNSS em tempo real</p>
                <p className="text-sm">Integração com Mapbox ativa</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas Posições</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Carregando...</p>
            ) : logs && logs.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="text-sm p-2 border rounded">
                    <div className="flex justify-between">
                      <span>Lat: {log.latitude.toFixed(6)}</span>
                      <span>Lng: {log.longitude.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Precisão: {log.accuracy?.toFixed(1)}m</span>
                      <Badge variant="outline" className="text-xs">{log.fix_type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Sem dados de posição</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Qualidade do Sinal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Satélites</span>
                <Badge>{logs?.[0]?.satellites_used || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>HDOP</span>
                <Badge variant="outline">{logs?.[0]?.hdop?.toFixed(2) || 'N/A'}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Correção</span>
                <Badge variant="secondary">{logs?.[0]?.correction_source || 'GPS'}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
