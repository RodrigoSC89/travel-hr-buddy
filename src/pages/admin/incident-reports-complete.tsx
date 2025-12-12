import { useEffect, useState, useCallback } from "react";;
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

// Lazy load jsPDF
const loadJsPDF = async () => {
  const [{ default: jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable")
  ]);
  return { jsPDF, autoTable: autoTableModule.default };
});

interface IncidentReport {
  id: string;
  incident_number: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  status: "pending" | "under_analysis" | "resolved" | "closed";
  reported_by: string;
  assigned_to: string;
  incident_date: string;
  incident_location: string;
  impact_level: string;
  root_cause: string;
  immediate_actions: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

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
    
    // Real-time subscription
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
    });
  }, []);

  const loadIncidents = async () => {
    try {
      const { data, error } = await (supabase as unknown)
        .from("incident_reports")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setIncidents(data || []);
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
    try {
      const { data, error } = await (supabase as unknown)
        .from("incident_followups")
        .select("*")
        .eq("incident_id", incidentId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setFollowups(data || []);
    } catch (error) {
      logger.error("Error loading followups", { error });
    }
  };

  const createIncident = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const incidentNumber = `INC-${Date.now()}`;
      
      const { data, error } = await (supabase as unknown)
        .from("incident_reports")
        .insert({
          incident_number: incidentNumber,
          reported_by: user.id,
          ...newIncident
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
      
      // Auto-route to responsible team
      await autoRouteIncident(data);
      
    } catch (error) {
      logger.error("Error creating incident", { error });
      toast({
        title: "Erro",
        description: "Falha ao criar incidente",
        variant: "destructive"
      });
    }
  };

  const autoRouteIncident = async (incident: IncidentReport) => {
    // Auto-assign based on category
    const teamMapping: Record<string, string> = {
      safety: "safety",
      operational: "operations",
      environmental: "operations",
      equipment: "maintenance",
      personnel: "hr"
    };
    
    const assignedTeam = teamMapping[incident.category] || "operations";
    
    // Create workflow state
    try {
      await (supabase as unknown)
        .from("incident_workflow_states")
        .insert({
          incident_id: incident.id,
          workflow_stage: "reported",
          assigned_team: assignedTeam,
          escalation_level: incident.severity === "critical" ? 1 : 0,
          sla_deadline: new Date(Date.now() + (incident.severity === "critical" ? 4 : 24) * 60 * 60 * 1000).toISOString()
        });
    } catch (error) {
      logger.error("Error routing incident", { error });
    }
  };

  const addFollowup = async () => {
    if (!selectedIncident || !newFollowup.description) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await (supabase as unknown)
        .from("incident_followups")
        .insert({
          incident_id: selectedIncident.id,
          created_by: user.id,
          created_by_name: user.email?.split("@")[0] || "Unknown",
          previous_status: selectedIncident.status,
          ...newFollowup
        });
      
      if (error) throw error;
      
      // Update incident status if changed
      if (newFollowup.new_status && newFollowup.new_status !== selectedIncident.status) {
        await (supabase as unknown)
          .from("incident_reports")
          .update({ 
            status: newFollowup.new_status,
            updated_at: new Date().toISOString(),
            ...((newFollowup.new_status === "resolved" || newFollowup.new_status === "closed") && { resolved_at: new Date().toISOString() })
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
    
    // Title
    doc.setFontSize(20);
    doc.text("Relatório de Incidente", 20, 20);
    
    // Incident details
    doc.setFontSize(12);
    doc.text(`Número: ${incident.incident_number}`, 20, 35);
    doc.text(`Título: ${incident.title}`, 20, 45);
    doc.text(`Severidade: ${incident.severity.toUpperCase()}`, 20, 55);
    doc.text(`Categoria: ${incident.category}`, 20, 65);
    doc.text(`Status: ${incident.status}`, 20, 75);
    doc.text(`Local: ${incident.incident_location || "N/A"}`, 20, 85);
    doc.text(`Data: ${new Date(incident.incident_date).toLocaleString("pt-BR")}`, 20, 95);
    
    // Description
    doc.text("Descrição:", 20, 110);
    const splitDescription = doc.splitTextToSize(incident.description, 170);
    doc.text(splitDescription, 20, 120);
    
    // Add followups if available
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
    
    doc.save(`incident-${incident.incident_number}.pdf`);
    
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
  });

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
  });

  const activeIncidents = incidents.filter(i => ["pending", "under_analysis"].includes(i.status));
  const resolvedIncidents = incidents.filter(i => ["resolved", "closed"].includes(i.status));
  const criticalIncidents = incidents.filter(i => i.severity === "critical" && !["resolved", "closed"].includes(i.status));

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
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
                  onChange={handleChange})}
                  placeholder="Título breve do incidente"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={newIncident.description}
                  onChange={handleChange})}
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
                    onChange={handleChange})}
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
              <Button variant="outline" onClick={handleSetIsCreateDialogOpen}>
                Cancelar
              </Button>
              <Button onClick={createIncident}>
                Criar Incidente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <Label>Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="under_analysis">Em Análise</SelectItem>
                <SelectItem value="resolved">Resolvido</SelectItem>
                <SelectItem value="closed">Fechado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label>Severidade</Label>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Incidents List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Incidentes</CardTitle>
          <CardDescription>
            {getFilteredIncidents().length} incidentes encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {getFilteredIncidents().map((incident) => (
                <Card key={incident.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleopenIncidentDetail}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(incident.status)}
                          <span className="font-semibold">{incident.incident_number}</span>
                          <Badge variant={getSeverityColor(incident.severity)}>
                            {incident.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{incident.category}</Badge>
                        </div>
                        <h3 className="font-medium">{incident.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {incident.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>📍 {incident.incident_location || "Não especificado"}</span>
                          <span>🕐 {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true, locale: ptBR })}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge>{incident.status}</Badge>
                        <Button size="sm" variant="ghost" onClick={(e) => {
                          e.stopPropagation();
                          openIncidentDetail(incident);
                        }}>
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedIncident && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedIncident.incident_number} - {selectedIncident.title}
                  <Badge variant={getSeverityColor(selectedIncident.severity)}>
                    {selectedIncident.severity}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Criado em {new Date(selectedIncident.created_at).toLocaleString("pt-BR")}
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Detalhes</TabsTrigger>
                  <TabsTrigger value="followups">Acompanhamento ({followups.length})</TabsTrigger>
                  <TabsTrigger value="actions">Ações</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">Status</Label>
                      <p className="flex items-center gap-2 mt-1">
                        {getStatusIcon(selectedIncident.status)}
                        {selectedIncident.status}
                      </p>
                    </div>
                    <div>
                      <Label className="font-semibold">Categoria</Label>
                      <p className="mt-1">{selectedIncident.category}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Local</Label>
                      <p className="mt-1">{selectedIncident.incident_location || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Impacto</Label>
                      <p className="mt-1">{selectedIncident.impact_level || "N/A"}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold">Descrição</Label>
                    <p className="mt-1 text-sm">{selectedIncident.description}</p>
                  </div>
                  {selectedIncident.root_cause && (
                    <div>
                      <Label className="font-semibold">Causa Raiz</Label>
                      <p className="mt-1 text-sm">{selectedIncident.root_cause}</p>
                    </div>
                  )}
                  {selectedIncident.immediate_actions && (
                    <div>
                      <Label className="font-semibold">Ações Imediatas</Label>
                      <p className="mt-1 text-sm">{selectedIncident.immediate_actions}</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="followups" className="space-y-4">
                  <div className="space-y-4 mb-4">
                    {followups.map((followup) => (
                      <Card key={followup.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4" />
                                <span className="font-medium">{followup.created_by_name}</span>
                                <Badge variant="outline">{followup.followup_type}</Badge>
                                {followup.new_status && (
                                  <Badge>Status: {followup.new_status}</Badge>
                                )}
                              </div>
                              <p className="text-sm">{followup.description}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatDistanceToNow(new Date(followup.created_at), { addSuffix: true, locale: ptBR })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Adicionar Atualização</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Tipo</Label>
                        <Select value={newFollowup.followup_type} onValueChange={(value) => setNewFollowup({...newFollowup, followup_type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="update">Atualização</SelectItem>
                            <SelectItem value="investigation">Investigação</SelectItem>
                            <SelectItem value="resolution">Resolução</SelectItem>
                            <SelectItem value="comment">Comentário</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Descrição</Label>
                        <Textarea
                          value={newFollowup.description}
                          onChange={handleChange})}
                          placeholder="Descreva a atualização"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Alterar Status (opcional)</Label>
                        <Select value={newFollowup.new_status || "none"} onValueChange={(value) => setNewFollowup({...newFollowup, new_status: value === "none" ? "" : value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Manter status atual" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sem alteração</SelectItem>
                            <SelectItem value="under_analysis">Em Análise</SelectItem>
                            <SelectItem value="resolved">Resolvido</SelectItem>
                            <SelectItem value="closed">Fechado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={addFollowup} className="w-full">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Adicionar Atualização
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="actions" className="space-y-4">
                  <Button onClick={() => handleexportToPDF} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar para PDF
                  </Button>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Informações Adicionais</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p><strong>Criado:</strong> {new Date(selectedIncident.created_at).toLocaleString("pt-BR")}</p>
                        <p><strong>Atualizado:</strong> {new Date(selectedIncident.updated_at).toLocaleString("pt-BR")}</p>
                        {selectedIncident.resolved_at && (
                          <p><strong>Resolvido:</strong> {new Date(selectedIncident.resolved_at).toLocaleString("pt-BR")}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
