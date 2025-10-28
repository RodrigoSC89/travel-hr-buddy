import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, FileText, Upload, Download, Clock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const IncidentReportsV2 = () => {
  const { toast } = useToast();
  const [incidents, setIncidents] = useState([
    {
      id: "1",
      title: "Falha no sistema DP",
      category: "Técnico",
      status: "em_analise",
      severity: "alta",
      created_at: "2025-01-15T10:30:00",
      attachments: 2,
    },
    {
      id: "2",
      title: "Não conformidade ambiental",
      category: "Compliance",
      status: "resolvido",
      severity: "media",
      created_at: "2025-01-10T14:20:00",
      attachments: 1,
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: "",
    description: "",
    category: "",
    severity: ""
  });

  const handleCreateIncident = () => {
    if (!newIncident.title || !newIncident.category || !newIncident.severity) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos necessários",
        variant: "destructive"
      });
      return;
    }

    const incident = {
      id: Date.now().toString(),
      ...newIncident,
      status: "aberto",
      created_at: new Date().toISOString(),
      attachments: 0
    };

    setIncidents([incident, ...incidents]);
    setShowForm(false);
    setNewIncident({ title: "", description: "", category: "", severity: "" });
    
    toast({
      title: "Incidente criado",
      description: "Incidente registrado com sucesso"
    });
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setIncidents(incidents.map(inc => 
      inc.id === id ? { ...inc, status: newStatus } : inc
    ));
    
    toast({
      title: "Status atualizado",
      description: `Incidente movido para: ${newStatus}`
    });
  };

  const generatePDF = (incident: any) => {
    toast({
      title: "Gerando relatório",
      description: "PDF será baixado em instantes"
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      aberto: "bg-amber-500",
      em_analise: "bg-blue-500",
      resolvido: "bg-green-500"
    };
    return colors[status] || "bg-muted";
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      alta: "bg-destructive",
      media: "bg-amber-500",
      baixa: "bg-green-500"
    };
    return colors[severity] || "bg-muted";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Incident Reports v2</h1>
            <p className="text-muted-foreground">Gerenciamento completo de incidentes</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <FileText className="mr-2 h-4 w-4" />
          Novo Incidente
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Abertos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidents.filter(i => i.status === "aberto").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidents.filter(i => i.status === "em_analise").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidents.filter(i => i.status === "resolvido").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Taxa de Resolução</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {incidents.length > 0 ? Math.round((incidents.filter(i => i.status === "resolvido").length / incidents.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulário de criação */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Incidente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input
                value={newIncident.title}
                onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                placeholder="Título do incidente"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={newIncident.description}
                onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                placeholder="Descreva o incidente em detalhes"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <Select value={newIncident.category} onValueChange={(v) => setNewIncident({ ...newIncident, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Técnico">Técnico</SelectItem>
                    <SelectItem value="Segurança">Segurança</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                    <SelectItem value="Operacional">Operacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Severidade</label>
                <Select value={newIncident.severity} onValueChange={(v) => setNewIncident({ ...newIncident, severity: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateIncident}>Criar Incidente</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de incidentes */}
      <div className="space-y-4">
        {incidents.map((incident) => (
          <Card key={incident.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{incident.title}</h3>
                    <Badge className={getStatusColor(incident.status)}>
                      {incident.status.replace("_", " ")}
                    </Badge>
                    <Badge className={getSeverityColor(incident.severity)}>
                      {incident.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(incident.created_at).toLocaleDateString("pt-BR")}
                    </span>
                    <span>{incident.category}</span>
                    <span className="flex items-center gap-1">
                      <Upload className="h-4 w-4" />
                      {incident.attachments} anexo(s)
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select 
                    value={incident.status} 
                    onValueChange={(v) => handleStatusChange(incident.id, v)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aberto">Aberto</SelectItem>
                      <SelectItem value="em_analise">Em Análise</SelectItem>
                      <SelectItem value="resolvido">Resolvido</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => generatePDF(incident)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IncidentReportsV2;
