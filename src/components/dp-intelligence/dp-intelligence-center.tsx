import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Brain,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  BookOpen,
  Lightbulb,
  CheckSquare,
  Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Incident {
  id: string;
  title: string;
  date: string;
  vessel: string;
  location: string;
  classDP: string;
  rootCause: string;
  tags: string[];
  summary: string;
  link: string;
  severity?: "critical" | "high" | "medium" | "low";
  status?: "analyzed" | "pending";
  gpt_analysis?: any;
}

interface AnalysisResult {
  summary: string;
  standards: string;
  causes: string;
  prevention: string;
  actions: string;
}

const DPIntelligenceCenter = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [filterVessel, setFilterVessel] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    analyzed: 0,
    pending: 0
  });

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/functions/v1/dp-intel-feed");
      if (response.ok) {
        const data = await response.json();
        const incidentsWithStatus = (data.incidents || []).map((inc: Incident) => ({
          ...inc,
          severity: inc.severity || determineSeverity(inc),
          status: inc.status || "pending"
        }));
        setIncidents(incidentsWithStatus);
      } else {
        loadDemoData();
      }
    } catch (error) {
      console.error("Error fetching incidents:", error);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const determineSeverity = (incident: Incident): "critical" | "high" | "medium" | "low" => {
    const criticalKeywords = ["loss of position", "drive off", "blackout"];
    const highKeywords = ["thruster failure", "reference loss", "pms"];
    
    const text = `${incident.title} ${incident.rootCause}`.toLowerCase();
    
    if (criticalKeywords.some(keyword => text.includes(keyword))) return "critical";
    if (highKeywords.some(keyword => text.includes(keyword))) return "high";
    if (incident.classDP?.includes("3")) return "high";
    return "medium";
  };

  const loadDemoData = () => {
    const demoIncidents: Incident[] = [
      {
        id: "imca-2025-014",
        title: "Loss of Position Due to Gyro Drift",
        date: "2025-09-12",
        vessel: "DP Shuttle Tanker X",
        location: "Campos Basin",
        rootCause: "Sensor drift not compensated",
        classDP: "DP Class 2",
        link: "https://www.imca-int.com/safety-events/42-25/",
        summary: "The vessel experienced a gradual loss of position due to undetected gyro drift during tandem loading ops.",
        tags: ["gyro", "drive off", "sensor", "position loss"],
        severity: "critical",
        status: "pending"
      },
      {
        id: "imca-2025-009",
        title: "Thruster Control Software Failure During ROV Ops",
        date: "2025-08-05",
        vessel: "DP DSV Subsea Alpha",
        location: "North Sea",
        rootCause: "Unexpected software reboot",
        classDP: "DP Class 3",
        link: "https://www.imca-int.com/safety-events/37-25/",
        summary: "During critical ROV launch, the vessel experienced a momentary loss of thruster control.",
        tags: ["thruster", "software", "rov", "reboot"],
        severity: "high",
        status: "analyzed"
      },
      {
        id: "imca-2025-006",
        title: "Reference System Failure in Heavy Weather",
        date: "2025-07-18",
        vessel: "DP Drillship Beta",
        location: "Gulf of Mexico",
        rootCause: "Multiple DGPS reference loss",
        classDP: "DP Class 3",
        link: "https://www.imca-int.com/safety-events/31-25/",
        summary: "During heavy weather operations, the vessel lost multiple DGPS references simultaneously.",
        tags: ["dgps", "reference system", "weather", "acoustic"],
        severity: "high",
        status: "pending"
      },
      {
        id: "imca-2024-089",
        title: "Power Management System Malfunction",
        date: "2024-12-03",
        vessel: "DP Construction Vessel Gamma",
        location: "Santos Basin",
        rootCause: "PMS configuration error",
        classDP: "DP Class 2",
        link: "https://www.imca-int.com/safety-events/89-24/",
        summary: "The Power Management System experienced a configuration error that resulted in unnecessary load shedding.",
        tags: ["pms", "power", "load shedding", "configuration"],
        severity: "medium",
        status: "analyzed"
      }
    ];
    setIncidents(demoIncidents);
  };

  useEffect(() => {
    const total = incidents.length;
    const critical = incidents.filter(i => i.severity === "critical").length;
    const analyzed = incidents.filter(i => i.status === "analyzed").length;
    const pending = incidents.filter(i => i.status === "pending").length;
    
    setStats({ total, critical, analyzed, pending });
  }, [incidents]);

  useEffect(() => {
    let filtered = incidents;

    if (selectedClass) {
      filtered = filtered.filter(incident => 
        incident.classDP?.toLowerCase().includes(selectedClass.toLowerCase())
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter(incident => incident.status === selectedStatus);
    }

    if (filterVessel) {
      filtered = filtered.filter(incident => 
        incident.vessel?.toLowerCase().includes(filterVessel.toLowerCase())
      );
    }

    if (filterSeverity) {
      const severityMap: { [key: string]: string } = {
        'Alta': 'critical',
        'Média': 'medium',
        'Baixa': 'low'
      };
      const mappedSeverity = severityMap[filterSeverity] || filterSeverity.toLowerCase();
      filtered = filtered.filter(incident => incident.severity === mappedSeverity);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(incident => 
        incident.title?.toLowerCase().includes(query) ||
        incident.vessel?.toLowerCase().includes(query) ||
        incident.location?.toLowerCase().includes(query) ||
        incident.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredIncidents(filtered);
  }, [searchQuery, selectedClass, selectedStatus, filterVessel, filterSeverity, incidents]);

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
    case "critical": return "bg-red-500";
    case "high": return "bg-orange-500";
    case "medium": return "bg-blue-500";
    case "low": return "bg-green-500";
    default: return "bg-gray-500";
    }
  };

  const getClassBadgeColor = (dpClass: string) => {
    if (dpClass?.includes("1")) return "bg-blue-500";
    if (dpClass?.includes("2")) return "bg-yellow-500";
    if (dpClass?.includes("3")) return "bg-red-500";
    return "bg-gray-500";
  };

  const handleAnalyzeIncident = async (incident: Incident) => {
    setSelectedIncident(incident);
    setModalOpen(true);
    setAnalysis(null);
    setAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("dp-intel-analyze", {
        body: { incident }
      });

      if (error) {
        console.error("Error calling AI analysis:", error);
        toast.error("Erro ao analisar incidente", {
          description: error.message || "Tente novamente mais tarde"
        });
        return;
      }

      if (data?.result) {
        // Parse the AI response into structured sections
        const result = data.result;
        const analysisResult = {
          summary: extractSection(result, "Resumo", "Normas") || result,
          standards: extractSection(result, "Normas", "Causas") || "Nenhuma norma específica identificada.",
          causes: extractSection(result, "Causas", "Prevenção") || "Análise de causas não disponível.",
          prevention: extractSection(result, "Prevenção", "Ações") || "Recomendações de prevenção não disponíveis.",
          actions: extractSection(result, "Ações", null) || "Ações corretivas não especificadas."
        };
        setAnalysis(analysisResult);
        
        // Update the incident with the analysis
        setIncidents(prevIncidents => 
          prevIncidents.map(inc => 
            inc.id === incident.id 
              ? { ...inc, gpt_analysis: analysisResult, status: "analyzed" }
              : inc
          )
        );
        
        toast.success("Análise concluída com sucesso");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Erro inesperado ao analisar incidente");
    } finally {
      setAnalyzing(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      "Título",
      "Navio",
      "Data",
      "Severidade",
      "Análise IA",
    ];

    const rows = filteredIncidents.map((incident) => [
      incident.title || "",
      incident.vessel || "",
      incident.date || "",
      incident.severity || "",
      incident.gpt_analysis ? JSON.stringify(incident.gpt_analysis).replace(/\n/g, " ") : "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dp_incidents.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("CSV exportado com sucesso");
  };

  const extractSection = (text: string, startMarker: string, endMarker: string | null): string => {
    const startIndex = text.indexOf(startMarker);
    if (startIndex === -1) return "";
    
    const contentStart = startIndex + startMarker.length;
    const endIndex = endMarker ? text.indexOf(endMarker, contentStart) : text.length;
    
    return text.substring(contentStart, endIndex === -1 ? text.length : endIndex).trim();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Incidentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus(selectedStatus === "analyzed" ? null : "analyzed")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Analisados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.analyzed}</div>
              <Badge className="bg-green-500">Analisados</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus(selectedStatus === "pending" ? null : "pending")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.pending}</div>
              <Badge className="bg-yellow-500">Pendentes</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.critical}</div>
              <Badge className="bg-red-500">Críticos</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, embarcação, local ou tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              placeholder="Filtrar por navio"
              value={filterVessel}
              onChange={(e) => setFilterVessel(e.target.value)}
              className="md:w-48"
            />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="border rounded-md px-3 py-2 md:w-48 bg-background"
            >
              <option value="">Todas as severidades</option>
              <option value="Alta">Alta</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </select>
            <Button onClick={exportCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedClass === "1" ? "default" : "outline"}
              onClick={() => setSelectedClass(selectedClass === "1" ? null : "1")}
              className="whitespace-nowrap"
            >
              DP-1
            </Button>
            <Button
              variant={selectedClass === "2" ? "default" : "outline"}
              onClick={() => setSelectedClass(selectedClass === "2" ? null : "2")}
              className="whitespace-nowrap"
            >
              DP-2
            </Button>
            <Button
              variant={selectedClass === "3" ? "default" : "outline"}
              onClick={() => setSelectedClass(selectedClass === "3" ? null : "3")}
              className="whitespace-nowrap"
            >
              DP-3
            </Button>
            {(selectedClass || selectedStatus || filterVessel || filterSeverity) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedClass(null);
                  setSelectedStatus(null);
                  setFilterVessel("");
                  setFilterSeverity("");
                }}
                className="whitespace-nowrap"
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>
          {(searchQuery || selectedClass || selectedStatus || filterVessel || filterSeverity) && (
            <div className="mt-4 text-sm text-muted-foreground">
              Mostrando {filteredIncidents.length} de {stats.total} incidentes
              {selectedClass && ` (DP Class ${selectedClass})`}
              {selectedStatus && ` (${selectedStatus === "analyzed" ? "Analisados" : "Pendentes"})`}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incidents Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando incidentes...</p>
          </div>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum incidente encontrado</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedClass || selectedStatus
                  ? "Tente ajustar os filtros de busca" 
                  : "Não há incidentes cadastrados no momento"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Navio</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>IA</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell className="font-medium">{incident.title}</TableCell>
                    <TableCell>{incident.vessel}</TableCell>
                    <TableCell>
                      {incident.date ? format(new Date(incident.date), "dd/MM/yyyy") : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(incident.severity)}>
                        {incident.severity === "critical" ? "Alta" : 
                         incident.severity === "medium" ? "Média" :
                         incident.severity === "low" ? "Baixa" : incident.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {incident.gpt_analysis ? (
                        <pre className="text-xs whitespace-pre-wrap bg-slate-100 dark:bg-slate-800 p-2 rounded-md max-w-md max-h-32 overflow-y-auto">
                          {JSON.stringify(incident.gpt_analysis, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-gray-400 italic text-sm">Não analisado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        disabled={analyzing}
                        onClick={() => handleAnalyzeIncident(incident)}
                      >
                        <Brain className="h-4 w-4 mr-1" />
                        Explicar com IA
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Análise IA – {selectedIncident?.title}</DialogTitle>
          </DialogHeader>
          
          {analyzing ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Analisando incidente com IA...</p>
              </div>
            </div>
          ) : analysis ? (
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="summary">📄 Resumo</TabsTrigger>
                <TabsTrigger value="standards">📚 Normas</TabsTrigger>
                <TabsTrigger value="causes">⚠️ Causas</TabsTrigger>
                <TabsTrigger value="prevention">💡 Prevenção</TabsTrigger>
                <TabsTrigger value="actions">📋 Ações</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Resumo Técnico
                  </h3>
                  <p className="text-sm whitespace-pre-line">{analysis.summary}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="standards" className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Normas Relacionadas (IMCA/IMO/PEO-DP)
                  </h3>
                  <p className="text-sm whitespace-pre-line">{analysis.standards}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="causes" className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Análise de Causas Raiz
                  </h3>
                  <p className="text-sm whitespace-pre-line">{analysis.causes}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="prevention" className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Recomendações de Prevenção
                  </h3>
                  <p className="text-sm whitespace-pre-line">{analysis.prevention}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="actions" className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckSquare className="h-5 w-5" />
                    Ações Corretivas
                  </h3>
                  <p className="text-sm whitespace-pre-line">{analysis.actions}</p>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {selectedIncident?.summary}
              </p>
              <Button onClick={() => selectedIncident && handleAnalyzeIncident(selectedIncident)} className="w-full">
                Executar análise IA
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DPIntelligenceCenter;
