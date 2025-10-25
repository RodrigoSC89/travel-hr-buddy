import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Activity, Shield, Clock, Plus } from "lucide-react";
import { IncidentList } from "./components/IncidentList";
import { EmergencyContacts } from "./components/EmergencyContacts";
import { ResponseProtocol } from "./components/ResponseProtocol";
import { EmergencyIncident } from "./emergency-response/types";
import { EMERGENCY_CONTACTS } from "./emergency-response/config";

const EmergencyResponse = () => {
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(null);
  
  const mockIncidents: EmergencyIncident[] = [
    {
      id: "1",
      type: "medical",
      severity: "high",
      status: "active",
      title: "Emergência Médica a Bordo",
      description: "Tripulante com sintomas de apendicite aguda",
      location: "Deck Principal - Cabine 42",
      timestamp: new Date().toISOString(),
      reportedBy: "Enfermeiro Chefe",
      personnelInvolved: 1,
      responseTeams: ["Equipe Médica", "Capitão"],
    },
    {
      id: "2",
      type: "fire",
      severity: "critical",
      status: "responding",
      title: "Incêndio na Sala de Máquinas",
      description: "Princípio de incêndio detectado no compartimento de motores",
      location: "Sala de Máquinas - Seção B",
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      reportedBy: "Engenheiro de Plantão",
      personnelInvolved: 3,
      responseTeams: ["Brigada de Incêndio", "Equipe de Emergência"],
    },
  ];

  const protocolSteps = [
    {
      id: "1",
      title: "Avaliar a situação",
      description: "Identificar tipo e gravidade da emergência",
      completed: true,
      critical: true,
    },
    {
      id: "2",
      title: "Acionar equipe de resposta",
      description: "Notificar pessoal apropriado e autoridades",
      completed: true,
      critical: true,
    },
    {
      id: "3",
      title: "Iniciar protocolo de contenção",
      description: "Aplicar medidas de controle e mitigação",
      completed: false,
      critical: true,
    },
    {
      id: "4",
      title: "Evacuar área afetada",
      description: "Remover pessoal não essencial da zona de risco",
      completed: false,
      critical: true,
    },
    {
      id: "5",
      title: "Documentar ocorrência",
      description: "Registrar todos os eventos e ações tomadas",
      completed: false,
      critical: false,
    },
  ];

  const handleStepComplete = (stepId: string) => {
    console.log("Step completed:", stepId);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <h1 className="text-3xl font-bold">Resposta a Emergências</h1>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Incidente
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Incidentes Ativos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Requerem atenção imediata</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3m 45s</div>
            <p className="text-xs text-muted-foreground">Média nas últimas 24h</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Equipes Mobilizadas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Em operação agora</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">Operacional</div>
            <p className="text-xs text-muted-foreground">Todos os sistemas ativos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <IncidentList 
            incidents={mockIncidents}
            onSelectIncident={setSelectedIncident}
          />
          <EmergencyContacts contacts={EMERGENCY_CONTACTS} />
        </div>
        
        <div>
          <ResponseProtocol
            emergencyType="Emergência Médica"
            steps={protocolSteps}
            onStepComplete={handleStepComplete}
          />
        </div>
      </div>
    </div>
  );
};

export default EmergencyResponse;
