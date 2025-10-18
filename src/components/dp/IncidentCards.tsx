"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlanStatusSelect } from "./PlanStatusSelect";
import { DPIncident, RISK_LEVEL_COLORS, SGSORiskLevel } from "@/types/incident";

interface Incident {
  id: string;
  title: string;
  date: string;
  vessel: string;
  location: string;
  class_dp: string;
  rootCause: string;
  tags: string[];
  summary: string;
  link: string;
  plan_of_action?: string;
  plan_status?: string;
  plan_sent_to?: string;
  plan_sent_at?: string;
  plan_updated_at?: string;
  sgso_category?: string;
  sgso_root_cause?: string;
  sgso_risk_level?: SGSORiskLevel;
}

export default function IncidentCards() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    fetch("/api/dp/intel/feed")
      .then(res => res.json())
      .then(data => setIncidents(data.incidents))
      .catch(err => {
        console.error("Erro ao carregar incidentes DP", err);
        // Demo data for testing when API is not available
        setIncidents([
          {
            id: "1",
            title: "Perda de posição durante operação de perfuração",
            date: "2024-09-15",
            vessel: "Drillship Alpha",
            location: "Golfo do México",
            class_dp: "DP3",
            rootCause: "Falha no sistema de propulsão",
            tags: ["Propulsion", "Critical", "Weather"],
            summary: "Embarcação perdeu posicionamento durante operação crítica devido a falha no sistema de propulsão principal combinado com condições meteorológicas adversas.",
            link: "https://www.imca-int.com/incident-reports"
          },
          {
            id: "2",
            title: "Falha de redundância em sistema DP2",
            date: "2024-08-22",
            vessel: "Platform Support Vessel Beta",
            location: "Mar do Norte",
            class_dp: "DP2",
            rootCause: "Erro de configuração",
            tags: ["Configuration", "Redundancy", "High"],
            summary: "Sistema de redundância não operou conforme esperado durante teste anual, revelando erro de configuração não detectado anteriormente.",
            link: "https://www.imca-int.com/incident-reports"
          },
          {
            id: "3",
            title: "Perda temporária de referência de posição",
            date: "2024-07-10",
            vessel: "Construction Vessel Gamma",
            location: "Bacia de Campos",
            class_dp: "DP2",
            rootCause: "Interferência eletromagnética",
            tags: ["Sensors", "Medium", "EMI"],
            summary: "Sistema perdeu referência de posição por 45 segundos devido a interferência eletromagnética de equipamento de soldagem submarino.",
            link: "https://www.imca-int.com/incident-reports"
          },
          {
            id: "4",
            title: "Falha em teste de FMEA",
            date: "2024-06-05",
            vessel: "Anchor Handling Vessel Delta",
            location: "Mar Cáspio",
            class_dp: "DP1",
            rootCause: "Procedimento inadequado",
            tags: ["Testing", "FMEA", "Low"],
            summary: "Teste de análise de modos de falha revelou lacunas em procedimentos operacionais e necessidade de treinamento adicional.",
            link: "https://www.imca-int.com/incident-reports",
            sgso_category: "Não conformidade com procedimento",
            sgso_root_cause: "Lacunas em procedimentos operacionais",
            sgso_risk_level: "baixo"
          }
        ]);
      });
  }, []);

  const handleStatusUpdate = (incidentId: string, newStatus: string) => {
    // Update the local state with the new status
    setIncidents(prevIncidents => 
      prevIncidents.map(inc => 
        inc.id === incidentId 
          ? { ...inc, plan_status: newStatus, plan_updated_at: new Date().toISOString() }
          : inc
      )
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {incidents.map((incident) => (
        <Card key={incident.id} className="border-l-4 border-blue-600 p-4 shadow-sm">
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-blue-800">{incident.title}</h3>
              <span className="text-sm text-gray-500">{incident.date}</span>
            </div>
            <p className="text-sm text-gray-700">{incident.summary}</p>
            <div className="flex flex-wrap gap-1 text-xs">
              <Badge variant="outline">Classe: {incident.class_dp}</Badge>
              <Badge variant="outline">Embarcação: {incident.vessel}</Badge>
              <Badge variant="outline">Local: {incident.location}</Badge>
              {incident.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
            
            {/* SGSO Classification Section */}
            {(incident.sgso_category || incident.sgso_risk_level) && (
              <div className="pt-2 border-t border-gray-200 space-y-1">
                <p className="text-xs font-semibold text-gray-700">Classificação SGSO:</p>
                <div className="flex flex-wrap gap-2">
                  {incident.sgso_category && (
                    <Badge variant="outline" className="text-xs">
                      {incident.sgso_category}
                    </Badge>
                  )}
                  {incident.sgso_risk_level && (
                    <Badge className={`text-xs ${RISK_LEVEL_COLORS[incident.sgso_risk_level]?.badge || "bg-gray-600"}`}>
                      {RISK_LEVEL_COLORS[incident.sgso_risk_level]?.icon} {incident.sgso_risk_level.charAt(0).toUpperCase() + incident.sgso_risk_level.slice(1)}
                    </Badge>
                  )}
                </div>
                {incident.sgso_root_cause && (
                  <p className="text-xs text-gray-600 mt-1">
                    <span className="font-medium">Causa Raiz:</span> {incident.sgso_root_cause}
                  </p>
                )}
              </div>
            )}
            
            {/* Show Plan Status Select if plan exists */}
            {incident.plan_of_action && (
              <div className="pt-2 border-t border-gray-200">
                <PlanStatusSelect 
                  incident={incident} 
                  onUpdate={(status) => handleStatusUpdate(incident.id, status)}
                />
              </div>
            )}
            
            <div className="flex gap-2 pt-2">
              <a href={incident.link} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline">Ver relatório</Button>
              </a>
              <Button size="sm" variant="default" onClick={() => localStorage.setItem("incident_to_analyze", JSON.stringify(incident))}>
                Analisar com IA
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
