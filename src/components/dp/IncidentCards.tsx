"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DPIncident, SGSO_RISK_LEVELS } from "@/types/incident";
import { Shield } from "lucide-react";

// Legacy interface for backward compatibility with demo data
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
}

export default function IncidentCards() {
  const [incidents, setIncidents] = useState<DPIncident[]>([]);

  useEffect(() => {
    fetch("/api/dp/intel/feed")
      .then(res => res.json())
      .then(data => setIncidents(data.incidents))
      .catch(err => {
        console.error("Erro ao carregar incidentes DP", err);
        // Demo data for testing when API is not available - now with SGSO fields
        setIncidents([
          {
            id: "1",
            title: "Perda de posição durante operação de perfuração",
            date: "2024-09-15",
            vessel: "Drillship Alpha",
            location: "Golfo do México",
            class_dp: "DP3",
            root_cause: "Falha no sistema de propulsão",
            tags: ["Propulsion", "Critical", "Weather"],
            summary: "Embarcação perdeu posicionamento durante operação crítica devido a falha no sistema de propulsão principal combinado com condições meteorológicas adversas.",
            link: "https://www.imca-int.com/incident-reports",
            source: "IMCA",
            sgso_category: "Falha de sistema",
            sgso_root_cause: "Erro no PLC do DP",
            sgso_risk_level: "crítico"
          },
          {
            id: "2",
            title: "Falha de redundância em sistema DP2",
            date: "2024-08-22",
            vessel: "Platform Support Vessel Beta",
            location: "Mar do Norte",
            class_dp: "DP2",
            root_cause: "Erro de configuração",
            tags: ["Configuration", "Redundancy", "High"],
            summary: "Sistema de redundância não operou conforme esperado durante teste anual, revelando erro de configuração não detectado anteriormente.",
            link: "https://www.imca-int.com/incident-reports",
            source: "IMCA",
            sgso_category: "Erro humano",
            sgso_root_cause: "Configuração incorreta durante manutenção",
            sgso_risk_level: "alto"
          },
          {
            id: "3",
            title: "Perda temporária de referência de posição",
            date: "2024-07-10",
            vessel: "Construction Vessel Gamma",
            location: "Bacia de Campos",
            class_dp: "DP2",
            root_cause: "Interferência eletromagnética",
            tags: ["Sensors", "Medium", "EMI"],
            summary: "Sistema perdeu referência de posição por 45 segundos devido a interferência eletromagnética de equipamento de soldagem submarino.",
            link: "https://www.imca-int.com/incident-reports",
            source: "IMCA",
            sgso_category: "Fator externo (clima, mar, etc)",
            sgso_root_cause: "Interferência de equipamento externo",
            sgso_risk_level: "moderado"
          },
          {
            id: "4",
            title: "Falha em teste de FMEA",
            date: "2024-06-05",
            vessel: "Anchor Handling Vessel Delta",
            location: "Mar Cáspio",
            class_dp: "DP1",
            root_cause: "Procedimento inadequado",
            tags: ["Testing", "FMEA", "Low"],
            summary: "Teste de análise de modos de falha revelou lacunas em procedimentos operacionais e necessidade de treinamento adicional.",
            link: "https://www.imca-int.com/incident-reports",
            source: "IMCA",
            sgso_category: "Não conformidade com procedimento",
            sgso_root_cause: "Ausência de procedimento documentado",
            sgso_risk_level: "baixo"
          }
        ]);
      });
  }, []);

  const getRiskLevelBadge = (riskLevel?: string) => {
    const risk = SGSO_RISK_LEVELS.find(r => r.value === riskLevel);
    if (!risk) return null;
    
    const colorClasses = {
      green: "bg-green-100 text-green-800 border-green-300",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
      orange: "bg-orange-100 text-orange-800 border-orange-300",
      red: "bg-red-100 text-red-800 border-red-300",
    };
    
    return (
      <Badge className={`${colorClasses[risk.color]} border`}>
        {risk.label}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {incidents.map((incident) => (
        <Card key={incident.id} className="border-l-4 border-blue-600 p-4 shadow-sm">
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-blue-800">{incident.title}</h3>
              <span className="text-sm text-gray-500">{incident.date}</span>
            </div>
            <p className="text-sm text-gray-700">{incident.summary}</p>
            
            {/* SGSO Information Section */}
            {(incident.sgso_category || incident.sgso_risk_level || incident.sgso_root_cause) && (
              <div className="bg-slate-50 rounded-md p-3 space-y-2 border border-slate-200">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Shield className="h-4 w-4" />
                  <span>Classificação SGSO</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {incident.sgso_category && (
                    <Badge variant="outline" className="bg-blue-50">
                      {incident.sgso_category}
                    </Badge>
                  )}
                  {incident.sgso_risk_level && getRiskLevelBadge(incident.sgso_risk_level)}
                </div>
                {incident.sgso_root_cause && (
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold">Causa Raiz:</span> {incident.sgso_root_cause}
                  </p>
                )}
              </div>
            )}
            
            <div className="flex flex-wrap gap-1 text-xs">
              <Badge variant="outline">Classe: {incident.class_dp}</Badge>
              <Badge variant="outline">Embarcação: {incident.vessel}</Badge>
              <Badge variant="outline">Local: {incident.location}</Badge>
              {incident.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
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
