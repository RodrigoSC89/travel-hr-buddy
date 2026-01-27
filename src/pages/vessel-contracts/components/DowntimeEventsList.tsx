/**
 * DowntimeEventsList - Extracted from VesselContractsV2
 * Displays list of downtime events with actions
 */

import { CardV2 } from "@/components/v2";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, Brain, FileCheck, Plus } from "lucide-react";
import type { DowntimeEvent } from "../hooks/useContractsData";

interface DowntimeEventsListProps {
  events: DowntimeEvent[];
  isAnalyzing: boolean;
  onOpenForm: () => void;
  onGenerateBROA: (eventId: string) => void;
  onAnalyze: (eventId: string) => void;
}

export function DowntimeEventsList({
  events,
  isAnalyzing,
  onOpenForm,
  onGenerateBROA,
  onAnalyze
}: DowntimeEventsListProps) {
  return (
    <CardV2
      icon={Clock}
      title="Eventos de Downtime"
      description="Registros de paradas e indisponibilidades"
      gradient="orange"
      action={{
        label: "Registrar Downtime",
        icon: Plus,
        onClick: onOpenForm
      }}
    >
      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum evento de downtime registrado
          </div>
        ) : (
          events.slice(0, 5).map((event) => (
            <div key={event.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${event.impact_level === 'critical' ? 'bg-red-500/20' : 'bg-orange-500/20'}`}>
                  <AlertTriangle className={`h-5 w-5 ${event.impact_level === 'critical' ? 'text-red-500' : 'text-orange-500'}`} />
                </div>
                <div>
                  <p className="font-medium">{event.reason || 'Sem motivo especificado'}</p>
                  <p className="text-sm text-muted-foreground">
                    {event.duration_hours ? `${event.duration_hours}h de duração` : 'Duração não informada'} • {new Date(event.start_time).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onGenerateBROA(event.id)} disabled={isAnalyzing}>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Gerar BROA
                </Button>
                <Button variant="outline" size="sm" onClick={() => onAnalyze(event.id)}>
                  <Brain className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </CardV2>
  );
}
