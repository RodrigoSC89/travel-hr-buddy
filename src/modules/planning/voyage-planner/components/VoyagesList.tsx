import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ship, MapPin, Clock, Fuel, AlertTriangle, Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { VoyageRoute } from "../types";

interface VoyagesListProps {
  voyages: VoyageRoute[];
  onViewDetails: (voyage: VoyageRoute) => void;
  onDelete: (id: string) => void;
}

const VoyagesList: React.FC<VoyagesListProps> = ({ voyages, onViewDetails, onDelete }) => {
  const getStatusBadge = (status: VoyageRoute["status"]) => {
    const styles = {
      planned: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      active: "bg-green-500/10 text-green-500 border-green-500/20",
      completed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    const labels = {
      planned: "Planejada",
      active: "Em Andamento",
      completed: "Concluída",
      cancelled: "Cancelada",
    };
    return <Badge variant="outline" className={styles[status]}>{labels[status]}</Badge>;
  };

  const getRiskBadge = (risk: VoyageRoute["weatherRisk"]) => {
    const styles = {
      low: "bg-green-500/10 text-green-500",
      medium: "bg-yellow-500/10 text-yellow-500",
      high: "bg-red-500/10 text-red-500",
    };
    const labels = { low: "Baixo", medium: "Médio", high: "Alto" };
    return (
      <Badge variant="outline" className={styles[risk]}>
        <AlertTriangle className="w-3 h-3 mr-1" />
        {labels[risk]}
      </Badge>
    );
  };

  if (voyages.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Ship className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma viagem encontrada</p>
          <p className="text-sm">Crie uma nova viagem para começar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {voyages.map((voyage) => (
        <Card key={voyage.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-semibold">{voyage.name}</h3>
                  {getStatusBadge(voyage.status)}
                  {getRiskBadge(voyage.weatherRisk)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Ship className="w-4 h-4" />
                    <span>{voyage.vesselName || "Não atribuído"}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{voyage.distanceNm.toLocaleString()} NM</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{voyage.estimatedDays} dias</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Fuel className="w-4 h-4" />
                    <span>{voyage.fuelConsumption.toLocaleString()} ton</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {voyage.departureDate && (
                    <span>
                      Saída: {format(new Date(voyage.departureDate), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  )}
                  {voyage.arrivalDate && (
                    <span>
                      Chegada: {format(new Date(voyage.arrivalDate), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleonViewDetails}>
                  <Eye className="w-4 h-4 mr-1" />
                  Detalhes
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleonDelete}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

export default VoyagesList;
