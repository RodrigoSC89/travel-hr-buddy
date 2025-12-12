import { useState } from "react";;;
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Map, Navigation, AlertTriangle, CheckCircle2, RefreshCw,
  Download, Upload, Settings, Monitor, Database, Calendar,
  Ship, Wifi, WifiOff
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

interface ECDISData {
  id: string;
  vessel_id: string;
  ecdis_manufacturer: string;
  ecdis_model: string;
  software_version: string;
  enc_permit_status: string;
  enc_cells_installed: number;
  last_update_date: string;
  next_update_due: string;
  routes: any[];
  chart_folios: string[];
  backup_arrangements: string;
  type_approval_number: string;
  last_sync_at: string;
}

const permitStatusConfig: Record<string, { color: string; label: string }> = {
  valid: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", label: "Válido" },
  expiring: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", label: "Expirando" },
  expired: { color: "bg-destructive/20 text-destructive border-destructive/30", label: "Expirado" },
};

const manufacturers = [
  { name: "Furuno", models: ["FMD-3200", "FMD-3300"] },
  { name: "JRC", models: ["JAN-901B", "JAN-9201"] },
  { name: "Kongsberg", models: ["K-Bridge ECDIS", "K-Bridge Integrated"] },
  { name: "Transas", models: ["Navi-Sailor 4000", "Navi-Planner"] },
  { name: "Raytheon Anschütz", models: ["Synapsis ECDIS", "NautoPilot"] },
  { name: "Sperry Marine", models: ["VisionMaster FT", "VisionMaster"] },
];

export function ECDISIntegration() {
  const [selectedVessel, setSelectedVessel] = useState<string>("all");

  const { data: ecdisData = [], isLoading } = useQuery({
    queryKey: ["ecdis-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ecdis_data")
        .select("*")
        .order("last_update_date", { ascending: false });
      if (error) throw error;
      return data as ECDISData[];
    },
  });

  // Stats
  const stats = {
    total: ecdisData.length,
    valid: ecdisData.filter(e => e.enc_permit_status === "valid").length,
    expiring: ecdisData.filter(e => e.enc_permit_status === "expiring").length,
    expired: ecdisData.filter(e => e.enc_permit_status === "expired").length,
    totalCells: ecdisData.reduce((sum, e) => sum + (e.enc_cells_installed || 0), 0),
  };

  const complianceRate = stats.total > 0 
    ? ((stats.valid / stats.total) * 100).toFixed(0)
    : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Map className="h-6 w-6 text-primary" />
            ECDIS Integration Gateway
          </h2>
          <p className="text-muted-foreground mt-1">
            Integração com sistemas ECDIS, cartas eletrônicas e rotas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sincronizar
          </Button>
          <Button className="gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-border/50 bg-gradient-to-br from-primary/20 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Monitor className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sistemas ECDIS</p>
                <p className="text-xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Válidos</p>
                <p className="text-xl font-bold text-emerald-400">{stats.valid}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expirando</p>
                <p className="text-xl font-bold text-amber-400">{stats.expiring}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expirados</p>
                <p className="text-xl font-bold text-destructive">{stats.expired}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Database className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Células ENC</p>
                <p className="text-xl font-bold text-blue-400">{stats.totalCells}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Overview */}
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Conformidade de Cartas ENC</p>
              <div className="flex items-end gap-2">
                <span className={cn(
                  "text-5xl font-bold",
                  Number(complianceRate) >= 90 ? "text-emerald-400" :
                    Number(complianceRate) >= 70 ? "text-amber-400" : "text-destructive"
                )}>
                  {complianceRate}%
                </span>
                <span className="text-muted-foreground mb-2">embarcações com ENC válido</span>
              </div>
              <Progress value={Number(complianceRate)} className="h-3 mt-3" />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <Ship className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Embarcações</p>
              </div>
              <div className="text-center">
                <Navigation className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-foreground">
                  {ecdisData.reduce((sum, e) => sum + (e.routes?.length || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Rotas Ativas</p>
              </div>
              <div className="text-center">
                <Database className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-foreground">{stats.totalCells}</p>
                <p className="text-xs text-muted-foreground">Células ENC</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supported Manufacturers */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            Fabricantes Suportados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {manufacturers.map((manufacturer) => (
              <div 
                key={manufacturer.name}
                className="p-4 rounded-lg bg-muted/30 border border-border/50 text-center hover:border-primary/50 transition-colors cursor-pointer"
              >
                <p className="font-medium text-foreground mb-1">{manufacturer.name}</p>
                <p className="text-xs text-muted-foreground">
                  {manufacturer.models.length} modelos
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ECDIS Systems List */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Sistemas ECDIS por Embarcação
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : ecdisData.length === 0 ? (
            <div className="text-center py-12">
              <Map className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum sistema ECDIS configurado</p>
              <Button variant="link" className="mt-2">
                <Settings className="h-4 w-4 mr-1" />
                Configurar ECDIS
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {ecdisData.map((ecdis) => {
                const daysUntilUpdate = ecdis.next_update_due 
                  ? differenceInDays(new Date(ecdis.next_update_due), new Date())
                  : null;
                const config = permitStatusConfig[ecdis.enc_permit_status];
                const isOnline = ecdis.last_sync_at && 
                  differenceInDays(new Date(), new Date(ecdis.last_sync_at)) < 1;

                return (
                  <div 
                    key={ecdis.id}
                    className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          isOnline ? "bg-emerald-500/10" : "bg-muted"
                        )}>
                          {isOnline ? (
                            <Wifi className="h-5 w-5 text-emerald-400" />
                          ) : (
                            <WifiOff className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">
                            {ecdis.ecdis_manufacturer} {ecdis.ecdis_model}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            v{ecdis.software_version} • {ecdis.type_approval_number}
                          </p>
                        </div>
                      </div>
                      <Badge className={cn("border", config?.color)}>
                        {config?.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Células ENC</p>
                        <p className="font-medium text-foreground">{ecdis.enc_cells_installed}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Última Atualização</p>
                        <p className="font-medium text-foreground">
                          {ecdis.last_update_date 
                            ? format(new Date(ecdis.last_update_date), "dd/MM/yyyy")
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Próxima Atualização</p>
                        <p className={cn(
                          "font-medium",
                          daysUntilUpdate && daysUntilUpdate <= 7 ? "text-destructive" :
                            daysUntilUpdate && daysUntilUpdate <= 30 ? "text-amber-400" : "text-foreground"
                        )}>
                          {ecdis.next_update_due 
                            ? format(new Date(ecdis.next_update_due), "dd/MM/yyyy")
                            : "N/A"}
                          {daysUntilUpdate !== null && daysUntilUpdate > 0 && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({daysUntilUpdate}d)
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rotas</p>
                        <p className="font-medium text-foreground">{ecdis.routes?.length || 0}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="gap-1">
                        <Download className="h-3.5 w-3.5" />
                        Baixar Rotas
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Upload className="h-3.5 w-3.5" />
                        Enviar Atualização
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Sincronizar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
