"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('dp-intel-feed', {
          method: 'GET',
        });

        if (error) throw error;
        
        if (data && data.incidents) {
          setIncidents(data.incidents);
        }
      } catch (err) {
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
            link: "https://www.imca-int.com/incident-reports"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Carregando incidentes DP...</div>;
  }

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
