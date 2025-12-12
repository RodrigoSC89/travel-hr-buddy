import { useEffect, useState, useCallback } from "react";;;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, FileText, Brain, Zap } from "lucide-react";
import { toast } from "sonner";

interface DPIncident {
  id: string;
  title: string;
  vessel: string;
  location: string;
  dp_class: string;
  severity: string;
  status: string;
  root_cause: string;
  tags: string[];
  imca_report_url: string;
  ai_analysis?: {
    summary: string;
    standards: string[];
    root_causes: string[];
    preventive_measures: string[];
    corrective_actions: string[];
  };
  plan_of_action?: {
    diagnostico: string;
    causa_raiz: string;
    acoes_corretivas: string[];
    acoes_preventivas: string[];
    responsavel: string;
    prazo: string;
    normas: string[];
  } | null;
}

// Demo data for development/testing
const DEMO_INCIDENTS: DPIncident[] = [
  {
    id: "imca-2025-014",
    title: "Loss of Position Due to Gyro Drift",
    vessel: "DP Shuttle Tanker X",
    location: "Campos Basin",
    dp_class: "DP-2",
    severity: "critical",
    status: "analyzed",
    root_cause: "Gyro sensor drift without proper monitoring",
    tags: ["gyro", "positioning", "sensors"],
    imca_report_url: "https://www.imca-int.com/safety-events/",
    ai_analysis: {
      summary: "Critical incident involving gyro drift leading to loss of position",
      standards: ["IMCA M103", "IMCA M117"],
      root_causes: ["Sensor drift", "Inadequate monitoring"],
      preventive_measures: ["Regular gyro calibration", "Enhanced monitoring"],
      corrective_actions: ["Immediate position recovery", "System reset"]
    },
    plan_of_action: null
  },
  {
    id: "imca-2025-023",
    title: "Thruster Control Software Failure",
    vessel: "DP DSV Subsea Alpha",
    location: "North Sea",
    dp_class: "DP-3",
    severity: "high",
    status: "pending",
    root_cause: "Software bug in thruster control system",
    tags: ["thruster", "software", "control"],
    imca_report_url: "https://www.imca-int.com/safety-events/",
    plan_of_action: null
  },
  {
    id: "imca-2025-031",
    title: "Power Management System Overload",
    vessel: "DP Construction Vessel B",
    location: "Gulf of Mexico",
    dp_class: "DP-2",
    severity: "high",
    status: "analyzed",
    root_cause: "Inadequate power distribution management",
    tags: ["pms", "power", "electrical"],
    imca_report_url: "https://www.imca-int.com/safety-events/",
    ai_analysis: {
      summary: "Power management system experienced overload conditions",
      standards: ["IMCA M103", "IMO MSC.1/Circ.1580"],
      root_causes: ["Power distribution issues", "Load imbalance"],
      preventive_measures: ["Power system review", "Load management"],
      corrective_actions: ["System reconfiguration", "Load balancing"]
    },
    plan_of_action: null
  },
  {
    id: "imca-2025-042",
    title: "Reference System Failure",
    vessel: "DP Platform Supply Vessel",
    location: "West Africa",
    dp_class: "DP-2",
    severity: "medium",
    status: "pending",
    root_cause: "Multiple reference system failures",
    tags: ["reference", "positioning", "redundancy"],
    imca_report_url: "https://www.imca-int.com/safety-events/",
    plan_of_action: null
  }
];

export default function DPIntelligenceCenter() {
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<DPIncident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<DPIncident[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDPClass, setSelectedDPClass] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<DPIncident | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState<string | null>(null);

  useEffect(() => {
    loadIncidents();
  }, []);

  useEffect(() => {
    filterIncidents();
  }, [incidents, searchQuery, selectedDPClass, selectedStatus]);

  async function loadIncidents() {
    setLoading(true);
    try {
      // Try to fetch from API, fallback to demo data
      const response = await fetch("/api/dp-incidents");
      if (response.ok) {
        const data = await response.json();
        setIncidents(data);
      } else {
        setIncidents(DEMO_INCIDENTS);
      }
    } catch (error) {
      // Use demo data on error
      setIncidents(DEMO_INCIDENTS);
    } finally {
      setLoading(false);
    }
  }

  function filterIncidents() {
    let filtered = [...incidents];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (inc) =>
          inc.title.toLowerCase().includes(query) ||
          inc.vessel.toLowerCase().includes(query) ||
          inc.location.toLowerCase().includes(query) ||
          inc.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (selectedDPClass) {
      filtered = filtered.filter((inc) => inc.dp_class === selectedDPClass);
    }

    if (selectedStatus) {
      filtered = filtered.filter((inc) => inc.status === selectedStatus);
    }

    setFilteredIncidents(filtered);
  }

  function clearFilters() {
    setSearchQuery("");
    setSelectedDPClass(null);
    setSelectedStatus(null);
  }

  async function generateActionPlan(incident: DPIncident) {
    setGeneratingPlan(incident.id);
    try {
      const response = await fetch("/api/dp-incidents/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incident_id: incident.id })
      };

      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.plan_of_action) {
          // Update incident with generated plan
          setIncidents(prev =>
            prev.map(inc =>
              inc.id === incident.id
                ? { ...inc, plan_of_action: data.plan_of_action }
                : inc
            )
          );
          toast.success("Plano de ação gerado com sucesso");
        } else {
          toast.error("Erro ao gerar plano de ação");
        }
      } else {
        toast.error("Erro ao gerar plano de ação");
      }
    } catch (error) {
      toast.error("Erro ao gerar plano de ação");
    } finally {
      setGeneratingPlan(null);
    }
  }

  const stats = {
    total: incidents.length,
    analyzed: incidents.filter((inc) => inc.status === "analyzed").length,
    pending: incidents.filter((inc) => inc.status === "pending").length,
    critical: incidents.filter((inc) => inc.severity === "critical").length
  };

  const hasActiveFilters = searchQuery || selectedDPClass || selectedStatus;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Carregando incidentes...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total de Incidentes</div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:bg-accent"
          onClick={handleSetSelectedStatus}
        >
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.analyzed}</div>
            <div className="text-sm text-muted-foreground">Analisados</div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:bg-accent"
          onClick={handleSetSelectedStatus}
        >
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pendentes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.critical}</div>
            <div className="text-sm text-muted-foreground">Críticos</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <Input
            placeholder="Buscar por título, embarcação, local ou tags..."
            value={searchQuery}
            onChange={handleChange}
          />
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedDPClass === "DP-1" ? "default" : "outline"}
              size="sm"
              onClick={handleSetSelectedDPClass}
            >
              DP-1
            </Button>
            <Button
              variant={selectedDPClass === "DP-2" ? "default" : "outline"}
              size="sm"
              onClick={handleSetSelectedDPClass}
            >
              DP-2
            </Button>
            <Button
              variant={selectedDPClass === "DP-3" ? "default" : "outline"}
              size="sm"
              onClick={handleSetSelectedDPClass}
            >
              DP-3
            </Button>
            
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpar
              </Button>
            )}
          </div>

          {hasActiveFilters && (
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredIncidents.length} de {incidents.length} incidentes
            </p>
          )}
        </CardContent>
      </Card>

      {/* Incidents List */}
      {filteredIncidents.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p className="font-medium">Nenhum incidente encontrado</p>
            <p className="text-sm">Tente ajustar os filtros de busca</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredIncidents.map((incident) => (
            <Card key={incident.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-lg">{incident.title}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={
                        incident.severity === "critical" ? "destructive" :
                          incident.severity === "high" ? "default" :
                            incident.severity === "medium" ? "secondary" : "outline"
                      }>
                        {incident.severity}
                      </Badge>
                      <Badge variant={incident.status === "analyzed" ? "default" : "secondary"}>
                        {incident.status === "analyzed" ? "Analisado" : "Pendente"}
                      </Badge>
                      <Badge variant="outline">{incident.dp_class}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Embarcação:</span> {incident.vessel}
                  </div>
                  <div>
                    <span className="font-medium">Local:</span> {incident.location}
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium">Causa Raiz:</span> {incident.root_cause}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {incident.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(incident.imca_report_url, "_blank"}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Relatório
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSetSelectedIncident}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Analisar IA
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlegenerateActionPlan}
                    disabled={generatingPlan === incident.id}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {generatingPlan === incident.id ? "Gerando..." : "Plano de Ação"}
                  </Button>
                </div>

                {incident.plan_of_action && (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full">
                        📋 Plano de Ação Gerado
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 p-4 bg-muted rounded-lg">
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Diagnóstico:</strong> {incident.plan_of_action.diagnostico}
                        </div>
                        <div>
                          <strong>Causa Raiz:</strong> {incident.plan_of_action.causa_raiz}
                        </div>
                        <div>
                          <strong>Ações Corretivas:</strong>
                          <ul className="list-disc list-inside">
                            {incident.plan_of_action.acoes_corretivas.map((action, i) => (
                              <li key={i}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* AI Analysis Modal */}
      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Análise IA – {selectedIncident?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedIncident?.ai_analysis ? (
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="summary">📄 Resumo</TabsTrigger>
                <TabsTrigger value="standards">📚 Normas</TabsTrigger>
                <TabsTrigger value="causes">⚠️ Causas</TabsTrigger>
                <TabsTrigger value="prevention">💡 Prevenção</TabsTrigger>
                <TabsTrigger value="actions">📋 Ações</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-4">
                <p>{selectedIncident.ai_analysis.summary}</p>
              </TabsContent>
              
              <TabsContent value="standards" className="space-y-2">
                <ul className="list-disc list-inside">
                  {selectedIncident.ai_analysis.standards.map((std, i) => (
                    <li key={i}>{std}</li>
                  ))}
                </ul>
              </TabsContent>
              
              <TabsContent value="causes" className="space-y-2">
                <ul className="list-disc list-inside">
                  {selectedIncident.ai_analysis.root_causes.map((cause, i) => (
                    <li key={i}>{cause}</li>
                  ))}
                </ul>
              </TabsContent>
              
              <TabsContent value="prevention" className="space-y-2">
                <ul className="list-disc list-inside">
                  {selectedIncident.ai_analysis.preventive_measures.map((measure, i) => (
                    <li key={i}>{measure}</li>
                  ))}
                </ul>
              </TabsContent>
              
              <TabsContent value="actions" className="space-y-2">
                <ul className="list-disc list-inside">
                  {selectedIncident.ai_analysis.corrective_actions.map((action, i) => (
                    <li key={i}>{action}</li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          ) : (
            <p className="text-muted-foreground">Análise IA não disponível para este incidente.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
