/**
 * GNSS Live Tracking
 * ✅ P0 CORRIGIDO: Status de integração + bloqueio se não configurado (R02 MITIGADO)
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, Satellite, Navigation, Signal, 
  Activity, Eye, Map, Target,
  AlertTriangle, Settings, WifiOff, CheckCircle
} from "lucide-react";
import { useGNSSIntegrationStatus } from "@/hooks/useGNSSIntegrationStatus";
import { getStatusColor, getStatusMessage } from "@/types/integration-status";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface VesselPosition {
  id: string;
  name: string;
  status: string;
}

export default function GnssLive() {
  const navigate = useNavigate();
  const { data: integrationStatus, isLoading: statusLoading } = useGNSSIntegrationStatus();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedVessel, setSelectedVessel] = useState<VesselPosition | null>(null);

  const { data: vessels, isLoading: vesselsLoading } = useQuery({
    queryKey: ["gnss-vessels"],
    queryFn: async (): Promise<VesselPosition[]> => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name, status")
        .order("name", { ascending: true })
        .limit(10);

      if (error) throw error;
      return (data || []).map(v => ({
        id: v.id,
        name: v.name || "Embarcação",
        status: v.status || "unknown",
      }));
    },
    enabled: integrationStatus?.canShowData === true,
    refetchInterval: 5000,
  });

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (statusLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  // ⚠️ BLOQUEIO: Não exibir se não configurado
  if (!integrationStatus?.canShowData) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-muted rounded-xl">
            <Navigation className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">GNSS Live Tracking</h1>
            <p className="text-muted-foreground">Posicionamento em Tempo Real</p>
          </div>
        </div>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-12 text-center space-y-6">
            <AlertTriangle className="h-16 w-16 mx-auto text-destructive" />
            <h2 className="text-2xl font-bold">GNSS Não Configurado</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Configure um provedor GNSS para visualizar posições em tempo real.
            </p>
            <Alert className="max-w-lg mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Importante</AlertTitle>
              <AlertDescription>
                Por segurança, não são exibidas posições simuladas.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/integrations-center')}>
              <Settings className="h-4 w-4 mr-2" />
              Configurar Integração
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-xl">
            <Navigation className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">GNSS Live Tracking</h1>
            <p className="text-muted-foreground">Posicionamento em Tempo Real</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(integrationStatus.status)}>
            <CheckCircle className="h-3 w-3 mr-1" />
            {getStatusMessage(integrationStatus.status)}
          </Badge>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm">{currentTime.toLocaleTimeString('pt-BR')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Embarcações Rastreadas
              <Badge variant="outline">Dados Reais</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] rounded-lg border bg-muted/30 flex items-center justify-center">
              {selectedVessel ? (
                <div className="text-center space-y-4">
                  <MapPin className="h-16 w-16 mx-auto text-primary" />
                  <p className="font-bold text-xl">{selectedVessel.name}</p>
                  <Badge>{selectedVessel.status}</Badge>
                </div>
              ) : (
                <div className="text-center">
                  <Satellite className="h-16 w-16 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground mt-2">Selecione uma embarcação</p>
                </div>
              )}
            </div>
            {vessels && vessels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {vessels.map((v) => (
                  <Button
                    key={v.id}
                    size="sm"
                    variant={selectedVessel?.id === v.id ? "default" : "outline"}
                    onClick={() => setSelectedVessel(v)}
                  >
                    {v.name}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Signal className="h-5 w-5" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Integração</span>
                <Badge className={getStatusColor(integrationStatus.status)}>
                  {getStatusMessage(integrationStatus.status)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Embarcações</span>
                <Badge variant="secondary">{vessels?.length || 0}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Últimas Atualizações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vessels && vessels.length > 0 ? (
                <div className="space-y-2">
                  {vessels.slice(0, 5).map((v) => (
                    <div key={v.id} className="flex justify-between p-2 rounded border text-sm">
                      <span>{v.name}</span>
                      <Badge variant="outline">{v.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Aguardando dados...
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
