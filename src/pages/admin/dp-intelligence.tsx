"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Brain, ExternalLink, Filter, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface DPIncident {
  id: string
  title: string
  description: string
  vessel: string
  incident_date: string
  severity: string
  root_cause: string
  class_dp: string
  sgso_category?: string
  gpt_analysis?: {
    analise?: string
    causa_provavel?: string
    prevencao?: string
    impacto_operacional?: string
  }
  link_original?: string
}

export default function DPIntelligencePage() {
  const [incidentes, setIncidentes] = useState<DPIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  
  // Filters
  const [filterVessel, setFilterVessel] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterSystem, setFilterSystem] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchIncidentes();
  }, []);

  async function fetchIncidentes() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("dp_incidents")
        .select("*")
        .order("incident_date", { ascending: false });

      if (error) {
        console.error("Error fetching incidents:", error);
        toast.error("Erro ao carregar incidentes", {
          description: error.message
        });
        return;
      }

      setIncidentes(data || []);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Erro ao carregar incidentes");
    } finally {
      setLoading(false);
    }
  }

  async function explicarIA(id: string, descricao: string, title: string, root_cause: string) {
    try {
      setAnalyzingId(id);
      toast.info("Analisando incidente com IA...");

      const res = await fetch("/api/dp/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, descricao, title, root_cause }),
      });

      if (!res.ok) {
        throw new Error("Erro ao analisar incidente");
      }

      const result = await res.json();
      
      if (result.success) {
        toast.success("Análise concluída com sucesso!");
        await fetchIncidentes(); // Reload to show the new analysis
      } else {
        throw new Error(result.error || "Erro ao analisar incidente");
      }
    } catch (error) {
      console.error("Error explaining incident:", error);
      toast.error("Erro ao analisar incidente", {
        description: error instanceof Error ? error.message : "Tente novamente mais tarde"
      });
    } finally {
      setAnalyzingId(null);
    }
  }

  // Filter incidents
  const filteredIncidentes = incidentes.filter(incident => {
    const matchesVessel = filterVessel === "all" || incident.vessel === filterVessel;
    const matchesSeverity = filterSeverity === "all" || incident.severity === filterSeverity;
    const matchesSystem = filterSystem === "all" || 
      incident.sgso_category === filterSystem || 
      incident.class_dp === filterSystem;
    const matchesSearch = searchTerm === "" || 
      incident.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.root_cause?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesVessel && matchesSeverity && matchesSystem && matchesSearch;
  });

  // Get unique values for filters
  const vessels = Array.from(new Set(incidentes.map(i => i.vessel)));
  const severities = Array.from(new Set(incidentes.map(i => i.severity)));
  const systems = Array.from(new Set(incidentes.map(i => i.sgso_category || i.class_dp).filter(Boolean)));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            🧠 Centro de Inteligência DP (Fase 1)
          </h1>
          <p className="text-muted-foreground mt-2">
            Base de conhecimento de incidentes DP com análise por IA
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4" />
          <h3 className="font-semibold">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Buscar</label>
            <Input
              placeholder="Buscar incidentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Embarcação</label>
            <Select value={filterVessel} onValueChange={setFilterVessel}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {vessels.map(vessel => (
                  <SelectItem key={vessel} value={vessel}>{vessel}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Gravidade</label>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {severities.map(severity => (
                  <SelectItem key={severity} value={severity}>{severity}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Sistema/Categoria</label>
            <Select value={filterSystem} onValueChange={setFilterSystem}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {systems.map(system => (
                  <SelectItem key={system} value={system}>{system}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Incidents List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredIncidentes.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nenhum incidente encontrado</p>
          </Card>
        ) : (
          filteredIncidentes.map((item) => (
            <Card key={item.id} className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Embarcação:</span>
                      <p className="font-medium">{item.vessel}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Data:</span>
                      <p className="font-medium">
                        {format(new Date(item.incident_date), "dd/MM/yyyy")}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gravidade:</span>
                      <p className={`font-medium ${
                        item.severity === "Alta" ? "text-red-600" :
                          item.severity === "Média" ? "text-yellow-600" :
                            "text-green-600"
                      }`}>
                        {item.severity}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Classe DP:</span>
                      <p className="font-medium">{item.class_dp || "N/A"}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                  {item.root_cause && (
                    <p className="text-sm">
                      <span className="font-semibold">Causa raiz:</span> {item.root_cause}
                    </p>
                  )}
                </div>
              </div>

              {item.gpt_analysis ? (
                <div className="bg-blue-50 p-4 rounded-lg space-y-3 border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                    <Brain className="h-5 w-5" />
                    <span>Análise IA:</span>
                  </div>
                  
                  {item.gpt_analysis.causa_provavel && (
                    <div>
                      <p className="font-semibold text-sm">🔍 Causa Provável:</p>
                      <p className="text-sm text-gray-700 mt-1">{item.gpt_analysis.causa_provavel}</p>
                    </div>
                  )}
                  
                  {item.gpt_analysis.prevencao && (
                    <div>
                      <p className="font-semibold text-sm">🛡️ Prevenção Sugerida:</p>
                      <p className="text-sm text-gray-700 mt-1">{item.gpt_analysis.prevencao}</p>
                    </div>
                  )}
                  
                  {item.gpt_analysis.impacto_operacional && (
                    <div>
                      <p className="font-semibold text-sm">⚠️ Impacto Operacional:</p>
                      <p className="text-sm text-gray-700 mt-1">{item.gpt_analysis.impacto_operacional}</p>
                    </div>
                  )}
                  
                  {item.gpt_analysis.analise && !item.gpt_analysis.causa_provavel && (
                    <div>
                      <p className="text-sm text-gray-700">{item.gpt_analysis.analise}</p>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  onClick={() => explicarIA(item.id, item.description, item.title, item.root_cause || "")}
                  disabled={analyzingId === item.id}
                  className="w-full md:w-auto"
                >
                  {analyzingId === item.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      🤖 Explicar com IA
                    </>
                  )}
                </Button>
              )}

              {item.link_original && (
                <a
                  href={item.link_original}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  🔗 Ver artigo original
                </a>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
