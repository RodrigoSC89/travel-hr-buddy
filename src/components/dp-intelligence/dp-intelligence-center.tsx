import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  Ship,
  MapPin,
  Calendar,
  Brain,
  BookOpen,
  AlertCircle,
  CheckCircle,
  FileText,
  Search,
  Filter,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DPIncident {
  id: string;
  title: string;
  date: string;
  class_dp: string;
  vessel: string;
  location: string;
  summary: string;
  root_cause?: string;
  status: string;
  severity: string;
  imca_reference?: string;
  ai_analysis?: {
    resumo_tecnico: string;
    normas_relacionadas: string[];
    causas_adicionais: string[];
    recomendacoes_preventivas: string[];
    acoes_corretivas: string[];
    referencias_imca: string[];
  };
}

export default function DPIntelligenceCenter() {
  const [incidents, setIncidents] = useState<DPIncident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<DPIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<DPIncident | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DPIncident["ai_analysis"] | null>(null);

  // Filters
  const [classFilter, setClassFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadIncidents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [incidents, classFilter, statusFilter, searchQuery]);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("dp_incidents")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;

      setIncidents(data || []);
    } catch (error) {
      console.error("Error loading incidents:", error);
      toast.error("Erro ao carregar incidentes");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...incidents];

    if (classFilter !== "all") {
      filtered = filtered.filter((inc) => inc.class_dp === classFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((inc) => inc.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (inc) =>
          inc.title.toLowerCase().includes(query) ||
          inc.vessel.toLowerCase().includes(query) ||
          inc.location.toLowerCase().includes(query)
      );
    }

    setFilteredIncidents(filtered);
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: "bg-green-100 text-green-800 border-green-300",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
      high: "bg-orange-100 text-orange-800 border-orange-300",
      critical: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[severity as keyof typeof colors] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-gray-100 text-gray-800",
      analyzing: "bg-blue-100 text-blue-800",
      analyzed: "bg-purple-100 text-purple-800",
      reviewed: "bg-green-100 text-green-800",
      closed: "bg-slate-100 text-slate-800",
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const handleAnalyzeIncident = async (incident: DPIncident) => {
    setSelectedIncident(incident);
    setShowAnalysisModal(true);
    
    // If analysis already exists, show it
    if (incident.ai_analysis) {
      setAnalysis(incident.ai_analysis);
      return;
    }

    // Otherwise, generate new analysis
    try {
      setAnalyzing(true);
      setAnalysis(null);

      const { data, error } = await supabase.functions.invoke("dp-intel-analyze", {
        body: { incident },
      });

      if (error) throw error;

      if (data?.result) {
        setAnalysis(data.result);
        // Update local state
        setIncidents((prev) =>
          prev.map((inc) =>
            inc.id === incident.id
              ? { ...inc, ai_analysis: data.result, status: "analyzed" }
              : inc
          )
        );
        toast.success("Análise IA concluída com sucesso");
      }
    } catch (error) {
      console.error("Error analyzing incident:", error);
      toast.error("Erro ao analisar incidente com IA");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Centro de Inteligência DP</h1>
          <p className="text-gray-600 mt-2">
            Análise de incidentes de Posicionamento Dinâmico com IA
          </p>
        </div>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Ingerir IMCA
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar incidentes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Classe DP" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Classes</SelectItem>
                <SelectItem value="DP1">DP1</SelectItem>
                <SelectItem value="DP2">DP2</SelectItem>
                <SelectItem value="DP3">DP3</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="analyzing">Analisando</SelectItem>
                <SelectItem value="analyzed">Analisado</SelectItem>
                <SelectItem value="reviewed">Revisado</SelectItem>
                <SelectItem value="closed">Fechado</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={loadIncidents}>
              <Filter className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Incidentes</p>
                <p className="text-2xl font-bold">{incidents.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Críticos</p>
                <p className="text-2xl font-bold text-red-600">
                  {incidents.filter((i) => i.severity === "critical").length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Analisados</p>
                <p className="text-2xl font-bold text-green-600">
                  {incidents.filter((i) => i.ai_analysis).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-600">
                  {incidents.filter((i) => i.status === "pending").length}
                </p>
              </div>
              <Brain className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incident Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIncidents.map((incident) => (
          <Card key={incident.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge className={getSeverityColor(incident.severity)}>
                  {incident.severity.toUpperCase()}
                </Badge>
                <Badge className={getStatusColor(incident.status)} variant="outline">
                  {incident.status}
                </Badge>
              </div>
              <CardTitle className="text-lg line-clamp-2">{incident.title}</CardTitle>
              <div className="space-y-1 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Ship className="h-3 w-3 mr-1" />
                  {incident.vessel} - {incident.class_dp}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {incident.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(incident.date).toLocaleDateString("pt-BR")}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">{incident.summary}</p>
              <Button
                onClick={() => handleAnalyzeIncident(incident)}
                variant={incident.ai_analysis ? "outline" : "default"}
                className="w-full"
              >
                <Brain className="h-4 w-4 mr-2" />
                {incident.ai_analysis ? "Ver Análise IA" : "Analisar com IA"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIncidents.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum incidente encontrado com os filtros aplicados</p>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis Modal */}
      <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {analyzing ? "Analisando Incidente com IA..." : "Análise IA - Incidente DP"}
            </DialogTitle>
            <DialogDescription>
              {selectedIncident?.title}
            </DialogDescription>
          </DialogHeader>

          {analyzing && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-gray-600">Processando análise com GPT-4...</p>
            </div>
          )}

          {!analyzing && analysis && (
            <ScrollArea className="h-[600px] pr-4">
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="summary">Resumo</TabsTrigger>
                  <TabsTrigger value="standards">Normas</TabsTrigger>
                  <TabsTrigger value="causes">Causas</TabsTrigger>
                  <TabsTrigger value="prevention">Prevenção</TabsTrigger>
                  <TabsTrigger value="actions">Ações</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4 mt-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      ✅ Resumo Técnico
                    </h3>
                    <p className="text-sm text-blue-800">{analysis.resumo_tecnico}</p>
                  </div>
                </TabsContent>

                <TabsContent value="standards" className="space-y-4 mt-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      📚 Normas Relacionadas
                    </h3>
                    <ul className="space-y-2">
                      {analysis.normas_relacionadas.map((norma, idx) => (
                        <li key={idx} className="text-sm text-purple-800 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{norma}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h3 className="font-semibold text-indigo-900 mb-3 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      🔗 Referências IMCA
                    </h3>
                    <ul className="space-y-2">
                      {analysis.referencias_imca.map((ref, idx) => (
                        <li key={idx} className="text-sm text-indigo-800 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{ref}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="causes" className="space-y-4 mt-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-900 mb-3 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      📌 Possíveis Causas Adicionais
                    </h3>
                    <ul className="space-y-2">
                      {analysis.causas_adicionais.map((causa, idx) => (
                        <li key={idx} className="text-sm text-orange-800 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{causa}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="prevention" className="space-y-4 mt-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                      <Brain className="h-5 w-5 mr-2" />
                      🧠 Recomendações Preventivas
                    </h3>
                    <ul className="space-y-2">
                      {analysis.recomendacoes_preventivas.map((rec, idx) => (
                        <li key={idx} className="text-sm text-green-800 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4 mt-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-900 mb-3 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      📄 Ações Corretivas Possíveis
                    </h3>
                    <ul className="space-y-2">
                      {analysis.acoes_corretivas.map((acao, idx) => (
                        <li key={idx} className="text-sm text-red-800 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{acao}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>
          )}

          {!analyzing && !analysis && selectedIncident && (
            <div className="py-8 text-center">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Nenhuma análise disponível ainda</p>
              <Button onClick={() => handleAnalyzeIncident(selectedIncident)}>
                Gerar Análise com IA
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
