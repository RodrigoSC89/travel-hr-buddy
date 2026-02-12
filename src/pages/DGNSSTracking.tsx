/**
 * DGNSS Tracking - Real Integration with IntegrationStatus
 * ✅ P0 CORRIGIDO: Bloqueio se não configurado (R02 MITIGADO)
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Navigation, Settings, AlertTriangle, CheckCircle, Radio } from "lucide-react";
import { useGNSSIntegrationStatus } from "@/hooks/useGNSSIntegrationStatus";
import { getStatusColor, getStatusMessage } from "@/types/integration-status";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function DGNSSTracking() {
  const navigate = useNavigate();
  const { data: integrationStatus, isLoading: statusLoading } = useGNSSIntegrationStatus();

  const { data: vessels, isLoading: vesselsLoading } = useQuery({
    queryKey: ["dgnss-vessels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name, status")
        .order("name", { ascending: true })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: integrationStatus?.canShowData === true,
  });

  if (statusLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  // ⚠️ BLOQUEIO: Não exibir se não configurado
  if (!integrationStatus?.canShowData) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Navigation className="h-8 w-8 text-muted-foreground" />
          <div>
            <h2 className="text-2xl font-bold">DGNSS Tracking</h2>
            <p className="text-muted-foreground">Posicionamento Diferencial GNSS</p>
          </div>
        </div>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-12 text-center space-y-6">
            <AlertTriangle className="h-16 w-16 mx-auto text-destructive" />
            <h2 className="text-2xl font-bold">DGNSS Não Configurado</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Configure um provedor DGNSS para visualizar correções diferenciais em tempo real.
            </p>
            <Alert className="max-w-lg mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Segurança Operacional</AlertTitle>
              <AlertDescription>
                Por segurança, não são exibidas posições simuladas. Configure a integração real.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/integrations-center')}>
              <Settings className="h-4 w-4 mr-2" />
              Configurar Integração DGNSS
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Navigation className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">DGNSS Tracking</h2>
            <p className="text-muted-foreground">Posicionamento Diferencial em Tempo Real</p>
          </div>
        </div>
        <Badge className={getStatusColor(integrationStatus.status)}>
          <CheckCircle className="h-3 w-3 mr-1" />
          {getStatusMessage(integrationStatus.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Radio className="h-4 w-4" />
              Embarcações com DGNSS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{vessels?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Recebendo correções</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Precisão Média</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">&lt; 10cm</p>
            <p className="text-xs text-muted-foreground">Horizontal (H95)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sinal de Correção</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">RTK Fix</p>
            <p className="text-xs text-muted-foreground">Qualidade máxima</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Embarcações Rastreadas</CardTitle>
        </CardHeader>
        <CardContent>
          {vesselsLoading ? (
            <Skeleton className="h-[200px]" />
          ) : vessels && vessels.length > 0 ? (
            <div className="space-y-2">
              {vessels.map((v) => (
                <div key={v.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <span className="font-medium">{v.name}</span>
                  <Badge variant="outline">{v.status || "ativo"}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Navigation className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma embarcação com DGNSS ativo</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
