import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DPIncident, SGSO_CATEGORIES, SGSO_RISK_LEVELS } from "@/types/incident";
import { Shield, FileDown, FileText, Filter } from "lucide-react";
import { saveAs } from "file-saver";
import html2pdf from "html2pdf.js";

// Mock data for SGSO incidents panel
const mockIncidents: DPIncident[] = [
  {
    id: "imca-2025-014",
    title: "Perda de posição durante operação de perfuração",
    date: "2025-10-14",
    vessel: "FPSO X",
    location: "Bacia de Santos",
    class_dp: "DP3",
    root_cause: "Falha no sistema de propulsão",
    source: "IMCA",
    link: "https://www.imca-int.com/incident-reports",
    summary: "Embarcação perdeu posicionamento durante operação crítica.",
    tags: ["DP", "Critical"],
    sgso_category: "Falha de sistema",
    sgso_root_cause: "Erro no PLC do DP",
    sgso_risk_level: "alto",
  },
  {
    id: "imca-2025-012",
    title: "Manobra incorreta durante operação PSV",
    date: "2025-10-12",
    vessel: "PSV Y",
    location: "Bacia de Campos",
    class_dp: "DP2",
    root_cause: "Erro humano",
    source: "IMCA",
    link: "https://www.imca-int.com/incident-reports",
    summary: "Operador executou manobra fora do procedimento padrão.",
    tags: ["PSV", "Human Error"],
    sgso_category: "Erro humano",
    sgso_root_cause: "Manobra incorreta no DP",
    sgso_risk_level: "crítico",
  },
  {
    id: "imca-2025-010",
    title: "Falha de sensor durante operação",
    date: "2025-10-10",
    vessel: "AHTS Alpha",
    location: "Golfo do México",
    class_dp: "DP2",
    root_cause: "Manutenção inadequada",
    source: "IMCA",
    link: "https://www.imca-int.com/incident-reports",
    summary: "Sensor de posicionamento falhou durante operação crítica.",
    tags: ["Sensor", "Maintenance"],
    sgso_category: "Ausência de manutenção preventiva",
    sgso_root_cause: "Sensor não foi calibrado conforme programação",
    sgso_risk_level: "moderado",
  },
  {
    id: "imca-2025-008",
    title: "Procedimento não seguido durante teste",
    date: "2025-10-08",
    vessel: "OSV Beta",
    location: "Mar do Norte",
    class_dp: "DP1",
    root_cause: "Não conformidade",
    source: "IMCA",
    link: "https://www.imca-int.com/incident-reports",
    summary: "Equipe não seguiu procedimento padrão durante teste FMEA.",
    tags: ["Procedure", "FMEA"],
    sgso_category: "Não conformidade com procedimento",
    sgso_root_cause: "Falta de treinamento recente",
    sgso_risk_level: "baixo",
  },
];

export const IncidentsSGSOPanel: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [filterVessel, setFilterVessel] = useState<string>("all");

  // Get unique vessels for filter
  const vessels = useMemo(() => {
    return Array.from(new Set(mockIncidents.map(i => i.vessel))).sort();
  }, []);

  // Filter incidents
  const filteredIncidents = useMemo(() => {
    return mockIncidents.filter(incident => {
      if (filterCategory !== "all" && incident.sgso_category !== filterCategory) return false;
      if (filterRisk !== "all" && incident.sgso_risk_level !== filterRisk) return false;
      if (filterVessel !== "all" && incident.vessel !== filterVessel) return false;
      return true;
    });
  }, [filterCategory, filterRisk, filterVessel]);

  const exportToCSV = () => {
    const header = [
      "ID",
      "Data",
      "Embarcação",
      "Categoria SGSO",
      "Nível de Risco",
      "Causa Raiz",
      "Status"
    ];
    
    const rows = filteredIncidents.map(incident => [
      incident.id,
      incident.date,
      incident.vessel,
      incident.sgso_category || "N/A",
      incident.sgso_risk_level || "N/A",
      incident.sgso_root_cause || "N/A",
      "Registrado"
    ]);

    const csv = [header, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `sgso_incidents_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportToPDF = () => {
    const element = document.getElementById("sgso-incidents-panel");
    if (!element) return;

    const opt = {
      margin: 0.5,
      filename: `sgso_incidents_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  const getRiskBadgeColor = (risk?: string) => {
    switch (risk) {
      case "crítico":
        return "bg-red-100 text-red-800 border-red-300";
      case "alto":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "moderado":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "baixo":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getRiskLabel = (risk?: string) => {
    const level = SGSO_RISK_LEVELS.find(r => r.value === risk);
    return level?.label || risk || "N/A";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">
              Painel de Incidentes SGSO
            </h2>
            <p className="text-sm text-muted-foreground">
              Classificação de incidentes por categoria de risco e criticidade
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={exportToPDF} variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <CardDescription>
            Filtre incidentes por categoria, nível de risco ou embarcação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Categoria SGSO</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
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

            <div>
              <label className="text-sm font-medium mb-2 block">Nível de Risco</label>
              <Select value={filterRisk} onValueChange={setFilterRisk}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os níveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os níveis</SelectItem>
                  {SGSO_RISK_LEVELS.map(risk => (
                    <SelectItem key={risk.value} value={risk.value}>
                      {risk.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Embarcação</label>
              <Select value={filterVessel} onValueChange={setFilterVessel}>
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

      {/* Incidents Table */}
      <div id="sgso-incidents-panel">
        <Card>
          <CardHeader>
            <CardTitle>
              Incidentes Registrados ({filteredIncidents.length})
            </CardTitle>
            <CardDescription>
              Lista de incidentes classificados por categoria de risco SGSO
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredIncidents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum incidente encontrado com os filtros selecionados.
                </div>
              ) : (
                filteredIncidents.map(incident => (
                  <Card key={incident.id} className="border-l-4 border-primary">
                    <CardContent className="pt-4">
                      <div className="grid gap-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h4 className="font-semibold">{incident.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {incident.vessel} • {incident.date}
                            </p>
                          </div>
                          <Badge className={`${getRiskBadgeColor(incident.sgso_risk_level)} border`}>
                            {getRiskLabel(incident.sgso_risk_level)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="font-medium">Categoria SGSO:</span>
                            <br />
                            <Badge variant="outline" className="mt-1">
                              {incident.sgso_category || "N/A"}
                            </Badge>
                          </div>
                          <div>
                            <span className="font-medium">Causa Raiz:</span>
                            <br />
                            <span className="text-muted-foreground">
                              {incident.sgso_root_cause || "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 text-xs">
                          <Badge variant="secondary">ID: {incident.id}</Badge>
                          <Badge variant="secondary">Classe: {incident.class_dp}</Badge>
                          <Badge variant="secondary">{incident.location}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IncidentsSGSOPanel;
