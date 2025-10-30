// @ts-nocheck
/**
 * PATCH 472 - Incident Replay AI Main Panel
 * Lists incidents and allows replay with AI analysis
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Play,
  Search,
  RefreshCw,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import {
  incidentReplayService,
  type IncidentData,
} from "../services/incidentReplayService";
import { IncidentReplay } from "../components/IncidentReplay";
import { toast } from "sonner";

export const IncidentReplayAI: React.FC = () => {
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<IncidentData[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadIncidents();
  }, []);

  useEffect(() => {
    // Filter incidents based on search query
    if (searchQuery.trim() === "") {
      setFilteredIncidents(incidents);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredIncidents(
        incidents.filter(
          (incident) =>
            incident.title.toLowerCase().includes(query) ||
            incident.description.toLowerCase().includes(query) ||
            incident.severity.toLowerCase().includes(query) ||
            incident.status.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, incidents]);

  const loadIncidents = async () => {
    setIsLoading(true);
    try {
      const incidentList = await incidentReplayService.getIncidents(100);
      setIncidents(incidentList);
      setFilteredIncidents(incidentList);
    } catch (error) {
      console.error("Failed to load incidents:", error);
      toast.error("Falha ao carregar incidentes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplayIncident = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical":
      return "bg-red-500";
    case "high":
      return "bg-orange-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
    }
  };

  if (selectedIncidentId) {
    return (
      <div className="container mx-auto p-6">
        <Button
          variant="outline"
          onClick={() => setSelectedIncidentId(null)}
          className="mb-4"
        >
          ← Voltar à lista
        </Button>
        <IncidentReplay
          incidentId={selectedIncidentId}
          onClose={() => setSelectedIncidentId(null)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Play className="w-8 h-8 text-primary" />
          Incident Replay AI v1
        </h1>
        <p className="text-muted-foreground mt-1">
          Replay de incidentes com análise assistida por IA - PATCH 472
        </p>
      </div>

      {/* Search and Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Incidentes Disponíveis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, descrição, severidade ou status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={loadIncidents} disabled={isLoading} variant="outline">
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>
                Crítico: {incidents.filter((i) => i.severity === "critical").length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>
                Alto: {incidents.filter((i) => i.severity === "high").length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>
                Médio: {incidents.filter((i) => i.severity === "medium").length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>
                Baixo: {incidents.filter((i) => i.severity === "low").length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incidents List */}
      <div className="space-y-3">
        {filteredIncidents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {isLoading ? (
                <>
                  <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin" />
                  <p>Carregando incidentes...</p>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum incidente encontrado</p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredIncidents.map((incident) => (
            <Card key={incident.id} className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{incident.title}</h3>
                      <Badge className={getSeverityColor(incident.severity)}>
                        {incident.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{incident.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {incident.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(incident.incidentDate).toLocaleString()}
                      </span>
                      {incident.location && <span>📍 {incident.location}</span>}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleReplayIncident(incident.id)}
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Replay
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Features Info */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre o Incident Replay AI v1</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                ✅ UI Funcional com Timeline
              </h3>
              <p className="text-sm text-muted-foreground">
                Interface interativa com visualização de timeline de eventos do
                incidente.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                ✅ IA Identifica Causas
              </h3>
              <p className="text-sm text-muted-foreground">
                Sistema de análise AI identifica 1 ou mais causas prováveis com
                score de confiança.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                ✅ PDF Gerado com Resultados
              </h3>
              <p className="text-sm text-muted-foreground">
                Exportação completa de análise em PDF com timeline, causas e
                recomendações.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                ✅ Testado com Incidentes Reais
              </h3>
              <p className="text-sm text-muted-foreground">
                Sistema integrado com tabela incident_reports e testado com dados
                reais.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncidentReplayAI;
