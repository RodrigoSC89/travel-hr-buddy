"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertTriangle,
  TrendingUp,
  Search,
  Filter,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Shield,
  BookOpen,
  Lightbulb,
  ClipboardList,
} from "lucide-react";

interface Incident {
  id: string;
  title: string;
  incident_date: string;
  vessel?: string;
  location?: string;
  class_dp: string;
  root_cause?: string;
  severity?: string;
  status?: string;
  tags?: string[];
  summary?: string;
  link?: string;
  ai_analysis?: Record<string, unknown>;
}

interface Statistics {
  total: number;
  critical: number;
  analyzed: number;
  pending: number;
}

export function DPIntelligenceCenter() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    critical: 0,
    analyzed: 0,
    pending: 0,
  });

  useEffect(() => {
    loadIncidents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [incidents, searchQuery, filterClass, filterStatus]);

  useEffect(() => {
    calculateStatistics();
  }, [filteredIncidents]);

  const loadIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from("dp_incidents")
        .select("*")
        .order("incident_date", { ascending: false });

      if (error) {
        console.error("Error loading incidents:", error);
        toast.error("Erro ao carregar incidentes");
        loadMockData();
        return;
      }

      if (data && data.length > 0) {
        setIncidents(data);
      } else {
        loadMockData();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      loadMockData();
    }
  };

  const loadMockData = () => {
    const mockIncidents: Incident[] = [
      {
        id: "dp-2024-001",
        title: "Perda de posição durante operação de perfuração",
        incident_date: "2024-09-15",
        vessel: "Drillship Alpha",
        location: "Golfo do México",
        class_dp: "DP3",
        root_cause: "Falha no sistema de propulsão principal",
        severity: "High",
        status: "analyzed",
        tags: ["propulsion", "critical", "weather"],
        summary: "Embarcação perdeu posicionamento durante operação crítica devido a falha no sistema de propulsão principal combinado com condições meteorológicas adversas.",
      },
      {
        id: "dp-2024-002",
        title: "Falha de redundância em sistema de referência",
        incident_date: "2024-08-22",
        vessel: "Platform Support Vessel Beta",
        location: "Mar do Norte",
        class_dp: "DP2",
        root_cause: "Erro de configuração no sistema de redundância",
        severity: "Medium",
        status: "pending",
        tags: ["configuration", "redundancy"],
        summary: "Sistema de redundância não operou conforme esperado durante teste anual.",
      },
      {
        id: "dp-2024-003",
        title: "Drive-off durante operação com ROV",
        incident_date: "2024-07-10",
        vessel: "Construction Vessel Gamma",
        location: "Bacia de Campos",
        class_dp: "DP2",
        root_cause: "Interferência eletromagnética no sistema de posicionamento",
        severity: "Critical",
        status: "analyzed",
        tags: ["sensors", "emi", "rov"],
        summary: "Embarcação iniciou drive-off durante operação com ROV devido a interferência eletromagnética.",
      },
      {
        id: "dp-2024-004",
        title: "Blackout parcial afetando sistema DP",
        incident_date: "2024-06-05",
        vessel: "Anchor Handling Vessel Delta",
        location: "Mar Cáspio",
        class_dp: "DP2",
        root_cause: "Falha no sistema de gerenciamento de energia",
        severity: "High",
        status: "pending",
        tags: ["power", "blackout", "pms"],
        summary: "Blackout parcial resultou em perda temporária de capacidade DP.",
      },
    ];
    setIncidents(mockIncidents);
  };

  const applyFilters = () => {
    let filtered = [...incidents];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (incident) =>
          incident.title.toLowerCase().includes(query) ||
          incident.summary?.toLowerCase().includes(query) ||
          incident.vessel?.toLowerCase().includes(query) ||
          incident.location?.toLowerCase().includes(query) ||
          incident.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply class filter
    if (filterClass !== "all") {
      filtered = filtered.filter((incident) => incident.class_dp === filterClass);
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((incident) => incident.status === filterStatus);
    }

    setFilteredIncidents(filtered);
  };

  const calculateStatistics = () => {
    const total = filteredIncidents.length;
    const critical = filteredIncidents.filter(
      (i) => i.severity === "Critical"
    ).length;
    const analyzed = filteredIncidents.filter(
      (i) => i.status === "analyzed" || i.ai_analysis
    ).length;
    const pending = filteredIncidents.filter(
      (i) => i.status === "pending" || !i.ai_analysis
    ).length;

    setStatistics({ total, critical, analyzed, pending });
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
    case "Critical":
      return "bg-red-100 text-red-800 border-red-300";
    case "High":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "Medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "Low":
      return "bg-green-100 text-green-800 border-green-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const handleAnalyzeIncident = async (incident: Incident) => {
    setSelectedIncident(incident);
    setIsAnalyzing(true);
    setShowAnalysisModal(true);
    setAnalysisResult("");

    try {
      const { data, error } = await supabase.functions.invoke("dp-intel-analyze", {
        body: { incident },
      });

      if (error) {
        console.error("Error analyzing incident:", error);
        toast.error("Erro ao analisar incidente", {
          description: error.message || "Tente novamente mais tarde",
        });
        setAnalysisResult("Erro ao processar análise. Por favor, tente novamente.");
        return;
      }

      if (data?.result) {
        setAnalysisResult(data.result);
        toast.success("Análise concluída com sucesso");
        
        // Reload incidents to get updated analysis
        await loadIncidents();
      } else {
        setAnalysisResult("Análise não retornou resultados.");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Erro inesperado ao analisar incidente");
      setAnalysisResult("Erro inesperado. Por favor, tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const parseAnalysisSection = (content: string, sectionTitle: string): string => {
    const sections = content.split(/#{2,3}\s+/);
    const section = sections.find((s) =>
      s.toLowerCase().includes(sectionTitle.toLowerCase())
    );
    return section ? section.split("\n").slice(1).join("\n").trim() : "";
  };

  return (
    <div className="space-y-6">
      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Incidentes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
            <p className="text-xs text-muted-foreground">Registros no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidentes Críticos</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statistics.critical}</div>
            <p className="text-xs text-muted-foreground">Alta prioridade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analisados com IA</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.analyzed}</div>
            <p className="text-xs text-muted-foreground">Análise completa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente Análise</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{statistics.pending}</div>
            <p className="text-xs text-muted-foreground">Aguardando análise</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, embarcação, local, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Todas as Classes</option>
                <option value="DP1">DP1</option>
                <option value="DP2">DP2</option>
                <option value="DP3">DP3</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Todos os Status</option>
                <option value="analyzed">Analisado</option>
                <option value="pending">Pendente</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incident Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIncidents.map((incident) => (
          <Card
            key={incident.id}
            className={`border-l-4 ${
              incident.severity === "Critical"
                ? "border-red-500"
                : incident.severity === "High"
                  ? "border-orange-500"
                  : "border-blue-500"
            }`}
          >
            <CardHeader>
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg">{incident.title}</CardTitle>
                <Badge className={getSeverityColor(incident.severity)}>
                  {incident.severity || "Medium"}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(incident.incident_date).toLocaleDateString("pt-BR")}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700">{incident.summary}</p>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  {incident.class_dp}
                </Badge>
                {incident.vessel && (
                  <Badge variant="outline" className="text-xs">
                    {incident.vessel}
                  </Badge>
                )}
                {incident.location && (
                  <Badge variant="outline" className="text-xs">
                    {incident.location}
                  </Badge>
                )}
                {incident.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {incident.root_cause && (
                <div className="text-sm">
                  <strong>Causa Raiz:</strong> {incident.root_cause}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {incident.link && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(incident.link, "_blank")}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Relatório
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleAnalyzeIncident(incident)}
                  disabled={isAnalyzing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {incident.ai_analysis ? "Ver Análise IA" : "Analisar com IA"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIncidents.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhum incidente encontrado</p>
            <p className="text-sm text-muted-foreground">
              Tente ajustar seus filtros ou termos de busca
            </p>
          </CardContent>
        </Card>
      )}

      {/* Analysis Modal */}
      <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Análise IA – {selectedIncident?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-sm text-muted-foreground">
                  Analisando incidente com IA...
                </p>
              </div>
            ) : analysisResult ? (
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="summary">
                    <FileText className="h-4 w-4 mr-1" />
                    Resumo
                  </TabsTrigger>
                  <TabsTrigger value="standards">
                    <BookOpen className="h-4 w-4 mr-1" />
                    Normas
                  </TabsTrigger>
                  <TabsTrigger value="causes">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Causas
                  </TabsTrigger>
                  <TabsTrigger value="recommendations">
                    <Lightbulb className="h-4 w-4 mr-1" />
                    Prevenção
                  </TabsTrigger>
                  <TabsTrigger value="actions">
                    <ClipboardList className="h-4 w-4 mr-1" />
                    Ações
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4 pt-4">
                  <div className="prose prose-sm max-w-none">
                    <h3 className="text-lg font-semibold mb-2">Resumo Técnico</h3>
                    <div className="whitespace-pre-wrap text-sm">
                      {parseAnalysisSection(analysisResult, "resumo") || analysisResult}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="standards" className="space-y-4 pt-4">
                  <div className="prose prose-sm max-w-none">
                    <h3 className="text-lg font-semibold mb-2">Normas Relacionadas</h3>
                    <div className="whitespace-pre-wrap text-sm">
                      {parseAnalysisSection(analysisResult, "normas") ||
                        "Informações não disponíveis"}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="causes" className="space-y-4 pt-4">
                  <div className="prose prose-sm max-w-none">
                    <h3 className="text-lg font-semibold mb-2">Causas Adicionais</h3>
                    <div className="whitespace-pre-wrap text-sm">
                      {parseAnalysisSection(analysisResult, "causas") ||
                        "Informações não disponíveis"}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4 pt-4">
                  <div className="prose prose-sm max-w-none">
                    <h3 className="text-lg font-semibold mb-2">
                      Recomendações Preventivas
                    </h3>
                    <div className="whitespace-pre-wrap text-sm">
                      {parseAnalysisSection(analysisResult, "preventivas") ||
                        parseAnalysisSection(analysisResult, "recomendações") ||
                        "Informações não disponíveis"}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4 pt-4">
                  <div className="prose prose-sm max-w-none">
                    <h3 className="text-lg font-semibold mb-2">Ações Corretivas</h3>
                    <div className="whitespace-pre-wrap text-sm">
                      {parseAnalysisSection(analysisResult, "corretivas") ||
                        parseAnalysisSection(analysisResult, "ações") ||
                        "Informações não disponíveis"}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Clique no botão &quot;Analisar com IA&quot; para gerar a análise
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
