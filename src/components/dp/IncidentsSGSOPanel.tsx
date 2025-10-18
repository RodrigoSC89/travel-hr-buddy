import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DPIncident, SGSO_CATEGORIES, RISK_LEVEL_CONFIG } from "@/types/incident";
import { Download, FileText, Filter, X } from "lucide-react";
import { saveAs } from "file-saver";

export function IncidentsSGSOPanel() {
  const [incidents, setIncidents] = useState<DPIncident[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [vesselFilter, setVesselFilter] = useState<string>("all");

  useEffect(() => {
    // Load incidents from API or mock data
    fetch("/api/dp/intel/feed")
      .then(res => res.json())
      .then(data => setIncidents(data.incidents || []))
      .catch(err => {
        console.error("Erro ao carregar incidentes DP", err);
        // Mock data with SGSO classification
        setIncidents([
          {
            id: "1",
            title: "Perda de posição durante operação de perfuração",
            date: "2024-09-15",
            vessel: "FPSO X",
            location: "Golfo do México",
            class_dp: "DP3",
            rootCause: "Falha no sistema de propulsão",
            tags: ["Propulsion", "Critical"],
            summary: "Embarcação perdeu posicionamento durante operação crítica devido a falha no sistema de propulsão.",
            link: "https://www.imca-int.com/incident-reports",
            sgso_category: "Falha de sistema",
            sgso_root_cause: "Erro no PLC do DP",
            sgso_risk_level: "alto",
            plan_status: "pendente",
            plan_updated_at: "2025-10-14"
          },
          {
            id: "2",
            title: "Manobra incorreta no DP",
            date: "2024-08-22",
            vessel: "PSV Y",
            location: "Mar do Norte",
            class_dp: "DP2",
            rootCause: "Erro humano",
            tags: ["Human Error", "Critical"],
            summary: "Operador realizou manobra incorreta no sistema de posicionamento dinâmico.",
            link: "https://www.imca-int.com/incident-reports",
            sgso_category: "Erro humano",
            sgso_root_cause: "Manobra incorreta no DP",
            sgso_risk_level: "crítico",
            plan_status: "concluído",
            plan_updated_at: "2025-10-12"
          },
          {
            id: "3",
            title: "Falha de comunicação durante operação",
            date: "2024-07-10",
            vessel: "AHTS Alpha",
            location: "Bacia de Campos",
            class_dp: "DP2",
            rootCause: "Problema de comunicação",
            tags: ["Communication"],
            summary: "Falha de comunicação entre ponte e sala de máquinas durante operação crítica.",
            link: "https://www.imca-int.com/incident-reports",
            sgso_category: "Problema de comunicação",
            sgso_root_cause: "Falha no protocolo de comunicação",
            sgso_risk_level: "moderado"
          },
          {
            id: "4",
            title: "Manutenção preventiva não realizada",
            date: "2024-06-05",
            vessel: "OSV Beta",
            location: "Santos Basin",
            class_dp: "DP1",
            rootCause: "Ausência de manutenção",
            tags: ["Maintenance"],
            summary: "Equipamento apresentou falha por falta de manutenção preventiva programada.",
            link: "https://www.imca-int.com/incident-reports",
            sgso_category: "Ausência de manutenção preventiva",
            sgso_root_cause: "Manutenção não executada conforme cronograma",
            sgso_risk_level: "baixo"
          }
        ]);
      });
  }, []);

  // Get unique vessels for filter
  const vessels = useMemo(() => {
    return Array.from(new Set(incidents.map(i => i.vessel).filter(Boolean)));
  }, [incidents]);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      if (categoryFilter && categoryFilter !== "all" && incident.sgso_category !== categoryFilter) return false;
      if (riskFilter && riskFilter !== "all" && incident.sgso_risk_level !== riskFilter) return false;
      if (vesselFilter && vesselFilter !== "all" && incident.vessel !== vesselFilter) return false;
      return true;
    });
  }, [incidents, categoryFilter, riskFilter, vesselFilter]);

  // Clear all filters
  const clearFilters = () => {
    setCategoryFilter("all");
    setRiskFilter("all");
    setVesselFilter("all");
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "ID",
      "Título",
      "Data",
      "Embarcação",
      "Localização",
      "Classe DP",
      "Categoria SGSO",
      "Causa Raiz",
      "Nível de Risco",
      "Status do Plano"
    ];

    const rows = filteredIncidents.map(incident => [
      incident.id,
      incident.title,
      incident.date,
      incident.vessel,
      incident.location,
      incident.class_dp,
      incident.sgso_category || "",
      incident.sgso_root_cause || "",
      incident.sgso_risk_level || "",
      incident.plan_status || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `incidentes-dp-sgso-${new Date().toISOString().split("T")[0]}.csv`);
  };

  // Export to PDF (placeholder for future implementation)
  const exportToPDF = async () => {
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.getElementById("sgso-incidents-content");
      
      if (!element) {
        alert("Erro ao gerar PDF: conteúdo não encontrado");
        return;
      }

      const opt = {
        margin: 1,
        filename: `incidentes-dp-sgso-${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
      };

      html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Erro ao gerar PDF. Verifique se a biblioteca html2pdf.js está instalada.");
    }
  };

  const activeFiltersCount = [categoryFilter, riskFilter, vesselFilter].filter(f => f !== "all").length;

  return (
    <div className="space-y-6">
      {/* Header with Export Buttons */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Incidentes DP com Classificação SGSO</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredIncidents.length} de {incidents.length} incidentes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={exportToPDF} variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
              <CardDescription>Filtre incidentes por categoria, nível de risco e embarcação</CardDescription>
            </div>
            {activeFiltersCount > 0 && (
              <Button onClick={clearFilters} variant="ghost" size="sm">
                <X className="mr-2 h-4 w-4" />
                Limpar Filtros ({activeFiltersCount})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Categoria SGSO</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {SGSO_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Risk Level Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Nível de Risco</label>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os níveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os níveis</SelectItem>
                  {Object.entries(RISK_LEVEL_CONFIG).map(([level, config]) => (
                    <SelectItem key={level} value={level}>
                      {config.emoji} {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vessel Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Embarcação</label>
              <Select value={vesselFilter} onValueChange={setVesselFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as embarcações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as embarcações</SelectItem>
                  {vessels.map(vessel => (
                    <SelectItem key={vessel} value={vessel}>
                      {vessel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incidents List */}
      <div id="sgso-incidents-content" className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum incidente encontrado com os filtros selecionados.
            </CardContent>
          </Card>
        ) : (
          filteredIncidents.map(incident => (
            <Card key={incident.id} className="border-l-4 border-blue-600">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-blue-800">{incident.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span>{incident.date}</span>
                        <span>•</span>
                        <span>{incident.vessel}</span>
                        <span>•</span>
                        <span>{incident.location}</span>
                      </div>
                    </div>
                    {incident.sgso_risk_level && RISK_LEVEL_CONFIG[incident.sgso_risk_level] && (
                      <Badge className={`${RISK_LEVEL_CONFIG[incident.sgso_risk_level].color} text-sm`}>
                        {RISK_LEVEL_CONFIG[incident.sgso_risk_level].emoji} {RISK_LEVEL_CONFIG[incident.sgso_risk_level].label}
                      </Badge>
                    )}
                  </div>

                  {/* Summary */}
                  <p className="text-sm text-gray-700">{incident.summary}</p>

                  {/* SGSO Classification */}
                  {(incident.sgso_category || incident.sgso_root_cause) && (
                    <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">Classificação SGSO</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {incident.sgso_category && (
                          <div className="text-sm">
                            <span className="font-medium text-slate-600">Categoria: </span>
                            <Badge variant="outline" className="ml-1">{incident.sgso_category}</Badge>
                          </div>
                        )}
                        {incident.sgso_root_cause && (
                          <div className="text-sm">
                            <span className="font-medium text-slate-600">Causa Raiz: </span>
                            <span className="text-slate-700">{incident.sgso_root_cause}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags and Plan Status */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">Classe: {incident.class_dp}</Badge>
                    {incident.tags?.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                    {incident.plan_status && (
                      <Badge 
                        variant={incident.plan_status === "concluído" ? "default" : "outline"}
                        className="text-xs ml-auto"
                      >
                        Plano: {incident.plan_status}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  {incident.link && (
                    <div className="pt-2">
                      <a href={incident.link} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">Ver Relatório Completo</Button>
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
