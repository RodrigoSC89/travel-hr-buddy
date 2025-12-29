import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { useGnssAlerts, useResolveAlert } from "../hooks/useTrackingData";
import { toast } from "sonner";

export default function TrackingAlerts() {
  const { data: alerts, isLoading } = useGnssAlerts(false);
  const resolveAlert = useResolveAlert();

  const handleResolve = async (id: string) => {
    try {
      await resolveAlert.mutateAsync(id);
      toast.success("Alerta resolvido");
    } catch {
      toast.error("Erro ao resolver alerta");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-orange-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-8 w-8 text-orange-500" />
        <h1 className="text-3xl font-bold">Alertas GNSS</h1>
        <Badge variant="outline" className="ml-auto">{alerts?.length || 0} ativos</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alertas Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Carregando...</p>
          ) : alerts && alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                    <div>
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.created_at || '').toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleResolve(alert.id)}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Resolver
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>Nenhum alerta ativo</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
