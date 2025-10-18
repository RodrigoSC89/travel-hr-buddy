import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetricasPanel } from "@/components/sgso/MetricasPanel";
import { SGSOTrendChart } from "@/components/sgso/SGSOTrendChart";
import { Shield, BarChart3, FileCheck, Mail, AlertTriangle, Plus, Filter, Download, Sparkles } from "lucide-react";
import { format } from "date-fns";

type Incident = {
  id: string;
  incident_number: string;
  type: string;
  description: string;
  severity: string;
  status: string;
  reported_at: string;
  location?: string;
  vessel?: string;
  vessel_id?: string;
};

const AdminSGSO = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  async function fetchIncidents() {
    setLoading(true);
    try {
      const res = await fetch("/api/sgso/incidents");
      const data = await res.json();
      setIncidents(data);
    } catch (error) {
      console.error("Error fetching incidents:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Filter incidents
  const filteredIncidents = incidents.filter((incident) => {
    if (filterType !== "all" && incident.type !== filterType) return false;
    if (filterSeverity !== "all" && incident.severity !== filterSeverity) return false;
    if (filterStatus !== "all" && incident.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Painel Administrativo SGSO
          </h1>
          <p className="text-muted-foreground mt-2">
            Sistema de Gestão de Segurança Operacional - Métricas e Compliance
          </p>
        </div>
        <Badge variant="default" className="text-sm">
          <FileCheck className="mr-2 h-4 w-4" />
          Compliance ANP 43/2007
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Métricas Operacionais
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <FileCheck className="mr-2 h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="incidents">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Incidentes
          </TabsTrigger>
          <TabsTrigger value="reports">
            <Mail className="mr-2 h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <MetricasPanel />
          <SGSOTrendChart />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status de Compliance</CardTitle>
              <CardDescription>
                Monitoramento das 17 práticas obrigatórias ANP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold mb-2">17 Práticas ANP</h3>
                  <p className="text-sm text-muted-foreground">
                    Sistema configurado para monitorar compliance com a Resolução ANP 43/2007.
                    As métricas de auditoria refletem o cumprimento das práticas obrigatórias.
                  </p>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold mb-2">Auditorias IMCA</h3>
                  <p className="text-sm text-muted-foreground">
                    Auditorias são classificadas por nível de risco (Crítico, Alto, Médio, Baixo, Negligenciável)
                    e rastreadas por embarcação para análise detalhada.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gestão de Incidentes SGSO</CardTitle>
                  <CardDescription>
                    Visualizar, adicionar e gerenciar incidentes de segurança operacional
                  </CardDescription>
                </div>
                <Dialog open={formOpen} onOpenChange={setFormOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default">
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Incidente
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Registrar Novo Incidente</DialogTitle>
                    </DialogHeader>
                    <SGSOIncidentForm 
                      onSave={() => {
                        fetchIncidents();
                        setFormOpen(false);
                      }} 
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="mb-4 flex gap-3 items-center flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filtros:</span>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="accident">Acidente</SelectItem>
                    <SelectItem value="near_miss">Quase Acidente</SelectItem>
                    <SelectItem value="environmental">Ambiental</SelectItem>
                    <SelectItem value="security">Segurança</SelectItem>
                    <SelectItem value="operational">Operacional</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Severidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas severidades</SelectItem>
                    <SelectItem value="critical">Crítico</SelectItem>
                    <SelectItem value="high">Alto</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="low">Baixo</SelectItem>
                    <SelectItem value="negligible">Negligenciável</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos status</SelectItem>
                    <SelectItem value="reported">Reportado</SelectItem>
                    <SelectItem value="investigating">Investigando</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                  </SelectContent>
                </Select>
                <div className="ml-auto flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analisar com IA
                    <Badge variant="secondary" className="ml-2">Em Breve</Badge>
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                    <Badge variant="secondary" className="ml-2">Em Breve</Badge>
                  </Button>
                </div>
              </div>

              {/* Incident List */}
              {loading ? (
                <p className="text-muted-foreground text-center py-8">Carregando incidentes...</p>
              ) : filteredIncidents.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum incidente encontrado</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredIncidents.map((incident) => (
                    <Card key={incident.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">
                                {incident.incident_number}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {incident.type === "accident" && "Acidente"}
                                {incident.type === "near_miss" && "Quase Acidente"}
                                {incident.type === "environmental" && "Ambiental"}
                                {incident.type === "security" && "Segurança"}
                                {incident.type === "operational" && "Operacional"}
                                {incident.type === "other" && "Outro"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {incident.description}
                            </p>
                            {incident.location && (
                              <p className="text-xs text-muted-foreground">
                                📍 Local: {incident.location}
                              </p>
                            )}
                            {incident.vessel && (
                              <p className="text-xs text-muted-foreground">
                                🚢 Embarcação: {incident.vessel}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <span className="text-sm text-muted-foreground block mb-2">
                              {format(new Date(incident.reported_at), "dd/MM/yyyy")}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex gap-3">
                            <span 
                              className={`font-medium ${
                                incident.severity === "critical" ? "text-red-600" :
                                  incident.severity === "high" ? "text-orange-600" :
                                    incident.severity === "medium" ? "text-yellow-600" :
                                      "text-green-600"
                              }`}
                            >
                              🛑 {incident.severity === "critical" && "Crítico"}
                              {incident.severity === "high" && "Alto"}
                              {incident.severity === "medium" && "Médio"}
                              {incident.severity === "low" && "Baixo"}
                              {incident.severity === "negligible" && "Negligenciável"}
                            </span>
                            <span className="text-muted-foreground">
                              Status: {incident.status === "reported" && "Reportado"}
                              {incident.status === "investigating" && "Investigando"}
                              {incident.status === "resolved" && "Resolvido"}
                              {incident.status === "closed" && "Fechado"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Automatizados</CardTitle>
              <CardDescription>
                Configuração de exportação e envio automático de relatórios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Exportação CSV</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Disponível na aba &quot;Métricas Operacionais&quot; - Permite exportar dados
                    de métricas por embarcação em formato CSV para análise externa.
                  </p>
                </div>

                <div className="rounded-lg border p-4 opacity-60">
                  <div className="flex items-center gap-3 mb-2">
                    <FileCheck className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Exportação PDF</h3>
                    <Badge variant="outline">Em Breve</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Exportação de relatórios completos em PDF com gráficos e tabelas usando jsPDF.
                  </p>
                </div>

                <div className="rounded-lg border p-4 opacity-60">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Envio Automático por Email</h3>
                    <Badge variant="outline">Em Breve</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Configuração de cron jobs para envio automático de relatórios mensais
                    via email para stakeholders.
                  </p>
                </div>

                <div className="rounded-lg border p-4 opacity-60">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Integração BI</h3>
                    <Badge variant="outline">Planejado</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Integração com ferramentas de BI externas (Power BI, Tableau) para
                    análises avançadas e dashboards executivos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

function SGSOIncidentForm({ onSave }: { onSave: () => void }) {
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    severity: "",
    reported_at: new Date().toISOString().slice(0, 10),
    location: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/sgso/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        onSave();
        // Reset form
        setFormData({
          type: "",
          description: "",
          severity: "",
          reported_at: new Date().toISOString().slice(0, 10),
          location: "",
        });
      } else {
        console.error("Error creating incident");
      }
    } catch (error) {
      console.error("Error creating incident:", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Tipo de Incidente *</label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="accident">Acidente</SelectItem>
            <SelectItem value="near_miss">Quase Acidente</SelectItem>
            <SelectItem value="environmental">Ambiental</SelectItem>
            <SelectItem value="security">Segurança</SelectItem>
            <SelectItem value="operational">Operacional</SelectItem>
            <SelectItem value="other">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Descrição *</label>
        <Textarea
          placeholder="Descreva o incidente de forma detalhada"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
          rows={4}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Severidade *</label>
        <Select
          value={formData.severity}
          onValueChange={(value) => setFormData({ ...formData, severity: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a severidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="critical">Crítico</SelectItem>
            <SelectItem value="high">Alto</SelectItem>
            <SelectItem value="medium">Médio</SelectItem>
            <SelectItem value="low">Baixo</SelectItem>
            <SelectItem value="negligible">Negligenciável</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Data do Incidente *</label>
        <Input
          type="date"
          value={formData.reported_at}
          onChange={(e) =>
            setFormData({ ...formData, reported_at: e.target.value })
          }
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Local</label>
        <Input
          placeholder="Ex: Sala de Máquinas, Convés Principal, etc."
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Salvando..." : "Salvar Incidente"}
      </Button>
    </form>
  );
}

export default AdminSGSO;
