"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import IncidentAiModal from "./IncidentAiModal";

// Database incident structure
interface DbIncident {
  id: string;
  title: string;
  description: string;
  source: string | null;
  incident_date: string | null;
  severity: string | null;
  vessel: string | null;
  gpt_analysis: any;
  created_at: string;
}

// Display incident structure (compatible with existing UI)
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
  severity?: string | null;
  gpt_analysis?: any;
}

// Convert DB format to display format
function convertDbToDisplay(dbIncident: DbIncident): Incident {
  return {
    id: dbIncident.id,
    title: dbIncident.title,
    date: dbIncident.incident_date || new Date(dbIncident.created_at).toISOString().split('T')[0],
    vessel: dbIncident.vessel || "N/A",
    location: dbIncident.source || "N/A",
    class_dp: "DP2", // Default, can be extracted from description or source
    rootCause: dbIncident.description.substring(0, 100) + "...",
    tags: [dbIncident.severity || "Medium"].filter(Boolean) as string[],
    summary: dbIncident.description,
    link: "https://www.imca-int.com/incident-reports",
    severity: dbIncident.severity,
    gpt_analysis: dbIncident.gpt_analysis
  };
}

export default function IncidentCards() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, []);

  async function fetchIncidents() {
    setLoading(true);
    try {
      const response = await fetch("/api/dp-incidents");
      if (!response.ok) {
        throw new Error("Failed to fetch incidents");
      }
      const data = await response.json();
      
      // Convert DB format to display format
      const displayIncidents = Array.isArray(data) 
        ? data.map(convertDbToDisplay)
        : [];
      
      setIncidents(displayIncidents);
    } catch (err) {
      console.error("Erro ao carregar incidentes DP", err);
      toast.error("Erro ao carregar incidentes", {
        description: "Carregando dados de demonstração"
      });
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
          link: "https://www.imca-int.com/incident-reports"
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  const handleAnalyzeClick = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando incidentes...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {incidents.map((incident) => (
          <Card key={incident.id} className="border-l-4 border-blue-600 p-4 shadow-sm">
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-blue-800">{incident.title}</h3>
                <span className="text-sm text-gray-500">{incident.date}</span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-3">{incident.summary}</p>
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
                <Button size="sm" variant="default" onClick={() => handleAnalyzeClick(incident)}>
                  Analisar com IA
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selectedIncident && (
        <IncidentAiModal
          incident={selectedIncident}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAnalysisComplete={fetchIncidents}
        />
      )}
    </>
  );
}
