import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { IncidentCards } from "@/components/dp-intelligence/IncidentCards";
import { IncidentAiModal } from "@/components/dp-intelligence/IncidentAiModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Brain,
  AlertTriangle,
  BookOpen,
  TrendingUp,
  Search,
  Filter,
  Loader2,
  RefreshCw,
  Anchor,
} from "lucide-react";

interface DPIncident {
  id: string;
  title: string;
  date: string;
  vessel: string;
  location: string;
  root_cause: string;
  class_dp: string;
  source: string;
  link: string;
  summary: string;
  tags: string[];
}

const DPIntelligence = () => {
  const [incidents, setIncidents] = useState<DPIncident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<DPIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<DPIncident | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchIncidents();
  }, []);

  useEffect(() => {
    filterIncidents();
  }, [incidents, searchTerm, selectedClass]);

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Erro de Autenticação",
          description: "Você precisa estar logado para acessar os incidentes.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const response = await supabase.functions.invoke("dp-intel-feed");

      if (response.error) {
        throw response.error;
      }

      setIncidents(response.data.incidents || []);
      
      toast({
        title: "✅ Incidentes Carregados",
        description: `${response.data.count} incidentes disponíveis para análise.`,
      });
    } catch (error) {
      console.error("Error fetching incidents:", error);
      toast({
        title: "Erro ao Carregar",
        description: "Não foi possível carregar os incidentes. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterIncidents = () => {
    let filtered = [...incidents];

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (incident) =>
          incident.title.toLowerCase().includes(search) ||
          incident.vessel.toLowerCase().includes(search) ||
          incident.location.toLowerCase().includes(search) ||
          incident.root_cause.toLowerCase().includes(search) ||
          incident.tags?.some((tag) => tag.toLowerCase().includes(search))
      );
    }

    // Filter by DP class
    if (selectedClass) {
      filtered = filtered.filter((incident) => incident.class_dp === selectedClass);
    }

    setFilteredIncidents(filtered);
  };

  const handleAnalyzeClick = (incident: DPIncident) => {
    setSelectedIncident(incident);
    setIsModalOpen(true);
  };

  const handleViewReport = (incident: DPIncident) => {
    if (incident.link) {
      window.open(incident.link, "_blank");
    } else {
      toast({
        title: "Link Indisponível",
        description: "O link para o relatório não está disponível.",
        variant: "destructive",
      });
    }
  };

  const stats = {
    total: incidents.length,
    dp1: incidents.filter((i) => i.class_dp === "DP-1").length,
    dp2: incidents.filter((i) => i.class_dp === "DP-2").length,
    dp3: incidents.filter((i) => i.class_dp === "DP-3").length,
  };

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Anchor}
        title="Centro de Inteligência DP"
        description="Análise de Incidentes com IA — Conformidade IMCA, PEO-DP e IMO"
        gradient="indigo"
        badges={[
          { icon: Brain, label: "GPT-4 Turbo" },
          { icon: BookOpen, label: "IMCA/PEO-DP/IMO" },
          { icon: AlertTriangle, label: "Safety Flashes" },
          { icon: TrendingUp, label: "Análise Preditiva" },
        ]}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total de Incidentes</p>
                <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-blue-600 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Classe DP-1</p>
                <p className="text-3xl font-bold text-green-900">{stats.dp1}</p>
              </div>
              <Badge className="bg-blue-600 text-white text-lg px-3 py-1">DP-1</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Classe DP-2</p>
                <p className="text-3xl font-bold text-yellow-900">{stats.dp2}</p>
              </div>
              <Badge className="bg-yellow-600 text-white text-lg px-3 py-1">DP-2</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Classe DP-3</p>
                <p className="text-3xl font-bold text-red-900">{stats.dp3}</p>
              </div>
              <Badge className="bg-red-600 text-white text-lg px-3 py-1">DP-3</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
          <CardDescription>
            Encontre incidentes por título, embarcação, local ou tags
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar incidentes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Class Filter */}
            <div className="flex gap-2">
              <Button
                variant={selectedClass === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedClass(null)}
              >
                Todos
              </Button>
              <Button
                variant={selectedClass === "DP-1" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedClass("DP-1")}
                className={selectedClass === "DP-1" ? "bg-blue-600" : ""}
              >
                DP-1
              </Button>
              <Button
                variant={selectedClass === "DP-2" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedClass("DP-2")}
                className={selectedClass === "DP-2" ? "bg-yellow-600" : ""}
              >
                DP-2
              </Button>
              <Button
                variant={selectedClass === "DP-3" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedClass("DP-3")}
                className={selectedClass === "DP-3" ? "bg-red-600" : ""}
              >
                DP-3
              </Button>
            </div>

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchIncidents}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Incidents Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Incidentes IMCA
            </span>
            <Badge variant="outline">
              {filteredIncidents.length} de {incidents.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            Incidentes baseados em Safety Flashes da IMCA e análise técnica
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
              <p className="text-gray-600">Carregando incidentes...</p>
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum incidente encontrado</p>
              <p className="text-sm text-gray-500 mt-2">
                Ajuste os filtros ou tente outra busca
              </p>
            </div>
          ) : (
            <IncidentCards
              incidents={filteredIncidents}
              onAnalyzeClick={handleAnalyzeClick}
              onViewReport={handleViewReport}
            />
          )}
        </CardContent>
      </Card>

      {/* AI Modal */}
      <IncidentAiModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        incident={selectedIncident}
      />
    </ModulePageWrapper>
  );
};

export default DPIntelligence;
