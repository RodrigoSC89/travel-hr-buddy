"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    fetch("/api/dp/intel/feed")
      .then(res => res.json())
      .then(data => setIncidents(data.incidents))
      .catch(err => console.error("Erro ao carregar incidentes DP", err));
  }, []);

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
