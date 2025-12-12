import { useEffect, useState, useCallback, useMemo } from "react";;
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Brain, 
  Search, 
  AlertTriangle, 
  FileText, 
  Ship, 
  MapPin, 
  Calendar,
  ExternalLink,
  Loader2,
  Filter,
  TrendingUp
} from "lucide-react";

interface DPIncident {
  id: string;
  title: string;
  incident_date: string;
  vessel: string | null;
  location: string | null;
  root_cause: string | null;
  dp_class: string | null;
  source: string | null;
  link: string | null;
  summary: string | null;
  tags: string[] | null;
  severity: string | null;
}

export const DPIntelCenter: React.FC = () => {
  const [incidents, setIncidents] = useState<DPIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIncident, setSelectedIncident] = useState<DPIncident | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [filterClass, setFilterClass] = useState<string>("all");

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from("dp_incidents")
        .select("*")
        .order("incident_date", { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      toast.error("Erro ao carregar incidentes");
    } finally {
      setLoading(false);
    }
  };

  const analyzeIncident = async (incident: DPIncident) => {
    setSelectedIncident(incident);
    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("dp-intel-analyze", {
        body: { incident, action: "analyze" }
      };

      if (error) throw error;
      setAnalysisResult(data.result);
    } catch (error) {
      console.error("Error analyzing incident:", error);
      toast.error("Erro ao analisar incidente");
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical": return "bg-red-100 text-red-800 border-red-300";
    case "high": return "bg-orange-100 text-orange-800 border-orange-300";
    case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
    default: return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.vessel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesClass = filterClass === "all" || incident.dp_class?.includes(filterClass);
    
    return matchesSearch && matchesClass;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-xl">Centro de Inteligência DP</CardTitle>
                <CardDescription>
                  Análise de incidentes IMCA/PEO-DP com IA
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {incidents.length} incidentes
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, embarcação ou tags..."
              value={searchTerm}
              onChange={handleChange}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {["all", "DP Class 2", "DP Class 3"].map((cls) => (
            <Button
              key={cls}
              variant={filterClass === cls ? "default" : "outline"}
              size="sm"
              onClick={handleSetFilterClass}
            >
              {cls === "all" ? "Todas Classes" : cls}
            </Button>
          ))}
        </div>
      </div>

      {/* Incidents Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIncidents.map((incident) => (
            <Card key={incident.id} className={`border-l-4 ${getSeverityColor(incident.severity || "medium")}`}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-semibold text-sm leading-tight">{incident.title}</h3>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {incident.dp_class}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {incident.summary}
                </p>

                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Ship className="h-3 w-3" /> {incident.vessel}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {incident.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {new Date(incident.incident_date).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {incident.tags?.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleanalyzeIncident}
                    disabled={analyzing}
                  >
                    <Brain className="h-3 w-3 mr-1" />
                    Analisar com IA
                  </Button>
                  {incident.link && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={incident.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Relatório
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Analysis Dialog */}
      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Análise IA: {selectedIncident?.title}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            {analyzing ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Analisando incidente com IA...</p>
              </div>
            ) : analysisResult ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-sm">
                  {analysisResult}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhuma análise disponível.</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DPIntelCenter;
