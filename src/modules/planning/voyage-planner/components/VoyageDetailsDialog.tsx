import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Ship, MapPin, Clock, Fuel, Calendar, AlertTriangle, Anchor } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { VoyageRoute } from "../types";

interface VoyageDetailsDialogProps {
  voyage: VoyageRoute | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VoyageDetailsDialog: React.FC<VoyageDetailsDialogProps> = ({
  voyage,
  open,
  onOpenChange,
}) => {
  if (!voyage) return null;

  const getStatusBadge = (status: VoyageRoute["status"]) => {
    const styles = {
      planned: "bg-blue-500/10 text-blue-500",
      active: "bg-green-500/10 text-green-500",
      completed: "bg-gray-500/10 text-gray-500",
      cancelled: "bg-red-500/10 text-red-500",
    };
    const labels = {
      planned: "Planejada",
      active: "Em Andamento",
      completed: "Concluída",
      cancelled: "Cancelada",
    };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  });

  const getRiskBadge = (risk: VoyageRoute["weatherRisk"]) => {
    const styles = {
      low: "bg-green-500/10 text-green-500",
      medium: "bg-yellow-500/10 text-yellow-500",
      high: "bg-red-500/10 text-red-500",
    };
    const labels = { low: "Baixo Risco", medium: "Médio Risco", high: "Alto Risco" };
    return (
      <Badge className={styles[risk]}>
        <AlertTriangle className="w-3 h-3 mr-1" />
        {labels[risk]}
      </Badge>
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ship className="w-5 h-5" />
            {voyage.name}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {getStatusBadge(voyage.status)}
            {getRiskBadge(voyage.weatherRisk)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Route Information */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Rota
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Origem</p>
                <p className="font-medium">{voyage.origin.name}</p>
                <p className="text-sm text-muted-foreground">
                  {voyage.origin.country} ({voyage.origin.code})
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Destino</p>
                <p className="font-medium">{voyage.destination.name}</p>
                <p className="text-sm text-muted-foreground">
                  {voyage.destination.country} ({voyage.destination.code})
                </p>
              </div>
            </div>

            {voyage.waypoints.length > 0 && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">Escalas</p>
                <div className="flex flex-wrap gap-2">
                  {voyage.waypoints.map((wp) => (
                    <Badge key={wp.id} variant="outline">
                      <Anchor className="w-3 h-3 mr-1" />
                      {wp.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Vessel & Schedule */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Ship className="w-4 h-4" />
                Embarcação
              </h4>
              <p>{voyage.vesselName || "Não atribuída"}</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Cronograma
              </h4>
              <div className="space-y-1 text-sm">
                {voyage.departureDate && (
                  <p>
                    Partida: {format(new Date(voyage.departureDate), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                )}
                {voyage.arrivalDate && (
                  <p>
                    Chegada: {format(new Date(voyage.arrivalDate), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <MapPin className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{voyage.distanceNm.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Milhas Náuticas</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{voyage.estimatedDays}</p>
              <p className="text-sm text-muted-foreground">Dias Estimados</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <Fuel className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{voyage.fuelConsumption.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Toneladas Combustível</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoyageDetailsDialog;
