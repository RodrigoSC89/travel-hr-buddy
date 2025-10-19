import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DPIncident, SGSO_CATEGORIES, RISK_LEVEL_COLORS, SGSORiskLevel } from "@/types/incident";
import { FileDown, Filter, X } from "lucide-react";
import { saveAs } from "file-saver";

// Mock data for incidents with SGSO classification
const MOCK_INCIDENTS: DPIncident[] = [
  {
    id: "1",
    vessel: "FPSO X",
    incident_date: "2025-09-15",
    severity: "Alta",
    title: "Perda de posição durante perfuração",
    description: "Embarcação perdeu posicionamento durante operação crítica devido a falha no sistema de propulsão.",
    root_cause: "Falha no sistema de propulsão",
    location: "Santos Basin",
    class_dp: "DP3",
    status: "pending",
    tags: ["propulsion", "critical"],
    sgso_category: "Falha de sistema",
    sgso_root_cause: "Falha no sistema de propulsão principal",
    sgso_risk_level: "crítico",
    created_at: "2025-09-15T10:00:00Z",
  },
  {
    id: "2",
    vessel: "PSV Y",
    incident_date: "2025-08-22",
    severity: "Média",
    title: "Falha de redundância em sistema DP2",
    description: "Sistema de redundância não operou conforme esperado durante teste anual.",
    root_cause: "Erro de configuração",
    location: "Campos Basin",
    class_dp: "DP2",
    status: "analyzed",
    tags: ["configuration", "redundancy"],
    sgso_category: "Erro humano",
    sgso_root_cause: "Erro de configuração não detectado",
    sgso_risk_level: "alto",
    created_at: "2025-08-22T14:30:00Z",
  },
  {
    id: "3",
    vessel: "AHTS Alpha",
    incident_date: "2025-07-10",
    severity: "Média",
    title: "Perda temporária de referência de posição",
    description: "Sistema perdeu referência de posição por 45 segundos devido a interferência eletromagnética.",
    root_cause: "Interferência eletromagnética",
    location: "Espírito Santo Basin",
    class_dp: "DP2",
    status: "pending",
    tags: ["sensors", "EMI"],
    sgso_category: "Fator externo (clima, mar, etc)",
    sgso_root_cause: "Interferência eletromagnética de equipamento de soldagem",
    sgso_risk_level: "moderado",
    created_at: "2025-07-10T09:15:00Z",
  },
  {
    id: "4",
    vessel: "OSV Beta",
    incident_date: "2025-06-05",
    severity: "Baixa",
    title: "Falha em teste de FMEA",
    description: "Teste de análise de modos de falha revelou lacunas em procedimentos operacionais.",
    root_cause: "Procedimento inadequado",
    location: "Santos Basin",
    class_dp: "DP1",
    status: "analyzed",
    tags: ["testing", "FMEA"],
    sgso_category: "Não conformidade com procedimento",
    sgso_root_cause: "Lacunas em procedimentos operacionais",
    sgso_risk_level: "baixo",
    created_at: "2025-06-05T16:45:00Z",
  },
];

export function IncidentsSGSOPanel() {
  const [incidents, setIncidents] = useState<DPIncident[]>(MOCK_INCIDENTS);
  const [filteredIncidents, setFilteredIncidents] = useState<DPIncident[]>(MOCK_INCIDENTS);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [vesselFilter, setVesselFilter] = useState<string>("all");

  // Get unique vessels from incidents
  const vessels = Array.from(new Set(incidents.map(inc => inc.vessel))).sort();

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

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `incidentes-sgso-${new Date().toISOString().split("T")[0]}.csv`);
  };

  // Export to PDF (placeholder - requires html2pdf.js)
  const exportToPDF = () => {
    alert("Funcionalidade de exportação PDF será implementada em breve!");
  };

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
              Nenhum incidente encontrado com os filtros selecionados.
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
                <p className="text-sm text-gray-700">{incident.description}</p>
                
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">Classe: {incident.class_dp}</Badge>
                  <Badge variant="outline">Local: {incident.location}</Badge>
                  <Badge variant="secondary">{incident.severity}</Badge>
                </div>

                {/* SGSO Classification */}
                <div className="pt-2 border-t border-gray-200 space-y-1">
                  <p className="text-xs font-semibold text-gray-700">Classificação SGSO:</p>
                  {incident.sgso_category && (
                    <Badge variant="outline" className="text-xs">
                      {incident.sgso_category}
                    </Badge>
                  )}
                  {incident.sgso_root_cause && (
                    <p className="text-xs text-gray-600 mt-1">
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
