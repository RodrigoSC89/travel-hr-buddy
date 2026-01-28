/**
 * IncidentsSGSOPanel - DP Incidents with SGSO Classification
 * PATCH 905: Replaced mock data with real Supabase integration
 */
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DPIncident, SGSO_CATEGORIES, RISK_LEVEL_COLORS, SGSORiskLevel } from "@/types/incident";
import { FileDown, Filter, X, Loader2 } from "lucide-react";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Hook para buscar incidentes reais do Supabase
function useIncidents() {
  return useQuery({
    queryKey: ['dp-incidents-sgso'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incident_reports')
        .select(`
          id,
          title,
          description,
          incident_date,
          location,
          severity,
          status,
          type,
          created_at
        `)
        .order('incident_date', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      return (data || []).map(inc => ({
        id: inc.id,
        vessel: 'Vessel DP',
        incident_date: inc.incident_date || inc.created_at,
        severity: inc.severity === 'critical' ? 'Alta' : inc.severity === 'high' ? 'Alta' : inc.severity === 'medium' ? 'Média' : 'Baixa',
        title: inc.title || 'Incidente',
        description: inc.description || '',
        root_cause: 'Em investigação',
        location: inc.location || 'Não especificado',
        class_dp: 'DP2',
        status: inc.status || 'pending',
        tags: [],
        sgso_category: inc.type || 'Falha de sistema',
        sgso_root_cause: 'Em investigação',
        sgso_risk_level: inc.severity === 'critical' ? 'crítico' : inc.severity === 'high' ? 'alto' : inc.severity === 'medium' ? 'moderado' : 'baixo' as SGSORiskLevel,
        created_at: inc.created_at
      } as DPIncident));
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function IncidentsSGSOPanel() {
  const { data: incidents = [], isLoading, error } = useIncidents();
  const [filteredIncidents, setFilteredIncidents] = useState<DPIncident[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [vesselFilter, setVesselFilter] = useState<string>("all");

  // Get unique vessels from incidents
  const vessels = useMemo(() => {
    return Array.from(new Set(incidents.map(inc => inc.vessel))).sort();
  }, [incidents]);

  // Apply filters
  useEffect(() => {
    let filtered = incidents;

    if (categoryFilter !== "all") {
      filtered = filtered.filter(inc => inc.sgso_category === categoryFilter);
    }

    if (riskFilter !== "all") {
      filtered = filtered.filter(inc => inc.sgso_risk_level === riskFilter);
    }

    if (vesselFilter !== "all") {
      filtered = filtered.filter(inc => inc.vessel === vesselFilter);
    }

    setFilteredIncidents(filtered);
  }, [categoryFilter, riskFilter, vesselFilter, incidents]);

  const clearFilters = () => {
    setCategoryFilter("all");
    setRiskFilter("all");
    setVesselFilter("all");
  };

  const activeFilterCount = [categoryFilter, riskFilter, vesselFilter].filter(f => f !== "all").length;

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "ID",
      "Embarcação",
      "Data",
      "Severidade",
      "Título",
      "Categoria SGSO",
      "Causa Raiz SGSO",
      "Nível de Risco",
      "Localização",
      "Classe DP",
      "Status"
    ];

    const rows = filteredIncidents.map(inc => [
      inc.id,
      inc.vessel,
      inc.incident_date,
      inc.severity,
      inc.title || "",
      inc.sgso_category || "",
      inc.sgso_root_cause || "",
      inc.sgso_risk_level || "",
      inc.location || "",
      inc.class_dp || "",
      inc.status || ""
    ]);

    const csvRows = rows.map(row => row.map(cell => `"${cell}"`).join(","));
    const csvContent = [headers.join(","), ...csvRows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `incidentes-sgso-${new Date().toISOString().split("T")[0]}.csv`);
  };

  // Export to PDF using jsPDF
  const exportToPDF = async () => {
    toast.loading("Gerando PDF...", { id: "export-pdf" });
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text("Relatório de Incidentes DP - SGSO", 20, 20);
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 20, 30);
      doc.text(`Total de incidentes: ${filteredIncidents.length}`, 20, 40);
      
      let y = 55;
      filteredIncidents.slice(0, 20).forEach((incident, idx) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(`${idx + 1}. ${incident.description?.substring(0, 60) || "Sem descrição"}...`, 20, y);
        doc.text(`   Severidade: ${incident.severity} | Data: ${new Date(incident.incident_date).toLocaleDateString("pt-BR")}`, 20, y + 5);
        y += 15;
      });
      
      doc.save(`incidentes-sgso-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF exportado com sucesso!", { id: "export-pdf" });
    } catch (err) {
      toast.error("Erro ao gerar PDF", { id: "export-pdf" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-8 text-center text-destructive">
          Erro ao carregar incidentes. Tente novamente.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Incidentes DP com Classificação SGSO</h2>
          <p className="text-muted-foreground mt-1">
            {filteredIncidents.length} de {incidents.length} incidentes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={exportToPDF} variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Filtros</CardTitle>
              {activeFilterCount > 0 && (
                <Badge variant="secondary">{activeFilterCount} ativo(s)</Badge>
              )}
            </div>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria SGSO</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {SGSO_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Risk Level Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Nível de Risco</label>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os níveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os níveis</SelectItem>
                  <SelectItem value="crítico">🔴 Crítico</SelectItem>
                  <SelectItem value="alto">🟠 Alto</SelectItem>
                  <SelectItem value="moderado">🟡 Moderado</SelectItem>
                  <SelectItem value="baixo">🟢 Baixo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Vessel Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Embarcação</label>
              <Select value={vesselFilter} onValueChange={setVesselFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as embarcações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as embarcações</SelectItem>
                  {vessels.map(vessel => (
                    <SelectItem key={vessel} value={vessel}>{vessel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIncidents.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              {incidents.length === 0 
                ? "Nenhum incidente registrado no sistema."
                : "Nenhum incidente encontrado com os filtros selecionados."}
            </CardContent>
          </Card>
        ) : (
          filteredIncidents.map((incident) => (
            <Card key={incident.id} className="border-l-4 border-blue-600">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{incident.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {incident.vessel} • {new Date(incident.incident_date).toLocaleDateString("pt-BR")}
                    </CardDescription>
                  </div>
                  {incident.sgso_risk_level && (
                    <Badge className={`${RISK_LEVEL_COLORS[incident.sgso_risk_level]?.badge || "bg-gray-600"}`}>
                      {RISK_LEVEL_COLORS[incident.sgso_risk_level]?.icon} {incident.sgso_risk_level.charAt(0).toUpperCase() + incident.sgso_risk_level.slice(1)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">{incident.description}</p>
                
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">Classe: {incident.class_dp}</Badge>
                  <Badge variant="outline">Local: {incident.location}</Badge>
                  <Badge variant="secondary">{incident.severity}</Badge>
                </div>

                {/* SGSO Classification */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Classificação SGSO:</p>
                  {incident.sgso_category && (
                    <Badge variant="outline" className="text-xs">
                      {incident.sgso_category}
                    </Badge>
                  )}
                  {incident.sgso_root_cause && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      <span className="font-medium">Causa Raiz:</span> {incident.sgso_root_cause}
                    </p>
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
