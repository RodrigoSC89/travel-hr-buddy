import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, MapPin, Users } from "lucide-react";
import { EmergencyIncident } from "../emergency-response/types";

interface IncidentListProps {
  incidents: EmergencyIncident[];
  onSelectIncident: (incident: EmergencyIncident) => void;
}

export function IncidentList({ incidents, onSelectIncident }: IncidentListProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical": return "destructive";
    case "high": return "destructive";
    case "medium": return "secondary";
    case "low": return "default";
    default: return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "reported": return "secondary";
    case "active": return "default";
    case "responding": return "default";
    case "resolved": return "default";
    case "cancelled": return "secondary";
    default: return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Incidentes Ativos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {incidents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum incidente ativo
            </p>
          ) : (
            incidents.map((incident) => (
              <div
                key={incident.id}
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => onSelectIncident(incident)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{incident.title}</h4>
                  <div className="flex gap-2">
                    <Badge variant={getSeverityColor(incident.severity)}>
                      {incident.severity}
                    </Badge>
                    <Badge variant={getStatusColor(incident.status)}>
                      {incident.status}
                    </Badge>
                  </div>
                </div>
                
                {incident.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {incident.description}
                  </p>
                )}
                
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{incident.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{incident.personnelInvolved} pessoas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(incident.timestamp).toLocaleTimeString("pt-BR")}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
