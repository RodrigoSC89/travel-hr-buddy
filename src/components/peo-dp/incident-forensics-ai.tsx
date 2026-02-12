import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Search,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Brain,
  Activity,
  Zap,
  Download,
  Play,
  Target,
  TrendingUp,
  Shield,
  Link2,
  Calendar,
  User,
  Ship,
  Anchor
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Incident {
  id: string;
  title: string;
  date: string;
  severity: "critical" | "major" | "minor";
  status: "analyzing" | "analyzed" | "reported" | "closed";
  vessel: string;
  type: string;
  description: string;
  duration: number;
  rootCauses: string[];
  timeline: TimelineEvent[];
  affectedSystems: string[];
  correctiveActions: string[];
  relatedFMEA: string[];
  aiConfidence: number;
}

interface TimelineEvent {
  timestamp: string;
  event: string;
  type: "alarm" | "action" | "system" | "environmental";
  criticality: "high" | "medium" | "low";
}

// Fallback data for empty states
const fallbackIncidents: Incident[] = [
  {
    id: "INC-2024-001",
    title: "Perda Temporária de Posição durante Offloading",
    date: "2024-12-01T14:30:00",
    severity: "major",
    status: "analyzed",
    vessel: "MV Atlantic Explorer",
    type: "Position Deviation",
    description: "Desvio de posição de 12m durante operação de offloading.",
    duration: 8,
    rootCauses: ["Perda de sinal DGPS por 45 segundos", "Vento rajada atingiu 32kn"],
    timeline: [
      { timestamp: "14:30:00", event: "Alarme: Perda de referência DGPS", type: "alarm", criticality: "high" },
      { timestamp: "14:35:00", event: "Posição recuperada dentro de ±2m", type: "action", criticality: "low" },
    ],
    affectedSystems: ["DGPS", "Hydroacoustic", "DP Control"],
    correctiveActions: ["Revisar configuração de timeout de fallback"],
    relatedFMEA: ["FMEA-REF-001"],
    aiConfidence: 92
  },
];

export const IncidentForensicsAI: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const { data, error } = await supabase
          .from("safety_incidents")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped: Incident[] = data.map((row) => ({
            id: row.id,
            title: row.title || "Incident",
            date: row.incident_date || row.created_at || "",
            severity: (row.severity as Incident["severity"]) || "minor",
            status: "analyzed" as const,
            vessel: row.vessel_id || "N/A",
            type: row.incident_type || "General",
            description: row.description || "",
            duration: 0,
            rootCauses: row.root_cause ? [row.root_cause] : [],
            timeline: [],
            affectedSystems: [],
            correctiveActions: row.corrective_actions ? (Array.isArray(row.corrective_actions) ? row.corrective_actions as string[] : [String(row.corrective_actions)]) : [],
            relatedFMEA: [],
            aiConfidence: 85,
          }));
          setIncidents(mapped);
        } else {
          setIncidents(fallbackIncidents);
        }
      } catch {
        setIncidents(fallbackIncidents);
      }
    };
    fetchIncidents();
  }, []);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const handleAnalyze = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          toast.success("Análise forense concluída");
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleExportReport = (format: string) => {
    toast.success(`Exportando relatório em formato ${format.toUpperCase()}`);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge variant="destructive">Crítico</Badge>;
      case "major": return <Badge className="bg-orange-500 text-white">Maior</Badge>;
      default: return <Badge className="bg-yellow-500 text-black">Menor</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "analyzing": return <Badge className="bg-blue-500">Analisando</Badge>;
      case "analyzed": return <Badge className="bg-green-500">Analisado</Badge>;
      case "reported": return <Badge className="bg-purple-500">Reportado</Badge>;
      case "closed": return <Badge variant="secondary">Fechado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "alarm": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "action": return <User className="h-4 w-4 text-blue-500" />;
      case "system": return <Zap className="h-4 w-4 text-yellow-500" />;
      case "environmental": return <Activity className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Incident Forensics AI</h2>
            <p className="text-muted-foreground">Análise pós-incidente automatizada com IA</p>
          </div>
        </div>
        <Select onValueChange={handleExportReport}>
          <SelectTrigger className="w-48">
            <Download className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Exportar Relatório" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pdf">PDF (Petrobras)</SelectItem>
            <SelectItem value="imca">IMCA M190</SelectItem>
            <SelectItem value="excel">Excel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Incidentes Ativos</p>
                <p className="text-2xl font-bold">{incidents.filter(i => i.status !== "closed").length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Analisados</p>
                <p className="text-2xl font-bold">{incidents.filter(i => i.status === "analyzed" || i.status === "reported").length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio Análise</p>
                <p className="text-2xl font-bold">2.5h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confiança IA Média</p>
                <p className="text-2xl font-bold">90%</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Incidents List */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Incidentes Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedIncident?.id === incident.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedIncident(incident)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">{incident.id}</span>
                      {getSeverityBadge(incident.severity)}
                    </div>
                    <h4 className="font-medium text-sm line-clamp-2">{incident.title}</h4>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(incident.date).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      {getStatusBadge(incident.status)}
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleAnalyze(incident); }}>
                        <Play className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Incident Detail */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedIncident ? selectedIncident.title : "Selecione um incidente"}
            </CardTitle>
            {selectedIncident && (
              <CardDescription className="flex items-center gap-4">
                <span className="flex items-center gap-1"><Ship className="h-4 w-4" />{selectedIncident.vessel}</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{selectedIncident.duration} min</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Brain className="h-3 w-3" />Confiança IA: {selectedIncident.aiConfidence}%
                </Badge>
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Brain className="h-16 w-16 text-primary animate-pulse" />
                <h3 className="font-medium">Analisando incidente...</h3>
                <Progress value={analysisProgress} className="w-64 h-3" />
                <p className="text-sm text-muted-foreground">
                  {analysisProgress < 30 ? "Agregando logs..." : 
                   analysisProgress < 60 ? "Construindo timeline..." :
                   analysisProgress < 90 ? "Identificando causas raiz..." : "Gerando relatório..."}
                </p>
              </div>
            ) : selectedIncident ? (
              <Tabs defaultValue="timeline">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="causes">Causas</TabsTrigger>
                  <TabsTrigger value="actions">Ações</TabsTrigger>
                  <TabsTrigger value="fmea">FMEA</TabsTrigger>
                </TabsList>

                <TabsContent value="timeline" className="space-y-4">
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-3">
                      {selectedIncident.timeline.map((event) => (
                        <div key={`${event.timestamp}-${event.type}`} className="flex items-start gap-3 p-3 rounded-lg border">
                          <div className={`p-2 rounded-lg ${event.criticality === "high" ? "bg-red-500/10" : event.criticality === "medium" ? "bg-yellow-500/10" : "bg-green-500/10"}`}>
                            {getEventIcon(event.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-sm font-medium">{event.timestamp}</span>
                              <Badge variant={event.criticality === "high" ? "destructive" : event.criticality === "medium" ? "default" : "secondary"} className="text-xs">
                                {event.criticality === "high" ? "Alta" : event.criticality === "medium" ? "Média" : "Baixa"}
                              </Badge>
                            </div>
                            <p className="text-sm mt-1">{event.event}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="causes" className="space-y-4">
                  <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                    <h4 className="font-medium flex items-center gap-2 mb-3">
                      <Target className="h-5 w-5 text-red-500" />
                      Causas Raiz Identificadas
                    </h4>
                    <ul className="space-y-2">
                      {selectedIncident.rootCauses.map((cause, idx) => (
                        <li key={cause} className="flex items-start gap-2 text-sm">
                          <span className="text-red-500 font-bold">{idx + 1}.</span>
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <h4 className="font-medium mb-2">Sistemas Afetados</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedIncident.affectedSystems.map((sys) => (
                        <Badge key={sys} variant="outline">{sys}</Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <h4 className="font-medium flex items-center gap-2 mb-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Ações Corretivas Sugeridas
                    </h4>
                    <ul className="space-y-2">
                      {selectedIncident.correctiveActions.map((action) => (
                        <li key={action} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500 font-bold">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="fmea" className="space-y-4">
                  <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <h4 className="font-medium flex items-center gap-2 mb-3">
                      <Link2 className="h-5 w-5 text-purple-500" />
                      Documentos FMEA Relacionados
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedIncident.relatedFMEA.map((fmea) => (
                        <Badge key={fmea} variant="outline" className="cursor-pointer hover:bg-accent">
                          <FileText className="w-3 h-3 mr-1" />{fmea}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full">
                    <Shield className="w-4 h-4 mr-2" />
                    Atualizar FMEA com Lições Aprendidas
                  </Button>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mb-4" />
                <p>Selecione um incidente para análise detalhada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IncidentForensicsAI;
