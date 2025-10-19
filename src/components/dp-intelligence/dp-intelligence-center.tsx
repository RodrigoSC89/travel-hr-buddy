import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  BookOpen,
  Lightbulb,
  CheckSquare,
  Wrench,
  Mail
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PlanStatusSelect } from "@/components/dp/PlanStatusSelect";

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
  plan_of_action?: PlanOfAction | null;
  plan_sent_to?: string | null;
  plan_sent_at?: string | null;
  plan_status?: "pendente" | "em andamento" | "concluído";
  plan_updated_at?: string;
}

interface PlanOfAction {
  diagnostico: string;
  causa_raiz: string;
  acoes_corretivas: string[];
  acoes_preventivas: string[];
  responsavel: string;
  prazo: string;
  normas: string[];
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
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [generatingAction, setGeneratingAction] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
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
      
      // First, try to fetch from the database
      const { data: dbIncidents, error: dbError } = await supabase
        .from("dp_incidents")
        .select("*")
        .order("date", { ascending: false });

      if (dbIncidents && dbIncidents.length > 0) {
        // Map database fields to component interface
        const incidentsWithStatus = dbIncidents.map((inc: unknown) => ({
          id: inc.id,
          title: inc.title,
          date: inc.incident_date || inc.date,
          vessel: inc.vessel,
          location: inc.location,
          classDP: inc.class_dp,
          rootCause: inc.root_cause,
          tags: inc.tags || [],
          summary: inc.summary || inc.description || "",
          link: inc.link || "",
          severity: inc.severity || determineSeverity({
            id: inc.id,
            title: inc.title,
            date: inc.date,
            vessel: inc.vessel,
            location: inc.location,
            classDP: inc.class_dp,
            rootCause: inc.root_cause,
            tags: inc.tags || [],
            summary: inc.summary || "",
            link: inc.link || ""
          }),
          status: inc.status || "pending",
          plan_of_action: inc.plan_of_action || null,
          plan_sent_to: inc.plan_sent_to || null,
          plan_sent_at: inc.plan_sent_at || null,
          plan_status: inc.plan_status || null
        }));
        setIncidents(incidentsWithStatus);
      } else {
        // If no data in DB, try the function endpoint
        const response = await fetch("/functions/v1/dp-intel-feed");
        if (response.ok) {
          const data = await response.json();
          const incidentsWithStatus = (data.incidents || []).map((inc: Incident) => ({
            ...inc,
            severity: inc.severity || determineSeverity(inc),
            status: inc.status || "pending",
            plan_of_action: inc.plan_of_action || null,
            plan_sent_to: inc.plan_sent_to || null,
            plan_sent_at: inc.plan_sent_at || null,
            plan_status: inc.plan_status || null
          }));
          setIncidents(incidentsWithStatus);
        } else {
          loadDemoData();
        }
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
        status: "pending",
        plan_of_action: null,
        plan_sent_to: null,
        plan_sent_at: null,
        plan_status: null
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
        status: "analyzed",
        plan_of_action: null,
        plan_sent_to: null,
        plan_sent_at: null,
        plan_status: null
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
        status: "pending",
        plan_of_action: null,
        plan_sent_to: null,
        plan_sent_at: null,
        plan_status: null
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
        status: "analyzed",
        plan_of_action: null,
        plan_sent_to: null,
        plan_sent_at: null,
        plan_status: null
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
  }, [searchQuery, selectedClass, selectedStatus, incidents]);

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
        setAnalysis({
          summary: extractSection(result, "Resumo", "Normas") || result,
          standards: extractSection(result, "Normas", "Causas") || "Nenhuma norma específica identificada.",
          causes: extractSection(result, "Causas", "Prevenção") || "Análise de causas não disponível.",
          prevention: extractSection(result, "Prevenção", "Ações") || "Recomendações de prevenção não disponíveis.",
          actions: extractSection(result, "Ações", null) || "Ações corretivas não especificadas."
        });
        toast.success("Análise concluída com sucesso");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Erro inesperado ao analisar incidente");
    } finally {
      setAnalyzing(false);
    }
  };

  const extractSection = (text: string, startMarker: string, endMarker: string | null): string => {
    const startIndex = text.indexOf(startMarker);
    if (startIndex === -1) return "";
    
    const contentStart = startIndex + startMarker.length;
    const endIndex = endMarker ? text.indexOf(endMarker, contentStart) : text.length;
    
    return text.substring(contentStart, endIndex === -1 ? text.length : endIndex).trim();
  };

  const handleGenerateAction = async (id: string) => {
    setGeneratingAction(id);
    try {
      const response = await fetch("/api/dp-incidents/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao gerar plano de ação");
      }

      const data = await response.json();
      
      if (data.ok) {
        toast.success("Plano de ação gerado com sucesso");
        // Refresh incidents to get updated data
        await fetchIncidents();
      } else {
        throw new Error("Erro ao gerar plano de ação");
      }
    } catch (error) {
      console.error("Error generating action plan:", error);
      toast.error("Erro ao gerar plano de ação", {
        description: error instanceof Error ? error.message : "Tente novamente mais tarde"
      });
    } finally {
      setGeneratingAction(null);
    }
  };

  const handleSendPlan = async (id: string) => {
    const email = prompt("Para qual e-mail enviar o plano de ação?");
    if (!email) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Email inválido", {
        description: "Por favor, insira um endereço de email válido"
      });
      return;
    }

    setSendingEmail(id);
    try {
      const response = await fetch("/api/dp-incidents/send-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao enviar plano de ação");
      }

      const data = await response.json();
      
      if (data.ok) {
        toast.success("Plano de ação enviado com sucesso", {
          description: `Email enviado para ${email}`
        });
        // Refresh incidents to get updated data
        await fetchIncidents();
      } else {
        throw new Error("Erro ao enviar plano de ação");
      }
    } catch (error) {
      console.error("Error sending action plan:", error);
      toast.error("Erro ao enviar plano de ação", {
        description: error instanceof Error ? error.message : "Tente novamente mais tarde"
      });
    } finally {
      setSendingEmail(null);
    }
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (selectedIncident) {
      // Update selected incident
      setSelectedIncident({
        ...selectedIncident,
        plan_status: newStatus as "pendente" | "em andamento" | "concluído",
        plan_updated_at: new Date().toISOString()
      });

      // Update incidents list
      setIncidents(prevIncidents => 
        prevIncidents.map(inc => 
          inc.id === selectedIncident.id 
            ? { ...inc, plan_status: newStatus as "pendente" | "em andamento" | "concluído", plan_updated_at: new Date().toISOString() }
            : inc
        )
      );
    }
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

      {/* IMCA Audit Quick Access */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            IMCA DP Technical Audit System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            AI-powered audit system following IMCA, IMO, and MTS international standards. 
            Generate comprehensive technical audits for DP vessels with automated compliance analysis.
          </p>
          <Button 
            onClick={() => window.location.href = "/imca-audit"}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
          >
            <FileText className="mr-2 h-4 w-4" />
            Gerar Auditoria IMCA
          </Button>
        </CardContent>
      </Card>

      {/* Search and Filter Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, embarcação, local ou tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
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
              {(selectedClass || selectedStatus) && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedClass(null);
                    setSelectedStatus(null);
                  }}
                  className="whitespace-nowrap"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
          {(searchQuery || selectedClass || selectedStatus) && (
            <div className="mt-4 text-sm text-muted-foreground">
              Mostrando {filteredIncidents.length} de {stats.total} incidentes
              {selectedClass && ` (DP Class ${selectedClass})`}
              {selectedStatus && ` (${selectedStatus === "analyzed" ? "Analisados" : "Pendentes"})`}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incidents List */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIncidents.map((incident) => (
            <Card key={incident.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <CardTitle className="text-base leading-tight">{incident.title}</CardTitle>
                  <Badge className={getSeverityColor(incident.severity)}>
                    {incident.severity || "medium"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getClassBadgeColor(incident.classDP)}>
                    {incident.classDP}
                  </Badge>
                  <Badge variant={incident.status === "analyzed" ? "default" : "secondary"}>
                    {incident.status === "analyzed" ? "Analisado" : "Pendente"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{incident.date}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm line-clamp-3">{incident.summary}</p>
                
                <div className="space-y-2">
                  <div className="text-xs">
                    <span className="font-semibold">Embarcação:</span> {incident.vessel}
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold">Local:</span> {incident.location}
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold">Causa Raiz:</span> {incident.rootCause}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {incident.tags?.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {incident.tags?.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{incident.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.open(incident.link, "_blank")}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Relatório
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleGenerateAction(incident.id)}
                    disabled={generatingAction === incident.id}
                  >
                    <Wrench className="h-4 w-4 mr-1" />
                    {generatingAction === incident.id ? "Gerando..." : "Plano de Ação"}
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleAnalyzeIncident(incident)}
                  >
                    <Brain className="h-4 w-4 mr-1" />
                    Analisar IA
                  </Button>
                </div>

                {incident.plan_of_action && (
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      className="flex-1"
                      onClick={() => handleSendPlan(incident.id)}
                      disabled={sendingEmail === incident.id}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      {sendingEmail === incident.id ? "Enviando..." : "📩 Enviar por E-mail"}
                    </Button>
                  </div>
                )}

                {incident.plan_sent_at && (
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 dark:text-green-400">✓ Enviado em {new Date(incident.plan_sent_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                    {incident.plan_status && (
                      <div>
                        Status: <Badge variant="outline" className="text-xs">
                          {incident.plan_status}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                {!incident.plan_sent_at && incident.plan_of_action && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span className="text-gray-500">Não enviado</span>
                  </div>
                )}

                {incident.plan_of_action && (
                  <details className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-sm mt-2">
                    <summary className="cursor-pointer text-blue-600 dark:text-blue-400 font-semibold mb-2">
                      📋 Plano de Ação Gerado
                    </summary>
                    <div className="space-y-3 mt-3">
                      <div>
                        <h4 className="font-semibold mb-1">🧠 Diagnóstico Técnico:</h4>
                        <p className="text-xs">{incident.plan_of_action.diagnostico}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">🛠️ Causa Raiz Provável:</h4>
                        <p className="text-xs">{incident.plan_of_action.causa_raiz}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">✅ Ações Corretivas:</h4>
                        <ul className="list-disc list-inside text-xs space-y-1">
                          {incident.plan_of_action.acoes_corretivas?.map((acao, idx) => (
                            <li key={idx}>{acao}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">🔄 Ações Preventivas:</h4>
                        <ul className="list-disc list-inside text-xs space-y-1">
                          {incident.plan_of_action.acoes_preventivas?.map((acao, idx) => (
                            <li key={idx}>{acao}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <h4 className="font-semibold mb-1">📌 Responsável:</h4>
                          <p className="text-xs">{incident.plan_of_action.responsavel}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">⏱️ Prazo:</h4>
                          <p className="text-xs">{incident.plan_of_action.prazo}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">🔗 Normas Referenciadas:</h4>
                        <div className="flex flex-wrap gap-1">
                          {incident.plan_of_action.normas?.map((norma, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {norma}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
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

          {/* Plan Status Update - shown when incident has an action plan */}
          {selectedIncident?.plan_of_action && (
            <div className="mt-6 p-4 border-t">
              <PlanStatusSelect 
                incident={selectedIncident} 
                onUpdate={handleStatusUpdate}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DPIntelligenceCenter;
