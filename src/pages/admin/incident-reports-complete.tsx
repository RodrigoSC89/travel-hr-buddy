import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Plus, FileText, Clock, CheckCircle, User, MessageSquare, Upload, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { logger } from "@/lib/logger";

const loadJsPDF = async () => {
  const [{ default: jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable")
  ]);
  return { jsPDF, autoTable: autoTableModule.default };
};

interface IncidentReport {
  id: string;
  incident_number: string | null;
  title: string;
  description: string;
  severity: string;
  status: string;
  reported_by: string | null;
  assigned_to: string | null;
  incident_date: string | null;
  location: string;
  code: string;
  type: string;
  created_at: string | null;
  updated_at: string | null;
  metadata: Record<string, any> | null;
}

// In-memory followup storage (incident_followups table doesn't exist)
interface IncidentFollowup {
  id: string;
  incident_id: string;
  followup_type: string;
  description: string;
  created_by_name: string;
  previous_status: string;
  new_status: string;
  created_at: string;
}

const followupStore: IncidentFollowup[] = [];

export default function IncidentReportsComplete() {
  const { toast } = useToast();
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [followups, setFollowups] = useState<IncidentFollowup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  
  const [newIncident, setNewIncident] = useState({
    title: "",
    description: "",
    severity: "medium",
    category: "operational",
    incident_location: "",
    impact_level: "moderate",
    incident_date: new Date().toISOString(),
  });
  
  const [newFollowup, setNewFollowup] = useState({
    followup_type: "update",
    description: "",
    new_status: ""
  });

  useEffect(() => {
    loadIncidents();
    
    const channel = supabase
      .channel("incident-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "incident_reports" }, (payload) => {
        setIncidents(prev => [payload.new as IncidentReport, ...prev]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "incident_reports" }, (payload) => {
        setIncidents(prev => prev.map(inc => inc.id === payload.new.id ? payload.new as IncidentReport : inc));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadIncidents = async () => {
    try {
      // incident_reports table exists in schema
      const { data, error } = await supabase
        .from("incident_reports")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setIncidents((data || []) as IncidentReport[]);
    } catch (error) {
      logger.error("Error loading incidents", { error });
      toast({
        title: "Erro",
        description: "Falha ao carregar incidentes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFollowups = async (incidentId: string) => {
    // incident_followups table doesn't exist - use in-memory store
    const filtered = followupStore.filter(f => f.incident_id === incidentId);
    setFollowups(filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  };

  const createIncident = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const incidentNumber = `INC-${Date.now()}`;
      
      // incident_reports requires: code, description, location, severity, title, type
      const { data, error } = await supabase
        .from("incident_reports")
        .insert({
          code: incidentNumber,
          incident_number: incidentNumber,
          title: newIncident.title,
          description: newIncident.description,
          severity: newIncident.severity,
          type: newIncident.category,
          location: newIncident.incident_location || "N/A",
          reported_by: user.id,
          incident_date: newIncident.incident_date,
          metadata: { impact_level: newIncident.impact_level },
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: `Incidente ${incidentNumber} criado com sucesso`
      });
      
      setIsCreateDialogOpen(false);
      setNewIncident({
        title: "",
        description: "",
        severity: "medium",
        category: "operational",
        incident_location: "",
        impact_level: "moderate",
        incident_date: new Date().toISOString(),
      });
      
    } catch (error) {
      logger.error("Error creating incident", { error });
      toast({
        title: "Erro",
        description: "Falha ao criar incidente",
        variant: "destructive"
      });
    }
  };

  const addFollowup = async () => {
    if (!selectedIncident || !newFollowup.description) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Store followup in-memory (table doesn't exist)
      const followup: IncidentFollowup = {
        id: `followup-${Date.now()}`,
        incident_id: selectedIncident.id,
        followup_type: newFollowup.followup_type,
        description: newFollowup.description,
        created_by_name: user.email?.split("@")[0] || "Unknown",
        previous_status: selectedIncident.status,
        new_status: newFollowup.new_status || selectedIncident.status,
        created_at: new Date().toISOString(),
      };

      followupStore.push(followup);
      
      // Update incident status if changed
      if (newFollowup.new_status && newFollowup.new_status !== selectedIncident.status) {
        await supabase
          .from("incident_reports")
          .update({ 
            status: newFollowup.new_status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedIncident.id);
      }
      
      toast({
        title: "Sucesso",
        description: "Atualização adicionada com sucesso"
      });
      
      await loadFollowups(selectedIncident.id);
      setNewFollowup({
        followup_type: "update",
        description: "",
        new_status: ""
      });
      
    } catch (error) {
      logger.error("Error adding followup", { error });
      toast({
        title: "Erro",
        description: "Falha ao adicionar atualização",
        variant: "destructive"
      });
    }
  };

  const exportToPDF = async (incident: IncidentReport) => {
    const { jsPDF } = await loadJsPDF();
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Relatório de Incidente", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Número: ${incident.incident_number || incident.code}`, 20, 35);
    doc.text(`Título: ${incident.title}`, 20, 45);
    doc.text(`Severidade: ${incident.severity.toUpperCase()}`, 20, 55);
    doc.text(`Tipo: ${incident.type}`, 20, 65);
    doc.text(`Status: ${incident.status}`, 20, 75);
    doc.text(`Local: ${incident.location || "N/A"}`, 20, 85);
    doc.text(`Data: ${incident.incident_date ? new Date(incident.incident_date).toLocaleString("pt-BR") : "N/A"}`, 20, 95);
    
    doc.text("Descrição:", 20, 110);
    const splitDescription = doc.splitTextToSize(incident.description, 170);
    doc.text(splitDescription, 20, 120);
    
    if (followups.length > 0) {
      let yPos = 140 + (splitDescription.length * 7);
      doc.text("Histórico de Acompanhamento:", 20, yPos);
      yPos += 10;
      
      followups.forEach((followup, index) => {
        doc.setFontSize(10);
        doc.text(`${index + 1}. ${followup.created_by_name} - ${followup.followup_type}`, 20, yPos);
        yPos += 7;
        const splitFollowup = doc.splitTextToSize(followup.description, 170);
        doc.text(splitFollowup, 25, yPos);
        yPos += (splitFollowup.length * 7) + 5;
        
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });
    }
    
    doc.save(`incident-${incident.incident_number || incident.code}.pdf`);
    
    toast({
      title: "Sucesso",
      description: "PDF exportado com sucesso"
    });
  };

  const getFilteredIncidents = () => {
    return incidents.filter(inc => {
      const statusMatch = filterStatus === "all" || inc.status === filterStatus;
      const severityMatch = filterSeverity === "all" || inc.severity === filterSeverity;
      return statusMatch && severityMatch;
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical": return "destructive";
    case "high": return "destructive";
    case "medium": return "secondary";
    case "low": return "default";
    default: return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "pending": return <Clock className="h-4 w-4" />;
    case "under_analysis": return <FileText className="h-4 w-4" />;
    case "resolved": return <CheckCircle className="h-4 w-4" />;
    case "closed": return <CheckCircle className="h-4 w-4" />;
    default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const openIncidentDetail = async (incident: IncidentReport) => {
    setSelectedIncident(incident);
    await loadFollowups(incident.id);
    setIsDetailDialogOpen(true);
  };

  const activeIncidents = incidents.filter(i => ["pending", "under_analysis"].includes(i.status));
  const resolvedIncidents = incidents.filter(i => ["resolved", "closed"].includes(i.status));
  const criticalIncidents = incidents.filter(i => i.severity === "critical" && !["resolved", "closed"].includes(i.status));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-8 w-8" />
            Gestão de Incidentes
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema completo de registro e acompanhamento de incidentes
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Incidente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Novo Incidente</DialogTitle>
              <DialogDescription>
                Preencha as informações do incidente para criar um novo registro
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={newIncident.title}
                  onChange={(e) => setNewIncident({...newIncident, title: e.target.value})}
                  placeholder="Título breve do incidente"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                  placeholder="Descreva o incidente detalhadamente"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Severidade</Label>
                  <Select value={newIncident.severity} onValueChange={(value) => setNewIncident({...newIncident, severity: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select value={newIncident.category} onValueChange={(value) => setNewIncident({...newIncident, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="safety">Segurança</SelectItem>
                      <SelectItem value="operational">Operacional</SelectItem>
                      <SelectItem value="environmental">Ambiental</SelectItem>
                      <SelectItem value="equipment">Equipamento</SelectItem>
                      <SelectItem value="personnel">Pessoal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Local</Label>
                  <Input
                    value={newIncident.incident_location}
                    onChange={(e) => setNewIncident({...newIncident, incident_location: e.target.value})}
                    placeholder="Local do incidente"
                  />
                </div>
                <div>
                  <Label>Impacto</Label>
                  <Select value={newIncident.impact_level} onValueChange={(value) => setNewIncident({...newIncident, impact_level: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minor">Menor</SelectItem>
                      <SelectItem value="moderate">Moderado</SelectItem>
                      <SelectItem value="major">Maior</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={createIncident}>
                Criar Incidente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Incidentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{activeIncidents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resolvedIncidents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalIncidents.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 items-center">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="under_analysis">Em Análise</SelectItem>
            <SelectItem value="resolved">Resolvido</SelectItem>
            <SelectItem value="closed">Fechado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por Severidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Severidades</SelectItem>
            <SelectItem value="low">Baixa</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="critical">Crítica</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {getFilteredIncidents().map((incident) => (
            <Card key={incident.id} className="cursor-pointer hover:bg-muted/50 transition" onClick={() => openIncidentDetail(incident)}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(incident.status)}
                      <h3 className="font-semibold">{incident.title}</h3>
                      <Badge variant={getSeverityColor(incident.severity) as "default" | "secondary" | "outline" | "destructive"}>
                        {incident.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {incident.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>#{incident.incident_number || incident.code}</span>
                      <span>{incident.location}</span>
                      {incident.created_at && (
                        <span>{formatDistanceToNow(new Date(incident.created_at), { addSuffix: true, locale: ptBR })}</span>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); exportToPDF(incident); }}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedIncident && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getStatusIcon(selectedIncident.status)}
                  {selectedIncident.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedIncident.incident_number || selectedIncident.code} • {selectedIncident.location}
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Detalhes</TabsTrigger>
                  <TabsTrigger value="followups">Acompanhamento ({followups.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Severidade</Label>
                      <div><Badge variant={getSeverityColor(selectedIncident.severity) as "default" | "secondary" | "outline" | "destructive"}>{selectedIncident.severity}</Badge></div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <div><Badge variant="outline">{selectedIncident.status}</Badge></div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Tipo</Label>
                      <p>{selectedIncident.type}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Local</Label>
                      <p>{selectedIncident.location}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Descrição</Label>
                    <p className="whitespace-pre-wrap">{selectedIncident.description}</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="followups" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tipo de Atualização</Label>
                      <Select value={newFollowup.followup_type} onValueChange={(v) => setNewFollowup({...newFollowup, followup_type: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="update">Atualização</SelectItem>
                          <SelectItem value="investigation">Investigação</SelectItem>
                          <SelectItem value="resolution">Resolução</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Textarea
                        value={newFollowup.description}
                        onChange={(e) => setNewFollowup({...newFollowup, description: e.target.value})}
                        placeholder="Descreva a atualização..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Novo Status (opcional)</Label>
                      <Select value={newFollowup.new_status} onValueChange={(v) => setNewFollowup({...newFollowup, new_status: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Manter status atual" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="under_analysis">Em Análise</SelectItem>
                          <SelectItem value="resolved">Resolvido</SelectItem>
                          <SelectItem value="closed">Fechado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={addFollowup} disabled={!newFollowup.description}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Adicionar Atualização
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {followups.map((followup) => (
                      <Card key={followup.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span className="font-medium">{followup.created_by_name}</span>
                                <Badge variant="outline">{followup.followup_type}</Badge>
                              </div>
                              <p className="text-sm">{followup.description}</p>
                              {followup.new_status !== followup.previous_status && (
                                <p className="text-xs text-muted-foreground">
                                  Status: {followup.previous_status} → {followup.new_status}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(followup.created_at), { addSuffix: true, locale: ptBR })}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
